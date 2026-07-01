import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getFinancialGoals } from '@/lib/db/queries/goals'
import {
  getInvestments,
  getInvestmentsSummary,
  getInvestmentsByGoal,
} from '@/lib/db/queries/investments'
import { InvestimentosClient } from '@/components/investimentos/investimentos-client'

export default async function InvestimentosPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Faça login para ver seus investimentos</p>
        </div>
      </div>
    )
  }

  const [investments, summary, byGoal, goals] = await Promise.all([
    getInvestments(current.householdId),
    getInvestmentsSummary(current.householdId),
    getInvestmentsByGoal(current.householdId),
    getFinancialGoals(current.householdId),
  ])

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-20" /></div>}>
      <InvestimentosClient
        investments={investments}
        summary={summary}
        byGoal={byGoal}
        goals={goals}
      />
    </Suspense>
  )
}
