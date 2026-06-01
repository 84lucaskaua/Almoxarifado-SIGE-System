# Guia de Configuração para Desenvolvimento Local

Este guia auxilia na configuração do ambiente de desenvolvimento local para o SIGE.

## ✅ Checklist de Configuração

- [x] Node.js 18+ instalado
- [x] pnpm instalado
- [x] VS Code instalado (recomendado)
- [ ] Extensões VS Code instaladas (veja abaixo)

## 📦 Instalação Rápida

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd sige-sistema-estoque

# 2. Instale as dependências
pnpm install

# 3. Inicie o servidor de desenvolvimento
pnpm run dev
```

Acesse: http://localhost:5173

## 🔌 Extensões Recomendadas para VS Code

Instale estas extensões para melhor experiência de desenvolvimento:

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Linting de código JavaScript/TypeScript

2. **Prettier** (`esbenp.prettier-vscode`)
   - Formatação automática de código

3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Autocomplete e hints para classes Tailwind

4. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
   - Renomeia tags HTML/JSX automaticamente

5. **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
   - Snippets úteis para React

6. **Path Intellisense** (`christian-kohler.path-intellisense`)
   - Autocomplete de caminhos de arquivos

7. **TypeScript Nightly** (`ms-vscode.vscode-typescript-next`)
   - Melhor suporte TypeScript

## ⚙️ Configurações Recomendadas do VS Code

Adicione ao seu `settings.json` do VS Code:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "css.validate": false
}
```

## 🗂️ Estrutura do Projeto

```
sige-sistema-estoque/
├── public/              # Arquivos públicos estáticos
│   └── vite.svg         # Favicon
├── src/
│   ├── app/
│   │   ├── components/  # Componentes React organizados por feature
│   │   │   ├── ui/      # Componentes de UI base (shadcn/ui)
│   │   │   ├── audit/   # Sistema de auditoria
│   │   │   ├── profile/ # Edição de perfil
│   │   │   └── ...      # Outros componentes
│   │   ├── contexts/    # Contextos React (Theme)
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Páginas principais
│   │   ├── utils/       # Utilitários e helpers
│   │   ├── App.tsx      # Componente raiz
│   │   └── routes.tsx   # Configuração de rotas
│   ├── imports/         # Imagens e assets
│   ├── styles/          # Estilos globais e tema
│   │   ├── index.css    # Importa todos os estilos
│   │   ├── tailwind.css # Importações Tailwind v4
│   │   ├── theme.css    # Tokens de design
│   │   ├── fonts.css    # Fontes customizadas
│   │   └── globals.css  # Estilos globais
│   └── main.tsx         # Ponto de entrada
├── .env.example         # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo git
├── index.html           # Template HTML
├── package.json         # Dependências e scripts
├── postcss.config.mjs   # Configuração PostCSS
├── tsconfig.json        # Configuração TypeScript
├── tsconfig.node.json   # TS config para arquivos de build
├── vite.config.ts       # Configuração Vite
├── README.md            # Documentação principal
└── SETUP.md             # Este arquivo
```

## 🎯 Principais Tecnologias

### Core
- **React 18.3.1** - UI library
- **TypeScript 5.7** - Type safety
- **Vite 6.3.5** - Build tool
- **React Router 7** - Routing

### Styling
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Accessible components

### Data & Forms
- **React Hook Form** - Form validation
- **date-fns** - Date utilities

### Visualization
- **Recharts** - Charts
- **jsPDF** - PDF generation
- **XLSX** - Excel import/export

### UI Enhancements
- **Sonner** - Toast notifications
- **Motion** - Animations
- **Lucide React** - Icons

## 🔑 Credenciais de Desenvolvimento

**Administrador:**
- Email: `admin@sige.com`
- Senha: `admin123`
- PIN: `1234`

**Usuário de Teste:**
Crie novos usuários através do painel de administração.

## 🐛 Solução de Problemas

### Erro: "Module not found"
```bash
# Limpe node_modules e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: TypeScript não reconhece tipos
```bash
# Reinicie o servidor TypeScript no VS Code
# Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### Erro: Tailwind classes não funcionam
```bash
# Verifique se o servidor está rodando
# e que src/styles/index.css importa o tailwind.css
```

### Port 5173 já em uso
```bash
# Mude a porta no vite.config.ts
# ou mate o processo usando a porta:
lsof -ti:5173 | xargs kill -9  # Mac/Linux
# npx kill-port 5173            # Windows
```

## 📚 Recursos Úteis

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Vite Guide](https://vite.dev/guide/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [React Router Docs](https://reactrouter.com)

## 🚀 Próximos Passos

Após configurar o ambiente:

1. ✅ Execute `pnpm run dev` e acesse http://localhost:5173
2. ✅ Faça login com as credenciais de admin
3. ✅ Explore o dashboard e funcionalidades
4. ✅ Crie produtos e lotes de teste
5. ✅ Teste as funcionalidades de importação/exportação
6. ✅ Explore o sistema de auditoria
7. ✅ Teste a edição de perfil

## 💡 Dicas de Desenvolvimento

- Use o atalho `Cmd/Ctrl + K` para abrir a busca global
- O sistema salva automaticamente no localStorage
- Use a funcionalidade de exportação CSV para backup
- O tema claro/escuro alterna com o botão no sidebar
- Logs de auditoria registram todas as ações importantes

---

**Precisa de ajuda?** Abra uma issue no repositório!
