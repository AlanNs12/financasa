'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { revalidatePath } from 'next/cache'

export async function clearHouseholdDataAction() {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const { householdId } = user

  try {
    await prisma.$transaction([
      prisma.billMonthlyStatus.deleteMany({
        where: { recurring_bill: { household_id: householdId } }
      }),
      prisma.recurringBill.deleteMany({
        where: { household_id: householdId }
      }),
      prisma.budgetItem.deleteMany({
        where: { budget: { household_id: householdId } }
      }),
      prisma.budget.deleteMany({
        where: { household_id: householdId }
      }),
      prisma.transaction.deleteMany({
        where: { household_id: householdId }
      }),
      prisma.financialGoal.deleteMany({
        where: { household_id: householdId }
      }),
      prisma.investment.deleteMany({
        where: { household_id: householdId }
      }),
      prisma.debt.deleteMany({
        where: { household_id: householdId }
      }),
      prisma.creditCard.deleteMany({
        where: { household_id: householdId }
      }),
    ])

    revalidatePath('/')
    return { success: true }
  } catch {
    return { error: 'Erro ao limpar os dados. Tente novamente.' }
  }
}
