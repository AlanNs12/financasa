import { prisma } from '@/lib/db/prisma'
import type { Recurrence } from '@prisma/client'

export async function getRecurringIncomes(householdId: string) {
  const incomes = await prisma.recurringIncome.findMany({
    where: { household_id: householdId, is_active: true },
    orderBy: { created_at: 'asc' },
  })
  return incomes.map((i) => ({
    ...i,
    amount: Number(i.amount),
    created_at: i.created_at.toISOString(),
    updated_at: i.updated_at.toISOString(),
  }))
}

export async function getRecurringIncomesForMonth(
  householdId: string,
  month: number,
  year: number
) {
  const all = await getRecurringIncomes(householdId)

  return all.filter((income) => {
    if (income.start_year > year) return false
    if (income.start_year === year && income.start_month > month) return false

    const monthDiff =
      (year - income.start_year) * 12 + (month - income.start_month)

    switch (income.recurrence) {
      case 'MONTHLY':
        return true
      case 'BIMONTHLY':
        return monthDiff % 2 === 0
      case 'QUARTERLY':
        return monthDiff % 3 === 0
      case 'SEMIANNUAL':
        return monthDiff % 6 === 0
      case 'ANNUAL':
        return monthDiff % 12 === 0
      default:
        return false
    }
  })
}

export async function getTotalExpectedIncomeForMonth(
  householdId: string,
  month: number,
  year: number
) {
  const incomes = await getRecurringIncomesForMonth(householdId, month, year)
  return incomes.reduce((sum, i) => sum + i.amount, 0)
}

export async function createRecurringIncome(data: {
  household_id: string
  user_id: string
  name: string
  amount: number
  recurrence: Recurrence
  start_month: number
  start_year: number
}) {
  return prisma.recurringIncome.create({ data })
}

export async function updateRecurringIncome(
  id: string,
  householdId: string,
  data: { name: string; amount: number; recurrence: Recurrence }
) {
  return prisma.recurringIncome.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function deleteRecurringIncome(id: string, householdId: string) {
  return prisma.recurringIncome.updateMany({
    where: { id, household_id: householdId },
    data: { is_active: false },
  })
}
