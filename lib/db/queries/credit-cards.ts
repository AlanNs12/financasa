import { prisma } from '@/lib/db/prisma'
import type { CreditCard } from '@/types'

interface RawCreditCard {
  id: string
  household_id: string
  name: string
  issuer: string | null
  spending_cap: { toString: () => string } | null
  closing_day: number | null
  due_day: number | null
  is_active: boolean
  created_at: Date
}

function serializeCreditCard(c: RawCreditCard): CreditCard {
  return {
    id: c.id,
    household_id: c.household_id,
    name: c.name,
    issuer: c.issuer,
    spending_cap: c.spending_cap ? Number(c.spending_cap) : null,
    closing_day: c.closing_day,
    due_day: c.due_day,
    is_active: c.is_active,
    created_at: c.created_at.toISOString(),
  }
}

export async function getCreditCards(
  householdId: string,
  includeInactive = false
): Promise<CreditCard[]> {
  const cards = await prisma.creditCard.findMany({
    where: includeInactive
      ? { household_id: householdId }
      : { household_id: householdId, is_active: true },
    orderBy: { created_at: 'asc' },
  })

  return cards.map((c) => serializeCreditCard(c as unknown as RawCreditCard))
}

export async function getCreditCardSpending(
  creditCardId: string,
  month: number,
  year: number
): Promise<number> {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      credit_card_id: creditCardId,
      type: 'EXPENSE',
      OR: [
        { billing_month: month, billing_year: year },
        { billing_month: null, date: { gte: monthStart, lt: monthEnd } },
      ],
    },
    select: { amount: true },
  })

  return transactions.reduce((sum, t) => sum + Number(t.amount), 0)
}

export interface CreditCardWithSpending extends CreditCard {
  spending: number
  capPercentage: number | null
}

export async function getCreditCardsWithSpending(
  householdId: string,
  month: number,
  year: number
): Promise<CreditCardWithSpending[]> {
  const cards = await getCreditCards(householdId)

  const withSpending = await Promise.all(
    cards.map(async (card) => {
      const spending = await getCreditCardSpending(card.id, month, year)
      const capPercentage =
        card.spending_cap != null && card.spending_cap > 0
          ? (spending / card.spending_cap) * 100
          : null
      return { ...card, spending, capPercentage }
    })
  )

  return withSpending
}

export async function createCreditCard(data: {
  household_id: string
  name: string
  issuer?: string
  spending_cap?: number
  closing_day?: number
  due_day?: number
}) {
  return prisma.creditCard.create({ data })
}

export async function updateCreditCard(
  id: string,
  householdId: string,
  data: {
    name?: string
    issuer?: string | null
    spending_cap?: number | null
    closing_day?: number | null
    due_day?: number | null
    is_active?: boolean
  }
) {
  return prisma.creditCard.updateMany({
    where: { id, household_id: householdId },
    data,
  })
}

export async function deleteCreditCard(
  id: string,
  householdId: string
): Promise<number> {
  const result = await prisma.creditCard.updateMany({
    where: { id, household_id: householdId },
    data: { is_active: false },
  })
  return result.count
}
