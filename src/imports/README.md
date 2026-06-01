# 🖼️ Pasta de Assets - SIGE

## ⚠️ ATENÇÃO - NÃO REMOVA ARQUIVOS DESTA PASTA

Esta pasta contém assets essenciais para o funcionamento do sistema SIGE.

## Arquivos Importantes

### 📌 Senac_logo.svg.png (ATUAL - EM USO)
- **Status:** ✅ ATIVO - EM USO
- **Tamanho:** ~50KB
- **Uso:** Logo oficial do SENAC exibida em:
  - Sidebar do Dashboard
  - Tela de Login
- **⚠️ NÃO REMOVER** - Este arquivo é essencial!

### 📦 image-0.png (BACKUP)
- **Status:** 🔒 BACKUP
- **Tamanho:** ~70KB
- **Uso:** Logo anterior (mantida como backup)
- Pode ser removida se necessário, mas recomenda-se manter

## Como Adicionar Novos Assets

1. Coloque o arquivo nesta pasta (`src/imports/`)
2. Copie também para `public/` como backup
3. Importe no componente usando caminho relativo:
   ```typescript
   import logo from "../../imports/nome-do-arquivo.png";
   ```
4. Documente no arquivo `ASSETS.md` na raiz do projeto

## Estrutura de Importação

De `src/app/pages/`:
```typescript
import asset from "../../imports/arquivo.png";
```

De `src/app/components/`:
```typescript
import asset from "../../imports/arquivo.png";
```

## Backup

Todos os assets importantes devem ter uma cópia em `public/` como medida de segurança.

---

**Última atualização:** 13/04/2026
**Mantido por:** Sistema SIGE
