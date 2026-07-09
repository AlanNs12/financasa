'use server'

import { revalidatePath } from 'next/cache'
import { createTransaction, deleteTransaction, updateTransaction } from '@/lib/db/queries/transactions'
import { transactionSchema } from '@/lib/validations/transaction'
import type { TransactionType, PaymentMethod } from '@prisma/client'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'

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

  await createTransaction({
    household_id: current.householdId,
    user_id: current.userId,
    category_id: parsed.data.category_id,
    type: parsed.data.type as TransactionType,
    amount: parsed.data.amount,
    description: parsed.data.description,
    date: new Date(parsed.data.date + 'T12:00:00'),
    payment_method: parsed.data.payment_method as PaymentMethod,
    notes: parsed.data.notes,
    credit_card_id: parsed.data.credit_card_id || undefined,
  })

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
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

  await updateTransaction(id, current.householdId, {
    description: parsed.data.description,
    amount: parsed.data.amount,
    type: parsed.data.type as TransactionType,
    date: new Date(parsed.data.date + 'T12:00:00'),
    category_id: parsed.data.category_id,
    payment_method: parsed.data.payment_method,
    notes: parsed.data.notes,
    credit_card_id: parsed.data.credit_card_id || undefined,
  })

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}
