'use server'

import { revalidatePath } from 'next/cache'
import { createTransaction, deleteTransaction, updateTransaction } from '@/lib/db/queries/transactions'
import { transactionSchema } from '@/lib/validations/transaction'
import type { TransactionType, PaymentMethod } from '@prisma/client'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { calculateBillingPeriod } from '@/lib/calculations/billing'
import { prisma } from '@/lib/db/prisma'

async function computeBilling(
  paymentMethod: string,
  creditCardId: string | undefined | null,
  dateString: string,
  householdId: string
) {
  if (paymentMethod !== 'CREDIT_CARD' || !creditCardId) {
    return { billingMonth: null as number | null, billingYear: null as number | null }
  }

  const card = await prisma.creditCard.findFirst({
    where: { id: creditCardId, household_id: householdId },
    select: { closing_day: true },
  })

  const purchaseDate = new Date(dateString + 'T12:00:00')
  const period = calculateBillingPeriod(purchaseDate, card?.closing_day ?? null)
  return { billingMonth: period.billingMonth, billingYear: period.billingYear }
}

export async function createTransactionAction(data: {
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  date: string
  category_id: string
  payment_method: string
  notes?: string
  credit_card_id?: string | null
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const rawData = {
    type: data.type,
    amount: String(data.amount),
    description: data.description,
    date: data.date,
    category_id: data.category_id,
    payment_method: data.payment_method,
    notes: data.notes,
    credit_card_id: data.credit_card_id || undefined,
  }

  const parsed = transactionSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const { billingMonth, billingYear } = await computeBilling(
    parsed.data.payment_method,
    parsed.data.credit_card_id,
    parsed.data.date,
    current.householdId
  )

  const purchaseDate = new Date(parsed.data.date + 'T12:00:00')
  const purchaseMonth = purchaseDate.getMonth() + 1

  await createTransaction({
    household_id: current.householdId,
    user_id: current.userId,
    category_id: parsed.data.category_id,
    type: parsed.data.type as TransactionType,
    amount: parsed.data.amount,
    description: parsed.data.description,
    date: purchaseDate,
    payment_method: parsed.data.payment_method as PaymentMethod,
    notes: parsed.data.notes,
    credit_card_id: parsed.data.credit_card_id || undefined,
    billing_month: billingMonth,
    billing_year: billingYear,
  })

  revalidatePath('/transacoes')
  revalidatePath('/')
  return {
    success: true,
    billingMoved: billingMonth !== null && billingMonth !== purchaseMonth,
    billingMonth,
    billingYear,
  }
}

export async function deleteTransactionAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const count = await deleteTransaction(id, current.householdId)

  if (count === 0) {
    return { error: 'Transação não encontrada.' }
  }

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}

export async function updateTransactionAction(
  id: string,
  data: {
    type: 'INCOME' | 'EXPENSE'
    description: string
    amount: number
    date: string
    category_id: string
    payment_method: string
    notes?: string
    credit_card_id?: string | null
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const rawData = {
    type: data.type,
    amount: String(data.amount),
    description: data.description,
    date: data.date,
    category_id: data.category_id,
    payment_method: data.payment_method,
    notes: data.notes,
    credit_card_id: data.credit_card_id || undefined,
  }

  const parsed = transactionSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  let billingMonth: number | null = null
  let billingYear: number | null = null

  if (parsed.data.payment_method !== 'CREDIT_CARD') {
    billingMonth = null
    billingYear = null
  } else if (parsed.data.credit_card_id) {
    const result = await computeBilling(
      parsed.data.payment_method,
      parsed.data.credit_card_id,
      parsed.data.date,
      current.householdId
    )
    billingMonth = result.billingMonth
    billingYear = result.billingYear
  } else {
    const purchaseDate = new Date(parsed.data.date + 'T12:00:00')
    billingMonth = purchaseDate.getMonth() + 1
    billingYear = purchaseDate.getFullYear()
  }

  await updateTransaction(id, current.householdId, {
    description: parsed.data.description,
    amount: parsed.data.amount,
    type: parsed.data.type as TransactionType,
    date: new Date(parsed.data.date + 'T12:00:00'),
    category_id: parsed.data.category_id,
    payment_method: parsed.data.payment_method,
    notes: parsed.data.notes,
    credit_card_id: parsed.data.credit_card_id || undefined,
    billing_month: billingMonth,
    billing_year: billingYear,
  })

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}
