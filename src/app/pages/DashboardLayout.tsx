import { ImportExport } from "../components/integration/ImportExport";
import { useKeyboardShortcuts, type KeyboardShortcut } from "../hooks/useKeyboardShortcuts";
import { ProfileEditor } from "../components/profile/ProfileEditor";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCurrentUser, setCurrentUser, getLowStockAlertCount } from "../utils/storage";
import { generateAutomaticNotifications, cleanOldNotifications } from "../utils/notificationGenerator";
import { markAllNotificationsAsRead } from "../utils/storageExtended";
import { logLogout } from "../utils/auditLogger";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  Clock,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Trash2,
  BarChart3,
  Keyboard,
  Shield,
  Download,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import Dashboard from "../components/Dashboard";
import Produtos from "../components/Produtos";
import Lotes from "../components/Lotes";
import Relatorios from "../components/Relatorios";
import Historico from "../components/Historico";
import UsersPanel from "../components/UsersPanel";
import { NotificationCenter } from "../components/notifications/NotificationCenter";
import { NotificationBadge } from "../components/notifications/NotificationBadge";
import { LossRegistry } from "../components/management/LossRegistry";
import { AdvancedReports } from "../components/reports/AdvancedReports";
import { GlobalSearch } from "../components/search/GlobalSearch";
import { KeyboardShortcutsPanel } from "../components/search/KeyboardShortcutsPanel";
import { AuditLogs } from "../components/audit/AuditLogs";
import { useTheme } from "../contexts/ThemeContext";
import { toast } from "sonner";
import senacLogo from "../../imports/Senac_logo.svg.png";

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  adminOnly?: boolean;
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { theme, toggleTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [lotesFilter, setLotesFilter] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lowStockAlertCount, setLowStockAlertCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isShortcutsPanelOpen, setIsShortcutsPanelOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

  // Função para navegar com filtro opcional
  const handleNavigate = (menu: string, filter?: string) => {
    if (menu === "lotes" && filter) {
      setLotesFilter(filter);
    } else {
      setLotesFilter(undefined);
    }
    setActiveMenu(menu);
  };

  // Keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "k",
      ctrlKey: !navigator.platform.includes("Mac"),
      metaKey: navigator.platform.includes("Mac"),
      description: "Abrir busca global",
      action: () => setIsGlobalSearchOpen(true),
    },
    {
      key: "?",
      shiftKey: true,
      description: "Mostrar atalhos de teclado",
      action: () => setIsShortcutsPanelOpen(true),
    },
    {
      key: "d",
      altKey: true,
      description: "Ir para Dashboard",
      action: () => setActiveMenu("dashboard"),
    },
    {
      key: "l",
      altKey: true,
      description: "Ir para Lotes",
      action: () => setActiveMenu("lotes"),
    },
    {
      key: "p",
      altKey: true,
      description: "Ir para Produtos",
      action: () => setActiveMenu("produtos"),
    },
    {
      key: "h",
      altKey: true,
      description: "Ir para Histórico",
      action: () => setActiveMenu("historico"),
    },
    {
      key: "r",
      altKey: true,
      description: "Ir para Relatórios Avançados",
      action: () => setActiveMenu("relatorios-avancados"),
    },
    {
      key: "a",
      altKey: true,
      description: "Ir para Log",
      action: () => {
        if (currentUser.role === "admin") {
          setActiveMenu("auditoria");
        }
      },
    },
    {
      key: "n",
      altKey: true,
      description: "Abrir notificações",
      action: () => setIsNotificationCenterOpen(true),
    },
    {
      key: "t",
      altKey: true,
      description: "Alternar tema claro/escuro",
      action: toggleTheme,
    },
  ];

  useKeyboardShortcuts(shortcuts);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      component: <Dashboard onNavigate={handleNavigate} />,
    },
    {
      id: "lotes",
      label: "Lotes",
      icon: <PackagePlus size={20} />,
      component: <Lotes initialFilter={lotesFilter} />,
    },
    {
      id: "produtos",
      label: "Produtos",
      icon: <Package size={20} />,
      component: <Produtos />,
    },
    {
      id: "perdas",
      label: "Perdas",
      icon: <Trash2 size={20} />,
      component: <LossRegistry />,
    },
    {
      id: "historico",
      label: "Histórico",
      icon: <Clock size={20} />,
      component: <Historico />,
    },
    {
      id: "relatorios",
      label: "Relatórios",
      icon: <FileText size={20} />,
      component: <Relatorios />,
    },
    {
      id: "relatorios-avancados",
      label: "Rel. Avançados",
      icon: <BarChart3 size={20} />,
      component: <AdvancedReports />,
    },
    {
      id: "importexport",
      label: "Import/Export",
      icon: <Download size={20} />,
      component: <ImportExport />,
    },
    {
      id: "auditoria",
      label: "Log",
      icon: <Shield size={20} />,
      component: <AuditLogs />,
      adminOnly: true,
    },
    {
      id: "users",
      label: "Usuários",
      icon: <Users size={20} />,
      component: <UsersPanel />,
      adminOnly: true,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    // Admin vê tudo
    if (currentUser.role === "admin") {
      return true;
    }

    // Visualizador vê apenas Dashboard e Produtos
    if (currentUser.role === "visualizador") {
      return item.id === "dashboard" || item.id === "produtos";
    }

    // Usuário normal vê tudo exceto adminOnly
    return !item.adminOnly;
  });

  const activeMenuItem = filteredMenuItems.find((item) => item.id === activeMenu);

  const handleLogout = () => {
    logLogout(currentUser.id, currentUser.name);
    setCurrentUser(null);
    toast.success("Logout realizado com sucesso");
    navigate("/login");
  };

  useEffect(() => {
    const count = getLowStockAlertCount();
    setLowStockAlertCount(count);
  }, []);

  // Marcar notificações como lidas ao clicar no dashboard
  useEffect(() => {
    if (activeMenu === "dashboard") {
      markAllNotificationsAsRead();
    }
  }, [activeMenu]);

  // Atualizar contadores periodicamente
  useEffect(() => {
    const updateCounts = () => {
      const count = getLowStockAlertCount();
      setLowStockAlertCount(count);
    };

    // Atualizar ao mudar de aba
    updateCounts();

    // Atualizar quando a janela recebe foco
    window.addEventListener('focus', updateCounts);

    // Atualizar periodicamente
    const interval = setInterval(updateCounts, 10000); // A cada 10 segundos

    return () => {
      window.removeEventListener('focus', updateCounts);
      clearInterval(interval);
    };
  }, [activeMenu]);

  // Sistema de notificações automáticas
  useEffect(() => {
    // Gerar notificações automaticamente ao carregar
    generateAutomaticNotifications();
    cleanOldNotifications();

    // Atualizar notificações a cada 5 minutos
    const notificationInterval = setInterval(() => {
      generateAutomaticNotifications();
      cleanOldNotifications();
    }, 5 * 60 * 1000); // 5 minutos

    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 dark:bg-black light:bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={senacLogo} alt="SENAC Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-blue-600 dark:text-blue-500">SIGE</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Sistema de Estoque</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <X size={20} />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white w-full"
              >
                <Menu size={20} />
              </Button>
            )}
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              {currentUser.profileImage ? (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={currentUser.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {currentUser.role === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsProfileEditorOpen(true)}
              variant="outline"
              size="sm"
              className="w-full justify-start border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <Settings size={16} />
              <span className="ml-2">Editar Perfil</span>
            </Button>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                activeMenu === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="relative">
                {item.icon}
                {/* Badge de alerta de estoque baixo no Dashboard */}
                {item.id === "dashboard" && lowStockAlertCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-600 hover:bg-red-600 text-[10px]">
                    {lowStockAlertCount}
                  </Badge>
                )}
              </div>
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span className="text-sm font-medium">{item.label}</span>
                  {/* Badge de alerta de estoque baixo no Dashboard (sidebar aberta) */}
                  {item.id === "dashboard" && lowStockAlertCount > 0 && (
                    <Badge className="bg-red-600 hover:bg-red-600 text-xs px-2">
                      {lowStockAlertCount}
                    </Badge>
                  )}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Notifications, Shortcuts, Theme Toggle & Logout */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <NotificationBadge
            onClick={() => setIsNotificationCenterOpen(true)}
            collapsed={!sidebarOpen}
          />
          <Button
            onClick={() => setIsShortcutsPanelOpen(true)}
            variant="outline"
            className={`${
              sidebarOpen ? "w-full justify-start" : "w-full"
            } border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white`}
          >
            <Keyboard size={20} />
            {sidebarOpen && <span className="ml-3">Atalhos</span>}
          </Button>
          <Button
            onClick={toggleTheme}
            variant="outline"
            className={`${
              sidebarOpen ? "w-full justify-start" : "w-full"
            } border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span className="ml-3">{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`${
              sidebarOpen ? "w-full justify-start" : "w-full"
            } border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8">
          {activeMenuItem?.component}
        </div>
      </main>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Global Search */}
      <GlobalSearch
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={setActiveMenu}
      />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        isOpen={isShortcutsPanelOpen}
        onClose={() => setIsShortcutsPanelOpen(false)}
        shortcuts={shortcuts}
      />

      {/* Profile Editor */}
      <ProfileEditor
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
        onUpdate={() => {
          // Atualizar o estado local se necessário
          const updated = getCurrentUser();
          if (updated) {
            setCurrentUser(updated);
          }
        }}
      />
    </div>
  );
}