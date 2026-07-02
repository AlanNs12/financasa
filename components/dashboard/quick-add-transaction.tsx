'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { NewTransactionModal } from '@/components/transacoes/new-transaction-modal'

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
}

interface QuickAddTransactionProps {
  categories: Category[]
  creditCards: CreditCard[]
}

export function QuickAddTransaction({ categories, creditCards }: QuickAddTransactionProps) {
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
        className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 w-14 h-14 rounded-2xl bg-brand-500 text-white shadow-theme-lg hover:bg-brand-600 active:scale-95 transition-all duration-150 flex items-center justify-center z-40"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <NewTransactionModal
        isOpen={isOpen}
        onClose={handleClose}
        categories={categories}
        creditCards={creditCards}
      />
    </>
  )
}
