'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Loader2, ArrowRight } from 'lucide-react'
import { transferSchema, type TransferInput } from '@/lib/validations/account'
import { createTransferAction } from '@/app/actions/accounts'
import type { Account } from '@/types'
import { toast } from 'sonner'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: Account[]
}

function today(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export function TransferModal({ isOpen, onClose, accounts }: TransferModalProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransferInput>({
    resolver: zodResolver(transferSchema) as never,
    defaultValues: {
      from_account_id: '',
      to_account_id: '',
      amount: undefined,
      date: today(),
      description: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset({
      from_account_id: accounts[0]?.id ?? '',
      to_account_id: accounts[1]?.id ?? '',
      amount: undefined,
      date: today(),
      description: '',
      notes: '',
    })
  }, [isOpen, accounts, reset])

  if (!isOpen) return null

  function handleFormSubmit(data: TransferInput) {
    startTransition(async () => {
      const result = await createTransferAction({
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: Number(data.amount) || 0,
        date: data.date,
        description: data.description || undefined,
        notes: data.notes || undefined,
      })

      if (result?.error) {
        toast.error('Erro ao transferir. Verifique os campos.')
        return
      }

      toast.success('Transferência realizada!')
      reset()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-t-3xl lg:rounded-3xl w-full mx-4 lg:max-w-md max-h-[90vh] overflow-y-auto shadow-xl safe-area-bottom">
        <div className="sticky top-0 bg-card px-6 py-4 border-b border-border flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-foreground">Transferir entre contas</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">De</label>
              <select
                className="w-full px-3 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm bg-background"
                {...register('from_account_id')}
              >
                <option value="">Selecione</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground mb-4" />
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Para</label>
              <select
                className="w-full px-3 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm bg-background"
                {...register('to_account_id')}
              >
                <option value="">Selecione</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(errors.from_account_id || errors.to_account_id) && (
            <p className="text-error-500 text-xs">
              {errors.from_account_id?.message ?? errors.to_account_id?.message}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Valor</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
                {...register('amount')}
              />
            </div>
            {errors.amount && (
              <p className="text-error-500 text-xs mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Data</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
              {...register('date')}
            />
            {errors.date && <p className="text-error-500 text-xs mt-1">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Descrição (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Reserva de emergência"
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
              {...register('description')}
            />
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
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Transferir
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
