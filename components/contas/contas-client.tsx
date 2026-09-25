'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, getMonthName } from '@/lib/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { NewBillModal } from '@/components/contas/new-bill-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { BillsHistory } from '@/components/contas/bills-history'
import { RecurringIncomeSection } from '@/components/contas/recurring-income-section'
import { Fab } from '@/components/transacoes/fab'
import {
  markBillAsPaidAction,
  unmarkBillAsPaidAction,
  skipBillForMonthAction,
  deleteRecurringBillAction,
} from '@/app/actions/bills'
import { computeBillStatus } from '@/lib/db/queries/bills'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface Bill {
  id: string
  name: string
  amount: number
  due_day: number
  recurrence: string
  installment_total: number | null
  installment_current: number | null
  start_month: number
  start_year: number
  category_id?: string | null
  created_at: string
  monthlyStatus: { status: string; paid_at: string | null; paid_amount: number | null }[]
}

interface HistoryBill {
  id: string
  name: string
  amount: number
  due_day: number
  status: string
  paid_at: string | null
  is_active: boolean
}

interface MonthHistory {
  month: number
  year: number
  total: number
  paid: number
  pending: number
  percentage: number
  bills: HistoryBill[]
}

interface ContasClientProps {
  bills: Bill[]
  history: MonthHistory[]
  month: number
  year: number
  categories: { id: string; name: string; icon: string }[]
  recurringIncomes: RecurringIncomeItem[]
  monthIncomes: RecurringIncomeItem[]
  accounts: { id: string; name: string; icon: string | null; color: string | null }[]
}

interface EditingBill {
  id: string
  name: string
  amount: number
  due_day: number
  recurrence: string
  is_fixed: boolean
  installment_total?: number | null
  category_id?: string | null
}

interface RecurringIncomeItem {
  id: string
  name: string
  amount: number
  recurrence: string
  start_month: number
  start_year: number
}

type Tab = 'current' | 'history' | 'incomes'

const RECURRENCE_LABELS: Record<string, string> = {
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
}

function getBillStatus(bill: Bill, viewMonth: number, viewYear: number): 'paid' | 'pending' | 'overdue' {
  const saved = bill.monthlyStatus?.[0]?.status
  const computed = computeBillStatus(bill.due_day, viewMonth, viewYear, saved)
  if (computed === 'PAID') return 'paid'
  if (computed === 'OVERDUE') return 'overdue'
  return 'pending'
}

function extractIcon(name: string): string {
  const match = name.match(/^(\S+)/)
  if (match && /[^a-zA-Z0-9]/.test(match[1])) return match[1]
  return '📄'
}

function extractName(name: string): string {
  return name.replace(/^\S+\s+/, '')
}

function getRecurrenceLabel(bill: Bill, viewMonth: number, viewYear: number): string {
  if (bill.installment_total) {
    const monthDiff = (viewYear - bill.start_year) * 12 + (viewMonth - bill.start_month)
    const installmentNumber = Math.max(1, Math.min(monthDiff + 1, bill.installment_total))
    return `Parcela ${installmentNumber}/${bill.installment_total}`
  }
  return RECURRENCE_LABELS[bill.recurrence] || bill.recurrence
}

function mapBillToEditing(bill: Bill): EditingBill {
  return {
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    due_day: bill.due_day,
    recurrence: bill.recurrence,
    is_fixed: !bill.installment_total,
    installment_total: bill.installment_total,
    category_id: bill.category_id ?? null,
  }
}

export function ContasClient({ bills, history, month, year, categories, recurringIncomes, monthIncomes, accounts }: ContasClientProps) {
  const router = useRouter()
  const [expandedBill, setExpandedBill] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [payingBill, setPayingBill] = useState<string | null>(null)
  const [payAccountId, setPayAccountId] = useState('')
  const [payAmount, setPayAmount] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('current')
  const [editingBill, setEditingBill] = useState<EditingBill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)
  const [isPending, startTransition] = useTransition()

  const monthName = getMonthName(month)

  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0)
  const paidAmount = bills
    .filter((b) => getBillStatus(b, month, year) === 'paid')
    .reduce((sum, b) => sum + (b.monthlyStatus?.[0]?.paid_amount ?? b.amount), 0)
  const remaining = totalAmount - paidAmount
  const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0

  function handleMarkAsPaid(billId: string) {
    if (accounts.length > 0 && !payAccountId) {
      toast.error('Selecione a conta de onde o valor vai sair.')
      return
    }
    const bill = bills.find((b) => b.id === billId)
    const parsedAmount = Number(payAmount)
    const paidAmount =
      payAmount.trim() && parsedAmount > 0 ? parsedAmount : bill?.amount
    if (!paidAmount || paidAmount <= 0) {
      toast.error('Informe um valor válido.')
      return
    }
    setPayingBill(billId)
    startTransition(async () => {
      const result = await markBillAsPaidAction(
        billId,
        month,
        year,
        paidAmount,
        payAccountId || undefined
      )
      if (!result?.success) {
        toast.error('Erro ao marcar conta.')
      } else {
        toast.success('Conta marcada como paga e registrada como despesa')
        router.refresh()
      }
      setPayingBill(null)
      setExpandedBill(null)
    })
  }

  function handleUnmarkPaid(billId: string) {
    startTransition(async () => {
      const result = await unmarkBillAsPaidAction(billId, month, year)
      if (!result?.success) {
        toast.error(result?.error ?? 'Erro ao desfazer pagamento.')
      } else {
        toast.success('Pagamento desfeito')
        router.refresh()
      }
      setExpandedBill(null)
    })
  }

  function handleSkip(billId: string) {
    startTransition(async () => {
      const result = await skipBillForMonthAction(billId, month, year)
      if (!result?.success) {
        toast.error(result?.error ?? 'Erro ao pular mês.')
      } else {
        toast.success('Mês pulado')
        router.refresh()
      }
      setExpandedBill(null)
    })
  }

  function handleDelete() {
    if (!deletingBill) return
    startTransition(async () => {
      const result = await deleteRecurringBillAction(deletingBill.id)
      if (result?.error) {
        toast.error('Erro ao excluir conta.')
      } else {
        toast.success('Conta excluída')
        router.refresh()
      }
      setDeletingBill(null)
    })
  }

  function handleModalClose() {
    setModalOpen(false)
    setEditingBill(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">Contas</h1>
        <p className="text-sm text-muted-foreground">Gerencie suas contas recorrentes</p>
      </div>

      <div className="flex bg-card rounded-xl border border-border p-1">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'current'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Este mês
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Histórico
        </button>
        <button
          onClick={() => setActiveTab('incomes')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'incomes'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Receitas fixas
        </button>
      </div>

      {activeTab === 'current' ? (
        <>
          <div className="hero-card">
            <p className="text-sm text-white/70 mb-1">{monthName}</p>
            <p className="text-3xl font-bold mb-1">{formatCurrency(totalAmount)}</p>
            <p className="text-sm text-white/50 mb-4">total de contas</p>

            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <span className="text-white/70">{formatCurrency(paidAmount)} pago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                <span className="text-white/70">{formatCurrency(remaining)} restante</span>
              </div>
            </div>

            <ProgressBar value={paidAmount} max={totalAmount} size="md" />
            <p className="text-xs text-white/50 mt-2">{paidPercentage}% pago</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Este mês</h2>
            </div>

            {bills.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <p className="text-muted-foreground text-sm mb-4">Nenhuma conta cadastrada</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar conta
                </button>
              </div>
            ) : (
              bills.map((bill) => {
                const isExpanded = expandedBill === bill.id
                const status = getBillStatus(bill, month, year)
                const isSkipped = bill.monthlyStatus?.[0]?.status === 'SKIPPED'
                const icon = extractIcon(bill.name)
                const name = extractName(bill.name)
                const isPaying = payingBill === bill.id
                const isParcelada = !!bill.installment_total
                const paidValue = bill.monthlyStatus?.[0]?.paid_amount ?? bill.amount

                return (
                  <div
                    key={bill.id}
                    className={cn(
                      'bg-card rounded-2xl border border-border overflow-hidden transition-all',
                      status === 'paid' && 'ring-2 ring-green-400'
                    )}
                  >
                    <button
                      onClick={() => {
                        setExpandedBill(isExpanded ? null : bill.id)
                        if (!isExpanded) {
                          setPayAccountId(accounts[0]?.id ?? '')
                          setPayAmount(String(bill.amount))
                        }
                      }}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      <span className="text-xl">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getRecurrenceLabel(bill, month, year)} · Vence dia {bill.due_day.toString().padStart(2, '0')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground tabular-nums">
                            {formatCurrency(bill.amount)}
                          </p>
                          {isSkipped ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                              Pulado
                            </span>
                          ) : (
                            <StatusBadge status={status} />
                          )}
                        </div>
                        {status !== 'paid' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingBill(mapBillToEditing(bill)) }}
                              aria-label="Editar conta"
                              className="p-1.5 min-w-[36px] min-h-[36px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingBill(bill) }}
                              aria-label="Excluir conta"
                              className="p-1.5 min-w-[36px] min-h-[36px] rounded-lg text-muted-foreground hover:text-expense hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                        {status === 'paid' ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-600 dark:text-green-400 font-medium">
                                ✓ {isParcelada ? 'Parcela paga' : 'Pago'}
                              </span>
                              <span className="text-foreground font-semibold tabular-nums">
                                {formatCurrency(paidValue)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleUnmarkPaid(bill.id)}
                              disabled={isPaying}
                              className="w-full py-2.5 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-accent transition-colors disabled:opacity-50"
                            >
                              Desfazer pagamento
                            </button>
                          </>
                        ) : isSkipped ? (
                          <>
                            <p className="text-sm text-muted-foreground text-center">
                              Este mês foi pulado.
                            </p>
                            <button
                              onClick={() => handleUnmarkPaid(bill.id)}
                              disabled={isPaying}
                              className="w-full py-2.5 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-accent transition-colors disabled:opacity-50"
                            >
                              Desfazer pulo
                            </button>
                          </>
                        ) : (
                          <>
                            {accounts.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center">
                                Nenhuma conta cadastrada.{' '}
                                <a href="/contas-bancarias" className="text-primary underline">
                                  Cadastrar conta
                                </a>
                              </p>
                            ) : (
                              <select
                                value={payAccountId}
                                onChange={(e) => setPayAccountId(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors"
                              >
                                <option value="">De qual conta?</option>
                                {accounts.map((account) => (
                                  <option key={account.id} value={account.id}>
                                    {account.icon ? `${account.icon} ` : ''}
                                    {account.name}
                                  </option>
                                ))}
                              </select>
                            )}
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground shrink-0">
                                Valor pago
                              </label>
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                  R$
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={payAmount}
                                  onChange={(e) => setPayAmount(e.target.value)}
                                  placeholder={String(bill.amount)}
                                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors"
                                />
                              </div>
                            </div>
                            {payAmount.trim() &&
                              Number(payAmount) > 0 &&
                              Number(payAmount) !== bill.amount && (
                                <p className="text-[11px] text-warning-600 dark:text-warning-400">
                                  Diferente do previsto ({formatCurrency(bill.amount)})
                                </p>
                              )}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSkip(bill.id)}
                                disabled={isPaying}
                                className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-accent transition-colors disabled:opacity-50"
                              >
                                Pular mês
                              </button>
                              <button
                                onClick={() => handleMarkAsPaid(bill.id)}
                                disabled={isPaying}
                                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {isPaying && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isParcelada ? 'Pagar parcela' : 'Marcar como pago'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {bills.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm hover:border-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova conta
            </button>
          )}

          <Fab onClick={() => setModalOpen(true)} />
          <NewBillModal
            key={editingBill?.id ?? (modalOpen ? 'new' : 'idle')}
            isOpen={modalOpen || !!editingBill}
            onClose={handleModalClose}
            categories={categories}
            editingBill={editingBill}
            currentMonth={month}
            currentYear={year}
          />

          <ConfirmDialog
            isOpen={!!deletingBill}
            onClose={() => { if (!isPending) setDeletingBill(null) }}
            onConfirm={handleDelete}
            title="Excluir conta?"
            description={
              <>
                A conta{' '}
                <span className="text-foreground font-medium">
                  {deletingBill ? extractName(deletingBill.name) : ''}
                </span>{' '}
                será desativada. O histórico de pagamentos anteriores será mantido. Esta ação não pode ser desfeita.
              </>
            }
            confirmLabel="Excluir"
            pending={isPending}
          />
        </>
      ) : activeTab === 'history' ? (
        <BillsHistory history={history} />
      ) : (
        <RecurringIncomeSection
          recurringIncomes={recurringIncomes}
          monthIncomes={monthIncomes}
          currentMonth={month}
          currentYear={year}
        />
      )}
    </div>
  )
}
