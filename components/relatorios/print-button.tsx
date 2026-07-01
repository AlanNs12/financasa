'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
      aria-label="Imprimir / Salvar como PDF"
    >
      Imprimir / Salvar PDF
    </button>
  )
}
