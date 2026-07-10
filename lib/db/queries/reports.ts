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
