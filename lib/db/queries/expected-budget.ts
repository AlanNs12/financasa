import { prisma } from '@/lib/db/prisma'
import { getTotalExpectedIncomeForMonth, getRecurringIncomesWithStatus } from './recurring-incomes'

export async function getExpectedBudget(
  householdId: string,
  month: number,
  year: number
) {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const billingFilter = {
    OR: [
      { billing_month: month, billing_year: year },
      { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
    ],
  }

  const [
    expectedIncome,
    recurringIncomes,
    allBills,
    actualIncomeResult,
    actualExpenseResult,
  ] = await Promise.all([
    getTotalExpectedIncomeForMonth(householdId, month, year),
    getRecurringIncomesWithStatus(householdId, month, year),

    prisma.recurringBill.findMany({
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
    }),

    prisma.transaction.aggregate({
      where: { household_id: householdId, type: 'INCOME', ...billingFilter },
      _sum: { amount: true },
    }),

    prisma.transaction.aggregate({
      where: { household_id: householdId, type: 'EXPENSE', ...billingFilter },
      _sum: { amount: true },
    }),
  ])

  const actualIncome = Number(actualIncomeResult._sum.amount ?? 0)
  const confirmedIncome = recurringIncomes
    .filter((i) => i.confirmed)
    .reduce((s, i) => s + (i.confirmedAmount ?? 0), 0)
  const pendingIncome = recurringIncomes
    .filter((i) => !i.confirmed)
    .reduce((s, i) => s + i.amount, 0)

  const totalBills = allBills.reduce((s, b) => {
    const rec = b.recurrence
    const startM = b.start_month
    const startY = b.start_year
    const monthDiff = (year - startY) * 12 + (month - startM)

    const applies =
      rec === 'MONTHLY' ? true :
      rec === 'BIMONTHLY' ? monthDiff % 2 === 0 :
      rec === 'QUARTERLY' ? monthDiff % 3 === 0 :
      rec === 'SEMIANNUAL' ? monthDiff % 6 === 0 :
      rec === 'ANNUAL' ? monthDiff % 12 === 0 :
      false

    return applies ? s + Number(b.amount) : s
  }, 0)

  const paidBills = allBills
    .filter((b) => b.monthlyStatus?.[0]?.status === 'PAID')
    .reduce((s, b) => s + Number(b.amount), 0)
  const pendingBills = totalBills - paidBills

  const totalExpenses = Number(actualExpenseResult._sum.amount ?? 0)

  const saldoReal = actualIncome - totalExpenses

  const saldoPrevisto = saldoReal + pendingIncome - pendingBills

  return {
    hasExpectedData: expectedIncome > 0 || totalBills > 0,

    expectedIncome,
    actualIncome,
    confirmedIncome,
    pendingIncome,
    incomeProgress: expectedIncome > 0
      ? Math.min(100, (actualIncome / expectedIncome) * 100)
      : 0,

    totalBills,
    paidBills,
    pendingBills,
    billsProgress: totalBills > 0
      ? Math.min(100, (paidBills / totalBills) * 100)
      : 0,

    totalExpenses,
    variableExpenses: Math.max(0, totalExpenses - paidBills),

    saldoReal,
    saldoPrevisto,
  }
}
