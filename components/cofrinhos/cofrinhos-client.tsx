'use client'

import Link from 'next/link'
import { PiggyBank, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { sumAccountBalances } from '@/lib/calculations/accounts'
import { SavingsJars } from '@/components/contas-bancarias/savings-jars'
import { getAccountTypeLabel } from '@/components/contas-bancarias/account-meta'
import type { AccountWithBalance, SavingsJarWithBalance } from '@/types'

interface CofrinhosClientProps {
  accounts: AccountWithBalance[]
  jars: SavingsJarWithBalance[]
}

export function CofrinhosClient({ accounts, jars }: CofrinhosClientProps) {
  const activeAccounts = accounts.filter((a) => a.is_active)
  const totalBalance = sumAccountBalances(activeAccounts)
  const totalReserved = activeAccounts.reduce((sum, a) => sum + a.reserved, 0)
  const totalAvailable = activeAccounts.reduce((sum, a) => sum + a.available, 0)

  const jarsByAccount = jars.reduce<Record<string, SavingsJarWithBalance[]>>((acc, jar) => {
    if (!acc[jar.account_id]) acc[jar.account_id] = []
    acc[jar.account_id].push(jar)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="hero-card">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/[0.04] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Total guardado</p>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalReserved)}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs">
            <span className="text-white/70">
              Disponível:{' '}
              <span className="font-semibold text-white">{formatCurrency(totalAvailable)}</span>
            </span>
            <span className="text-white/70">
              Em contas:{' '}
              <span className="font-semibold text-white">{formatCurrency(totalBalance)}</span>
            </span>
          </div>
          <p className="text-white/50 text-xs mt-2">
            {jars.length} {jars.length === 1 ? 'cofrinho' : 'cofrinhos'}
          </p>
        </div>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <PiggyBank className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhuma conta cadastrada. Crie uma conta para começar a guardar.
          </p>
          <Link
            href="/contas-bancarias"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors"
          >
            <Wallet className="w-4 h-4" />
            Ir para contas bancárias
          </Link>
        </div>
      ) : (
        activeAccounts.map((account) => (
          <div key={account.id} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: `${account.color ?? '#0F1115'}20` }}
              >
                {account.icon ?? <Wallet className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{account.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {getAccountTypeLabel(account.type)}
                </p>
              </div>
              <p className="text-sm font-bold tabular-nums text-foreground shrink-0">
                {formatCurrency(account.balance)}
              </p>
            </div>

            <SavingsJars account={account} jars={jarsByAccount[account.id] ?? []} />
          </div>
        ))
      )}
    </div>
  )
}
