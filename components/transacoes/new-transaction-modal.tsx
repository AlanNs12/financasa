'use client'

import { useState, useTransition } from 'react'
import { X, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionOutput } from '@/lib/validations/transaction'
import { createTransactionAction } from '@/app/actions/transactions'
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

export function NewTransactionModal({ isOpen, onClose, categories, creditCards }: NewTransactionModalProps) {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [showNotes, setShowNotes] = useState(false)
  const [isPending, startTransition] = useTransition()

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === 'BOTH'
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TransactionOutput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      type: 'EXPENSE',
      payment_method: 'PIX',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const categoryId = watch('category_id')
  const paymentMethod = watch('payment_method')

  function handleFormSubmit() {
    const values = getValues()
    startTransition(async () => {
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

      toast.success('Transação criada com sucesso!')
      reset()
      onClose()
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-foreground">Nova transação</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          <div className="flex bg-muted rounded-xl p-1">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t)
                  setValue('type', t)
                  setValue('category_id', '')
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                  type === t
                    ? t === 'EXPENSE'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-green-500 text-white shadow-sm'
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
            <label className="block text-sm font-medium text-muted-foreground mb-1">Valor</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                R$
              </span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-4 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-lg font-bold"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Descrição</label>
            <input
              {...register('description')}
              type="text"
              placeholder="Ex: Mercado, Uber, Salário..."
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Data</label>
              <input
                {...register('date')}
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Pagamento</label>
              <select
                {...register('payment_method')}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm bg-card"
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
              <label className="block text-sm font-medium text-muted-foreground mb-1">Qual cartão?</label>
              <select
                {...register('credit_card_id')}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm bg-card"
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

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Categoria</label>
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
              <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {showNotes ? '- Ocultar observação' : '+ Adicionar observação'}
            </button>
            {showNotes && (
              <textarea
                {...register('notes')}
                placeholder="Observação opcional..."
                rows={2}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm resize-none"
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
