import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES = [
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

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function createUniqueInviteCode(): Promise<string> {
  let code = generateInviteCode()
  let existing = await prisma.household.findUnique({ where: { invite_code: code } })
  while (existing) {
    code = generateInviteCode()
    existing = await prisma.household.findUnique({ where: { invite_code: code } })
  }
  return code
}

async function main() {
  console.log('🌱 Iniciando seed...')

  const inviteCode = await createUniqueInviteCode()

  const household = await prisma.household.create({
    data: {
      name: 'Casa de Teste',
      invite_code: inviteCode,
    },
  })
  console.log(`✅ Household criado: ${household.name} (convite: ${inviteCode})`)

  const user1 = await prisma.user.create({
    data: {
      supabase_id: 'seed-user-1-not-real-supabase-id',
      name: 'Ana Teste',
      email: 'ana.teste@seed.local',
      household_id: household.id,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      supabase_id: 'seed-user-2-not-real-supabase-id',
      name: 'Bruno Teste',
      email: 'bruno.teste@seed.local',
      household_id: household.id,
    },
  })
  console.log(`✅ 2 usuários criados: ${user1.name}, ${user2.name}`)

  const categories = await Promise.all(
    DEFAULT_CATEGORIES.map((cat) =>
      prisma.category.create({
        data: {
          ...cat,
          household_id: household.id,
        },
      })
    )
  )
  console.log(`✅ ${categories.length} categorias criadas`)

  const catByName = (name: string) => categories.find((c) => c.name === name)!
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  function dateInMonth(monthAgo: number, day: number): Date {
    const d = new Date(currentYear, currentMonth - 1 - monthAgo, day)
    return d
  }

  const transactionsData = [
    { monthAgo: 0, day: 5, type: 'INCOME', amount: 4500, desc: 'Salário mensal', cat: 'Salário', user: user1.id, method: 'BANK_TRANSFER' },
    { monthAgo: 0, day: 10, type: 'EXPENSE', amount: 1200, desc: 'Aluguel', cat: 'Moradia', user: user1.id, method: 'BANK_TRANSFER' },
    { monthAgo: 0, day: 12, type: 'EXPENSE', amount: 350.5, desc: 'Supermercado', cat: 'Alimentação', user: user2.id, method: 'CREDIT_CARD' },
    { monthAgo: 0, day: 15, type: 'EXPENSE', amount: 89.9, desc: 'Internet', cat: 'Assinaturas', user: user2.id, method: 'BOLETO' },
    { monthAgo: 0, day: 18, type: 'EXPENSE', amount: 45, desc: 'Gasolina', cat: 'Transporte', user: user1.id, method: 'CREDIT_CARD' },
    { monthAgo: 0, day: 20, type: 'EXPENSE', amount: 120, desc: 'Farmácia', cat: 'Saúde', user: user2.id, method: 'PIX' },
    { monthAgo: 0, day: 22, type: 'INCOME', amount: 800, desc: 'Freelance design', cat: 'Freelance', user: user2.id, method: 'PIX' },
    { monthAgo: 0, day: 25, type: 'EXPENSE', amount: 60, desc: 'Cinema', cat: 'Lazer', user: user1.id, method: 'CREDIT_CARD' },

    { monthAgo: 1, day: 5, type: 'INCOME', amount: 4500, desc: 'Salário mensal', cat: 'Salário', user: user1.id, method: 'BANK_TRANSFER' },
    { monthAgo: 1, day: 10, type: 'EXPENSE', amount: 1200, desc: 'Aluguel', cat: 'Moradia', user: user1.id, method: 'BANK_TRANSFER' },
    { monthAgo: 1, day: 14, type: 'EXPENSE', amount: 410.3, desc: 'Supermercado', cat: 'Alimentação', user: user2.id, method: 'CREDIT_CARD' },
    { monthAgo: 1, day: 20, type: 'EXPENSE', amount: 150, desc: 'Roupas', cat: 'Compras', user: user2.id, method: 'CREDIT_CARD' },

    { monthAgo: 2, day: 5, type: 'INCOME', amount: 4500, desc: 'Salário mensal', cat: 'Salário', user: user1.id, method: 'BANK_TRANSFER' },
    { monthAgo: 2, day: 10, type: 'EXPENSE', amount: 1200, desc: 'Aluguel', cat: 'Moradia', user: user1.id, method: 'BANK_TRANSFER' },
    { monthAgo: 2, day: 18, type: 'EXPENSE', amount: 230, desc: 'Manutenção do carro', cat: 'Transporte', user: user1.id, method: 'DEBIT_CARD' },
  ]

  for (const t of transactionsData) {
    await prisma.transaction.create({
      data: {
        household_id: household.id,
        user_id: t.user,
        category_id: catByName(t.cat).id,
        type: t.type as 'INCOME' | 'EXPENSE',
        amount: t.amount,
        description: t.desc,
        date: dateInMonth(t.monthAgo, t.day),
        payment_method: t.method as 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'BANK_TRANSFER' | 'BOLETO',
      },
    })
  }
  console.log(`✅ ${transactionsData.length} transações criadas (3 meses)`)

  const recurringBillsData = [
    { name: 'Aluguel', amount: 1200, due_day: 10, user: user1.id },
    { name: 'Internet', amount: 89.9, due_day: 15, user: user2.id },
    { name: 'Academia', amount: 99, due_day: 5, user: user1.id },
    { name: 'Streaming', amount: 55.9, due_day: 20, user: user2.id },
  ]

  for (const bill of recurringBillsData) {
    const recurringBill = await prisma.recurringBill.create({
      data: {
        household_id: household.id,
        user_id: bill.user,
        name: bill.name,
        amount: bill.amount,
        due_day: bill.due_day,
        recurrence: 'MONTHLY',
        is_active: true,
      },
    })

    const isPaid = bill.name === 'Aluguel' || bill.name === 'Internet'
    await prisma.billMonthlyStatus.create({
      data: {
        recurring_bill_id: recurringBill.id,
        month: currentMonth,
        year: currentYear,
        status: isPaid ? 'PAID' : 'PENDING',
        paid_at: isPaid ? new Date(currentYear, currentMonth - 1, bill.due_day) : null,
        paid_amount: isPaid ? bill.amount : null,
      },
    })
  }
  console.log(`✅ ${recurringBillsData.length} contas recorrentes criadas`)

  const budget = await prisma.budget.create({
    data: {
      household_id: household.id,
      month: currentMonth,
      year: currentYear,
      total_income: 5300,
    },
  })

  const budgetItemsData = [
    { cat: 'Moradia', planned: 1200 },
    { cat: 'Alimentação', planned: 800 },
    { cat: 'Transporte', planned: 400 },
    { cat: 'Saúde', planned: 300 },
    { cat: 'Lazer', planned: 200 },
  ]

  for (const item of budgetItemsData) {
    await prisma.budgetItem.create({
      data: {
        budget_id: budget.id,
        category_id: catByName(item.cat).id,
        planned: item.planned,
      },
    })
  }
  console.log(`✅ Orçamento criado com ${budgetItemsData.length} itens`)

  const goalsData = [
    { name: 'Reserva de emergência', target: 15000, current: 3200, icon: '🛡️', color: '#6366f1', deadline: new Date(currentYear + 1, 11, 31) },
    { name: 'Viagem de fim de ano', target: 8000, current: 1500, icon: '✈️', color: '#ec4899', deadline: new Date(currentYear, 11, 15) },
  ]

  for (const goal of goalsData) {
    await prisma.financialGoal.create({
      data: {
        household_id: household.id,
        user_id: user1.id,
        name: goal.name,
        target_amount: goal.target,
        current_amount: goal.current,
        deadline: goal.deadline,
        status: 'IN_PROGRESS',
        icon: goal.icon,
        color: goal.color,
      },
    })
  }
  console.log(`✅ ${goalsData.length} metas criadas`)

  console.log('\n🌱 Seed concluído com sucesso!')
  console.log(`   Household: ${household.id}`)
  console.log(`   Convite: ${inviteCode}`)
  console.log('   ⚠️  Os usuários do seed NÃO existem no Supabase Auth.')
  console.log('   O fluxo principal de cadastro via /cadastro continua sendo o recomendado.')
  console.log('   Este seed serve para popular dados de exemplo para desenvolvimento.')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
