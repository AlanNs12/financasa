import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import {
  getExpensesByCategory,
  getMonthlyEvolution,
  getPlannedVsActual,
} from '@/lib/db/queries/reports'
import { RelatoriosClient } from '@/components/relatorios/relatorios-client'
import { PageHeader } from '@/components/shared/page-header'

const now = new Date()

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const month = params.month ? Number(params.month) : now.getMonth() + 1
  const year = params.year ? Number(params.year) : now.getFullYear()

  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <PageHeader title="Relatórios" description="Faça login para ver os relatórios" />
      </div>
    )
  }

  const [expensesByCategory, monthlyEvolution, plannedVsActual] =
    await Promise.all([
      getExpensesByCategory(current.householdId, month, year),
      getMonthlyEvolution(current.householdId),
      getPlannedVsActual(current.householdId, month, year),
    ])

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-20" /></div>}>
      <RelatoriosClient
        expensesByCategory={expensesByCategory}
        monthlyEvolution={monthlyEvolution}
        plannedVsActual={plannedVsActual}
        month={month}
        year={year}
      />
    </Suspense>
  )
}
