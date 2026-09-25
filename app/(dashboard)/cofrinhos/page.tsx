import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getAccountsWithBalances } from '@/lib/db/queries/accounts'
import { getJarsWithBalances } from '@/lib/db/queries/savings'
import { CofrinhosClient } from '@/components/cofrinhos/cofrinhos-client'
import { PageHeader } from '@/components/shared/page-header'

export const metadata = { title: 'Cofrinhos — Financasa' }

export default async function CofrinhosPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Cofrinhos"
          description="Faça login para gerenciar seus cofrinhos"
        />
      </div>
    )
  }

  const [accounts, jars] = await Promise.all([
    getAccountsWithBalances(current.householdId),
    getJarsWithBalances(current.householdId),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cofrinhos"
        description="Valores guardados por conta, fora do disponível"
      />
      <CofrinhosClient accounts={accounts} jars={jars} />
    </div>
  )
}
