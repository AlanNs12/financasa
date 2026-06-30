'use server'

import { revalidatePath } from 'next/cache'
import { createTransaction, deleteTransaction } from '@/lib/db/queries/transactions'
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
  })

  revalidatePath('/transacoes')
  revalidatePath('/')
  return { success: true }
}

export async function deleteTransactionAction(id: string) {
  await deleteTransaction(id)
  revalidatePath('/transacoes')
  revalidatePath('/')
}
