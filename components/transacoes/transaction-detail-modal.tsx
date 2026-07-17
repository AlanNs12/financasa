'use client'

import { X, Calendar, Clock, Tag, CreditCard,
         User, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface TransactionDetail {
  id: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  date: string
  created_at: string
  payment_method: string
  notes: string | null
  category: {
    name: string
    icon: string
    color: string
  } | null
  user: {
    name: string
    avatar_url: string | null
  } | null
}

interface TransactionDetailModalProps {
  transaction: TransactionDetail | null
  onClose: () => void
}

const PAYMENT_LABELS: Record<string, string> = {
  PIX:           'Pix',
  CREDIT_CARD:   'Cartão de crédito',
  DEBIT_CARD:    'Cartão de débito',
  CASH:          'Dinheiro',
  BANK_TRANSFER: 'Transferência bancária',
  BOLETO:        'Boleto',
  OTHER:         'Outro',
}

export function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction) return null

  const isIncome = transaction.type === 'INCOME'
  const date = new Date(transaction.date.includes('T') ? transaction.date.split('T')[0] + 'T12:00:00' : transaction.date)
  const createdAt = new Date(transaction.created_at.includes('T') ? transaction.created_at.split('T')[0] + 'T12:00:00' : transaction.created_at)

  const formattedDate = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const formattedTime = format(createdAt, "HH:mm")

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center
                    justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
         onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl
                   shadow-theme-lg border border-border
                   max-h-[90dvh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5
                        border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-base font-semibold text-foreground">
            Detalhes da transação
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className={cn(
          'mx-5 mt-5 p-5 rounded-2xl flex items-center gap-4',
          isIncome
            ? 'bg-[#dcfce7] dark:bg-[#22c55e]/15'
            : 'bg-[#fee2e2] dark:bg-[#ef4444]/15'
        )}>
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
            isIncome
              ? 'bg-[#22c55e]/20 dark:bg-[#22c55e]/25'
              : 'bg-[#ef4444]/20 dark:bg-[#ef4444]/25'
          )}>
            {isIncome
              ? <TrendingUp size={22} className="text-[#16a34a] dark:text-[#4ade80]" />
              : <TrendingDown size={22} className="text-[#dc2626] dark:text-[#f87171]" />
            }
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-0.5">
              {isIncome ? 'Entrada' : 'Saída'}
            </p>
            <p className={cn(
              'text-2xl font-bold tabular-nums',
              isIncome
                ? 'text-[#16a34a] dark:text-[#4ade80]'
                : 'text-[#dc2626] dark:text-[#f87171]'
            )}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-0">

          <DetailRow icon={FileText} label="Descrição">
            <span className="text-sm font-medium text-foreground">
              {transaction.description}
            </span>
          </DetailRow>

          {transaction.category && (
            <DetailRow icon={Tag} label="Categoria">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-md flex items-center justify-center
                             text-sm shrink-0"
                  style={{ backgroundColor: `${transaction.category.color}25` }}
                >
                  {transaction.category.icon}
                </span>
                <span className="text-sm text-foreground">
                  {transaction.category.name}
                </span>
              </div>
            </DetailRow>
          )}

          <DetailRow icon={Calendar} label="Data">
            <span className="text-sm text-foreground capitalize">
              {formattedDate}
            </span>
          </DetailRow>

          <DetailRow icon={Clock} label="Registrado às">
            <span className="text-sm text-foreground">
              {formattedTime}
            </span>
          </DetailRow>

          <DetailRow icon={CreditCard} label="Pagamento">
            <span className="text-sm text-foreground">
              {PAYMENT_LABELS[transaction.payment_method] ??
               transaction.payment_method}
            </span>
          </DetailRow>

          {transaction.user && (
            <DetailRow icon={User} label="Registrado por">
              <span className="text-sm text-foreground">
                {transaction.user.name}
              </span>
            </DetailRow>
          )}

          {transaction.notes && (
            <div className="pt-3 mt-1 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground
                             uppercase tracking-wide mb-2">
                Observação
              </p>
              <p className="text-sm text-foreground leading-relaxed
                             bg-muted/50 rounded-xl p-3">
                {transaction.notes}
              </p>
            </div>
          )}

          {!transaction.notes && (
            <div className="pt-3 mt-1 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground
                             uppercase tracking-wide mb-2">
                Observação
              </p>
              <p className="text-sm text-muted-foreground italic">
                Nenhuma observação registrada
              </p>
            </div>
          )}
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-lg border border-border
                       text-sm font-medium text-foreground
                       hover:bg-muted transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size: number; className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/60
                    last:border-0">
      <Icon size={15} className="text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {children}
      </div>
    </div>
  )
}
