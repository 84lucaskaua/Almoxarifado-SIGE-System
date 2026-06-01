import { useState, useEffect } from "react";
import { Card } from "./ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { FileDown, Filter, Calendar, FileSpreadsheet, FileText } from "lucide-react";
import {
  getBatches,
  getBatchItems,
  BatchItem,
  Batch,
  getItemStatus,
  getDaysUntilExpiry,
  getStockStatus,
} from "../utils/storage";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function Relatorios() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BatchItem[]>([]);
  
  const [filters, setFilters] = useState({
    batchId: "all",
    startDate: "",
    endDate: "",
    expiryDays: "all", // all, 3, 5, 7, 14, 30
    search: "",
  });

  useEffect(() => {
    loadData();
  }, []);

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

  useEffect(() => {
    applyFilters();
  }, [items, filters]);

  const loadData = () => {
    const loadedBatches = getBatches();
    const loadedItems = getBatchItems();
    setBatches(loadedBatches);
    setItems(loadedItems);
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Filter by batch
    if (filters.batchId !== "all") {
      filtered = filtered.filter(item => item.batchId === filters.batchId);
    }

    // Filter by date range (creation date)
    if (filters.startDate) {
      filtered = filtered.filter(
        item => new Date(item.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        item => new Date(item.createdAt) <= new Date(filters.endDate)
      );
    }

    // Filter by expiry days
    if (filters.expiryDays !== "all") {
      const days = parseInt(filters.expiryDays);
      filtered = filtered.filter(item => {
        const daysUntil = getDaysUntilExpiry(item.expiryDate);
        return daysUntil >= 0 && daysUntil <= days;
      });
    }

    // Filter by search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.sku.toLowerCase().includes(search) ||
          item.productName.toLowerCase().includes(search) ||
          item.supplier.toLowerCase().includes(search) ||
          item.location.toLowerCase().includes(search)
      );
    }

    setFilteredItems(filtered);
  };

  const exportToCSV = () => {
    if (filteredItems.length === 0) {
      toast.error("Nenhum item para exportar");
      return;
    }

    const batchMap = new Map(batches.map(b => [b.id, b.batchNumber]));
    
    const headers = [
      "Lote",
      "SKU",
      "Produto",
      "Quantidade",
      "Unidade",
      "Estoque Mínimo",
      "Validade",
      "Fornecedor",
      "Localização",
      "Dias até Vencimento",
      "Status Validade",
      "Status Estoque",
    ];

    const rows = filteredItems.map(item => {
      const daysUntil = getDaysUntilExpiry(item.expiryDate);
      const status = getItemStatus(item);
      const statusText = status === "expired" ? "Vencido" : status === "expiring" ? "Vencendo" : "OK";
      const stockStatus = getStockStatus(item);
      const stockStatusText = stockStatus === "critico" ? "Crítico" : stockStatus === "baixo" ? "Baixo" : "OK";
      
      return [
        batchMap.get(item.batchId) || "",
        item.sku,
        item.productName,
        item.quantity,
        item.unit || "UN",
        item.minStock || 0,
        new Date(item.expiryDate).toLocaleDateString("pt-BR"),
        item.supplier,
        item.location,
        daysUntil,
        statusText,
        stockStatusText,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_estoque_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório CSV exportado com sucesso!");
  };

  const exportToExcel = () => {
    if (filteredItems.length === 0) {
      toast.error("Nenhum item para exportar");
      return;
    }

    const batchMap = new Map(batches.map(b => [b.id, b.batchNumber]));
    
    const data = filteredItems.map(item => {
      const daysUntil = getDaysUntilExpiry(item.expiryDate);
      const status = getItemStatus(item);
      const statusText = status === "expired" ? "Vencido" : status === "expiring" ? "Vencendo" : "OK";
      const stockStatus = getStockStatus(item);
      const stockStatusText = stockStatus === "critico" ? "Crítico" : stockStatus === "baixo" ? "Baixo" : "OK";
      
      return {
        "Lote": batchMap.get(item.batchId) || "",
        "SKU": item.sku,
        "Produto": item.productName,
        "Quantidade": item.quantity,
        "Unidade": item.unit || "UN",
        "Estoque Mínimo": item.minStock || 0,
        "Validade": new Date(item.expiryDate).toLocaleDateString("pt-BR"),
        "Fornecedor": item.supplier,
        "Localização": item.location,
        "Dias até Vencimento": daysUntil,
        "Status Validade": statusText,
        "Status Estoque": stockStatusText,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Estoque");

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 12 }, // Lote
      { wch: 12 }, // SKU
      { wch: 30 }, // Produto
      { wch: 12 }, // Quantidade
      { wch: 12 }, // Unidade
      { wch: 12 }, // Estoque Mínimo
      { wch: 12 }, // Validade
      { wch: 20 }, // Fornecedor
      { wch: 20 }, // Localização
      { wch: 20 }, // Dias até Vencimento
      { wch: 12 }, // Status Validade
      { wch: 12 }, // Status Estoque
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `relatorio_estoque_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast.success("Relatório Excel exportado com sucesso!");
  };

  const exportToPDF = () => {
    if (filteredItems.length === 0) {
      toast.error("Nenhum item para exportar");
      return;
    }

    const batchMap = new Map(batches.map(b => [b.id, b.batchNumber]));
    
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Título
    doc.setFontSize(16);
    doc.text("SIGE - Relatório de Estoque", 14, 15);
    
    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 22);
    
    // Resumo
    doc.setFontSize(11);
    doc.text(`Total de Itens: ${filteredItems.length}`, 14, 30);
    doc.text(`Itens Vencendo: ${filteredItems.filter(item => getItemStatus(item) === "expiring").length}`, 100, 30);
    doc.text(`Itens Vencidos: ${filteredItems.filter(item => getItemStatus(item) === "expired").length}`, 180, 30);
    
    // Tabela
    const headers = [[
      "Lote",
      "SKU",
      "Produto",
      "Qtd",
      "Unidade",
      "Est. Min",
      "Validade",
      "Status Val.",
      "Status Est."
    ]];
    
    const data = filteredItems.map(item => {
      const daysUntil = getDaysUntilExpiry(item.expiryDate);
      const status = getItemStatus(item);
      const statusText = status === "expired" ? "Vencido" : status === "expiring" ? `Venc. ${daysUntil}d` : "OK";
      const stockStatus = getStockStatus(item);
      const stockStatusText = stockStatus === "critico" ? "Crítico" : stockStatus === "baixo" ? "Baixo" : "OK";
      
      return [
        batchMap.get(item.batchId) || "",
        item.sku,
        item.productName,
        item.quantity.toString(),
        item.unit || "UN",
        (item.minStock || 0).toString(),
        new Date(item.expiryDate).toLocaleDateString("pt-BR"),
        statusText,
        stockStatusText,
      ];
    });

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 36,
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      headStyles: {
        fillColor: [37, 99, 235], // Azul
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 10, right: 10 },
    });

    doc.save(`relatorio_estoque_${new Date().toISOString().split("T")[0]}.pdf`);

    toast.success("Relatório PDF exportado com sucesso!");
  };

  const clearFilters = () => {
    setFilters({
      batchId: "all",
      startDate: "",
      endDate: "",
      expiryDays: "all",
      search: "",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Relatórios</h1>
        <p className="text-gray-600 dark:text-gray-400">Filtros, visualização e exportação de dados</p>
      </div>

      {/* Filters Card */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-white">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Lote</Label>
            <Select
              value={filters.batchId}
              onValueChange={(value) =>
                setFilters({ ...filters, batchId: value })
              }
            >
              <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Todos os lotes</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batchNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Vencimento em até</Label>
            <Select
              value={filters.expiryDays}
              onValueChange={(value) =>
                setFilters({ ...filters, expiryDays: value })
              }
            >
              <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="3">3 dias</SelectItem>
                <SelectItem value="5">5 dias</SelectItem>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="14">14 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Buscar</Label>
            <Input
              placeholder="SKU, produto, fornecedor..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Data Inicial</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-900 dark:text-white">Data Final</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-zinc-800">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="border-zinc-700 bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white"
          >
            Limpar Filtros
          </Button>
          <div className="flex-1"></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={exportToCSV}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileDown size={20} className="mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700"
            >
              <FileSpreadsheet size={20} className="mr-2" />
              Exportar Excel
            </Button>
            <Button
              onClick={exportToPDF}
              className="bg-red-600 hover:bg-red-700"
            >
              <FileText size={20} className="mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Itens Filtrados</p>
          <p className="text-2xl font-bold text-white">{filteredItems.length}</p>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Itens Vencendo</p>
          <p className="text-2xl font-bold text-amber-500">
            {filteredItems.filter(item => getItemStatus(item) === "expiring").length}
          </p>
        </Card>
        <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Itens Vencidos</p>
          <p className="text-2xl font-bold text-red-500">
            {filteredItems.filter(item => getItemStatus(item) === "expired").length}
          </p>
        </Card>
      </div>

      {/* Results Table */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Resultados ({filteredItems.length} itens)
          </h2>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum item encontrado com os filtros aplicados</p>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-800/50">
                <TableRow className="hover:bg-zinc-800/50">
                  <TableHead className="text-gray-300">Lote</TableHead>
                  <TableHead className="text-gray-300">SKU</TableHead>
                  <TableHead className="text-gray-300">Produto</TableHead>
                  <TableHead className="text-gray-300">Qtd</TableHead>
                  <TableHead className="text-gray-300">Validade</TableHead>
                  <TableHead className="text-gray-300">Fornecedor</TableHead>
                  <TableHead className="text-gray-300">Localização</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const batch = batches.find(b => b.id === item.batchId);
                  return (
                    <TableRow key={item.id} className="hover:bg-zinc-800/30">
                      <TableCell className="text-gray-900 dark:text-white">
                        <Badge className="bg-blue-900/50 text-blue-300 border border-blue-700">
                          {batch?.batchNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white font-mono">{item.sku}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{item.productName}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{item.quantity}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{formatDate(item.expiryDate)}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{item.supplier || "-"}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{item.location || "-"}</TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
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