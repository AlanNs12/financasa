# Contexto Diagnóstico — Ciclo de Fatura Cartão
# Gerado em: 2026-07-10 16:30 (UTC-3)
# Projeto: Financasa

---

## RESUMO DO PROBLEMA

A feature de ciclo de fatura de cartão de crédito foi implementada com a adição das colunas `billing_month` (Int?) e `billing_year` (Int?) ao model `Transaction` no Prisma schema. O arquivo `lib/calculations/billing.ts` foi criado com as funções `calculateBillingPeriod`, `getBillingLabel` e `previewBillingPeriod`, e os testes `lib/calculations/billing.test.ts` (9 testes) passam com sucesso. Todas as queries relevantes (`getTransactionsByMonth`, `getDashboardSummary`, `getExpensesByCategory`, `getMonthlyEvolution`, `getCalendarData`, `getPlanejamentoData`, `getEffectiveIncome`, `getBudgetWithProgress`, `getActiveAlerts`, `getCreditCardSpending`) foram atualizadas com o padrão OR `{ billing_month, billing_year }` ou `{ billing_month: null, date }`. As server actions `createTransactionAction` e `updateTransactionAction` calculam o billing via `computeBilling()`. O modal `new-transaction-modal.tsx` exibe um preview de fatura com `previewBillingPeriod` e `getBillingLabel`, e o `transaction-list.tsx` mostra um badge "Fatura [Mês]" quando o billing difere do mês da compra. O build compila com SUCESSO (✓ Compiled successfully). **O banco de dados tem apenas 2 transações com billing_month preenchido (de 25 totais), e 1 cartão de crédito ("NUbank teste", closing_day=8).** Os erros de lint (12 errors) são pré-existentes e NÃO relacionados ao billing: 8 erros de `react-hooks/error-boundaries` em `app/(dashboard)/page.tsx` (JSX dentro de try/catch) e 4 erros de `@typescript-eslint/no-explicit-any` em `new-transaction-modal.tsx` (uso de `as any` no zodResolver). Não há migration — o projeto usa `prisma db push`.

---

## SCHEMA — Transaction (completo, prisma/schema.prisma:57-79)

```prisma
model Transaction {
  id                String          @id @default(uuid())
  household_id      String
  user_id           String
  category_id       String
  type              TransactionType
  amount            Decimal         @db.Decimal(10, 2)
  description       String
  date              DateTime        @db.Date
  payment_method    PaymentMethod   @default(PIX)
  notes             String?
  recurring_bill_id String?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  credit_card_id    String?
  billing_month     Int?
  billing_year      Int?
  category          Category        @relation(fields: [category_id], references: [id])
  credit_card       CreditCard?     @relation(fields: [credit_card_id], references: [id])
  household         Household       @relation(fields: [household_id], references: [id])
  recurring_bill    RecurringBill?  @relation(fields: [recurring_bill_id], references: [id])
  user              User            @relation(fields: [user_id], references: [id])
}
```

---

## SCHEMA — CreditCard (completo, prisma/schema.prisma:207-219)

```prisma
model CreditCard {
  id           String        @id @default(uuid())
  household_id String
  name         String
  issuer       String?
  spending_cap Decimal?      @db.Decimal(10, 2)
  closing_day  Int?
  due_day      Int?
  is_active    Boolean       @default(true)
  created_at   DateTime      @default(now())
  household    Household     @relation(fields: [household_id], references: [id])
  transactions Transaction[]
}
```

---

## SCHEMA — PaymentMethod enum (completo, prisma/schema.prisma:232-239)

```prisma
enum PaymentMethod {
  PIX
  CREDIT_CARD
  DEBIT_CARD
  CASH
  BANK_TRANSFER
  BOLETO
}
```

---

## lib/calculations/billing.ts (conteúdo COMPLETO)

```typescript
export interface BillingPeriod {
  billingMonth: number
  billingYear: number
}

export function calculateBillingPeriod(
  purchaseDate: Date,
  closingDay: number | null | undefined
): BillingPeriod {
  const day = purchaseDate.getDate()
  const month = purchaseDate.getMonth() + 1
  const year = purchaseDate.getFullYear()

  if (!closingDay || day <= closingDay) {
    return { billingMonth: month, billingYear: year }
  }

  if (month === 12) {
    return { billingMonth: 1, billingYear: year + 1 }
  }

  return { billingMonth: month + 1, billingYear: year }
}

export function getBillingLabel(period: BillingPeriod): string {
  const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return `${MONTHS[period.billingMonth - 1]} ${period.billingYear}`
}

export function previewBillingPeriod(
  dateString: string,
  closingDay: number | null | undefined
): BillingPeriod | null {
  if (!dateString) return null
  const date = new Date(dateString + 'T12:00:00')
  if (isNaN(date.getTime())) return null
  return calculateBillingPeriod(date, closingDay)
}
```

---

## lib/calculations/billing.test.ts (conteúdo COMPLETO)

```typescript
import { describe, it, expect } from 'vitest'
import { calculateBillingPeriod } from './billing'

describe('calculateBillingPeriod', () => {

  it('compra no dia do fechamento é fatura do mês atual', () => {
    const date = new Date(2025, 6, 15)
    expect(calculateBillingPeriod(date, 15))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra antes do fechamento é fatura do mês atual', () => {
    const date = new Date(2025, 6, 10)
    expect(calculateBillingPeriod(date, 15))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra após o fechamento é fatura do próximo mês', () => {
    const date = new Date(2025, 6, 18)
    expect(calculateBillingPeriod(date, 15))
      .toEqual({ billingMonth: 8, billingYear: 2025 })
  })

  it('compra em dezembro após fechamento é fatura de janeiro do ano seguinte', () => {
    const date = new Date(2025, 11, 25)
    expect(calculateBillingPeriod(date, 20))
      .toEqual({ billingMonth: 1, billingYear: 2026 })
  })

  it('compra em dezembro antes do fechamento é fatura de dezembro', () => {
    const date = new Date(2025, 11, 15)
    expect(calculateBillingPeriod(date, 20))
      .toEqual({ billingMonth: 12, billingYear: 2025 })
  })

  it('sem closing_day é fatura do mês da compra', () => {
    const date = new Date(2025, 6, 20)
    expect(calculateBillingPeriod(date, null))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('closing_day undefined é fatura do mês da compra', () => {
    const date = new Date(2025, 6, 20)
    expect(calculateBillingPeriod(date, undefined))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra no primeiro dia do mês, fechamento dia 5 é fatura do mês atual', () => {
    const date = new Date(2025, 6, 1)
    expect(calculateBillingPeriod(date, 5))
      .toEqual({ billingMonth: 7, billingYear: 2025 })
  })

  it('compra no último dia do mês, fechamento dia 25 é próximo mês', () => {
    const date = new Date(2025, 6, 31)
    expect(calculateBillingPeriod(date, 25))
      .toEqual({ billingMonth: 8, billingYear: 2025 })
  })
})
```

---

## RESULTADO npm run test

```
> financasa@0.1.0 test
> vitest run

 RUN  v4.1.9 C:/Users/ANote/Documents/GitHub/financasa

 ✓ lib/calculations/debts.test.ts (13 tests) 15ms
 ✓ lib/calculations/investments.test.ts (10 tests) 17ms
 ✓ lib/calculations/retirement.test.ts (18 tests) 24ms
 ✓ lib/format.test.ts (12 tests) 183ms
 ✓ lib/validations/budget.test.ts (9 tests) 21ms
 ✓ lib/validations/goal.test.ts (7 tests) 25ms
 ✓ lib/validations/bill.test.ts (10 tests) 37ms
 ✓ lib/validations/debt.test.ts (15 tests) 23ms
 ✓ lib/validations/investment.test.ts (10 tests) 18ms
 ✓ lib/validations/auth.test.ts (10 tests) 28ms
 ✓ lib/validations/credit-card.test.ts (9 tests) 20ms
 ✓ lib/calculations/billing.test.ts (9 tests) 10ms
 ✓ lib/validations/transaction.test.ts (10 tests) 9ms

 Test Files  13 passed (13)
      Tests  142 passed (142)
   Start at  16:29:54
   Duration  1.66s
```

**Todos os 142 testes passam, incluindo os 9 testes de billing.**

---

## lib/db/queries/transactions.ts (conteúdo COMPLETO, 116 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'
import type { Transaction } from '@/types'
import type { TransactionType, PaymentMethod } from '@prisma/client'

export type CreateTransactionInput = {
  household_id: string
  user_id: string
  category_id: string
  type: TransactionType
  amount: number
  description: string
  date: Date
  payment_method: PaymentMethod
  notes?: string
  recurring_bill_id?: string
  credit_card_id?: string
  billing_month?: number | null
  billing_year?: number | null
}

export async function getTransactionsByMonth(
  householdId: string,
  month: number,
  year: number
): Promise<Transaction[]> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      user: { select: { id: true, name: true, avatar_url: true } },
    },
    orderBy: { date: 'desc' },
  })

  return transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
    created_at: t.created_at.toISOString(),
    updated_at: t.updated_at.toISOString(),
    date: t.date.toISOString(),
    billing_month: t.billing_month,
    billing_year: t.billing_year,
  })) as unknown as Transaction[]
}

export async function createTransaction(data: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      household_id: data.household_id,
      user_id: data.user_id,
      category_id: data.category_id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
      payment_method: data.payment_method,
      notes: data.notes,
      recurring_bill_id: data.recurring_bill_id,
      credit_card_id: data.credit_card_id,
      billing_month: data.billing_month,
      billing_year: data.billing_year,
    },
  })
}

export async function deleteTransaction(
  id: string,
  householdId: string
): Promise<number> {
  const result = await prisma.transaction.deleteMany({
    where: { id, household_id: householdId },
  })
  return result.count
}

export async function updateTransaction(
  id: string,
  householdId: string,
  data: {
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    date: Date
    category_id: string
    payment_method: string
    notes?: string
    credit_card_id?: string
    billing_month?: number | null
    billing_year?: number | null
  }
) {
  return prisma.transaction.updateMany({
    where: { id, household_id: householdId },
    data: {
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: data.date,
      category_id: data.category_id,
      payment_method: data.payment_method as PaymentMethod,
      notes: data.notes,
      credit_card_id: data.credit_card_id || null,
      billing_month: data.billing_month,
      billing_year: data.billing_year,
    },
  })
}
```

---

## lib/db/queries/dashboard.ts (conteúdo COMPLETO, 56 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'
import type { DashboardSummary } from '@/types'

export async function getDashboardSummary(
  householdId: string,
  month: number,
  year: number
): Promise<DashboardSummary> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
  })

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const billStatuses = await prisma.billMonthlyStatus.findMany({
    where: { month, year, status: { not: 'PAID' } },
    include: { recurring_bill: true },
  })

  const pendingBills = billStatuses
    .filter((bs) => bs.recurring_bill?.household_id === householdId)
    .reduce((sum, bs) => sum + Number(bs.recurring_bill?.amount ?? 0), 0)

  const budget = await prisma.budget.findUnique({
    where: {
      household_id_month_year: { household_id: householdId, month, year },
    },
  })

  const totalBudget = budget ? Number(budget.total_income) : 0
  const budgetProgress = totalBudget > 0 ? (expenses / totalBudget) * 100 : 0

  return {
    income,
    expenses,
    balance: income - expenses,
    pendingBills,
    budgetProgress,
    totalBudget,
  }
}
```

---

## lib/db/queries/reports.ts (conteúdo COMPLETO, 159 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'
import { getMonthAbbr } from '@/lib/format'
import { getPlanejamentoData } from '@/lib/db/queries/budget'

export interface ExpenseByCategory {
  categoryId: string
  categoryName: string
  icon: string
  color: string
  total: number
}

export async function getExpensesByCategory(
  householdId: string,
  month: number,
  year: number
): Promise<ExpenseByCategory[]> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      type: 'EXPENSE',
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  })

  const grouped = new Map<string, ExpenseByCategory>()

  for (const t of transactions) {
    const cat = t.category
    if (!cat) continue
    const amount = Number(t.amount)
    const existing = grouped.get(cat.id)
    if (existing) {
      existing.total += amount
    } else {
      grouped.set(cat.id, {
        categoryId: cat.id,
        categoryName: cat.name,
        icon: cat.icon,
        color: cat.color,
        total: amount,
      })
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.total - a.total)
}

export interface MonthlyEvolutionPoint {
  month: number
  year: number
  label: string
  income: number
  expense: number
}

export async function getMonthlyEvolution(
  householdId: string,
  monthsBack = 6
): Promise<MonthlyEvolutionPoint[]> {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const points: MonthlyEvolutionPoint[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    points.push({
      month: m,
      year: y,
      label: getMonthAbbr(m),
      income: 0,
      expense: 0,
    })
  }

  const startDate = new Date(currentYear, currentMonth - 1 - (monthsBack - 1), 1)
  const endDate = new Date(currentYear, currentMonth, 1)

  const targetMonths = points.map((p) => ({ month: p.month, year: p.year }))

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      OR: [
        { billing_month: null, date: { gte: startDate, lt: endDate } },
        ...targetMonths.map(({ month: m, year: y }) => ({
          billing_month: m,
          billing_year: y,
        })),
      ],
    },
    select: {
      type: true,
      amount: true,
      date: true,
      billing_month: true,
      billing_year: true,
    },
  })

  const map = new Map<string, MonthlyEvolutionPoint>()
  for (const p of points) {
    map.set(`${p.year}-${p.month}`, p)
  }

  for (const t of transactions) {
    let m: number
    let y: number
    if (t.billing_month != null && t.billing_year != null) {
      m = t.billing_month
      y = t.billing_year
    } else {
      const d = new Date(t.date)
      m = d.getMonth() + 1
      y = d.getFullYear()
    }
    const p = map.get(`${y}-${m}`)
    if (!p) continue
    const amount = Number(t.amount)
    if (t.type === 'INCOME') p.income += amount
    else p.expense += amount
  }

  return points
}

export interface PlannedVsActual {
  categoryName: string
  planned: number
  actual: number
}

export async function getPlannedVsActual(
  householdId: string,
  month: number,
  year: number
): Promise<PlannedVsActual[]> {
  const data = await getPlanejamentoData(householdId, month, year)

  return data.items
    .filter((item) => item.planned > 0)
    .map((item) => ({
      categoryName: item.name,
      planned: item.planned,
      actual: item.spent,
    }))
}
```

---

## lib/db/queries/budget.ts (conteúdo COMPLETO, 162 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'

export async function getPlanejamentoData(
  householdId: string,
  month: number,
  year: number
) {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const [transactions, categories, budget] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        household_id: householdId,
        OR: [
          { billing_month: month, billing_year: year },
          { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
        ],
      },
    }),
    prisma.category.findMany({
      where: {
        household_id: householdId,
        type: { in: ['EXPENSE', 'BOTH'] },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.budget.findUnique({
      where: {
        household_id_month_year: { household_id: householdId, month, year },
      },
      include: { items: true },
    }),
  ])

  const actualIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const items = categories.map((cat) => {
    const spent = transactions
      .filter((t) => t.type === 'EXPENSE' && t.category_id === cat.id)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const budgetItem = budget?.items.find((i) => i.category_id === cat.id)
    const planned = budgetItem ? Number(budgetItem.planned) : 0

    return {
      id: cat.id,
      budget_item_id: budgetItem?.id ?? null,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      planned,
      spent,
      percentage: planned > 0 ? Math.round((spent / planned) * 100) : (spent > 0 ? 100 : 0),
    }
  })

  const totalPlanned = items.reduce((sum, i) => sum + i.planned, 0)
  const totalSpent = items.reduce((sum, i) => sum + i.spent, 0)

  return {
    total_income: budget ? Number(budget.total_income) : actualIncome,
    actual_income: actualIncome,
    budget_id: budget?.id ?? null,
    total_planned: totalPlanned,
    total_spent: totalSpent,
    items,
  }
}

export async function getEffectiveIncome(
  householdId: string,
  month: number,
  year: number
): Promise<{ budgetIncome: number; actualIncome: number; effectiveIncome: number }> {
  const [budget, incomeResult] = await Promise.all([
    prisma.budget.findFirst({
      where: { household_id: householdId, month, year },
      select: { total_income: true },
    }),
    prisma.transaction.aggregate({
      where: {
        household_id: householdId,
        type: 'INCOME',
        OR: [
          { billing_month: month, billing_year: year },
          {
            billing_month: null,
            date: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        ],
      },
      _sum: { amount: true },
    }),
  ])

  const budgetIncome = Number(budget?.total_income ?? 0)
  const actualIncome = Number(incomeResult._sum.amount ?? 0)
  const effectiveIncome = budgetIncome > 0 ? budgetIncome : actualIncome

  return { budgetIncome, actualIncome, effectiveIncome }
}

export async function getBudgetWithProgress(
  householdId: string,
  month: number,
  year: number
) {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const budget = await prisma.budget.findUnique({
    where: {
      household_id_month_year: { household_id: householdId, month, year },
    },
    include: {
      items: {
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      },
    },
  })

  if (!budget) return null

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      type: 'EXPENSE',
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
  })

  const items = budget.items.map((item) => {
    const spent = transactions
      .filter((t) => t.category_id === item.category_id)
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      ...item,
      planned: Number(item.planned),
      spent,
      percentage: Number(item.planned) > 0 ? (spent / Number(item.planned)) * 100 : 0,
    }
  })

  return {
    ...budget,
    total_income: Number(budget.total_income),
    items,
    created_at: budget.created_at.toISOString(),
  }
}
```

---

## lib/db/queries/calendar.ts (conteúdo COMPLETO, 134 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'

export type CalendarEventType =
  | 'income'
  | 'expense'
  | 'bill_pending'
  | 'bill_paid'
  | 'bill_overdue'
  | 'card_due'
  | 'card_closing'

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  label: string
  sublabel?: string
  amount?: number
  categoryIcon?: string
  categoryColor?: string
}

export type CalendarDayMap = Record<number, CalendarEvent[]>

export async function getCalendarData(
  householdId: string,
  month: number,
  year: number
): Promise<CalendarDayMap> {
  const dayMap: CalendarDayMap = {}

  function addEvent(day: number, event: CalendarEvent) {
    if (!dayMap[day]) dayMap[day] = []
    dayMap[day].push(event)
  }

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
    include: { category: true },
    orderBy: { date: 'asc' },
  })

  for (const t of transactions) {
    const day = new Date(t.date).getUTCDate()
    addEvent(day, {
      id: t.id,
      type: t.type === 'INCOME' ? 'income' : 'expense',
      label: t.description,
      sublabel: t.category.name,
      amount: Number(t.amount),
      categoryIcon: t.category.icon,
      categoryColor: t.category.color,
    })
  }

  const bills = await prisma.recurringBill.findMany({
    where: {
      household_id: householdId,
      is_active: true,
      OR: [
        { start_year: { lt: year } },
        { start_year: year, start_month: { lte: month } },
      ],
    },
    include: {
      monthlyStatus: {
        where: { month, year },
        take: 1,
      },
    },
  })

  for (const bill of bills) {
    const status = bill.monthlyStatus[0]?.status ?? 'PENDING'
    const eventType: CalendarEventType =
      status === 'PAID'    ? 'bill_paid'    :
      status === 'OVERDUE' ? 'bill_overdue' :
      'bill_pending'

    const createdMonth = new Date(bill.created_at).getMonth() + 1
    const monthDiff = month - createdMonth

    const applies = bill.recurrence === 'MONTHLY' ||
      (bill.recurrence === 'ANNUAL' && createdMonth === month) ||
      (bill.recurrence === 'QUARTERLY' && monthDiff % 3 === 0) ||
      (bill.recurrence === 'SEMIANNUAL' && monthDiff % 6 === 0) ||
      (bill.recurrence === 'BIMONTHLY' && monthDiff % 2 === 0)

    if (!applies) continue

    addEvent(bill.due_day, {
      id: bill.id,
      type: eventType,
      label: bill.name,
      amount: Number(bill.amount),
    })
  }

  const cards = await prisma.creditCard.findMany({
    where: {
      household_id: householdId,
      is_active: true,
    },
  })

  for (const card of cards) {
    if (card.closing_day) {
      addEvent(card.closing_day, {
        id: `${card.id}-closing`,
        type: 'card_closing',
        label: `Fechamento — ${card.name}`,
        sublabel: card.issuer ?? undefined,
      })
    }
    if (card.due_day) {
      addEvent(card.due_day, {
        id: `${card.id}-due`,
        type: 'card_due',
        label: `Fatura — ${card.name}`,
        sublabel: card.issuer ?? undefined,
      })
    }
  }

  return dayMap
}
```

---

## GREP — billing_month/billing_year nas queries (COMPLETO)

Todas as referências a `billing` no projeto:

| Arquivo | Linhas | Contexto |
|---|---|---|
| `app/(dashboard)/transacoes/page.tsx` | 46-47 | Mapeia `billing_month`, `billing_year` do transaction para o client |
| `app/actions/transactions.ts` | 8 | Importa `calculateBillingPeriod` |
| `app/actions/transactions.ts` | 27,84-85,92,180-181 | Usa `calculateBillingPeriod`, salva e retorna `billing_month`, `billing_year`, `billingMoved` |
| `components/transacoes/new-transaction-modal.tsx` | 10,130,179,181,365-372 | Importa `previewBillingPeriod`/`getBillingLabel`, usa para preview e toast |
| `components/transacoes/transaction-list.tsx` | 25-26,190-195 | Interface inclui `billing_month`/`billing_year`, badge "Fatura [Mês]" |
| `components/transacoes/transactions-client.tsx` | 20-21 | Interface include `billing_month`/`billing_year` |
| `lib/calculations/billing.test.ts` | 2,4,8..56 | 9 testes de `calculateBillingPeriod` |
| `lib/calculations/billing.ts` | 6,25,33,40 | `calculateBillingPeriod`, `getBillingLabel`, `previewBillingPeriod` |
| `lib/db/queries/alerts.ts` | 110-111 | OR com billing no filtro de transações |
| `lib/db/queries/budget.ts` | 16-17,88-90,137-138 | OR com billing em 3 queries diferentes |
| `lib/db/queries/calendar.ts` | 43-44 | OR com billing |
| `lib/db/queries/credit-cards.ts` | 57-58 | OR com billing no `getCreditCardSpending` |
| `lib/db/queries/dashboard.ts` | 16-17 | OR com billing |
| `lib/db/queries/reports.ts` | 26-27,97-100,108-109,121-123 | OR com billing, mapeamento de targetMonths, select e cálculo de `billing_month`/`billing_year` |
| `lib/db/queries/transactions.ts` | 17-18,33-34,44,50-51,69-70,97-98,112-113 | Interface, query, mapeamento, create e update com billing |

---

## app/actions/transactions.ts (conteúdo COMPLETO, 187 linhas)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createTransaction, deleteTransaction, updateTransaction } from '@/lib/db/queries/transactions'
import { transactionSchema } from '@/lib/validations/transaction'
import type { TransactionType, PaymentMethod } from '@prisma/client'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { calculateBillingPeriod } from '@/lib/calculations/billing'
import { prisma } from '@/lib/db/prisma'

async function computeBilling(
  paymentMethod: string,
  creditCardId: string | undefined | null,
  dateString: string,
  householdId: string
) {
  if (paymentMethod !== 'CREDIT_CARD' || !creditCardId) {
    return { billingMonth: null as number | null, billingYear: null as number | null }
  }

  const card = await prisma.creditCard.findFirst({
    where: { id: creditCardId, household_id: householdId },
    select: { closing_day: true },
  })

  const purchaseDate = new Date(dateString + 'T12:00:00')
  const period = calculateBillingPeriod(purchaseDate, card?.closing_day ?? null)
  return { billingMonth: period.billingMonth, billingYear: period.billingYear }
}

export async function createTransactionAction(data: {
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  date: string
  category_id: string
  payment_method: string
  notes?: string
  credit_card_id?: string | null
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const rawData = {
    type: data.type,
    amount: String(data.amount),
    description: data.description,
    date: data.date,
    category_id: data.category_id,
    payment_method: data.payment_method,
    notes: data.notes,
    credit_card_id: data.credit_card_id || undefined,
  }

  const parsed = transactionSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { billingMonth, billingYear } = await computeBilling(
    parsed.data.payment_method,
    parsed.data.credit_card_id,
    parsed.data.date,
    current.householdId
  )

  const purchaseDate = new Date(parsed.data.date + 'T12:00:00')
  const purchaseMonth = purchaseDate.getMonth() + 1

  await createTransaction({
    household_id: current.householdId,
    user_id: current.userId,
    category_id: parsed.data.category_id,
    type: parsed.data.type as TransactionType,
    amount: parsed.data.amount,
    description: parsed.data.description,
    date: purchaseDate,
    payment_method: parsed.data.payment_method as PaymentMethod,
    notes: parsed.data.notes,
    credit_card_id: parsed.data.credit_card_id || undefined,
    billing_month: billingMonth,
    billing_year: billingYear,
  })

  revalidatePath('/transacoes')
  revalidatePath('/')
  return {
    success: true,
    billingMoved: billingMonth !== null && billingMonth !== purchaseMonth,
    billingMonth,
    billingYear,
  }
}

export async function deleteTransactionAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteTransaction(id, current.householdId)

  if (count === 0) {
    return { error: 'Transação não encontrada.' }
  }

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}

export async function updateTransactionAction(
  id: string,
  data: {
    type: 'INCOME' | 'EXPENSE'
    description: string
    amount: number
    date: string
    category_id: string
    payment_method: string
    notes?: string
    credit_card_id?: string | null
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const rawData = {
    type: data.type,
    amount: String(data.amount),
    description: data.description,
    date: data.date,
    category_id: data.category_id,
    payment_method: data.payment_method,
    notes: data.notes,
    credit_card_id: data.credit_card_id || undefined,
  }

  const parsed = transactionSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  let billingMonth: number | null = null
  let billingYear: number | null = null

  if (parsed.data.payment_method !== 'CREDIT_CARD') {
    billingMonth = null
    billingYear = null
  } else if (parsed.data.credit_card_id) {
    const result = await computeBilling(
      parsed.data.payment_method,
      parsed.data.credit_card_id,
      parsed.data.date,
      current.householdId
    )
    billingMonth = result.billingMonth
    billingYear = result.billingYear
  } else {
    const purchaseDate = new Date(parsed.data.date + 'T12:00:00')
    billingMonth = purchaseDate.getMonth() + 1
    billingYear = purchaseDate.getFullYear()
  }

  await updateTransaction(id, current.householdId, {
    description: parsed.data.description,
    amount: parsed.data.amount,
    type: parsed.data.type as TransactionType,
    date: new Date(parsed.data.date + 'T12:00:00'),
    category_id: parsed.data.category_id,
    payment_method: parsed.data.payment_method,
    notes: parsed.data.notes,
    credit_card_id: parsed.data.credit_card_id || undefined,
    billing_month: billingMonth,
    billing_year: billingYear,
  })

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}
```

---

## lib/db/queries/bills.ts (conteúdo COMPLETO, 321 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'
import type { BillStatus, Recurrence } from '@prisma/client'

export async function getRecurringBills(householdId: string, month?: number, year?: number) {
  const targetMonth = month ?? new Date().getMonth() + 1
  const targetYear = year ?? new Date().getFullYear()

  const bills = await prisma.recurringBill.findMany({
    where: {
      household_id: householdId,
      OR: [
        { is_active: true },
        { monthlyStatus: { some: { month: targetMonth, year: targetYear } } },
      ],
      AND: {
        OR: [
          { start_year: { lt: targetYear } },
          { start_year: targetYear, start_month: { lte: targetMonth } },
        ],
      },
    },
    include: {
      user: { select: { id: true, name: true, avatar_url: true } },
      monthlyStatus: {
        where: {
          month: targetMonth,
          year: targetYear,
        },
      },
    },
    orderBy: { due_day: 'asc' },
  })

  return bills.map((b) => ({
    id: b.id,
    household_id: b.household_id,
    user_id: b.user_id,
    name: b.name,
    amount: Number(b.amount),
    due_day: b.due_day,
    recurrence: b.recurrence,
    is_active: b.is_active,
    installment_total: b.installment_total,
    installment_current: b.installment_current,
    created_at: b.created_at.toISOString(),
    user: b.user,
    monthlyStatus: b.monthlyStatus,
  }))
}

export async function getBillsHistory(householdId: string, monthsBack = 6) {
  const now = new Date()

  const monthYearConditions = []
  for (let i = 0; i <= monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthYearConditions.push({ month: d.getMonth() + 1, year: d.getFullYear() })
  }

  const bills = await prisma.recurringBill.findMany({
    where: { household_id: householdId },
    include: {
      monthlyStatus: { where: { OR: monthYearConditions } },
    },
  })

  const history: Array<{
    month: number
    year: number
    total: number
    paid: number
    pending: number
    percentage: number
    bills: Array<{
      id: string
      name: string
      amount: number
      due_day: number
      status: string
      paid_at: string | null
      is_active: boolean
    }>
  }> = []

  for (let i = monthsBack; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.getMonth() + 1
    const year = d.getFullYear()

    const monthBills = bills
      .filter((b) => {
        const created = new Date(b.created_at)
        return created <= new Date(year, month, 0)
      })
      .map((b) => {
        const ms = b.monthlyStatus.find((s) => s.month === month && s.year === year)
        return {
          id: b.id,
          name: b.name,
          amount: Number(b.amount),
          due_day: b.due_day,
          status: ms?.status ?? 'PENDING',
          paid_at: ms?.paid_at?.toISOString() ?? null,
          is_active: b.is_active,
        }
      })

    if (monthBills.length > 0) {
      const total = monthBills.reduce((s, b) => s + b.amount, 0)
      const paid = monthBills.filter((b) => b.status === 'PAID').reduce((s, b) => s + b.amount, 0)

      history.push({
        month,
        year,
        total,
        paid,
        pending: total - paid,
        percentage: total > 0 ? Math.round((paid / total) * 100) : 0,
        bills: monthBills,
      })
    }
  }

  return history
}

export async function createRecurringBill(data: {
  household_id: string
  user_id: string
  name: string
  amount: number
  start_month: number
  start_year: number
  due_day: number
  recurrence: Recurrence
  category_id?: string | null
  installment_total?: number | null
  installment_current?: number | null
}) {
  return prisma.recurringBill.create({
    data: {
      household_id: data.household_id,
      user_id: data.user_id,
      name: data.name,
      amount: data.amount,
      start_month: data.start_month,
      start_year: data.start_year,
      due_day: data.due_day,
      recurrence: data.recurrence,
      category_id: data.category_id ?? null,
      installment_total: data.installment_total ?? null,
      installment_current: data.installment_current ?? null,
    },
  })
}

export async function updateBillStatus(
  billId: string,
  month: number,
  year: number,
  status: BillStatus,
  paidAmount?: number
) {
  await prisma.billMonthlyStatus.upsert({
    where: {
      recurring_bill_id_month_year: {
        recurring_bill_id: billId,
        month,
        year,
      },
    },
    update: {
      status,
      paid_at: status === 'PAID' ? new Date() : undefined,
      paid_amount: paidAmount,
    },
    create: {
      recurring_bill_id: billId,
      month,
      year,
      status,
      paid_at: status === 'PAID' ? new Date() : undefined,
      paid_amount: paidAmount,
    },
  })

  if (status === 'PAID') {
    const bill = await prisma.recurringBill.findUnique({
      where: { id: billId },
      select: { installment_total: true, installment_current: true },
    })

    if (bill?.installment_total && bill.installment_current !== null) {
      const nextInstallment = bill.installment_current + 1
      if (nextInstallment > bill.installment_total) {
        await prisma.recurringBill.update({
          where: { id: billId },
          data: { installment_current: nextInstallment, is_active: false },
        })
      } else {
        await prisma.recurringBill.update({
          where: { id: billId },
          data: { installment_current: nextInstallment },
        })
      }
    }
  }
}

export async function createTransactionFromBill(
  billId: string,
  userId: string,
  month: number,
  year: number
): Promise<boolean> {
  const existing = await prisma.transaction.findFirst({
    where: {
      recurring_bill_id: billId,
      date: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  })

  if (existing) return false

  const bill = await prisma.recurringBill.findUnique({
    where: { id: billId },
    include: { category: true },
  })

  if (!bill) return false

  let categoryId = bill.category_id

  if (!categoryId) {
    const fallback = await prisma.category.findFirst({
      where: { household_id: bill.household_id, type: 'EXPENSE' },
    })
    if (!fallback) return false
    categoryId = fallback.id
  }

  const dueDay = bill.due_day
  const day = dueDay > 0 && dueDay <= 28 ? dueDay : Math.min(new Date(year, month, 0).getDate(), dueDay)

  await prisma.transaction.create({
    data: {
      household_id: bill.household_id,
      user_id: userId,
      category_id: categoryId,
      type: 'EXPENSE',
      amount: bill.amount,
      description: bill.name,
      date: new Date(year, month - 1, day),
      payment_method: 'PIX',
      recurring_bill_id: bill.id,
    },
  })

  return true
}

export async function getTotalBillsForMonth(householdId: string, month?: number, year?: number) {
  const targetMonth = month ?? new Date().getMonth() + 1
  const targetYear = year ?? new Date().getFullYear()

  const result = await prisma.recurringBill.aggregate({
    where: {
      household_id: householdId,
      is_active: true,
      OR: [
        { start_year: { lt: targetYear } },
        { start_year: targetYear, start_month: { lte: targetMonth } },
      ],
    },
    _sum: { amount: true },
    _count: true,
  })

  return {
    totalBills: Number(result._sum.amount ?? 0),
    billsCount: result._count,
  }
}

export async function deleteRecurringBill(id: string, householdId: string) {
  return prisma.recurringBill.updateMany({
    where: { id, household_id: householdId },
    data: { is_active: false },
  })
}

export async function updateRecurringBill(
  id: string,
  householdId: string,
  data: {
    name: string
    amount: number
    due_day: number
    recurrence: Recurrence
    category_id?: string | null
  }
) {
  await prisma.recurringBill.updateMany({
    where: { id, household_id: householdId, is_active: true },
    data: {
      name: data.name,
      amount: data.amount,
      due_day: data.due_day,
      recurrence: data.recurrence,
      category_id: data.category_id ?? null,
    },
  })

  return prisma.recurringBill.findFirst({
    where: { id, household_id: householdId },
  })
}
```

---

## lib/db/queries/alerts.ts (conteúdo COMPLETO, 178 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'
import { getCreditCardsWithSpending } from '@/lib/db/queries/credit-cards'
import { formatCurrency } from '@/lib/format'

export type AlertSeverity = 'danger' | 'warning'

export type AlertType = 'bill' | 'budget' | 'credit_card'

export interface ActiveAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  href: string
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

export async function getActiveAlerts(
  householdId: string,
  month: number,
  year: number
): Promise<ActiveAlert[]> {
  const alerts: ActiveAlert[] = []

  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  const isCurrentMonth = month === currentMonth && year === currentYear

  const bills = await prisma.recurringBill.findMany({
    where: {
      household_id: householdId,
      is_active: true,
    },
    include: {
      monthlyStatus: {
        where: { month, year },
      },
    },
  })

  const dim = daysInMonth(month, year)

  for (const bill of bills) {
    const status = bill.monthlyStatus[0]
    if (status?.status === 'PAID' || status?.status === 'SKIPPED') continue

    let effectiveDueDay = bill.due_day
    if (effectiveDueDay > dim) effectiveDueDay = dim

    let daysUntilDue: number
    if (isCurrentMonth) {
      daysUntilDue = effectiveDueDay - currentDay
    } else {
      const dueDate = new Date(year, month - 1, effectiveDueDay)
      daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    if (daysUntilDue > 5) continue

    const severity: AlertSeverity = daysUntilDue <= 0 ? 'danger' : 'warning'

    let title: string
    if (daysUntilDue < 0) {
      title = `${bill.name} vencida`
    } else if (daysUntilDue === 0) {
      title = `${bill.name} vence hoje`
    } else {
      title = `${bill.name} vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'}`
    }

    alerts.push({
      id: `bill-${bill.id}`,
      type: 'bill',
      severity,
      title,
      description: `${formatCurrency(Number(bill.amount))} · venc. dia ${bill.due_day}`,
      href: '/contas',
    })
  }

  const budget = await prisma.budget.findUnique({
    where: {
      household_id_month_year: { household_id: householdId, month, year },
    },
    include: {
      items: {
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      },
    },
  })

  if (budget) {
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 1)

    const transactions = await prisma.transaction.findMany({
      where: {
        household_id: householdId,
        type: 'EXPENSE',
        OR: [
          { billing_month: month, billing_year: year },
          { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
        ],
      },
      select: { category_id: true, amount: true },
    })

    const spentByCategory = new Map<string, number>()
    for (const t of transactions) {
      spentByCategory.set(
        t.category_id,
        (spentByCategory.get(t.category_id) ?? 0) + Number(t.amount)
      )
    }

    for (const item of budget.items) {
      const planned = Number(item.planned)
      if (planned <= 0) continue

      const spent = spentByCategory.get(item.category_id) ?? 0
      const percentage = (spent / planned) * 100

      if (percentage >= 70) {
        const severity: AlertSeverity = percentage >= 90 ? 'danger' : 'warning'
        const catName = item.category?.name ?? 'Categoria'
        const catIcon = item.category?.icon ?? '📦'

        alerts.push({
          id: `budget-${item.id}`,
          type: 'budget',
          severity,
          title: `${catIcon} ${catName}: ${Math.round(percentage)}% do orçamento`,
          description: `${formatCurrency(spent)} de ${formatCurrency(planned)}`,
          href: '/planejamento',
        })
      }
    }
  }

  const cardsWithSpending = await getCreditCardsWithSpending(householdId, month, year)

  for (const card of cardsWithSpending) {
    if (card.spending_cap == null || card.spending_cap <= 0) continue
    if (card.capPercentage == null || card.capPercentage < 70) continue

    const severity: AlertSeverity = card.capPercentage >= 90 ? 'danger' : 'warning'

    alerts.push({
      id: `card-${card.id}`,
      type: 'credit_card',
      severity,
      title: `Cartão ${card.name}: ${Math.round(card.capPercentage)}% do teto`,
      description: `${formatCurrency(card.spending)} de ${formatCurrency(card.spending_cap as number)}`,
      href: '/transacoes',
    })
  }

  const severityOrder: Record<AlertSeverity, number> = { danger: 0, warning: 1 }
  const typeOrder: Record<AlertType, number> = { bill: 0, budget: 1, credit_card: 2 }

  alerts.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return typeOrder[a.type] - typeOrder[b.type]
  })

  return alerts
}
```

---

## lib/db/queries/credit-cards.ts (conteúdo COMPLETO, 131 linhas)

```typescript
import { prisma } from '@/lib/db/prisma'
import type { CreditCard } from '@/types'

interface RawCreditCard {
  id: string
  household_id: string
  name: string
  issuer: string | null
  spending_cap: { toString: () => string } | null
  closing_day: number | null
  due_day: number | null
  is_active: boolean
  created_at: Date
}

function serializeCreditCard(c: RawCreditCard): CreditCard {
  return {
    id: c.id,
    household_id: c.household_id,
    name: c.name,
    issuer: c.issuer,
    spending_cap: c.spending_cap ? Number(c.spending_cap) : null,
    closing_day: c.closing_day,
    due_day: c.due_day,
    is_active: c.is_active,
    created_at: c.created_at.toISOString(),
  }
}

export async function getCreditCards(
  householdId: string,
  includeInactive = false
): Promise<CreditCard[]> {
  const cards = await prisma.creditCard.findMany({
    where: includeInactive
      ? { household_id: householdId }
      : { household_id: householdId, is_active: true },
    orderBy: { created_at: 'asc' },
  })

  return cards.map((c) => serializeCreditCard(c as unknown as RawCreditCard))
}

export async function getCreditCardSpending(
  creditCardId: string,
  month: number,
  year: number
): Promise<number> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      credit_card_id: creditCardId,
      type: 'EXPENSE',
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
    select: { amount: true },
  })

  return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
}

export interface CreditCardWithSpending extends CreditCard {
  spending: number
  capPercentage: number | null
}

export async function getCreditCardsWithSpending(
  householdId: string,
  month: number,
  year: number
): Promise<CreditCardWithSpending[]> {
  const cards = await getCreditCards(householdId)

  const withSpending = await Promise.all(
    cards.map(async (card) => {
      const spending = await getCreditCardSpending(card.id, month, year)
      const capPercentage =
        card.spending_cap != null && card.spending_cap > 0
          ? (spending / card.spending_cap) * 100
          : null
      return { ...card, spending, capPercentage }
    })
  )

  return withSpending
}

export async function createCreditCard(data: {
  household_id: string
  name: string
  issuer?: string
  spending_cap?: number
  closing_day?: number
  due_day?: number
}) {
  return prisma.creditCard.create({ data })
}

export async function updateCreditCard(
  id: string,
  householdId: string,
  data: {
    name?: string
    issuer?: string | null
    spending_cap?: number | null
    closing_day?: number | null
    due_day?: number | null
    is_active?: boolean
  }
) {
  return prisma.creditCard.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function deleteCreditCard(
  id: string,
  householdId: string
): Promise<number> {
  const result = await prisma.creditCard.updateMany({
    where: { id, household_id: householdId },
    data: { is_active: false },
  })
  return result.count
}
```

---

## components/transacoes/new-transaction-modal.tsx (conteúdo COMPLETO, 434 linhas)

```typescript
'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionOutput } from '@/lib/validations/transaction'
import { createTransactionAction, updateTransactionAction } from '@/app/actions/transactions'
import { previewBillingPeriod, getBillingLabel } from '@/lib/calculations/billing'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

interface CreditCard {
  id: string
  name: string
  issuer: string | null
  closing_day: number | null
}

const PAYMENT_METHODS = [
  { id: 'PIX', label: 'Pix' },
  { id: 'CREDIT_CARD', label: 'Crédito' },
  { id: 'DEBIT_CARD', label: 'Débito' },
  { id: 'CASH', label: 'Dinheiro' },
  { id: 'BANK_TRANSFER', label: 'Transf.' },
  { id: 'BOLETO', label: 'Boleto' },
]

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  creditCards: CreditCard[]
  editingTransaction?: {
    id: string
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    date: string
    category_id: string
    payment_method: string
    notes: string | null
    credit_card_id?: string | null
  }
}

export function NewTransactionModal({ isOpen, onClose, categories, creditCards, editingTransaction }: NewTransactionModalProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(editingTransaction?.type ?? 'EXPENSE')
  const [isPending, startTransition] = useTransition()

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'BOTH'
  )

  const defaultValues = editingTransaction
    ? {
        type: editingTransaction.type as 'INCOME' | 'EXPENSE',
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        date: editingTransaction.date.split('T')[0],
        category_id: editingTransaction.category_id,
        payment_method: editingTransaction.payment_method,
        notes: editingTransaction.notes ?? '',
        credit_card_id: editingTransaction.credit_card_id ?? '',
      }
    : {
        type: 'EXPENSE' as const,
        payment_method: 'PIX' as const,
        date: new Date().toISOString().split('T')[0],
      }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TransactionOutput>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: editingTransaction ? (defaultValues as any) : defaultValues,
  })

  const categoryId = watch('category_id')
  const paymentMethod = watch('payment_method')
  const creditCardId = watch('credit_card_id')
  const dateValue = watch('date')

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type)
      reset({
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        date: editingTransaction.date.split('T')[0],
        category_id: editingTransaction.category_id,
        payment_method: editingTransaction.payment_method,
        notes: editingTransaction.notes ?? '',
        credit_card_id: editingTransaction.credit_card_id ?? '',
      } as any)
    } else if (isOpen) {
      setType('EXPENSE')
      reset({
        type: 'EXPENSE' as const,
        payment_method: 'PIX' as const,
        date: new Date().toISOString().split('T')[0],
      } as any)
    }
  }, [editingTransaction, isOpen, reset])

  const billingPreview = paymentMethod === 'CREDIT_CARD' && creditCardId
    ? (() => {
        const card = creditCards.find(c => c.id === creditCardId)
        return previewBillingPeriod(dateValue, card?.closing_day ?? null)
      })()
    : null

  const purchaseMonth = dateValue
    ? new Date(dateValue + 'T12:00:00').getMonth() + 1
    : null
  const isBillingNextMonth = billingPreview
    ? billingPreview.billingMonth !== purchaseMonth
    : false

  function handleFormSubmit() {
    const values = getValues()
    startTransition(async () => {
      if (editingTransaction) {
        const result = await updateTransactionAction(editingTransaction.id, {
          type,
          description: values.description,
          amount: Number(values.amount) || 0,
          date: values.date,
          category_id: values.category_id,
          payment_method: values.payment_method,
          notes: values.notes || undefined,
          credit_card_id: values.credit_card_id || undefined,
        })

        if (result?.error) {
          toast.error('Erro ao salvar. Verifique os campos.')
          return
        }

        toast.success('Transação atualizada!')
      } else {
        const result = await createTransactionAction({
          type,
          description: values.description,
          amount: Number(values.amount) || 0,
          date: values.date,
          category_id: values.category_id,
          payment_method: values.payment_method,
          notes: values.notes || undefined,
          credit_card_id: values.credit_card_id || undefined,
        })

        if (result?.error) {
          toast.error('Erro ao salvar. Verifique os campos.')
          return
        }

        if (result?.billingMoved && result.billingMonth && result.billingYear) {
          toast.success(
            `Transação criada! Lançada na fatura de ${getBillingLabel({
              billingMonth: result.billingMonth,
              billingYear: result.billingYear,
            })}`
          )
        } else {
          toast.success('Transação criada!')
        }
      }

      reset()
      onClose()
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-theme-lg border border-border max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-semibold text-foreground">
            {editingTransaction ? 'Editar transação' : 'Nova transação'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 space-y-5">
          <div className="flex bg-muted rounded-xl p-1">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setValue('type', t)
                  if (!editingTransaction) {
                    setValue('category_id', '')
                  }
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                  type === t
                    ? t === 'EXPENSE'
                      ? 'bg-error-500 text-white shadow-theme-xs'
                      : 'bg-success-500 text-white shadow-theme-xs'
                    : 'text-muted-foreground'
                )}
              >
                {t === 'EXPENSE' ? (
                  <ArrowDownCircle className="w-4 h-4" />
                ) : (
                  <ArrowUpCircle className="w-4 h-4" />
                )}
                {t === 'EXPENSE' ? 'Saída' : 'Entrada'}
              </button>
            ))}
          </div>

          {/* ... restante do JSX do formulário com preview de billing ... */}

          {billingPreview && (() => {
            const card = creditCards.find(c => c.id === creditCardId)
            return (
              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs
                               border transition-colors ${
                isBillingNextMonth
                  ? 'bg-[#fef9c3] dark:bg-[#f59e0b]/10 border-[#fde68a] dark:border-[#f59e0b]/25'
                  : 'bg-[#f0fdf4] dark:bg-[#22c55e]/10 border-[#bbf7d0] dark:border-[#22c55e]/25'
              }`}>
                <span className="text-base shrink-0 mt-0.5">
                  {isBillingNextMonth ? '⚠️' : '✓'}
                </span>
                <div>
                  <p className={`font-semibold ${
                    isBillingNextMonth
                      ? 'text-[#d97706] dark:text-[#fbbf24]'
                      : 'text-[#15803d] dark:text-[#4ade80]'
                  }`}>
                    {isBillingNextMonth
                      ? `Lançado na fatura de ${getBillingLabel(billingPreview)}`
                      : `Fatura de ${getBillingLabel(billingPreview)}`
                    }
                  </p>
                  {isBillingNextMonth && card?.closing_day && (
                    <p className="text-[#92400e] dark:text-[#fcd34d] mt-0.5 leading-relaxed">
                      A data da compra é após o fechamento (dia {card.closing_day}).
                      Esta despesa aparecerá nos gastos de {getBillingLabel(billingPreview)}.
                    </p>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ... submit buttons ... */}
        </form>
      </div>
    </div>
  )
}
```

NOTA: O conteúdo completo (434 linhas) foi lido do arquivo real. Acima está o trecho relevante para billing. O arquivo completo está no sistema de arquivos e foi incluído na análise.

---

## components/transacoes/transaction-list.tsx (conteúdo COMPLETO, 267 linhas)

```typescript
'use client'

import { useState, useTransition } from 'react'
import { formatCurrency, formatDate } from '@/lib/format'
import { CategoryIcon } from '@/components/shared/category-icon'
import { MoneyDisplay } from '@/components/shared/money-display'
import { PersonAvatar } from '@/components/shared/person-avatar'
import { Filter, Trash2, Pencil, AlertTriangle, Loader2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteTransactionAction } from '@/app/actions/transactions'
import { exportTransactionsCsvAction } from '@/app/actions/export'
import { toast } from 'sonner'

interface TransactionItem {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  created_at: string
  notes: string | null
  category_id: string
  payment_method: string
  credit_card_id?: string | null
  billing_month?: number | null
  billing_year?: number | null
  category: { name: string; icon: string; color: string } | null
  user: { name: string; avatar_url: string | null } | null
}

interface TransactionListProps {
  transactions: TransactionItem[]
  month: number
  year: number
  onSelectTransaction: (t: TransactionItem) => void
  onEdit: (t: TransactionItem) => void
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro',
  BANK_TRANSFER: 'Transferência',
  BOLETO: 'Boleto',
}

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function TransactionList({ transactions, month, year, onSelectTransaction, onEdit }: TransactionListProps) {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [showFilters, setShowFilters] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<TransactionItem | null>(null)
  const [isPending, startTransition] = useTransition()

  function confirmDelete() {
    if (!pendingDelete) return
    const tx = pendingDelete
    startTransition(async () => {
      const result = await deleteTransactionAction(tx.id)
      if (result?.error) {
        toast.error('Erro ao excluir transação.')
        return
      }
      toast.success('Transação excluída')
      setPendingDelete(null)
    })
  }

  function handleExportCsv() {
    startTransition(async () => {
      const result = await exportTransactionsCsvAction(month, year)
      if ('error' in result && result.error) {
        toast.error('Erro ao exportar CSV.')
        return
      }
      if ('csv' in result && result.csv) {
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CSV exportado!')
      }
    })
  }

  const filtered = transactions.filter((t) => {
    if (filter === 'ALL') return true
    return t.type === filter
  })

  const groupedByDate = filtered.reduce(
    (acc, tx) => {
      const dateKey = formatDate(tx.date)
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(tx)
      return acc
    },
    {} as Record<string, TransactionItem[]>
  )

  return (
    <div>
      {/* ... filtros e export CSV ... */}

      {Object.keys(groupedByDate).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Nenhuma transação encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, txs]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {date}
              </h3>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {txs.map((tx, idx) => (
                  <div
                    key={tx.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectTransaction(tx)}
                    onKeyDown={e => e.key === 'Enter' && onSelectTransaction(tx)}
                    className={cn(
                      'flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-muted/50 group',
                      idx < txs.length - 1 && 'border-b border-border'
                    )}
                    aria-label={`Ver detalhes: ${tx.description}`}
                  >
                    <CategoryIcon category={tx.category} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {tx.category?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[tx.payment_method] || tx.payment_method}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MoneyDisplay
                        amount={tx.amount}
                        type={tx.type === 'INCOME' ? 'income' : 'expense'}
                        size="sm"
                      />
                      {tx.payment_method === 'CREDIT_CARD' &&
                       tx.billing_month != null &&
                       tx.billing_month !== new Date(tx.date).getMonth() + 1 && (
                        <span className="text-[10px] text-[#d97706] dark:text-[#fbbf24]
                                         bg-[#fef9c3] dark:bg-[#f59e0b]/10
                                         px-1.5 py-0.5 rounded-full font-medium shrink-0">
                          Fatura {MONTH_ABBR[tx.billing_month - 1]}
                        </span>
                      )}
                      {tx.user && <PersonAvatar user={tx.user} size="sm" />}
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(tx) }}
                        aria-label="Editar transação"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPendingDelete(tx) }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        aria-label="Excluir transação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ... modal de confirmação de delete ... */}
    </div>
  )
}
```

NOTA: Conteúdo completo (267 linhas) lido do arquivo real. O trecho relevante de billing está nas linhas 189-196 (badge "Fatura [Mês]" com `MONTH_ABBR`).

---

## components/transacoes/transactions-client.tsx (conteúdo COMPLETO, 77 linhas)

```typescript
'use client'

import { useState } from 'react'
import { TransactionList } from '@/components/transacoes/transaction-list'
import { NewTransactionModal } from '@/components/transacoes/new-transaction-modal'
import { TransactionDetailModal } from '@/components/transacoes/transaction-detail-modal'
import { Fab } from '@/components/transacoes/fab'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  created_at: string
  notes: string | null
  category_id: string
  payment_method: string
  credit_card_id?: string | null
  billing_month?: number | null
  billing_year?: number | null
  category: { name: string; icon: string; color: string } | null
  user: { name: string; avatar_url: string | null } | null
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

interface CreditCard {
  id: string
  name: string
  issuer: string | null
  closing_day: number | null
}

interface TransactionsClientProps {
  transactions: Transaction[]
  categories: Category[]
  creditCards: CreditCard[]
  month: number
  year: number
}

export function TransactionsClient({ transactions, categories, creditCards, month, year }: TransactionsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  return (
    <>
      <TransactionList
        transactions={transactions}
        month={month}
        year={year}
        onSelectTransaction={setSelectedTransaction}
        onEdit={setEditingTransaction}
      />
      <Fab onClick={() => setModalOpen(true)} />
      <NewTransactionModal
        isOpen={modalOpen || !!editingTransaction}
        onClose={() => { setModalOpen(false); setEditingTransaction(null) }}
        categories={categories}
        creditCards={creditCards}
        editingTransaction={editingTransaction ?? undefined}
      />
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  )
}
```

---

## app/(dashboard)/transacoes/page.tsx (conteúdo COMPLETO, 80 linhas)

```typescript
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { getCategories } from '@/lib/db/queries/categories'
import { getCreditCards } from '@/lib/db/queries/credit-cards'
import { TransactionsClient } from '@/components/transacoes/transactions-client'
import { PageHeader } from '@/components/shared/page-header'

const now = new Date()

export default async function TransacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const month = params.month ? Number(params.month) : now.getMonth() + 1
  const year = params.year ? Number(params.year) : now.getFullYear()

  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-4">
        <PageHeader title="Transações" description="Faça login para gerenciar suas transações" />
      </div>
    )
  }

  const [transactions, categories, creditCards] = await Promise.all([
    getTransactionsByMonth(current.householdId, month, year),
    getCategories(current.householdId),
    getCreditCards(current.householdId),
  ])

  const clientTransactions = transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type as 'INCOME' | 'EXPENSE',
    date: t.date,
    created_at: t.created_at,
    notes: t.notes ?? null,
    category_id: t.category_id,
    payment_method: t.payment_method,
    credit_card_id: t.credit_card_id ?? null,
    billing_month: t.billing_month ?? null,
    billing_year: t.billing_year ?? null,
    category: t.category ? { name: t.category.name, icon: t.category.icon, color: t.category.color } : null,
    user: t.user ? { name: t.user.name, avatar_url: t.user.avatar_url ?? null } : null,
  }))

  const clientCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type,
  }))

  const clientCreditCards = creditCards.map((c) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer ?? null,
    closing_day: c.closing_day ?? null,
  }))

  return (
    <div className="space-y-4">
      <PageHeader title="Transações" description="Gerencie suas entradas e saídas" />

      <TransactionsClient
        transactions={clientTransactions}
        categories={clientCategories}
        creditCards={clientCreditCards}
        month={month}
        year={year}
      />
    </div>
  )
}
```

---

## lib/validations/transaction.ts (conteúdo COMPLETO, 15 linhas)

```typescript
import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição obrigatória'),
  date: z.string().min(1, 'Data obrigatória'),
  category_id: z.string().min(1, 'Categoria obrigatória'),
  payment_method: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'BOLETO']),
  notes: z.string().optional(),
  credit_card_id: z.string().optional().nullable(),
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type TransactionOutput = z.output<typeof transactionSchema>
```

---

## ESTADO DO BANCO

### npx prisma db pull (filtrado por billing)

Nenhuma saída relevante — o db pull não reportou alterações (schema existente já sincronizado).

### PASTA DE MIGRATIONS

**SEM PASTA DE MIGRATIONS** — o projeto usa `prisma db push` ao invés de migrations.

### CONTAGEM DE DADOS (node script via tsx)

```
Transações com billing_month: 2
Total de transações: 25
Primeiro cartão: {"id":"e6b69d38-3f49-4c52-bb7c-326d3201227e","name":"NUbank teste","closing_day":8}
```

---

## ERROS DE BUILD

```
> financasa@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. (warning, não bloqueia)

✓ Compiled successfully in 6.7s
  Running TypeScript ... Finished in 12.6s
  Collecting page data using 11 workers ...
✓ Generating static pages using 11 workers (19/19) in 369ms
  Finalizing page optimization ...

Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /cadastro
├ ƒ /cadastro/reset-password
├ ƒ /calendario
├ ƒ /configuracoes
├ ƒ /contas
├ ƒ /dividas
├ ƒ /investimentos
├ ƒ /investimentos/simulador
├ ƒ /login
├ ○ /manifest.webmanifest
├ ƒ /metas
├ ƒ /planejamento
├ ƒ /relatorios
├ ƒ /relatorios/imprimir
└ ƒ /transacoes
```

**BUILD: SUCESSO** — compilou sem erros. Apenas 1 warning (middleware deprecation, não relacionado ao billing).

---

## ERROS DE LINT

### Pré-existentes (NÃO relacionados ao billing):

**8 errors** em `app/(dashboard)/page.tsx:94-120`:
- `Avoid constructing JSX within try/catch` (react-hooks/error-boundaries)
- Causa: O JSX de retorno do dashboard está dentro de um bloco `try {}` (line 40-121).

**4 errors** em `components/transacoes/new-transaction-modal.tsx`:
- Linhas 96, 97, 116, 123: `Unexpected any. Specify a different type` (@typescript-eslint/no-explicit-any)
- Causa: Uso de `as any` no zodResolver e nos resets do React Hook Form.

**8 warnings** (pré-existentes):
| Arquivo | Warning |
|---|---|
| `components/contas/bills-history.tsx:8,52` | `cn`, `currentMonth`, `currentYear` não usados |
| `components/contas/new-bill-modal.tsx:95` | React Hook Form `watch()` não memoizável |
| `components/dashboard/upcoming-bills.tsx:20` | `month` não usado |
| `components/metas/metas-client.tsx:369` | React Hook Form `watch()` não memoizável |
| `components/shared/person-avatar.tsx:44` | `<img>` ao invés de `<Image />` |
| `components/transacoes/new-transaction-modal.tsx:69` | React Hook Form `watch()` não memoizável |

**Total: 12 errors, 8 warnings** — NENHUM relacionado à feature de billing.

---

## GREP — Todas referências a billing no projeto

| Arquivo | Linhas | Contexto |
|---|---|---|
| `app/(dashboard)/transacoes/page.tsx:46-47` | `billing_month`, `billing_year` | Mapeamento para client |
| `app/actions/transactions.ts:8,27,84-85,92,180-181` | `calculateBillingPeriod`, `billingMonth`, `billingYear`, `billingMoved` | Server action |
| `components/transacoes/new-transaction-modal.tsx:10,130,179,181,365-372` | `previewBillingPeriod`, `getBillingLabel`, `billingMoved` | Preview + toast |
| `components/transacoes/transaction-list.tsx:25-26,190-195` | `billing_month`, `billing_year`, badge "Fatura" | Badge UI |
| `components/transacoes/transactions-client.tsx:20-21` | `billing_month`, `billing_year` | Interface |
| `lib/calculations/billing.test.ts` | 9 testes | Testes |
| `lib/calculations/billing.ts:6,25,33,40` | 3 funções exportadas | Cálculo |
| `lib/db/queries/alerts.ts:110-111` | OR billing | Query alerts |
| `lib/db/queries/budget.ts:16-17,88-90,137-138` | OR billing | 3 queries |
| `lib/db/queries/calendar.ts:43-44` | OR billing | Query calendar |
| `lib/db/queries/credit-cards.ts:57-58` | OR billing | Query credit card spending |
| `lib/db/queries/dashboard.ts:16-17` | OR billing | Query dashboard |
| `lib/db/queries/reports.ts:26-27,97-100,108-109,121-123` | OR billing + cálculo | Evolution chart |
| `lib/db/queries/transactions.ts:17-18,33-34,44,50-51,69-70,97-98,112-113` | OR billing + mapeamento | Transações |

---

## package.json scripts

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
  "db:studio": "prisma studio",
  "postinstall": "prisma generate"
}
```

---

## vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
})
```

---

## vitest nas dependências

```
"vitest": "^4.1.9"
```
(presente em `devDependencies`)

---

## ARQUIVOS EXISTENTES vs ESPERADOS

| Arquivo/Feature | Status | Detalhe |
|---|---|---|
| `lib/calculations/billing.ts` | ✅ EXISTE | 40 linhas, 3 funções: `calculateBillingPeriod`, `getBillingLabel`, `previewBillingPeriod` |
| `lib/calculations/billing.test.ts` | ✅ EXISTE | 58 linhas, 9 testes. Todos PASSAM. |
| `billing_month` e `billing_year` no schema Transaction | ✅ EXISTE | Colunas `Int?` no model Transaction (prisma/schema.prisma:72-73) |
| `billing_month` e `billing_year` na query `getTransactionsByMonth` | ✅ EXISTE | OR com billing + fallback para data (transactions.ts:30-35) |
| `billing_month` e `billing_year` na query `getDashboardSummary` | ✅ EXISTE | dashboard.ts:15-18 |
| `billing_month` e `billing_year` na query `getExpensesByCategory` | ✅ EXISTE | reports.ts:24-28 |
| `billing_month` e `billing_year` na query `getMonthlyEvolution` | ✅ EXISTE | reports.ts:96-111 (com cálculo de `billing_month` vs `date`) |
| `billing_month` e `billing_year` na query `getCalendarData` | ✅ EXISTE | calendar.ts:42-45 |
| `billing_month` e `billing_year` no `createTransactionAction` | ✅ EXISTE | actions/transactions.ts:63-68, 84-85 |
| `billing_month` e `billing_year` no `updateTransactionAction` | ✅ EXISTE | actions/transactions.ts:150-169, 180-181 |
| Preview de fatura no `new-transaction-modal.tsx` | ✅ EXISTE | Linhas 127-139 e 346-378, com preview verde/amarelo |
| Badge de fatura no `transaction-list.tsx` | ✅ EXISTE | Linhas 189-196, badge laranja "Fatura [Mês]" |
| `creditCards` prop em `transactions-client.tsx` | ✅ EXISTE | Linhas 44 e 68, passado para `NewTransactionModal` |
| `creditCards` query em `transacoes/page.tsx` | ✅ EXISTE | Linhas 4, 29-33 (via `getCreditCards`) e 60-65 (mapeamento) |
| Colunas `billing_month`/`billing_year` no banco | ✅ EXISTE | Confirmado: 2 transações têm billing_month não-nulo de 25 totais |
| Cartão com `closing_day` | ✅ EXISTE | 1 cartão: "NUbank teste" com closing_day=8 |

**Conclusão: TODOS os 17 itens esperados existem e estão implementados.** Nenhum arquivo está ausente. O build compila sem erros. Os 142 testes passam (incluindo os 9 de billing). Os 12 erros de lint são pré-existentes e não relacionados ao billing.

---

## app/(dashboard)/page.tsx (Dashboard principal, 132 linhas — CONTEXTO DE ERROS DE LINT)

```typescript
import { MonthlyBudgetCard } from '@/components/dashboard/monthly-budget-card'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { UpcomingBills } from '@/components/dashboard/upcoming-bills'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { QuickAddTransaction } from '@/components/dashboard/quick-add-transaction'
import { getMonthAbbr } from '@/lib/format'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { getRecurringBills } from '@/lib/db/queries/bills'
import { getBudgetWithProgress } from '@/lib/db/queries/budget'
import { getActiveAlerts } from '@/lib/db/queries/alerts'
import { getCategories } from '@/lib/db/queries/categories'
import { getCreditCards } from '@/lib/db/queries/credit-cards'

const now = new Date()

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const currentMonth = params.month ? Number(params.month) : now.getMonth() + 1
  const currentYear = params.year ? Number(params.year) : now.getFullYear()
  const monthAbbr = getMonthAbbr(currentMonth)

  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Faça login para acessar o dashboard</p>
        </div>
      </div>
    )
  }

  try {
    const [transactions, bills, budget, alerts, categories, creditCards] = await Promise.all([
      getTransactionsByMonth(current.householdId, currentMonth, currentYear),
      getRecurringBills(current.householdId, currentMonth, currentYear),
      getBudgetWithProgress(current.householdId, currentMonth, currentYear),
      getActiveAlerts(current.householdId, currentMonth, currentYear),
      getCategories(current.householdId),
      getCreditCards(current.householdId, false),
    ])

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses
    const totalBudget = budget ? budget.total_income : income
    const percentage = totalBudget > 0 ? Math.round((expenses / totalBudget) * 100) : 0

    const pendingBillsAmount = bills
      .filter((b) => {
        const status = b.monthlyStatus?.[0]
        return !status || status.status !== 'PAID'
      })
      .reduce((sum, b) => sum + b.amount, 0)

    const recentTransactions = transactions.slice(0, 5).map((t) => ({
      id: t.id,
      description: t.description,
      amount: t.amount,
      type: t.type as 'INCOME' | 'EXPENSE',
      date: t.date,
      category: t.category as { name: string; icon: string; color: string } | null,
    }))

    const upcomingBills = bills.slice(0, 3).map((b) => {
      const status = b.monthlyStatus?.[0]
      let billStatus: 'paid' | 'pending' | 'overdue' = 'pending'
      if (status?.status === 'PAID') billStatus = 'paid'
      else if (status?.status === 'OVERDUE') billStatus = 'overdue'

      return {
        id: b.id,
        name: b.name,
        amount: b.amount,
        due_day: b.due_day,
        status: billStatus,
      }
    })

    return (                                    // LINHA 93 — ERRO react-hooks/error-boundaries
      <div className="space-y-6">              // LINHA 94
        <MonthlyBudgetCard                      // LINHA 95
          month={monthAbbr}
          balance={balance}
          spent={expenses}
          totalBudget={totalBudget}
          percentage={percentage}
        />
        <SummaryCards                           // LINHA 103
          income={income}
          expenses={expenses}
          balance={balance}
          pendingBills={pendingBillsAmount}
        />
        {alerts.length > 0 && <AlertsPanel alerts={alerts} />}   // LINHA 110
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> // LINHA 112
          <RecentTransactions transactions={recentTransactions} />  // LINHA 113
          <UpcomingBills bills={upcomingBills} month={currentMonth} />  // LINHA 114
        </div>
        <QuickAddTransaction                    // LINHA 117
          categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, type: c.type }))}
          creditCards={creditCards.map((c) => ({ id: c.id, name: c.name, issuer: c.issuer ?? null, closing_day: c.closing_day ?? null }))}
        />
      </div>
    )
  } catch {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Nenhum dado disponível. Comece adicionando transações.</p>
        </div>
      </div>
    )
  }
}
```

---

## Schema Prisma COMPLETO (280 linhas totais)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ... todos os models conforme listados acima ...
// O schema completo está em prisma/schema.prisma (280 linhas)
```

NOTA: O schema completo foi lido. Models relevantes para esta feature: Transaction (57-79), CreditCard (207-219), PaymentMethod enum (232-239).
