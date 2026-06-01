import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Edit, PackageMinus, PackagePlus, Trash2 } from "lucide-react";
import { BatchItem, getItemStatus, getDaysUntilExpiry, getBatches, getRecentMovementsByItemId } from "../utils/storage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface ProductDetailsModalProps {
  item: BatchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: BatchItem) => void;
  onStockOut?: (item: BatchItem) => void;
  onStockIn?: (item: BatchItem) => void;
  onDelete?: (item: BatchItem) => void;
}

export default function ProductDetailsModal({
  item,
  isOpen,
  onClose,
  onEdit,
  onStockOut,
  onStockIn,
  onDelete,
}: ProductDetailsModalProps) {
  if (!item) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (item: BatchItem) => {
    const status = getItemStatus(item);
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);

    if (status === "expired") {
      return <Badge className="bg-red-600 hover:bg-red-700 text-white">Vencido</Badge>;
    } else if (status === "expiring") {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
          Vencendo ({daysUntilExpiry}d)
        </Badge>
      );
    }
    return <Badge className="bg-green-600 hover:bg-green-700 text-white">OK</Badge>;
  };

  const getBatchName = () => {
    const batches = getBatches();
    const batch = batches.find(b => b.id === item.batchId);
    return batch?.batchNumber || "-";
  };

  const getRecentMovements = () => {
    const movements = getRecentMovementsByItemId(item.id);
    return movements;
  };

  const recentMovements = getRecentMovements();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Detalhes do Produto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 pb-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Código / SKU</p>
              <p className="text-lg font-mono font-semibold text-white">{item.sku}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Nome do Produto</p>
              <p className="text-lg font-semibold text-white">{item.productName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Lote</p>
              <Badge className="bg-blue-900/50 text-blue-300 border border-blue-700">
                {getBatchName()}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              {getStatusBadge(item)}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Quantidade</p>
              <p className="text-base text-white font-semibold">{item.quantity} unidades</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Data de Validade</p>
              <p className="text-base text-white">{formatDate(item.expiryDate)}</p>
              {getDaysUntilExpiry(item.expiryDate) >= 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ({getDaysUntilExpiry(item.expiryDate)} dias restantes)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Fornecedor</p>
              <p className="text-base text-white">{item.supplier || "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Localização / Prateleira</p>
              <p className="text-base text-white">{item.location || "-"}</p>
            </div>
          </div>

          {/* Divider */}
          {(onEdit || onStockOut || onStockIn || onDelete) && <div className="border-t border-zinc-800" />}

          {/* Action Buttons */}
          {(onEdit || onStockOut || onStockIn || onDelete) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {onEdit && (
                <Button
                  onClick={() => {
                    onEdit(item);
                    onClose();
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit size={18} className="mr-2" />
                  Editar Produto
                </Button>
              )}
              {onStockOut && (
                <Button
                  onClick={() => {
                    onStockOut(item);
                    onClose();
                  }}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <PackageMinus size={18} className="mr-2" />
                  Registrar Baixa
                </Button>
              )}
              {onStockIn && (
                <Button
                  onClick={() => {
                    onStockIn(item);
                    onClose();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <PackagePlus size={18} className="mr-2" />
                  Registrar Entrada
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={() => {
                    onDelete(item);
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-950 hover:text-red-300"
                >
                  <Trash2 size={18} className="mr-2" />
                  Excluir
                </Button>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-zinc-800" />

          {/* Recent Movements */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white">Histórico do Item</h3>
            {recentMovements.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">Nenhum movimento registrado</p>
            ) : (
              <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-800/50">
                    <TableRow className="hover:bg-zinc-800/50">
                      <TableHead className="text-gray-300">Data</TableHead>
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMovements.map((movement, index) => (
                      <TableRow key={`${movement.id}-${index}`} className="hover:bg-zinc-800/30">
                        <TableCell className="text-gray-900 dark:text-white">{formatDate(movement.date)}</TableCell>
                        <TableCell>
                          {movement.type === "entrada" ? (
                            <Badge className="bg-green-600 hover:bg-green-700">Entrada</Badge>
                          ) : (
                            <Badge className="bg-red-600 hover:bg-red-700">Saída</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          {movement.type === "entrada" ? "+" : "-"}{movement.quantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ProductDetailsModal };