import { redirect } from 'next/navigation'
import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { getRecurringBills } from '@/lib/db/queries/bills'
import { getExpensesByCategory } from '@/lib/db/queries/reports'
import { formatCurrency, getMonthName } from '@/lib/format'
import { PrintButton } from '@/components/relatorios/print-button'

const now = new Date()

export default async function ImprimirRelatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const params = await searchParams
  const month = params.month ? Number(params.month) : now.getMonth() + 1
  const year = params.year ? Number(params.year) : now.getFullYear()
  const monthName = getMonthName(month)

  const current = await getCurrentUserHousehold()

  if (!current) {
    redirect('/login')
  }

  const [transactions, bills, expensesByCategory] = await Promise.all([
    getTransactionsByMonth(current.householdId, month, year),
    getRecurringBills(current.householdId, month, year),
    getExpensesByCategory(current.householdId, month, year),
  ])

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expenses

  const pendingBills = bills.filter((b) => {
    const status = b.monthlyStatus?.[0]
    return !status || status.status !== 'PAID'
  })

  const paidBills = bills.filter((b) => {
    const status = b.monthlyStatus?.[0]
    return status?.status === 'PAID'
  })

  return (
    <div className="max-w-3xl mx-auto p-8 print:p-0">
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            @page { margin: 2cm; }
          }
        `
      }} />

      <div className="no-print mb-6 flex items-center gap-3">
        <h1 className="text-lg font-bold text-foreground">Relatório mensal</h1>
        <PrintButton />
      </div>

      <div className="space-y-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold text-foreground">Financasa</h1>
          <p className="text-sm text-muted-foreground">
            Relatório financeiro · {monthName} {year}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Receita</p>
            <p className="text-lg font-bold text-green-600 tabular-nums">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gastos</p>
            <p className="text-lg font-bold text-red-600 tabular-nums">
              {formatCurrency(expenses)}
            </p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Saldo</p>
            <p className={`text-lg font-bold tabular-nums ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-3">
            Gastos por categoria
          </h2>
          {expensesByCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum gasto no período.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Categoria</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Total</th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">%</th>
                </tr>
              </thead>
              <tbody>
                {expensesByCategory.map((cat) => {
                  const pct = expenses > 0 ? (cat.total / expenses) * 100 : 0
                  return (
                    <tr key={cat.categoryId} className="border-b border-border">
                      <td className="py-2 pr-4 text-foreground">
                        {cat.icon} {cat.categoryName}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums text-foreground">
                        {formatCurrency(cat.total)}
                      </td>
                      <td className="py-2 pl-4 text-right tabular-nums text-muted-foreground">
                        {Math.round(pct)}%
                      </td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 border-border">
                  <td className="py-2 pr-4 font-bold text-foreground">Total</td>
                  <td className="py-2 px-4 text-right tabular-nums font-bold text-foreground">
                    {formatCurrency(expenses)}
                  </td>
                  <td className="py-2 pl-4 text-right text-muted-foreground">100%</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-3">
            Contas do mês
          </h2>
          {bills.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Conta</th>
                  <th className="text-center py-2 px-4 font-medium text-muted-foreground">Vencimento</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Valor</th>
                  <th className="text-center py-2 pl-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => {
                  const status = bill.monthlyStatus?.[0]
                  const statusLabel = status?.status === 'PAID'
                    ? 'Paga'
                    : status?.status === 'OVERDUE'
                      ? 'Atrasada'
                      : 'Pendente'
                  return (
                    <tr key={bill.id} className="border-b border-border">
                      <td className="py-2 pr-4 text-foreground">{bill.name}</td>
                      <td className="py-2 px-4 text-center text-muted-foreground">
                        Dia {bill.due_day}
                      </td>
                      <td className="py-2 px-4 text-right tabular-nums text-foreground">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="py-2 pl-4 text-center text-muted-foreground">
                        {statusLabel}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Contas pendentes
            </p>
            <p className="text-lg font-bold text-amber-600 tabular-nums">
              {formatCurrency(pendingBills.reduce((s, b) => s + b.amount, 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingBills.length} {pendingBills.length === 1 ? 'conta' : 'contas'}
            </p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Contas pagas
            </p>
            <p className="text-lg font-bold text-green-600 tabular-nums">
              {formatCurrency(paidBills.reduce((s, b) => s + b.amount, 0))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {paidBills.length} {paidBills.length === 1 ? 'conta' : 'contas'}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Relatório gerado em {new Date().toLocaleDateString('pt-BR')} · Financasa
          </p>
        </div>
      </div>
    </div>
  )
}
