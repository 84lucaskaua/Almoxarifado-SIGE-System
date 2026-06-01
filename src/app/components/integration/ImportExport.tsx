import { useState, useRef } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Download,
  Upload,
  Database,
  FileText,
  CheckCircle,
  AlertCircle,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBatches,
  getBatchItems,
  getMovements,
  getProducts,
  getUsers,
  saveBatches,
  saveBatchItems,
  saveMovements,
  saveProducts,
  type Product,
  type BatchItem,
} from "../../utils/storage";
import { exportAllData, importAllData, getExtendedProducts, saveExtendedProducts, type ExtendedProduct } from "../../utils/storageExtended";

export function ImportExport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Exportar todos os dados do sistema
  const handleExportAll = () => {
    try {
      const allData = exportAllData();
      const blob = new Blob([allData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sige_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup completo exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error(error);
    }
  };

  // Exportar produtos para CSV
  const handleExportProductsCSV = () => {
    try {
      const products = getExtendedProducts();
      const items = getBatchItems();

      // Criar CSV com produtos e estoque
      const headers = [
        "SKU",
        "Nome",
        "Descrição",
        "Categoria",
        "Unidade",
        "Estoque Mínimo",
        "Estoque Atual",
        "Tags",
      ];

      const rows = products.map((product) => {
        const currentStock = items
          .filter((item) => item.sku === product.code)
          .reduce((sum, item) => sum + item.quantity, 0);

        return [
          product.code,
          product.name,
          product.description || "",
          product.category || "",
          product.unitType,
          product.minStockQuantity,
          currentStock,
          (product.tags || []).join(";"),
        ];
      });

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `produtos_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Produtos exportados para CSV!");
    } catch (error) {
      toast.error("Erro ao exportar produtos");
      console.error(error);
    }
  };

  // Exportar movimentações para CSV
  const handleExportMovementsCSV = () => {
    try {
      const movements = getMovements();
      const items = getBatchItems();

      const headers = [
        "Data",
        "Tipo",
        "Produto",
        "SKU",
        "Quantidade",
        "Unidade",
        "Lote",
        "Motivo",
      ];

      const rows = movements.map((movement) => {
        const item = items.find((i) => i.id === movement.batchItemId);
        return [
          new Date(movement.date).toLocaleDateString("pt-BR"),
          movement.type === "entrada" ? "Entrada" : "Saída",
          item?.productName || "-",
          item?.sku || "-",
          movement.quantity,
          item?.unit || "-",
          movement.batchId,
          movement.reason || "-",
        ];
      });

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `movimentacoes_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Movimentações exportadas para CSV!");
    } catch (error) {
      toast.error("Erro ao exportar movimentações");
      console.error(error);
    }
  };

  // Importar produtos de CSV
  const handleImportProductsCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResults(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

      const errors: string[] = [];
      let successCount = 0;

      const products = getExtendedProducts();
      const newProducts: ExtendedProduct[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim());
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          // Validar campos obrigatórios
          if (!row.SKU || !row.Nome) {
            errors.push(`Linha ${i + 1}: SKU e Nome são obrigatórios`);
            continue;
          }

          // Verificar se já existe
          const exists = products.some((p) => p.code === row.SKU);
          if (exists) {
            errors.push(`Linha ${i + 1}: Produto ${row.SKU} já existe`);
            continue;
          }

          const newProduct: ExtendedProduct = {
            id: crypto.randomUUID(),
            code: row.SKU,
            name: row.Nome,
            description: row["Descrição"] || row.Descricao || "",
            category: row.Categoria || "",
            unitType: row.Unidade || "UN",
            minStockQuantity: parseInt(row["Estoque Mínimo"] || row["Estoque Minimo"] || "0") || 0,
            tags: row.Tags ? row.Tags.split(";").filter((t) => t.trim()) : [],
            alertDays: 30,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          newProducts.push(newProduct);
          successCount++;
        } catch (error) {
          errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
      }

      // Salvar produtos importados
      if (newProducts.length > 0) {
        saveExtendedProducts([...products, ...newProducts]);
      }

      setImportResults({ success: successCount, errors });

      if (successCount > 0) {
        toast.success(`${successCount} produto(s) importado(s) com sucesso!`);
      }
      if (errors.length > 0) {
        toast.warning(`${errors.length} erro(s) encontrado(s)`);
      }
    } catch (error) {
      toast.error("Erro ao importar arquivo CSV");
      console.error(error);
    } finally {
      setIsImporting(false);
      if (csvInputRef.current) {
        csvInputRef.current.value = "";
      }
    }
  };

  // Restaurar backup completo
  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm("⚠️ ATENÇÃO: Restaurar backup irá SUBSTITUIR todos os dados atuais. Deseja continuar?")) {
      if (backupInputRef.current) {
        backupInputRef.current.value = "";
      }
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const success = importAllData(text);

      if (success) {
        toast.success("Backup restaurado com sucesso! Recarregando...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Erro ao restaurar backup. Arquivo inválido.");
      }
    } catch (error) {
      toast.error("Erro ao ler arquivo de backup");
      console.error(error);
    } finally {
      setIsImporting(false);
      if (backupInputRef.current) {
        backupInputRef.current.value = "";
      }
    }
  };

  // Baixar template CSV
  const handleDownloadTemplate = () => {
    const headers = ["SKU", "Nome", "Descrição", "Categoria", "Unidade", "Estoque Mínimo", "Tags"];
    const example = [
      "PROD001",
      "Álcool em Gel 500ml",
      "Antisséptico para mãos",
      "Higiene",
      "UN",
      "10",
      "higiene;antisséptico",
    ];

    const csv = [headers, example].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_produtos.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Template baixado com sucesso!");
  };

  const stats = {
    batches: getBatches().length,
    products: getExtendedProducts().length,
    movements: getMovements().length,
    batchItems: getBatchItems().length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Importação e Exportação</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie importação de dados e exportação de relatórios
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Database size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lotes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.batches}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Produtos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.products}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <RefreshCw size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Movimentações</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.movements}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <HardDrive size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Itens Estoque</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.batchItems}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exportação */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Download size={24} className="text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exportar Dados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Backup Completo</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Exporta todos os dados do sistema em formato JSON
            </p>
            <Button onClick={handleExportAll} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
              <Database size={16} />
              Exportar Tudo
            </Button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Produtos (CSV)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Exporta cadastro de produtos com estoque atual
            </p>
            <Button
              onClick={handleExportProductsCSV}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <FileText size={16} />
              Exportar CSV
            </Button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Movimentações (CSV)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Exporta histórico de entradas e saídas
            </p>
            <Button
              onClick={handleExportMovementsCSV}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              <RefreshCw size={16} />
              Exportar CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Importação */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Upload size={24} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Importar Dados</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Produtos (CSV)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Importa produtos em lote via arquivo CSV
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-700 dark:text-gray-300 mb-2 block">
                  Selecione o arquivo CSV
                </Label>
                <Input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportProductsCSV}
                  disabled={isImporting}
                  className="text-sm bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700"
                />
              </div>
              <Button
                onClick={handleDownloadTemplate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                size="sm"
              >
                <Download size={14} />
                Baixar Template
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Restaurar Backup</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Restaura backup completo do sistema (JSON)
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-700 dark:text-gray-300 mb-2 block">
                  Selecione o arquivo JSON
                </Label>
                <Input
                  ref={backupInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  disabled={isImporting}
                  className="text-sm bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700"
                />
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-900">
                <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                  ⚠️ Substitui todos os dados atuais
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-900">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">📋 Formato CSV</h4>
            <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Separe colunas com vírgula</li>
              <li>• Use aspas para textos</li>
              <li>• Primeira linha = cabeçalhos</li>
              <li>• Codificação UTF-8</li>
              <li>• Tags separadas por ponto-e-vírgula</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                Exemplo de cabeçalho:
              </p>
              <code className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded block mt-1">
                SKU, Nome, Descrição...
              </code>
            </div>
          </div>
        </div>
      </Card>

      {/* Resultados da Importação */}
      {importResults && (
        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            {importResults.success > 0 ? (
              <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Resultado da Importação</h3>
          </div>

          <div className="space-y-3">
            {importResults.success > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                <p className="text-green-800 dark:text-green-200 font-semibold">
                  ✓ {importResults.success} produto(s) importado(s) com sucesso
                </p>
              </div>
            )}

            {importResults.errors.length > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-900">
                <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                  ✗ {importResults.errors.length} erro(s) encontrado(s):
                </p>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 max-h-40 overflow-y-auto">
                  {importResults.errors.slice(0, 10).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {importResults.errors.length > 10 && (
                    <li className="font-semibold">
                      ... e mais {importResults.errors.length - 10} erro(s)
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}