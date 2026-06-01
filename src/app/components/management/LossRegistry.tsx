import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Card } from "../ui/card";
import { Trash2, AlertTriangle, Plus, Calendar } from "lucide-react";
import { getBatchItems, saveBatchItems, type BatchItem } from "../../utils/storage";
import { createLoss, getLosses, type Loss, type LossReason } from "../../utils/storageExtended";
import { toast } from "sonner";

const LOSS_REASONS: { value: LossReason; label: string }[] = [
  { value: "expiry", label: "Vencimento" },
  { value: "damage", label: "Quebra/Avaria" },
  { value: "theft", label: "Furto" },
  { value: "other", label: "Outro" },
];

export function LossRegistry() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [losses, setLosses] = useState<Loss[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BatchItem | null>(null);
  const [formData, setFormData] = useState({
    quantity: 0,
    reason: "expiry" as LossReason,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(getBatchItems());
    setLosses(getLosses());
  };

  const handleOpenDialog = (item: BatchItem) => {
    setSelectedItem(item);
    setFormData({
      quantity: 0,
      reason: "expiry",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const handleRegisterLoss = () => {
    if (!selectedItem) return;

    if (formData.quantity <= 0 || formData.quantity > selectedItem.quantity) {
      toast.error("Quantidade inválida");
      return;
    }

    // Criar registro de perda
    createLoss({
      batchItemId: selectedItem.id,
      productName: selectedItem.productName,
      sku: selectedItem.sku,
      quantity: formData.quantity,
      unit: selectedItem.unit,
      reason: formData.reason,
      notes: formData.notes,
    });

    // Atualizar quantidade do item
    const updatedItems = items.map((item) =>
      item.id === selectedItem.id
        ? { ...item, quantity: item.quantity - formData.quantity }
        : item
    );
    saveBatchItems(updatedItems);

    toast.success("Perda registrada com sucesso!");
    setIsDialogOpen(false);
    loadData();
  };

  const getReasonLabel = (reason: LossReason): string => {
    return LOSS_REASONS.find((r) => r.value === reason)?.label || reason;
  };

  const getReasonColor = (reason: LossReason): string => {
    switch (reason) {
      case "expiry":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "damage":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "theft":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  const totalLosses = losses.reduce((sum, loss) => sum + loss.quantity, 0);
  const lossesThisMonth = losses.filter((loss) => {
    const lossDate = new Date(loss.createdAt);
    const now = new Date();
    return (
      lossDate.getMonth() === now.getMonth() && lossDate.getFullYear() === now.getFullYear()
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro de Perdas</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Controle de perdas por vencimento, quebra, furto e outros motivos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Perdas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{losses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Trash2 size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Unidades Perdidas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLosses}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Este Mês</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {lossesThisMonth.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Products List */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Registrar Nova Perda
        </h3>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum item no estoque
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {item.productName}
                  </h4>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>SKU: {item.sku}</span>
                    <span>Estoque: {item.quantity} {item.unit}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenDialog(item)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 size={16} className="mr-2" />
                  Registrar Perda
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recent Losses */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Perdas Recentes
        </h3>
        <div className="space-y-3">
          {losses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhuma perda registrada
            </div>
          ) : (
            losses.slice(0, 10).map((loss) => (
              <div
                key={loss.id}
                className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {loss.productName}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getReasonColor(loss.reason)}`}>
                        {getReasonLabel(loss.reason)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">SKU</p>
                        <p className="text-gray-900 dark:text-white font-mono">{loss.sku}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Quantidade Perdida</p>
                        <p className="text-gray-900 dark:text-white font-bold">
                          {loss.quantity} {loss.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Data</p>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(loss.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Motivo</p>
                        <p className="text-gray-900 dark:text-white">{getReasonLabel(loss.reason)}</p>
                      </div>
                    </div>
                    {loss.notes && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">Observações:</p>
                        <p className="text-gray-900 dark:text-white italic">{loss.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Loss Registration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              Registrar Perda - {selectedItem?.productName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Estoque Atual: <strong>{selectedItem?.quantity} {selectedItem?.unit}</strong>
              </p>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-gray-700 dark:text-gray-300">
                Quantidade Perdida *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={selectedItem?.quantity}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                }
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Motivo *</Label>
              <Select
                value={formData.reason}
                onValueChange={(value: LossReason) =>
                  setFormData({ ...formData, reason: value })
                }
              >
                <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOSS_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalhes sobre a perda..."
                rows={3}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRegisterLoss}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={formData.quantity <= 0 || formData.quantity > (selectedItem?.quantity || 0)}
            >
              <Trash2 size={16} className="mr-2" />
              Registrar Perda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
