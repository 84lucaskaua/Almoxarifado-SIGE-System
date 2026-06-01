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
import { Card } from "./ui/card";
import {
  Package,
  PackagePlus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function DashboardPanel() {
  const [products, setProducts] = useState(getProducts());
  const [batches, setBatches] = useState(getBatches());

  useEffect(() => {
    const interval = setInterval(() => {
      setProducts(getProducts());
      setBatches(getBatches());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const lowStockCount = products.filter((p) =>
    isStockLow(p.id, p.minStockQuantity)
  ).length;

  const expiredProductsCount = products.filter(isProductExpired).length;
  const expiringProductsCount = products.filter(
    (p) => isProductExpiryNear(p) && !isProductExpired(p)
  ).length;

  const expiredBatchesCount = batches.filter(isExpired).length;
  const expiringBatchesCount = batches.filter(
    (b) => isExpiryNear(b) && !isExpired(b)
  ).length;

  const totalExpiredCount = expiredProductsCount + expiredBatchesCount;
  const totalExpiringCount = expiringProductsCount + expiringBatchesCount;

  const totalStockValue = products.reduce((total, product) => {
    const stock = getTotalStock(product.id);
    return total + stock;
  }, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Visão geral do sistema de gerenciamento de estoque
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Produtos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {products.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Package className="text-blue-500" size={24} />
            </div>
          </div>
        </Card>

        {/* Total Batches */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Lotes</p>
              <p className="text-3xl font-bold text-white mt-2">
                {batches.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <PackagePlus className="text-green-500" size={24} />
            </div>
          </div>
        </Card>

        {/* Low Stock */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Estoque Baixo</p>
              <p className="text-3xl font-bold text-red-400 mt-2">
                {lowStockCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-red-500" size={24} />
            </div>
          </div>
        </Card>

        {/* Expiring/Expired */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vencidos/Vencendo</p>
              <p className="text-3xl font-bold text-orange-400 mt-2">
                {totalExpiredCount + totalExpiringCount}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-orange-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Alertas Críticos
          </h2>
          <div className="space-y-3">
            {totalExpiredCount > 0 && (
              <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
                <p className="text-red-400 font-medium">
                  {totalExpiredCount} produto(s)/lote(s) vencido(s)
                </p>
                <p className="text-red-300 text-sm mt-1">
                  {expiredProductsCount > 0 && `${expiredProductsCount} produto(s) | `}
                  {expiredBatchesCount > 0 && `${expiredBatchesCount} lote(s)`}
                </p>
              </div>
            )}
            {lowStockCount > 0 && (
              <div className="bg-orange-900/20 border border-orange-900 rounded-lg p-4">
                <p className="text-orange-400 font-medium">
                  {lowStockCount} produto(s) com estoque baixo
                </p>
                <p className="text-orange-300 text-sm mt-1">
                  Solicitar reposição de estoque
                </p>
              </div>
            )}
            {totalExpiringCount > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-900 rounded-lg p-4">
                <p className="text-yellow-400 font-medium">
                  {totalExpiringCount} produto(s)/lote(s) vencendo em 30 dias
                </p>
                <p className="text-yellow-300 text-sm mt-1">
                  {expiringProductsCount > 0 && `${expiringProductsCount} produto(s) | `}
                  {expiringBatchesCount > 0 && `${expiringBatchesCount} lote(s)`}
                </p>
              </div>
            )}
            {totalExpiredCount === 0 &&
              lowStockCount === 0 &&
              totalExpiringCount === 0 && (
                <div className="bg-green-900/20 border border-green-900 rounded-lg p-4">
                  <p className="text-green-400 font-medium">
                    ✓ Nenhum alerta crítico
                  </p>
                  <p className="text-green-300 text-sm mt-1">
                    Tudo está funcionando perfeitamente
                  </p>
                </div>
              )}
          </div>
        </Card>

        {/* Recent Products */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={20} />
            Produtos Recentes
          </h2>
          <div className="space-y-3">
            {products.slice(-5).reverse().map((product) => {
              const totalStock = getTotalStock(product.id);
              const productBatches = getProductBatches(product.id);
              
              return (
                <div
                  key={product.id}
                  className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">Código: {product.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {totalStock} {product.unitType}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {productBatches.length} lote(s)
                    </p>
                  </div>
                </div>
              );
            })}
            {products.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                Nenhum produto cadastrado
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}