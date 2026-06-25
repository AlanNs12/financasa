import { prisma } from '@/lib/db/prisma'

export async function getCategories(householdId: string) {
  return prisma.category.findMany({
    where: {
      OR: [
        { household_id: householdId },
        { is_default: true },
      ],
    },
    orderBy: { name: 'asc' },
  })
}
