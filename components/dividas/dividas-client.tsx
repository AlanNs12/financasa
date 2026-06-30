'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  X,
  Loader2,
  Check,
  Trash2,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { ProgressBar } from '@/components/shared/progress-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { EmptyState } from '@/components/shared/empty-state'
import {
  createDebtAction,
  payInstallmentAction,
  deleteDebtAction,
} from '@/app/actions/debts'
import { debtSchema, type DebtInput } from '@/lib/validations/debt'
import type { Debt, DebtType } from '@/types'
import type { DebtsSummary } from '@/lib/db/queries/debts'
import { toast } from 'sonner'

const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  EMPRESTIMO_PESSOAL: 'Empréstimo pessoal',
  FINANCIAMENTO_VEICULO: 'Financiamento de veículo',
  FINANCIAMENTO_IMOVEL: 'Financiamento imobiliário',
  CARTAO_PARCELADO: 'Cartão parcelado',
  CONSIGINADO: 'Consignado',
  OUTROS: 'Outros',
}

const DEBT_TYPE_OPTIONS = Object.entries(DEBT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

interface DividasClientProps {
  debts: Debt[]
  summary: DebtsSummary
}

export function DividasClient({ debts, summary }: DividasClientProps) {
  const [showModal, setShowModal] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Debt | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DebtInput>({
    resolver: zodResolver(debtSchema) as never,
    defaultValues: {
      institution: '',
      product: '',
      classification: 'EMPRESTIMO_PESSOAL',
      started_at: new Date().toISOString().split('T')[0],
      installment_total: 1,
    },
  })

  function handleFormSubmit(data: DebtInput) {
    startTransition(async () => {
      const result = await createDebtAction({
        institution: data.institution,
        product: data.product,
        classification: data.classification,
        down_payment: data.down_payment,
        principal_amount: data.principal_amount,
        started_at: data.started_at,
        interest_rate: data.interest_rate,
        cet_rate: data.cet_rate,
        installment_amount: data.installment_amount,
        installment_total: data.installment_total,
      })

      if (result?.error) {
        toast.error('Erro ao criar dívida. Verifique os dados.')
        return
      }

      toast.success('Dívida cadastrada com sucesso!')
      reset()
      setShowModal(false)
    })
  }

  function handlePayInstallment(debt: Debt) {
    setPayingId(debt.id)
    startTransition(async () => {
      const result = await payInstallmentAction(debt.id)
      setPayingId(null)
      if (result?.error) {
        toast.error('Erro ao registrar parcela paga.')
        return
      }
      if (result?.settled) {
        toast.success('Dívida quitada! 🎉')
      } else {
        toast.success('Parcela registrada como paga!')
      }
    })
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const debt = pendingDelete
    startTransition(async () => {
      const result = await deleteDebtAction(debt.id)
      if (result?.error) {
        toast.error('Erro ao excluir dívida.')
        return
      }
      toast.success('Dívida excluída')
      setPendingDelete(null)
    })
  }

  const hasDebts = debts.length > 0
  const activeDebts = debts.filter((d) => !d.is_settled)
  const settledDebts = debts.filter((d) => d.is_settled)
  const summaryProgressPct =
    summary.totalPrincipal > 0
      ? (summary.totalPaid / summary.totalPrincipal) * 100
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Dívidas</h1>
        <p className="text-sm text-gray-500">Acompanhe e quite suas dívidas</p>
      </div>

      {hasDebts ? (
        <>
          <div className="bg-[#1a1a2e] rounded-2xl p-6 text-white">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Dívida total
                </p>
                <p className="text-xl font-bold tabular-nums">
                  {formatCurrency(summary.totalPrincipal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Total pago
                </p>
                <p className="text-xl font-bold tabular-nums text-green-400">
                  {formatCurrency(summary.totalPaid)}
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Saldo devedor
                </span>
                <span className="text-lg font-bold tabular-nums text-red-400">
                  {formatCurrency(summary.totalRemaining)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-400 rounded-full h-2 transition-all duration-500"
                  style={{ width: `${Math.min(summaryProgressPct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {Math.round(summaryProgressPct)}% quitado
              </p>
            </div>
          </div>

          {activeDebts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Dívidas ativas
              </h2>
              {activeDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  payingId={payingId}
                  onPay={handlePayInstallment}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          )}

          {settledDebts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">
                Quitadas
              </h2>
              {settledDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  payingId={payingId}
                  onPay={handlePayInstallment}
                  onDelete={setPendingDelete}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova dívida
          </button>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <EmptyState
            icon={TrendingDown}
            title="Nenhuma dívida cadastrada"
            description="Cadastre suas dívidas para acompanhar o pagamento das parcelas e o saldo devedor."
            action={
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova dívida
              </button>
            }
          />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-lg font-bold text-gray-900">Nova dívida</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                <input
                  type="text"
                  placeholder="Ex: Banco do Brasil"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  {...register('institution')}
                />
                {errors.institution && (
                  <p className="text-red-500 text-xs mt-1">{errors.institution.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Empréstimo pessoal, Financiamento carro..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  {...register('product')}
                />
                {errors.product && (
                  <p className="text-red-500 text-xs mt-1">{errors.product.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classificação</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm bg-white"
                  {...register('classification')}
                >
                  {DEBT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.classification && (
                  <p className="text-red-500 text-xs mt-1">{errors.classification.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entrada (opc.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('down_payment')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor inicial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('principal_amount')}
                  />
                  {errors.principal_amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.principal_amount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de início
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                  {...register('started_at')}
                />
                {errors.started_at && (
                  <p className="text-red-500 text-xs mt-1">{errors.started_at.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Juros % a.a.
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 12,5"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('interest_rate')}
                  />
                  {errors.interest_rate && (
                    <p className="text-red-500 text-xs mt-1">{errors.interest_rate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CET % (opc.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 18,3"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('cet_rate')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da parcela
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('installment_amount')}
                  />
                  {errors.installment_amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.installment_amount.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qtd. parcelas
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Ex: 12"
                    className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                    {...register('installment_total')}
                  />
                  {errors.installment_total && (
                    <p className="text-red-500 text-xs mt-1">{errors.installment_total.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !isPending && setPendingDelete(null)}
          />
          <div className="relative bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-sm p-6 shadow-xl">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Excluir esta dívida?
              </h2>
              <p className="text-sm text-gray-500">
                {pendingDelete.institution} · {pendingDelete.product}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface DebtCardProps {
  debt: Debt
  payingId: string | null
  onPay: (debt: Debt) => void
  onDelete: (debt: Debt) => void
}

function DebtCard({ debt, payingId, onPay, onDelete }: DebtCardProps) {
  const isPaying = payingId === debt.id

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {debt.institution}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {debt.product} · {DEBT_TYPE_LABELS[debt.classification]}
          </p>
        </div>
        {debt.is_settled ? (
          <StatusBadge status="completed" />
        ) : (
          <StatusBadge status="in_progress" />
        )}
        <button
          onClick={() => onDelete(debt)}
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
          aria-label="Excluir dívida"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
            Parcela
          </p>
          <p className="text-xs font-medium text-gray-700 tabular-nums">
            {formatCurrency(debt.installment_amount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
            Pago
          </p>
          <p className="text-xs font-medium text-green-600 tabular-nums">
            {formatCurrency(debt.paid_amount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
            Saldo
          </p>
          <p className="text-xs font-medium text-red-500 tabular-nums">
            {formatCurrency(debt.remaining_amount)}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">
            {debt.installment_paid}/{debt.installment_total} parcelas
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(debt.progress_pct)}%
          </span>
        </div>
        <ProgressBar
          value={debt.installment_paid}
          max={debt.installment_total}
          size="sm"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-400 mb-3">
        <span>Início: {formatDate(debt.started_at)}</span>
        <span>·</span>
        <span>Juros: {Number(debt.interest_rate).toFixed(2).replace('.', ',')}% a.a.</span>
        {debt.cet_rate != null && (
          <>
            <span>·</span>
            <span>
              CET: {Number(debt.cet_rate).toFixed(2).replace('.', ',')}%
            </span>
          </>
        )}
      </div>

      {!debt.is_settled && (
        <button
          onClick={() => onPay(debt)}
          disabled={isPaying}
          className="w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-medium text-sm hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPaying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Marcar parcela paga
        </button>
      )}
    </div>
  )
}
