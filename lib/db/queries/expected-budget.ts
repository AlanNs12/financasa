import { prisma } from '@/lib/db/prisma'
import { getTotalExpectedIncomeForMonth } from './recurring-incomes'
import { getTotalBillsForMonth } from './bills'

export async function getExpectedBudget(
  householdId: string,
  month: number,
  year: number
) {
  const [expectedIncome, billsResult, committedExpenses] = await Promise.all([
    getTotalExpectedIncomeForMonth(householdId, month, year),
    getTotalBillsForMonth(householdId, month, year),
    prisma.transaction.aggregate({
      where: {
        household_id: householdId,
        type: 'EXPENSE',
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

  const totalBills = billsResult.totalBills
  const totalCommitted = Number(committedExpenses._sum.amount ?? 0)
  const expectedAvailable = expectedIncome - totalBills - totalCommitted

  return {
    expectedIncome,
    totalBills,
    totalCommitted,
    expectedAvailable,
    hasExpectedData: expectedIncome > 0,
  }
}
