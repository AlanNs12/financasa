import { prisma } from '@/lib/db/prisma'
import type { Transaction } from '@/types'
import type { TransactionType, PaymentMethod } from '@prisma/client'

export type CreateTransactionInput = {
  household_id: string
  user_id: string
  category_id: string
  type: TransactionType
  amount: number
  description: string
  date: Date
  payment_method: PaymentMethod
  notes?: string
  recurring_bill_id?: string
  credit_card_id?: string
  billing_month?: number | null
  billing_year?: number | null
}

export async function getTransactionsByMonth(
  householdId: string,
  month: number,
  year: number
): Promise<Transaction[]> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      user: { select: { id: true, name: true, avatar_url: true } },
    },
    orderBy: { date: 'desc' },
  })

  return transactions.map((t: { amount: { toString: () => string }; created_at: Date; updated_at: Date; date: Date; billing_month: number | null; billing_year: number | null; installment_group_id: string | null; installment_total: number | null; installment_current: number | null }) => ({
    ...t,
    amount: Number(t.amount),
    created_at: t.created_at.toISOString(),
    updated_at: t.updated_at.toISOString(),
    date: t.date.toISOString(),
    billing_month: t.billing_month,
    billing_year: t.billing_year,
    installment_group_id: t.installment_group_id,
    installment_total: t.installment_total,
    installment_current: t.installment_current,
  })) as unknown as Transaction[]
}

export async function createTransaction(data: CreateTransactionInput) {
  return prisma.transaction.create({
    data: {
      household_id: data.household_id,
      user_id: data.user_id,
      category_id: data.category_id,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: data.date,
      payment_method: data.payment_method,
      notes: data.notes,
      recurring_bill_id: data.recurring_bill_id,
      credit_card_id: data.credit_card_id,
      billing_month: data.billing_month,
      billing_year: data.billing_year,
    },
  })
}

export async function deleteTransaction(
  id: string,
  householdId: string
): Promise<number> {
  const result = await prisma.transaction.deleteMany({
    where: { id, household_id: householdId },
  })
  return result.count
}

export async function updateTransaction(
  id: string,
  householdId: string,
  data: {
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    date: Date
    category_id: string
    payment_method: string
    notes?: string
    credit_card_id?: string
    billing_month?: number | null
    billing_year?: number | null
  }
) {
  return prisma.transaction.updateMany({
    where: { id, household_id: householdId },
    data: {
      description: data.description,
      amount: data.amount,
      type: data.type,
      date: data.date,
      category_id: data.category_id,
      payment_method: data.payment_method as PaymentMethod,
      notes: data.notes,
      credit_card_id: data.credit_card_id || null,
      billing_month: data.billing_month,
      billing_year: data.billing_year,
    },
  })
}
