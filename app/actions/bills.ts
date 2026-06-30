'use server'

import { revalidatePath } from 'next/cache'
import { updateBillStatus, createRecurringBill, createTransactionFromBill, deleteRecurringBill, updateRecurringBill } from '@/lib/db/queries/bills'
import { updateRecurringBillSchema } from '@/lib/validations/bill'
import { BillStatus, Recurrence } from '@prisma/client'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { z } from 'zod'

export async function markBillAsPaidAction(
  billId: string,
  month: number,
  year: number,
  paidAmount?: number
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { success: false, error: 'Usuário não autenticado.' }
  }

  await updateBillStatus(billId, month, year, BillStatus.PAID, paidAmount)

  const transactionCreated = await createTransactionFromBill(
    billId,
    current.userId,
    month,
    year
  )

  revalidatePath('/contas')
  revalidatePath('/transacoes')
  revalidatePath('/relatorios')
  revalidatePath('/')
  return { success: true, transactionCreated }
}

export async function createRecurringBillAction(data: {
  name: string
  amount: number
  due_day: number
  recurrence: string
  bill_type: 'fixa' | 'parcelada'
  installment_total?: number
  category_id?: string
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  if (!data.name || data.amount <= 0 || data.due_day < 1 || data.due_day > 31) {
    return { error: { _form: 'Dados inválidos.' } }
  }

  const isParcelada = data.bill_type === 'parcelada'
  const installmentTotal = isParcelada && data.installment_total ? data.installment_total : null

  await createRecurringBill({
    household_id: current.householdId,
    user_id: current.userId,
    name: data.name,
    amount: data.amount,
    due_day: data.due_day,
    recurrence: data.recurrence as Recurrence,
    category_id: data.category_id ?? null,
    installment_total: installmentTotal,
    installment_current: isParcelada ? 1 : null,
  })

  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}

export async function deleteRecurringBillAction(billId: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  try {
    z.string().uuid().parse(billId)
  } catch {
    return { error: 'ID inválido.' }
  }

  await deleteRecurringBill(billId, current.householdId)

  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}

export async function updateRecurringBillAction(
  billId: string,
  data: {
    name: string
    amount: number
    due_day: number
    recurrence: string
    category_id?: string
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = updateRecurringBillSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateRecurringBill(billId, current.householdId, {
    name: parsed.data.name,
    amount: parsed.data.amount,
    due_day: parsed.data.due_day,
    recurrence: parsed.data.recurrence as Recurrence,
    category_id: parsed.data.category_id ?? null,
  })

  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}
