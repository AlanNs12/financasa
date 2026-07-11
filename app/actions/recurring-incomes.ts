'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import {
  createRecurringIncome,
  updateRecurringIncome,
  deleteRecurringIncome,
} from '@/lib/db/queries/recurring-incomes'
import { recurringIncomeSchema } from '@/lib/validations/recurring-income'
import type { Recurrence } from '@prisma/client'

export async function createRecurringIncomeAction(data: unknown) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const parsed = recurringIncomeSchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos' }

  await createRecurringIncome({
    household_id: user.householdId,
    user_id: user.userId,
    name: parsed.data.name,
    amount: parsed.data.amount,
    recurrence: parsed.data.recurrence as Recurrence,
    start_month: parsed.data.start_month,
    start_year: parsed.data.start_year,
  })

  revalidatePath('/planejamento')
  revalidatePath('/contas')
  revalidatePath('/')
  return { success: true }
}

export async function updateRecurringIncomeAction(id: string, data: unknown) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const parsed = recurringIncomeSchema.partial().safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos' }

  await updateRecurringIncome(id, user.householdId, {
    name: parsed.data.name ?? '',
    amount: parsed.data.amount ?? 0,
    recurrence: (parsed.data.recurrence ?? 'MONTHLY') as Recurrence,
  })

  revalidatePath('/planejamento')
  revalidatePath('/contas')
  return { success: true }
}

export async function deleteRecurringIncomeAction(id: string) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  await deleteRecurringIncome(id, user.householdId)

  revalidatePath('/planejamento')
  revalidatePath('/contas')
  return { success: true }
}
