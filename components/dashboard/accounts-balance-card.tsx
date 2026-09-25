import Link from 'next/link'
import { Landmark, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { sumAccountBalances } from '@/lib/calculations/accounts'
import { cn } from '@/lib/utils'
import type { AccountWithBalance } from '@/types'

interface AccountsBalanceCardProps {
  accounts: AccountWithBalance[]
}

export function AccountsBalanceCard({ accounts }: AccountsBalanceCardProps) {
  const activeAccounts = accounts.filter((a) => a.is_active)
  if (activeAccounts.length === 0) return null

  const total = sumAccountBalances(activeAccounts)
  const totalReserved = activeAccounts.reduce((sum, a) => sum + a.reserved, 0)

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Saldo em contas</h2>
          <p className="text-2xl font-bold text-foreground mt-0.5 tabular-nums">
            {formatCurrency(total)}
          </p>
          {totalReserved > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Disponível{' '}
              <span className="font-medium text-foreground">
                {formatCurrency(total - totalReserved)}
              </span>
              {' · '}Guardado {formatCurrency(totalReserved)}
            </p>
          )}
        </div>
        <Link
          href="/contas-bancarias"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Ver contas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {activeAccounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-background shrink-0"
          >
            <span
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: `${account.color ?? '#0F1115'}20` }}
            >
              {account.icon ?? <Landmark className="w-3.5 h-3.5 text-muted-foreground" />}
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground leading-tight truncate max-w-[120px]">
                {account.name}
              </p>
              <p
                className={cn(
                  'text-xs font-bold tabular-nums',
                  account.balance < 0 ? 'text-error-500' : 'text-foreground'
                )}
              >
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
