import { prisma } from '@/lib/db/prisma'

export async function getBudgetWithProgress(
  householdId: string,
  month: number,
  year: number
) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

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
      date: { gte: startDate, lte: endDate },
      type: 'EXPENSE',
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
