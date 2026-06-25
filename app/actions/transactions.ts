'use server'

'use server'

import { revalidatePath } from 'next/cache'
import { createTransaction, deleteTransaction } from '@/lib/db/queries/transactions'
import { transactionSchema } from '@/lib/validations/transaction'
import type { TransactionType, PaymentMethod } from '@prisma/client'

export async function createTransactionAction(
  householdId: string,
  userId: string,
  formData: FormData
) {
  const rawData = {
    type: formData.get('type') as string,
    amount: formData.get('amount') as string,
    description: formData.get('description') as string,
    date: formData.get('date') as string,
    category_id: formData.get('category_id') as string,
    payment_method: formData.get('payment_method') as string,
    notes: (formData.get('notes') as string) || undefined,
  }

  const parsed = transactionSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createTransaction({
    household_id: householdId,
    user_id: userId,
    category_id: parsed.data.category_id,
    type: parsed.data.type as TransactionType,
    amount: parsed.data.amount,
    description: parsed.data.description,
    date: new Date(parsed.data.date),
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
