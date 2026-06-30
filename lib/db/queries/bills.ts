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
  due_day: number
  recurrence: Recurrence
  installment_total?: number | null
  installment_current?: number | null
}) {
  return prisma.recurringBill.create({
    data: {
      household_id: data.household_id,
      user_id: data.user_id,
      name: data.name,
      amount: data.amount,
      due_day: data.due_day,
      recurrence: data.recurrence,
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

