import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getFinancialGoals } from '@/lib/db/queries/goals'
import { MetasClient } from '@/components/metas/metas-client'

export default async function MetasPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Metas</h1>
          <p className="text-sm text-muted-foreground">Faça login para ver suas metas</p>
        </div>
      </div>
    )
  }

  const goals = await getFinancialGoals(current.householdId)

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-20" /></div>}>
      <MetasClient goals={goals} />
    </Suspense>
  )
}
