import { prisma } from '@/lib/db/prisma'
import type { BillStatus, Recurrence } from '@prisma/client'

export type ComputedBillStatus = 'PAID' | 'PENDING' | 'OVERDUE'

export function computeBillStatus(
  dueDay: number,
  month: number,
  year: number,
  savedStatus?: string | null
): ComputedBillStatus {
  if (savedStatus === 'PAID') return 'PAID'
  if (savedStatus === 'SKIPPED') return 'PENDING'

  const now = new Date()
  const currentDay = now.getDate()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if (year < currentYear) return 'OVERDUE'
  if (year === currentYear && month < currentMonth) return 'OVERDUE'

  const dim = new Date(year, month, 0).getDate()
  const effectiveDueDay = dueDay > dim ? dim : dueDay

  if (year === currentYear && month === currentMonth && effectiveDueDay < currentDay) {
    return 'OVERDUE'
  }

  return 'PENDING'
}

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
    start_month: b.start_month,
    start_year: b.start_year,
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

