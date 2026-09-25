'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-error-50 dark:bg-error-500/15 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-error-500" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Algo deu errado</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">
        Não foi possível carregar esta página. Tente novamente.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}
