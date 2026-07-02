import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getDebts, getDebtsSummary } from '@/lib/db/queries/debts'
import { DividasClient } from '@/components/dividas/dividas-client'
import { PageHeader } from '@/components/shared/page-header'

export default async function DividasPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dívidas" description="Faça login para ver suas dívidas" />
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
