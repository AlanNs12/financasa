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
