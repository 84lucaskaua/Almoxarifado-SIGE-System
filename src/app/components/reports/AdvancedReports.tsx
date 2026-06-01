import { useState, useEffect, useMemo } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  FileText,
  TrendingDown,
  TrendingUp,
  Package,
  AlertCircle,
  Download,
  Calendar,
  DollarSign,
} from "lucide-react";
import { getBatchItems, getMovements } from "../../utils/storage";
import { getLosses, type Loss } from "../../utils/storageExtended";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type ReportPeriod = "7days" | "30days" | "90days" | "12months" | "all";
type ABCClass = "A" | "B" | "C";

interface ProductAnalysis {
  sku: string;
  name: string;
  totalMovement: number;
  totalValue: number;
  percentage: number;
  cumulativePercentage: number;
  abcClass: ABCClass;
}

const COLORS = {
  A: "#10b981",
  B: "#f59e0b",
  C: "#ef4444",
};

export function AdvancedReports() {
  const [period, setPeriod] = useState<ReportPeriod>("30days");
  const [activeTab, setActiveTab] = useState<"losses" | "abc">("losses");

  // Calcular data inicial baseada no período
  const getStartDate = (period: ReportPeriod): Date => {
    const now = new Date();
    switch (period) {
      case "7days":
        return new Date(now.setDate(now.getDate() - 7));
      case "30days":
        return new Date(now.setDate(now.getDate() - 30));
      case "90days":
        return new Date(now.setDate(now.getDate() - 90));
      case "12months":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(0);
    }
  };

  // RELATÓRIO DE PERDAS
  const lossesReport = useMemo(() => {
    const losses = getLosses();
    const startDate = getStartDate(period);

    const filtered = losses.filter(
      (loss) => new Date(loss.createdAt) >= startDate
    );

    // Agrupar por motivo
    const byReason = filtered.reduce((acc, loss) => {
      const existing = acc.find((item) => item.reason === loss.reason);
      if (existing) {
        existing.quantity += loss.quantity;
        existing.count += 1;
      } else {
        acc.push({
          reason: loss.reason,
          quantity: loss.quantity,
          count: 1,
        });
      }
      return acc;
    }, [] as Array<{ reason: string; quantity: number; count: number }>);

    const totalQuantity = filtered.reduce((sum, loss) => sum + loss.quantity, 0);

    return {
      total: filtered.length,
      totalQuantity,
      byReason,
      details: filtered,
    };
  }, [period]);

  // ANÁLISE ABC
  const abcAnalysis = useMemo(() => {
    const movements = getMovements();
    const items = getBatchItems();

    // Calcular movimento total por produto (considerando valor unitário fictício)
    const productMovements = items.map((item) => {
      const itemMovements = movements.filter((m) => m.batchItemId === item.id);
      const totalMovement = itemMovements.reduce((sum, m) => sum + m.quantity, 0);

      // Valor fictício: assumindo R$ 10 por unidade (em produção viria do cadastro)
      const unitValue = 10;
      const totalValue = totalMovement * unitValue;

      return {
        sku: item.sku,
        name: item.productName,
        totalMovement,
        totalValue,
      };
    });

    // Ordenar por valor total
    const sorted = productMovements.sort((a, b) => b.totalValue - a.totalValue);

    // Calcular total
    const totalValue = sorted.reduce((sum, item) => sum + item.totalValue, 0);

    // Calcular porcentagens e classificação ABC
    let cumulativePercentage = 0;
    const withClassification: ProductAnalysis[] = sorted.map((item) => {
      const percentage = totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0;
      cumulativePercentage += percentage;

      let abcClass: ABCClass = "C";
      if (cumulativePercentage <= 80) {
        abcClass = "A";
      } else if (cumulativePercentage <= 95) {
        abcClass = "B";
      }

      return {
        ...item,
        percentage,
        cumulativePercentage,
        abcClass,
      };
    });

    // Contar por classe
    const classCount = {
      A: withClassification.filter((p) => p.abcClass === "A").length,
      B: withClassification.filter((p) => p.abcClass === "B").length,
      C: withClassification.filter((p) => p.abcClass === "C").length,
    };

    return {
      products: withClassification,
      classCount,
      totalProducts: withClassification.length,
    };
  }, []);

  const getLossReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      expiry: "Vencimento",
      damage: "Quebra/Avaria",
      theft: "Furto",
      other: "Outro",
    };
    return labels[reason] || reason;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios Avançados</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Análises detalhadas de perdas e classificação ABC
          </p>
        </div>

        <div className="flex gap-3">
          <Select value={period} onValueChange={(value: ReportPeriod) => setPeriod(value)}>
            <SelectTrigger className="w-48 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
              <Calendar size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-300 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab("losses")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "losses"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <TrendingDown size={16} className="inline mr-2" />
          Relatório de Perdas
        </button>
        <button
          onClick={() => setActiveTab("abc")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "abc"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Package size={16} className="inline mr-2" />
          Análise ABC
        </button>
      </div>

      {/* RELATÓRIO DE PERDAS */}
      {activeTab === "losses" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total de Perdas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lossesReport.total}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Package size={24} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unidades Perdidas</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lossesReport.totalQuantity}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tipos de Perda</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {lossesReport.byReason.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráfico de Perdas por Motivo */}
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Perdas por Motivo
            </h3>
            {lossesReport.byReason.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={lossesReport.byReason}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-zinc-700" />
                  <XAxis
                    dataKey="reason"
                    tickFormatter={getLossReasonLabel}
                    className="text-xs text-gray-600 dark:text-gray-400"
                    stroke="currentColor"
                  />
                  <YAxis className="text-xs text-gray-600 dark:text-gray-400" stroke="currentColor" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">
                              {getLossReasonLabel(data.reason)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantidade: <strong>{data.quantity}</strong>
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Ocorrências: <strong>{data.count}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar key="losses-bar" dataKey="quantity" fill="#ef4444" name="Quantidade" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Nenhuma perda registrada no período
              </div>
            )}
          </Card>

          {/* Detalhes das Perdas */}
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Detalhamento de Perdas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Data
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Produto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Motivo
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Quantidade
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Responsável
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lossesReport.details.slice(0, 20).map((loss) => (
                    <tr key={loss.id} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {new Date(loss.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {loss.productName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                          {getLossReasonLabel(loss.reason)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                        {loss.quantity} {loss.unit}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {loss.userName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lossesReport.details.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhuma perda registrada no período
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ANÁLISE ABC */}
      {activeTab === "abc" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Package size={24} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Produtos</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {abcAnalysis.totalProducts}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-green-500 dark:border-green-700 border-l-4 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Classe A (80%)</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {abcAnalysis.classCount.A}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-yellow-500 dark:border-yellow-700 border-l-4 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Package size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Classe B (15%)</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {abcAnalysis.classCount.B}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-red-500 dark:border-red-700 border-l-4 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Classe C (5%)</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {abcAnalysis.classCount.C}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Gráfico de Pizza - Distribuição ABC */}
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Distribuição por Classe ABC
            </h3>
            {abcAnalysis.totalProducts > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    key="abc-pie"
                    data={[
                      { name: "Classe A", value: abcAnalysis.classCount.A, color: COLORS.A },
                      { name: "Classe B", value: abcAnalysis.classCount.B, color: COLORS.B },
                      { name: "Classe C", value: abcAnalysis.classCount.C, color: COLORS.C },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: "Classe A", value: abcAnalysis.classCount.A, color: COLORS.A },
                      { name: "Classe B", value: abcAnalysis.classCount.B, color: COLORS.B },
                      { name: "Classe C", value: abcAnalysis.classCount.C, color: COLORS.C },
                    ].map((entry, index) => (
                      <Cell key={`abc-cell-${index}-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                Nenhum dado disponível
              </div>
            )}
          </Card>

          {/* Tabela de Produtos */}
          <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Classificação ABC de Produtos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-zinc-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Classe
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Produto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      SKU
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Movimento Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      % do Total
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      % Acumulado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {abcAnalysis.products.slice(0, 50).map((product) => (
                    <tr key={product.sku} className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800">
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded font-bold text-white`}
                          style={{ backgroundColor: COLORS[product.abcClass] }}
                        >
                          {product.abcClass}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {product.sku}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white font-semibold">
                        {product.totalMovement}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {product.percentage.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {product.cumulativePercentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {abcAnalysis.products.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhum produto disponível para análise
                </div>
              )}
            </div>
          </Card>

          {/* Explicação ABC */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 p-6">
            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
              Sobre a Análise ABC
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <p>
                <strong>Classe A (80%):</strong> Produtos mais importantes, representam 80% do valor total de movimentação.
                Merecem atenção especial no controle de estoque.
              </p>
              <p>
                <strong>Classe B (15%):</strong> Produtos de importância intermediária, representam 15% do valor total.
                Controle moderado.
              </p>
              <p>
                <strong>Classe C (5%):</strong> Produtos de menor importância, representam apenas 5% do valor total.
                Controle simplificado.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}