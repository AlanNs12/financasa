import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getAccountsWithBalances, getTransfers } from '@/lib/db/queries/accounts'
import { AccountsClient } from '@/components/contas-bancarias/accounts-client'
import { PageHeader } from '@/components/shared/page-header'

export const metadata = { title: 'Contas bancárias — Financasa' }

export default async function ContasBancariasPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contas bancárias"
          description="Faça login para gerenciar suas contas"
        />
      </div>
    )
  }

  const [accounts, transfers] = await Promise.all([
    getAccountsWithBalances(current.householdId, true),
    getTransfers(current.householdId, 20),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas bancárias"
        description="Acompanhe saldos, contas e transferências"
      />
      <AccountsClient accounts={accounts} transfers={transfers} />
    </div>
  )
}
