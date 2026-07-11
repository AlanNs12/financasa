import { prisma } from '@/lib/db/prisma'
import { getTotalExpectedIncomeForMonth } from './recurring-incomes'

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
): Promise<{
  budgetIncome: number
  actualIncome: number
  effectiveIncome: number
  expectedIncome: number
}> {
  const [budget, incomeResult, expectedIncome] = await Promise.all([
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
    getTotalExpectedIncomeForMonth(householdId, month, year),
  ])

  const budgetIncome = Number(budget?.total_income ?? 0)
  const actualIncome = Number(incomeResult._sum.amount ?? 0)
  const effectiveIncome =
    budgetIncome > 0 ? budgetIncome
      : actualIncome > 0 ? actualIncome
        : expectedIncome

  return { budgetIncome, actualIncome, effectiveIncome, expectedIncome }
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

  const items = budget.items.map((item: { category_id: string; planned: { toString: () => string } }) => {
    const spent = transactions
      .filter((t: { category_id: string; amount: { toString: () => string } }) => t.category_id === item.category_id)
      .reduce((sum: number, t: { amount: { toString: () => string } }) => sum + Number(t.amount), 0)

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
