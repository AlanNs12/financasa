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
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-40"
      >
        <Plus size={24} />
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
