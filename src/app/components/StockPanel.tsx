import { useState, useEffect } from "react";
import {
  getProducts,
  getBatches,
  getTotalStock,
  isStockLow,
  isExpiryNear,
  isExpired,
  getProductBatches,
  isProductExpired,
  isProductExpiryNear,
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
import { Badge } from "./ui/badge";
import { Search, AlertTriangle } from "lucide-react";

export default function StockPanel() {
  const [products, setProducts] = useState(getProducts());
  const [batches, setBatches] = useState(getBatches());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setProducts(getProducts());
      setBatches(getBatches());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Estoque</h1>
        <p className="text-gray-400 mt-2">
          Visão geral consolidada do estoque por produto
        </p>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome ou código..."
          className="bg-zinc-900 border-zinc-800 text-white pl-10"
        />
      </div>

      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-gray-400">Código</TableHead>
              <TableHead className="text-gray-400">Produto</TableHead>
              <TableHead className="text-gray-400">Estoque Total</TableHead>
              <TableHead className="text-gray-400">Estoque Mínimo</TableHead>
              <TableHead className="text-gray-400">Nº de Lotes</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const totalStock = getTotalStock(product.id);
                const productBatches = getProductBatches(product.id);
                const lowStock = isStockLow(product.id, product.minStockQuantity);
                const hasExpired = productBatches.some(isExpired);
                const hasExpiring = productBatches.some(isExpiryNear);
                const stockPercentage =
                  (totalStock / product.minStockQuantity) * 100;

                return (
                  <TableRow
                    key={product.id}
                    className={`border-zinc-800 hover:bg-zinc-800/50 ${
                      hasExpired || lowStock
                        ? "bg-red-900/20"
                        : hasExpiring
                        ? "bg-orange-900/20"
                        : ""
                    }`}
                  >
                    <TableCell className="font-mono text-white">
                      {product.code}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-gray-400 mt-1">
                          {product.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">
                        {totalStock} {product.unitType}
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            lowStock
                              ? "bg-red-500"
                              : stockPercentage < 150
                              ? "bg-orange-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(stockPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {product.minStockQuantity} {product.unitType}
                    </TableCell>
                    <TableCell className="text-white">
                      {productBatches.length}
                    </TableCell>
                    <TableCell>
                      {hasExpired ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={14} className="text-red-400" />
                          <span className="text-xs text-red-400">
                            Lote vencido
                          </span>
                        </div>
                      ) : lowStock ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={14} className="text-red-400" />
                          <span className="text-xs text-red-400">
                            Estoque baixo
                          </span>
                        </div>
                      ) : hasExpiring ? (
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Produtos Monitorados</p>
          <p className="text-2xl font-bold text-white mt-1">
            {products.length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total de Lotes</p>
          <p className="text-2xl font-bold text-white mt-1">{batches.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Produtos com Estoque Baixo</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {products.filter((p) => isStockLow(p.id, p.minStockQuantity)).length}
          </p>
        </div>
      </div>
    </div>
  );
}