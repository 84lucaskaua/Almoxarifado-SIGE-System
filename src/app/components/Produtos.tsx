import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Search, Package, TrendingDown, Trash2 } from "lucide-react";
import {
  getAllUniqueProducts,
  getItemsByProduct,
  getBatches,
  getDaysUntilExpiry,
  getItemStatus,
  getStockStatus,
  BatchItem,
  getBatchItems,
  saveBatchItems,
  getMovements,
  saveMovements,
} from "../utils/storage";
import ProductDetailsModal from "./ProductDetailsModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";

export default function Produtos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [products, setProducts] = useState<{ productName: string; sku: string }[]>([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BatchItem | null>(null);
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ productName: string; sku: string } | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  // Recarregar produtos quando o componente é exibido novamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProducts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadProducts);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadProducts);
    };
  }, []);

  const loadProducts = () => {
    const uniqueProducts = getAllUniqueProducts();
    setProducts(uniqueProducts);
  };

  const getProductBatches = (sku: string) => {
    const items = getItemsByProduct(sku);
    const batches = getBatches();
    const batchMap = new Map(batches.map(b => [b.id, b.batchNumber]));
    
    return Array.from(new Set(items.map(item => item.batchId)))
      .map(batchId => batchMap.get(batchId) || "")
      .filter(Boolean);
  };

  const getProductTotalQuantity = (sku: string) => {
    const items = getItemsByProduct(sku);
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getProductStatus = (sku: string): { status: "expired" | "expiring" | "ok"; count: number } => {
    const items = getItemsByProduct(sku);
    const expiredItems = items.filter(item => getItemStatus(item) === "expired");
    const expiringItems = items.filter(item => getItemStatus(item) === "expiring");
    
    if (expiredItems.length > 0) {
      return { status: "expired", count: expiredItems.length };
    } else if (expiringItems.length > 0) {
      return { status: "expiring", count: expiringItems.length };
    }
    return { status: "ok", count: 0 };
  };

  const getClosestExpiryDate = (sku: string): string | null => {
    const items = getItemsByProduct(sku);
    if (items.length === 0) return null;
    
    const sortedItems = items.sort((a, b) => {
      const daysA = getDaysUntilExpiry(a.expiryDate);
      const daysB = getDaysUntilExpiry(b.expiryDate);
      return daysA - daysB;
    });
    
    return sortedItems[0]?.expiryDate;
  };

  const getProductStockStatus = (sku: string): { status: "critico" | "baixo" | "ok"; count: number } => {
    const items = getItemsByProduct(sku);
    const criticoItems = items.filter(item => getStockStatus(item) === "critico");
    const baixoItems = items.filter(item => getStockStatus(item) === "baixo");
    
    if (criticoItems.length > 0) {
      return { status: "critico", count: criticoItems.length };
    } else if (baixoItems.length > 0) {
      return { status: "baixo", count: baixoItems.length };
    }
    return { status: "ok", count: 0 };
  };

  const hasLowStock = (sku: string): boolean => {
    const stockStatus = getProductStockStatus(sku);
    return stockStatus.status === "critico" || stockStatus.status === "baixo";
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;

    // Obter todos os itens do produto
    const productItems = getItemsByProduct(productToDelete.sku);
    const productItemIds = productItems.map(item => item.id);

    // Excluir todos os movimentos relacionados aos itens do produto
    const movements = getMovements();
    const updatedMovements = movements.filter(
      movement => !productItemIds.includes(movement.batchItemId)
    );
    saveMovements(updatedMovements);

    // Excluir todos os itens do produto
    const allItems = getBatchItems();
    const updatedItems = allItems.filter(item => item.sku !== productToDelete.sku);
    saveBatchItems(updatedItems);

    // Recarregar a lista de produtos
    loadProducts();

    setIsDeleteProductDialogOpen(false);
    setProductToDelete(null);
    toast.success(`Produto "${productToDelete.productName}" excluído com sucesso!`);
  };

  const filteredProducts = products
    .filter((product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => !showLowStockOnly || hasLowStock(product.sku));

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Produtos</h1>
        <p className="text-gray-600 dark:text-gray-400">Visão geral de todos os produtos e seus lotes</p>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6">
        {/* Search Bar and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400" size={20} />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`${
                showLowStockOnly
                  ? "bg-red-600 hover:bg-red-700 border-red-600 text-white"
                  : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-gray-300"
              }`}
            >
              <TrendingDown size={18} className="mr-2" />
              Estoque Baixo
            </Button>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>
              {searchTerm
                ? "Nenhum produto encontrado"
                : "Nenhum produto cadastrado"}
            </p>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-800/50">
                <TableRow className="hover:bg-zinc-800/50">
                  <TableHead className="text-gray-300">SKU</TableHead>
                  <TableHead className="text-gray-300">Nome do Produto</TableHead>
                  <TableHead className="text-gray-300">Quantidade Total</TableHead>
                  <TableHead className="text-gray-300">Próxima Validade</TableHead>
                  <TableHead className="text-gray-300">Lotes</TableHead>
                  <TableHead className="text-gray-300">Status Validade</TableHead>
                  <TableHead className="text-gray-300">Status Estoque</TableHead>
                  <TableHead className="text-gray-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const batches = getProductBatches(product.sku);
                  const totalQty = getProductTotalQuantity(product.sku);
                  const status = getProductStatus(product.sku);
                  const stockStatus = getProductStockStatus(product.sku);
                  const nextExpiry = getClosestExpiryDate(product.sku);
                  const daysUntilExpiry = nextExpiry ? getDaysUntilExpiry(nextExpiry) : null;
                  const items = getItemsByProduct(product.sku);
                  const firstItem = items.length > 0 ? items[0] : null;

                  return (
                    <TableRow 
                      key={product.sku} 
                      className="hover:bg-zinc-800/30 cursor-pointer"
                      onClick={() => {
                        if (firstItem) {
                          setSelectedItem(firstItem);
                          setIsDetailsModalOpen(true);
                        }
                      }}
                    >
                      <TableCell className="text-white font-mono">{product.sku}</TableCell>
                      <TableCell className="text-white font-medium">{product.productName}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{totalQty}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {formatDate(nextExpiry)}
                        {daysUntilExpiry !== null && daysUntilExpiry >= 0 && (
                          <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                            ({daysUntilExpiry}d)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {batches.map((batchNumber, index) => (
                            <Badge
                              key={index}
                              className="bg-blue-900/50 hover:bg-blue-900 text-blue-300 border border-blue-700"
                            >
                              {batchNumber}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {status.status === "expired" && (
                          <Badge className="bg-red-600 hover:bg-red-700">
                            {status.count} Vencido{status.count > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {status.status === "expiring" && (
                          <Badge className="bg-amber-600 hover:bg-amber-700">
                            {status.count} Vencendo
                          </Badge>
                        )}
                        {status.status === "ok" && (
                          <Badge className="bg-green-600 hover:bg-green-700">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {stockStatus.status === "critico" && (
                          <Badge className="bg-red-600 hover:bg-red-700">
                            {stockStatus.count} Crítico{stockStatus.count > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {stockStatus.status === "baixo" && (
                          <Badge className="bg-amber-600 hover:bg-amber-700">
                            {stockStatus.count} Baixo{stockStatus.count > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {stockStatus.status === "ok" && (
                          <Badge className="bg-green-600 hover:bg-green-700">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setProductToDelete(product);
                            setIsDeleteProductDialogOpen(true);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        item={selectedItem}
      />

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Confirmar Exclusão do Produto</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir o produto "{productToDelete?.productName}" (SKU: {productToDelete?.sku})?
              <br /><br />
              <strong className="text-red-400">
                Todos os {getItemsByProduct(productToDelete?.sku || "").length} itens deste produto em todos os lotes serão excluídos permanentemente.
              </strong>
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-zinc-700 text-white hover:bg-zinc-800"
              style={{
                color: 'white',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(39 39 42)'; // zinc-800
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
              style={{
                color: 'white',
                backgroundColor: 'rgb(220 38 38)', // red-600
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(185 28 28)'; // red-700
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgb(220 38 38)'; // red-600
              }}
            >
              Excluir Produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total de Produtos Únicos</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Produtos Vencendo</p>
          <p className="text-2xl font-bold text-amber-500">
            {products.filter(p => getProductStatus(p.sku).status === "expiring").length}
          </p>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Produtos Vencidos</p>
          <p className="text-2xl font-bold text-red-500">
            {products.filter(p => getProductStatus(p.sku).status === "expired").length}
          </p>
        </Card>
      </div>
    </div>
  );
}