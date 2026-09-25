'use client'

import { useState, useTransition } from 'react'
import {
  Plus,
  ArrowLeftRight,
  Pencil,
  Trash2,
  Loader2,
  Landmark,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { sumAccountBalances } from '@/lib/calculations/accounts'
import { deleteAccountAction, deleteTransferAction } from '@/app/actions/accounts'
import type { Account, AccountWithBalance, Transfer, SavingsJarWithBalance } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AccountModal } from './account-modal'
import { TransferModal } from './transfer-modal'
import { SavingsJars } from './savings-jars'
import { getAccountTypeLabel } from './account-meta'

interface AccountsClientProps {
  accounts: AccountWithBalance[]
  transfers: Transfer[]
  jars: SavingsJarWithBalance[]
}

export function AccountsClient({ accounts, transfers, jars }: AccountsClientProps) {
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [expandedAccount, setExpandedAccount] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeAccounts = accounts.filter((a) => a.is_active)
  const inactiveAccounts = accounts.filter((a) => !a.is_active)
  const totalBalance = sumAccountBalances(activeAccounts)
  const totalReserved = activeAccounts.reduce((sum, a) => sum + a.reserved, 0)
  const totalAvailable = activeAccounts.reduce((sum, a) => sum + a.available, 0)

  const jarsByAccount = jars.reduce<Record<string, SavingsJarWithBalance[]>>((acc, jar) => {
    if (!acc[jar.account_id]) acc[jar.account_id] = []
    acc[jar.account_id].push(jar)
    return acc
  }, {})

  function openNewAccount() {
    setEditingAccount(null)
    setShowAccountModal(true)
  }

  function openEditAccount(account: Account) {
    setEditingAccount(account)
    setShowAccountModal(true)
  }

  function handleDeleteAccount(account: Account) {
    startTransition(async () => {
      const result = await deleteAccountAction(account.id)
      if (result?.error) {
        toast.error('Erro ao desativar conta.')
        return
      }
      toast.success('Conta desativada.')
    })
  }

  function handleDeleteTransfer(id: string) {
    startTransition(async () => {
      const result = await deleteTransferAction(id)
      if (result?.error) {
        toast.error('Erro ao excluir transferência.')
        return
      }
      toast.success('Transferência excluída.')
    })
  }

  return (
    <div className="space-y-6">
      <div className="hero-card">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/[0.04] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Saldo total em contas</p>
          <p className="text-3xl font-bold tracking-tight">{formatCurrency(totalBalance)}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs">
            <span className="text-white/70">
              Disponível:{' '}
              <span className="font-semibold text-white">{formatCurrency(totalAvailable)}</span>
            </span>
            <span className="text-white/70">
              Guardado:{' '}
              <span className="font-semibold text-white">{formatCurrency(totalReserved)}</span>
            </span>
          </div>
          <p className="text-white/50 text-xs mt-2">
            {activeAccounts.length} {activeAccounts.length === 1 ? 'conta ativa' : 'contas ativas'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={openNewAccount}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova conta
        </button>
        <button
          onClick={() => setShowTransferModal(true)}
          disabled={activeAccounts.length < 2}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-muted border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-50"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Transferir
        </button>
      </div>

      {activeAccounts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Landmark className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nenhuma conta cadastrada. Clique em &ldquo;Nova conta&rdquo; para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeAccounts.map((account) => {
            const isExpanded = expandedAccount === account.id
            const accountJars = jarsByAccount[account.id] ?? []
            return (
              <div key={account.id} className="rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-3 p-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: `${account.color ?? '#0F1115'}20` }}
                  >
                    {account.icon ?? <Landmark className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getAccountTypeLabel(account.type)}
                      {account.institution ? ` · ${account.institution}` : ''}
                    </p>
                    {(account.reserved > 0 || account.available < 0) && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Disponível{' '}
                        <span className={cn(account.available < 0 && 'text-error-500 font-medium')}>
                          {formatCurrency(account.available)}
                        </span>
                        {' · '}Guardado {formatCurrency(account.reserved)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        account.balance < 0 ? 'text-error-500' : 'text-foreground'
                      )}
                    >
                      {formatCurrency(account.balance)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      inicial {formatCurrency(account.initial_balance)}
                    </p>
                  </div>
                  <button
                    onClick={() => openEditAccount(account)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                    aria-label="Editar conta"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account)}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-error-500 hover:bg-error-50 transition-colors shrink-0 disabled:opacity-50"
                    aria-label="Desativar conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExpandedAccount(isExpanded ? null : account.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                    aria-label={isExpanded ? 'Ocultar cofrinhos' : 'Ver cofrinhos'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <SavingsJars account={account} jars={accountJars} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {inactiveAccounts.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Contas inativas
          </p>
          {inactiveAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card opacity-60"
            >
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                {account.icon ?? <Landmark className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{account.name}</p>
                <p className="text-xs text-muted-foreground">Inativa</p>
              </div>
              <p className="text-sm font-bold tabular-nums text-muted-foreground shrink-0">
                {formatCurrency(account.balance)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Transferências recentes</h2>
        {transfers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2 text-center">
            Nenhuma transferência registrada.
          </p>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <span className="truncate">{transfer.from_account?.name ?? 'Conta'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{transfer.to_account?.name ?? 'Conta'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDate(transfer.date)}
                    {transfer.description ? ` · ${transfer.description}` : ''}
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                  {formatCurrency(transfer.amount)}
                </p>
                <button
                  onClick={() => handleDeleteTransfer(transfer.id)}
                  disabled={isPending}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-error-500 hover:bg-error-50 transition-colors shrink-0 disabled:opacity-50"
                  aria-label="Excluir transferência"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAccountModal && (
        <AccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          editingAccount={editingAccount}
        />
      )}

      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          accounts={activeAccounts}
        />
      )}

      {isPending && (
        <div className="fixed bottom-20 right-4 z-[100] bg-card border border-border rounded-xl px-3 py-2 shadow-theme-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Processando...</span>
        </div>
      )}
    </div>
  )
}
