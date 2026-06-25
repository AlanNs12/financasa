import { PrismaClient, CategoryType, TransactionType, PaymentMethod, Recurrence, BillStatus } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES = [
  { name: 'Moradia', icon: '🏠', color: '#6366f1', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Alimentação', icon: '🛒', color: '#f59e0b', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Transporte', icon: '🚗', color: '#3b82f6', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Saúde', icon: '💊', color: '#ef4444', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Educação', icon: '📚', color: '#8b5cf6', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Lazer', icon: '🎮', color: '#ec4899', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Assinaturas', icon: '📱', color: '#14b8a6', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Compras', icon: '🛍️', color: '#f97316', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Outros', icon: '💼', color: '#6b7280', type: CategoryType.EXPENSE, is_default: true },
  { name: 'Salário', icon: '💰', color: '#22c55e', type: CategoryType.INCOME, is_default: true },
  { name: 'Freelance', icon: '💻', color: '#10b981', type: CategoryType.INCOME, is_default: true },
  { name: 'Investimentos', icon: '📈', color: '#06b6d4', type: CategoryType.INCOME, is_default: true },
]

async function main() {
  console.log('🌱 Iniciando seed...')

  const household = await prisma.household.create({
    data: {
      name: 'Nossa Casa',
    },
  })

  console.log(`✅ Household criado: ${household.id}`)

  const categories = []
  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        ...cat,
        household_id: household.id,
      },
    })
    categories.push(created)
  }

  console.log(`✅ ${categories.length} categorias criadas`)

  const user1 = await prisma.user.create({
    data: {
      supabase_id: 'seed-user-1',
      name: 'Ana',
      email: 'ana@exemplo.com',
      household_id: household.id,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      supabase_id: 'seed-user-2',
      name: 'Carlos',
      email: 'carlos@exemplo.com',
      household_id: household.id,
    },
  })

  console.log(`✅ Usuários criados: ${user1.name}, ${user2.name}`)

  const alimentacao = categories.find((c) => c.name === 'Alimentação')!
  const transporte = categories.find((c) => c.name === 'Transporte')!
  const salario = categories.find((c) => c.name === 'Salário')!
  const saude = categories.find((c) => c.name === 'Saúde')!
  const assinaturas = categories.find((c) => c.name === 'Assinaturas')!
  const moradia = categories.find((c) => c.name === 'Moradia')!

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const transactions = [
    { household_id: household.id, user_id: user1.id, category_id: alimentacao.id, type: TransactionType.EXPENSE, amount: 189.43, description: 'Mercado Assaí', date: new Date(currentYear, currentMonth, 13), payment_method: PaymentMethod.DEBIT_CARD },
    { household_id: household.id, user_id: user2.id, category_id: transporte.id, type: TransactionType.EXPENSE, amount: 24.90, description: 'Uber', date: new Date(currentYear, currentMonth, 13), payment_method: PaymentMethod.PIX },
    { household_id: household.id, user_id: user1.id, category_id: salario.id, type: TransactionType.INCOME, amount: 5000.00, description: 'Salário', date: new Date(currentYear, currentMonth, 12), payment_method: PaymentMethod.BANK_TRANSFER },
    { household_id: household.id, user_id: user2.id, category_id: saude.id, type: TransactionType.EXPENSE, amount: 87.50, description: 'Farmácia', date: new Date(currentYear, currentMonth, 12), payment_method: PaymentMethod.CREDIT_CARD },
    { household_id: household.id, user_id: user1.id, category_id: assinaturas.id, type: TransactionType.EXPENSE, amount: 21.90, description: 'Spotify', date: new Date(currentYear, currentMonth, 10), payment_method: PaymentMethod.CREDIT_CARD },
    { household_id: household.id, user_id: user2.id, category_id: alimentacao.id, type: TransactionType.EXPENSE, amount: 65.00, description: 'Ifood', date: new Date(currentYear, currentMonth, 8), payment_method: PaymentMethod.PIX },
    { household_id: household.id, user_id: user2.id, category_id: salario.id, type: TransactionType.INCOME, amount: 1200.00, description: 'Freelance Design', date: new Date(currentYear, currentMonth, 5), payment_method: PaymentMethod.BANK_TRANSFER },
    { household_id: household.id, user_id: user1.id, category_id: transporte.id, type: TransactionType.EXPENSE, amount: 180.00, description: 'Gasolina', date: new Date(currentYear, currentMonth, 3), payment_method: PaymentMethod.DEBIT_CARD },
    { household_id: household.id, user_id: user1.id, category_id: alimentacao.id, type: TransactionType.EXPENSE, amount: 23.00, description: 'Padaria', date: new Date(currentYear, currentMonth, 1), payment_method: PaymentMethod.CASH },
    { household_id: household.id, user_id: user2.id, category_id: transporte.id, type: TransactionType.EXPENSE, amount: 15.00, description: 'Estacionamento', date: new Date(currentYear, currentMonth, 15), payment_method: PaymentMethod.PIX },
  ]

  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx })
  }

  console.log(`✅ ${transactions.length} transações criadas`)

  const aluguel = await prisma.recurringBill.create({
    data: {
      household_id: household.id,
      user_id: user1.id,
      name: 'Aluguel',
      amount: 1800.00,
      due_day: 1,
      recurrence: Recurrence.MONTHLY,
    },
  })

  const internet = await prisma.recurringBill.create({
    data: {
      household_id: household.id,
      user_id: user1.id,
      name: 'Internet',
      amount: 119.90,
      due_day: 5,
      recurrence: Recurrence.MONTHLY,
    },
  })

  const energia = await prisma.recurringBill.create({
    data: {
      household_id: household.id,
      user_id: user1.id,
      name: 'Energia',
      amount: 235.50,
      due_day: 15,
      recurrence: Recurrence.MONTHLY,
    },
  })

  await prisma.billMonthlyStatus.createMany({
    data: [
      { recurring_bill_id: aluguel.id, month: currentMonth + 1, year: currentYear, status: BillStatus.OVERDUE },
      { recurring_bill_id: internet.id, month: currentMonth + 1, year: currentYear, status: BillStatus.PAID, paid_at: new Date(), paid_amount: 119.90 },
      { recurring_bill_id: energia.id, month: currentMonth + 1, year: currentYear, status: BillStatus.PENDING },
    ],
  })

  console.log(`✅ 3 contas recorrentes criadas`)

  const budget = await prisma.budget.create({
    data: {
      household_id: household.id,
      month: currentMonth + 1,
      year: currentYear,
      total_income: 8500,
    },
  })

  await prisma.budgetItem.createMany({
    data: [
      { budget_id: budget.id, category_id: moradia.id, planned: 2500 },
      { budget_id: budget.id, category_id: alimentacao.id, planned: 1200 },
      { budget_id: budget.id, category_id: transporte.id, planned: 600 },
      { budget_id: budget.id, category_id: saude.id, planned: 500 },
      { budget_id: budget.id, category_id: assinaturas.id, planned: 200 },
    ],
  })

  console.log(`✅ Orçamento criado`)

  await prisma.financialGoal.createMany({
    data: [
      {
        household_id: household.id,
        user_id: user1.id,
        name: 'Reserva de emergência',
        target_amount: 15000,
        current_amount: 3200,
        deadline: new Date('2025-12-31'),
        icon: '🛡️',
        color: '#6366f1',
      },
      {
        household_id: household.id,
        user_id: user2.id,
        name: 'Viagem Europa',
        target_amount: 20000,
        current_amount: 8500,
        deadline: new Date('2026-06-30'),
        icon: '✈️',
        color: '#ec4899',
      },
    ],
  })

  console.log(`✅ 2 metas financeiras criadas`)
  console.log('🎉 Seed concluído!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
