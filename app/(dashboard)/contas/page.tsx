import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getRecurringBills, getBillsHistory } from '@/lib/db/queries/bills'
import { getCategories } from '@/lib/db/queries/categories'
import { getRecurringIncomes, getRecurringIncomesForMonth } from '@/lib/db/queries/recurring-incomes'
import { ContasClient } from '@/components/contas/contas-client'
import { PageHeader } from '@/components/shared/page-header'

const now = new Date()

export default async function ContasPage({
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
        <PageHeader title="Contas" description="Faça login para gerenciar suas contas" />
      </div>
    )
  }

  const [bills, history, categories, recurringIncomes, monthIncomes] = await Promise.all([
    getRecurringBills(current.householdId, month, year),
    getBillsHistory(current.householdId),
    getCategories(current.householdId),
    getRecurringIncomes(current.householdId),
    getRecurringIncomesForMonth(current.householdId, month, year),
  ])

  const clientBills = bills.map((b) => ({
    id: b.id,
    name: b.name,
    amount: b.amount,
    due_day: b.due_day,
    recurrence: b.recurrence,
    installment_total: b.installment_total,
    installment_current: b.installment_current,
    start_month: b.start_month,
    start_year: b.start_year,
    created_at: b.created_at,
    monthlyStatus: b.monthlyStatus.map((ms) => ({
      status: ms.status,
      paid_at: ms.paid_at?.toISOString() ?? null,
    })),
  }))

  const expenseCategories = categories
    .filter((c) => c.type === 'EXPENSE' || c.type === 'BOTH')
    .map((c) => ({ id: c.id, name: c.name, icon: c.icon }))

  const clientIncomes = recurringIncomes.map((i) => ({
    id: i.id,
    name: i.name,
    amount: i.amount,
    recurrence: i.recurrence as string,
    start_month: i.start_month,
    start_year: i.start_year,
  }))

  const clientMonthIncomes = monthIncomes.map((i) => ({
    id: i.id,
    name: i.name,
    amount: i.amount,
    recurrence: i.recurrence as string,
    start_month: i.start_month,
    start_year: i.start_year,
  }))

  return (
    <ContasClient
      bills={clientBills}
      history={history}
      month={month}
      year={year}
      categories={expenseCategories}
      recurringIncomes={clientIncomes}
      monthIncomes={clientMonthIncomes}
    />
  )
}
