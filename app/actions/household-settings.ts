'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const workHoursSchema = z.number().int().min(1).max(24)

export async function updateWorkHoursAction(hoursPerDay: number) {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const parsed = workHoursSchema.safeParse(hoursPerDay)
  if (!parsed.success) return { error: 'Valor inválido (1-24 horas)' }

  await prisma.household.update({
    where: { id: user.householdId },
    data: { work_hours_per_day: parsed.data },
  })

  revalidatePath('/valor-real')
  revalidatePath('/configuracoes')
  return { success: true }
}
