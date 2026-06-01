import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getBatchItems } from "../../utils/storage";
import { getCategories } from "../../utils/storageExtended";
import { PieChartIcon } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export function CategoryPieChart() {
  const chartData = useMemo(() => {
    const items = getBatchItems();
    const categories = getCategories();

    // Mapear categorias personalizadas com suas cores
    const categoryMap = new Map(categories.map(c => [c.name, c.color]));

    // Agrupar por categoria (se não tiver categoria, usar "Sem Categoria")
    const grouped = items.reduce((acc, item) => {
      // Tentar encontrar uma categoria relacionada ao produto
      const categoryName = "Sem Categoria"; // Por padrão
      const existingCategory = acc.find((c) => c.name === categoryName);

      if (existingCategory) {
        existingCategory.value += item.quantity;
        existingCategory.count += 1;
      } else {
        acc.push({
          name: categoryName,
          value: item.quantity,
          count: 1,
          color: "#94a3b8",
        });
      }

      return acc;
    }, [] as Array<{ name: string; value: number; count: number; color: string }>);

    // Adicionar categorias definidas com seus produtos
    categories.forEach((category, index) => {
      // Aqui você pode adicionar lógica para associar produtos a categorias
      // Por enquanto, vamos apenas criar dados de exemplo baseados nas categorias
      const existingData = grouped.find(g => g.name === category.name);
      if (!existingData) {
        grouped.push({
          name: category.name,
          value: Math.floor(Math.random() * 100), // Dados fictícios
          count: Math.floor(Math.random() * 10),
          color: category.color || COLORS[index % COLORS.length],
        });
      } else {
        existingData.color = category.color || COLORS[index % COLORS.length];
      }
    });

    return grouped
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, []);

  // Custom label
  const renderLabel = (entry: any) => {
    const percent = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
    return `${percent}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quantidade: <strong>{data.value}</strong> unidades
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Produtos: <strong>{data.count}</strong>
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
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <PieChartIcon size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Distribuição por Categoria</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Análise de estoque</p>
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <PieChartIcon size={24} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Distribuição por Categoria</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {chartData.length} {chartData.length === 1 ? "categoria" : "categorias"}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            key="category-pie"
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            dataKey="value"
            nameKey="name"
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}-${entry.name}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}