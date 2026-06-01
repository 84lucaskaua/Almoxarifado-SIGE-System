import { Bell } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getUnreadNotificationsCount } from "../../utils/storageExtended";

interface NotificationBadgeProps {
  onClick: () => void;
  collapsed?: boolean;
}

export function NotificationBadge({ onClick, collapsed = false }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setUnreadCount(getUnreadNotificationsCount());
    };

    updateCount();

    // Listener para eventos customizados de atualização de notificações
    const handleNotificationUpdate = () => {
      updateCount();
    };

    window.addEventListener('notificationsUpdated', handleNotificationUpdate);

    // Atualizar periodicamente
    const interval = setInterval(updateCount, 5000);

    return () => {
      window.removeEventListener('notificationsUpdated', handleNotificationUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={`${
        collapsed ? "w-full" : "w-full justify-start"
      } border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white relative`}
    >
      <div className="relative">
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-600 hover:bg-red-600 text-[10px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </div>
      {!collapsed && (
        <div className="flex items-center justify-between flex-1 ml-3">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 hover:bg-red-600 text-xs px-2">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      )}
    </Button>
  );
}
