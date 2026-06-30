'use client'

import { useState, useTransition } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recurringBillSchema, type RecurringBillInput } from '@/lib/validations/bill'
import { createRecurringBillAction } from '@/app/actions/bills'
import { toast } from 'sonner'

const BILL_ICONS = ['🏠', '🌐', '⚡', '💧', '🏥', '🏋️', '📱', '🎓', '🚗', '🛡️', '📺', '📦']

const RECURRENCE_OPTIONS = [
  { id: 'MONTHLY', label: 'Mensal' },
  { id: 'BIMONTHLY', label: 'Bimestral' },
  { id: 'QUARTERLY', label: 'Trimestral' },
  { id: 'SEMIANNUAL', label: 'Semestral' },
  { id: 'ANNUAL', label: 'Anual' },
]

interface NewBillModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewBillModal({ isOpen, onClose }: NewBillModalProps) {
  const [icon, setIcon] = useState('🏠')
  const [billType, setBillType] = useState<'fixa' | 'parcelada'>('fixa')
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RecurringBillInput>({
    resolver: zodResolver(recurringBillSchema) as never,
    defaultValues: {
      recurrence: 'MONTHLY',
      bill_type: 'fixa',
    },
  })

  const installmentTotal = watch('installment_total')

  function handleFormSubmit(data: RecurringBillInput) {
    startTransition(async () => {
      const result = await createRecurringBillAction({
        name: `${icon} ${data.name}`,
        amount: data.amount,
        due_day: data.due_day,
        recurrence: billType === 'parcelada' ? 'MONTHLY' : data.recurrence,
        bill_type: billType,
        installment_total: billType === 'parcelada' ? Number(data.installment_total) : undefined,
      })

      if (result?.error) {
        toast.error('Erro ao criar conta.')
        return
      }

      toast.success('Conta criada com sucesso!')
      reset()
      setIcon('🏠')
      setBillType('fixa')
      onClose()
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-t-3xl lg:rounded-3xl w-full lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-900">Nova conta</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setBillType('fixa')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                billType === 'fixa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Fixa
            </button>
            <button
              type="button"
              onClick={() => setBillType('parcelada')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                billType === 'parcelada' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Parcelada
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ícone</label>
            <div className="grid grid-cols-6 gap-2">
              {BILL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all ${
                    icon === ic
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Ex: Aluguel, Internet, Energia..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {billType === 'parcelada' ? 'Valor de cada parcela' : 'Valor'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                R$
              </span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          {billType === 'parcelada' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de parcelas</label>
              <div className="relative">
                <input
                  {...register('installment_total')}
                  type="number"
                  min={2}
                  max={360}
                  placeholder="Ex: 12"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">x</span>
              </div>
              {errors.installment_total && (
                <p className="text-red-500 text-xs mt-1">{errors.installment_total.message}</p>
              )}
              {installmentTotal && Number(installmentTotal) > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Total: {Number(installmentTotal)} parcelas
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                <input
                  {...register('due_day')}
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Dia do mês"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
                />
                {errors.due_day && (
                  <p className="text-red-500 text-xs mt-1">{errors.due_day.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
                <select
                  {...register('recurrence')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm bg-white"
                >
                  {RECURRENCE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {billType === 'parcelada' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
              <input
                {...register('due_day')}
                type="number"
                min={1}
                max={31}
                placeholder="Dia do mês"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm"
              />
              {errors.due_day && (
                <p className="text-red-500 text-xs mt-1">{errors.due_day.message}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
  )
}
