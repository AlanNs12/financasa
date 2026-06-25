'use client'

import { Plus } from 'lucide-react'

interface FabProps {
  onClick: () => void
}

export function Fab({ onClick }: FabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-2xl bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 flex items-center justify-center z-40"
      aria-label="Nova transação"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
