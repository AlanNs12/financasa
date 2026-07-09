'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionOutput } from '@/lib/validations/transaction'
import { createTransactionAction, updateTransactionAction } from '@/app/actions/transactions'
import { previewBillingPeriod, getBillingLabel } from '@/lib/calculations/billing'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

interface CreditCard {
  id: string
  name: string
  issuer: string | null
  closing_day: number | null
}

const PAYMENT_METHODS = [
  { id: 'PIX', label: 'Pix' },
  { id: 'CREDIT_CARD', label: 'Crédito' },
  { id: 'DEBIT_CARD', label: 'Débito' },
  { id: 'CASH', label: 'Dinheiro' },
  { id: 'BANK_TRANSFER', label: 'Transf.' },
  { id: 'BOLETO', label: 'Boleto' },
]

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  creditCards: CreditCard[]
}

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  creditCards: CreditCard[]
  editingTransaction?: {
    id: string
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    date: string
    category_id: string
    payment_method: string
    notes: string | null
    credit_card_id?: string | null
  }
}

export function NewTransactionModal({ isOpen, onClose, categories, creditCards, editingTransaction }: NewTransactionModalProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(editingTransaction?.type ?? 'EXPENSE')
  const [isPending, startTransition] = useTransition()

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'BOTH'
  )

  const defaultValues = editingTransaction
    ? {
        type: editingTransaction.type as 'INCOME' | 'EXPENSE',
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        date: editingTransaction.date.split('T')[0],
        category_id: editingTransaction.category_id,
        payment_method: editingTransaction.payment_method,
        notes: editingTransaction.notes ?? '',
        credit_card_id: editingTransaction.credit_card_id ?? '',
      }
    : {
        type: 'EXPENSE' as const,
        payment_method: 'PIX' as const,
        date: new Date().toISOString().split('T')[0],
      }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TransactionOutput>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: editingTransaction ? (defaultValues as any) : defaultValues,
  })

  const categoryId = watch('category_id')
  const paymentMethod = watch('payment_method')
  const creditCardId = watch('credit_card_id')
  const dateValue = watch('date')

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type)
      reset({
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        date: editingTransaction.date.split('T')[0],
        category_id: editingTransaction.category_id,
        payment_method: editingTransaction.payment_method,
        notes: editingTransaction.notes ?? '',
        credit_card_id: editingTransaction.credit_card_id ?? '',
      } as any)
    } else if (isOpen) {
      setType('EXPENSE')
      reset({
        type: 'EXPENSE' as const,
        payment_method: 'PIX' as const,
        date: new Date().toISOString().split('T')[0],
      } as any)
    }
  }, [editingTransaction, isOpen, reset])

  const billingPreview = paymentMethod === 'CREDIT_CARD' && creditCardId
    ? (() => {
        const card = creditCards.find(c => c.id === creditCardId)
        return previewBillingPeriod(dateValue, card?.closing_day ?? null)
      })()
    : null

  const purchaseMonth = dateValue
    ? new Date(dateValue + 'T12:00:00').getMonth() + 1
    : null
  const isBillingNextMonth = billingPreview
    ? billingPreview.billingMonth !== purchaseMonth
    : false

  function handleFormSubmit() {
    const values = getValues()
    startTransition(async () => {
      if (editingTransaction) {
        const result = await updateTransactionAction(editingTransaction.id, {
          type,
          description: values.description,
          amount: Number(values.amount) || 0,
          date: values.date,
          category_id: values.category_id,
          payment_method: values.payment_method,
          notes: values.notes || undefined,
          credit_card_id: values.credit_card_id || undefined,
        })

        if (result?.error) {
          toast.error('Erro ao salvar. Verifique os campos.')
          return
        }

        toast.success('Transação atualizada!')
      } else {
        const result = await createTransactionAction({
          type,
          description: values.description,
          amount: Number(values.amount) || 0,
          date: values.date,
          category_id: values.category_id,
          payment_method: values.payment_method,
          notes: values.notes || undefined,
          credit_card_id: values.credit_card_id || undefined,
        })

        if (result?.error) {
          toast.error('Erro ao salvar. Verifique os campos.')
          return
        }

        if (result?.billingMoved && result.billingMonth && result.billingYear) {
          toast.success(
            `Transação criada! Lançada na fatura de ${getBillingLabel({
              billingMonth: result.billingMonth,
              billingYear: result.billingYear,
            })}`
          )
        } else {
          toast.success('Transação criada!')
        }
      }

      reset()
      onClose()
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-theme-lg border border-border max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-semibold text-foreground">
            {editingTransaction ? 'Editar transação' : 'Nova transação'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 space-y-5">
          <div className="flex bg-muted rounded-xl p-1">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setValue('type', t)
                  if (!editingTransaction) {
                    setValue('category_id', '')
                  }
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                  type === t
                    ? t === 'EXPENSE'
                      ? 'bg-error-500 text-white shadow-theme-xs'
                      : 'bg-success-500 text-white shadow-theme-xs'
                    : 'text-muted-foreground'
                )}
              >
                {t === 'EXPENSE' ? (
                  <ArrowDownCircle className="w-4 h-4" />
                ) : (
                  <ArrowUpCircle className="w-4 h-4" />
                )}
                {t === 'EXPENSE' ? 'Saída' : 'Entrada'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                R$
              </span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-colors"
              />
            </div>
            {errors.amount && (
              <p className="text-error-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Descrição
            </label>
            <input
              {...register('description')}
              type="text"
              placeholder="Ex: Mercado, Uber, Salário..."
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none transition-colors"
            />
            {errors.description && (
              <p className="text-error-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Observação <span className="normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              {...register('notes')}
              placeholder="Adicione uma observação sobre esta transação..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none placeholder:text-muted-foreground focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Data
              </label>
              <input
                {...register('date')}
                type="date"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none transition-colors"
              />
              {errors.date && (
                <p className="text-error-500 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Pagamento
              </label>
              <select
                {...register('payment_method')}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none transition-colors"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {paymentMethod === 'CREDIT_CARD' && creditCards.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Qual cartão?
              </label>
              <select
                {...register('credit_card_id')}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none transition-colors"
              >
                <option value="">Selecione o cartão</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}{card.issuer ? ` · ${card.issuer}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {billingPreview && (() => {
            const card = creditCards.find(c => c.id === creditCardId)
            return (
              <div className={`flex items-start gap-2.5 p-3 rounded-xl text-xs
                               border transition-colors ${
                isBillingNextMonth
                  ? 'bg-[#fef9c3] dark:bg-[#f59e0b]/10 border-[#fde68a] dark:border-[#f59e0b]/25'
                  : 'bg-[#f0fdf4] dark:bg-[#22c55e]/10 border-[#bbf7d0] dark:border-[#22c55e]/25'
              }`}>
                <span className="text-base shrink-0 mt-0.5">
                  {isBillingNextMonth ? '⚠️' : '✓'}
                </span>
                <div>
                  <p className={`font-semibold ${
                    isBillingNextMonth
                      ? 'text-[#d97706] dark:text-[#fbbf24]'
                      : 'text-[#15803d] dark:text-[#4ade80]'
                  }`}>
                    {isBillingNextMonth
                      ? `Lançado na fatura de ${getBillingLabel(billingPreview)}`
                      : `Fatura de ${getBillingLabel(billingPreview)}`
                    }
                  </p>
                  {isBillingNextMonth && card?.closing_day && (
                    <p className="text-[#92400e] dark:text-[#fcd34d] mt-0.5 leading-relaxed">
                      A data da compra é após o fechamento (dia {card.closing_day}).
                      Esta despesa aparecerá nos gastos de {getBillingLabel(billingPreview)}.
                    </p>
                  )}
                </div>
              </div>
            )
          })()}

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Categoria
            </label>
            {filteredCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma categoria disponível</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue('category_id', cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
                      categoryId === cat.id
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-border'
                    )}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {errors.category_id && (
              <p className="text-error-500 text-xs mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] disabled:opacity-50 transition-colors shadow-theme-xs flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingTransaction ? 'Salvar alterações' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
