import { MonthlyBudgetCard } from '@/components/dashboard/monthly-budget-card'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { UpcomingBills } from '@/components/dashboard/upcoming-bills'
import { getMonthAbbr } from '@/lib/format'

const now = new Date()
const currentMonth = now.getMonth() + 1
const monthAbbr = getMonthAbbr(currentMonth)

const mockTransactions = [
  { id: '1', description: 'Mercado Assaí', amount: 189.43, type: 'EXPENSE' as const, date: '2026-06-13', category: { name: 'Alimentação', icon: '🛒', color: '#f59e0b' } },
  { id: '2', description: 'Uber', amount: 24.90, type: 'EXPENSE' as const, date: '2026-06-13', category: { name: 'Transporte', icon: '🚗', color: '#3b82f6' } },
  { id: '3', description: 'Salário', amount: 5000.00, type: 'INCOME' as const, date: '2026-06-12', category: { name: 'Salário', icon: '💰', color: '#22c55e' } },
  { id: '4', description: 'Farmácia', amount: 87.50, type: 'EXPENSE' as const, date: '2026-06-12', category: { name: 'Saúde', icon: '💊', color: '#ef4444' } },
  { id: '5', description: 'Spotify', amount: 21.90, type: 'EXPENSE' as const, date: '2026-06-10', category: { name: 'Assinaturas', icon: '📱', color: '#14b8a6' } },
]

const mockBills = [
  { id: '1', name: 'Aluguel', amount: 1800.00, due_day: 1, status: 'overdue' as const },
  { id: '2', name: 'Internet', amount: 119.90, due_day: 5, status: 'paid' as const },
  { id: '3', name: 'Energia', amount: 85.00, due_day: 15, status: 'pending' as const },
]

export default function DashboardPage() {
  const income = mockTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  const expenses = mockTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expenses
  const totalBudget = 8500
  const spent = expenses
  const percentage = Math.round((spent / totalBudget) * 100)
  const pendingBills = mockBills.filter((b) => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0)

  return (
    <div className="space-y-6">
      <MonthlyBudgetCard
        month={monthAbbr}
        balance={balance}
        spent={spent}
        totalBudget={totalBudget}
        percentage={percentage}
      />

      <SummaryCards
        income={income}
        expenses={expenses}
        balance={balance}
        pendingBills={pendingBills}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={mockTransactions} />
        <UpcomingBills bills={mockBills} month={currentMonth} />
      </div>
    </div>
  )
}
