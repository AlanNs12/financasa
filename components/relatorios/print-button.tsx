'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      aria-label="Imprimir / Salvar como PDF"
    >
      Imprimir / Salvar PDF
    </button>
  )
}
