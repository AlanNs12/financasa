'use server'

import { revalidatePath } from 'next/cache'
import { createFinancialGoal } from '@/lib/db/queries/goals'
import { goalSchema } from '@/lib/validations/goal'

export async function createGoalAction(
  householdId: string,
  userId: string,
  formData: FormData
) {
  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    target_amount: formData.get('target_amount') as string,
    current_amount: formData.get('current_amount') as string || '0',
    deadline: (formData.get('deadline') as string) || undefined,
    icon: (formData.get('icon') as string) || '🎯',
    color: (formData.get('color') as string) || '#6366f1',
  }

  const parsed = goalSchema.safeParse(rawData)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  await createFinancialGoal({
    household_id: householdId,
    user_id: userId,
    name: parsed.data.name,
    description: parsed.data.description,
    target_amount: parsed.data.target_amount,
    current_amount: parsed.data.current_amount,
    deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
    icon: parsed.data.icon,
    color: parsed.data.color,
  })

  revalidatePath('/metas')
  return { success: true }
}
