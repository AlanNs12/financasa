import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getDebts, getDebtsSummary } from '@/lib/db/queries/debts'
import { DividasClient } from '@/components/dividas/dividas-client'

export default async function DividasPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Dívidas</h1>
          <p className="text-sm text-muted-foreground">Faça login para ver suas dívidas</p>
        </div>
      </div>
    )
  }

  const [debts, summary] = await Promise.all([
    getDebts(current.householdId),
    getDebtsSummary(current.householdId),
  ])

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-20" /></div>}>
      <DividasClient debts={debts} summary={summary} />
    </Suspense>
  )
}
