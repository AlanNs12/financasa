import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getPlanejamentoData } from '@/lib/db/queries/budget'
import { getTotalBillsForMonth } from '@/lib/db/queries/bills'
import { PlanejamentoClient } from '@/components/planejamento/planejamento-client'
import { PageHeader } from '@/components/shared/page-header'

const now = new Date()

export default async function PlanejamentoPage({
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
        <PageHeader title="Planejamento" description="Faça login para usar o planejamento" />
      </div>
    )
  }

  const [data, billsData] = await Promise.all([
    getPlanejamentoData(current.householdId, month, year),
    getTotalBillsForMonth(current.householdId),
  ])

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-20" /></div>}>
      <PlanejamentoClient data={data} totalBills={billsData.totalBills} month={month} year={year} />
    </Suspense>
  )
}
