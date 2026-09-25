import { MonthlyBudgetCard } from '@/components/dashboard/monthly-budget-card'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { UpcomingBills } from '@/components/dashboard/upcoming-bills'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { QuickAddTransaction } from '@/components/dashboard/quick-add-transaction'
import { getMonthAbbr } from '@/lib/format'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { getRecurringBills, computeBillStatus } from '@/lib/db/queries/bills'
import { getBudgetWithProgress } from '@/lib/db/queries/budget'
import { getActiveAlerts } from '@/lib/db/queries/alerts'
import { getCategories } from '@/lib/db/queries/categories'
import { getCreditCards } from '@/lib/db/queries/credit-cards'
import { getAccounts, getAccountsWithBalances } from '@/lib/db/queries/accounts'
import { getExpectedBudget } from '@/lib/db/queries/expected-budget'
import { getExpensesByCategory } from '@/lib/db/queries/reports'
import { AccountsBalanceCard } from '@/components/dashboard/accounts-balance-card'
import { ExpensePieChart } from '@/components/dashboard/expense-pie-chart'

const now = new Date()

async function loadDashboard(householdId: string, month: number, year: number) {
  const [
    transactions,
    bills,
    budget,
    alerts,
    categories,
    creditCards,
    accounts,
    accountsWithBalance,
    expectedBudget,
    expensesByCategory,
  ] = await Promise.all([
    getTransactionsByMonth(householdId, month, year),
    getRecurringBills(householdId, month, year),
    getBudgetWithProgress(householdId, month, year),
    getActiveAlerts(householdId, month, year),
    getCategories(householdId),
    getCreditCards(householdId, false),
    getAccounts(householdId),
    getAccountsWithBalances(householdId),
    getExpectedBudget(householdId, month, year),
    getExpensesByCategory(householdId, month, year),
  ])

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expenses
  const totalBudget = budget ? budget.total_income : income
  const percentage = totalBudget > 0 ? Math.round((expenses / totalBudget) * 100) : 0

  const pendingBillsAmount = bills
    .filter((b) => {
      const status = b.monthlyStatus?.[0]
      return !status || status.status !== 'PAID'
    })
    .reduce((sum, b) => sum + b.amount, 0)

  const recentTransactions = transactions.slice(0, 5).map((t) => ({
    id: t.id,
    description: t.description,
    amount: t.amount,
    type: t.type as 'INCOME' | 'EXPENSE',
    date: t.date,
    category: t.category as { name: string; icon: string; color: string } | null,
  }))

  const upcomingBills = bills.slice(0, 3).map((b) => {
    const saved = b.monthlyStatus?.[0]?.status
    const computed = computeBillStatus(b.due_day, month, year, saved)
    return {
      id: b.id,
      name: b.name,
      amount: b.amount,
      due_day: b.due_day,
      status: computed === 'PAID' ? 'paid' as const : computed === 'OVERDUE' ? 'overdue' as const : 'pending' as const,
    }
  })

  return {
    income,
    expenses,
    balance,
    totalBudget,
    percentage,
    pendingBillsAmount,
    recentTransactions,
    upcomingBills,
    alerts,
    categories,
    creditCards,
    accounts,
    accountsWithBalance,
    expectedBudget,
    expensesByCategory,
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const currentMonth = params.month ? Number(params.month) : now.getMonth() + 1
  const currentYear = params.year ? Number(params.year) : now.getFullYear()
  const monthAbbr = getMonthAbbr(currentMonth)

  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Faça login para acessar o dashboard</p>
        </div>
      </div>
    )
  }

  const data = await loadDashboard(current.householdId, currentMonth, currentYear)

  return (
    <div className="space-y-6">
      <MonthlyBudgetCard
        month={monthAbbr}
        balance={data.balance}
        spent={data.expenses}
        totalBudget={data.totalBudget}
        percentage={data.percentage}
        expectedBudget={data.expectedBudget}
      />

      <SummaryCards
        income={data.income}
        expenses={data.expenses}
        balance={data.balance}
        pendingBills={data.pendingBillsAmount}
      />

      <AccountsBalanceCard accounts={data.accountsWithBalance} />

      {data.alerts.length > 0 && (
        <AlertsPanel alerts={data.alerts} month={currentMonth} year={currentYear} />
      )}

      <ExpensePieChart data={data.expensesByCategory} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={data.recentTransactions} />
        <UpcomingBills bills={data.upcomingBills} month={currentMonth} year={currentYear} />
      </div>

      <QuickAddTransaction
        categories={data.categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, type: c.type }))}
        creditCards={data.creditCards.map((c) => ({ id: c.id, name: c.name, issuer: c.issuer ?? null, closing_day: c.closing_day ?? null }))}
        accounts={data.accounts.map((a) => ({ id: a.id, name: a.name, icon: a.icon ?? null, color: a.color ?? null }))}
        month={currentMonth}
        year={currentYear}
      />
    </div>
  )
}
