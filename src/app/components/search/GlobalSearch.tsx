import { useState, useEffect, useMemo } from "react";
import { Search, Command, Package, PackagePlus, FileText, History, Users, BookOpen, Trash2, BarChart3, X } from "lucide-react";
import { Input } from "../ui/input";
import { getBatchItems, getBatches, getMovements } from "../../utils/storage";
import { getExtendedProducts } from "../../utils/storageExtended";

interface SearchResult {
  id: string;
  type: "product" | "batch" | "movement" | "menu";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (menuId: string) => void;
}

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Menu items para navegação rápida
  const menuItems: SearchResult[] = [
    {
      id: "dashboard",
      type: "menu",
      title: "Dashboard",
      subtitle: "Visão geral do sistema",
      icon: <Command size={18} />,
      action: () => {
        onNavigate("dashboard");
        onClose();
      },
    },
    {
      id: "lotes",
      type: "menu",
      title: "Lotes",
      subtitle: "Gerenciar lotes de produtos",
      icon: <PackagePlus size={18} />,
      action: () => {
        onNavigate("lotes");
        onClose();
      },
    },
    {
      id: "catalogo",
      type: "menu",
      title: "Catálogo de Produtos",
      subtitle: "Produtos com imagens e categorias",
      icon: <BookOpen size={18} />,
      action: () => {
        onNavigate("catalogo");
        onClose();
      },
    },
    {
      id: "produtos",
      type: "menu",
      title: "Produtos",
      subtitle: "Gestão de produtos",
      icon: <Package size={18} />,
      action: () => {
        onNavigate("produtos");
        onClose();
      },
    },
    {
      id: "perdas",
      type: "menu",
      title: "Registro de Perdas",
      subtitle: "Controle de perdas",
      icon: <Trash2 size={18} />,
      action: () => {
        onNavigate("perdas");
        onClose();
      },
    },
    {
      id: "historico",
      type: "menu",
      title: "Histórico",
      subtitle: "Movimentações de estoque",
      icon: <History size={18} />,
      action: () => {
        onNavigate("historico");
        onClose();
      },
    },
    {
      id: "relatorios-avancados",
      type: "menu",
      title: "Relatórios Avançados",
      subtitle: "Perdas e Análise ABC",
      icon: <BarChart3 size={18} />,
      action: () => {
        onNavigate("relatorios-avancados");
        onClose();
      },
    },
  ];

  // Buscar resultados
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return menuItems;
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Buscar em menus
    const matchingMenus = menuItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
    );
    results.push(...matchingMenus);

    // Buscar em produtos
    const products = getExtendedProducts();
    const matchingProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.code.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        type: "product" as const,
        title: p.name,
        subtitle: `SKU: ${p.code}`,
        icon: <Package size={18} />,
        action: () => {
          onNavigate("catalogo");
          onClose();
        },
      }));
    results.push(...matchingProducts);

    // Buscar em lotes
    const batches = getBatches();
    const matchingBatches = batches
      .filter((b) => b.batchNumber.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .map((b) => ({
        id: b.id,
        type: "batch" as const,
        title: `Lote ${b.batchNumber}`,
        subtitle: new Date(b.entryDate).toLocaleDateString("pt-BR"),
        icon: <PackagePlus size={18} />,
        action: () => {
          onNavigate("lotes");
          onClose();
        },
      }));
    results.push(...matchingBatches);

    return results.slice(0, 10);
  }, [query, menuItems, onNavigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          searchResults[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, searchResults, onClose]);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeLabel = (type: string) => {
    const labels = {
      product: "Produto",
      batch: "Lote",
      movement: "Movimentação",
      menu: "Menu",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      product: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      batch: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      movement: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
      menu: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
    };
    return colors[type as keyof typeof colors] || colors.menu;
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border border-gray-300 dark:border-zinc-800 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-300 dark:border-zinc-800">
            <Search size={20} className="text-gray-400 dark:text-gray-500" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar produtos, lotes, menus..."
              className="flex-1 border-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded">
                ESC
              </kbd>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Search size={48} className="mx-auto mb-3 opacity-30" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm mt-1">Tente buscar por outro termo</p>
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={result.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      index === selectedIndex
                        ? "bg-blue-50 dark:bg-blue-950 border-l-2 border-blue-600"
                        : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                        index === selectedIndex
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {result.icon}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      {result.subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.subtitle}
                        </p>
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded ${getTypeBadgeColor(
                        result.type
                      )}`}
                    >
                      {getTypeLabel(result.type)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded">
                    ↑↓
                  </kbd>
                  <span>Navegar</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded">
                    Enter
                  </kbd>
                  <span>Selecionar</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded font-mono">
                  {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded">
                  K
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}