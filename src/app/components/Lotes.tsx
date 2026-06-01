import {
  Batch,
  BatchItem,
  getBatches,
  saveBatches,
  getBatchItems,
  saveBatchItems,
  getBatchItemsByBatchId,
  getNextBatchNumber,
  getItemStatus,
  getDaysUntilExpiry,
  getMovements,
  saveMovements,
  Movement,
  getCurrentUser,
  getStockStatus,
  StockStatus,
  getItemPriority,
  calculateAutoPriority,
} from "../utils/storage";
import { logBatchCreate, logBatchDelete } from "../utils/auditLogger";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Edit,
  Trash2,
  PackageMinus,
  PackagePlus,
  Calendar,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";
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
import { ProductDetailsModal } from "./ProductDetailsModal";
import { usePinConfirmation } from "../hooks/usePinConfirmation";

// Unidades de medida disponíveis
const UNIT_OPTIONS = [
  { value: "UN", label: "UN — Unidade" },
  { value: "CX", label: "CX — Caixa" },
  { value: "PCT", label: "PCT — Pacote" },
  { value: "PTC", label: "PTC — Pacote (variação)" },
  { value: "FR", label: "FR — Frasco" },
  { value: "RL", label: "RL — Rolo" },
  { value: "EMB", label: "EMB — Embalagem" },
  { value: "KIT", label: "KIT — Kit" },
  { value: "BEM", label: "BEM — Bem" },
  { value: "UM", label: "UM — Unidade de Medida" },
] as const;

export default function Lotes() {
  const { requestConfirmation, PinConfirmationDialog } = usePinConfirmation();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BatchItem | null>(null);
  const [isDeleteBatchDialogOpen, setIsDeleteBatchDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<Batch | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BatchItem | null>(null);
  const [itemToStockOut, setItemToStockOut] = useState<BatchItem | null>(null);
  const [editingItem, setEditingItem] = useState<BatchItem | null>(null);
  const [stockOutQuantity, setStockOutQuantity] = useState("");
  const [stockOutReason, setStockOutReason] = useState("");
  const [stockInQuantity, setStockInQuantity] = useState("");
  const [stockInReason, setStockInReason] = useState("");

  const [formData, setFormData] = useState({
    sku: "",
    productName: "",
    quantity: "",
    minStock: "",
    expiryDate: "",
    supplier: "",
    location: "",
    unit: "UN",
    priority: "auto" as "auto" | "A" | "B" | "C", // Prioridade manual
  });

  useEffect(() => {
    loadData();
  }, []);

  // Recarregar dados sempre que a aba mudar
  useEffect(() => {
    if (selectedBatch) {
      const loadedItems = getBatchItemsByBatchId(selectedBatch);
      setItems(loadedItems);
    }
  }, [selectedBatch]);

  // Recarregar dados quando o componente é exibido novamente
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', loadData);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const loadData = () => {
    const loadedBatches = getBatches();
    const loadedItems = getBatchItems();
    setBatches(loadedBatches);
    setItems(loadedItems);

    if (loadedBatches.length > 0 && !selectedBatch) {
      setSelectedBatch(loadedBatches[0].id);
    }
  };

  const handleCreateBatch = () => {
    const newBatch: Batch = {
      id: crypto.randomUUID(),
      batchNumber: getNextBatchNumber(),
      createdAt: new Date().toISOString(),
    };

    const updatedBatches = [...batches, newBatch];
    saveBatches(updatedBatches);
    setBatches(updatedBatches);
    setSelectedBatch(newBatch.id);
    toast.success(`${newBatch.batchNumber} criado com sucesso!`);
    
    // Registrar no log de auditoria
    logBatchCreate(newBatch.id, newBatch.batchNumber);
  };

  const handleAddItem = () => {
    if (!selectedBatch) {
      toast.error("Selecione um lote primeiro");
      return;
    }

    if (!formData.sku || !formData.productName || !formData.quantity || !formData.expiryDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newItem: BatchItem = {
      id: crypto.randomUUID(),
      batchId: selectedBatch,
      sku: formData.sku,
      productName: formData.productName,
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock) || 0,
      expiryDate: formData.expiryDate,
      supplier: formData.supplier || "",
      location: formData.location || "",
      unit: formData.unit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: formData.priority && formData.priority !== "auto" ? formData.priority as "A" | "B" | "C" : undefined,
    };

    const updatedItems = [...items, newItem];
    saveBatchItems(updatedItems);
    setItems(updatedItems);
    setIsAddItemOpen(false);
    setFormData({
      sku: "",
      productName: "",
      quantity: "",
      minStock: "",
      expiryDate: "",
      supplier: "",
      location: "",
      unit: "UN",
      priority: "auto",
    });
    toast.success("Item adicionado com sucesso!");
  };

  const handleAddItemWithPin = () => {
    if (!selectedBatch) {
      toast.error("Selecione um lote primeiro");
      return;
    }

    if (!formData.sku || !formData.productName || !formData.quantity || !formData.expiryDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    requestConfirmation({
      action: "Adicionar Produto",
      actionDescription: `Você está adicionando o produto "${formData.productName}" (${formData.sku}) ao estoque com ${formData.quantity} unidades.`,
      variant: "normal",
      onConfirm: handleAddItem,
    });
  };

  const handleEditItem = () => {
    if (!editingItem) return;

    const updatedItem: BatchItem = {
      ...editingItem,
      sku: formData.sku,
      productName: formData.productName,
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock) || 0,
      expiryDate: formData.expiryDate,
      supplier: formData.supplier || "",
      location: formData.location || "",
      unit: formData.unit,
      updatedAt: new Date().toISOString(),
      priority: formData.priority && formData.priority !== "auto" ? formData.priority as "A" | "B" | "C" : undefined,
    };

    const updatedItems = items.map(item => 
      item.id === editingItem.id ? updatedItem : item
    );
    saveBatchItems(updatedItems);
    setItems(updatedItems);
    setIsEditItemOpen(false);
    setEditingItem(null);
    setFormData({
      sku: "",
      productName: "",
      quantity: "",
      minStock: "",
      expiryDate: "",
      supplier: "",
      location: "",
      unit: "UN",
      priority: "auto",
    });
    toast.success("Item atualizado com sucesso!");
  };

  const handleEditItemWithPin = () => {
    if (!editingItem) return;

    requestConfirmation({
      action: "Editar Produto",
      actionDescription: `Você está editando o produto "${formData.productName}" (${formData.sku}). As alterações serão salvas permanentemente.`,
      variant: "warning",
      onConfirm: handleEditItem,
    });
  };

  const openEditDialog = (item: BatchItem) => {
    setEditingItem(item);
    setFormData({
      sku: item.sku,
      productName: item.productName,
      quantity: item.quantity.toString(),
      minStock: (item.minStock || 0).toString(),
      expiryDate: item.expiryDate,
      supplier: item.supplier,
      location: item.location,
      unit: item.unit,
      priority: item.priority || "auto",
    });
    setIsEditItemOpen(true);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    const updatedItems = items.filter(item => item.id !== itemToDelete.id);
    saveBatchItems(updatedItems);
    setItems(updatedItems);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
    toast.success("Item excluído com sucesso!");
  };

  const handleDeleteItemWithPin = () => {
    if (!itemToDelete) return;

    requestConfirmation({
      action: "Excluir Produto",
      actionDescription: `⚠️ ATENÇÃO: Você está prestes a EXCLUIR PERMANENTEMENTE o produto "${itemToDelete.productName}" (SKU: ${itemToDelete.sku}). Esta ação NÃO PODE ser desfeita! Todos os dados deste produto serão perdidos.`,
      variant: "danger",
      onConfirm: handleDeleteItem,
    });
  };

  const handleDeleteBatch = () => {
    if (!batchToDelete) return;

    // Contar itens antes de excluir
    const batchItemsCount = items.filter(item => item.batchId === batchToDelete.id).length;

    // Excluir todos os itens do lote
    const updatedItems = items.filter(item => item.batchId !== batchToDelete.id);
    saveBatchItems(updatedItems);
    setItems(updatedItems);

    // Excluir todos os movimentos relacionados aos itens do lote
    const batchItemIds = items
      .filter(item => item.batchId === batchToDelete.id)
      .map(item => item.id);
    const movements = getMovements();
    const updatedMovements = movements.filter(
      movement => !batchItemIds.includes(movement.batchItemId)
    );
    saveMovements(updatedMovements);

    // Excluir o lote
    const updatedBatches = batches.filter(batch => batch.id !== batchToDelete.id);
    saveBatches(updatedBatches);
    setBatches(updatedBatches);

    // Selecionar outro lote se disponível
    if (updatedBatches.length > 0) {
      setSelectedBatch(updatedBatches[0].id);
    } else {
      setSelectedBatch(null);
    }

    setIsDeleteBatchDialogOpen(false);
    toast.success(`${batchToDelete.batchNumber} excluído com sucesso!`);
    
    // Registrar no log de auditoria
    logBatchDelete(batchToDelete.id, batchToDelete.batchNumber, batchItemsCount);
    setBatchToDelete(null);
  };

  const handleDeleteBatchWithPin = () => {
    if (!batchToDelete) return;

    const batchItemsCount = getFilteredBatchItems(batchToDelete.id).length;

    requestConfirmation({
      action: "Excluir Lote Completo",
      actionDescription: `⚠️ ATENÇÃO CRÍTICA: Você está prestes a EXCLUIR PERMANENTEMENTE o lote "${batchToDelete.batchNumber}" contendo ${batchItemsCount} produto(s). Esta ação é IRREVERSÍVEL e todos os dados serão perdidos para sempre!`,
      variant: "danger",
      onConfirm: handleDeleteBatch,
    });
  };

  const openStockOutDialog = (item: BatchItem) => {
    setItemToStockOut(item);
    setStockOutQuantity("");
    setStockOutReason("");
    setIsStockOutOpen(true);
  };

  const handleStockOut = () => {
    if (!itemToStockOut) return;

    const quantity = parseInt(stockOutQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    if (quantity > itemToStockOut.quantity) {
      toast.error("Quantidade maior que o estoque disponível");
      return;
    }

    const currentUser = getCurrentUser();

    // Criar movimento de saída
    const movement: Movement = {
      id: crypto.randomUUID(),
      batchItemId: itemToStockOut.id,
      type: "saida",
      quantity: quantity,
      date: new Date().toISOString(),
      reason: stockOutReason || undefined,
      userId: currentUser?.id,
      userName: currentUser?.name,
      createdAt: new Date().toISOString(),
    };

    const movements = getMovements();
    saveMovements([...movements, movement]);

    // Atualizar quantidade do item
    const updatedItems = items.map(item => {
      if (item.id === itemToStockOut.id) {
        return {
          ...item,
          quantity: item.quantity - quantity,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    saveBatchItems(updatedItems);
    setItems(updatedItems);
    setIsStockOutOpen(false);
    setItemToStockOut(null);
    setStockOutQuantity("");
    setStockOutReason("");
    toast.success("Baixa realizada com sucesso!");
  };

  const handleStockOutWithPin = () => {
    if (!itemToStockOut) return;

    const quantity = parseInt(stockOutQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    if (quantity > itemToStockOut.quantity) {
      toast.error("Quantidade maior que o estoque disponível");
      return;
    }

    requestConfirmation({
      action: "Baixa de Estoque",
      actionDescription: `Você está dando baixa de ${quantity} unidades do produto "${itemToStockOut.productName}". O estoque será reduzido de ${itemToStockOut.quantity} para ${itemToStockOut.quantity - quantity}.`,
      variant: "warning",
      onConfirm: handleStockOut,
    });
  };

  const openStockInDialog = (item: BatchItem) => {
    setItemToStockOut(item);
    setStockInQuantity("");
    setStockInReason("");
    setIsStockInOpen(true);
  };

  const handleStockIn = () => {
    if (!itemToStockOut) return;

    const quantity = parseInt(stockInQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    const currentUser = getCurrentUser();

    // Criar movimento de entrada
    const movement: Movement = {
      id: crypto.randomUUID(),
      batchItemId: itemToStockOut.id,
      type: "entrada",
      quantity: quantity,
      date: new Date().toISOString(),
      observation: stockInReason || undefined,
      userId: currentUser?.id,
      userName: currentUser?.name,
      createdAt: new Date().toISOString(),
    };

    const movements = getMovements();
    saveMovements([...movements, movement]);

    // Atualizar quantidade do item
    const updatedItems = items.map(item => {
      if (item.id === itemToStockOut.id) {
        return {
          ...item,
          quantity: item.quantity + quantity,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    saveBatchItems(updatedItems);
    setItems(updatedItems);
    setIsStockInOpen(false);
    setItemToStockOut(null);
    setStockInQuantity("");
    setStockInReason("");
    toast.success("Entrada realizada com sucesso!");
  };

  const handleStockInWithPin = () => {
    if (!itemToStockOut) return;

    const quantity = parseInt(stockInQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    requestConfirmation({
      action: "Entrada de Estoque",
      actionDescription: `Você está adicionando ${quantity} unidades do produto "${itemToStockOut.productName}". O estoque será aumentado de ${itemToStockOut.quantity} para ${itemToStockOut.quantity + quantity}.`,
      variant: "normal",
      onConfirm: handleStockIn,
    });
  };

  const getStatusBadge = (item: BatchItem) => {
    const status = getItemStatus(item);
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);

    if (status === "expired") {
      return <Badge className="bg-red-600 hover:bg-red-700">Vencido</Badge>;
    } else if (status === "expiring") {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700">
          Vencendo ({daysUntilExpiry}d)
        </Badge>
      );
    }
    return <Badge className="bg-green-600 hover:bg-green-700">OK</Badge>;
  };

  const getStockStatusBadge = (item: BatchItem) => {
    const status = getStockStatus(item);
    
    if (status === "critico") {
      return <Badge className="bg-red-600 hover:bg-red-700">Crítico</Badge>;
    } else if (status === "baixo") {
      return <Badge className="bg-amber-600 hover:bg-amber-700">Baixo</Badge>;
    }
    return <Badge className="bg-green-600 hover:bg-green-700">OK</Badge>;
  };

  const getPriorityBadge = (item: BatchItem) => {
    const priority = getItemPriority(item);
    const isManual = !!item.priority;
    
    if (priority === "A") {
      return (
        <Badge className="bg-red-600 hover:bg-red-700" title={isManual ? "Prioridade manual" : "Prioridade automática"}>
          {isManual ? "🔒 A" : "A"}
        </Badge>
      );
    } else if (priority === "B") {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700" title={isManual ? "Prioridade manual" : "Prioridade automática"}>
          {isManual ? "🔒 B" : "B"}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-600 hover:bg-gray-700" title={isManual ? "Prioridade manual" : "Prioridade automática"}>
        {isManual ? "🔒 C" : "C"}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return (value / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getFilteredBatchItems = (batchId: string) => {
    return items
      .filter(item => item.batchId === batchId)
      .sort((a, b) => {
        // Ordenar por data de validade (PVPS - Primeiro que Vence, Primeiro que Sai)
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
      });
  };

  const getBatchTotalValue = (batchId: string) => {
    const batchItems = getFilteredBatchItems(batchId);
    return batchItems.reduce((total, item) => total + item.quantity * (item.unitPrice || 0), 0);
  };

  if (batches.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Lotes</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerenciamento de lotes por tabs</p>
          </div>
          <Button onClick={handleCreateBatch} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            Novo Lote
          </Button>
        </div>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-12 text-center">
          <PackageMinus size={64} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhum lote cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crie seu primeiro lote para começar a gerenciar os itens.
          </p>
          <Button onClick={handleCreateBatch} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={20} className="mr-2" />
            Criar Primeiro Lote
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Lotes</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerenciamento de lotes por tabs</p>
        </div>
        <Button onClick={handleCreateBatch} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={20} className="mr-2" />
          Novo Lote
        </Button>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6">
        <Tabs value={selectedBatch || batches[0]?.id} onValueChange={setSelectedBatch}>
          <TabsList className="bg-zinc-800 border-b border-zinc-700 mb-6">
            {batches.map((batch) => (
              <TabsTrigger
                key={batch.id}
                value={batch.id}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {batch.batchNumber}
              </TabsTrigger>
            ))}
          </TabsList>

          {batches.map((batch) => {
            const batchItems = getFilteredBatchItems(batch.id);

            return (
              <TabsContent key={batch.id} value={batch.id} className="space-y-4">
                {/* Batch Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white">{batch.batchNumber}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Criado em: {formatDate(batch.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package size={16} />
                        <span>{batchItems.length} itens</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus size={20} className="mr-2" />
                          Adicionar Item
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">
                          Adicionar Item ao {batch.batchNumber}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                          Preencha as informações do produto para adicionar ao lote.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sku" className="text-gray-900 dark:text-white">
                            Código / SKU *
                          </Label>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) =>
                              setFormData({ ...formData, sku: e.target.value })
                            }
                            className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                            placeholder="Ex: PROD001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="productName" className="text-gray-900 dark:text-white">
                            Nome do Produto *
                          </Label>
                          <Input
                            id="productName"
                            value={formData.productName}
                            onChange={(e) =>
                              setFormData({ ...formData, productName: e.target.value })
                            }
                            className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                            placeholder="Ex: Arroz Integral"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-gray-900 dark:text-white">
                            Quantidade *
                          </Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) =>
                              setFormData({ ...formData, quantity: e.target.value })
                            }
                            className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                            placeholder="Ex: 50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="unit" className="text-gray-900 dark:text-white">
                            Unidade *
                          </Label>
                          <Select
                            value={formData.unit}
                            onValueChange={(value) =>
                              setFormData({ ...formData, unit: value as BatchItem["unit"] })
                            }
                          >
                            <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-zinc-700">
                              <SelectValue placeholder="Selecione a unidade" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              {UNIT_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="minStock" className="text-gray-900 dark:text-white">
                            Estoque Mínimo
                          </Label>
                          <Input
                            id="minStock"
                            type="number"
                            value={formData.minStock}
                            onChange={(e) =>
                              setFormData({ ...formData, minStock: e.target.value })
                            }
                            className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                            placeholder="Ex: 10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate" className="text-gray-900 dark:text-white">
                            Validade *
                          </Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              setFormData({ ...formData, expiryDate: e.target.value })
                            }
                            className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supplier" className="text-gray-900 dark:text-white">
                            Fornecedor
                          </Label>
                          <Input
                            id="supplier"
                            value={formData.supplier}
                            onChange={(e) =>
                              setFormData({ ...formData, supplier: e.target.value })
                            }
                            className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                            placeholder="Ex: Fornecedor ABC"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-gray-900 dark:text-white">
                            Localização / Prateleira
                          </Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              setFormData({ ...formData, location: e.target.value })
                            }
                            className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                            placeholder="Ex: A-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-gray-900 dark:text-white">
                            Prioridade Manual
                          </Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) =>
                              setFormData({ ...formData, priority: value as BatchItem["priority"] })
                            }
                          >
                            <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-zinc-700">
                              <SelectValue placeholder="Selecione a prioridade" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem
                                value="auto"
                                className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                              >
                                Automática
                              </SelectItem>
                              <SelectItem
                                value="A"
                                className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                              >
                                A
                              </SelectItem>
                              <SelectItem
                                value="B"
                                className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                              >
                                B
                              </SelectItem>
                              <SelectItem
                                value="C"
                                className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                              >
                                C
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddItemOpen(false)}
                          className="border-zinc-700 bg-zinc-800 text-white hover:!bg-zinc-700 hover:!text-white"
                        >
                          Cancelar
                        </Button>
                        <Button onClick={handleAddItemWithPin} className="bg-blue-600 hover:bg-blue-700">
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBatchToDelete(batch);
                        setIsDeleteBatchDialogOpen(true);
                      }}
                      className="border-red-700 bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                    >
                      <Trash2 size={20} className="mr-2" />
                      Excluir Lote
                    </Button>
                  </div>
                </div>

                {/* Items Table */}
                {batchItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Nenhum item neste lote</p>
                  </div>
                ) : (
                  <div className="border border-zinc-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-zinc-800/50">
                        <TableRow className="hover:bg-zinc-800/50">
                          <TableHead className="text-gray-300">SKU</TableHead>
                          <TableHead className="text-gray-300">Nome</TableHead>
                          <TableHead className="text-gray-300">Qtd</TableHead>
                          <TableHead className="text-gray-300">Validade</TableHead>
                          <TableHead className="text-gray-300">Fornecedor</TableHead>
                          <TableHead className="text-gray-300">Localização</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchItems.map((item) => (
                          <TableRow 
                            key={item.id} 
                            className="hover:bg-zinc-800/30 cursor-pointer"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsDetailsModalOpen(true);
                            }}
                          >
                            <TableCell className="text-white font-mono">{item.sku}</TableCell>
                            <TableCell className="text-gray-900 dark:text-white">{item.productName}</TableCell>
                            <TableCell className="text-gray-900 dark:text-white">{item.quantity} {item.unit}</TableCell>
                            <TableCell className="text-gray-900 dark:text-white">{formatDate(item.expiryDate)}</TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">{item.supplier || "-"}</TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">{item.location || "-"}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {getStatusBadge(item)}
                                {getStockStatusBadge(item)}
                                {getPriorityBadge(item)}
                              </div>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(item)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-950"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openStockOutDialog(item)}
                                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-950"
                                >
                                  <PackageMinus size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openStockInDialog(item)}
                                  className="text-green-400 hover:text-green-300 hover:bg-green-950"
                                >
                                  <PackagePlus size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setItemToDelete(item);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </Card>

      {/* Edit Item Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Editar Item</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Modifique as informações do produto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sku" className="text-gray-900 dark:text-white">
                Código / SKU *
              </Label>
              <Input
                id="edit-sku"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-productName" className="text-gray-900 dark:text-white">
                Nome do Produto *
              </Label>
              <Input
                id="edit-productName"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quantity" className="text-gray-900 dark:text-white">
                Quantidade *
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-unit" className="text-gray-900 dark:text-white">
                Unidade *
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value as BatchItem["unit"] })
                }
              >
                <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-zinc-700">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {UNIT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-minStock" className="text-gray-900 dark:text-white">
                Estoque Mínimo
              </Label>
              <Input
                id="edit-minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expiryDate" className="text-gray-900 dark:text-white">
                Validade *
              </Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplier" className="text-gray-900 dark:text-white">
                Fornecedor
              </Label>
              <Input
                id="edit-supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location" className="text-gray-900 dark:text-white">
                Localização / Prateleira
              </Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority" className="text-gray-900 dark:text-white">
                Prioridade Manual
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as BatchItem["priority"] })
                }
              >
                <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white hover:bg-zinc-700">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem
                    value="auto"
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    Automática
                  </SelectItem>
                  <SelectItem
                    value="A"
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    A
                  </SelectItem>
                  <SelectItem
                    value="B"
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    B
                  </SelectItem>
                  <SelectItem
                    value="C"
                    className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                  >
                    C
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditItemOpen(false)}
              className="border-zinc-700 bg-zinc-800 text-white hover:!bg-zinc-700 hover:!text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleEditItemWithPin} className="bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={isStockOutOpen} onOpenChange={setIsStockOutOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Baixa de Estoque</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Registre a saída de produtos do estoque.
            </DialogDescription>
          </DialogHeader>
          {itemToStockOut && (
            <div className="space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Produto</p>
                <p className="text-white font-semibold">{itemToStockOut.productName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Estoque disponível</p>
                <p className="text-white font-bold text-xl">{itemToStockOut.quantity}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockOutQty" className="text-gray-900 dark:text-white">
                  Quantidade para baixa *
                </Label>
                <Input
                  id="stockOutQty"
                  type="number"
                  value={stockOutQuantity}
                  onChange={(e) => setStockOutQuantity(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Ex: 10"
                  max={itemToStockOut.quantity}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockOutReason" className="text-gray-900 dark:text-white">
                  Motivo (opcional)
                </Label>
                <Textarea
                  id="stockOutReason"
                  value={stockOutReason}
                  onChange={(e) => setStockOutReason(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Venda, Perda, Uso interno..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStockOutOpen(false)}
              className="border-zinc-700 bg-zinc-800 text-white hover:!bg-zinc-700 hover:!text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleStockOutWithPin} className="bg-amber-600 hover:bg-amber-700">
              Confirmar Baixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock In Dialog */}
      <Dialog open={isStockInOpen} onOpenChange={setIsStockInOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Entrada de Estoque</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Registre a entrada de produtos no estoque.
            </DialogDescription>
          </DialogHeader>
          {itemToStockOut && (
            <div className="space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Produto</p>
                <p className="text-white font-semibold">{itemToStockOut.productName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Estoque disponível</p>
                <p className="text-white font-bold text-xl">{itemToStockOut.quantity}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockInQty" className="text-gray-900 dark:text-white">
                  Quantidade para entrada *
                </Label>
                <Input
                  id="stockInQty"
                  type="number"
                  value={stockInQuantity}
                  onChange={(e) => setStockInQuantity(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Ex: 10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockInReason" className="text-gray-900 dark:text-white">
                  Motivo (opcional)
                </Label>
                <Textarea
                  id="stockInReason"
                  value={stockInReason}
                  onChange={(e) => setStockInReason(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Compra, Retorno, Ajuste..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStockInOpen(false)}
              className="border-zinc-700 bg-zinc-800 text-white hover:!bg-zinc-700 hover:!text-white"
            >
              Cancelar
            </Button>
            <Button onClick={handleStockInWithPin} className="bg-green-600 hover:bg-green-700">
              Confirmar Entrada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir o item "{itemToDelete?.productName}"? Esta ação não pode ser desfeita.
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
              onClick={handleDeleteItemWithPin}
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
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Batch Confirmation Dialog */}
      <AlertDialog open={isDeleteBatchDialogOpen} onOpenChange={setIsDeleteBatchDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Confirmar Exclusão do Lote</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir o lote "{batchToDelete?.batchNumber}"?
              Todos os {getFilteredBatchItems(batchToDelete?.id || "").length} itens deste lote também serão excluídos.
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
              onClick={handleDeleteBatchWithPin}
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
              Excluir Lote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        item={selectedItem}
        onEdit={openEditDialog}
        onStockOut={openStockOutDialog}
        onStockIn={openStockInDialog}
        onDelete={(item) => {
          setItemToDelete(item);
          setIsDeleteDialogOpen(true);
        }}
      />
      <PinConfirmationDialog />
    </div>
  );
}