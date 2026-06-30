import { prisma } from '@/lib/db/prisma'

export async function getCategories(householdId: string) {
  return prisma.category.findMany({
    where: {
      household_id: householdId,
    },
    orderBy: { name: 'asc' },
  })
}

export async function createDefaultCategories(householdId: string) {
  const defaults = [
    { name: 'Moradia', icon: '🏠', color: '#6366f1', type: 'EXPENSE' as const },
    { name: 'Alimentação', icon: '🛒', color: '#f59e0b', type: 'EXPENSE' as const },
    { name: 'Transporte', icon: '🚗', color: '#3b82f6', type: 'EXPENSE' as const },
    { name: 'Saúde', icon: '💊', color: '#ef4444', type: 'EXPENSE' as const },
    { name: 'Educação', icon: '📚', color: '#8b5cf6', type: 'EXPENSE' as const },
    { name: 'Lazer', icon: '🎮', color: '#ec4899', type: 'EXPENSE' as const },
    { name: 'Assinaturas', icon: '📱', color: '#14b8a6', type: 'EXPENSE' as const },
    { name: 'Compras', icon: '🛍️', color: '#f97316', type: 'EXPENSE' as const },
    { name: 'Outros', icon: '💼', color: '#6b7280', type: 'EXPENSE' as const },
    { name: 'Salário', icon: '💰', color: '#22c55e', type: 'INCOME' as const },
    { name: 'Freelance', icon: '💻', color: '#10b981', type: 'INCOME' as const },
    { name: 'Investimentos', icon: '📈', color: '#06b6d4', type: 'INCOME' as const },
  ]

  await prisma.category.createMany({
    data: defaults.map((cat) => ({
      ...cat,
      household_id: householdId,
    })),
  })
}
