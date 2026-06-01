export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  category?: string;
  unitType: "UN" | "CX" | "PCT" | "PTC" | "FR" | "RL" | "KIT" | "EMB" | "UM" | "BEM" | "KG" | "G";
  minStockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "admin" | "user" | "visualizador";
  createdAt: string;
  profileImage?: string; // URL ou base64 da imagem de perfil
}

export interface Batch {
  id: string;
  batchNumber: string; // Lote 001, Lote 002, etc.
  createdAt: string;
  description?: string;
}

export interface BatchItem {
  id: string;
  batchId: string;
  sku: string; // Código / SKU
  productName: string; // Nome do produto
  quantity: number; // Quantidade
  minStock: number; // Estoque mínimo
  unit: "UN" | "CX" | "PCT" | "PTC" | "FR" | "RL" | "EMB" | "KIT" | "BEM" | "UM"; // Unidade de medida
  expiryDate: string; // Validade
  supplier: string; // Fornecedor
  location: string; // Localização / prateleira
  unitPrice?: number; // Preço unitário (em centavos)
  priority?: "A" | "B" | "C"; // Prioridade ABC (A=Alta, B=Média, C=Baixa)
  priorityAuto?: "A" | "B" | "C"; // Prioridade calculada automaticamente
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  batchItemId: string;
  type: "entrada" | "saida";
  quantity: number;
  date: string;
  reason?: string;
  supplier?: string;
  observation?: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

// Storage Keys
const STORAGE_KEYS = {
  BATCHES: "batches",
  BATCH_ITEMS: "batchItems",
  MOVEMENTS: "movements",
  USERS: "users",
  CURRENT_USER: "currentUser",
};

export const initializeData = () => {
  // Initialize with admin user and visualizer if no users exist
  const usersData = localStorage.getItem(STORAGE_KEYS.USERS);

  if (!usersData) {
    // Primeira vez - criar admin e visualizador
    const defaultAdmin: User = {
      id: "1",
      email: "admin@sige.com",
      password: "admin123",
      name: "Administrador",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    const defaultVisualizer: User = {
      id: "2",
      email: "visualizador@sige.com",
      password: "visualizador123",
      name: "Visualizador",
      role: "visualizador",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultAdmin, defaultVisualizer]));
  } else {
    // Verificar se visualizador existe, senão adicionar
    const users: User[] = JSON.parse(usersData);
    const visualizerExists = users.some(u => u.email === "visualizador@sige.com");

    if (!visualizerExists) {
      const defaultVisualizer: User = {
        id: "2",
        email: "visualizador@sige.com",
        password: "visualizador123",
        name: "Visualizador",
        role: "visualizador",
        createdAt: new Date().toISOString(),
      };
      users.push(defaultVisualizer);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  // Initialize products if none exist
  const products = localStorage.getItem("products");
  if (!products) {
    localStorage.setItem("products", JSON.stringify([]));
  }

  // Initialize batches if none exist
  const batches = localStorage.getItem(STORAGE_KEYS.BATCHES);
  if (!batches) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
  }

  // Initialize batchItems if none exist
  const batchItems = localStorage.getItem(STORAGE_KEYS.BATCH_ITEMS);
  if (!batchItems) {
    localStorage.setItem(STORAGE_KEYS.BATCH_ITEMS, JSON.stringify([]));
  }

  // Initialize movements if none exist
  const movements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
  if (!movements) {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getProducts = (): Product[] => {
  const products = localStorage.getItem("products");
  return products ? JSON.parse(products) : [];
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem("products", JSON.stringify(products));
};

export const getBatches = (): Batch[] => {
  const batches = localStorage.getItem(STORAGE_KEYS.BATCHES);
  return batches ? JSON.parse(batches) : [];
};

export const saveBatches = (batches: Batch[]): void => {
  localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
};

export const getBatchById = (batchId: string): Batch | null => {
  const batches = getBatches();
  return batches.find(batch => batch.id === batchId) || null;
};

export const getMovements = (): Movement[] => {
  const movements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
  return movements ? JSON.parse(movements) : [];
};

export const saveMovements = (movements: Movement[]) => {
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const createUser = (
  email: string,
  password: string,
  name: string,
  role: "admin" | "user" = "user"
): User | null => {
  const users = getUsers();

  // Verificar se o email já existe
  if (users.some(u => u.email === email)) {
    return null;
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    password,
    name,
    role,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const updateUserPassword = (email: string, newPassword: string): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex === -1) {
    return false;
  }

  users[userIndex].password = newPassword;
  saveUsers(users);
  return true;
};

export const emailExists = (email: string): boolean => {
  const users = getUsers();
  return users.some(u => u.email === email);
};

export const resetAdminPassword = (): void => {
  const users = getUsers();
  const adminIndex = users.findIndex(u => u.email === "admin@sige.com");

  if (adminIndex !== -1) {
    users[adminIndex].password = "admin123";
    saveUsers(users);
  }
};

export const getTotalStock = (productId: string): number => {
  const batches = getBatches();
  return batches
    .filter((batch) => batch.productId === productId)
    .reduce((total, batch) => total + batch.quantity, 0);
};

export const isStockLow = (productId: string, minStock: number): boolean => {
  const totalStock = getTotalStock(productId);
  return totalStock <= minStock;
};

export const isExpiryNear = (batch: Batch): boolean => {
  const today = new Date();
  const expiryDate = new Date(batch.expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
};

export const isExpired = (batch: Batch): boolean => {
  const today = new Date();
  const expiryDate = new Date(batch.expiryDate);
  return expiryDate < today;
};

export const isProductExpired = (product: Product): boolean => {
  if (!product.expiryDate) return false;
  const today = new Date();
  const expiryDate = new Date(product.expiryDate);
  return expiryDate < today;
};

export const isProductExpiryNear = (product: Product): boolean => {
  if (!product.expiryDate) return false;
  const today = new Date();
  const expiryDate = new Date(product.expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
};

export const getProductBatches = (productId: string): Batch[] => {
  const batches = getBatches();
  return batches.filter((batch) => batch.productId === productId);
};

export const productCodeExists = (code: string, excludeId?: string): boolean => {
  const products = getProducts();
  return products.some((p) => p.code === code && p.id !== excludeId);
};

// Funções para filtros de vencimento (PVPS - Primeiro que Vence, Primeiro que Sai)
export const getDaysUntilExpiry = (expiryDate: string): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const isBatchExpiringIn = (batch: Batch, days: number): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);
  return daysUntilExpiry >= 0 && daysUntilExpiry <= days;
};

export const getCategories = (): string[] => {
  const products = getProducts();
  const categories = products.map(p => p.category).filter(c => c && c.trim() !== "");
  return Array.from(new Set(categories)).sort();
};

// Funções para BatchItems
export const getBatchItems = (): BatchItem[] => {
  const items = localStorage.getItem(STORAGE_KEYS.BATCH_ITEMS);
  return items ? JSON.parse(items) : [];
};

export const saveBatchItems = (items: BatchItem[]) => {
  localStorage.setItem(STORAGE_KEYS.BATCH_ITEMS, JSON.stringify(items));
};

export const getBatchItemsByBatchId = (batchId: string): BatchItem[] => {
  const items = getBatchItems();
  return items.filter((item) => item.batchId === batchId);
};

export const getNextBatchNumber = (): string => {
  const batches = getBatches();
  const numbers = batches
    .map(b => parseInt(b.batchNumber.replace(/\D/g, ""), 10))
    .filter(n => !isNaN(n));
  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `Lote ${String(nextNumber).padStart(3, "0")}`;
};

export const isItemExpiryNear = (item: BatchItem, days: number = 30): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
  return daysUntilExpiry >= 0 && daysUntilExpiry <= days;
};

export const isItemExpired = (item: BatchItem): boolean => {
  const today = new Date();
  const expiryDate = new Date(item.expiryDate);
  return expiryDate < today;
};

export const getItemStatus = (item: BatchItem): "expired" | "expiring" | "ok" => {
  if (isItemExpired(item)) return "expired";
  if (isItemExpiryNear(item, 30)) return "expiring";
  return "ok";
};

export const getAllUniqueProducts = (): { productName: string; sku: string }[] => {
  const items = getBatchItems();
  const uniqueMap = new Map<string, { productName: string; sku: string }>();
  
  items.forEach(item => {
    if (!uniqueMap.has(item.sku)) {
      uniqueMap.set(item.sku, { productName: item.productName, sku: item.sku });
    }
  });
  
  return Array.from(uniqueMap.values());
};

export const getItemsByProduct = (sku: string): BatchItem[] => {
  const items = getBatchItems();
  return items.filter(item => item.sku === sku);
};

export const getTotalItems = (): number => {
  return getBatchItems().length;
};

export const getExpiringItemsCount = (days: number = 30): number => {
  const items = getBatchItems();
  return items.filter(item => isItemExpiryNear(item, days)).length;
};

export const getLowStockCount = (): number => {
  const items = getBatchItems();
  return items.filter(item => item.quantity <= 10).length;
};

// Funções para controle de estoque mínimo
export type StockStatus = "critico" | "baixo" | "ok";

export const getStockStatus = (item: BatchItem): StockStatus => {
  const minStock = item.minStock || 0;
  
  // Crítico: quantidade é 0 ou abaixo do mínimo
  if (item.quantity === 0 || item.quantity < minStock) {
    return "critico";
  }
  
  // Baixo: quantidade entre 1x e 1.5x o mínimo
  if (item.quantity >= minStock && item.quantity <= minStock * 1.5) {
    return "baixo";
  }
  
  // OK: quantidade acima de 1.5x o mínimo
  return "ok";
};

export const getLowStockItems = (): BatchItem[] => {
  const items = getBatchItems();
  return items.filter(item => {
    const status = getStockStatus(item);
    return status === "critico" || status === "baixo";
  });
};

export const getCriticalStockCount = (): number => {
  const items = getBatchItems();
  return items.filter(item => getStockStatus(item) === "critico").length;
};

export const getLowStockAlertCount = (): number => {
  const items = getBatchItems();
  return items.filter(item => {
    const status = getStockStatus(item);
    return status === "critico" || status === "baixo";
  }).length;
};

// Funções para Movements
export const getMovementsByItemId = (batchItemId: string): Movement[] => {
  const movements = getMovements();
  return movements
    .filter(m => m.batchItemId === batchItemId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getRecentMovementsByItemId = (batchItemId: string, limit: number = 5): Movement[] => {
  const movements = getMovementsByItemId(batchItemId);
  return movements.slice(0, limit);
};

// Função para limpar todos os dados (exceto usuários)
export const clearAllData = () => {
  localStorage.removeItem("batches");
  localStorage.removeItem("batchItems");
  localStorage.removeItem("movements");
  localStorage.removeItem("products");
  
  // Reinicializar com arrays vazios
  localStorage.setItem("batches", JSON.stringify([]));
  localStorage.setItem("batchItems", JSON.stringify([]));
  localStorage.setItem("movements", JSON.stringify([]));
  localStorage.setItem("products", JSON.stringify([]));
};

// ============================================
// SISTEMA DE PRIORIDADE ABC
// ============================================

/**
 * Calcula a prioridade automática de um item baseado em:
 * - Valor total (quantidade × preço unitário)
 * - Rotatividade (número de movimentações)
 * - Criticidade (status de estoque)
 */
export const calculateAutoPriority = (item: BatchItem): "A" | "B" | "C" => {
  const movements = getMovementsByItemId(item.id);
  const movementCount = movements.length;
  const totalValue = (item.unitPrice || 0) * item.quantity;
  const stockStatus = getStockStatus(item);
  
  // Pontuação baseada em diferentes critérios
  let score = 0;
  
  // 1. Valor total (40% do peso)
  if (totalValue > 50000) score += 40; // > R$ 500
  else if (totalValue > 20000) score += 25; // > R$ 200
  else if (totalValue > 5000) score += 10; // > R$ 50
  
  // 2. Rotatividade (40% do peso)
  if (movementCount > 20) score += 40;
  else if (movementCount > 10) score += 25;
  else if (movementCount > 5) score += 10;
  
  // 3. Criticidade (20% do peso)
  if (stockStatus === "critico") score += 20;
  else if (stockStatus === "baixo") score += 10;
  
  // Classificação ABC
  if (score >= 70) return "A"; // Alta prioridade
  if (score >= 40) return "B"; // Média prioridade
  return "C"; // Baixa prioridade
};

/**
 * Retorna a prioridade efetiva de um item (manual ou automática)
 */
export const getItemPriority = (item: BatchItem): "A" | "B" | "C" => {
  // Se tem prioridade manual definida, usa ela
  if (item.priority) return item.priority;
  
  // Senão, calcula automática
  return item.priorityAuto || calculateAutoPriority(item);
};

/**
 * Atualiza a prioridade automática de todos os itens
 */
export const updateAllAutoPriorities = (): void => {
  const items = getBatchItems();
  const updatedItems = items.map(item => ({
    ...item,
    priorityAuto: calculateAutoPriority(item),
  }));
  saveBatchItems(updatedItems);
};

/**
 * Retorna itens ordenados por prioridade
 */
export const getItemsByPriority = (priority: "A" | "B" | "C"): BatchItem[] => {
  const items = getBatchItems();
  return items.filter(item => getItemPriority(item) === priority);
};

/**
 * Retorna contagem de itens por prioridade
 */
export const getPriorityCount = (): { A: number; B: number; C: number } => {
  const items = getBatchItems();
  return items.reduce(
    (acc, item) => {
      const priority = getItemPriority(item);
      acc[priority]++;
      return acc;
    },
    { A: 0, B: 0, C: 0 }
  );
};

/**
 * Retorna itens prioritários com alerta (Prioridade A + estoque crítico/baixo)
 */
export const getCriticalPriorityItems = (): BatchItem[] => {
  const items = getBatchItems();
  return items.filter(item => {
    const priority = getItemPriority(item);
    const stockStatus = getStockStatus(item);
    return priority === "A" && (stockStatus === "critico" || stockStatus === "baixo");
  });
};