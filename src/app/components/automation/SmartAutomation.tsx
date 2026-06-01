import { useState, useEffect, useMemo } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  Clock,
  BarChart,
  Lightbulb,
} from "lucide-react";
import { getBatchItems, getMovements, type BatchItem } from "../../utils/storage";
import { createNotification } from "../../utils/storageExtended";
import { toast } from "sonner";

interface PurchaseSuggestion {
  sku: string;
  productName: string;
  currentStock: number;
  minStock: number;
  suggestedQuantity: number;
  priority: "high" | "medium" | "low";
  reason: string;
  daysUntilRupture: number;
}

interface TrendAnalysis {
  sku: string;
  productName: string;
  avgDailyConsumption: number;
  trend: "increasing" | "stable" | "decreasing";
  trendPercentage: number;
}

export function SmartAutomation() {
  const [suggestions, setSuggestions] = useState<PurchaseSuggestion[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [autoAlertsEnabled, setAutoAlertsEnabled] = useState(true);

  useEffect(() => {
    generateSuggestions();
    analyzeTrends();
  }, []);

  // Gerar sugestões de compra
  const generateSuggestions = () => {
    const items = getBatchItems();
    const movements = getMovements();
    const now = new Date();

    // Agrupar por SKU
    const productMap = new Map<string, { items: BatchItem[]; totalStock: number }>();

    items.forEach((item) => {
      if (!productMap.has(item.sku)) {
        productMap.set(item.sku, { items: [], totalStock: 0 });
      }
      const data = productMap.get(item.sku)!;
      data.items.push(item);
      data.totalStock += item.quantity;
    });

    const newSuggestions: PurchaseSuggestion[] = [];

    productMap.forEach((data, sku) => {
      const firstItem = data.items[0];
      const minStock = firstItem.minStock || 0;
      const currentStock = data.totalStock;

      // Calcular consumo médio diário (últimos 30 dias)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentExits = movements.filter(
        (m) =>
          m.type === "saida" &&
          new Date(m.date) >= thirtyDaysAgo &&
          data.items.some((i) => i.id === m.batchItemId)
      );

      const totalConsumed = recentExits.reduce((sum, m) => sum + m.quantity, 0);
      const avgDailyConsumption = totalConsumed / 30;

      // Dias até ruptura
      const daysUntilRupture =
        avgDailyConsumption > 0 ? Math.floor(currentStock / avgDailyConsumption) : 999;

      // Determinar prioridade e criar sugestão
      if (currentStock <= minStock || daysUntilRupture <= 7) {
        const suggestedQuantity = Math.max(
          minStock * 2 - currentStock,
          Math.ceil(avgDailyConsumption * 30)
        );

        let priority: "high" | "medium" | "low" = "low";
        let reason = "";

        if (daysUntilRupture <= 3) {
          priority = "high";
          reason = `Ruptura crítica em ${daysUntilRupture} dia(s)`;
        } else if (daysUntilRupture <= 7) {
          priority = "medium";
          reason = `Ruptura prevista em ${daysUntilRupture} dia(s)`;
        } else if (currentStock <= minStock) {
          priority = "high";
          reason = "Estoque abaixo do mínimo";
        }

        newSuggestions.push({
          sku,
          productName: firstItem.productName,
          currentStock,
          minStock,
          suggestedQuantity,
          priority,
          reason,
          daysUntilRupture,
        });
      }
    });

    // Ordenar por prioridade
    newSuggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setSuggestions(newSuggestions);

    // Gerar notificações automáticas se habilitado
    if (autoAlertsEnabled) {
      newSuggestions
        .filter((s) => s.priority === "high")
        .slice(0, 5)
        .forEach((suggestion) => {
          createNotification({
            type: "stock",
            title: "Sugestão de Compra Urgente",
            message: `${suggestion.productName}: ${suggestion.reason}. Quantidade sugerida: ${suggestion.suggestedQuantity}`,
            severity: "critical",
            read: false,
          });
        });
    }
  };

  // Analisar tendências
  const analyzeTrends = () => {
    const items = getBatchItems();
    const movements = getMovements();
    const now = new Date();

    const productMap = new Map<string, { name: string; exits: number[] }>();

    // Agrupar saídas por produto nos últimos 60 dias
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    movements
      .filter((m) => m.type === "saida" && new Date(m.date) >= sixtyDaysAgo)
      .forEach((m) => {
        const item = items.find((i) => i.id === m.batchItemId);
        if (!item) return;

        if (!productMap.has(item.sku)) {
          productMap.set(item.sku, { name: item.productName, exits: [0, 0] });
        }

        const data = productMap.get(item.sku)!;
        const movementDate = new Date(m.date);

        // Período 1: 60-30 dias atrás
        if (movementDate < thirtyDaysAgo) {
          data.exits[0] += m.quantity;
        }
        // Período 2: últimos 30 dias
        else {
          data.exits[1] += m.quantity;
        }
      });

    const newTrends: TrendAnalysis[] = [];

    productMap.forEach((data, sku) => {
      const [oldPeriod, newPeriod] = data.exits;
      const avgDailyConsumption = newPeriod / 30;

      let trend: "increasing" | "stable" | "decreasing" = "stable";
      let trendPercentage = 0;

      if (oldPeriod > 0) {
        trendPercentage = ((newPeriod - oldPeriod) / oldPeriod) * 100;

        if (trendPercentage > 10) trend = "increasing";
        else if (trendPercentage < -10) trend = "decreasing";
      }

      if (newPeriod > 0) {
        newTrends.push({
          sku,
          productName: data.name,
          avgDailyConsumption,
          trend,
          trendPercentage,
        });
      }
    });

    // Ordenar por consumo
    newTrends.sort((a, b) => b.avgDailyConsumption - a.avgDailyConsumption);
    setTrends(newTrends.slice(0, 10));
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      medium: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      low: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    };
    return colors[priority as keyof typeof colors];
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "increasing")
      return <TrendingUp size={16} className="text-green-600 dark:text-green-400" />;
    if (trend === "decreasing")
      return <TrendingUp size={16} className="text-red-600 dark:text-red-400 rotate-180" />;
    return <BarChart size={16} className="text-gray-600 dark:text-gray-400" />;
  };

  const highPrioritySuggestions = suggestions.filter((s) => s.priority === "high").length;
  const mediumPrioritySuggestions = suggestions.filter((s) => s.priority === "medium").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Automação Inteligente</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Sugestões automáticas e análise preditiva de estoque
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant={autoAlertsEnabled ? "default" : "outline"}
            onClick={() => {
              setAutoAlertsEnabled(!autoAlertsEnabled);
              toast.success(
                autoAlertsEnabled ? "Alertas automáticos desativados" : "Alertas automáticos ativados"
              );
            }}
            className="gap-2"
          >
            <Zap size={16} />
            {autoAlertsEnabled ? "Alertas Ativos" : "Alertas Inativos"}
          </Button>
          <Button
            onClick={() => {
              generateSuggestions();
              analyzeTrends();
              toast.success("Análise atualizada!");
            }}
            variant="outline"
            className="gap-2"
          >
            Atualizar Análise
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Lightbulb size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sugestões</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-red-500 dark:border-red-700 border-l-4 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alta Prioridade</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {highPrioritySuggestions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-yellow-500 dark:border-yellow-700 border-l-4 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Média Prioridade</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {mediumPrioritySuggestions}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tendências</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trends.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sugestões de Compra */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart size={24} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Sugestões de Compra Inteligentes
          </h3>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-500" />
            <p className="font-semibold">Tudo sob controle!</p>
            <p className="text-sm mt-1">Nenhuma sugestão de compra no momento</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.sku}
                className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {suggestion.productName}
                      </h4>
                      <Badge className={getPriorityColor(suggestion.priority)}>
                        {suggestion.priority === "high"
                          ? "URGENTE"
                          : suggestion.priority === "medium"
                          ? "MÉDIO"
                          : "BAIXO"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-2">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">SKU</p>
                        <p className="text-gray-900 dark:text-white font-mono">{suggestion.sku}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Estoque Atual</p>
                        <p className="text-gray-900 dark:text-white font-bold">
                          {suggestion.currentStock}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Mínimo</p>
                        <p className="text-gray-900 dark:text-white">{suggestion.minStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Qtd. Sugerida</p>
                        <p className="text-green-600 dark:text-green-400 font-bold">
                          {suggestion.suggestedQuantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Dias até Ruptura</p>
                        <p className="text-red-600 dark:text-red-400 font-bold">
                          {suggestion.daysUntilRupture} dias
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle size={14} className="text-orange-600 dark:text-orange-400" />
                      <span className="text-orange-600 dark:text-orange-400 font-medium">
                        {suggestion.reason}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Análise de Tendências */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Análise de Tendências (Top 10)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-zinc-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Produto
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  SKU
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Consumo Médio/Dia
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tendência
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Variação
                </th>
              </tr>
            </thead>
            <tbody>
              {trends.map((trend) => (
                <tr
                  key={trend.sku}
                  className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {trend.productName}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {trend.sku}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                    {trend.avgDailyConsumption.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                        {trend.trend === "increasing"
                          ? "Crescente"
                          : trend.trend === "decreasing"
                          ? "Decrescente"
                          : "Estável"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span
                      className={`font-semibold ${
                        trend.trendPercentage > 0
                          ? "text-green-600 dark:text-green-400"
                          : trend.trendPercentage < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {trend.trendPercentage > 0 ? "+" : ""}
                      {trend.trendPercentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {trends.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Dados insuficientes para análise de tendências
            </div>
          )}
        </div>
      </Card>

      {/* Dicas de Otimização */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-900 p-6">
        <div className="flex items-start gap-4">
          <Lightbulb size={32} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              💡 Dicas de Otimização
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  Produtos com tendência crescente merecem pedidos maiores para evitar rupturas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  Sugestões de alta prioridade indicam risco iminente de ruptura ({"<"}3 dias)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  O sistema calcula automaticamente a quantidade ideal baseada em consumo histórico
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span>
                  Alertas automáticos enviam notificações para produtos críticos em tempo real
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
