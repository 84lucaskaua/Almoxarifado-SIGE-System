import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, Grid, List, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "./ProductForm";
import {
  getExtendedProducts,
  saveExtendedProducts,
  getCategories,
  type ExtendedProduct,
} from "../../utils/storageExtended";
import { getBatchItems, getMovements, saveMovements, saveBatchItems } from "../../utils/storage";
import { toast } from "sonner";

type ViewMode = "grid" | "list";

export function ProductCatalog() {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ExtendedProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<ExtendedProduct | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedProducts = getExtendedProducts();
    setProducts(loadedProducts);

    const loadedCategories = getCategories();
    setCategories(loadedCategories.map(c => c.name));
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const getProductStockQuantity = (productCode: string): number => {
    const items = getBatchItems();
    return items
      .filter(item => item.sku === productCode)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const isProductLowStock = (product: ExtendedProduct): boolean => {
    const totalStock = getProductStockQuantity(product.code);
    return totalStock <= product.minStockQuantity;
  };

  const handleSaveProduct = (productData: Partial<ExtendedProduct>) => {
    if (selectedProduct) {
      // Editar produto existente
      const updatedProducts = products.map((p) =>
        p.id === selectedProduct.id
          ? { ...selectedProduct, ...productData, updatedAt: new Date().toISOString() }
          : p
      );
      setProducts(updatedProducts);
      saveExtendedProducts(updatedProducts);
      toast.success("Produto atualizado com sucesso!");
    } else {
      // Criar novo produto
      const newProduct: ExtendedProduct = {
        id: crypto.randomUUID(),
        code: productData.code || "",
        name: productData.name || "",
        description: productData.description || "",
        category: productData.category,
        unitType: productData.unitType || "UN",
        minStockQuantity: productData.minStockQuantity || 0,
        imageUrl: productData.imageUrl,
        tags: productData.tags || [],
        alertDays: productData.alertDays || 30,
        notes: productData.notes,
        requiresTemperatureControl: productData.requiresTemperatureControl || false,
        minTemperature: productData.minTemperature,
        maxTemperature: productData.maxTemperature,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      saveExtendedProducts(updatedProducts);
      toast.success("Produto criado com sucesso!");
    }

    setSelectedProduct(null);
    loadData();
  };

  const handleEditProduct = (product: ExtendedProduct) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: ExtendedProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;

    // Remove o produto
    const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
    setProducts(updatedProducts);
    saveExtendedProducts(updatedProducts);

    // Remove todos os BatchItems relacionados
    const items = getBatchItems();
    const updatedItems = items.filter((item) => item.sku !== productToDelete.code);
    saveBatchItems(updatedItems);

    // Remove todos os movimentos relacionados aos items deletados
    const deletedItemIds = items
      .filter((item) => item.sku === productToDelete.code)
      .map((item) => item.id);
    const movements = getMovements();
    const updatedMovements = movements.filter(
      (m) => !deletedItemIds.includes(m.batchItemId)
    );
    saveMovements(updatedMovements);

    toast.success("Produto excluído com sucesso!");
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
    loadData();
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Catálogo de Produtos</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerenciamento completo de produtos com imagens e categorias
          </p>
        </div>
        <Button onClick={handleNewProduct} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={20} className="mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <Input
              placeholder="Buscar por nome, código, descrição ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtro de Categoria */}
          <div className="w-full md:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Toggle View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              <strong className="text-gray-900 dark:text-white">{filteredProducts.length}</strong>{" "}
              {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </span>
            {selectedCategory !== "all" && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {selectedCategory}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchTerm || selectedCategory !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece criando seu primeiro produto"}
          </p>
          {!searchTerm && selectedCategory === "all" && (
            <Button onClick={handleNewProduct} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={20} className="mr-2" />
              Criar Primeiro Produto
            </Button>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              stockQuantity={getProductStockQuantity(product.code)}
              isLowStock={isProductLowStock(product)}
            />
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        initialData={selectedProduct}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir o produto{" "}
              <strong className="text-gray-900 dark:text-white">{productToDelete?.name}</strong>?
              <br />
              <br />
              Esta ação irá remover:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>O produto do catálogo</li>
                <li>Todos os itens de lote relacionados</li>
                <li>Todo o histórico de movimentações</li>
              </ul>
              <br />
              <strong className="text-red-600 dark:text-red-400">
                Esta ação não pode ser desfeita.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white border-gray-300 dark:border-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
