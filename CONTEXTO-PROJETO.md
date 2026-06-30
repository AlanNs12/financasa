# Financasa — Contexto Completo do Projeto

> Documento gerado para transferência de contexto entre IAs. Contém o estado atual do código, arquitetura, decisões, pendências e instruções para modificações.

---

## 1. Visão Geral

**Financasa** é um aplicativo web **privado de controle financeiro familiar**, voltado para uso exclusivo de um casal. Substitui planilhas por uma interface moderna, responsiva e minimalista (cartões escuros sobre fundo claro, inspirada em apps financeiros mobile).

- **Status:** Em desenvolvimento ativo. Maioria das telas funcionais com dados reais (Supabase + Prisma); algumas telas ainda usam dados mock.
- **Branch:** `main` (com alterações não commitadas — ver seção "Estado do Git").
- **Locale:** pt-BR em todos os textos e formatos.

---

## 2. Stack e Versões (package.json real)

> ⚠️ **IMPORTANTE:** O `prompt-financeiro-familiar.md` (especificação original) cita versões antigas (Next 14, React 18, Tailwind 3, Zod 3, etc.). **O projeto real usa versões mais novas** — siga o `package.json` real abaixo, não a especificação.

```json
{
  "dependencies": {
    "@base-ui/react": "^1.6.0",
    "@hookform/resolvers": "^5.4.0",
    "@prisma/client": "^6.19.3",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.4.0",
    "lucide-react": "^1.21.0",
    "next": "^16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-hook-form": "^7.80.0",
    "recharts": "^3.9.0",
    "shadcn": "^4.11.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.4.3",
    "zustand": "^5.0.14"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "dotenv": "^17.4.2",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "prisma": "^6.19.3",
    "tailwindcss": "^4",
    "tsx": "^4.22.4",
    "typescript": "^5"
  }
}
```

### Scripts disponíveis
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

### ⚠️ Aviso crítico sobre o Next.js
Conforme `AGENTS.md`: **esta versão do Next.js (16) tem breaking changes** em APIs, convenções e estrutura de arquivos. Antes de escrever código Next.js, **consulte os guias em `node_modules/next/dist/docs/`** e respeite avisos de deprecation. Não confie em conhecimento pré-treino sobre Next.js.

---

## 3. Variáveis de Ambiente (não commitadas)

O `.env` está no `.gitignore`. Variáveis esperadas (baseado no código):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...          # usado pelo Prisma (pooler)
DIRECT_URL=...            # connection direta do Prisma
```

---

## 4. Estrutura de Diretórios (estado real)

```
financasa/
├── app/
│   ├── (auth)/
│   │   ├── cadastro/page.tsx      # Cadastro (nova casa OU entrar via código convite)
│   │   ├── layout.tsx             # Layout centralizado auth
│   │   └── login/page.tsx         # Login com RHF + Zod
│   ├── (dashboard)/
│   │   ├── configuracoes/
│   │   │   ├── copy-button.tsx    # Botão copiar código convite (client)
│   │   │   └── page.tsx           # Config: código convite + logout
│   │   ├── contas/page.tsx        # Contas recorrentes (server, usa ContasClient)
│   │   ├── layout.tsx             # Sidebar + Header + BottomNav
│   │   ├── metas/page.tsx         # ⚠️ MOCK — ainda usa mockGoals
│   │   ├── page.tsx               # Dashboard/Home (server, dados reais)
│   │   ├── planejamento/page.tsx  # Planejamento (server, dados reais)
│   │   ├── relatorios/page.tsx    # ⚠️ MOCK — gráficos com dados hardcoded
│   │   └── transacoes/page.tsx    # Transações (server, usa TransactionsClient)
│   ├── actions/
│   │   ├── auth.ts                # signIn, signUp, signOut (server actions)
│   │   ├── bills.ts               # markBillAsPaidAction, createRecurringBillAction
│   │   ├── budget.ts              # updateBudgetIncomeAction, upsertBudgetItemAction
│   │   ├── goals.ts               # createGoalAction (⚠ não conectado à tela)
│   │   └── transactions.ts        # createTransactionAction, deleteTransactionAction
│   ├── globals.css                # Tema Tailwind v4 + variáveis CSS
│   ├── layout.tsx                 # Root layout (Inter, Toaster sonner)
│   └── favicon.ico
├── components/
│   ├── contas/
│   │   ├── bills-history.tsx      # Histórico expansível por mês
│   │   ├── contas-client.tsx      # Tab "Este mês" / "Histórico", dark card resumo
│   │   └── new-bill-modal.tsx     # Modal nova conta (fixa OU parcelada)
│   ├── dashboard/
│   │   ├── monthly-budget-card.tsx # Dark card principal do dashboard
│   │   ├── recent-transactions.tsx
│   │   ├── summary-cards.tsx       # Grid 4 cards (receita/gastos/saldo/pendentes)
│   │   └── upcoming-bills.tsx
│   ├── layout/
│   │   ├── bottom-nav.tsx         # Nav mobile (4 itens: Contas, Home, Análise, Config)
│   │   ├── header.tsx             # Header sticky com MonthSelector + avatar
│   │   ├── month-selector.tsx     # Seletor mês/ano via query params (?month=&year=)
│   │   └── sidebar.tsx            # Sidebar desktop (6 itens + Config + Sair)
│   ├── planejamento/
│   │   └── planejamento-client.tsx # Edição inline de receita e planejado por categoria
│   ├── shared/
│   │   ├── category-icon.tsx      # Ícone emoji com fundo colorido
│   │   ├── empty-state.tsx
│   │   ├── loading-skeleton.tsx   # variant: card | list | chart | text
│   │   ├── money-display.tsx      # Valor com sinal + cor (income/expense/neutral)
│   │   ├── person-avatar.tsx      # Iniciais ou imagem
│   │   ├── progress-bar.tsx       # Cor dinâmica: <70% verde, 70-90% amarelo, >90% vermelho
│   │   └── status-badge.tsx       # paid/pending/overdue/in_progress/completed/cancelled
│   ├── transacoes/
│   │   ├── fab.tsx                # Botão flutuante +
│   │   ├── new-transaction-modal.tsx  # Modal nova transação (RHF + Zod)
│   │   ├── transaction-list.tsx   # Lista agrupada por data + filtro tipo
│   │   └── transactions-client.tsx   # Orquestra lista + FAB + modal
│   └── ui/
│       └── button.tsx             # Botão shadcn (base-ui/react) — ÚNICO primitivo shadcn atual
├── lib/
│   ├── db/
│   │   ├── prisma.ts              # Singleton PrismaClient
│   │   └── queries/
│   │       ├── bills.ts           # getRecurringBills, getBillsHistory, createRecurringBill, updateBillStatus
│   │       ├── budget.ts          # getPlanejamentoData, getBudgetWithProgress
│   │       ├── categories.ts      # getCategories, createDefaultCategories (12 categorias seed)
│   │       ├── dashboard.ts       # getDashboardSummary (⚠ não usado diretamente — dashboard calcula in-place)
│   │       ├── goals.ts           # getFinancialGoals, createFinancialGoal
│   │       ├── transactions.ts    # getTransactionsByMonth, createTransaction, deleteTransaction
│   │       └── user.ts            # getCurrentUserHousehold, createUserAndHousehold, joinHouseholdByInviteCode, getHouseholdInviteCode
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   └── server.ts             # createServerClient (cookies)
│   ├── validations/
│   │   ├── auth.ts               # loginSchema, registerSchema (com invite_code opcional)
│   │   ├── bill.ts               # recurringBillSchema (fixa/parcelada)
│   │   ├── budget.ts             # budgetSchema
│   │   ├── goal.ts               # goalSchema
│   │   └── transaction.ts        # transactionSchema
│   ├── format.ts                 # formatCurrency, formatDate, formatDateFull, formatPercentage, getMonthName, getMonthAbbr
│   └── utils.ts                  # cn() (clsx + tailwind-merge)
├── prisma/
│   └── schema.prisma             # Schema completo (ver seção 6)
├── store/
│   ├── auth-store.ts             # Zustand: userName, userEmail (⚠ pouco usado — header lê daqui)
│   └── month-store.ts            # Zustand: month, year + navegacao (⚠ NÃO usado — mês vem de query params)
├── types/
│   └── index.ts                  # Tipos TS globais (Transaction, Category, etc.)
├── middleware.ts                 # Protege rotas; redireciona /login se sem user
├── AGENTS.md                     # Regras: Next.js 16 breaking changes
├── CLAUDE.md                     # Apenas @AGENTS.md
├── prompt-financeiro-familiar.md # Especificação original (DESATUALIZADA em versões — ver seção 2)
└── README.md                     # Boilerplate create-next-app
```

---

## 5. Convenções e Padrões de Código

1. **Server Components por padrão** — páginas são `async` e buscam dados via Prisma. Marca `'use client'` só quando precisa de estado/hooks.
2. **Server Actions** em `app/actions/*.ts` com `'use server'` + `revalidatePath` após mutações.
3. **Camada de queries** em `lib/db/queries/*.ts` — funções async que encapsulam Prisma. Páginas e actions chamam essas funções (não chamam Prisma diretamente, exceto `budget.ts` action que usa `prisma` direto).
4. **Validação** com Zod em `lib/validations/*.ts`; formulários com React Hook Form + `zodResolver`.
5. **Autenticação**: Supabase Auth (SSR). `getCurrentUserHousehold()` em `lib/db/queries/user.ts` é o helper central — retorna `{ userId, householdId } | null` validando o usuário Supabase contra a tabela `User` do Prisma.
6. **Seleção de mês**: via **query params** (`?month=6&year=2026`) lidos pelo `MonthSelector` e pelas páginas server. `store/month-store.ts` (Zustand) existe mas **não está integrado**.
7. **Formatação**: sempre `Intl.NumberFormat('pt-BR', ...)` via `lib/format.ts`. Valores monetários com `tabular-nums`.
8. **Decimal**: Prisma retorna `Decimal` para campos `@db.Decimal(10,2)`. Queries fazem `Number(t.amount)` para serializar. Conversão manual em vários lugares.
9. **Toasts**: `sonner` (`toast.success/error`), configurado no root layout em `bottom-center`.
10. **Sem comentários no código** (convenção do projeto).
11. **Estilo**: Tailwind v4 (`@import "tailwindcss"` + `@theme inline` em `globals.css`). Cores via variáveis CSS. Dark card destacado usa `bg-[#1a1a2e]`.

---

## 6. Schema do Banco (prisma/schema.prisma — real)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id           String   @id @default(uuid())
  supabase_id  String   @unique
  name         String
  email        String   @unique
  avatar_url   String?
  household_id String
  household    Household @relation(fields: [household_id], references: [id])
  created_at   DateTime @default(now())

  transactions     Transaction[]
  recurringBills   RecurringBill[]
  budgetGoals      BudgetGoal[]
  financialGoals   FinancialGoal[]
}

model Household {
  id          String   @id @default(uuid())
  name        String   @default("Nossa Casa")
  invite_code String   @unique   // 6 chars, gerado ao criar household
  created_at  DateTime @default(now())

  users            User[]
  transactions     Transaction[]
  recurringBills   RecurringBill[]
  budgets          Budget[]
  financialGoals   FinancialGoal[]
  categories       Category[]
}

model Category {
  id           String       @id @default(uuid())
  household_id String?
  household    Household?   @relation(fields: [household_id], references: [id])
  name         String
  icon         String       // emoji
  color        String       // hex
  type         CategoryType @default(EXPENSE)
  is_default   Boolean      @default(false)

  transactions  Transaction[]
  budgetItems   BudgetItem[]
}

enum CategoryType { INCOME; EXPENSE; BOTH }

model Transaction {
  id                String          @id @default(uuid())
  household_id      String
  household         Household       @relation(fields: [household_id], references: [id])
  user_id           String
  user              User            @relation(fields: [user_id], references: [id])
  category_id       String
  category          Category        @relation(fields: [category_id], references: [id])
  type              TransactionType
  amount            Decimal         @db.Decimal(10, 2)
  description       String
  date              DateTime        @db.Date
  payment_method    PaymentMethod   @default(PIX)
  notes             String?
  recurring_bill_id String?
  recurring_bill    RecurringBill?  @relation(fields: [recurring_bill_id], references: [id])
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
}

enum TransactionType { INCOME; EXPENSE }
enum PaymentMethod { PIX; CREDIT_CARD; DEBIT_CARD; CASH; BANK_TRANSFER; BOLETO }

model RecurringBill {
  id                 String      @id @default(uuid())
  household_id       String
  household          Household   @relation(fields: [household_id], references: [id])
  user_id            String
  user               User        @relation(fields: [user_id], references: [id])
  name               String       // formato: "<emoji> <nome>" (ex: "🏠 Aluguel")
  amount             Decimal     @db.Decimal(10, 2)
  due_day            Int          // 1-31
  recurrence         Recurrence  @default(MONTHLY)
  is_active          Boolean     @default(true)
  installment_total  Int?         // para contas parceladas
  installment_current Int?
  created_at         DateTime    @default(now())

  monthlyStatus BillMonthlyStatus[]
  transactions  Transaction[]
}

enum Recurrence { MONTHLY; BIMONTHLY; QUARTERLY; SEMIANNUAL; ANNUAL }

model BillMonthlyStatus {
  id                String        @id @default(uuid())
  recurring_bill_id String
  recurring_bill    RecurringBill @relation(fields: [recurring_bill_id], references: [id])
  month             Int
  year              Int
  status            BillStatus    @default(PENDING)
  paid_at           DateTime?
  paid_amount       Decimal?      @db.Decimal(10, 2)

  @@unique([recurring_bill_id, month, year])
}

enum BillStatus { PENDING; PAID; OVERDUE; SKIPPED }

model Budget {
  id           String   @id @default(uuid())
  household_id String
  household    Household @relation(fields: [household_id], references: [id])
  month        Int
  year         Int
  total_income Decimal  @db.Decimal(10, 2) @default(0)
  created_at   DateTime @default(now())

  items BudgetItem[]

  @@unique([household_id, month, year])
}

model BudgetItem {
  id          String   @id @default(uuid())
  budget_id   String
  budget      Budget   @relation(fields: [budget_id], references: [id])
  category_id String
  category    Category @relation(fields: [category_id], references: [id])
  planned     Decimal  @db.Decimal(10, 2)

  @@unique([budget_id, category_id])
}

model FinancialGoal {
  id             String     @id @default(uuid())
  household_id   String
  household      Household  @relation(fields: [household_id], references: [id])
  user_id        String
  user           User       @relation(fields: [user_id], references: [id])
  name           String
  description    String?
  target_amount  Decimal    @db.Decimal(10, 2)
  current_amount Decimal    @db.Decimal(10, 2) @default(0)
  deadline       DateTime?  @db.Date
  status         GoalStatus @default(IN_PROGRESS)
  icon           String?
  color          String?
  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt
}

enum GoalStatus { IN_PROGRESS; COMPLETED; PAUSED; CANCELLED }

model BudgetGoal {
  id             String   @id @default(uuid())
  user_id        String   @unique
  user           User     @relation(fields: [user_id], references: [id])
  monthly_income Decimal  @db.Decimal(10, 2)
  updated_at     DateTime @updatedAt
}
```

### Categorias padrão (seed em `createDefaultCategories`)
Criadas automaticamente ao criar novo household (em `lib/db/queries/categories.ts`):

| Nome | Ícone | Cor | Tipo |
|------|-------|-----|------|
| Moradia | 🏠 | #6366f1 | EXPENSE |
| Alimentação | 🛒 | #f59e0b | EXPENSE |
| Transporte | 🚗 | #3b82f6 | EXPENSE |
| Saúde | 💊 | #ef4444 | EXPENSE |
| Educação | 📚 | #8b5cf6 | EXPENSE |
| Lazer | 🎮 | #ec4899 | EXPENSE |
| Assinaturas | 📱 | #14b8a6 | EXPENSE |
| Compras | 🛍️ | #f97316 | EXPENSE |
| Outros | 💼 | #6b7280 | EXPENSE |
| Salário | 💰 | #22c55e | INCOME |
| Freelance | 💻 | #10b981 | INCOME |
| Investimentos | 📈 | #06b6d4 | INCOME |

---

## 7. Estado de Implementação por Tela

### ✅ Autenticação (`/login`, `/cadastro`) — FUNCIONAL
- Login com RHF + Zod (`loginSchema`).
- Cadastro com toggle **"Nova casa"** vs **"Entrar em casa"** (código de convite).
- `signUp` server action: cria user no Supabase Auth, depois cria Household + User no Prisma (ou entra via `invite_code`).
- Redirecionamento via middleware.

### ✅ Dashboard / Home (`/`) — FUNCIONAL (dados reais)
- `MonthlyBudgetCard` (dark card `#1a1a2e`): orçamento mensal, saldo, barra de progresso, link p/ planejamento.
- `SummaryCards`: grid 4 cards (receita, gastos, saldo, contas pendentes).
- `RecentTransactions` (5 últimas) + `UpcomingBills` (3 próximas).
- Cálculos feitos in-place na página server (`app/(dashboard)/page.tsx`).

### ✅ Transações (`/transacoes`) — FUNCIONAL
- Lista agrupada por data, filtro por tipo (Todos/Entradas/Saídas).
- FAB + modal nova transação (RHF + Zod + Server Action).
- Toggle Entrada/Saída, valor, descrição, data, categoria (grid de ícones), pagamento, observação.
- `deleteTransactionAction` existe mas **não exposta na UI** (sem botão deletar).

### ✅ Contas (`/contas`) — FUNCIONAL
- Dark card resumo do mês (total/pago/restante + barra).
- Tab **"Este mês"** / **"Histórico"** (histórico expansível dos últimos 6 meses).
- Lista de contas com status badge (Pago/Pendente/Atrasado).
- Expande ao tocar → "Marcar como pago".
- Modal nova conta com toggle **Fixa/Parcelada** (parcelada tem `installment_total`).
- Ícone armazenado como prefixo no `name` (formato `"🏠 Aluguel"`), extraído via regex no client.
- `updateBillStatus` incrementa `installment_current` e desativa bill ao finalizar parcelas.

### ✅ Planejamento (`/planejamento`) — FUNCIONAL
- Card receita total do mês (editável inline).
- Lista de categorias com gasto vs planejado + barra colorida.
- Edição inline do valor planejado por categoria.
- Server actions `updateBudgetIncomeAction` e `upsertBudgetItemAction`.

### ⚠️ Metas (`/metas`) — MOCK (dados hardcoded)
- Usa `mockGoals` (3 metas fixas no código) e `monthlySpent`/`monthlyBudget` hardcoded.
- Modal "Nova meta" **não funciona** (form sem `onSubmit` real, não chama `createGoalAction`).
- `app/actions/goals.ts` tem `createGoalAction` pronto mas **desconectado**.
- `lib/db/queries/goals.ts` tem `getFinancialGoals` e `createFinancialGoal` prontos.
- **Pendência:** converter para server component, buscar metas reais, conectar modal ao action.

### ⚠️ Relatórios (`/relatorios`) — MOCK (dados hardcoded)
- 3 abas: Gastos por categoria (PieChart), Evolução mensal (LineChart), Planejado x Realizado (BarChart).
- Todos os dados (`categoryData`, `monthlyData`, `budgetVsActual`) são **hardcoded**.
- **Pendência:** criar queries reais e alimentar os gráficos.

### ✅ Configurações (`/configuracoes`) — FUNCIONAL
- Mostra código de convite da household (com botão copiar).
- Logout.

---

## 8. Layout e Navegação

### Desktop
- Sidebar fixa esquerda (240px / `w-60`), itens: Home, Transações, Contas, Planejamento, Metas, Relatórios + Configurações + Sair.
- Conteúdo com `lg:pl-60`, `max-w-6xl mx-auto`.

### Mobile
- Bottom nav fixa (4 itens: Contas, Home, Análise, Config) — **diferente da sidebar**, tem menos itens.
- `pb-24` no main para não esconder conteúdo atrás da bottom nav.

### Header
- Sticky top, contém `MonthSelector` (chevrons ← → + label "JUN 2026") e avatar/nome usuário.
- `MonthSelector` manipula query params (`?month=&year=`) via `useRouter`.
- `store/auth-store.ts` (Zustand) guarda `userName` mas **não é populado** após login — header mostra "Usuário" como fallback.

---

## 9. Design System (globals.css)

### Paleta (`:root`)
```css
--background: #f8f9fa;
--foreground: #111827;
--card: #ffffff;
--primary: #111827;
--secondary: #f3f4f6;
--muted-foreground: #6b7280;
--border: #e5e7eb;
--radius: 0.75rem;

--income: #22c55e;        /* verde entradas */
--expense: #ef4444;       /* vermelho saídas */
--paid: #bbf7d0;          /* verde claro */
--pending: #fde68a;       /* amarelo */
--overdue: #fecaca;       /* vermelho claro */
--progress-safe: #22c55e;    /* <70% */
--progress-warning: #f59e0b; /* 70-90% */
--progress-danger: #ef4444;  /* >90% */
```
- Dark card destaque: `bg-[#1a1a2e]` com texto branco.
- Tema dark definido em `.dark` mas **não há toggle de tema ativo**.
- Font: Inter (`next/font/google`, variável `--font-sans`).
- Scrollbar customizada (6px).
- Safe area mobile: `.safe-area-bottom`.

---

## 10. Componentes Shadcn UI

- **Apenas `components/ui/button.tsx`** está instalado (baseado em `@base-ui/react`, não Radix).
- **Atenção:** `shadcn` v4 está nas deps. Para adicionar novos componentes, use o CLI do shadcn. O projeto **não tem** componentes como Dialog, Select, Popover, etc. — modais são construídos manualmente com `fixed inset-0 + bg-black/40`.

---

## 11. Estado Global (Zustand)

- `store/auth-store.ts`: `userName`, `userEmail`, `setUser`, `clearUser`. **Pouco usado** — header lê daqui mas nada popula.
- `store/month-store.ts`: `month`, `year`, navegacao. **Não integrado** — mês vem de query params.
- **Pendência:** decidir se remove esses stores ou integra (especificação original pedia mês compartilhado via Zustand).

---

## 12. Pendências Conhecidas e Pontos de Atenção

| # | Item | Detalhe |
|---|------|---------|
| 1 | **Metas usa mock** | `app/(dashboard)/metas/page.tsx` é client component com `mockGoals`. Converter p/ server, usar `getFinancialGoals`, conectar modal ao `createGoalAction`. |
| 2 | **Relatórios usa mock** | `app/(dashboard)/relatorios/page.tsx` com dados hardcoded. Criar queries (gastos por categoria, evolução 6 meses, planejado x realizado) e alimentar gráficos. |
| 3 | **Deletar transação sem UI** | `deleteTransactionAction` existe mas nenhum botão chama. Adicionar swipe/long-press ou botão no item. |
| 5 | **auth-store não populado** | Header mostra "Usuário". Buscar nome do user em `getCurrentUserHousehold` e popular, ou remover store. |
| 6 | **month-store não integrado** | Mês via query params funciona, mas Zustand está órfão. |
| 7 | **Sem seed script** | `prisma/seed.ts` foi **deletado**. `prisma.config.ts` também. Para dados de teste, usar `prisma db push` + cadastro manual. |
| 8 | **RLS Supabase** | A especificação pedia RLS, mas o middleware faz auth gate. **Não há políticas RLS documentadas** — verificar no Supabase. |
| 9 | **UI shadcn limitada** | Só `button` instalado. Modais são manuais. Considerar adicionar Dialog/Select/Popover se precisar. |
| 10 | **Bottom nav vs Sidebar** | Bottom nav tem 4 itens; sidebar tem 6+Config. Metas/Transações/Planejamento não aparecem na bottom nav mobile. |
| 11 | **`getDashboardSummary` não usado** | `lib/db/queries/dashboard.ts` existe mas o dashboard calcula in-place. Considerar consolidar. |
| 12 | **Avisos CRLF** | Git avisa LF→CRLF no Windows. Configurar `.gitattributes` se necessário. |
| 13 | **Sem testes** | Nenhum teste automatizado no projeto. |

---

## 13. Estado do Git

- **Branch:** `main`, em dia com `origin/main`.
- **Commits:** apenas 2 (`b2d5bf6 Initial commit`, `093fcb3 initial-commit`).
- **Alterações não staged (working tree):** muitas modificações ainda não commitadas, incluindo:
  - Novos arquivos: `app/(dashboard)/configuracoes/`, `components/contas/`, `components/planejamento/`, `components/transacoes/transactions-client.tsx`, `lib/db/queries/user.ts`.
  - Deletados: `prisma.config.ts`, `prisma/seed.ts`.
  - Modificados: várias páginas, actions, queries, validations, `package.json`, `schema.prisma`.
- **Não commitar** a menos que explicitamente solicitado.

---

## 14. Instruções para Modificações

1. **Leia `node_modules/next/dist/docs/`** antes de usar APIs Next.js (versão 16 tem breaking changes).
2. **Siga os padrões existentes:** server components + queries em `lib/db/queries/` + server actions em `app/actions/` + RHF/Zod.
3. **Sempre** use `formatCurrency` de `lib/format.ts` para valores.
4. **Sempre** use `revalidatePath` após mutações (revalidar `/` e a rota específica).
5. **Use `getCurrentUserHousehold()`** para obter `userId`/`householdId` — nunca exponha IDs no cliente sem validação server-side.
6. **Mês/ano:** ler de `searchParams` nas páginas server; `MonthSelector` já gerencia query params.
7. **Decimal:** converter com `Number()` ao serializar para o cliente.
8. **Sem comentários no código.**
9. **Mobile-first:** todo componente deve funcionar em 375px.
10. **Acessibilidade:** `aria-label` em botões de ícone.
11. **Rodar `npm run lint`** após mudanças (eslint configurado via `eslint-config-next`).
12. **Rodar `npm run build`** para validar tipos antes de finalizar.

---

## 15. Comandos Úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção (valida tipos)
npm run lint         # ESLint
npm run db:generate  # Regenera Prisma Client após mudar schema
npm run db:push      # Aplica schema ao banco (sem migration)
npm run db:studio    # Prisma Studio (GUI do banco)
```

---

## 16. Mapa de Rotas

| Rota | Tipo | Estado | Componente principal |
|------|------|--------|----------------------|
| `/login` | Client | ✅ | `app/(auth)/login/page.tsx` |
| `/cadastro` | Client | ✅ | `app/(auth)/cadastro/page.tsx` |
| `/` | Server | ✅ | `app/(dashboard)/page.tsx` |
| `/transacoes` | Server→Client | ✅ | `TransactionsClient` |
| `/contas` | Server→Client | ✅ | `ContasClient` |
| `/planejamento` | Server→Client | ✅ | `PlanejamentoClient` |
| `/metas` | Client (mock) | ⚠️ | `app/(dashboard)/metas/page.tsx` |
| `/relatorios` | Client (mock) | ⚠️ | `app/(dashboard)/relatorios/page.tsx` |
| `/configuracoes` | Server | ✅ | `app/(dashboard)/configuracoes/page.tsx` |

---

## 17. Fluxo de Dados Típico

```
Página (Server Component, async)
  ↓ searchParams (month/year)
  ↓ getCurrentUserHousehold()  ← Supabase Auth + Prisma User
  ↓ queries em lib/db/queries/  ← Prisma
  ↓ serializa Decimal → Number, Date → ISO string
  ↓ passa props simples para Client Component
        ↓ Client Component (useState, useTransition)
        ↓ chama Server Action (app/actions/)
            ↓ valida com Zod
            ↓ muta via Prisma
            ↓ revalidatePath('/')
            ↓ retorna { success } ou { error }
        ↓ toast.success/error
```

---

## 18. Observações Finais

- A especificação original (`prompt-financeiro-familiar.md`) é **referência de design/intenção**, mas **desatualizada** em versões de libs e em alguns detalhes de implementação. Sempre prefira o código real.
- O projeto está ~70% funcional. Faltam principalmente: **Metas** e **Relatórios** com dados reais, **deletar transação** na UI, e polimento (auth-store, seed).
- A interface está visualmente alinhada à especificação (dark cards `#1a1a2e`, fundo `#f8f9fa`, barras coloridas por threshold).
