'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from './modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  pending?: boolean
  tone?: 'danger' | 'default'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  pending = false,
  tone = 'danger',
}: ConfirmDialogProps) {
  const isDanger = tone === 'danger'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              isDanger ? 'bg-error-50 dark:bg-error-500/15' : 'bg-muted'
            )}
          >
            <AlertTriangle
              className={cn('w-5 h-5', isDanger ? 'text-error-500' : 'text-muted-foreground')}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <div className="text-sm text-muted-foreground mt-1">{description}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2',
              isDanger
                ? 'bg-error-500 text-white hover:bg-error-600'
                : 'bg-primary text-primary-foreground hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47]'
            )}
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
