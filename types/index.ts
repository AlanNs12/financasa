export type TransactionType = 'INCOME' | 'EXPENSE'
export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'BOLETO'
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH'
export type Recurrence = 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL'
export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'SKIPPED'
export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
export type InvestmentType =
  | 'RESERVA_EMERGENCIA'
  | 'RENDA_FIXA'
  | 'RENDA_VARIAVEL'
  | 'PREVIDENCIA'
  | 'FUNDOS'
  | 'CRIPTO'
  | 'OUTROS'
export type DebtType =
  | 'EMPRESTIMO_PESSOAL'
  | 'FINANCIAMENTO_VEICULO'
  | 'FINANCIAMENTO_IMOVEL'
  | 'CARTAO_PARCELADO'
  | 'CONSIGINADO'
  | 'OUTROS'

export interface User {
  id: string
  supabase_id: string
  name: string
  email: string
  avatar_url?: string | null
  household_id: string
  created_at: string
}

export interface Category {
  id: string
  household_id: string | null
  name: string
  icon: string
  color: string
  type: CategoryType
  is_default: boolean
}

export interface Transaction {
  id: string
  household_id: string
  user_id: string
  category_id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  payment_method: PaymentMethod
  notes?: string | null
  recurring_bill_id?: string | null
  credit_card_id?: string | null
  created_at: string
  updated_at: string
  category?: Category
  user?: User
}

export interface RecurringBill {
  id: string
  household_id: string
  user_id: string
  name: string
  amount: number
  due_day: number
  recurrence: Recurrence
  is_active: boolean
  created_at: string
  monthlyStatus?: BillMonthlyStatus[]
  user?: User
}

export interface BillMonthlyStatus {
  id: string
  recurring_bill_id: string
  month: number
  year: number
  status: BillStatus
  paid_at?: string | null
  paid_amount?: number | null
}

export interface Budget {
  id: string
  household_id: string
  month: number
  year: number
  total_income: number
  created_at: string
  items?: BudgetItem[]
}

export interface BudgetItem {
  id: string
  budget_id: string
  category_id: string
  planned: number
  category?: Category
  spent?: number
  percentage?: number
}

export interface FinancialGoal {
  id: string
  household_id: string
  user_id: string
  name: string
  description?: string | null
  target_amount: number
  current_amount: number
  deadline?: string | null
  status: GoalStatus
  icon?: string | null
  color?: string | null
  created_at: string
  updated_at: string
}

export interface DashboardSummary {
  income: number
  expenses: number
  balance: number
  pendingBills: number
  budgetProgress: number
  totalBudget: number
}

export interface CategorySpending {
  category_id: string
  name: string
  icon: string
  color: string
  total: number
  percentage: number
}

export interface MonthlyEvolution {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface Investment {
  id: string
  household_id: string
  user_id: string
  name: string
  asset_type: InvestmentType
  goal_id?: string | null
  goal?: { id: string; name: string; icon?: string | null } | null
  rate_description?: string | null
  applied_at: string
  maturity_at?: string | null
  gross_invested: number
  gross_current: number
  net_current: number
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  household_id: string
  institution: string
  product: string
  classification: DebtType
  down_payment?: number | null
  principal_amount: number
  started_at: string
  interest_rate: number
  cet_rate?: number | null
  installment_amount: number
  installment_total: number
  installment_paid: number
  is_settled: boolean
  paid_amount: number
  remaining_amount: number
  progress_pct: number
  created_at: string
  updated_at: string
}

export interface CreditCard {
  id: string
  household_id: string
  name: string
  issuer?: string | null
  spending_cap?: number | null
  closing_day?: number | null
  due_day?: number | null
  is_active: boolean
  created_at: string
}
