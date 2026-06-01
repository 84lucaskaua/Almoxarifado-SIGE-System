import { useState, useEffect } from "react";
import {
  getProducts,
  getBatches,
  isExpired,
  isExpiryNear,
  isProductExpired,
  isProductExpiryNear,
  Product,
  Batch,
} from "../utils/storage";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { AlertTriangle, Calendar, Package } from "lucide-react";
import { Badge } from "./ui/badge";

export default function ExpiryAlertsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const loadData = () => {
      setProducts(getProducts());
      setBatches(getBatches());
    };
    loadData();
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Produtos vencidos
  const expiredProducts = products.filter(isProductExpired);

  // Produtos vencendo em 30 dias
  const expiringProducts = products.filter(
    (p) => isProductExpiryNear(p) && !isProductExpired(p)
  );

  // Lotes vencidos
  const expiredBatches = batches.filter(isExpired);

  // Lotes vencendo em 30 dias
  const expiringBatches = batches.filter(
    (b) => isExpiryNear(b) && !isExpired(b)
  );

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Alertas de Validade</h1>
        <p className="text-gray-400 mt-2">
          Monitoramento de produtos e lotes vencidos ou próximos ao vencimento
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-900/20 border-red-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm">Produtos Vencidos</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {expiredProducts.length}
              </p>
            </div>
            <AlertTriangle className="text-red-400" size={32} />
          </div>
        </Card>

        <Card className="bg-orange-900/20 border-orange-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm">Produtos Vencendo</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">
                {expiringProducts.length}
              </p>
            </div>
            <Calendar className="text-orange-400" size={32} />
          </div>
        </Card>

        <Card className="bg-red-900/20 border-red-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-300 text-sm">Lotes Vencidos</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {expiredBatches.length}
              </p>
            </div>
            <AlertTriangle className="text-red-400" size={32} />
          </div>
        </Card>

        <Card className="bg-orange-900/20 border-orange-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm">Lotes Vencendo</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">
                {expiringBatches.length}
              </p>
            </div>
            <Calendar className="text-orange-400" size={32} />
          </div>
        </Card>
      </div>

      {/* Produtos Vencidos */}
      {expiredProducts.length > 0 && (
        <Card className="bg-zinc-900 border-red-900 p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Produtos Vencidos
          </h2>
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-zinc-700/50">
                  <TableHead className="text-gray-400">Código</TableHead>
                  <TableHead className="text-gray-400">Nome</TableHead>
                  <TableHead className="text-gray-400">Data de Validade</TableHead>
                  <TableHead className="text-gray-400">Dias Vencido</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredProducts.map((product) => {
                  const daysExpired = Math.abs(
                    getDaysUntilExpiry(product.expiryDate!)
                  );
                  return (
                    <TableRow
                      key={product.id}
                      className="border-zinc-700 bg-red-900/10 hover:bg-red-900/20"
                    >
                      <TableCell className="font-mono text-white">
                        {product.code}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-red-300">
                        {formatDate(product.expiryDate!)}
                      </TableCell>
                      <TableCell className="text-red-400 font-bold">
                        {daysExpired} dia(s)
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-600 text-white">VENCIDO</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Produtos Vencendo */}
      {expiringProducts.length > 0 && (
        <Card className="bg-zinc-900 border-orange-900 p-6">
          <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Produtos Próximos ao Vencimento (30 dias)
          </h2>
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-zinc-700/50">
                  <TableHead className="text-gray-400">Código</TableHead>
                  <TableHead className="text-gray-400">Nome</TableHead>
                  <TableHead className="text-gray-400">Data de Validade</TableHead>
                  <TableHead className="text-gray-400">Dias Restantes</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringProducts.map((product) => {
                  const daysLeft = getDaysUntilExpiry(product.expiryDate!);
                  return (
                    <TableRow
                      key={product.id}
                      className="border-zinc-700 bg-orange-900/10 hover:bg-orange-900/20"
                    >
                      <TableCell className="font-mono text-white">
                        {product.code}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-orange-300">
                        {formatDate(product.expiryDate!)}
                      </TableCell>
                      <TableCell className="text-orange-400 font-bold">
                        {daysLeft} dia(s)
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-600 text-white">
                          VENCENDO
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Lotes Vencidos */}
      {expiredBatches.length > 0 && (
        <Card className="bg-zinc-900 border-red-900 p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Lotes Vencidos
          </h2>
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-zinc-700/50">
                  <TableHead className="text-gray-400">Lote</TableHead>
                  <TableHead className="text-gray-400">Produto</TableHead>
                  <TableHead className="text-gray-400">Quantidade</TableHead>
                  <TableHead className="text-gray-400">Data de Validade</TableHead>
                  <TableHead className="text-gray-400">Dias Vencido</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiredBatches.map((batch) => {
                  const product = getProductById(batch.productId);
                  const daysExpired = Math.abs(
                    getDaysUntilExpiry(batch.expiryDate)
                  );
                  return (
                    <TableRow
                      key={batch.id}
                      className="border-zinc-700 bg-red-900/10 hover:bg-red-900/20"
                    >
                      <TableCell className="font-mono text-white">
                        {batch.batchNumber}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-medium">{product?.name}</div>
                        <div className="text-xs text-gray-400">
                          {product?.code}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {batch.quantity} {product?.unitType}
                      </TableCell>
                      <TableCell className="text-red-300">
                        {formatDate(batch.expiryDate)}
                      </TableCell>
                      <TableCell className="text-red-400 font-bold">
                        {daysExpired} dia(s)
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-600 text-white">VENCIDO</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Lotes Vencendo */}
      {expiringBatches.length > 0 && (
        <Card className="bg-zinc-900 border-orange-900 p-6">
          <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Lotes Próximos ao Vencimento (30 dias)
          </h2>
          <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-700 hover:bg-zinc-700/50">
                  <TableHead className="text-gray-400">Lote</TableHead>
                  <TableHead className="text-gray-400">Produto</TableHead>
                  <TableHead className="text-gray-400">Quantidade</TableHead>
                  <TableHead className="text-gray-400">Data de Validade</TableHead>
                  <TableHead className="text-gray-400">Dias Restantes</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringBatches.map((batch) => {
                  const product = getProductById(batch.productId);
                  const daysLeft = getDaysUntilExpiry(batch.expiryDate);
                  return (
                    <TableRow
                      key={batch.id}
                      className="border-zinc-700 bg-orange-900/10 hover:bg-orange-900/20"
                    >
                      <TableCell className="font-mono text-white">
                        {batch.batchNumber}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="font-medium">{product?.name}</div>
                        <div className="text-xs text-gray-400">
                          {product?.code}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {batch.quantity} {product?.unitType}
                      </TableCell>
                      <TableCell className="text-orange-300">
                        {formatDate(batch.expiryDate)}
                      </TableCell>
                      <TableCell className="text-orange-400 font-bold">
                        {daysLeft} dia(s)
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-600 text-white">
                          VENCENDO
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* No Alerts */}
      {expiredProducts.length === 0 &&
        expiringProducts.length === 0 &&
        expiredBatches.length === 0 &&
        expiringBatches.length === 0 && (
          <Card className="bg-green-900/20 border-green-900 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-green-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                ✓ Tudo em Ordem!
              </h3>
              <p className="text-green-300">
                Nenhum produto ou lote vencido ou próximo ao vencimento
              </p>
            </div>
          </Card>
        )}
    </div>
  );
}
