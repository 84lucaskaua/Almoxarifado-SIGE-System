import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Package, PackagePlus, AlertTriangle, TrendingDown, Database, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  getBatches,
  getTotalItems,
  getExpiringItemsCount,
  getLowStockCount,
  getMovements,
  getLowStockItems,
  getStockStatus,
  BatchItem,
  getBatchById,
  getLowStockAlertCount,
} from "../utils/storage";
import { seedDatabaseWithSampleData, clearSampleData } from "../utils/seedData";
import { toast } from "sonner";
import { StockEvolutionChart } from "./charts/StockEvolutionChart";
import { CategoryPieChart } from "./charts/CategoryPieChart";
import { TopProductsChart } from "./charts/TopProductsChart";

interface DashboardProps {
  onNavigate?: (menu: string, filter?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalItems: 0,
    expiringItems: 0,
    lowStockItems: 0,
  });
  const [lowStockAlerts, setLowStockAlerts] = useState<BatchItem[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  // Recarregar estatísticas quando o componente é exibido novamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadStats();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadStats);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadStats);
    };
  }, []);

  const loadStats = () => {
    const batches = getBatches();
    const lowStockItems = getLowStockItems();
    setStats({
      totalBatches: batches.length,
      totalItems: getTotalItems(),
      expiringItems: getExpiringItemsCount(30),
      lowStockItems: getLowStockAlertCount(),
    });
    setLowStockAlerts(lowStockItems);
  };

  const cards = [
    {
      title: "Total de Lotes",
      value: stats.totalBatches,
      icon: <PackagePlus className="text-blue-500" size={32} />,
      bg: "bg-blue-900/20",
      border: "border-blue-700",
      onClick: () => onNavigate?.("lotes", "todos"),
      description: "Clique para ver todos os lotes",
    },
    {
      title: "Total de Itens",
      value: stats.totalItems,
      icon: <Package className="text-cyan-500" size={32} />,
      bg: "bg-cyan-900/20",
      border: "border-cyan-700",
      onClick: () => onNavigate?.("produtos"),
      description: "Clique para ver todos os produtos",
    },
    {
      title: "Vencendo em 30 dias",
      value: stats.expiringItems,
      icon: <AlertTriangle className="text-amber-500" size={32} />,
      bg: "bg-amber-900/20",
      border: "border-amber-700",
      onClick: () => onNavigate?.("lotes", "vencendo"),
      description: "Clique para ver produtos vencendo",
    },
    {
      title: "Estoque Baixo",
      value: stats.lowStockItems,
      icon: <TrendingDown className="text-red-500" size={32} />,
      bg: "bg-red-900/20",
      border: "border-red-700",
      onClick: () => onNavigate?.("lotes", "estoque-baixo"),
      description: "Clique para ver estoque baixo",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Visão geral do estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            className={`${card.bg} ${card.border} border-2 bg-white/50 dark:bg-zinc-900/50 p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200`}
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
              <div>{card.icon}</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">{card.description}</p>
          </Card>
        ))}
      </div>

      {/* Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockEvolutionChart days={30} />
        <CategoryPieChart />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TopProductsChart limit={10} />
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockAlerts.length > 0 && (
        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6 border-l-4 border-l-red-600">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="text-red-500 mt-1" size={24} />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Alertas de Estoque Baixo</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {lowStockAlerts.length} {lowStockAlerts.length === 1 ? 'produto requer' : 'produtos requerem'} atenção
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {lowStockAlerts.map((item) => {
              const status = getStockStatus(item);
              const batch = getBatchById(item.batchId);
              return (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                  onClick={() => onNavigate?.("lotes", "estoque-baixo")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-900 dark:text-white font-semibold">{item.productName}</h3>
                        {status === "critico" ? (
                          <Badge className="bg-red-600 hover:bg-red-700">Crítico</Badge>
                        ) : (
                          <Badge className="bg-amber-600 hover:bg-amber-700">Baixo</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">SKU</p>
                          <p className="text-gray-900 dark:text-white font-mono">{item.sku}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Lote</p>
                          <p className="text-gray-900 dark:text-white">{batch?.batchNumber || "-"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Qtd. Atual</p>
                          <p className="text-gray-900 dark:text-white font-bold">{item.quantity} {item.unit}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Estoque Mínimo</p>
                          <p className="text-gray-900 dark:text-white">{item.minStock || 0} {item.unit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ferramentas de Teste</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Ferramentas para popularizar e limpar a base de dados de teste.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
              Popularizar Base de Dados
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Adiciona dados de exemplo para testar o sistema.
            </p>
            <Button
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => {
                seedDatabaseWithSampleData();
                toast.success("Base de dados populada com sucesso!");
                loadStats();
              }}
            >
              Popularizar
            </Button>
          </div>
          <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h3 className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
              Limpar Base de Dados
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Remove todos os dados de exemplo da base de dados.
            </p>
            <Button
              className="mt-2 bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                clearSampleData();
                toast.success("Base de dados limpa com sucesso!");
                loadStats();
              }}
            >
              Limpar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}