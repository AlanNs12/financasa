import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { StatusBadge } from '@/components/shared/status-badge'

interface UpcomingBill {
  id: string
  name: string
  amount: number
  due_day: number
  status: 'paid' | 'pending' | 'overdue'
}

interface UpcomingBillsProps {
  bills: UpcomingBill[]
  month: number
}

export function UpcomingBills({ bills, month }: UpcomingBillsProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Próximas contas</h2>
        <Link
          href="/contas"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {bills.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nenhuma conta cadastrada</p>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {bill.due_day.toString().padStart(2, '0')}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">Vence dia {bill.due_day}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {formatCurrency(bill.amount)}
                </span>
                <StatusBadge status={bill.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
