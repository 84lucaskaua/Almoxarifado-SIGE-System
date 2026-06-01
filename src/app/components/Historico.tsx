import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { Download, Search, ArrowUpDown, FileSpreadsheet, FileText } from "lucide-react";
import { 
  getMovements, 
  getBatchItems, 
  getBatches,
  Movement,
  BatchItem,
  Batch
} from "../utils/storage";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Historico() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("todos");
  const [filterBatch, setFilterBatch] = useState<string>("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadData();
  }, []);

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

  useEffect(() => {
    applyFilters();
  }, [movements, searchTerm, filterType, filterBatch, dateFrom, dateTo, sortOrder]);

  const loadData = () => {
    const loadedMovements = getMovements();
    const loadedItems = getBatchItems();
    const loadedBatches = getBatches();
    setMovements(loadedMovements);
    setBatchItems(loadedItems);
    setBatches(loadedBatches);
  };

  const getItemById = (itemId: string) => {
    return batchItems.find(item => item.id === itemId);
  };

  const getBatchById = (batchId: string) => {
    return batches.find(batch => batch.id === batchId);
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Filter by search term (product name or SKU)
    if (searchTerm) {
      filtered = filtered.filter(movement => {
        const item = getItemById(movement.batchItemId);
        if (!item) return false;
        return (
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by type
    if (filterType !== "todos") {
      filtered = filtered.filter(movement => movement.type === filterType);
    }

    // Filter by batch
    if (filterBatch !== "todos") {
      filtered = filtered.filter(movement => {
        const item = getItemById(movement.batchItemId);
        return item?.batchId === filterBatch;
      });
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(movement => {
        const movementDate = new Date(movement.date);
        movementDate.setHours(0, 0, 0, 0);
        return movementDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(movement => {
        const movementDate = new Date(movement.date);
        return movementDate <= toDate;
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredMovements(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  const exportToCSV = () => {
    if (filteredMovements.length === 0) {
      toast.error("Nenhum registro para exportar");
      return;
    }

    const headers = ["Data", "Produto", "SKU", "Lote", "Tipo", "Quantidade", "Fornecedor/Motivo", "Usuário"];
    const rows = filteredMovements.map(movement => {
      const item = getItemById(movement.batchItemId);
      const batch = item ? getBatchById(item.batchId) : null;
      
      return [
        formatDate(movement.date),
        item?.productName || "-",
        item?.sku || "-",
        batch?.batchNumber || "-",
        movement.type === "entrada" ? "Entrada" : "Saída",
        movement.quantity.toString(),
        movement.type === "entrada" ? (movement.supplier || "-") : (movement.reason || "-"),
        movement.userName || "-"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historico-movimentacoes-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Relatório exportado com sucesso!");
  };

  const exportToPDF = () => {
    if (filteredMovements.length === 0) {
      toast.error("Nenhum registro para exportar");
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const headers = ["Data", "Produto", "SKU", "Lote", "Tipo", "Qtd", "Forn./Motivo", "Usuário"];
    const rows = filteredMovements.map(movement => {
      const item = getItemById(movement.batchItemId);
      const batch = item ? getBatchById(item.batchId) : null;
      
      return [
        formatDate(movement.date),
        item?.productName || "-",
        item?.sku || "-",
        batch?.batchNumber || "-",
        movement.type === "entrada" ? "Entrada" : "Saída",
        movement.quantity.toString(),
        movement.type === "entrada" ? (movement.supplier || "-") : (movement.reason || "-"),
        movement.userName || "-"
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 20,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 15 },
    });

    doc.text("Histórico de Movimentações - SIGE", 14, 15);
    doc.save(`historico-movimentacoes-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Relatório exportado com sucesso!");
  };

  const exportToExcel = () => {
    if (filteredMovements.length === 0) {
      toast.error("Nenhum registro para exportar");
      return;
    }

    const headers = ["Data", "Produto", "SKU", "Lote", "Tipo", "Quantidade", "Fornecedor/Motivo", "Usuário"];
    const rows = filteredMovements.map(movement => {
      const item = getItemById(movement.batchItemId);
      const batch = item ? getBatchById(item.batchId) : null;
      
      return [
        formatDate(movement.date),
        item?.productName || "-",
        item?.sku || "-",
        batch?.batchNumber || "-",
        movement.type === "entrada" ? "Entrada" : "Saída",
        movement.quantity.toString(),
        movement.type === "entrada" ? (movement.supplier || "-") : (movement.reason || "-"),
        movement.userName || "-"
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimentações");
    XLSX.writeFile(workbook, `historico-movimentacoes-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success("Relatório exportado com sucesso!");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("todos");
    setFilterBatch("todos");
    setDateFrom("");
    setDateTo("");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Histórico de Movimentações</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize todas as entradas e saídas de estoque</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportToCSV} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={filteredMovements.length === 0}
          >
            <Download size={20} className="mr-2" />
            Exportar CSV
          </Button>
          <Button 
            onClick={exportToExcel} 
            className="bg-green-600 hover:bg-green-700"
            disabled={filteredMovements.length === 0}
          >
            <FileSpreadsheet size={20} className="mr-2" />
            Exportar Excel
          </Button>
          <Button 
            onClick={exportToPDF} 
            className="bg-red-600 hover:bg-red-700"
            disabled={filteredMovements.length === 0}
          >
            <FileText size={20} className="mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2 lg:col-span-2">
            <Label className="text-gray-900 dark:text-white">Buscar Produto</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou SKU do produto..."
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Tipo</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
                <SelectItem value="todos" className="text-gray-900 dark:text-white">Todos</SelectItem>
                <SelectItem value="entrada" className="text-gray-900 dark:text-white">Entrada</SelectItem>
                <SelectItem value="saida" className="text-gray-900 dark:text-white">Saída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Batch Filter */}
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Lote</Label>
            <Select value={filterBatch} onValueChange={setFilterBatch}>
              <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
                <SelectItem value="todos" className="text-gray-900 dark:text-white">Todos os Lotes</SelectItem>
                {batches.map(batch => (
                  <SelectItem key={batch.id} value={batch.id} className="text-gray-900 dark:text-white">
                    {batch.batchNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Data Inicial</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Data Final</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="space-y-2 lg:col-span-2 flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{filteredMovements.length} movimentação(ões) encontrada(s)</span>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <p>Nenhuma movimentação encontrada</p>
          </div>
        ) : (
          <div className="border border-gray-300 dark:border-zinc-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-zinc-800/50">
                <TableRow className="hover:bg-gray-100 dark:hover:bg-zinc-800/50">
                  <TableHead className="text-gray-700 dark:text-gray-300">
                    <button
                      onClick={toggleSortOrder}
                      className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Data
                      <ArrowUpDown size={14} />
                    </button>
                  </TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Produto</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">SKU</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Lote</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Tipo</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Quantidade</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Fornecedor/Motivo</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map((movement) => {
                  const item = getItemById(movement.batchItemId);
                  const batch = item ? getBatchById(item.batchId) : null;

                  return (
                    <TableRow key={movement.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                      <TableCell className="text-gray-900 dark:text-white">{formatDate(movement.date)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{item?.productName || "-"}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-mono">{item?.sku || "-"}</TableCell>
                      <TableCell>
                        {batch ? (
                          <Badge className="bg-blue-900/50 text-blue-300 border border-blue-700">
                            {batch.batchNumber}
                          </Badge>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {movement.type === "entrada" ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Entrada</Badge>
                        ) : (
                          <Badge className="bg-red-600 hover:bg-red-700">Saída</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white font-semibold">
                        {movement.type === "entrada" ? "+" : "-"}{movement.quantity}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {movement.type === "entrada"
                          ? (movement.supplier || "-")
                          : (movement.reason || "-")
                        }
                        {movement.observation && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{movement.observation}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{movement.userName || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}