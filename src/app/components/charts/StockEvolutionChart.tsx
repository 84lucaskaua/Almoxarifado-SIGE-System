import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getMovements, getBatchItems } from "../../utils/storage";
import { TrendingUp } from "lucide-react";

interface StockEvolutionChartProps {
  days?: number;
}

export function StockEvolutionChart({ days = 30 }: StockEvolutionChartProps) {
  const chartData = useMemo(() => {
    const movements = getMovements();
    const items = getBatchItems();

    // Obter datas dos últimos N dias
    const dates: Date[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date);
    }

    // Calcular estoque para cada dia
    const data = dates.map((date, index) => {
      // Movimentos até esse dia
      const movementsUntilDate = movements.filter(
        (m) => new Date(m.date).getTime() <= date.getTime()
      );

      // Calcular entradas e saídas acumuladas
      const totalEntradas = movementsUntilDate
        .filter((m) => m.type === "entrada")
        .reduce((sum, m) => sum + m.quantity, 0);

      const totalSaidas = movementsUntilDate
        .filter((m) => m.type === "saida")
        .reduce((sum, m) => sum + m.quantity, 0);

      const stockTotal = totalEntradas - totalSaidas;

      return {
        id: `day-${index}-${date.getTime()}`,
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        estoque: Math.max(0, stockTotal),
        entradas: movementsUntilDate
          .filter((m) => m.type === "entrada" && new Date(m.date).toDateString() === date.toDateString())
          .reduce((sum, m) => sum + m.quantity, 0),
        saidas: movementsUntilDate
          .filter((m) => m.type === "saida" && new Date(m.date).toDateString() === date.toDateString())
          .reduce((sum, m) => sum + m.quantity, 0),
      };
    });

    return data;
  }, [days]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{data.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${entry.dataKey}-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <TrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evolução do Estoque</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Últimos {days} dias
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-zinc-700" />
          <XAxis
            dataKey="id"
            tickFormatter={(value) => {
              const item = chartData.find(d => d.id === value);
              return item ? item.date : '';
            }}
            className="text-xs text-gray-600 dark:text-gray-400"
            stroke="currentColor"
          />
          <YAxis
            className="text-xs text-gray-600 dark:text-gray-400"
            stroke="currentColor"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
            iconType="line"
          />
          <Line
            key="line-estoque"
            type="monotone"
            dataKey="estoque"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Estoque Total"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            key="line-entradas"
            type="monotone"
            dataKey="entradas"
            stroke="#10b981"
            strokeWidth={2}
            name="Entradas"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            key="line-saidas"
            type="monotone"
            dataKey="saidas"
            stroke="#ef4444"
            strokeWidth={2}
            name="Saídas"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}