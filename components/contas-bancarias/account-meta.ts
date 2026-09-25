import type { AccountType } from '@/types'

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Conta corrente',
  SAVINGS: 'Poupança',
  CASH: 'Dinheiro',
  WALLET: 'Carteira',
  INVESTMENT: 'Investimento',
  OTHER: 'Outro',
}

export const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = (
  Object.keys(ACCOUNT_TYPE_LABELS) as AccountType[]
).map((value) => ({ value, label: ACCOUNT_TYPE_LABELS[value] }))

export const ACCOUNT_COLORS = [
  '#0F1115',
  '#3B82F6',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
]

export const ACCOUNT_ICONS = ['🏦', '💳', '💵', '👛', '📈', '💰', '🏧', '🪙']

export function getAccountTypeLabel(type: AccountType | string): string {
  return ACCOUNT_TYPE_LABELS[type as AccountType] ?? 'Outro'
}
