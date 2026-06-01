# SIGE - Sistema de Gerenciamento de Estoque

Sistema de gerenciamento de estoque para almoxarifado voltado para gastronomia e saúde, com design minimalista usando cores azul e preto.

## 🚀 Características Principais

### Controle por Lotes
- Cada lote possui identificação única e numeração sequencial (Lote 001, Lote 002, etc.)
- Sistema de tabs para navegar entre lotes
- Rastreamento completo de todos os itens em cada lote

### Método PVPS
- Primeiro que Vence, Primeiro que Sai
- Alertas configuráveis de vencimento (3, 5, 7, 14, 30 dias)
- Badges coloridos indicando status dos itens

### Alertas Visuais
- 🔴 **Vermelho**: Produtos vencidos
- 🟡 **Amarelo/Âmbar**: Produtos vencendo em breve
- 🟢 **Verde**: Produtos OK

### Dados Locais
- Todos os dados são armazenados localmente no navegador (localStorage)
- Não requer banco de dados externo
- Funciona offline

## 📋 Funcionalidades por Tela

### 1. Dashboard
- Resumo geral do sistema
- Cards com métricas principais:
  - Total de lotes
  - Total de itens
  - Itens vencendo em 30 dias
  - Itens com estoque baixo

### 2. Lotes
- **Sistema de Tabs**: Cada lote é uma aba independente
- **Criar Novo Lote**: Botão "+ Novo Lote" cria lote sequencial automaticamente
- **Cadastro de Item**: Formulário completo com todos os campos:
  - Código / SKU
  - Nome do produto
  - Quantidade
  - Validade
  - Fornecedor
  - Localização / Prateleira (ex: A-12)
  - Valor unitário (R$)
- **Tabela de Itens**: Visualização de todos os itens do lote com:
  - Badges de status (Vencido, Vencendo, OK)
  - Ações: Editar, Baixa, Excluir
- **Cabeçalho do Lote**: Informações resumidas
  - Data de criação
  - Total de itens
  - Valor total do lote

### 3. Produtos
- **Visão Consolidada**: Lista todos os produtos únicos (por SKU)
- **Informações por Produto**:
  - Quantidade total (soma de todos os lotes)
  - Próxima data de validade
  - Badges dos lotes a que pertence
  - Status geral
- **Busca**: Filtro por nome ou SKU
- **Cards de Resumo**:
  - Total de produtos únicos
  - Produtos vencendo
  - Produtos vencidos

### 4. Relatórios
- **Filtros Avançados**:
  - Por lote específico
  - Por período (data inicial e final)
  - Por dias até vencimento (3, 5, 7, 14, 30 dias)
  - Busca por SKU, produto, fornecedor ou localização
- **Exportação CSV**: Baixa relatório completo com todos os dados
- **Métricas em Tempo Real**:
  - Total de itens filtrados
  - Valor total
  - Itens vencendo
  - Itens vencidos

### 5. Usuários (Admin)
- Gerenciamento de usuários do sistema
- Dois níveis de acesso:
  - **Administrador**: Acesso completo
  - **Usuário**: Acesso às funções operacionais

## 🔐 Autenticação

### Credenciais Padrão
- **Email**: admin@sige.com
- **Senha**: admin123

### Níveis de Acesso
- **Administrador**: Acesso a todas as funcionalidades, incluindo gestão de usuários
- **Usuário**: Acesso às funções operacionais (Dashboard, Lotes, Produtos, Relatórios)

## 💾 Operações Principais

### Criar Novo Lote
1. Clique no botão "+ Novo Lote"
2. Um novo lote será criado automaticamente com numeração sequencial
3. Será aberta a aba do novo lote

### Adicionar Item ao Lote
1. Selecione o lote desejado clicando na sua aba
2. Clique em "Adicionar Item"
3. Preencha o formulário:
   - **Código / SKU** * (obrigatório)
   - **Nome do Produto** * (obrigatório)
   - **Quantidade** * (obrigatório)
   - **Validade** * (obrigatório)
   - Fornecedor (opcional)
   - Localização / Prateleira (opcional)
   - Valor Unitário (opcional)
4. Clique em "Adicionar"

### Realizar Baixa de Estoque
1. Na tabela de itens, clique no ícone de "Baixa" (📦 amarelo)
2. Informe a quantidade a ser dada baixa
3. Opcionalmente, adicione um motivo (ex: "Venda", "Perda", "Uso interno")
4. Clique em "Confirmar Baixa"
5. A quantidade será automaticamente deduzida do estoque

### Editar Item
1. Clique no ícone de "Editar" (✏️ azul)
2. Modifique os campos desejados
3. Clique em "Salvar Alterações"

### Excluir Item
1. Clique no ícone de "Excluir" (🗑️ vermelho)
2. Confirme a exclusão
3. O item será removido permanentemente

### Exportar Relatório
1. Vá para a tela "Relatórios"
2. Configure os filtros desejados
3. Clique em "Exportar CSV"
4. O arquivo será baixado automaticamente

## 🎨 Design

### Paleta de Cores
- **Principal**: Azul (#2563eb, #3b82f6)
- **Fundo**: Preto (#000000) e Cinza Escuro (#18181b, #27272a)
- **Texto**: Branco (#ffffff) e Cinza Claro (#d4d4d8, #a1a1aa)
- **Status**:
  - Verde (#16a34a) - OK
  - Amarelo (#d97706) - Vencendo
  - Vermelho (#dc2626) - Vencido

### Layout
- Sidebar lateral com navegação
- Design responsivo (desktop-first)
- Alta densidade de informação nas tabelas
- Badges coloridos para status visual rápido

## 📊 Estrutura de Dados

### Lote (Batch)
```typescript
{
  id: string
  batchNumber: string  // "Lote 001", "Lote 002", etc.
  createdAt: string
  description?: string
}
```

### Item do Lote (BatchItem)
```typescript
{
  id: string
  batchId: string
  sku: string
  productName: string
  quantity: number
  expiryDate: string
  supplier: string
  location: string
  unitPrice: number  // Em centavos
  createdAt: string
  updatedAt: string
}
```

### Movimentação (Movement)
```typescript
{
  id: string
  batchItemId: string
  type: "entrada" | "saida"
  quantity: number
  date: string
  reason?: string
  createdAt: string
}
```

## 🔄 Fluxo de Trabalho Recomendado

1. **Recebimento de Mercadoria**
   - Criar novo lote
   - Cadastrar todos os itens recebidos no lote
   - Incluir validade, fornecedor e localização

2. **Gestão Diária**
   - Verificar Dashboard para alertas
   - Consultar produtos próximos ao vencimento
   - Priorizar uso dos produtos com base no PVPS

3. **Saída de Produtos**
   - Localizar o item no lote correspondente
   - Realizar baixa com quantidade e motivo
   - Sistema deduz automaticamente do estoque

4. **Relatórios Periódicos**
   - Filtrar por período (semanal/mensal)
   - Exportar dados para análise
   - Verificar produtos com baixa rotatividade

## ⚠️ Observações Importantes

- Os dados são armazenados localmente no navegador
- Limpar o cache do navegador apagará todos os dados
- Recomenda-se fazer backup periódico exportando relatórios
- O sistema funciona melhor em navegadores modernos (Chrome, Firefox, Edge)
- Para uso em produção, considere implementar backup em nuvem

## 🛠️ Tecnologias Utilizadas

- React 18
- TypeScript
- Tailwind CSS v4
- React Router v7
- Radix UI Components
- Lucide React Icons
- LocalStorage API

---

Desenvolvido para facilitar o gerenciamento de estoque em ambientes de gastronomia e saúde com foco em controle de validade e rastreabilidade por lotes.
 