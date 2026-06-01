import {
  createNotification,
  getNotifications,
  type NotificationSeverity,
} from "./storageExtended";
import { getBatchItems, isItemExpiryNear, isItemExpired, getStockStatus } from "./storage";

/**
 * Gera notificações automáticas com base em condições do sistema
 */
export function generateAutomaticNotifications(): void {
  const items = getBatchItems();
  const existingNotifications = getNotifications();

  // Função helper para verificar se uma notificação similar já existe
  const notificationExists = (title: string): boolean => {
    return existingNotifications.some(
      (n) =>
        n.title === title &&
        !n.read &&
        new Date(n.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Nas últimas 24h
    );
  };

  items.forEach((item) => {
    // 1. Notificação de produto vencido
    if (isItemExpired(item)) {
      const title = `Produto Vencido: ${item.productName}`;
      if (!notificationExists(title)) {
        createNotification({
          title,
          message: `O produto "${item.productName}" (SKU: ${item.sku}) no lote ${item.batchId} está vencido desde ${new Date(item.expiryDate).toLocaleDateString("pt-BR")}. Remova do estoque imediatamente.`,
          severity: "critical" as NotificationSeverity,
          type: "stock",
        });
      }
    }

    // 2. Notificação de produto próximo do vencimento
    else if (isItemExpiryNear(item, 7)) {
      // Menos de 7 dias
      const title = `Vencimento Próximo: ${item.productName}`;
      if (!notificationExists(title)) {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        createNotification({
          title,
          message: `O produto "${item.productName}" (SKU: ${item.sku}) vence em ${daysUntilExpiry} dia(s). Validade: ${new Date(item.expiryDate).toLocaleDateString("pt-BR")}.`,
          severity: "critical" as NotificationSeverity,
          type: "stock",
        });
      }
    }

    else if (isItemExpiryNear(item, 30)) {
      // Entre 7 e 30 dias
      const title = `Atenção ao Vencimento: ${item.productName}`;
      if (!notificationExists(title)) {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        createNotification({
          title,
          message: `O produto "${item.productName}" (SKU: ${item.sku}) vence em ${daysUntilExpiry} dia(s). Planeje o uso ou venda prioritária.`,
          severity: "warning" as NotificationSeverity,
          type: "stock",
        });
      }
    }

    // 3. Notificação de estoque crítico
    const stockStatus = getStockStatus(item);
    if (stockStatus === "critico") {
      const title = `Estoque Crítico: ${item.productName}`;
      if (!notificationExists(title)) {
        createNotification({
          title,
          message: `O produto "${item.productName}" (SKU: ${item.sku}) está com estoque crítico (${item.quantity} ${item.unit}). Reposição urgente necessária!`,
          severity: "critical" as NotificationSeverity,
          type: "stock",
        });
      }
    }

    // 4. Notificação de estoque baixo
    else if (stockStatus === "baixo") {
      const title = `Estoque Baixo: ${item.productName}`;
      if (!notificationExists(title)) {
        createNotification({
          title,
          message: `O produto "${item.productName}" (SKU: ${item.sku}) está com estoque baixo (${item.quantity} ${item.unit}). Considere fazer uma reposição em breve.`,
          severity: "warning" as NotificationSeverity,
          type: "stock",
        });
      }
    }

    // 5. Notificação de estoque zerado
    if (item.quantity === 0) {
      const title = `Estoque Zerado: ${item.productName}`;
      if (!notificationExists(title)) {
        createNotification({
          title,
          message: `O produto "${item.productName}" (SKU: ${item.sku}) está com estoque zerado. Reponha o quanto antes para evitar rupturas.`,
          severity: "critical" as NotificationSeverity,
          type: "stock",
        });
      }
    }
  });
}

/**
 * Gera notificação manual para uma ação específica
 */
export function notifyAction(
  title: string,
  message: string,
  severity: NotificationSeverity = "info",
  type: string = "system"
): void {
  createNotification({
    title,
    message,
    severity,
    type,
  });
}

/**
 * Notificação de sucesso para operações
 */
export function notifySuccess(title: string, message: string): void {
  createNotification({
    title,
    message,
    severity: "success" as NotificationSeverity,
    type: "system",
  });
}

/**
 * Notificação de aviso
 */
export function notifyWarning(title: string, message: string): void {
  createNotification({
    title,
    message,
    severity: "warning" as NotificationSeverity,
    type: "system",
  });
}

/**
 * Notificação crítica
 */
export function notifyCritical(title: string, message: string): void {
  createNotification({
    title,
    message,
    severity: "critical" as NotificationSeverity,
    type: "system",
  });
}

/**
 * Limpa notificações antigas (mais de 30 dias)
 */
export function cleanOldNotifications(): void {
  const notifications = getNotifications();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  notifications.forEach((notification) => {
    if (new Date(notification.createdAt) < thirtyDaysAgo && notification.read) {
      // Remove apenas as lidas que são antigas
      const updatedNotifications = notifications.filter((n) => n.id !== notification.id);
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    }
  });
}
