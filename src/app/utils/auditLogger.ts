// ============================================
// SISTEMA DE LOG DE AUDITORIA - SIGE
// ============================================

import { getCurrentUser } from "./storage";
import { createAuditLog as saveLog } from "./storageExtended";

export type LogAction =
  | "create"
  | "update"
  | "delete"
  | "stockIn"
  | "stockOut"
  | "transfer"
  | "loss"
  | "inventory"
  | "export"
  | "import"
  | "login"
  | "logout"
  | "register"
  | "batchCreate"
  | "batchDelete"
  | "lowStockAlert"
  | "expiryAlert"
  | "reportGenerated";

export type LogEntity = "product" | "batch" | "batchItem" | "user" | "category" | "recipe" | "system" | "report" | "csv";

interface LogParams {
  action: LogAction;
  entity: LogEntity;
  entityId: string;
  entityName?: string;
  description: string;
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: any;
}

/**
 * Função principal para registrar logs de auditoria
 * Captura automaticamente informações do usuário logado
 */
export const logAudit = (params: LogParams): void => {
  try {
    const currentUser = getCurrentUser();
    
    // Simular IP (em produção viria do servidor)
    const ipAddress = `192.168.1.${Math.floor(Math.random() * 255)}`;

    saveLog({
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      entityName: params.entityName,
      description: params.description,
      changes: params.changes,
      metadata: {
        ...params.metadata,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      },
      ipAddress,
    });

    // Log no console para debug (remover em produção)
    console.log(`[AUDIT] ${params.action.toUpperCase()} - ${params.description}`, {
      user: currentUser?.name,
      entity: params.entity,
      entityId: params.entityId,
    });
  } catch (error) {
    console.error("Erro ao registrar log de auditoria:", error);
  }
};

// ============================================
// FUNÇÕES ESPECÍFICAS PARA CADA TIPO DE AÇÃO
// ============================================

export const logProductCreate = (productId: string, productName: string, sku: string) => {
  logAudit({
    action: "create",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `Produto "${productName}" (SKU: ${sku}) criado com sucesso`,
    metadata: { sku },
  });
};

export const logProductUpdate = (productId: string, productName: string, changes: any) => {
  logAudit({
    action: "update",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `Produto "${productName}" atualizado`,
    changes,
  });
};

export const logProductDelete = (productId: string, productName: string, sku: string) => {
  logAudit({
    action: "delete",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `⚠️ Produto "${productName}" (SKU: ${sku}) EXCLUÍDO permanentemente`,
    metadata: { sku, deletedAt: new Date().toISOString() },
  });
};

export const logStockIn = (productId: string, productName: string, quantity: number, unit: string) => {
  logAudit({
    action: "stockIn",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `Entrada de estoque: ${quantity} ${unit} de "${productName}"`,
    metadata: { quantity, unit, type: "entrada" },
  });
};

export const logStockOut = (productId: string, productName: string, quantity: number, unit: string, reason?: string) => {
  logAudit({
    action: "stockOut",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `Saída de estoque: ${quantity} ${unit} de "${productName}"${reason ? ` - Motivo: ${reason}` : ""}`,
    metadata: { quantity, unit, type: "saida", reason },
  });
};

export const logBatchCreate = (batchId: string, batchNumber: string) => {
  logAudit({
    action: "batchCreate",
    entity: "batch",
    entityId: batchId,
    entityName: batchNumber,
    description: `Lote "${batchNumber}" criado com sucesso`,
    metadata: { batchNumber },
  });
};

export const logBatchDelete = (batchId: string, batchNumber: string, itemCount: number) => {
  logAudit({
    action: "batchDelete",
    entity: "batch",
    entityId: batchId,
    entityName: batchNumber,
    description: `⚠️ Lote "${batchNumber}" EXCLUÍDO permanentemente (${itemCount} produto(s) removidos)`,
    metadata: { batchNumber, itemCount, deletedAt: new Date().toISOString() },
  });
};

export const logLoss = (productId: string, productName: string, quantity: number, unit: string, reason: string) => {
  logAudit({
    action: "loss",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `Perda registrada: ${quantity} ${unit} de "${productName}" - Motivo: ${reason}`,
    metadata: { quantity, unit, reason },
  });
};

export const logTransfer = (productId: string, productName: string, fromBatch: string, toBatch: string, quantity: number) => {
  logAudit({
    action: "transfer",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `Transferência: ${quantity} de "${productName}" de ${fromBatch} para ${toBatch}`,
    metadata: { fromBatch, toBatch, quantity },
  });
};

export const logLogin = (userId: string, userName: string, userEmail: string) => {
  logAudit({
    action: "login",
    entity: "user",
    entityId: userId,
    entityName: userName,
    description: `Usuário ${userName} (${userEmail}) realizou login`,
    metadata: { email: userEmail },
  });
};

export const logLogout = (userId: string, userName: string) => {
  logAudit({
    action: "logout",
    entity: "user",
    entityId: userId,
    entityName: userName,
    description: `Usuário ${userName} realizou logout`,
  });
};

export const logRegister = (userId: string, userName: string, userEmail: string) => {
  logAudit({
    action: "register",
    entity: "user",
    entityId: userId,
    entityName: userName,
    description: `Novo usuário registrado: ${userName} (${userEmail})`,
    metadata: { email: userEmail },
  });
};

export const logExport = (exportType: string, recordCount: number) => {
  const exportId = `export-${Date.now()}`;
  logAudit({
    action: "export",
    entity: "csv",
    entityId: exportId,
    entityName: exportType,
    description: `Exportação de ${exportType}: ${recordCount} registro(s)`,
    metadata: { exportType, recordCount, format: "CSV" },
  });
};

export const logImport = (importType: string, recordCount: number, success: boolean) => {
  const importId = `import-${Date.now()}`;
  logAudit({
    action: "import",
    entity: "csv",
    entityId: importId,
    entityName: importType,
    description: success
      ? `Importação bem-sucedida de ${importType}: ${recordCount} registro(s)`
      : `Falha na importação de ${importType}`,
    metadata: { importType, recordCount, success, format: "CSV" },
  });
};

export const logReportGenerated = (reportType: string, period: string) => {
  const reportId = `report-${Date.now()}`;
  logAudit({
    action: "reportGenerated",
    entity: "report",
    entityId: reportId,
    entityName: reportType,
    description: `Relatório gerado: ${reportType} (Período: ${period})`,
    metadata: { reportType, period },
  });
};

export const logInventoryCheck = (productId: string, productName: string, systemQty: number, countedQty: number) => {
  const difference = countedQty - systemQty;
  logAudit({
    action: "inventory",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `Inventário: "${productName}" - Sistema: ${systemQty}, Contado: ${countedQty}, Diferença: ${difference > 0 ? "+" : ""}${difference}`,
    metadata: { systemQuantity: systemQty, countedQuantity: countedQty, difference },
  });
};

export const logLowStockAlert = (productId: string, productName: string, currentStock: number, minStock: number) => {
  logAudit({
    action: "lowStockAlert",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `⚠️ Alerta de estoque baixo: "${productName}" - Atual: ${currentStock}, Mínimo: ${minStock}`,
    metadata: { currentStock, minStock, alertType: "lowStock" },
  });
};

export const logExpiryAlert = (productId: string, productName: string, expiryDate: string, daysUntilExpiry: number) => {
  logAudit({
    action: "expiryAlert",
    entity: "batchItem",
    entityId: productId,
    entityName: productName,
    description: `⚠️ Alerta de validade: "${productName}" vence em ${daysUntilExpiry} dia(s) (${new Date(expiryDate).toLocaleDateString("pt-BR")})`,
    metadata: { expiryDate, daysUntilExpiry, alertType: "expiry" },
  });
};

export const logProfileUpdate = (userId: string, userName: string, changes: string) => {
  logAudit({
    action: "update",
    entity: "user",
    entityId: userId,
    entityName: userName,
    description: `Perfil do usuário "${userName}" atualizado: ${changes}`,
    metadata: { updateType: "profile", changes },
  });
};