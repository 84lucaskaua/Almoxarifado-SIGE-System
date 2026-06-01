import { useState, useMemo } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Shield,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  Plus,
  FileText,
  AlertCircle,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { getAuditLogs, type AuditLog } from "../../utils/storageExtended";

type FilterPeriod = "today" | "7days" | "30days" | "90days" | "all";
type FilterAction = "all" | AuditLog["action"];
type FilterEntity = "all" | AuditLog["entity"];

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("30days");
  const [filterAction, setFilterAction] = useState<FilterAction>("all");
  const [filterEntity, setFilterEntity] = useState<FilterEntity>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const logs = getAuditLogs();

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    let filtered = logs;

    // Filtro por período
    if (filterPeriod !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (filterPeriod) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(now.getDate() - 90);
          break;
      }

      filtered = filtered.filter((log) => new Date(log.createdAt) >= startDate);
    }

    // Filtro por ação
    if (filterAction !== "all") {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    // Filtro por entidade
    if (filterEntity !== "all") {
      filtered = filtered.filter((log) => log.entity === filterEntity);
    }

    // Busca por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(search) ||
          log.userEmail.toLowerCase().includes(search) ||
          log.description.toLowerCase().includes(search) ||
          log.entityName?.toLowerCase().includes(search) ||
          log.action.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [logs, filterPeriod, filterAction, filterEntity, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Estatísticas
  const stats = useMemo(() => {
    const last24h = logs.filter(
      (log) => new Date(log.createdAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: logs.length,
      last24h: last24h.length,
      mostCommonAction: Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      uniqueUsers: new Set(logs.map((log) => log.userId)).size,
    };
  }, [logs]);

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      create: <Plus size={16} className="text-green-600 dark:text-green-400" />,
      update: <Edit size={16} className="text-blue-600 dark:text-blue-400" />,
      delete: <Trash2 size={16} className="text-red-600 dark:text-red-400" />,
      stockIn: <TrendingUp size={16} className="text-green-600 dark:text-green-400" />,
      stockOut: <TrendingDown size={16} className="text-orange-600 dark:text-orange-400" />,
      login: <LogIn size={16} className="text-blue-600 dark:text-blue-400" />,
      logout: <LogOut size={16} className="text-gray-600 dark:text-gray-400" />,
      register: <UserPlus size={16} className="text-purple-600 dark:text-purple-400" />,
      export: <Download size={16} className="text-blue-600 dark:text-blue-400" />,
      import: <Package size={16} className="text-green-600 dark:text-green-400" />,
      loss: <AlertCircle size={16} className="text-red-600 dark:text-red-400" />,
      transfer: <Package size={16} className="text-blue-600 dark:text-blue-400" />,
      batchCreate: <Plus size={16} className="text-green-600 dark:text-green-400" />,
      batchDelete: <Trash2 size={16} className="text-red-600 dark:text-red-400" />,
    };
    return icons[action] || <FileText size={16} className="text-gray-600 dark:text-gray-400" />;
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      update: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      delete: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      stockIn: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      stockOut: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      login: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      logout: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
      register: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      export: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      import: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      loss: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      transfer: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      batchCreate: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      batchDelete: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return colors[action] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: "Criar",
      update: "Atualizar",
      delete: "Excluir",
      stockIn: "Entrada",
      stockOut: "Saída",
      login: "Login",
      logout: "Logout",
      register: "Registro",
      export: "Exportar",
      import: "Importar",
      loss: "Perda",
      transfer: "Transferir",
      inventory: "Inventário",
      batchCreate: "Criar Lote",
      batchDelete: "Excluir Lote",
      lowStockAlert: "Alerta Estoque",
      expiryAlert: "Alerta Validade",
      reportGenerated: "Relatório",
    };
    return labels[action] || action;
  };

  const handleExport = () => {
    const csv = [
      ["Data/Hora", "Usuário", "Email", "Ação", "Entidade", "Descrição", "IP"].join(","),
      ...filteredLogs.map((log) =>
        [
          new Date(log.createdAt).toLocaleString("pt-BR"),
          log.userName,
          log.userEmail,
          getActionLabel(log.action),
          log.entity,
          `"${log.description.replace(/"/g, '""')}"`,
          log.ipAddress || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Logs de Auditoria</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Histórico completo de todas as ações realizadas no sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Logs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Últimas 24h</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.last24h}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <User size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <FileText size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ação + Comum</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {getActionLabel(stats.mostCommonAction)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Buscar por usuário, ação, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
            />
          </div>

          {/* Period Filter */}
          <Select value={filterPeriod} onValueChange={(value: FilterPeriod) => setFilterPeriod(value)}>
            <SelectTrigger className="w-48 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
              <Calendar size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Filter */}
          <Select value={filterAction} onValueChange={(value: FilterAction) => setFilterAction(value)}>
            <SelectTrigger className="w-40 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700">
              <Filter size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Ações</SelectItem>
              <SelectItem value="create">Criar</SelectItem>
              <SelectItem value="update">Atualizar</SelectItem>
              <SelectItem value="delete">Excluir</SelectItem>
              <SelectItem value="stockIn">Entrada</SelectItem>
              <SelectItem value="stockOut">Saída</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="export">Exportar</SelectItem>
              <SelectItem value="import">Importar</SelectItem>
            </SelectContent>
          </Select>

          {/* Export Button */}
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download size={16} />
            Exportar
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300 dark:border-zinc-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Data/Hora
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Usuário
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ação
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Descrição
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                      <Shield size={48} className="opacity-50" />
                      <p>Nenhum log encontrado com os filtros aplicados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString("pt-BR")}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {log.userName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {log.userEmail}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white max-w-md">
                      <p className="line-clamp-2">{log.description}</p>
                      {log.entityName && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {log.entity}: {log.entityName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {log.ipAddress || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-300 dark:border-zinc-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} até{" "}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} de {filteredLogs.length}{" "}
              registro(s)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
