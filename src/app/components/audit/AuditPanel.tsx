import { useState, useEffect, useMemo } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Shield, Search, User, Package, Calendar, Filter, FileText, Download } from "lucide-react";
import { Button } from "../ui/button";
import { getAuditLogs, getAuditLogsByEntity, getAuditLogsByUser, type AuditLog } from "../../utils/storageExtended";
import { getUsers } from "../../utils/storage";

type ActionFilter = "all" | "create" | "update" | "delete" | "stockIn" | "stockOut" | "transfer" | "loss" | "inventory";
type EntityFilter = "all" | "product" | "batch" | "batchItem" | "user" | "category" | "recipe";
type PeriodFilter = "all" | "today" | "week" | "month";

export function AuditPanel() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
  const [userFilter, setUserFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allLogs = getAuditLogs();
    setLogs(allLogs);
  };

  const users = getUsers();

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Filtro de busca
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
          log.entityName?.toLowerCase().includes(lowerSearch) ||
          log.userName.toLowerCase().includes(lowerSearch) ||
          log.action.toLowerCase().includes(lowerSearch) ||
          log.entity.toLowerCase().includes(lowerSearch);
        if (!matchesSearch) return false;
      }

      // Filtro de ação
      if (actionFilter !== "all" && log.action !== actionFilter) return false;

      // Filtro de entidade
      if (entityFilter !== "all" && log.entity !== entityFilter) return false;

      // Filtro de usuário
      if (userFilter !== "all" && log.userId !== userFilter) return false;

      // Filtro de período
      if (periodFilter !== "all") {
        const logDate = new Date(log.createdAt);
        const now = new Date();

        if (periodFilter === "today") {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (logDate < today) return false;
        } else if (periodFilter === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < weekAgo) return false;
        } else if (periodFilter === "month") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (logDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [logs, searchTerm, actionFilter, entityFilter, userFilter, periodFilter]);

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      create: "Criação",
      update: "Atualização",
      delete: "Exclusão",
      stockIn: "Entrada",
      stockOut: "Saída",
      transfer: "Transferência",
      loss: "Perda",
      inventory: "Inventário",
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string): string => {
    const colors: Record<string, string> = {
      create: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      update: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      delete: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      stockIn: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200",
      stockOut: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
      transfer: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      loss: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      inventory: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
    };
    return colors[action] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
  };

  const getEntityLabel = (entity: string): string => {
    const labels: Record<string, string> = {
      product: "Produto",
      batch: "Lote",
      batchItem: "Item de Lote",
      user: "Usuário",
      category: "Categoria",
      recipe: "Receita",
    };
    return labels[entity] || entity;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    const csv = [
      ["Data/Hora", "Usuário", "Ação", "Entidade", "Item", "Detalhes"].join(","),
      ...filteredLogs.map((log) =>
        [
          formatDate(log.createdAt),
          log.userName,
          getActionLabel(log.action),
          getEntityLabel(log.entity),
          log.entityName || "-",
          JSON.stringify(log.metadata || {}),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria_${new Date().toISOString()}.csv`;
    a.click();
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredLogs.length,
      today: filteredLogs.filter((log) => {
        const logDate = new Date(log.createdAt);
        const today = new Date();
        return (
          logDate.getDate() === today.getDate() &&
          logDate.getMonth() === today.getMonth() &&
          logDate.getFullYear() === today.getFullYear()
        );
      }).length,
      uniqueUsers: new Set(filteredLogs.map((log) => log.userId)).size,
    };
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Auditoria do Sistema</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Rastreamento completo de todas as ações realizadas no sistema
          </p>
        </div>

        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download size={16} />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Registros</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Ações Hoje</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.today}</p>
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
      </div>

      {/* Filtros */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <Input
              placeholder="Buscar por usuário, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filtro de Ação */}
          <Select value={actionFilter} onValueChange={(value: ActionFilter) => setActionFilter(value)}>
            <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
              <SelectValue placeholder="Todas as ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="create">Criação</SelectItem>
              <SelectItem value="update">Atualização</SelectItem>
              <SelectItem value="delete">Exclusão</SelectItem>
              <SelectItem value="stockIn">Entrada</SelectItem>
              <SelectItem value="stockOut">Saída</SelectItem>
              <SelectItem value="transfer">Transferência</SelectItem>
              <SelectItem value="loss">Perda</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Entidade */}
          <Select value={entityFilter} onValueChange={(value: EntityFilter) => setEntityFilter(value)}>
            <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
              <SelectValue placeholder="Todas as entidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as entidades</SelectItem>
              <SelectItem value="product">Produtos</SelectItem>
              <SelectItem value="batch">Lotes</SelectItem>
              <SelectItem value="batchItem">Itens de Lote</SelectItem>
              <SelectItem value="user">Usuários</SelectItem>
              <SelectItem value="category">Categorias</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtro de Período */}
          <Select value={periodFilter} onValueChange={(value: PeriodFilter) => setPeriodFilter(value)}>
            <SelectTrigger className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white">
              <SelectValue placeholder="Todo o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            <strong className="text-gray-900 dark:text-white">{filteredLogs.length}</strong>{" "}
            {filteredLogs.length === 1 ? "registro encontrado" : "registros encontrados"}
          </span>
          {(searchTerm || actionFilter !== "all" || entityFilter !== "all" || userFilter !== "all" || periodFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setActionFilter("all");
                setEntityFilter("all");
                setUserFilter("all");
                setPeriodFilter("all");
              }}
            >
              Limpar filtros
            </Button>
          )}
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
                  Entidade
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Item
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <Shield size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Nenhum registro de auditoria encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.slice(0, 100).map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {log.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {log.userName}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {getEntityLabel(log.entity)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {log.entityName || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > 100 && (
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Mostrando 100 de {filteredLogs.length} registros. Use os filtros para refinar a busca.
          </div>
        )}
      </Card>
    </div>
  );
}
