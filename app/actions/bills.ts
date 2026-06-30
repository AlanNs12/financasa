'use server'

import { revalidatePath } from 'next/cache'
import { updateBillStatus, createRecurringBill } from '@/lib/db/queries/bills'
import { BillStatus, Recurrence } from '@prisma/client'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'

export async function markBillAsPaidAction(
  billId: string,
  month: number,
  year: number,
  paidAmount?: number
) {
  await updateBillStatus(billId, month, year, BillStatus.PAID, paidAmount)
  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}

export async function createRecurringBillAction(data: {
  name: string
  amount: number
  due_day: number
  recurrence: string
  bill_type: 'fixa' | 'parcelada'
  installment_total?: number
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
    installment_total: installmentTotal,
    installment_current: isParcelada ? 1 : null,
  })

  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}
