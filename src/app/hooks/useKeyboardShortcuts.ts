import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Não executar atalhos quando estiver em inputs/textareas (exceto Cmd/Ctrl+K)
      const isInputFocused =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement;

      for (const shortcut of shortcuts) {
        const isCmdOrCtrl = navigator.platform.includes("Mac")
          ? shortcut.metaKey
          : shortcut.ctrlKey;

        const matches =
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey &&
          !!event.metaKey === !!shortcut.metaKey;

        if (matches) {
          // Sempre permitir Cmd/Ctrl+K
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            shortcut.action();
            return;
          }

          // Outros atalhos só funcionam fora de inputs
          if (!isInputFocused) {
            event.preventDefault();
            shortcut.action();
            return;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const isMac = navigator.platform.includes("Mac");

  if (shortcut.ctrlKey && !isMac) parts.push("Ctrl");
  if (shortcut.metaKey && isMac) parts.push("⌘");
  if (shortcut.shiftKey) parts.push("Shift");
  if (shortcut.altKey) parts.push(isMac ? "⌥" : "Alt");
  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? "" : "+");
}
