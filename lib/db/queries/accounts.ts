import { prisma } from '@/lib/db/prisma'
import type {
  Account,
  AccountWithBalance,
  Transfer,
  AccountRef,
  AccountType,
} from '@/types'
import { computeAccountBalance } from '@/lib/calculations/accounts'

interface RawAccount {
  id: string
  household_id: string
  name: string
  type: AccountType
  institution: string | null
  initial_balance: { toString: () => string }
  color: string | null
  icon: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

function serializeAccount(a: RawAccount): Account {
  return {
    id: a.id,
    household_id: a.household_id,
    name: a.name,
    type: a.type,
    institution: a.institution,
    initial_balance: Number(a.initial_balance),
    color: a.color,
    icon: a.icon,
    is_active: a.is_active,
    created_at: a.created_at.toISOString(),
    updated_at: a.updated_at.toISOString(),
  }
}

export async function getAccounts(
  householdId: string,
  includeInactive = false
): Promise<Account[]> {
  const accounts = await prisma.account.findMany({
    where: includeInactive
      ? { household_id: householdId }
      : { household_id: householdId, is_active: true },
    orderBy: { created_at: 'asc' },
  })

  return accounts.map((a) => serializeAccount(a as unknown as RawAccount))
}

export async function getAccountsWithBalances(
  householdId: string,
  includeInactive = false
): Promise<AccountWithBalance[]> {
  const accounts = await getAccounts(householdId, includeInactive)
  if (accounts.length === 0) return []

  const ids = accounts.map((a) => a.id)

  const [transactions, transfers, cardPayments] = await Promise.all([
    prisma.transaction.findMany({
      where: { household_id: householdId, account_id: { in: ids } },
      select: { account_id: true, type: true, amount: true },
    }),
    prisma.transfer.findMany({
      where: {
        household_id: householdId,
        OR: [{ from_account_id: { in: ids } }, { to_account_id: { in: ids } }],
      },
      select: { from_account_id: true, to_account_id: true, amount: true },
    }),
    prisma.cardInvoicePayment.findMany({
      where: { household_id: householdId, account_id: { in: ids } },
      select: { account_id: true, amount: true },
    }),
  ])

  return accounts.map((account) => {
    const accountTransactions = transactions
      .filter((t) => t.account_id === account.id)
      .map((t) => ({
        type: t.type as 'INCOME' | 'EXPENSE',
        amount: Number(t.amount),
      }))

    const transfersIn = transfers
      .filter((t) => t.to_account_id === account.id)
      .map((t) => ({ amount: Number(t.amount) }))

    const transfersOut = transfers
      .filter((t) => t.from_account_id === account.id)
      .map((t) => ({ amount: Number(t.amount) }))

    const payments = cardPayments
      .filter((p) => p.account_id === account.id)
      .map((p) => ({ amount: Number(p.amount) }))

    const parts = computeAccountBalance(
      account.initial_balance,
      accountTransactions,
      transfersIn,
      transfersOut,
      payments
    )

    return { ...account, ...parts }
  })
}

export async function createAccount(data: {
  household_id: string
  name: string
  type: AccountType
  institution?: string
  initial_balance: number
  color?: string
  icon?: string
}) {
  return prisma.account.create({ data })
}

export async function updateAccount(
  id: string,
  householdId: string,
  data: {
    name?: string
    type?: AccountType
    institution?: string | null
    initial_balance?: number
    color?: string | null
    icon?: string | null
    is_active?: boolean
  }
) {
  return prisma.account.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function deleteAccount(id: string, householdId: string): Promise<number> {
  const result = await prisma.account.updateMany({
    where: { id, household_id: householdId },
    data: { is_active: false },
  })
  return result.count
}

interface RawTransfer {
  id: string
  household_id: string
  user_id: string
  from_account_id: string
  to_account_id: string
  amount: { toString: () => string }
  date: Date
  description: string | null
  notes: string | null
  created_at: Date
  from_account?: { id: string; name: string; color: string | null; icon: string | null }
  to_account?: { id: string; name: string; color: string | null; icon: string | null }
}

function serializeAccountRef(
  ref?: { id: string; name: string; color: string | null; icon: string | null } | null
): AccountRef | undefined {
  if (!ref) return undefined
  return { id: ref.id, name: ref.name, color: ref.color, icon: ref.icon }
}

function serializeTransfer(t: RawTransfer): Transfer {
  return {
    id: t.id,
    household_id: t.household_id,
    user_id: t.user_id,
    from_account_id: t.from_account_id,
    to_account_id: t.to_account_id,
    amount: Number(t.amount),
    date: t.date.toISOString(),
    description: t.description,
    notes: t.notes,
    created_at: t.created_at.toISOString(),
    from_account: serializeAccountRef(t.from_account),
    to_account: serializeAccountRef(t.to_account),
  }
}

export async function getTransfers(
  householdId: string,
  limit = 50
): Promise<Transfer[]> {
  const transfers = await prisma.transfer.findMany({
    where: { household_id: householdId },
    include: {
      from_account: { select: { id: true, name: true, color: true, icon: true } },
      to_account: { select: { id: true, name: true, color: true, icon: true } },
    },
    orderBy: { date: 'desc' },
    take: limit,
  })

  return transfers.map((t) => serializeTransfer(t as unknown as RawTransfer))
}

export async function createTransfer(data: {
  household_id: string
  user_id: string
  from_account_id: string
  to_account_id: string
  amount: number
  date: Date
  description?: string
  notes?: string
}) {
  return prisma.transfer.create({ data })
}

export async function deleteTransfer(id: string, householdId: string): Promise<number> {
  const result = await prisma.transfer.deleteMany({
    where: { id, household_id: householdId },
  })
  return result.count
}
