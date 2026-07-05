'use client'

import { useState } from 'react'
import { TransactionList } from '@/components/transacoes/transaction-list'
import { NewTransactionModal } from '@/components/transacoes/new-transaction-modal'
import { TransactionDetailModal } from '@/components/transacoes/transaction-detail-modal'
import { Fab } from '@/components/transacoes/fab'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  created_at: string
  notes: string | null
  category: { name: string; icon: string; color: string } | null
  user?: { name: string; avatar_url: string | null } | null
  payment_method: string
}

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

interface TransactionsClientProps {
  transactions: Transaction[]
  categories: Category[]
  creditCards: CreditCard[]
  month: number
  year: number
}

export function TransactionsClient({ transactions, categories, creditCards, month, year }: TransactionsClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  return (
    <>
      <TransactionList
        transactions={transactions}
        month={month}
        year={year}
        onSelectTransaction={setSelectedTransaction}
      />
      <Fab onClick={() => setModalOpen(true)} />
      <NewTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        creditCards={creditCards}
      />
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  )
}
