import {
  Batch,
  BatchItem,
  Movement,
  saveBatches,
  saveBatchItems,
  saveMovements,
} from "./storage";

/**
 * Função para popular o sistema com dados de exemplo
 * Use esta função para testar o histórico e as exportações
 */
export const seedDatabaseWithSampleData = () => {
  const now = new Date();
  
  // Criar 3 lotes
  const batches: Batch[] = [
    {
      id: "batch-001",
      batchNumber: "Lote 001",
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias atrás
    },
    {
      id: "batch-002",
      batchNumber: "Lote 002",
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias atrás
    },
    {
      id: "batch-003",
      batchNumber: "Lote 003",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
    },
  ];

  // Criar itens para cada lote
  const batchItems: BatchItem[] = [
    // Lote 001
    {
      id: "item-001",
      batchId: "batch-001",
      sku: "ARROZ-INT-001",
      productName: "Arroz Integral 1kg",
      quantity: 150,
      minStock: 50,
      unit: "PCT",
      expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
      supplier: "Fornecedor A",
      location: "A-01",
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "item-002",
      batchId: "batch-001",
      sku: "FEIJAO-PRETO-002",
      productName: "Feijão Preto 1kg",
      quantity: 80,
      minStock: 100,
      unit: "PCT",
      expiryDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias
      supplier: "Fornecedor A",
      location: "A-02",
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Lote 002
    {
      id: "item-003",
      batchId: "batch-002",
      sku: "ACUCAR-CRIST-003",
      productName: "Açúcar Cristal 5kg",
      quantity: 45,
      minStock: 30,
      unit: "CX",
      expiryDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 dias
      supplier: "Fornecedor B",
      location: "B-01",
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "item-004",
      batchId: "batch-002",
      sku: "OLEO-SOJA-004",
      productName: "Óleo de Soja 900ml",
      quantity: 120,
      minStock: 80,
      unit: "UN",
      expiryDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 dias
      supplier: "Fornecedor B",
      location: "B-02",
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Lote 003
    {
      id: "item-005",
      batchId: "batch-003",
      sku: "MACARRAO-PENNE-005",
      productName: "Macarrão Penne 500g",
      quantity: 200,
      minStock: 150,
      unit: "PCT",
      expiryDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 dias
      supplier: "Fornecedor C",
      location: "C-01",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "item-006",
      batchId: "batch-003",
      sku: "MOLHO-TOM-006",
      productName: "Molho de Tomate 340g",
      quantity: 75,
      minStock: 40,
      unit: "FR",
      expiryDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias (vencendo!)
      supplier: "Fornecedor C",
      location: "C-02",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Criar movimentações históricas
  const movements: Movement[] = [
    // Entradas iniciais (quando os itens foram criados)
    {
      id: "mov-001",
      batchItemId: "item-001",
      type: "entrada",
      quantity: 200,
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor A",
      observation: "Entrada inicial do lote",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-002",
      batchItemId: "item-002",
      type: "entrada",
      quantity: 150,
      date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor A",
      observation: "Entrada inicial do lote",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-003",
      batchItemId: "item-003",
      type: "entrada",
      quantity: 100,
      date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor B",
      observation: "Entrada inicial do lote",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-004",
      batchItemId: "item-004",
      type: "entrada",
      quantity: 150,
      date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor B",
      observation: "Entrada inicial do lote",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-005",
      batchItemId: "item-005",
      type: "entrada",
      quantity: 250,
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor C",
      observation: "Entrada inicial do lote",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-006",
      batchItemId: "item-006",
      type: "entrada",
      quantity: 100,
      date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor C",
      observation: "Entrada inicial do lote",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Saídas ao longo do tempo
    {
      id: "mov-007",
      batchItemId: "item-001",
      type: "saida",
      quantity: 50,
      date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      reason: "Venda",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-008",
      batchItemId: "item-002",
      type: "saida",
      quantity: 70,
      date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      reason: "Venda",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-009",
      batchItemId: "item-003",
      type: "saida",
      quantity: 55,
      date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      reason: "Venda",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-010",
      batchItemId: "item-004",
      type: "saida",
      quantity: 30,
      date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      reason: "Uso interno",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-011",
      batchItemId: "item-005",
      type: "saida",
      quantity: 50,
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      reason: "Venda",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-012",
      batchItemId: "item-006",
      type: "saida",
      quantity: 25,
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      reason: "Venda",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    // Movimentações recentes
    {
      id: "mov-013",
      batchItemId: "item-001",
      type: "entrada",
      quantity: 100,
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor A",
      observation: "Reposição de estoque",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-014",
      batchItemId: "item-002",
      type: "entrada",
      quantity: 50,
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      supplier: "Fornecedor A",
      observation: "Reposição de estoque",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "mov-015",
      batchItemId: "item-003",
      type: "saida",
      quantity: 20,
      date: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
      reason: "Venda",
      userId: "1",
      userName: "Administrador",
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Salvar tudo no localStorage
  saveBatches(batches);
  saveBatchItems(batchItems);
  saveMovements(movements);

  console.log("✅ Dados de exemplo criados com sucesso!");
  console.log(`📦 ${batches.length} lotes criados`);
  console.log(`📋 ${batchItems.length} itens criados`);
  console.log(`📊 ${movements.length} movimentações criadas`);
  
  return {
    batches,
    batchItems,
    movements,
  };
};

/**
 * Função para limpar os dados de exemplo
 */
export const clearSampleData = () => {
  localStorage.removeItem("batches");
  localStorage.removeItem("batchItems");
  localStorage.removeItem("movements");
  
  console.log("🧹 Dados de exemplo removidos!");
};