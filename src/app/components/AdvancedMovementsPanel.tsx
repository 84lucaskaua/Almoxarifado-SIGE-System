import { useState, useEffect } from "react";
import {
  getProducts,
  getBatches,
  getMovements,
  saveMovements,
  Movement,
  getCategories,
} from "../utils/storage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  X,
  Download,
  Calendar,
} from "lucide-react";

type PeriodFilter = "all" | "today" | "week" | "month" | "custom";

export default function AdvancedMovementsPanel() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState(getProducts());
  const [batches, setBatches] = useState(getBatches());
  const [filterType, setFilterType] = useState<"all" | "entrada" | "saida">("all");
  const [filterPeriod, setFilterPeriod] = useState<PeriodFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setMovements(getMovements());
    setProducts(getProducts());
    setBatches(getBatches());
  };

  const categories = getCategories();

  const clearFilters = () => {
    setFilterType("all");
    setFilterPeriod("all");
    setCategoryFilter("all");
    setSearchTerm("");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const hasActiveFilters =
    filterType !== "all" ||
    filterPeriod !== "all" ||
    categoryFilter !== "all" ||
    searchTerm !== "" ||
    customStartDate !== "" ||
    customEndDate !== "";

  const getDateRange = (period: PeriodFilter): { start: Date; end: Date } | null => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    switch (period) {
      case "today":
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        return { start, end };
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);
        return { start: weekStart, end };
      case "month":
        const monthStart = new Date(now);
        monthStart.setDate(now.getDate() - 30);
        monthStart.setHours(0, 0, 0, 0);
        return { start: monthStart, end };
      case "custom":
        if (customStartDate && customEndDate) {
          return {
            start: new Date(customStartDate + "T00:00:00"),
            end: new Date(customEndDate + "T23:59:59"),
          };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredMovements = movements
    .filter((m) => {
      // Filtro por tipo
      if (filterType !== "all" && m.type !== filterType) return false;

      // Filtro por período
      if (filterPeriod !== "all") {
        const range = getDateRange(filterPeriod);
        if (range) {
          const movementDate = new Date(m.date);
          if (movementDate < range.start || movementDate > range.end) return false;
        } else if (filterPeriod === "custom") {
          return false; // Se custom mas sem datas, não mostra
        }
      }

      // Filtro por categoria
      const product = products.find((p) => p.id === m.productId);
      if (categoryFilter !== "all" && product?.category !== categoryFilter) return false;

      // Filtro por busca
      if (searchTerm && product) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(searchLower);
        const matchesCode = product.code.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesCode) return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportToCSV = () => {
    const headers = ["Data", "Tipo", "Produto", "Código", "Categoria", "Quantidade", "Lote", "Motivo"];
    const rows = filteredMovements.map((movement) => {
      const product = products.find((p) => p.id === movement.productId);
      const batch = movement.batchId
        ? batches.find((b) => b.id === movement.batchId)
        : null;

      return [
        new Date(movement.date).toLocaleDateString("pt-BR"),
        movement.type === "entrada" ? "Entrada" : "Saída",
        product?.name || "-",
        product?.code || "-",
        product?.category || "-",
        movement.quantity.toString(),
        batch?.batchNumber || "-",
        movement.reason || "-",
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `movimentacoes_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  // Calcular totais
  const totalEntradas = filteredMovements
    .filter((m) => m.type === "entrada")
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalSaidas = filteredMovements
    .filter((m) => m.type === "saida")
    .reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Histórico de Movimentações</h1>
          <p className="text-gray-400 mt-2">
            Acompanhe todas as entradas e saídas do estoque com filtros avançados
          </p>
        </div>
        {filteredMovements.length > 0 && (
          <Button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download size={16} className="mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {/* Filtros Avançados */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-400" />
            <h3 className="text-white font-medium">Filtros de Histórico</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            >
              <X size={14} className="mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tipo de Movimentação */}
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
            </SelectContent>
          </Select>

          {/* Período */}
          <Select value={filterPeriod} onValueChange={(v) => setFilterPeriod(v as PeriodFilter)}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Períodos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="custom">Período Customizado</SelectItem>
            </SelectContent>
          </Select>

          {/* Categoria */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Busca */}
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar produto..."
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        {/* Período Customizado */}
        {filterPeriod === "custom" && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm flex items-center gap-2">
                <Calendar size={14} />
                Data Inicial
              </label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-sm flex items-center gap-2">
                <Calendar size={14} />
                Data Final
              </label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total de Movimentações</p>
          <p className="text-2xl font-bold text-white mt-1">
            {filteredMovements.length}
          </p>
        </div>
        <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg">
          <p className="text-green-400 text-sm flex items-center gap-2">
            <ArrowDownCircle size={16} />
            Total de Entradas
          </p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {totalEntradas.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg">
          <p className="text-red-400 text-sm flex items-center gap-2">
            <ArrowUpCircle size={16} />
            Total de Saídas
          </p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {totalSaidas.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-gray-400">Data</TableHead>
              <TableHead className="text-gray-400">Tipo</TableHead>
              <TableHead className="text-gray-400">Produto</TableHead>
              <TableHead className="text-gray-400">Categoria</TableHead>
              <TableHead className="text-gray-400">Quantidade</TableHead>
              <TableHead className="text-gray-400">Lote</TableHead>
              <TableHead className="text-gray-400">Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500 py-8"
                >
                  {hasActiveFilters
                    ? "Nenhuma movimentação encontrada com os filtros aplicados"
                    : "Nenhuma movimentação registrada"}
                </TableCell>
              </TableRow>
            ) : (
              filteredMovements.map((movement) => {
                const product = products.find((p) => p.id === movement.productId);
                const batch = movement.batchId
                  ? batches.find((b) => b.id === movement.batchId)
                  : null;

                return (
                  <TableRow
                    key={movement.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell>
                      <div className="text-white text-sm">
                        {formatDate(movement.date)}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {formatDateTime(movement.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {movement.type === "entrada" ? (
                        <Badge className="bg-green-900 text-green-100 flex items-center gap-1 w-fit">
                          <ArrowDownCircle size={12} />
                          Entrada
                        </Badge>
                      ) : (
                        <Badge className="bg-red-900 text-red-100 flex items-center gap-1 w-fit">
                          <ArrowUpCircle size={12} />
                          Saída
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">
                        {product?.name || "Produto não encontrado"}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {product?.code}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {product?.category || "-"}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {movement.quantity} {product?.unitType}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-sm">
                      {batch?.batchNumber || "-"}
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">
                      {movement.reason || "-"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}