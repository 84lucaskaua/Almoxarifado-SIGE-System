import { useState, useEffect } from "react";
import {
  getProducts,
  getBatches,
  getMovements,
  saveMovements,
  Movement,
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
import { Badge } from "./ui/badge";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

export default function MovementsPanel() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState(getProducts());
  const [batches, setBatches] = useState(getBatches());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "entrada" | "saida">("all");

  const [formData, setFormData] = useState({
    type: "entrada" as "entrada" | "saida",
    productId: "",
    batchId: "",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    reason: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMovements(getMovements());
    setProducts(getProducts());
    setBatches(getBatches());
  };

  const resetForm = () => {
    setFormData({
      type: "entrada",
      productId: "",
      batchId: "",
      quantity: "",
      date: new Date().toISOString().split("T")[0],
      reason: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("Selecione um produto!");
      return;
    }

    const newMovement: Movement = {
      id: Date.now().toString(),
      productId: formData.productId,
      batchId: formData.batchId || undefined,
      type: formData.type,
      quantity: parseFloat(formData.quantity),
      date: formData.date,
      reason: formData.reason,
      createdAt: new Date().toISOString(),
    };

    saveMovements([...movements, newMovement]);
    toast.success(
      `${formData.type === "entrada" ? "Entrada" : "Saída"} registrada com sucesso!`
    );
    loadData();
    setIsDialogOpen(false);
    resetForm();
  };

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const getBatchById = (batchId: string) => {
    return batches.find((b) => b.id === batchId);
  };

  const filteredMovements = movements.filter((m) => {
    if (filterType === "all") return true;
    return m.type === filterType;
  });

  // Sort movements by date (most recent first)
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getProductBatches = (productId: string) => {
    return batches.filter((b) => b.productId === productId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Movimentações</h1>
          <p className="text-gray-400 mt-2">
            Histórico de entradas e saídas de mercadorias
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
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                Registrar Movimentação
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Registre entradas ou saídas de produtos do estoque
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-gray-300">
                  Tipo de Movimentação *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "entrada" | "saida") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="entrada">
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle size={16} className="text-green-500" />
                        <span>Entrada</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="saida">
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle size={16} className="text-red-500" />
                        <span>Saída</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId" className="text-gray-300">
                  Produto *
                </Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, productId: value, batchId: "" })
                  }
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.code} - {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.productId && formData.type === "saida" && (
                <div className="space-y-2">
                  <Label htmlFor="batchId" className="text-gray-300">
                    Lote (Opcional)
                  </Label>
                  <Select
                    value={formData.batchId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, batchId: value })
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Selecione o lote (opcional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {getProductBatches(formData.productId).map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batchNumber} - {batch.quantity}{" "}
                          {getProductById(formData.productId)?.unitType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-300">
                    Data *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-gray-300">
                  Motivo/Observação
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="Descreva o motivo da movimentação"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                >
                  Registrar
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

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total de Movimentações</p>
          <p className="text-2xl font-bold text-white mt-1">
            {movements.length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Entradas</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {movements.filter((m) => m.type === "entrada").length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Saídas</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {movements.filter((m) => m.type === "saida").length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Este Mês</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {
              movements.filter((m) => {
                const movDate = new Date(m.date);
                const now = new Date();
                return (
                  movDate.getMonth() === now.getMonth() &&
                  movDate.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter size={18} className="text-gray-400" />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className={
              filterType === "all"
                ? "bg-blue-600 text-white"
                : "border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={filterType === "entrada" ? "default" : "outline"}
            onClick={() => setFilterType("entrada")}
            className={
              filterType === "entrada"
                ? "bg-green-600 text-white"
                : "border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }
          >
            <ArrowDownCircle size={14} className="mr-1" />
            Entradas
          </Button>
          <Button
            size="sm"
            variant={filterType === "saida" ? "default" : "outline"}
            onClick={() => setFilterType("saida")}
            className={
              filterType === "saida"
                ? "bg-red-600 text-white"
                : "border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }
          >
            <ArrowUpCircle size={14} className="mr-1" />
            Saídas
          </Button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-gray-400">Data/Hora</TableHead>
              <TableHead className="text-gray-400">Tipo</TableHead>
              <TableHead className="text-gray-400">Produto</TableHead>
              <TableHead className="text-gray-400">Lote</TableHead>
              <TableHead className="text-gray-400">Quantidade</TableHead>
              <TableHead className="text-gray-400">Motivo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMovements.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-500 py-8"
                >
                  Nenhuma movimentação registrada
                </TableCell>
              </TableRow>
            ) : (
              sortedMovements.map((movement) => {
                const product = getProductById(movement.productId);
                const batch = movement.batchId
                  ? getBatchById(movement.batchId)
                  : null;
                const movDate = new Date(movement.date);
                const isToday =
                  movDate.toDateString() === new Date().toDateString();

                return (
                  <TableRow
                    key={movement.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell>
                      <div className="text-white">
                        {movDate.toLocaleDateString("pt-BR")}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(movement.createdAt).toLocaleTimeString(
                          "pt-BR"
                        )}
                      </div>
                      {isToday && (
                        <Badge className="bg-blue-900 text-blue-100 mt-1">
                          Hoje
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {movement.type === "entrada" ? (
                          <>
                            <ArrowDownCircle
                              size={16}
                              className="text-green-500"
                            />
                            <span className="text-green-400 text-sm">
                              Entrada
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowUpCircle size={16} className="text-red-500" />
                            <span className="text-red-400 text-sm">Saída</span>
                          </>
                        )}
                      </div>
                    </TableCell>
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
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-white">
                      {batch ? batch.batchNumber : "-"}
                    </TableCell>
                    <TableCell
                      className={`font-medium ${
                        movement.type === "entrada"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {movement.type === "entrada" ? "+" : "-"}
                      {movement.quantity} {product?.unitType}
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