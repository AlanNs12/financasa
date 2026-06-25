import { prisma } from '@/lib/db/prisma'
import type { BillStatus } from '@prisma/client'

export async function getRecurringBills(householdId: string) {
  const bills = await prisma.recurringBill.findMany({
    where: { household_id: householdId, is_active: true },
    include: {
      user: { select: { id: true, name: true, avatar_url: true } },
      monthlyStatus: {
        where: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      },
    },
    orderBy: { due_day: 'asc' },
  })

  return bills.map((b: { amount: { toString: () => string }; created_at: Date }) => ({
    ...b,
    amount: Number(b.amount),
    created_at: b.created_at.toISOString(),
  }))
}

export async function updateBillStatus(
  billId: string,
  month: number,
  year: number,
  status: BillStatus,
  paidAmount?: number
) {
  return prisma.billMonthlyStatus.upsert({
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
}
