import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { getCategories } from '@/lib/db/queries/categories'
import { getCreditCards } from '@/lib/db/queries/credit-cards'
import { TransactionsClient } from '@/components/transacoes/transactions-client'
import { PageHeader } from '@/components/shared/page-header'

const now = new Date()

export default async function TransacoesPage({
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
      <div className="space-y-4">
        <PageHeader title="Transações" description="Faça login para gerenciar suas transações" />
      </div>
    )
  }

  const [transactions, categories, creditCards] = await Promise.all([
    getTransactionsByMonth(current.householdId, month, year),
    getCategories(current.householdId),
    getCreditCards(current.householdId),
  ])

  const clientTransactions = transactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type as 'INCOME' | 'EXPENSE',
    date: t.date,
    created_at: t.created_at,
    notes: t.notes ?? null,
    category: t.category ? { name: t.category.name, icon: t.category.icon, color: t.category.color } : null,
    user: t.user ? { name: t.user.name, avatar_url: t.user.avatar_url ?? null } : null,
    payment_method: t.payment_method,
  }))

  const clientCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type,
  }))

  const clientCreditCards = creditCards.map((c) => ({
    id: c.id,
    name: c.name,
    issuer: c.issuer ?? null,
  }))

  return (
    <div className="space-y-4">
      <PageHeader title="Transações" description="Gerencie suas entradas e saídas" />

      <TransactionsClient
        transactions={clientTransactions}
        categories={clientCategories}
        creditCards={clientCreditCards}
        month={month}
        year={year}
      />
    </div>
  )
}
