import { useEffect, useState } from "react";
import { X, Check, CheckCheck, Trash2, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification,
} from "../../utils/storageExtended";
import { toast } from "sonner";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (menu: string, filter?: string) => void;
}

export function NotificationCenter({ isOpen, onClose, onNavigate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = () => {
    const allNotifications = getNotifications();
    setNotifications(allNotifications);
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((n) => !n.read);

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
    toast.success("Todas as notificações marcadas como lidas");
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    loadNotifications();
    toast.success("Notificação excluída");
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navegar para a página relevante baseado no tipo
    if (onNavigate) {
      switch (notification.type) {
        case "stock":
          onNavigate("lotes", "estoque-baixo");
          break;
        case "quality":
          onNavigate("lotes", "vencendo");
          break;
        case "system":
          onNavigate("dashboard");
          break;
        default:
          onNavigate("dashboard");
      }
    }

    // Fechar o painel
    onClose();
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle size={20} className="text-red-600 dark:text-red-400" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />;
      case "success":
        return <CheckCircle size={20} className="text-green-600 dark:text-green-400" />;
      default:
        return <Info size={20} className="text-blue-600 dark:text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900";
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900";
      default:
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col border-l border-gray-300 dark:border-zinc-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-300 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Notificações
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="flex-1"
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
              className="flex-1"
            >
              Não Lidas ({notifications.filter((n) => !n.read).length})
            </Button>
          </div>

          {/* Actions */}
          {filteredNotifications.length > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="w-full"
              >
                <CheckCheck size={16} className="mr-2" />
                Marcar todas como lidas
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Info size={48} className="text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === "all"
                  ? "Você não tem notificações no momento"
                  : "Todas as notificações foram lidas"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer hover:shadow-md ${
                    notification.read
                      ? "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                      : getSeverityColor(notification.severity)
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(notification.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <Badge className="bg-blue-600 hover:bg-blue-600 text-[10px] px-1.5 py-0.5">
                            NOVA
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-7 px-2 text-xs"
                            >
                              <Check size={14} className="mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="h-7 px-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}