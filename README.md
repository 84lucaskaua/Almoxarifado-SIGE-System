# SIGE - Sistema de Gerenciamento de Estoque

Sistema completo de gerenciamento de almoxarifado voltado para gastronomia e saúde com design minimalista usando cores azul e preto.

## 🚀 Tecnologias

- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.7** - Superset tipado de JavaScript
- **Vite 6.3.5** - Build tool e dev server extremamente rápido
- **React Router 7** - Roteamento para aplicações React
- **Tailwind CSS v4** - Framework CSS utilitário
- **shadcn/ui** - Componentes reutilizáveis e acessíveis
- **Recharts** - Biblioteca de gráficos para React
- **Sonner** - Sistema de notificações toast
- **jsPDF** - Geração de PDFs
- **XLSX** - Importação/exportação de planilhas Excel

## ✨ Funcionalidades

- ✅ **Autenticação** com dois níveis de acesso (administrador e usuário)
- ✅ **Controle por lotes** com método PVPS (Primeiro que Vence, Primeiro que Sai)
- ✅ **Alertas visuais** para produtos com estoque baixo e/ou validade próxima
- ✅ **Persistência de dados** no localStorage
- ✅ **Tema claro/escuro** com alternância manual
- ✅ **100% responsivo** para desktop e mobile
- ✅ **Dashboard com gráficos** e indicadores visuais
- ✅ **Gestão de perdas e transferências**
- ✅ **Relatórios avançados** com exportação PDF e CSV
- ✅ **Busca global** com atalhos de teclado
- ✅ **Sistema de auditoria completo** com logs de todas as ações
- ✅ **Importação/exportação CSV** para backup de dados
- ✅ **Sistema de PIN** e confirmação em 2 etapas para ações críticas
- ✅ **Editor de perfil** com upload de foto e alteração de senha
- ✅ **Sistema de prioridade ABC** para classificação de produtos

## 📋 Pré-requisitos

- Node.js 18+ instalado
- pnpm instalado (recomendado) ou npm

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd sige-sistema-estoque
```

2. Instale as dependências:
```bash
pnpm install
# ou com npm
npm install
```

3. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
pnpm run dev
# ou com npm
npm run dev
```

O aplicativo estará disponível em: `http://localhost:5173`

## 🏗️ Build para Produção

```bash
pnpm run build
# ou com npm
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 👁️ Preview da Build

```bash
pnpm run preview
# ou com npm
npm run preview
```

## 🔑 Credenciais Padrão

**Administrador:**
- Email: `admin@sige.com`
- Senha: `admin123`
- PIN padrão: `1234`

## 📁 Estrutura do Projeto

```
sige-sistema-estoque/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Contextos React (Theme)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas principais
│   │   ├── utils/           # Funções utilitárias
│   │   ├── App.tsx          # Componente principal
│   │   └── routes.tsx       # Configuração de rotas
│   ├── imports/             # Imagens e assets
│   ├── styles/              # Arquivos de estilo global
│   │   ├── index.css        # Importa todos os estilos
│   │   ├── tailwind.css     # Importações do Tailwind
│   │   ├── theme.css        # Tokens de design e variáveis CSS
│   │   ├── fonts.css        # Fontes customizadas
│   │   └── globals.css      # Estilos globais
│   └── main.tsx             # Ponto de entrada da aplicação
├── index.html               # Template HTML
├── vite.config.ts           # Configuração do Vite
├── tsconfig.json            # Configuração do TypeScript
├── postcss.config.mjs       # Configuração do PostCSS
└── package.json             # Dependências e scripts

```

## 🎨 Personalização

### Tema
O sistema usa variáveis CSS para cores e tokens de design. Edite `src/styles/theme.css` para personalizar:
- Cores primárias e secundárias
- Tamanhos de fonte
- Espaçamentos
- Bordas e sombras

### Fontes
Adicione ou remova fontes em `src/styles/fonts.css`.

## 💾 Persistência de Dados

O sistema utiliza `localStorage` para persistência de dados no navegador. Os dados incluem:
- Usuários e credenciais
- Produtos e lotes
- Movimentações de estoque
- Logs de auditoria
- Configurações de tema

**Atenção:** Os dados são armazenados localmente no navegador. Para backup, utilize a funcionalidade de exportação CSV.

## 🔐 Segurança

- Senhas armazenadas em texto plano no localStorage (apenas para demonstração)
- Sistema de PIN para ações críticas
- Confirmação em 2 etapas para operações destrutivas
- Logs de auditoria completos
- Níveis de acesso (admin/usuário)

**Importante:** Este é um projeto de demonstração. Para produção, implemente:
- Hash de senhas (bcrypt)
- Backend com banco de dados
- Autenticação JWT
- HTTPS obrigatório

## 🛠️ Scripts Disponíveis

- `pnpm run dev` (ou `npm run dev`) - Inicia servidor de desenvolvimento
- `pnpm run build` (ou `npm run build`) - Gera build de produção
- `pnpm run preview` (ou `npm run preview`) - Preview da build de produção

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👥 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no repositório.

---

**Desenvolvido com ❤️ usando React + Vite + TypeScript + Tailwind CSS**
