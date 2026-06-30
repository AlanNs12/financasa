# Financasa — Contexto Completo do Projeto

> Documento gerado para transferência de contexto entre IAs. Contém o estado atual do código, arquitetura, decisões, pendências e instruções para modificações.

---

## 1. Visão Geral

**Financasa** é um aplicativo web **privado de controle financeiro familiar**, voltado para uso exclusivo de um casal. Substitui planilhas por uma interface moderna, responsiva e minimalista (cartões escuros sobre fundo claro, inspirada em apps financeiros mobile).

- **Status:** Em desenvolvimento ativo. Todas as telas funcionais com dados reais (Supabase + Prisma). Sem dados mock restantes.
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
    "typescript": "^5",
    "vitest": "^4.1.9"
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
  "test": "vitest run",
  "test:watch": "vitest",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:seed": "tsx prisma/seed.ts",
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
│   │   │   └── page.tsx           # Config: convite, theme toggle, cartões, logout
│   │   ├── contas/page.tsx        # Contas recorrentes (server, usa ContasClient)
│   │   ├── dividas/page.tsx       # Dívidas (server, usa DividasClient)
│   │   ├── investimentos/
│   │   │   ├── simulador/page.tsx # Simulador de aposentadoria (server)
│   │   │   └── page.tsx           # Carteira de investimentos (server)
│   │   ├── layout.tsx             # Sidebar + Header + BottomNav (async, busca user)
│   │   ├── metas/page.tsx         # Metas (server, usa MetasClient)
│   │   ├── page.tsx               # Dashboard/Home (server, dados reais + alertas)
│   │   ├── planejamento/page.tsx  # Planejamento (server, dados reais)
│   │   ├── relatorios/
│   │   │   ├── imprimir/
│   │   │   │   ├── layout.tsx     # Layout sem chrome (impressão/PDF)
│   │   │   │   └── page.tsx       # Relatório de impressão (server, @media print)
│   │   │   └── page.tsx           # Relatórios com gráficos recharts (server)
│   │   └── transacoes/page.tsx    # Transações (server, usa TransactionsClient)
│   ├── actions/
│   │   ├── auth.ts                # signIn, signUp, signOut (server actions)
│   │   ├── bills.ts               # markBillAsPaidAction, createRecurringBillAction
│   │   ├── budget.ts              # updateBudgetIncomeAction, upsertBudgetItemAction
│   │   ├── credit-cards.ts        # createCreditCardAction, updateCreditCardAction, deleteCreditCardAction
│   │   ├── debts.ts               # createDebtAction, updateDebtAction, payInstallmentAction, deleteDebtAction
│   │   ├── export.ts              # exportTransactionsCsvAction, exportPlanningCsvAction
│   │   ├── goals.ts               # createGoalAction
│   │   ├── investments.ts         # createInvestmentAction, updateInvestmentAction, deleteInvestmentAction
│   │   ├── theme.ts               # setThemeAction (cookie de tema)
│   │   └── transactions.ts        # createTransactionAction, deleteTransactionAction
│   ├── globals.css                # Tema Tailwind v4 + variáveis CSS + .dark
│   ├── layout.tsx                 # Root layout (Inter, Toaster sonner, script anti-flash dark mode)
│   └── favicon.ico
├── components/
│   ├── configuracoes/
│   │   ├── credit-cards-manager.tsx # Gestão de cartões de crédito (CRUD + modal)
│   │   └── theme-toggle.tsx         # Toggle dark/light mode (client)
│   ├── contas/
│   │   ├── bills-history.tsx      # Histórico expansível por mês
│   │   ├── contas-client.tsx      # Tab "Este mês" / "Histórico", dark card resumo
│   │   └── new-bill-modal.tsx     # Modal nova conta (fixa OU parcelada)
│   ├── dashboard/
│   │   ├── alerts-panel.tsx       # Painel de alertas consolidado (contas, orçamento, cartões)
│   │   ├── monthly-budget-card.tsx # Dark card principal do dashboard
│   │   ├── recent-transactions.tsx
│   │   ├── summary-cards.tsx       # Grid 4 cards (receita/gastos/saldo/pendentes)
│   │   └── upcoming-bills.tsx
│   ├── dividas/
│   │   └── dividas-client.tsx     # Lista dívidas, marcar parcela paga, modal nova dívida
│   ├── investimentos/
│   │   ├── investimentos-client.tsx # Carteira: resumo, pizza, por objetivo, lista, modal
│   │   └── simulador-client.tsx     # Simulador aposentadoria com sliders + gráfico + salvar meta
│   ├── layout/
│   │   ├── bottom-nav.tsx         # Nav mobile (5 itens + "Mais" com bottom sheet)
│   │   ├── header.tsx             # Header sticky com MonthSelector + avatar (props do server)
│   │   ├── month-selector.tsx     # Seletor mês/ano via query params (?month=&year=)
│   │   └── sidebar.tsx            # Sidebar desktop (8 itens + Config + Sair)
│   ├── metas/
│   │   └── metas-client.tsx       # Lista metas, barras progresso invertidas, modal nova meta
│   ├── planejamento/
│   │   └── planejamento-client.tsx # Edição inline + botão exportar CSV
│   ├── relatorios/
│   │   └── relatorios-client.tsx  # 3 abas com gráficos recharts + botão imprimir/PDF
│   ├── shared/
│   │   ├── category-icon.tsx      # Ícone emoji com fundo colorido
│   │   ├── empty-state.tsx
│   │   ├── money-display.tsx      # Valor com sinal + cor (income/expense/neutral)
│   │   ├── person-avatar.tsx      # Iniciais ou imagem
│   │   ├── progress-bar.tsx       # Cor dinâmica + invertColors (p/ metas/investimentos)
│   │   └── status-badge.tsx       # paid/pending/overdue/in_progress/completed/cancelled/paused
│   ├── transacoes/
│   │   ├── fab.tsx                # Botão flutuante +
│   │   ├── new-transaction-modal.tsx  # Modal nova transação (RHF + Zod + select cartão)
│   │   ├── transaction-list.tsx   # Lista + filtro + botão delete + exportar CSV
│   │   └── transactions-client.tsx   # Orquestra lista + FAB + modal
│   └── ui/
│       └── button.tsx             # Botão shadcn (base-ui/react) — ÚNICO primitivo shadcn
├── lib/
│   ├── calculations/
│   │   ├── debts.ts              # calculateDebtProgress, calculateDebtsSummary, calculateInstallmentPayoff
│   │   ├── investments.ts        # calculateInvestmentsSummary, calculateInvestmentGain
│   │   └── retirement.ts         # calculateCompoundGrowth, applyRegressiveTax, calculateNetResult, runSimulation
│   ├── db/
│   │   ├── prisma.ts              # Singleton PrismaClient
│   │   └── queries/
│   │       ├── alerts.ts          # getActiveAlerts (contas, orçamento, cartões)
│   │       ├── bills.ts           # getRecurringBills, getBillsHistory, createRecurringBill, updateBillStatus
│   │       ├── budget.ts          # getPlanejamentoData, getBudgetWithProgress
│   │       ├── categories.ts      # getCategories, createDefaultCategories (12 categorias seed)
│   │       ├── credit-cards.ts    # getCreditCards, getCreditCardSpending, getCreditCardsWithSpending, CRUD
│   │       ├── dashboard.ts       # getDashboardSummary (não usado diretamente)
│   │       ├── debts.ts           # getDebts, getDebtsSummary, createDebt, updateDebt, payInstallment, deleteDebt
│   │       ├── goals.ts           # getFinancialGoals, createFinancialGoal
│   │       ├── investments.ts     # getInvestments, getInvestmentsSummary, getInvestmentsByGoal, CRUD
│   │       ├── reports.ts         # getExpensesByCategory, getMonthlyEvolution, getPlannedVsActual
│   │       ├── transactions.ts    # getTransactionsByMonth, createTransaction, deleteTransaction
│   │       └── user.ts            # getCurrentUserHousehold, getCurrentUser, createUserAndHousehold, joinHouseholdByInviteCode, getHouseholdInviteCode
│   ├── supabase/
│   │   ├── client.ts             # createBrowserClient
│   │   └── server.ts             # createServerClient (cookies)
│   ├── validations/
│   │   ├── auth.ts               # loginSchema, registerSchema (com invite_code opcional)
│   │   ├── bill.ts               # recurringBillSchema (fixa/parcelada)
│   │   ├── budget.ts             # budgetSchema
│   │   ├── credit-card.ts        # creditCardSchema
│   │   ├── debt.ts               # debtSchema
│   │   ├── goal.ts               # goalSchema
│   │   ├── investment.ts         # investmentSchema
│   │   └── transaction.ts        # transactionSchema (com credit_card_id opcional)
│   ├── format.ts                 # formatCurrency, formatDate, formatDateFull, formatPercentage, getMonthName, getMonthAbbr
│   └── utils.ts                  # cn() (clsx + tailwind-merge)
├── prisma/
│   ├── schema.prisma             # Schema completo (ver seção 6)
│   ├── seed.ts                   # Seed: 1 household, 2 users, 12 categorias, 15 transações, 4 contas, 1 budget, 2 metas
│   └── sql/
│       └── enable_rls.sql        # RLS policies (aplicar manualmente no Supabase)
├── types/
│   └── index.ts                  # Tipos TS globais (Transaction, Category, Investment, Debt, CreditCard, etc.)
├── vitest.config.ts              # Config Vitest com path alias @
├── middleware.ts                 # Protege rotas; redireciona /login se sem user
├── AGENTS.md                     # Regras: Next.js 16 breaking changes
├── CLAUDE.md                     # Apenas @AGENTS.md
├── prompt-financeiro-familiar.md # Especificação original (DESATUALIZADA em versões — ver seção 2)
└── README.md                     # Documentação completa do projeto
```

---

## 5. Convenções e Padrões de Código

1. **Server Components por padrão** — páginas são `async` e buscam dados via Prisma. Marca `'use client'` só quando precisa de estado/hooks.
2. **Server Actions** em `app/actions/*.ts` com `'use server'` + `revalidatePath` após mutações.
3. **Camada de queries** em `lib/db/queries/*.ts` — funções async que encapsulam Prisma. Páginas e actions chamam essas funções (não chamam Prisma diretamente, exceto `budget.ts` action que usa `prisma` direto).
4. **Camada de cálculos** em `lib/calculations/*.ts` — funções puras testáveis (sem Prisma/Next). Queries chamam estas funções para calcular.
5. **Validação** com Zod em `lib/validations/*.ts`; formulários com React Hook Form + `zodResolver`.
6. **Autenticação**: Supabase Auth (SSR). `getCurrentUserHousehold()` em `lib/db/queries/user.ts` é o helper central — retorna `{ userId, householdId } | null` validando o usuário Supabase contra a tabela `User` do Prisma. `getCurrentUser()` retorna também `name` e `avatarUrl`.
7. **Seleção de mês**: via **query params** (`?month=6&year=2026`) lidos pelo `MonthSelector` e pelas páginas server. Stores Zustand de mês/auth foram **removidos**.
8. **Formatação**: sempre `Intl.NumberFormat('pt-BR', ...)` via `lib/format.ts`. Valores monetários com `tabular-nums`.
9. **Decimal**: Prisma retorna `Decimal` para campos `@db.Decimal(10,2)`. Queries fazem `Number(t.amount)` para serializar. Conversão manual em vários lugares.
10. **Toasts**: `sonner` (`toast.success/error`), configurado no root layout em `bottom-center`.
11. **Sem comentários no código** (convenção do projeto).
12. **Estilo**: Tailwind v4 (`@import "tailwindcss"` + `@theme inline` em `globals.css`). Cores via variáveis CSS. Dark card destacado usa `bg-[#1a1a2e]`.
13. **Dark mode**: toggle em `/configuracoes` via `ThemeToggle` (client component). Persiste em cookie. Script inline no root layout aplica classe `.dark` antes da hidratação (evita flash). `next/script` com `strategy="beforeInteractive"`.
14. **Testes**: Vitest. Arquivos `*.test.ts` ao lado do arquivo testado. 133 testes cobrindo cálculos, formatação e validações.

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
  investments      Investment[]
}

model Household {
  id          String   @id @default(uuid())
  name        String   @default("Nossa Casa")
  invite_code String   @unique
  created_at  DateTime @default(now())

  users            User[]
  transactions     Transaction[]
  recurringBills   RecurringBill[]
  budgets          Budget[]
  financialGoals   FinancialGoal[]
  categories       Category[]
  investments      Investment[]
  debts            Debt[]
  creditCards      CreditCard[]
}

model Category {
  id           String       @id @default(uuid())
  household_id String?
  household    Household?   @relation(fields: [household_id], references: [id])
  name         String
  icon         String
  color        String
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
  credit_card_id    String?
  credit_card       CreditCard?     @relation(fields: [credit_card_id], references: [id])
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
  name               String
  amount             Decimal     @db.Decimal(10, 2)
  due_day            Int
  recurrence         Recurrence  @default(MONTHLY)
  is_active          Boolean     @default(true)
  installment_total  Int?
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

  investments    Investment[]
}

enum GoalStatus { IN_PROGRESS; COMPLETED; PAUSED; CANCELLED }

model BudgetGoal {
  id             String   @id @default(uuid())
  user_id        String   @unique
  user           User     @relation(fields: [user_id], references: [id])
  monthly_income Decimal  @db.Decimal(10, 2)
  updated_at     DateTime @updatedAt
}

model Investment {
  id                String           @id @default(uuid())
  household_id      String
  household         Household        @relation(fields: [household_id], references: [id])
  user_id           String
  user              User             @relation(fields: [user_id], references: [id])
  name              String
  asset_type        InvestmentType
  goal_id           String?
  goal              FinancialGoal?   @relation(fields: [goal_id], references: [id])
  rate_description  String?
  applied_at        DateTime         @db.Date
  maturity_at       DateTime?        @db.Date
  gross_invested    Decimal          @db.Decimal(10, 2)
  gross_current     Decimal          @db.Decimal(10, 2)
  net_current       Decimal          @db.Decimal(10, 2)
  created_at        DateTime         @default(now())
  updated_at        DateTime         @updatedAt
}

enum InvestmentType { RESERVA_EMERGENCIA; RENDA_FIXA; RENDA_VARIAVEL; PREVIDENCIA; FUNDOS; CRIPTO; OUTROS }

model Debt {
  id                  String      @id @default(uuid())
  household_id        String
  household           Household   @relation(fields: [household_id], references: [id])
  institution         String
  product              String
  classification      DebtType
  down_payment         Decimal?    @db.Decimal(10, 2)
  principal_amount     Decimal     @db.Decimal(10, 2)
  started_at           DateTime    @db.Date
  interest_rate        Decimal     @db.Decimal(5, 2)
  cet_rate             Decimal?    @db.Decimal(5, 2)
  installment_amount   Decimal     @db.Decimal(10, 2)
  installment_total    Int
  installment_paid     Int         @default(0)
  is_settled           Boolean     @default(false)
  created_at           DateTime    @default(now())
  updated_at           DateTime    @updatedAt
}

enum DebtType { EMPRESTIMO_PESSOAL; FINANCIAMENTO_VEICULO; FINANCIAMENTO_IMOVEL; CARTAO_PARCELADO; CONSIGINADO; OUTROS }

model CreditCard {
  id            String        @id @default(uuid())
  household_id  String
  household     Household     @relation(fields: [household_id], references: [id])
  name          String
  issuer        String?
  spending_cap  Decimal?      @db.Decimal(10, 2)
  closing_day   Int?
  due_day       Int?
  is_active     Boolean       @default(true)
  created_at    DateTime      @default(now())

  transactions  Transaction[]
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

### ✅ Dashboard / Home (`/`) — FUNCIONAL (dados reais + alertas)
- `MonthlyBudgetCard` (dark card `#1a1a2e`): orçamento mensal, saldo, barra de progresso, link p/ planejamento.
- `SummaryCards`: grid 4 cards (receita, gastos, saldo, contas pendentes).
- `AlertsPanel`: painel consolidado de alertas (contas a vencer, orçamento estourado, cartão perto do limite). Só aparece quando há alertas. Danger primeiro, warning depois. Clickable → tela relevante.
- `RecentTransactions` (5 últimas) + `UpcomingBills` (3 próximas).
- Cálculos feitos in-place na página server (`app/(dashboard)/page.tsx`).

### ✅ Transações (`/transacoes`) — FUNCIONAL
- Lista agrupada por data, filtro por tipo (Todos/Entradas/Saídas).
- Botão **delete** com modal de confirmação em cada item.
- Botão **Exportar CSV** (separador `;`, BOM UTF-8, compatível com Excel brasileiro).
- FAB + modal nova transação (RHF + Zod + Server Action).
- Toggle Entrada/Saída, valor, descrição, data, categoria (grid de ícones), pagamento, observação.
- Select **"Qual cartão?"** quando payment_method é CREDIT_CARD (populado com cartões ativos).
- `deleteTransactionAction` valida household no server (`deleteMany` com `household_id`).

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
- Botão **Exportar CSV**.
- Server actions `updateBudgetIncomeAction` e `upsertBudgetItemAction`.

### ✅ Metas (`/metas`) — FUNCIONAL (dados reais)
- Server Component async, busca metas via `getFinancialGoals`.
- Cards de meta com barra de progresso invertida (verde = perto de bater a meta).
- Badge de status com variante "Atrasado" quando deadline passou e status é IN_PROGRESS.
- Modal "Nova meta" com RHF + zodResolver, chama `createGoalAction` via `useTransition`.
- Estado vazio com `EmptyState`.

### ✅ Relatórios (`/relatorios`) — FUNCIONAL (dados reais)
- 3 abas: Gastos por categoria (PieChart), Evolução mensal (LineChart), Planejado x Realizado (BarChart).
- Dados reais via `getExpensesByCategory`, `getMonthlyEvolution`, `getPlannedVsActual`.
- `EmptyState` quando dataset vazio.
- Botão **Imprimir / Exportar PDF** abre `/relatorios/imprimir` em nova aba.

### ✅ Imprimir Relatório (`/relatorios/imprimir`) — FUNCIONAL
- Rota com layout sem chrome (sem sidebar/header/bottom-nav).
- Resumo mensal: receita, gastos, saldo, gastos por categoria (tabela), contas (tabela), pendentes/pagas.
- CSS `@media print` otimizado para "Salvar como PDF" do navegador.
- Botão "Imprimir / Salvar PDF" chama `window.print()`.

### ✅ Investimentos (`/investimentos`) — FUNCIONAL
- Card escuro `#1a1a2e`: total investido, valor atual líquido, rentabilidade (R$ + %).
- Gráfico de pizza por tipo de ativo (recharts), cores da paleta do globals.css.
- Seção "Por objetivo": metas com valor investido somado + "Sem objetivo" se houver.
- Lista de investimentos individuais (nome, tipo, data, vencimento, investido/atual/ganho %).
- Modal "Novo investimento" com RHF + Zod, select de objetivo opcional.
- Botão delete com modal de confirmação.
- Link para **Simulador de aposentadoria**.
- Estado vazio com `EmptyState`.

### ✅ Simulador de Aposentadoria (`/investimentos/simulador`) — FUNCIONAL
- Sliders: valor inicial, aporte mensal, prazo (anos), taxa de retorno anual.
- Atualização em tempo real (useMemo), sem botão "calcular".
- Card escuro com valor total acumulado, total aportado, rendimentos.
- Gráfico de área empilhada (aportado + rendimentos) via recharts.
- 3 cenários líquidos: VGBL, PGBL, Outros (tabela regressiva de IR).
- Botão **Salvar como meta** cria `FinancialGoal` com target = valor final, deadline = data futura.
- Aviso de projeção (não garantia).

### ✅ Dívidas (`/dividas`) — FUNCIONAL
- Card escuro: dívida total, total pago, saldo devedor + barra de progresso.
- Lista dívidas ativas primeiro, quitadas depois.
- Cada item: instituição, produto, classificação, parcela atual/total, valor, saldo, barra, juros/CET.
- Botão **Marcar parcela paga** em dívidas ativas (incrementa `installment_paid`, quita automaticamente ao final).
- Badge `StatusBadge` (completed/in_progress).
- Modal "Nova dívida" com RHF + Zod cobrindo todos os campos.
- Botão delete com modal de confirmação.
- Estado vazio com `EmptyState`.

### ✅ Configurações (`/configuracoes`) — FUNCIONAL
- Código de convite da household (com botão copiar).
- **Toggle de tema** (claro/escuro) com persistência em cookie + script anti-flash no root layout.
- **Gestão de cartões de crédito**: lista cartões, criar/editar/desativar (soft delete), modal com nome, emissor, teto de gasto, dia de fechamento, dia de vencimento.
- Logout.

---

## 8. Layout e Navegação

### Desktop
- Sidebar fixa esquerda (240px / `w-60`), 8 itens: Home, Transações, Contas, Planejamento, Metas, Investimentos, Dívidas, Relatórios + Configurações + Sair.
- Conteúdo com `lg:pl-60`, `max-w-6xl mx-auto`.

### Mobile
- Bottom nav fixa (5 itens diretos: Home, Transações, Contas, Planejamento + **"Mais"**).
- Botão **"Mais"** abre bottom sheet (`fixed inset-0 + bg-black/40`) com: Metas, Investimentos, Dívidas, Relatórios, Configurações, Sair.
- `pb-24` no main para não esconder conteúdo atrás da bottom nav.

### Header
- Sticky top, contém `MonthSelector` (chevrons ← → + label "JUN 2026") e avatar/nome usuário.
- `MonthSelector` manipula query params (`?month=&year=`) via `useRouter`.
- Header recebe `user` como prop do Server Component layout (que busca via `getCurrentUser()`). Não usa mais Zustand.
- `PersonAvatar` mostra iniciais do nome quando não há `avatar_url`.

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
- **Dark mode ativo**: classe `.dark` define variáveis CSS inversas. Toggle em `/configuracoes` via `ThemeToggle`. Script inline no root layout (`next/script` com `strategy="beforeInteractive"`) aplica classe antes da hidratação. Persiste em cookie `theme`.
- Font: Inter (`next/font/google`, variável `--font-sans`).
- Scrollbar customizada (6px).
- Safe area mobile: `.safe-area-bottom`.

---

## 10. Componentes Shadcn UI

- **Apenas `components/ui/button.tsx`** está instalado (baseado em `@base-ui/react`, não Radix).
- **Atenção:** `shadcn` v4 está nas deps. Para adicionar novos componentes, use o CLI do shadcn. O projeto **não tem** componentes como Dialog, Select, Popover, etc. — modais são construídos manualmente com `fixed inset-0 + bg-black/40`.

---

## 11. Estado Global (Zustand)

- **Stores removidos.** `store/auth-store.ts` e `store/month-store.ts` foram deletados. O diretório `store/` não existe mais.
- Header recebe nome/avatar do usuário via props do Server Component layout (`getCurrentUser()`).
- Mês/ano gerenciado exclusivamente via query params + `MonthSelector`.
- Zustand permanece nas dependências mas não é usado ativamente.

---

## 12. Pendências Conhecidas e Pontos de Atenção

| # | Item | Detalhe |
|---|------|---------|
| 1 | ~~Metas usa mock~~ | **RESOLVIDO**: Server component com dados reais, modal conectado ao `createGoalAction`. |
| 2 | ~~Relatórios usa mock~~ | **RESOLVIDO**: Server component com queries reais (reports.ts), 3 abas com gráficos. |
| 3 | ~~Deletar transação sem UI~~ | **RESOLVIDO**: Botão delete com modal de confirmação em cada item. |
| 5 | ~~auth-store não populado~~ | **RESOLVIDO**: Store removido. Header usa props do server via `getCurrentUser()`. |
| 6 | ~~month-store não integrado~~ | **RESOLVIDO**: Store removido. Mês via query params exclusivamente. |
| 7 | ~~Sem seed script~~ | **RESOLVIDO**: `prisma/seed.ts` recriado com household, users, categorias, transações, contas, budget, metas. |
| 8 | ~~RLS Supabase~~ | **RESOLVIDO**: Script SQL em `prisma/sql/enable_rls.sql` com RLS habilitado e policies de isolamento por household. Documentado no README.md. Aplicar manualmente no Supabase SQL Editor. |
| 9 | **UI shadcn limitada** | Só `button` instalado. Modais são manuais. Considerar adicionar Dialog/Select/Popover se precisar. |
| 10 | ~~Bottom nav vs Sidebar~~ | **RESOLVIDO**: Bottom nav tem 5 itens + "Mais" (bottom sheet com todas as rotas). |
| 11 | **`getDashboardSummary` não usado** | `lib/db/queries/dashboard.ts` existe mas o dashboard calcula in-place. Considerar consolidar. |
| 12 | **Avisos CRLF** | Git avisa LF→CRLF no Windows. Configurar `.gitattributes` se necessário. |
| 13 | ~~Sem testes~~ | **RESOLVIDO**: Vitest configurado, 133 testes em 12 arquivos cobrindo cálculos, formatação e validações. |
| 14 | **db:push pendente** | Schema tem 3 models novos (Investment, Debt, CreditCard) + credit_card_id em Transaction. Rodar `npm run db:push` para aplicar. |
| 15 | **RLS pendente aplicação** | Script SQL pronto mas não aplicado ao banco. Aplicar manualmente no Supabase SQL Editor. |
| 16 | **Erros lint pré-existentes** | `app/(dashboard)/page.tsx` tem 6 erros de `react-hooks/error-boundaries` (JSX em try/catch). Pré-existentes, não introduzidos pelas tarefas. |

---

## 13. Estado do Git

- **Branch:** `main`, em dia com `origin/main`.
- **Commits:** apenas 2 (`b2d5bf6 Initial commit`, `093fcb3 initial-commit`).
- **Alterações não staged (working tree):** muitas modificações ainda não commitadas, incluindo todos os arquivos criados/modificados pelas tarefas 1.1–4.1.
- **Não commitar** a menos que explicitamente solicitado.

---

## 14. Instruções para Modificações

1. **Leia `node_modules/next/dist/docs/`** antes de usar APIs Next.js (versão 16 tem breaking changes).
2. **Siga os padrões existentes:** server components + queries em `lib/db/queries/` + cálculos em `lib/calculations/` + server actions em `app/actions/` + RHF/Zod.
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
13. **Rodar `npm run test`** para garantir que cálculos e validações continuam corretos.

---

## 15. Comandos Úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção (valida tipos)
npm run lint         # ESLint
npm run test         # Roda testes uma vez (Vitest)
npm run test:watch   # Testes em modo watch
npm run db:generate  # Regenera Prisma Client após mudar schema
npm run db:push      # Aplica schema ao banco (sem migration)
npm run db:seed      # Popula dados de exemplo
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
| `/metas` | Server→Client | ✅ | `MetasClient` |
| `/investimentos` | Server→Client | ✅ | `InvestimentosClient` |
| `/investimentos/simulador` | Server→Client | ✅ | `SimuladorClient` |
| `/dividas` | Server→Client | ✅ | `DividasClient` |
| `/relatorios` | Server→Client | ✅ | `RelatoriosClient` |
| `/relatorios/imprimir` | Server | ✅ | `app/(dashboard)/relatorios/imprimir/page.tsx` |
| `/configuracoes` | Server | ✅ | `app/(dashboard)/configuracoes/page.tsx` |

---

## 17. Fluxo de Dados Típico

```
Página (Server Component, async)
  ↓ searchParams (month/year)
  ↓ getCurrentUserHousehold()  ← Supabase Auth + Prisma User
  ↓ queries em lib/db/queries/  ← Prisma
  ↓ cálculos em lib/calculations/  ← funções puras testáveis
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

## 18. Segurança — Row Level Security (RLS)

O projeto usa **duas camadas de proteção** para isolamento de dados entre households:

1. **Camada de aplicação (Prisma)** — toda query filtra por `household_id` via `getCurrentUserHousehold()`. Camada **primária**, ativa hoje.
2. **Camada de banco (RLS no Supabase)** — policies de Row Level Security no PostgreSQL. Camada **secundária** (defense in depth).

**O RLS NÃO protege o acesso via Prisma** (que usa connection string privilegiada que bypassa RLS). Protege contra vazamento de anon key, uso futuro do supabase-js no browser, e acesso via SQL Editor com role authenticated.

Script SQL em `prisma/sql/enable_rls.sql`. Aplicar manualmente no Supabase SQL Editor. Ver README.md para detalhes.

---

## 19. Observações Finais

- A especificação original (`prompt-financeiro-familiar.md`) é **referência de design/intenção**, mas **desatualizada** em versões de libs e em alguns detalhes de implementação. Sempre prefira o código real.
- O projeto está **~95% funcional**. Todas as telas usam dados reais. Restam: aplicar `db:push` (3 models novos), aplicar RLS no Supabase, e corrigir erros lint pré-existentes no dashboard.
- A interface está visualmente alinhada à especificação (dark cards `#1a1a2e`, fundo `#f8f9fa`, barras coloridas por threshold).
- Dark mode implementado com toggle em `/configuracoes`, persistência em cookie, e script anti-flash no root layout.
- Testes automatizados (Vitest) cobrem cálculos financeiros, formatação e validações Zod — 133 testes, 12 arquivos.
