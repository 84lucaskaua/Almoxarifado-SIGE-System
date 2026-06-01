import { Keyboard, X } from "lucide-react";
import { Button } from "../ui/button";
import { type KeyboardShortcut, formatShortcut } from "../../hooks/useKeyboardShortcuts";

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsPanel({ isOpen, onClose, shortcuts }: KeyboardShortcutsPanelProps) {
  if (!isOpen) return null;

  // Agrupar atalhos por categoria
  const groupedShortcuts = {
    navigation: shortcuts.filter(s =>
      s.description.toLowerCase().includes("ir para") ||
      s.description.toLowerCase().includes("abrir")
    ),
    actions: shortcuts.filter(s =>
      !s.description.toLowerCase().includes("ir para") &&
      !s.description.toLowerCase().includes("abrir") &&
      !s.description.toLowerCase().includes("busca")
    ),
    search: shortcuts.filter(s => s.description.toLowerCase().includes("busca")),
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col border-l border-gray-300 dark:border-zinc-800">
        {/* Header */}
        <div className="p-6 border-b border-gray-300 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Keyboard size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Atalhos de Teclado
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={20} />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acelere seu trabalho com atalhos de teclado
          </p>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Busca */}
          {groupedShortcuts.search.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                Busca
              </h3>
              <div className="space-y-2">
                {groupedShortcuts.search.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded shadow-sm">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navegação */}
          {groupedShortcuts.navigation.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                Navegação
              </h3>
              <div className="space-y-2">
                {groupedShortcuts.navigation.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded shadow-sm">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          {groupedShortcuts.actions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                Ações Rápidas
              </h3>
              <div className="space-y-2">
                {groupedShortcuts.actions.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg"
                  >
                    <span className="text-sm text-gray-900 dark:text-white">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded shadow-sm">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dica */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
              💡 Dica Profissional
            </h4>
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Use <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs mx-1">
                {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}+K
              </kbd> para acessar a busca global rapidamente de qualquer lugar do sistema.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-300 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {shortcuts.length} atalhos disponíveis
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-zinc-700 rounded text-xs">ESC</kbd>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
