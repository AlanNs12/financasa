import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { PageCard } from '@/components/shared/page-card'

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
  year: number
}

export function UpcomingBills({ bills, month, year }: UpcomingBillsProps) {
  return (
    <PageCard
      title="Próximas contas"
      action={
        <Link
          href={`/contas?month=${month}&year=${year}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      }
      noPadding
    >
      {bills.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Nenhuma conta cadastrada
        </p>
      ) : (
        <div className="space-y-0.5 px-5 pb-5 pt-0">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {bill.due_day.toString().padStart(2, '0')}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {bill.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vence dia {bill.due_day}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatCurrency(bill.amount)}
                </span>
                <StatusBadge status={bill.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageCard>
  )
}
