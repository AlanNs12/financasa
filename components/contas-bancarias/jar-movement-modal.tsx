'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { depositToJarAction, withdrawFromJarAction } from '@/app/actions/savings'
import type { AccountWithBalance, SavingsJarWithBalance } from '@/types'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'

interface JarMovementModalProps {
  isOpen: boolean
  onClose: () => void
  jar: SavingsJarWithBalance | null
  account: AccountWithBalance
  type: 'DEPOSIT' | 'WITHDRAW'
}

function today(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
}

export function JarMovementModal({
  isOpen,
  onClose,
  jar,
  account,
  type,
}: JarMovementModalProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()

  const isDeposit = type === 'DEPOSIT'

  if (!jar) return null

  const limit = isDeposit ? account.available : jar.balance
  const parsedAmount = Number(amount)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!jar) return
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('Informe um valor válido.')
      return
    }
    if (parsedAmount > limit) {
      toast.error(
        isDeposit
          ? `Disponível insuficiente (${formatCurrency(limit)}).`
          : `Você só tem ${formatCurrency(limit)} guardado.`
      )
      return
    }

    startTransition(async () => {
      const result = isDeposit
        ? await depositToJarAction(jar.id, parsedAmount, note || undefined, date)
        : await withdrawFromJarAction(jar.id, parsedAmount, note || undefined, date)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(
        isDeposit
          ? `${formatCurrency(parsedAmount)} guardado!`
          : `${formatCurrency(parsedAmount)} resgatado!`
      )
      onClose()
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeposit ? 'Guardar no cofrinho' : 'Resgatar do cofrinho'}
    >
      <p className="text-xs text-muted-foreground -mt-1 mb-4">
        {jar.icon ? `${jar.icon} ` : ''}
        {jar.name} · {isDeposit ? 'disponível' : 'guardado'}{' '}
        <span className="font-medium text-foreground">{formatCurrency(limit)}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Valor</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              R$
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Observação (opcional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: reserva do mês"
            className="w-full px-4 py-3 rounded-xl border border-border focus:border-foreground focus:ring-1 focus:ring-foreground outline-none text-sm"
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
            {isDeposit ? 'Guardar' : 'Resgatar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
