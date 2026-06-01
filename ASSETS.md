# Assets do SIGE

## Logo do SENAC

### Localização
A logo do SENAC está armazenada em dois locais para segurança:

1. **Pasta principal de imports (fonte):**
   - `src/imports/Senac_logo.svg.png`
   - Esta é a imagem original e não deve ser removida

2. **Pasta pública (backup):**
   - `public/senac-logo.png`
   - Cópia de backup da imagem

### Uso
A logo é utilizada em:

1. **Sidebar do Dashboard** (`src/app/pages/DashboardLayout.tsx`)
   - Exibida no topo da barra lateral
   - Importada de: `../../imports/Senac_logo.svg.png`

2. **Tela de Login** (`src/app/pages/LoginPage.tsx`)
   - Exibida acima do título SIGE
   - Importada de: `../imports/Senac_logo.svg.png`

### Especificações
- **Formato:** PNG
- **Tamanho:** ~50KB
- **Nome original:** Senac_logo.svg.png

### ⚠️ IMPORTANTE
**NÃO REMOVA** o arquivo `src/imports/Senac_logo.svg.png`

Este arquivo é essencial para o funcionamento visual do sistema e está referenciado em múltiplos componentes.

### Histórico
- **image-0.png**: Logo antiga do SENAC (mantida como backup)
- **Senac_logo.svg.png**: Logo atual do SENAC em uso (versão oficial)
