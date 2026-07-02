import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getFinancialGoals } from '@/lib/db/queries/goals'
import { MetasClient } from '@/components/metas/metas-client'
import { PageHeader } from '@/components/shared/page-header'

export default async function MetasPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <PageHeader title="Metas" description="Faça login para ver suas metas" />
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
