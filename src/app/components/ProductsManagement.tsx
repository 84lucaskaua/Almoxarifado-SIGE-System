import { useState, useEffect } from "react";
import {
  getProducts,
  saveProducts,
  getProductBatches,
  productCodeExists,
  Product,
  isProductExpired,
  isProductExpiryNear,
} from "../utils/storage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    category: "",
    unitType: "UN" as "UN" | "CX" | "PCT" | "PTC" | "FR" | "RL" | "KIT" | "EMB" | "UM" | "BEM" | "KG" | "G",
    minStockQuantity: "",
    expiryDate: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      category: "",
      unitType: "UN",
      minStockQuantity: "",
      expiryDate: "",
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (productCodeExists(formData.code, editingProduct?.id)) {
      toast.error("Já existe um produto com este código!");
      return;
    }

    const productData = {
      code: formData.code,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      unitType: formData.unitType,
      minStockQuantity: parseFloat(formData.minStockQuantity),
      expiryDate: formData.expiryDate,
    };

    if (editingProduct) {
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...productData,
              id: p.id,
              createdAt: p.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      saveProducts(updatedProducts);
      toast.success("Produto atualizado com sucesso!");
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProducts([...products, newProduct]);
      toast.success("Produto cadastrado com sucesso!");
    }

    loadProducts();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code || "",
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      unitType: product.unitType || "UN",
      minStockQuantity: product.minStockQuantity?.toString() || "",
      expiryDate: product.expiryDate || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    const productBatches = getProductBatches(productId);
    if (productBatches.length > 0) {
      toast.error("Não é possível excluir um produto que possui lotes!");
      return;
    }

    if (confirm("Tem certeza que deseja excluir este produto?")) {
      const updatedProducts = products.filter((p) => p.id !== productId);
      saveProducts(updatedProducts);
      loadProducts();
      toast.success("Produto excluído com sucesso!");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Produtos</h1>
          <p className="text-gray-400 mt-2">
            Gerencie o cadastro de produtos do almoxarifado
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingProduct ? "Editar Produto" : "Cadastrar Novo Produto"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Cada produto é único. Use lotes para registrar diferentes entradas.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-gray-300">
                    Código Único *
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Ex: PROD001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Nome do Produto *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Nome do produto"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Descreva o produto"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">
                  Categoria
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Ex: Alimentos, Bebidas, Medicamentos, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unitType" className="text-gray-300">
                    Tipo de Unidade *
                  </Label>
                  <Select
                    value={formData.unitType}
                    onValueChange={(value: "UN" | "CX" | "PCT" | "PTC" | "FR" | "RL" | "KIT" | "EMB" | "UM" | "BEM" | "KG" | "G") =>
                      setFormData({ ...formData, unitType: value })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UN">UN</SelectItem>
                      <SelectItem value="CX">CX</SelectItem>
                      <SelectItem value="PCT">PCT</SelectItem>
                      <SelectItem value="PTC">PTC</SelectItem>
                      <SelectItem value="FR">FR</SelectItem>
                      <SelectItem value="RL">RL</SelectItem>
                      <SelectItem value="KIT">KIT</SelectItem>
                      <SelectItem value="EMB">EMB</SelectItem>
                      <SelectItem value="UM">UM</SelectItem>
                      <SelectItem value="BEM">BEM</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStockQuantity" className="text-gray-300">
                    Estoque Mínimo *
                  </Label>
                  <Input
                    id="minStockQuantity"
                    type="number"
                    step="0.01"
                    value={formData.minStockQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minStockQuantity: e.target.value,
                      })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="text-gray-300">
                  Data de Validade
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expiryDate: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  {editingProduct ? "Atualizar" : "Cadastrar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="border-zinc-700 bg-zinc-800 hover:!bg-zinc-700 hover:!text-white text-gray-300"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
              <TableHead className="text-gray-400">Nome</TableHead>
              <TableHead className="text-gray-400">Descrição</TableHead>
              <TableHead className="text-gray-400">Unidade</TableHead>
              <TableHead className="text-gray-400">Estoque Mínimo</TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  Nenhum produto cadastrado
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  className="border-zinc-800 hover:bg-zinc-800/50"
                >
                  <TableCell className="font-mono text-white">
                    {product.code}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {product.name}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-gray-300">
                    {product.description || "-"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {product.unitType}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {product.minStockQuantity}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="border-blue-700 bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-blue-200"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        className="border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}