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
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Próximas contas</h2>
        <Link
          href="/contas"
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {bills.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Nenhuma conta cadastrada</p>
      ) : (
        <div className="space-y-2">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                  {bill.due_day.toString().padStart(2, '0')}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                  <p className="text-xs text-gray-400">Vence dia {bill.due_day}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 tabular-nums">
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
