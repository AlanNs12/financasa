import { prisma } from '@/lib/db/prisma'

export async function categoryBelongsToHousehold(
  categoryId: string,
  householdId: string
): Promise<boolean> {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, household_id: householdId },
    select: { id: true },
  })
  return category !== null
}

export async function creditCardBelongsToHousehold(
  creditCardId: string,
  householdId: string
): Promise<boolean> {
  const card = await prisma.creditCard.findFirst({
    where: { id: creditCardId, household_id: householdId },
    select: { id: true },
  })
  return card !== null
}

export async function accountBelongsToHousehold(
  accountId: string,
  householdId: string
): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { id: accountId, household_id: householdId },
    select: { id: true },
  })
  return account !== null
}
