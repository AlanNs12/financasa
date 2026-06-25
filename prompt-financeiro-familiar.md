# 📋 Prompt de Desenvolvimento — Controle Financeiro Familiar

> Documento completo de especificação técnica para um AI coding agent (Cursor, Windsurf, Claude Code, etc.)

---

## 🎯 Visão Geral do Projeto

Crie um **aplicativo web privado de controle financeiro familiar** para uso exclusivo de um casal. O sistema substitui planilhas com uma interface moderna, organizada e responsiva — inspirada nos designs de aplicativos financeiros mobile com estética minimalista (cartões escuros sobre fundo claro).

**Stack obrigatória:**
- **Framework:** Next.js 14+ com App Router e TypeScript
- **Estilização:** Tailwind CSS + Shadcn UI
- **Backend/BaaS:** Supabase (Auth + PostgreSQL)
- **ORM:** Prisma (abstração para futura migração de banco)
- **Gráficos:** Recharts
- **Formulários:** React Hook Form + Zod
- **Estado global:** Zustand (leve, sem Redux)
- **Datas:** date-fns com locale pt-BR

---

## 📐 Arquitetura do Projeto

```
/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rotas públicas
│   │   ├── login/page.tsx
│   │   └── cadastro/page.tsx
│   ├── (dashboard)/              # Grupo de rotas protegidas
│   │   ├── layout.tsx            # Layout com sidebar/navbar
│   │   ├── page.tsx              # Dashboard (Home)
│   │   ├── transacoes/
│   │   │   ├── page.tsx          # Lista de transações
│   │   │   └── nova/page.tsx     # Formulário nova transação
│   │   ├── contas/
│   │   │   └── page.tsx          # Contas recorrentes
│   │   ├── planejamento/
│   │   │   └── page.tsx          # Orçamento por categoria
│   │   ├── metas/
│   │   │   └── page.tsx          # Metas financeiras
│   │   └── relatorios/
│   │       └── page.tsx          # Gráficos e relatórios
├── components/
│   ├── ui/                       # Shadcn primitivos
│   ├── layout/                   # Sidebar, Navbar, Header
│   ├── dashboard/                # Cards do dashboard
│   ├── transacoes/               # Componentes de transações
│   ├── contas/                   # Componentes de contas fixas
│   ├── metas/                    # Componentes de metas
│   └── shared/                   # Componentes genéricos reutilizáveis
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Cliente browser
│   │   └── server.ts             # Cliente server-side
│   ├── db/
│   │   └── queries/              # Funções de acesso ao banco
│   ├── validations/              # Schemas Zod
│   └── utils.ts                  # Helpers gerais
├── hooks/                        # Custom hooks
├── store/                        # Zustand stores
├── types/                        # Tipos TypeScript globais
└── prisma/
    └── schema.prisma             # Schema do banco
```

---

## 🗄️ Banco de Dados — Schema Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Usuários sincronizados com Supabase Auth
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

// Casa/família — agrupa os dois usuários
model Household {
  id         String   @id @default(uuid())
  name       String   @default("Nossa Casa")
  created_at DateTime @default(now())

  users            User[]
  transactions     Transaction[]
  recurringBills   RecurringBill[]
  budgets          Budget[]
  financialGoals   FinancialGoal[]
  categories       Category[]
}

// Categorias (padrão + personalizadas por household)
model Category {
  id           String   @id @default(uuid())
  household_id String?
  household    Household? @relation(fields: [household_id], references: [id])
  name         String
  icon         String   // emoji ou nome do ícone Lucide
  color        String   // hex color
  type         CategoryType @default(EXPENSE)
  is_default   Boolean  @default(false)

  transactions  Transaction[]
  budgetItems   BudgetItem[]
}

enum CategoryType {
  INCOME
  EXPENSE
  BOTH
}

// Transações (entradas e saídas)
model Transaction {
  id              String          @id @default(uuid())
  household_id    String
  household       Household       @relation(fields: [household_id], references: [id])
  user_id         String
  user            User            @relation(fields: [user_id], references: [id])
  category_id     String
  category        Category        @relation(fields: [category_id], references: [id])
  type            TransactionType
  amount          Decimal         @db.Decimal(10, 2)
  description     String
  date            DateTime        @db.Date
  payment_method  PaymentMethod   @default(PIX)
  notes           String?
  recurring_bill_id String?
  recurring_bill  RecurringBill?  @relation(fields: [recurring_bill_id], references: [id])
  created_at      DateTime        @default(now())
  updated_at      DateTime        @updatedAt
}

enum TransactionType {
  INCOME
  EXPENSE
}

enum PaymentMethod {
  PIX
  CREDIT_CARD
  DEBIT_CARD
  CASH
  BANK_TRANSFER
  BOLETO
}

// Contas recorrentes/fixas
model RecurringBill {
  id           String      @id @default(uuid())
  household_id String
  household    Household   @relation(fields: [household_id], references: [id])
  user_id      String
  user         User        @relation(fields: [user_id], references: [id])
  name         String
  amount       Decimal     @db.Decimal(10, 2)
  due_day      Int         // Dia do mês (1-31)
  recurrence   Recurrence  @default(MONTHLY)
  is_active    Boolean     @default(true)
  created_at   DateTime    @default(now())

  monthlyStatus BillMonthlyStatus[]
  transactions  Transaction[]
}

enum Recurrence {
  MONTHLY
  BIMONTHLY
  QUARTERLY
  SEMIANNUAL
  ANNUAL
}

// Status mensal de cada conta recorrente
model BillMonthlyStatus {
  id              String        @id @default(uuid())
  recurring_bill_id String
  recurring_bill  RecurringBill @relation(fields: [recurring_bill_id], references: [id])
  month           Int           // 1-12
  year            Int
  status          BillStatus    @default(PENDING)
  paid_at         DateTime?
  paid_amount     Decimal?      @db.Decimal(10, 2)

  @@unique([recurring_bill_id, month, year])
}

enum BillStatus {
  PENDING
  PAID
  OVERDUE
  SKIPPED
}

// Orçamento mensal (planejamento)
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

// Item de orçamento por categoria
model BudgetItem {
  id          String   @id @default(uuid())
  budget_id   String
  budget      Budget   @relation(fields: [budget_id], references: [id])
  category_id String
  category    Category @relation(fields: [category_id], references: [id])
  planned     Decimal  @db.Decimal(10, 2)

  @@unique([budget_id, category_id])
}

// Metas financeiras
model FinancialGoal {
  id           String     @id @default(uuid())
  household_id String
  household    Household  @relation(fields: [household_id], references: [id])
  user_id      String
  user         User       @relation(fields: [user_id], references: [id])
  name         String
  description  String?
  target_amount Decimal   @db.Decimal(10, 2)
  current_amount Decimal  @db.Decimal(10, 2) @default(0)
  deadline     DateTime?  @db.Date
  status       GoalStatus @default(IN_PROGRESS)
  icon         String?
  color        String?
  created_at   DateTime   @default(now())
  updated_at   DateTime   @updatedAt
}

enum GoalStatus {
  IN_PROGRESS
  COMPLETED
  PAUSED
  CANCELLED
}

// Tabela de objetivos de orçamento por usuário (opcional)
model BudgetGoal {
  id           String @id @default(uuid())
  user_id      String @unique
  user         User   @relation(fields: [user_id], references: [id])
  monthly_income Decimal @db.Decimal(10, 2)
  updated_at   DateTime @updatedAt
}
```

---

## 🗂️ Categorias Padrão (seed)

Inserir automaticamente ao criar um novo household:

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

## 🖥️ Telas e Componentes

### 1. Autenticação (`/login`, `/cadastro`)

**Layout:** Centralizado, fundo claro, logo + formulário + link de alternância.

```
Components:
- AuthForm (login/cadastro unificado com prop mode)
- Input com label flutuante
- Button com loading state
- Alert de erro
```

**Regras de negócio:**
- Ao criar conta, verificar se já existe household com código de convite
- Primeiro usuário cria o household; segundo entra via código/link
- Redirecionar para `/` após autenticação

---

### 2. Layout do Dashboard (`/layout.tsx`)

**Desktop:** Sidebar fixa à esquerda (240px) + conteúdo principal.
**Mobile:** Bottom navigation bar (igual ao app nas imagens).

```
Sidebar items:
- Home (ícone: LayoutDashboard)
- Transações (ícone: ArrowLeftRight)
- Contas (ícone: Receipt)
- Planejamento (ícone: Target)
- Metas (ícone: Trophy)
- Relatórios (ícone: BarChart3)
- Configurações (ícone: Settings)
```

**Header:** Seletor de mês/ano (dropdown "JUN ▾") presente em todas as telas, nome do usuário.

---

### 3. Dashboard / Home (`/`)

**Cartão principal (dark card):**
```
┌─────────────────────────────────────┐
│  Orçamento Mensal          JUN      │
│                                     │
│  R$ 8.022,57   ←── saldo disponível │
│  ████░░░░░░░░░░░░░░░░  6%          │
│  Gasto: R$ 477,43  |  Meta: R$8.500 │
│           [Ver detalhes]            │
└─────────────────────────────────────┘
```

**Cards de resumo (grid 2x2):**
- Receita do mês (verde)
- Gastos do mês (vermelho)
- Saldo (azul)
- Contas pendentes (amarelo)

**Últimas transações (lista):**
- Ícone da categoria + nome + categoria + valor + data
- Link "Ver todas →"

**Próximas contas:**
- Lista das 3 contas mais próximas do vencimento com status badge

```typescript
// Componentes necessários:
- <MonthlyBudgetCard />
- <SummaryCards />       // grid de 4 cards
- <RecentTransactions /> // lista com skeleton loading
- <UpcomingBills />      // próximas contas
```

---

### 4. Transações (`/transacoes`)

**Filtros no topo:** Mês, tipo (entrada/saída/todos), categoria, pessoa.

**Lista agrupada por data:**
```
13 de junho
  Mercado Assaí   Alimentação   -R$ 189,43
  Uber            Transporte    -R$ 24,90

12 de junho
  Salário         Receita       +R$ 5.000,00
```

**FAB (Floating Action Button):** `+` que abre modal/drawer de nova transação.

**Modal Nova Transação:**
```
- Toggle Entrada / Saída
- Valor (input grande, formatado)
- Descrição
- Data (date picker)
- Categoria (grid de ícones)
- Pessoa responsável (avatar selector)
- Forma de pagamento (chip selector)
- Observação (opcional, collapsible)
- [Cancelar] [Salvar]
```

---

### 5. Contas (`/contas`)

**Cartão de resumo do mês (dark card):**
```
JUNHO
R$ 2.253,67
total de contas
● R$ 119,90 pago
● R$ 2.133,77 restante
                    [5% pago] ← donut chart
```

**Lista "Este mês":**
```
[A] Aluguel          R$ 1.800,00
    Fixo • Vence dia 01 ↻      [Atrasado]

[I] Internet         R$ 119,90
    Fixo • Vence dia 05 ↻      [✓ Pago]

[Á] Água             R$ 85,00
    Fixo • Vence dia 15 ↻      [Pendente]
```

**Status badges:**
- `Pago` → verde claro com ✓
- `Pendente` → amarelo/laranja
- `Atrasado` → vermelho

**Ações:** Toque na conta → modal com opção "Marcar como pago" + valor real.

---

### 6. Planejamento (`/planejamento`)

**Seletor de mês no topo.**

**Card de receita total:** Input para definir receita esperada do mês.

**Lista de categorias com barras de progresso:**
```
🛒 Alimentação
   Gasto: R$ 207,93 de R$ 1.200,00 planejado
   [████░░░░░░░░░░░░░░░░] 17%

🚗 Transporte
   Gasto: R$ 204,90 de R$ 600,00 planejado
   [████████░░░░░░░░░░░░] 34%
```

**Cores das barras:**
- < 70%: verde
- 70–90%: amarelo
- > 90%: vermelho

**Botão:** "Editar planejamento" → permite alterar valores planejados.

---

### 7. Metas (`/metas`)

**Card de resumo:**
```
GASTO          DO ORÇAMENTO
R$ 477,43          6%
[──────────────────────────]
R$ 477,43 de R$ 8.500 em junho
```

**Lista de metas:**
```
[ícone] Reserva de emergência
        R$ 3.200 / R$ 15.000
        [████████░░░░░░░░░░░░] 21%
        Prazo: Dez/2025

[ícone] Viagem Europa
        R$ 8.500 / R$ 20.000
        [████████████░░░░░░░░] 42%
        Prazo: Jun/2026
```

**Botão:** "+ Nova Meta" → drawer lateral com formulário.

---

### 8. Relatórios (`/relatorios`)

**Aba 1 — Gastos por Categoria:**
```
Gráfico de pizza (Recharts PieChart)
+ legenda com valores e percentuais
```

**Aba 2 — Evolução Mensal:**
```
Gráfico de linha/área (últimos 6 meses)
Receitas vs Gastos
```

**Aba 3 — Planejado x Realizado:**
```
Gráfico de barras agrupadas por categoria
```

**Filtro de período:** Mês atual / Últimos 3 meses / Últimos 6 meses / Último ano.

---

## 🎨 Design System

### Paleta de Cores

```css
/* Cores principais */
--background: #f8f9fa        /* fundo geral */
--foreground: #111827        /* texto principal */
--card: #ffffff              /* fundo dos cards */
--card-dark: #1a1a2e         /* card escuro destaque */
--primary: #111827           /* botões primários */
--primary-foreground: #fff

/* Status de transações */
--income: #22c55e            /* verde para entradas */
--expense: #ef4444           /* vermelho para saídas */

/* Status de contas */
--paid: #bbf7d0              /* verde claro */
--pending: #fde68a           /* amarelo */
--overdue: #fecaca           /* vermelho claro */

/* Progresso */
--progress-safe: #22c55e     /* < 70% */
--progress-warning: #f59e0b  /* 70-90% */
--progress-danger: #ef4444   /* > 90% */
```

### Tipografia

```css
--font-sans: 'Inter', sans-serif;
/* Títulos: font-bold text-2xl/3xl */
/* Valores monetários: font-bold tabular-nums */
/* Labels: text-sm text-muted-foreground */
```

### Componentes Compartilhados

```typescript
// Formatação monetária
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)

// Componentes reutilizáveis obrigatórios:
<MoneyDisplay amount={} type="income|expense|neutral" />
<StatusBadge status="paid|pending|overdue|in_progress" />
<CategoryIcon category={} size="sm|md|lg" />
<ProgressBar value={} max={} colorThreshold />
<MonthSelector value={} onChange={} />
<PersonAvatar user={} size="sm|md" />
<EmptyState icon={} title={} description={} action={} />
<LoadingSkeleton variant="card|list|chart" />
```

---

## 🔐 Autenticação e Segurança (Supabase)

### Row Level Security (RLS)

Todas as tabelas devem ter RLS ativo. Políticas:

```sql
-- Exemplo para transactions
CREATE POLICY "Users can only see household transactions"
ON transactions FOR ALL
USING (
  household_id IN (
    SELECT household_id FROM users
    WHERE supabase_id = auth.uid()
  )
);
```

### Middleware de proteção

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && !isPublicRoute(request.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

---

## 📡 Camada de Dados (lib/db/queries)

Organizar queries por domínio:

```typescript
// lib/db/queries/transactions.ts
export async function getTransactionsByMonth(
  householdId: string,
  month: number,
  year: number
): Promise<Transaction[]>

export async function createTransaction(
  data: CreateTransactionInput
): Promise<Transaction>

export async function deleteTransaction(id: string): Promise<void>

// lib/db/queries/bills.ts
export async function getRecurringBills(householdId: string)
export async function updateBillStatus(
  billId: string,
  month: number,
  year: number,
  status: BillStatus,
  paidAmount?: number
)

// lib/db/queries/budget.ts
export async function getBudgetWithProgress(
  householdId: string,
  month: number,
  year: number
)

// lib/db/queries/dashboard.ts
export async function getDashboardSummary(
  householdId: string,
  month: number,
  year: number
): Promise<DashboardSummary>
```

---

## ⚡ Server Actions (Next.js)

Usar Server Actions para mutações:

```typescript
// app/actions/transactions.ts
'use server'
import { revalidatePath } from 'next/cache'

export async function createTransactionAction(formData: FormData) {
  // validar com Zod
  // inserir no banco
  revalidatePath('/transacoes')
  revalidatePath('/') // revalidar dashboard
}
```

---

## 📱 Responsividade

```typescript
// Layout mobile-first
// Desktop: sidebar lateral
// Mobile: bottom navigation bar (igual aos screenshots)

// Bottom nav mobile (fixed bottom)
const navItems = [
  { href: '/contas', icon: Receipt, label: 'Contas' },
  { href: '/', icon: Home, label: 'Home' },
  { href: '/relatorios', icon: BarChart3, label: 'Análise' },
  { href: '/configuracoes', icon: Settings, label: 'Config' },
]
```

---

## 🌱 Seed de Dados de Exemplo

Criar script `prisma/seed.ts` que popula:
- 1 household
- 2 usuários (casal)
- Categorias padrão
- 3 contas recorrentes (Aluguel, Internet, Energia)
- 10 transações do mês atual
- 1 orçamento do mês atual
- 2 metas financeiras

---

## 🚀 Ordem de Implementação

```
Fase 1 — Fundação
  ✅ Setup Next.js + Tailwind + Shadcn
  ✅ Configuração Supabase + Prisma
  ✅ Schema do banco + migrations
  ✅ Autenticação (login/cadastro/logout)
  ✅ Layout base com navegação

Fase 2 — Core
  ✅ Dashboard (home)
  ✅ CRUD de transações
  ✅ Categorias

Fase 3 — Planejamento
  ✅ Contas recorrentes
  ✅ Planejamento mensal

Fase 4 — Análise
  ✅ Metas financeiras
  ✅ Relatórios com gráficos

Fase 5 — Polimento
  ✅ Loading states e skeletons
  ✅ Toast notifications
  ✅ Tratamento de erros
  ✅ PWA manifest (opcional)
```

---

## 📦 package.json — Dependências Principais

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "@supabase/supabase-js": "^2.43.0",
    "@supabase/ssr": "^0.3.0",
    "@prisma/client": "^5.14.0",
    "prisma": "^5.14.0",
    "recharts": "^2.12.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0",
    "zustand": "^4.5.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.383.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "sonner": "^1.5.0"
  }
}
```

---

## 💡 Instruções Finais para o AI Agent

1. **Sempre** formatar valores com `Intl.NumberFormat` no locale `pt-BR`
2. **Sempre** tratar loading e erro em toda operação assíncrona
3. **Nunca** expor `household_id` ou `user_id` no cliente sem validação server-side
4. **Usar** `revalidatePath` após toda mutação para atualizar o cache do Next.js
5. **Criar** tipos TypeScript para cada entidade do banco e inferir dos schemas Zod
6. **Garantir** que o seletor de mês persista no estado global (Zustand) para compartilhar entre telas
7. **Implementar** feedback visual imediato (otimistic updates) onde possível
8. **Mobile first:** todo componente deve funcionar bem em tela de 375px
9. **Acessibilidade:** usar atributos `aria-label` em botões de ícone e `role` corretos
10. **Internacionalização:** todos os textos em pt-BR, datas no formato `dd/MM/yyyy` ou "13 de junho"
```
