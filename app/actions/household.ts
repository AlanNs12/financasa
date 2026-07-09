'use server'

import { prisma } from '@/lib/db/prisma'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

export async function deleteAccountAction() {
  const user = await getCurrentUserHousehold()
  if (!user) return { error: 'Não autorizado' }

  const { userId, householdId } = user
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

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
      prisma.budgetGoal.deleteMany({
        where: { user_id: userId }
      }),
      prisma.category.deleteMany({
        where: { household_id: householdId }
      }),
      prisma.user.delete({ where: { id: userId } }),
    ])

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
