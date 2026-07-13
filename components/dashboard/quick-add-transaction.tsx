'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { NewTransactionModal } from '@/components/transacoes/new-transaction-modal'
import { getDefaultTransactionDate } from '@/lib/format'

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

interface CreditCard {
  id: string
  name: string
  issuer: string | null
  closing_day: number | null
}

interface QuickAddTransactionProps {
  categories: Category[]
  creditCards: CreditCard[]
  month: number
  year: number
}

export function QuickAddTransaction({ categories, creditCards, month, year }: QuickAddTransactionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  function handleClose() {
    setIsOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Adicionar nova transação"
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-theme-lg hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] active:scale-95 transition-all duration-150 flex items-center justify-center z-40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <NewTransactionModal
        isOpen={isOpen}
        onClose={handleClose}
        categories={categories}
        creditCards={creditCards}
        defaultDate={getDefaultTransactionDate(month, year)}
      />
    </>
  )
}
