import { prisma } from '@/lib/db/prisma'
import type { Investment, InvestmentType } from '@/types'
import { calculateInvestmentsSummary } from '@/lib/calculations/investments'

function serializeInvestment(
  inv: {
    id: string
    household_id: string
    user_id: string
    name: string
    asset_type: InvestmentType
    goal_id: string | null
    goal: { id: string; name: string; icon: string | null } | null
    rate_description: string | null
    applied_at: Date
    maturity_at: Date | null
    gross_invested: { toString: () => string }
    gross_current: { toString: () => string }
    net_current: { toString: () => string }
    created_at: Date
    updated_at: Date
  }
): Investment {
  return {
    id: inv.id,
    household_id: inv.household_id,
    user_id: inv.user_id,
    name: inv.name,
    asset_type: inv.asset_type,
    goal_id: inv.goal_id,
    goal: inv.goal
      ? { id: inv.goal.id, name: inv.goal.name, icon: inv.goal.icon }
      : null,
    rate_description: inv.rate_description,
    applied_at: inv.applied_at.toISOString(),
    maturity_at: inv.maturity_at?.toISOString() ?? null,
    gross_invested: Number(inv.gross_invested),
    gross_current: Number(inv.gross_current),
    net_current: Number(inv.net_current),
    created_at: inv.created_at.toISOString(),
    updated_at: inv.updated_at.toISOString(),
  }
}

export async function getInvestments(householdId: string): Promise<Investment[]> {
  const investments = await prisma.investment.findMany({
    where: { household_id: householdId },
    include: {
      goal: { select: { id: true, name: true, icon: true } },
    },
    orderBy: { applied_at: 'desc' },
  })

  return investments.map(serializeInvestment)
}

export interface InvestmentSummary {
  totalGrossInvested: number
  totalNetCurrent: number
  totalGrossCurrent: number
  profit: number
  profitPercentage: number
  byAssetType: {
    asset_type: InvestmentType
    total: number
    percentage: number
  }[]
}

export async function getInvestmentsSummary(
  householdId: string
): Promise<InvestmentSummary> {
  const investments = await prisma.investment.findMany({
    where: { household_id: householdId },
  })

  return calculateInvestmentsSummary(
    investments.map((i) => ({
      gross_invested: Number(i.gross_invested),
      gross_current: Number(i.gross_current),
      net_current: Number(i.net_current),
      asset_type: i.asset_type,
    }))
  )
}

export interface InvestmentByGoal {
  goalId: string | null
  goalName: string
  goalIcon: string | null
  total: number
}

export async function getInvestmentsByGoal(
  householdId: string
): Promise<InvestmentByGoal[]> {
  const investments = await prisma.investment.findMany({
    where: { household_id: householdId },
    include: {
      goal: { select: { id: true, name: true, icon: true } },
    },
  })

  const byGoalMap = new Map<
    string,
    { goalId: string | null; goalName: string; goalIcon: string | null; total: number }
  >()

  for (const inv of investments) {
    const key = inv.goal_id ?? '__no_goal__'
    const existing = byGoalMap.get(key)
    const amount = Number(inv.net_current)
    if (existing) {
      existing.total += amount
    } else {
      byGoalMap.set(key, {
        goalId: inv.goal_id,
        goalName: inv.goal?.name ?? 'Sem objetivo',
        goalIcon: inv.goal?.icon ?? null,
        total: amount,
      })
    }
  }

  return Array.from(byGoalMap.values()).sort((a, b) => b.total - a.total)
}

export async function createInvestment(data: {
  household_id: string
  user_id: string
  name: string
  asset_type: InvestmentType
  goal_id?: string
  rate_description?: string
  applied_at: Date
  maturity_at?: Date
  gross_invested: number
  gross_current: number
  net_current: number
}) {
  return prisma.investment.create({ data })
}

export async function updateInvestment(
  id: string,
  householdId: string,
  data: {
    name?: string
    asset_type?: InvestmentType
    goal_id?: string | null
    rate_description?: string | null
    applied_at?: Date
    maturity_at?: Date | null
    gross_invested?: number
    gross_current?: number
    net_current?: number
  }
) {
  return prisma.investment.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function deleteInvestment(
  id: string,
  householdId: string
): Promise<number> {
  const result = await prisma.investment.deleteMany({
    where: { id, household_id: householdId },
  })
  return result.count
}
