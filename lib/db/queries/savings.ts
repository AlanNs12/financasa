import { prisma } from '@/lib/db/prisma'
import type {
  SavingsJar,
  SavingsJarWithBalance,
  JarMovement,
  AccountRef,
} from '@/types'
import { computeJarBalance, computeJarProgress } from '@/lib/calculations/savings'

interface AccountRefRow {
  id: string
  name: string
  color: string | null
  icon: string | null
}

function serializeAccountRef(ref?: AccountRefRow | null): AccountRef | undefined {
  if (!ref) return undefined
  return { id: ref.id, name: ref.name, color: ref.color, icon: ref.icon }
}

interface RawJar {
  id: string
  household_id: string
  account_id: string
  user_id: string
  name: string
  target_amount: { toString: () => string } | null
  color: string | null
  icon: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
}

function serializeJar(j: RawJar): SavingsJar {
  return {
    id: j.id,
    household_id: j.household_id,
    account_id: j.account_id,
    user_id: j.user_id,
    name: j.name,
    target_amount: j.target_amount != null ? Number(j.target_amount) : null,
    color: j.color,
    icon: j.icon,
    is_active: j.is_active,
    created_at: j.created_at.toISOString(),
    updated_at: j.updated_at.toISOString(),
  }
}

interface RawJarMovement {
  id: string
  jar_id: string
  user_id: string
  type: 'DEPOSIT' | 'WITHDRAW'
  amount: { toString: () => string }
  date: Date
  note: string | null
  created_at: Date
}

function serializeJarMovement(m: RawJarMovement): JarMovement {
  return {
    id: m.id,
    jar_id: m.jar_id,
    user_id: m.user_id,
    type: m.type,
    amount: Number(m.amount),
    date: m.date.toISOString(),
    note: m.note,
    created_at: m.created_at.toISOString(),
  }
}

export async function getJarsWithBalances(
  householdId: string,
  options?: { includeInactive?: boolean; accountId?: string }
): Promise<SavingsJarWithBalance[]> {
  const includeInactive = options?.includeInactive ?? false

  const jars = await prisma.savingsJar.findMany({
    where: {
      household_id: householdId,
      ...(includeInactive ? {} : { is_active: true }),
      ...(options?.accountId ? { account_id: options.accountId } : {}),
    },
    include: {
      movements: { select: { type: true, amount: true } },
      account: { select: { id: true, name: true, color: true, icon: true } },
    },
    orderBy: { created_at: 'asc' },
  })

  return jars.map((j) => {
    const balance = computeJarBalance(
      j.movements.map((m) => ({
        type: m.type as 'DEPOSIT' | 'WITHDRAW',
        amount: Number(m.amount),
      }))
    )
    const target = j.target_amount != null ? Number(j.target_amount) : null
    return {
      ...serializeJar(j as unknown as RawJar),
      balance,
      progress: computeJarProgress(balance, target),
      account: serializeAccountRef(j.account as AccountRefRow | null),
    }
  })
}

export async function getReservedByAccount(
  householdId: string,
  accountIds: string[]
): Promise<Map<string, number>> {
  const reserved = new Map<string, number>()
  if (accountIds.length === 0) return reserved

  const jars = await prisma.savingsJar.findMany({
    where: {
      household_id: householdId,
      is_active: true,
      account_id: { in: accountIds },
    },
    select: {
      account_id: true,
      movements: { select: { type: true, amount: true } },
    },
  })

  for (const jar of jars) {
    const balance = computeJarBalance(
      jar.movements.map((m) => ({
        type: m.type as 'DEPOSIT' | 'WITHDRAW',
        amount: Number(m.amount),
      }))
    )
    const current = reserved.get(jar.account_id) ?? 0
    reserved.set(jar.account_id, Math.round((current + balance) * 100) / 100)
  }

  return reserved
}

export async function getJarWithBalance(
  jarId: string,
  householdId: string
): Promise<SavingsJarWithBalance | null> {
  const jar = await prisma.savingsJar.findFirst({
    where: { id: jarId, household_id: householdId },
    include: {
      movements: { select: { type: true, amount: true } },
      account: { select: { id: true, name: true, color: true, icon: true } },
    },
  })

  if (!jar) return null

  const balance = computeJarBalance(
    jar.movements.map((m) => ({
      type: m.type as 'DEPOSIT' | 'WITHDRAW',
      amount: Number(m.amount),
    }))
  )
  const target = jar.target_amount != null ? Number(jar.target_amount) : null

  return {
    ...serializeJar(jar as unknown as RawJar),
    balance,
    progress: computeJarProgress(balance, target),
    account: serializeAccountRef(jar.account as AccountRefRow | null),
  }
}

export async function createJar(data: {
  household_id: string
  account_id: string
  user_id: string
  name: string
  target_amount?: number
  color?: string
  icon?: string
}) {
  return prisma.savingsJar.create({ data })
}

export async function updateJar(
  id: string,
  householdId: string,
  data: {
    name?: string
    target_amount?: number | null
    color?: string | null
    icon?: string | null
    is_active?: boolean
  }
) {
  return prisma.savingsJar.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function deactivateJar(id: string, householdId: string): Promise<number> {
  const result = await prisma.savingsJar.updateMany({
    where: { id, household_id: householdId },
    data: { is_active: false },
  })
  return result.count
}

export async function createJarMovement(data: {
  jar_id: string
  user_id: string
  type: 'DEPOSIT' | 'WITHDRAW'
  amount: number
  date?: Date
  note?: string
}) {
  return prisma.jarMovement.create({ data })
}

export async function getJarMovements(
  jarId: string,
  householdId: string,
  limit = 50
): Promise<JarMovement[]> {
  const movements = await prisma.jarMovement.findMany({
    where: { jar: { id: jarId, household_id: householdId } },
    orderBy: [{ created_at: 'desc' }],
    take: limit,
  })

  return movements.map((m) => serializeJarMovement(m as unknown as RawJarMovement))
}
