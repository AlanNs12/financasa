'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalSize = 'sm' | 'md' | 'lg'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  showClose?: boolean
  closeOnOverlay?: boolean
  className?: string
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative w-full bg-card rounded-t-3xl sm:rounded-3xl border border-border',
          'shadow-theme-lg max-h-[90dvh] overflow-y-auto safe-area-bottom',
          SIZE_CLASSES[size],
          className
        )}
      >
        {title ? (
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {showClose && (
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          showClose && (
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )
        )}

        <div className="p-5">{children}</div>

        {footer && <div className="flex gap-3 p-5 pt-0">{footer}</div>}
      </div>
    </div>
  )
}
