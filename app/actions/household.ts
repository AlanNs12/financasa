'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUserHousehold, getHouseholdMembers } from '@/lib/db/queries/user'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function householdDataDeletions(householdId: string) {
  return [
    prisma.billMonthlyStatus.deleteMany({
      where: { recurring_bill: { household_id: householdId } },
    }),
    prisma.cardInvoicePayment.deleteMany({ where: { household_id: householdId } }),
    prisma.transaction.deleteMany({ where: { household_id: householdId } }),
    prisma.incomeMonthlyOverride.deleteMany({
      where: { recurring_income: { household_id: householdId } },
    }),
    prisma.recurringBill.deleteMany({ where: { household_id: householdId } }),
    prisma.recurringIncome.deleteMany({ where: { household_id: householdId } }),
    prisma.transfer.deleteMany({ where: { household_id: householdId } }),
    prisma.jarMovement.deleteMany({
      where: { jar: { household_id: householdId } },
    }),
    prisma.savingsJar.deleteMany({ where: { household_id: householdId } }),
    prisma.account.deleteMany({ where: { household_id: householdId } }),
    prisma.budgetItem.deleteMany({
      where: { budget: { household_id: householdId } },
    }),
    prisma.budget.deleteMany({ where: { household_id: householdId } }),
    prisma.investment.deleteMany({ where: { household_id: householdId } }),
    prisma.financialGoal.deleteMany({ where: { household_id: householdId } }),
    prisma.debt.deleteMany({ where: { household_id: householdId } }),
    prisma.creditCard.deleteMany({ where: { household_id: householdId } }),
    prisma.categoryBudgetPlan.deleteMany({ where: { household_id: householdId } }),
  ]
}

export async function clearHouseholdDataAction() {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const { householdId } = user

  try {
    await prisma.$transaction([
      ...householdDataDeletions(householdId),
      prisma.budgetGoal.deleteMany({
        where: { user: { household_id: householdId } },
      }),
    ])

    revalidatePath('/')
    return { success: true }
  } catch {
    return { error: 'Erro ao limpar os dados. Tente novamente.' }
  }
}

export async function deleteAccountAction() {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const { userId, householdId } = user
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  const members = await getHouseholdMembers(householdId)
  const remainingMembers = members.filter((m) => m.id !== userId)
  const isLastMember = remainingMembers.length === 0

  try {
    if (isLastMember) {
      await prisma.$transaction([
        ...householdDataDeletions(householdId),
        prisma.budgetGoal.deleteMany({ where: { user_id: userId } }),
        prisma.category.deleteMany({ where: { household_id: householdId } }),
        prisma.user.delete({ where: { id: userId } }),
        prisma.household.delete({ where: { id: householdId } }),
      ])
    } else {
      const newOwnerId = remainingMembers[0].id
      await prisma.$transaction([
        prisma.transaction.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.recurringBill.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.recurringIncome.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.investment.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.financialGoal.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.transfer.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.cardInvoicePayment.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.savingsJar.updateMany({
          where: { user_id: userId, household_id: householdId },
          data: { user_id: newOwnerId },
        }),
        prisma.jarMovement.updateMany({
          where: { user_id: userId },
          data: { user_id: newOwnerId },
        }),
        prisma.budgetGoal.deleteMany({ where: { user_id: userId } }),
        prisma.user.delete({ where: { id: userId } }),
      ])
    }

    if (authUser) {
      const adminClient = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await adminClient.auth.admin.deleteUser(authUser.id)
    }
  } catch (e) {
    console.error(e)
    return { error: 'Erro ao apagar a conta.' }
  }

  await supabase.auth.signOut()
  redirect('/login?deleted=true')
}
