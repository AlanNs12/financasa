'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, getMonthName } from '@/lib/format'
import { StatusBadge } from '@/components/shared/status-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { NewBillModal } from '@/components/contas/new-bill-modal'
import { BillsHistory } from '@/components/contas/bills-history'
import { Fab } from '@/components/transacoes/fab'
import { markBillAsPaidAction, deleteRecurringBillAction } from '@/app/actions/bills'
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
  created_at: string
  monthlyStatus: { status: string; paid_at: string | null }[]
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

type Tab = 'current' | 'history'

const RECURRENCE_LABELS: Record<string, string> = {
  MONTHLY: 'Mensal',
  BIMONTHLY: 'Bimestral',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
}

function getBillStatus(bill: Bill): 'paid' | 'pending' | 'overdue' {
  const status = bill.monthlyStatus?.[0]?.status
  if (status === 'PAID') return 'paid'
  if (status === 'OVERDUE') return 'overdue'
  if (status === 'SKIPPED') return 'pending'
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
    const created = new Date(bill.created_at)
    const monthsDiff =
      (viewYear - created.getFullYear()) * 12 + (viewMonth - 1 - created.getMonth())
    const installmentNumber = Math.max(1, Math.min(1 + monthsDiff, bill.installment_total))
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
    category_id: null,
  }
}

export function ContasClient({ bills, history, month, year, categories }: ContasClientProps) {
  const router = useRouter()
  const [expandedBill, setExpandedBill] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [payingBill, setPayingBill] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('current')
  const [editingBill, setEditingBill] = useState<EditingBill | null>(null)
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null)
  const [isPending, startTransition] = useTransition()

  const monthName = getMonthName(month)

  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0)
  const paidAmount = bills
    .filter((b) => getBillStatus(b) === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)
  const remaining = totalAmount - paidAmount
  const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0

  function handleMarkAsPaid(billId: string) {
    setPayingBill(billId)
    startTransition(async () => {
      const bill = bills.find((b) => b.id === billId)
      const result = await markBillAsPaidAction(billId, month, year, bill?.amount)
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
      </div>

      {activeTab === 'current' ? (
        <>
          <div className="bg-[#1a1a2e] dark:bg-gradient-to-br dark:from-[#161b22] dark:to-[#0d1117] dark:border dark:border-[#30363d] rounded-2xl p-6 text-white">
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
                const status = getBillStatus(bill)
                const icon = extractIcon(bill.name)
                const name = extractName(bill.name)
                const isPaying = payingBill === bill.id
                const isParcelada = !!bill.installment_total

                return (
                  <div
                    key={bill.id}
                    className={cn(
                      'bg-card rounded-2xl border border-border overflow-hidden transition-all',
                      status === 'paid' && 'ring-2 ring-green-400'
                    )}
                  >
                    <button
                      onClick={() => setExpandedBill(isExpanded ? null : bill.id)}
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
                          <StatusBadge status={status} />
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
                      <div className="px-4 pb-4 border-t border-border pt-3">
                        {status !== 'paid' ? (
                          <button
                            onClick={() => handleMarkAsPaid(bill.id)}
                            disabled={isPaying}
                            className="w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-medium text-sm hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isPaying && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isParcelada ? 'Pagar parcela' : 'Marcar como pago'}
                          </button>
                        ) : (
                          <p className="text-sm text-green-600 text-center font-medium">
                            ✓ {isParcelada ? 'Parcela paga' : 'Pago'}
                          </p>
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
            isOpen={modalOpen || !!editingBill}
            onClose={handleModalClose}
            categories={categories}
            editingBill={editingBill}
            currentMonth={month}
            currentYear={year}
          />

          {deletingBill && (
            <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDeletingBill(null)} />
              <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-sm shadow-xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-2">Excluir conta?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  A conta <span className="text-foreground font-medium">{extractName(deletingBill.name)}</span> será desativada. O histórico de pagamentos anteriores será mantido. Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeletingBill(null)}
                    className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="flex-1 py-3 rounded-xl bg-expense text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <BillsHistory
          history={history}
          currentMonth={month}
          currentYear={year}
        />
      )}
    </div>
  )
}
