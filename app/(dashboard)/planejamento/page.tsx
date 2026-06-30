import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getPlanejamentoData } from '@/lib/db/queries/budget'
import { PlanejamentoClient } from '@/components/planejamento/planejamento-client'

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
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Planejamento</h1>
          <p className="text-sm text-gray-500">Faça login para usar o planejamento</p>
        </div>
      </div>
    )
  }

  const data = await getPlanejamentoData(current.householdId, month, year)

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-20" /></div>}>
      <PlanejamentoClient data={data} month={month} year={year} />
    </Suspense>
  )
}
