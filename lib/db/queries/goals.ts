import { prisma } from '@/lib/db/prisma'
import type { FinancialGoal } from '@/types'

export async function getFinancialGoals(householdId: string): Promise<FinancialGoal[]> {
  const goals = await prisma.financialGoal.findMany({
    where: { household_id: householdId },
    orderBy: { created_at: 'desc' },
  })

  return goals.map((g: { target_amount: { toString: () => string }; current_amount: { toString: () => string }; deadline: Date | null; created_at: Date; updated_at: Date }) => ({
    ...g,
    target_amount: Number(g.target_amount),
    current_amount: Number(g.current_amount),
    deadline: g.deadline?.toISOString() ?? null,
    created_at: g.created_at.toISOString(),
    updated_at: g.updated_at.toISOString(),
  })) as unknown as FinancialGoal[]
}

export async function createFinancialGoal(data: {
  household_id: string
  user_id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  deadline?: Date
  icon?: string
  color?: string
}) {
  return prisma.financialGoal.create({ data })
}

export async function updateFinancialGoal(
  id: string,
  householdId: string,
  data: {
    name?: string
    description?: string | null
    target_amount?: number
    deadline?: Date | null
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
    icon?: string | null
    color?: string | null
  }
) {
  return prisma.financialGoal.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function addAmountToGoal(id: string, householdId: string, amount: number) {
  const updated = await prisma.financialGoal.updateMany({
    where: { id, household_id: householdId },
    data: {
      current_amount: { increment: amount },
    },
  })

  if (updated.count === 0) return null

  const goal = await prisma.financialGoal.findFirst({
    where: { id, household_id: householdId },
    select: {
      target_amount: true,
      current_amount: true,
    },
  })

  if (!goal) return null

  const current = Number(goal.current_amount)
  const target = Number(goal.target_amount)

  if (current >= target) {
    await prisma.financialGoal.updateMany({
      where: { id, household_id: householdId },
      data: { status: 'COMPLETED' },
    })
  }

  return goal
}

export async function deleteFinancialGoal(id: string, householdId: string) {
  return prisma.financialGoal.deleteMany({
    where: { id, household_id: householdId },
  })
}
