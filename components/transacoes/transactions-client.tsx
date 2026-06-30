'use client'

import { useState } from 'react'
import { TransactionList } from '@/components/transacoes/transaction-list'
import { NewTransactionModal } from '@/components/transacoes/new-transaction-modal'
import { Fab } from '@/components/transacoes/fab'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  category: { name: string; icon: string; color: string } | null
  user?: { name: string } | null
  payment_method: string
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: string
}

interface TransactionsClientProps {
  transactions: Transaction[]
  categories: Category[]
}

export function TransactionsClient({ transactions, categories }: TransactionsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <TransactionList transactions={transactions} />
      <Fab onClick={() => setModalOpen(true)} />
      <NewTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
      />
    </>
  )
}
