import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { getCategories } from '@/lib/db/queries/categories'
import { getCreditCards } from '@/lib/db/queries/credit-cards'
import { TransactionsClient } from '@/components/transacoes/transactions-client'

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
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Transações</h1>
          <p className="text-sm text-gray-500">Faça login para gerenciar suas transações</p>
        </div>
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
    category: t.category ?? null,
    user: t.user ?? null,
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
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Transações</h1>
        <p className="text-sm text-gray-500">Gerencie suas entradas e saídas</p>
      </div>

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
