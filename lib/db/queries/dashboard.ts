import { prisma } from '@/lib/db/prisma'
import type { DashboardSummary } from '@/types'

export async function getDashboardSummary(
  householdId: string,
  month: number,
  year: number
): Promise<DashboardSummary> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59)

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      date: { gte: startDate, lte: endDate },
    },
  })

  const income = transactions
    .filter((t: { type: string; amount: { toString: () => string } }) => t.type === 'INCOME')
    .reduce((sum: number, t: { amount: { toString: () => string } }) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter((t: { type: string; amount: { toString: () => string } }) => t.type === 'EXPENSE')
    .reduce((sum: number, t: { amount: { toString: () => string } }) => sum + Number(t.amount), 0)

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
