import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { getBatchItems } from "../../utils/storage";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TopProductsChartProps {
  type?: "quantity" | "movement";
  limit?: number;
}

export function TopProductsChart({ type = "quantity", limit = 10 }: TopProductsChartProps) {
  const chartData = useMemo(() => {
    const items = getBatchItems();

    // Agrupar por SKU
    const grouped = items.reduce((acc, item) => {
      const existing = acc.find((p) => p.sku === item.sku);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({
          sku: item.sku,
          name: item.productName,
          quantity: item.quantity,
          unit: item.unit,
        });
      }
      return acc;
    }, [] as Array<{ sku: string; name: string; quantity: number; unit: string }>);

    // Ordenar por quantidade (maior para menor)
    const sorted = grouped.sort((a, b) => b.quantity - a.quantity);

    // Pegar top N
    const topN = sorted.slice(0, limit);

    return topN.map((item, index) => ({
      id: `prod-${index}-${item.sku}`,
      name: item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name,
      fullName: item.name,
      quantidade: item.quantity,
      unit: item.unit,
      sku: item.sku,
    }));
  }, [limit, type]);

  const getBarColor = (index: number) => {
    if (index === 0) return "#10b981"; // Verde para #1
    if (index === 1) return "#3b82f6"; // Azul para #2
    if (index === 2) return "#f59e0b"; // Amarelo para #3
    return "#94a3b8"; // Cinza para os demais
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">{data.fullName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estoque: <strong>{data.quantidade} {data.unit}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top {limit} Produtos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Maiores estoques</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          Nenhum dado disponível
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top {limit} Produtos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Maiores estoques</p>
          </div>
        </div>

        {/* Legenda de medalhas */}
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">1º</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">2º</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">3º</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-zinc-700" />
          <XAxis
            dataKey="id"
            tickFormatter={(value) => {
              const item = chartData.find(d => d.id === value);
              return item ? item.name : '';
            }}
            className="text-xs text-gray-600 dark:text-gray-400"
            stroke="currentColor"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            stroke="currentColor"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar key="bar-quantidade" dataKey="quantidade" name="Quantidade" radius={[8, 8, 0, 0]} isAnimationActive={false}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${entry.id}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Ranking */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {chartData.slice(0, 3).map((item, index) => (
          <div
            key={item.sku}
            className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg text-center"
          >
            <div className="text-2xl mb-1">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={item.fullName}>
              {item.name}
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
              {item.quantidade} {item.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}