// ============================================
// INTERFACES ESTENDIDAS PARA O SIGE ENTERPRISE
// ============================================

import { getCurrentUser } from "./storage";

// ============================================
// NOVAS INTERFACES
// ============================================

export interface Category {
  id: string;
  name: string;
  color?: string; // Cor em hex para identificação visual
  alertDays?: number; // Dias de alerta padrão para produtos desta categoria
  icon?: string; // Nome do ícone lucide-react
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  itemId?: string; // ID do produto/lote relacionado
  actionUrl?: string; // URL para onde o usuário deve ir
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 
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
  entity: "product" | "batch" | "batchItem" | "user" | "category" | "recipe" | "system" | "report" | "csv";
  entityId: string;
  entityName?: string; // Nome do item para facilitar busca
  description: string; // Descrição legível da ação
  changes?: {
    before?: any;
    after?: any;
  };
  metadata?: any; // Dados adicionais específicos da ação
  ipAddress?: string; // IP do usuário (simulado)
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category?: string;
  yield: number; // Quantidade que a receita produz
  yieldUnit: string;
  ingredients: RecipeIngredient[];
  instructions?: string;
  prepTime?: number; // Tempo de preparo em minutos
  cookTime?: number; // Tempo de cozimento em minutos
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredient {
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
}

export interface QualityCheck {
  id: string;
  batchItemId: string;
  checkDate: string;
  temperature?: number;
  temperatureUnit?: "C" | "F";
  visualInspection?: boolean;
  packagingIntact?: boolean;
  approved: boolean;
  checkedBy: string;
  checkedByName: string;
  notes?: string;
  photos?: string[]; // URLs ou base64
  createdAt: string;
}

export type LossReason = "expiry" | "damage" | "theft" | "other";

export interface Loss {
  id: string;
  batchItemId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  reason: LossReason;
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromBatchId: string;
  toBatchId: string;
  fromBatchNumber: string;
  toBatchNumber: string;
  itemId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  reason?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface InventoryCount {
  id: string;
  batchItemId: string;
  productName: string;
  productCode: string;
  batchNumber: string;
  systemQuantity: number; // Quantidade no sistema
  countedQuantity: number; // Quantidade contada fisicamente
  difference: number; // Diferença (contada - sistema)
  adjustmentReason?: string;
  countedBy: string;
  countedByName: string;
  approved: boolean;
  approvedBy?: string;
  createdAt: string;
}

export interface NotificationSettings {
  userId: string;
  expiryAlerts: boolean;
  lowStockAlerts: boolean;
  noMovementAlerts: boolean;
  noMovementDays: number; // Dias sem movimento para alertar
  temperatureAlerts: boolean;
  qualityAlerts: boolean;
  emailNotifications: boolean; // Simulado
  soundEnabled: boolean;
  updatedAt: string;
}

export interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  minStockQuantity: number;
  unitType: string;
  alertDays: number;
  tags: string[];
  notes?: string;
  createdAt: string;
}

export interface ExtendedProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  unitType: string;
  minStockQuantity: number;
  imageUrl?: string;
  tags?: string[];
  alertDays?: number;
  notes?: string;
  requiresTemperatureControl?: boolean;
  minTemperature?: number;
  maxTemperature?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// STORAGE KEYS ESTENDIDAS
// ============================================

export const EXTENDED_STORAGE_KEYS = {
  CATEGORIES: "categories",
  NOTIFICATIONS: "notifications",
  AUDIT_LOGS: "auditLogs",
  RECIPES: "recipes",
  QUALITY_CHECKS: "qualityChecks",
  LOSSES: "losses",
  TRANSFERS: "transfers",
  INVENTORY_COUNTS: "inventoryCounts",
  NOTIFICATION_SETTINGS: "notificationSettings",
  PRODUCT_TEMPLATES: "productTemplates",
  EXTENDED_PRODUCTS: "extendedProducts",
};

// ============================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================

export const initializeExtendedData = () => {
  // Categorias padrão
  const categories = localStorage.getItem(EXTENDED_STORAGE_KEYS.CATEGORIES);
  if (!categories) {
    const defaultCategories: Category[] = [
      {
        id: "cat-1",
        name: "Alimentos",
        color: "#10b981",
        icon: "Utensils",
        alertDays: 7,
        description: "Produtos alimentícios",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-2",
        name: "Higiene",
        color: "#3b82f6",
        icon: "Sparkles",
        alertDays: 30,
        description: "Produtos de higiene pessoal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-3",
        name: "Limpeza",
        color: "#8b5cf6",
        icon: "Droplet",
        alertDays: 60,
        description: "Produtos de limpeza",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-4",
        name: "Medicamentos",
        color: "#ef4444",
        icon: "Pill",
        alertDays: 30,
        description: "Medicamentos e suplementos",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "cat-5",
        name: "Descartáveis",
        color: "#f59e0b",
        icon: "Package",
        alertDays: 90,
        description: "Produtos descartáveis",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(EXTENDED_STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }

  // Inicializar outros storages vazios
  Object.values(EXTENDED_STORAGE_KEYS).forEach(key => {
    if (key !== "CATEGORIES" && !localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  });
};

// ============================================
// CATEGORIES - CRUD
// ============================================

export const getCategories = (): Category[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.CATEGORIES);
  return data ? JSON.parse(data) : [];
};

export const saveCategories = (categories: Category[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const getCategoryById = (id: string): Category | null => {
  const categories = getCategories();
  return categories.find(c => c.id === id) || null;
};

export const createCategory = (category: Omit<Category, "id" | "createdAt" | "updatedAt">): Category => {
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const categories = getCategories();
  saveCategories([...categories, newCategory]);
  return newCategory;
};

export const updateCategory = (id: string, updates: Partial<Category>): Category | null => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCategories(categories);
  return categories[index];
};

export const deleteCategory = (id: string): boolean => {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveCategories(filtered);
  return true;
};

// ============================================
// EXTENDED PRODUCTS - CRUD
// ============================================

export const getExtendedProducts = (): ExtendedProduct[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.EXTENDED_PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const saveExtendedProducts = (products: ExtendedProduct[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.EXTENDED_PRODUCTS, JSON.stringify(products));
};

export const getExtendedProductById = (id: string): ExtendedProduct | null => {
  const products = getExtendedProducts();
  return products.find(p => p.id === id) || null;
};

export const getExtendedProductByCode = (code: string): ExtendedProduct | null => {
  const products = getExtendedProducts();
  return products.find(p => p.code === code) || null;
};

export const createExtendedProduct = (product: Omit<ExtendedProduct, "id" | "createdAt" | "updatedAt">): ExtendedProduct => {
  const newProduct: ExtendedProduct = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const products = getExtendedProducts();
  saveExtendedProducts([...products, newProduct]);
  return newProduct;
};

export const updateExtendedProduct = (id: string, updates: Partial<ExtendedProduct>): ExtendedProduct | null => {
  const products = getExtendedProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveExtendedProducts(products);
  return products[index];
};

export const deleteExtendedProduct = (id: string): boolean => {
  const products = getExtendedProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return false;
  saveExtendedProducts(filtered);
  return true;
};

// ============================================
// NOTIFICATIONS - CRUD
// ============================================

export const getNotifications = (): Notification[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.NOTIFICATIONS);
  const notifications = data ? JSON.parse(data) : [];
  return notifications.sort((a: Notification, b: Notification) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const getUnreadNotificationsCount = (): number => {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
};

export const createNotification = (notification: Omit<Notification, "id" | "createdAt">): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const notifications = getNotifications();
  saveNotifications([newNotification, ...notifications]);
  return newNotification;
};

export const markNotificationAsRead = (id: string): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(updated);
};

export const markAllNotificationsAsRead = (): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
};

export const deleteNotification = (id: string): void => {
  const notifications = getNotifications();
  saveNotifications(notifications.filter(n => n.id !== id));
};

export const clearOldNotifications = (daysOld: number = 30): void => {
  const notifications = getNotifications();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const filtered = notifications.filter(n =>
    new Date(n.createdAt) > cutoffDate || !n.read
  );
  saveNotifications(filtered);
};

// ============================================
// AUDIT LOGS - CRUD
// ============================================

export const getAuditLogs = (): AuditLog[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.AUDIT_LOGS);
  const logs = data ? JSON.parse(data) : [];
  return logs.sort((a: AuditLog, b: AuditLog) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const saveAuditLogs = (logs: AuditLog[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
};

export const createAuditLog = (log: Omit<AuditLog, "id" | "createdAt" | "userId" | "userName" | "userEmail">): AuditLog => {
  const currentUser = getCurrentUser();
  const newLog: AuditLog = {
    ...log,
    id: crypto.randomUUID(),
    userId: currentUser?.id || "system",
    userName: currentUser?.name || "Sistema",
    userEmail: currentUser?.email || "sistema@sigee.com",
    createdAt: new Date().toISOString(),
  };
  const logs = getAuditLogs();
  saveAuditLogs([newLog, ...logs]);
  return newLog;
};

export const getAuditLogsByEntity = (entity: string, entityId: string): AuditLog[] => {
  const logs = getAuditLogs();
  return logs.filter(log => log.entity === entity && log.entityId === entityId);
};

export const getAuditLogsByUser = (userId: string): AuditLog[] => {
  const logs = getAuditLogs();
  return logs.filter(log => log.userId === userId);
};

// ============================================
// RECIPES - CRUD
// ============================================

export const getRecipes = (): Recipe[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.RECIPES);
  return data ? JSON.parse(data) : [];
};

export const saveRecipes = (recipes: Recipe[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
};

export const createRecipe = (recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">): Recipe => {
  const newRecipe: Recipe = {
    ...recipe,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const recipes = getRecipes();
  saveRecipes([...recipes, newRecipe]);

  createAuditLog({
    action: "create",
    entity: "recipe",
    entityId: newRecipe.id,
    entityName: newRecipe.name,
  });

  return newRecipe;
};

// ============================================
// LOSSES - CRUD
// ============================================

export const getLosses = (): Loss[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.LOSSES);
  const losses = data ? JSON.parse(data) : [];
  return losses.sort((a: Loss, b: Loss) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const saveLosses = (losses: Loss[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.LOSSES, JSON.stringify(losses));
};

export const createLoss = (loss: Omit<Loss, "id" | "createdAt" | "userId" | "userName">): Loss => {
  const currentUser = getCurrentUser();
  const newLoss: Loss = {
    ...loss,
    id: crypto.randomUUID(),
    userId: currentUser?.id || "",
    userName: currentUser?.name || "",
    createdAt: new Date().toISOString(),
  };
  const losses = getLosses();
  saveLosses([newLoss, ...losses]);

  createAuditLog({
    action: "loss",
    entity: "batchItem",
    entityId: newLoss.batchItemId,
    entityName: newLoss.productName,
    metadata: { reason: newLoss.reason, quantity: newLoss.quantity },
  });

  return newLoss;
};

// ============================================
// TRANSFERS - CRUD
// ============================================

export const getTransfers = (): Transfer[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.TRANSFERS);
  return data ? JSON.parse(data) : [];
};

export const saveTransfers = (transfers: Transfer[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
};

export const createTransfer = (transfer: Omit<Transfer, "id" | "createdAt" | "userId" | "userName">): Transfer => {
  const currentUser = getCurrentUser();
  const newTransfer: Transfer = {
    ...transfer,
    id: crypto.randomUUID(),
    userId: currentUser?.id || "",
    userName: currentUser?.name || "",
    createdAt: new Date().toISOString(),
  };
  const transfers = getTransfers();
  saveTransfers([newTransfer, ...transfers]);

  createAuditLog({
    action: "transfer",
    entity: "batchItem",
    entityId: newTransfer.itemId,
    entityName: newTransfer.productName,
    metadata: {
      from: newTransfer.fromBatchNumber,
      to: newTransfer.toBatchNumber,
      quantity: newTransfer.quantity
    },
  });

  return newTransfer;
};

// ============================================
// INVENTORY COUNTS - CRUD
// ============================================

export const getInventoryCounts = (): InventoryCount[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.INVENTORY_COUNTS);
  return data ? JSON.parse(data) : [];
};

export const saveInventoryCounts = (counts: InventoryCount[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.INVENTORY_COUNTS, JSON.stringify(counts));
};

export const createInventoryCount = (
  count: Omit<InventoryCount, "id" | "createdAt" | "countedBy" | "countedByName" | "difference">
): InventoryCount => {
  const currentUser = getCurrentUser();
  const newCount: InventoryCount = {
    ...count,
    id: crypto.randomUUID(),
    difference: count.countedQuantity - count.systemQuantity,
    countedBy: currentUser?.id || "",
    countedByName: currentUser?.name || "",
    createdAt: new Date().toISOString(),
  };
  const counts = getInventoryCounts();
  saveInventoryCounts([newCount, ...counts]);

  createAuditLog({
    action: "inventory",
    entity: "batchItem",
    entityId: newCount.batchItemId,
    entityName: newCount.productName,
    metadata: {
      system: newCount.systemQuantity,
      counted: newCount.countedQuantity,
      difference: newCount.difference
    },
  });

  return newCount;
};

// ============================================
// QUALITY CHECKS - CRUD
// ============================================

export const getQualityChecks = (): QualityCheck[] => {
  const data = localStorage.getItem(EXTENDED_STORAGE_KEYS.QUALITY_CHECKS);
  return data ? JSON.parse(data) : [];
};

export const saveQualityChecks = (checks: QualityCheck[]) => {
  localStorage.setItem(EXTENDED_STORAGE_KEYS.QUALITY_CHECKS, JSON.stringify(checks));
};

export const createQualityCheck = (
  check: Omit<QualityCheck, "id" | "createdAt" | "checkedBy" | "checkedByName">
): QualityCheck => {
  const currentUser = getCurrentUser();
  const newCheck: QualityCheck = {
    ...check,
    id: crypto.randomUUID(),
    checkedBy: currentUser?.id || "",
    checkedByName: currentUser?.name || "",
    createdAt: new Date().toISOString(),
  };
  const checks = getQualityChecks();
  saveQualityChecks([newCheck, ...checks]);

  if (!newCheck.approved) {
    createNotification({
      type: "quality",
      title: "Falha no Controle de Qualidade",
      message: `Item reprovado na inspeção de qualidade.`,
      severity: "critical",
      read: false,
      itemId: newCheck.batchItemId,
    });
  }

  return newCheck;
};

export const getQualityChecksByItem = (batchItemId: string): QualityCheck[] => {
  const checks = getQualityChecks();
  return checks.filter(check => check.batchItemId === batchItemId);
};

// ============================================
// NOTIFICATION SETTINGS
// ============================================

export const getNotificationSettings = (userId: string): NotificationSettings => {
  const allSettings = localStorage.getItem(EXTENDED_STORAGE_KEYS.NOTIFICATION_SETTINGS);
  const settings = allSettings ? JSON.parse(allSettings) : [];
  const userSettings = settings.find((s: NotificationSettings) => s.userId === userId);

  // Configurações padrão
  if (!userSettings) {
    return {
      userId,
      expiryAlerts: true,
      lowStockAlerts: true,
      noMovementAlerts: true,
      noMovementDays: 30,
      temperatureAlerts: true,
      qualityAlerts: true,
      emailNotifications: false,
      soundEnabled: true,
      updatedAt: new Date().toISOString(),
    };
  }

  return userSettings;
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  const allSettings = localStorage.getItem(EXTENDED_STORAGE_KEYS.NOTIFICATION_SETTINGS);
  const settingsArray: NotificationSettings[] = allSettings ? JSON.parse(allSettings) : [];

  const index = settingsArray.findIndex(s => s.userId === settings.userId);
  if (index >= 0) {
    settingsArray[index] = { ...settings, updatedAt: new Date().toISOString() };
  } else {
    settingsArray.push({ ...settings, updatedAt: new Date().toISOString() });
  }

  localStorage.setItem(EXTENDED_STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settingsArray));
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

export const exportAllData = () => {
  const data = {
    products: localStorage.getItem("products"),
    batches: localStorage.getItem("batches"),
    batchItems: localStorage.getItem("batchItems"),
    movements: localStorage.getItem("movements"),
    categories: localStorage.getItem(EXTENDED_STORAGE_KEYS.CATEGORIES),
    notifications: localStorage.getItem(EXTENDED_STORAGE_KEYS.NOTIFICATIONS),
    auditLogs: localStorage.getItem(EXTENDED_STORAGE_KEYS.AUDIT_LOGS),
    recipes: localStorage.getItem(EXTENDED_STORAGE_KEYS.RECIPES),
    qualityChecks: localStorage.getItem(EXTENDED_STORAGE_KEYS.QUALITY_CHECKS),
    losses: localStorage.getItem(EXTENDED_STORAGE_KEYS.LOSSES),
    transfers: localStorage.getItem(EXTENDED_STORAGE_KEYS.TRANSFERS),
    inventoryCounts: localStorage.getItem(EXTENDED_STORAGE_KEYS.INVENTORY_COUNTS),
    exportDate: new Date().toISOString(),
    version: "1.0.0",
  };

  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);

    // Validar que é um backup válido
    if (!data.version || !data.exportDate) {
      throw new Error("Formato de backup inválido");
    }

    // Restaurar dados
    Object.keys(data).forEach(key => {
      if (key !== "exportDate" && key !== "version" && data[key]) {
        localStorage.setItem(
          key === "products" || key === "batches" || key === "batchItems" || key === "movements"
            ? key
            : EXTENDED_STORAGE_KEYS[key.toUpperCase() as keyof typeof EXTENDED_STORAGE_KEYS],
          data[key]
        );
      }
    });

    return true;
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return false;
  }
};