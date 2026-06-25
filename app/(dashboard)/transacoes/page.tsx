'use client'

import { useState } from 'react'
import { TransactionList } from '@/components/transacoes/transaction-list'
import { NewTransactionModal } from '@/components/transacoes/new-transaction-modal'
import { Fab } from '@/components/transacoes/fab'

const mockTransactions = [
  { id: '1', description: 'Mercado Assaí', amount: 189.43, type: 'EXPENSE' as const, date: '2026-06-13', category: { name: 'Alimentação', icon: '🛒', color: '#f59e0b' }, user: { name: 'Ana' }, payment_method: 'DEBIT_CARD' },
  { id: '2', description: 'Uber', amount: 24.90, type: 'EXPENSE' as const, date: '2026-06-13', category: { name: 'Transporte', icon: '🚗', color: '#3b82f6' }, user: { name: 'Carlos' }, payment_method: 'PIX' },
  { id: '3', description: 'Salário', amount: 5000.00, type: 'INCOME' as const, date: '2026-06-12', category: { name: 'Salário', icon: '💰', color: '#22c55e' }, user: { name: 'Ana' }, payment_method: 'BANK_TRANSFER' },
  { id: '4', description: 'Farmácia', amount: 87.50, type: 'EXPENSE' as const, date: '2026-06-12', category: { name: 'Saúde', icon: '💊', color: '#ef4444' }, user: { name: 'Carlos' }, payment_method: 'CREDIT_CARD' },
  { id: '5', description: 'Spotify', amount: 21.90, type: 'EXPENSE' as const, date: '2026-06-10', category: { name: 'Assinaturas', icon: '📱', color: '#14b8a6' }, user: { name: 'Ana' }, payment_method: 'CREDIT_CARD' },
  { id: '6', description: 'Ifood', amount: 65.00, type: 'EXPENSE' as const, date: '2026-06-08', category: { name: 'Alimentação', icon: '🛒', color: '#f59e0b' }, user: { name: 'Carlos' }, payment_method: 'PIX' },
  { id: '7', description: 'Freelance Design', amount: 1200.00, type: 'INCOME' as const, date: '2026-06-05', category: { name: 'Freelance', icon: '💻', color: '#10b981' }, user: { name: 'Carlos' }, payment_method: 'BANK_TRANSFER' },
  { id: '8', description: 'Gasolina', amount: 180.00, type: 'EXPENSE' as const, date: '2026-06-03', category: { name: 'Transporte', icon: '🚗', color: '#3b82f6' }, user: { name: 'Ana' }, payment_method: 'DEBIT_CARD' },
]

export default function TransacoesPage() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Transações</h1>
        <p className="text-sm text-gray-500">Gerencie suas entradas e saídas</p>
      </div>

      <TransactionList transactions={mockTransactions} />

      <Fab onClick={() => setModalOpen(true)} />
      <NewTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
