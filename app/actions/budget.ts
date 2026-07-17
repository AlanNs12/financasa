'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { upsertCategoryBudgetPlan, deactivateCategoryBudgetPlan } from '@/lib/db/queries/budget'

export async function updateBudgetIncomeAction(month: number, year: number, totalIncome: number) {
  const current = await getCurrentUserHousehold()
  if (!current) return { success: false, error: 'Usuário não autenticado.' }

  await prisma.budget.upsert({
    where: {
      household_id_month_year: { household_id: current.householdId, month, year },
    },
    update: { total_income: totalIncome },
    create: {
      household_id: current.householdId,
      month,
      year,
      total_income: totalIncome,
    },
  })

  revalidatePath('/planejamento')
  revalidatePath('/')
  return { success: true }
}

export async function upsertBudgetItemAction(
  month: number,
  year: number,
  categoryId: string,
  planned: number,
  repeatMonthly: boolean = false
) {
  const current = await getCurrentUserHousehold()
  if (!current) return { success: false, error: 'Usuário não autenticado.' }

  if (repeatMonthly) {
    await upsertCategoryBudgetPlan(current.householdId, categoryId, planned, month, year)
  } else {
    await deactivateCategoryBudgetPlan(current.householdId, categoryId)
  }

  const budget = await prisma.budget.upsert({
    where: {
      household_id_month_year: { household_id: current.householdId, month, year },
    },
    update: {},
    create: {
      household_id: current.householdId,
      month,
      year,
    },
  })

  await prisma.budgetItem.upsert({
    where: {
      budget_id_category_id: {
        budget_id: budget.id,
        category_id: categoryId,
      },
    },
    update: { planned },
    create: {
      budget_id: budget.id,
      category_id: categoryId,
      planned,
    },
  })

  revalidatePath('/planejamento')
  revalidatePath('/')
  return { success: true }
}
