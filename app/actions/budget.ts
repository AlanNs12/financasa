'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'

export async function updateBudgetAction(
  householdId: string,
  month: number,
  year: number,
  totalIncome: number
) {
  await prisma.budget.upsert({
    where: {
      household_id_month_year: { household_id: householdId, month, year },
    },
    update: { total_income: totalIncome },
    create: {
      household_id: householdId,
      month,
      year,
      total_income: totalIncome,
    },
  })

  revalidatePath('/planejamento')
  revalidatePath('/')
  return { success: true }
}
