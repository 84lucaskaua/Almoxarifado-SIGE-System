import { useState, useEffect } from "react";
import {
  getProducts,
  getBatches,
  getTotalStock,
  isStockLow,
  isExpired,
  getProductBatches,
  getDaysUntilExpiry,
  isBatchExpiringIn,
  getCategories,
  Product,
  Batch,
} from "../utils/storage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Search,
  AlertTriangle,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type SortField = "name" | "code" | "stock" | "category" | "expiry";
type SortOrder = "asc" | "desc";

export default function AdvancedStockPanel() {
  const [products, setProducts] = useState(getProducts());
  const [batches, setBatches] = useState(getBatches());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setProducts(getProducts());
      setBatches(getBatches());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const categories = getCategories();

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleProductExpansion = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1" />;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="ml-1" />
    ) : (
      <ArrowDown size={14} className="ml-1" />
    );
  };

  const filteredAndSortedProducts = products
    .filter((p) => {
      // Busca por nome ou código
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por categoria
      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      // Filtro por status de estoque
      const totalStock = getTotalStock(p.id);
      const lowStock = isStockLow(p.id, p.minStockQuantity);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "critical" && lowStock) ||
        (statusFilter === "ok" && !lowStock);

      // Filtro por vencimento
      const productBatches = getProductBatches(p.id);
      let matchesExpiry = true;
      if (expiryFilter !== "all") {
        const days = parseInt(expiryFilter);
        matchesExpiry = productBatches.some((batch) =>
          isBatchExpiringIn(batch, days)
        );
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesExpiry;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "code":
          comparison = a.code.localeCompare(b.code);
          break;
        case "stock":
          comparison = getTotalStock(a.id) - getTotalStock(b.id);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "expiry": {
          const aBatches = getProductBatches(a.id);
          const bBatches = getProductBatches(b.id);
          const aMinDays =
            aBatches.length > 0
              ? Math.min(...aBatches.map((b) => getDaysUntilExpiry(b.expiryDate)))
              : 999999;
          const bMinDays =
            bBatches.length > 0
              ? Math.min(...bBatches.map((b) => getDaysUntilExpiry(b.expiryDate)))
              : 999999;
          comparison = aMinDays - bMinDays;
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setExpiryFilter("all");
  };

  const hasActiveFilters =
    searchTerm || categoryFilter !== "all" || statusFilter !== "all" || expiryFilter !== "all";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Estoque</h1>
        <p className="text-gray-400 mt-2">
          Controle avançado de estoque com filtros e visualização de lotes (PVPS)
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-400" />
            <h3 className="text-white font-medium">Filtros Avançados</h3>
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
          {/* Busca */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produto..."
              className="bg-zinc-800 border-zinc-700 text-white pl-9"
            />
          </div>

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

          {/* Status de Estoque */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="critical">Estoque Crítico</SelectItem>
              <SelectItem value="ok">Estoque Normal</SelectItem>
            </SelectContent>
          </Select>

          {/* Alerta de Vencimento (PVPS) */}
          <Select value={expiryFilter} onValueChange={setExpiryFilter}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Vencimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Vencimentos</SelectItem>
              <SelectItem value="3">Vence em 3 dias</SelectItem>
              <SelectItem value="5">Vence em 5 dias</SelectItem>
              <SelectItem value="7">Vence em 7 dias</SelectItem>
              <SelectItem value="14">Vence em 14 dias</SelectItem>
              <SelectItem value="30">Vence em 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => toggleSort("code")}>
                <div className="flex items-center">
                  Código {getSortIcon("code")}
                </div>
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => toggleSort("name")}>
                <div className="flex items-center">
                  Produto {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => toggleSort("category")}>
                <div className="flex items-center">
                  Categoria {getSortIcon("category")}
                </div>
              </TableHead>
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => toggleSort("stock")}>
                <div className="flex items-center">
                  Estoque {getSortIcon("stock")}
                </div>
              </TableHead>
              <TableHead className="text-gray-400">Lotes</TableHead>
              <TableHead className="text-gray-400 cursor-pointer" onClick={() => toggleSort("expiry")}>
                <div className="flex items-center">
                  Próximo Venc. {getSortIcon("expiry")}
                </div>
              </TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500 py-8"
                >
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProducts.map((product) => {
                const totalStock = getTotalStock(product.id);
                const productBatches = getProductBatches(product.id).sort(
                  (a, b) =>
                    getDaysUntilExpiry(a.expiryDate) -
                    getDaysUntilExpiry(b.expiryDate)
                );
                const lowStock = isStockLow(product.id, product.minStockQuantity);
                const hasExpired = productBatches.some(isExpired);
                const isExpanded = expandedProducts.has(product.id);

                const nearestBatch = productBatches[0];
                const daysUntilExpiry = nearestBatch
                  ? getDaysUntilExpiry(nearestBatch.expiryDate)
                  : null;

                return (
                  <>
                    <TableRow
                      key={product.id}
                      className={`border-zinc-800 hover:bg-zinc-800/50 cursor-pointer ${
                        hasExpired || lowStock
                          ? "bg-red-900/20"
                          : daysUntilExpiry !== null && daysUntilExpiry <= 14
                          ? "bg-orange-900/20"
                          : ""
                      }`}
                      onClick={() => toggleProductExpansion(product.id)}
                    >
                      <TableCell className="font-mono text-white">
                        {product.code}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {product.category || "-"}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {totalStock} {product.unitType}
                      </TableCell>
                      <TableCell className="text-white">
                        {productBatches.length}
                      </TableCell>
                      <TableCell>
                        {nearestBatch ? (
                          <div>
                            <div className="text-white">
                              {formatDate(nearestBatch.expiryDate)}
                            </div>
                            <div
                              className={`text-xs ${
                                daysUntilExpiry !== null && daysUntilExpiry < 0
                                  ? "text-red-400"
                                  : daysUntilExpiry !== null && daysUntilExpiry <= 7
                                  ? "text-red-400"
                                  : daysUntilExpiry !== null && daysUntilExpiry <= 14
                                  ? "text-orange-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {daysUntilExpiry !== null && daysUntilExpiry < 0
                                ? `Vencido há ${Math.abs(daysUntilExpiry)} dias`
                                : `${daysUntilExpiry} dias`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasExpired ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-xs text-red-400">Vencido</span>
                          </div>
                        ) : lowStock ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-xs text-red-400">
                              Estoque baixo
                            </span>
                          </div>
                        ) : daysUntilExpiry !== null && daysUntilExpiry <= 14 ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle size={14} className="text-orange-400" />
                            <span className="text-xs text-orange-400">
                              Próx. vencimento
                            </span>
                          </div>
                        ) : (
                          <Badge className="bg-green-900 text-green-100">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Linha expandida com detalhes dos lotes */}
                    {isExpanded && productBatches.length > 0 && (
                      <TableRow className="border-zinc-800 bg-zinc-950">
                        <TableCell colSpan={7} className="p-0">
                          <div className="p-4 space-y-2">
                            <h4 className="text-blue-400 font-medium text-sm mb-3">
                              Lotes do Produto (PVPS - Primeiro que Vence, Primeiro
                              que Sai)
                            </h4>
                            <div className="space-y-2">
                              {productBatches.map((batch) => {
                                const batchDays = getDaysUntilExpiry(
                                  batch.expiryDate
                                );
                                const batchExpired = isExpired(batch);

                                return (
                                  <div
                                    key={batch.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                      batchExpired
                                        ? "border-red-700 bg-red-900/30"
                                        : batchDays <= 7
                                        ? "border-red-700 bg-red-900/20"
                                        : batchDays <= 14
                                        ? "border-orange-700 bg-orange-900/20"
                                        : "border-zinc-700 bg-zinc-800/50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <p className="text-white font-medium text-sm">
                                          Lote: {batch.batchNumber}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                          Entrada: {formatDate(batch.entryDate)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-white text-sm">
                                          Quantidade: {batch.quantity}{" "}
                                          {product.unitType}
                                        </p>
                                        <p
                                          className={`text-xs ${
                                            batchExpired
                                              ? "text-red-400"
                                              : batchDays <= 7
                                              ? "text-red-400"
                                              : batchDays <= 14
                                              ? "text-orange-400"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          Validade: {formatDate(batch.expiryDate)} (
                                          {batchExpired
                                            ? `Vencido há ${Math.abs(batchDays)} dias`
                                            : `${batchDays} dias`}
                                          )
                                        </p>
                                      </div>
                                    </div>
                                    {batchExpired ? (
                                      <Badge className="bg-red-900 text-red-100">
                                        VENCIDO
                                      </Badge>
                                    ) : batchDays <= 3 ? (
                                      <Badge className="bg-red-900 text-red-100">
                                        URGENTE
                                      </Badge>
                                    ) : batchDays <= 7 ? (
                                      <Badge className="bg-red-800 text-red-100">
                                        3-7 DIAS
                                      </Badge>
                                    ) : batchDays <= 14 ? (
                                      <Badge className="bg-orange-800 text-orange-100">
                                        7-14 DIAS
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-900 text-green-100">
                                        OK
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total de Produtos</p>
          <p className="text-2xl font-bold text-white mt-1">
            {filteredAndSortedProducts.length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Estoque Crítico</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {
              filteredAndSortedProducts.filter((p) =>
                isStockLow(p.id, p.minStockQuantity)
              ).length
            }
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Vencem em 7 dias</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">
            {
              filteredAndSortedProducts.filter((p) =>
                getProductBatches(p.id).some((b) => isBatchExpiringIn(b, 7))
              ).length
            }
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total de Lotes</p>
          <p className="text-2xl font-bold text-white mt-1">
            {batches.length}
          </p>
        </div>
      </div>
    </div>
  );
}