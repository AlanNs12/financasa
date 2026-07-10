import { Suspense } from 'react'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getPlanejamentoData, getEffectiveIncome } from '@/lib/db/queries/budget'
import { getTotalBillsForMonth } from '@/lib/db/queries/bills'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { prisma } from '@/lib/db/prisma'
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

  const existingBudget = await prisma.budget.findUnique({
    where: {
      household_id_month_year: { household_id: current.householdId, month, year },
    },
  })

  if (!existingBudget) {
    await prisma.budget.create({
      data: {
        household_id: current.householdId,
        month,
        year,
        total_income: 0,
      },
    })
  }

  const [data, billsData, incomeData, allTransactions] = await Promise.all([
    getPlanejamentoData(current.householdId, month, year),
    getTotalBillsForMonth(current.householdId, month, year),
    getEffectiveIncome(current.householdId, month, year),
    getTransactionsByMonth(current.householdId, month, year),
  ])

  const clientTransactions = allTransactions.map((t) => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type as 'INCOME' | 'EXPENSE',
    date: t.date,
    category_id: t.category_id,
    payment_method: t.payment_method,
    notes: t.notes ?? null,
    user: t.user ? { name: t.user.name } : { name: 'Usuário' },
  }))

  return (
    <Suspense fallback={<div className="space-y-6"><div className="h-20" /></div>}>
      <PlanejamentoClient
        data={data}
        totalBills={billsData.totalBills}
        month={month}
        year={year}
        incomeData={incomeData}
        allTransactions={clientTransactions}
      />
    </Suspense>
  )
}
