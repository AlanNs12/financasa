'use server'

import { revalidatePath } from 'next/cache'
import { createFinancialGoal, updateFinancialGoal, addAmountToGoal, deleteFinancialGoal } from '@/lib/db/queries/goals'
import { goalSchema, updateGoalSchema, addGoalAmountSchema } from '@/lib/validations/goal'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'

export async function createGoalAction(data: {
  name: string
  description?: string
  target_amount: number
  current_amount: number
  deadline?: string
  icon?: string
  color?: string
}) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = goalSchema.safeParse({
    name: data.name,
    description: data.description,
    target_amount: String(data.target_amount),
    current_amount: String(data.current_amount),
    deadline: data.deadline,
    icon: data.icon,
    color: data.color,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createFinancialGoal({
    household_id: current.householdId,
    user_id: current.userId,
    name: parsed.data.name,
    description: parsed.data.description,
    target_amount: parsed.data.target_amount,
    current_amount: parsed.data.current_amount,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
    icon: parsed.data.icon ?? '🎯',
    color: parsed.data.color ?? '#6366f1',
  })

  revalidatePath('/metas')
  revalidatePath('/')
  return { success: true }
}

export async function updateGoalAction(
  id: string,
  data: {
    name?: string
    description?: string
    target_amount?: number
    deadline?: string
    icon?: string
    color?: string
  }
) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: { _form: 'Usuário não autenticado.' } }
  }

  const parsed = updateGoalSchema.safeParse({
    name: data.name,
    description: data.description,
    target_amount: data.target_amount ? String(data.target_amount) : undefined,
    deadline: data.deadline,
    icon: data.icon,
    color: data.color,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await updateFinancialGoal(id, {
    name: parsed.data.name,
    description: parsed.data.description ?? undefined,
    target_amount: parsed.data.target_amount,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : parsed.data.deadline === '' ? undefined : undefined,
    icon: parsed.data.icon,
    color: parsed.data.color,
  })

  revalidatePath('/metas')
  revalidatePath('/')
  return { success: true }
}

export async function addGoalAmountAction(id: string, amount: number) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const parsed = addGoalAmountSchema.safeParse({ amount })
  if (!parsed.success) {
    return { error: 'Valor inválido.' }
  }

  const goal = await addAmountToGoal(id, parsed.data.amount)

  const currentAmount = Number(goal.current_amount)
  const targetAmount = Number(goal.target_amount)

  revalidatePath('/metas')
  revalidatePath('/')

  return {
    success: true,
    completed: currentAmount >= targetAmount,
    currentAmount,
    targetAmount,
  }
}

export async function deleteGoalAction(id: string) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const result = await deleteFinancialGoal(id, current.householdId)
  if (result.count === 0) {
    return { error: 'Meta não encontrada.' }
  }

  revalidatePath('/metas')
  revalidatePath('/')
  return { success: true }
}
