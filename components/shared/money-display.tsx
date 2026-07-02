import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface MoneyDisplayProps {
  amount: number
  type?: 'income' | 'expense' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MoneyDisplay({ amount, type = 'neutral', size = 'md', className }: MoneyDisplayProps) {
  const sign = type === 'income' ? '+' : type === 'expense' ? '-' : ''
  const colorClass =
    type === 'income'
      ? 'text-green-500'
      : type === 'expense'
        ? 'text-red-500'
        : 'text-foreground'
  const sizeClass =
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <span className={cn('font-bold tabular-nums', colorClass, sizeClass, className)}>
      {sign}{formatCurrency(Math.abs(amount))}
    </span>
  )
}
