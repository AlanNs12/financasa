'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, PiggyBank, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { deleteJarAction } from '@/app/actions/savings'
import type { AccountWithBalance, SavingsJarWithBalance } from '@/types'
import { toast } from 'sonner'
import { ProgressBar } from '@/components/shared/progress-bar'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { JarModal } from './jar-modal'
import { JarMovementModal } from './jar-movement-modal'

interface SavingsJarsProps {
  account: AccountWithBalance
  jars: SavingsJarWithBalance[]
}

export function SavingsJars({ account, jars }: SavingsJarsProps) {
  const router = useRouter()
  const [showJarModal, setShowJarModal] = useState(false)
  const [editingJar, setEditingJar] = useState<SavingsJarWithBalance | null>(null)
  const [movementJar, setMovementJar] = useState<SavingsJarWithBalance | null>(null)
  const [movementType, setMovementType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT')
  const [deletingJar, setDeletingJar] = useState<SavingsJarWithBalance | null>(null)
  const [isPending, startTransition] = useTransition()

  function openNewJar() {
    setEditingJar(null)
    setShowJarModal(true)
  }

  function openEditJar(jar: SavingsJarWithBalance) {
    setEditingJar(jar)
    setShowJarModal(true)
  }

  function openMovement(jar: SavingsJarWithBalance, type: 'DEPOSIT' | 'WITHDRAW') {
    setMovementType(type)
    setMovementJar(jar)
  }

  function handleDelete() {
    if (!deletingJar) return
    startTransition(async () => {
      const result = await deleteJarAction(deletingJar.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Cofrinho excluído.')
      setDeletingJar(null)
      router.refresh()
    })
  }

  return (
    <div className="mt-2 pt-3 border-t border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PiggyBank className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Cofrinhos
          </span>
        </div>
        <button
          onClick={openNewJar}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">
          Disponível: <span className="font-semibold text-foreground">{formatCurrency(account.available)}</span>
        </span>
        <span className="text-muted-foreground">
          Guardado: <span className="font-semibold text-foreground">{formatCurrency(account.reserved)}</span>
        </span>
      </div>

      {jars.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          Nenhum cofrinho nesta conta.
        </p>
      ) : (
        <div className="space-y-2">
          {jars.map((jar) => (
            <div key={jar.id} className="p-3 rounded-xl border border-border bg-background">
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
                  style={{ backgroundColor: `${jar.color ?? '#0F1115'}20` }}
                >
                  {jar.icon ?? <PiggyBank className="w-4 h-4 text-muted-foreground" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{jar.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatCurrency(jar.balance)}
                    {jar.target_amount != null && ` de ${formatCurrency(jar.target_amount)}`}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => openMovement(jar, 'DEPOSIT')}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Guardar"
                    title="Guardar"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openMovement(jar, 'WITHDRAW')}
                    disabled={jar.balance <= 0}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-40"
                    aria-label="Resgatar"
                    title="Resgatar"
                  >
                    <ArrowUpFromLine className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditJar(jar)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Editar cofrinho"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingJar(jar)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-error-500 hover:bg-error-50 transition-colors"
                    aria-label="Excluir cofrinho"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {jar.target_amount != null && jar.target_amount > 0 && (
                <div className="mt-2">
                  <ProgressBar
                    value={Math.min(jar.balance, jar.target_amount)}
                    max={jar.target_amount}
                    size="sm"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {Math.min(100, Math.round(jar.progress ?? 0))}% da meta
                  </p>
                </div>
              )}

              {jar.balance < 0 && (
                <p className="text-[10px] text-error-500 mt-1">
                  Saldo negativo — ajuste os lançamentos.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <JarModal
        isOpen={showJarModal}
        onClose={() => setShowJarModal(false)}
        account={account}
        editingJar={editingJar}
      />

      <JarMovementModal
        key={`${movementJar?.id ?? 'none'}-${movementType}`}
        isOpen={!!movementJar}
        onClose={() => setMovementJar(null)}
        jar={movementJar}
        account={account}
        type={movementType}
      />

      <ConfirmDialog
        isOpen={!!deletingJar}
        onClose={() => { if (!isPending) setDeletingJar(null) }}
        onConfirm={handleDelete}
        title="Excluir cofrinho?"
        description={
          <>
            O cofrinho{' '}
            <span className="text-foreground font-medium">{deletingJar?.name}</span> será excluído.
            Só é possível excluir cofrinhos sem saldo.
          </>
        }
        confirmLabel="Excluir"
        pending={isPending}
      />
    </div>
  )
}
