import { useState, useEffect } from "react";
import {
  getProducts,
  getBatches,
  saveBatches,
  Batch,
} from "../utils/storage";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { Badge } from "./ui/badge";
import { PackagePlus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function BatchesManagement() {
  const [products, setProducts] = useState(getProducts());
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    batchNumber: "",
    quantity: "",
    entryDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setBatches(getBatches());
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      batchNumber: "",
      quantity: "",
      entryDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("Selecione um produto!");
      return;
    }

    const newBatch: Batch = {
      id: Date.now().toString(),
      productId: formData.productId,
      batchNumber: formData.batchNumber,
      quantity: parseFloat(formData.quantity),
      entryDate: formData.entryDate,
      expiryDate: formData.expiryDate,
      createdAt: new Date().toISOString(),
    };

    saveBatches([...batches, newBatch]);
    toast.success("Lote registrado com sucesso!");
    loadData();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (batchId: string) => {
    if (confirm("Tem certeza que deseja excluir este lote?")) {
      const updatedBatches = batches.filter((b) => b.id !== batchId);
      saveBatches(updatedBatches);
      loadData();
      toast.success("Lote excluído com sucesso!");
    }
  };

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const isExpired = (batch: Batch): boolean => {
    const today = new Date();
    const expiryDate = new Date(batch.expiryDate);
    return expiryDate < today;
  };

  const isExpiryNear = (batch: Batch): boolean => {
    const today = new Date();
    const expiryDate = new Date(batch.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Lotes</h1>
          <p className="text-gray-400 mt-2">
            Registre entradas de mercadorias por lote
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
              <PackagePlus size={16} className="mr-2" />
              Registrar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                Registrar Entrada de Mercadoria
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Cada entrada cria um novo lote vinculado ao produto
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="productId" className="text-gray-300">
                  Produto *
                </Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.code} - {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchNumber" className="text-gray-300">
                    Número do Lote *
                  </Label>
                  <Input
                    id="batchNumber"
                    value={formData.batchNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, batchNumber: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="Ex: LOTE-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-gray-300">
                    Quantidade *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryDate" className="text-gray-300">
                    Data de Entrada *
                  </Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, entryDate: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate" className="text-gray-300">
                    Data de Validade *
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  Registrar Lote
                </Button>
                <Button
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

      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-gray-400">Produto</TableHead>
              <TableHead className="text-gray-400">Nº do Lote</TableHead>
              <TableHead className="text-gray-400">Quantidade</TableHead>
              <TableHead className="text-gray-400">Data Entrada</TableHead>
              <TableHead className="text-gray-400">Validade</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500 py-8"
                >
                  Nenhum lote registrado
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => {
                const product = getProductById(batch.productId);
                const expired = isExpired(batch);
                const expiring = isExpiryNear(batch);

                return (
                  <TableRow
                    key={batch.id}
                    className={`border-zinc-800 hover:bg-zinc-800/50 ${
                      expired || expiring ? "bg-red-900/20 text-red-100" : ""
                    }`}
                  >
                    <TableCell>
                      {product ? (
                        <>
                          <div className="font-medium text-white">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {product.code}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {batch.batchNumber}
                    </TableCell>
                    <TableCell className="text-white">
                      {batch.quantity} {product?.unitType}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(batch.entryDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(batch.expiryDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      {expired ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={14} className="text-red-400" />
                          <span className="text-xs text-red-400">Vencido</span>
                        </div>
                      ) : expiring ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle size={14} className="text-orange-400" />
                          <span className="text-xs text-orange-400">
                            Vence em breve
                          </span>
                        </div>
                      ) : (
                        <Badge className="bg-green-900 text-green-100">
                          Válido
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(batch.id)}
                        className="border-red-900 bg-red-950 text-red-300 hover:bg-red-900"
                      >
                        <Trash2 size={14} />
                      </Button>
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