'use server'

import { z } from 'zod'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { createCategory, deleteCategory } from '@/lib/db/queries/categories'
import { revalidatePath } from 'next/cache'

const categorySchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50),
  icon: z.string().min(1).max(10),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  type: z.enum(['INCOME', 'EXPENSE']),
})

export async function createCategoryAction(data: unknown) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const parsed = categorySchema.safeParse(data)
  if (!parsed.success) return { error: 'Dados inválidos' }

  await createCategory({ household_id: user.householdId, ...parsed.data })
  revalidatePath('/configuracoes')
  revalidatePath('/transacoes')
  revalidatePath('/planejamento')
  return { success: true }
}

export async function deleteCategoryAction(id: string) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  try {
    await deleteCategory(id, user.householdId)
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro ao apagar categoria'
    return { error: message }
  }
}
