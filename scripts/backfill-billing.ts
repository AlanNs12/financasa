import { PrismaClient } from '@prisma/client'
import { calculateBillingPeriod } from '../lib/calculations/billing'

const prisma = new PrismaClient()

async function main() {
  const transactions = await prisma.transaction.findMany({
    where: {
      payment_method: 'CREDIT_CARD',
      billing_month: null,
    },
    include: {
      credit_card: {
        select: { closing_day: true },
      },
    },
  })

  console.log(`Encontradas ${transactions.length} transações para backfill`)

  let moved = 0
  let same = 0

  for (const t of transactions) {
    const purchaseDate = new Date(t.date)
    const closingDay = t.credit_card?.closing_day ?? null

    const period = calculateBillingPeriod(purchaseDate, closingDay)

    await prisma.transaction.update({
      where: { id: t.id },
      data: {
        billing_month: period.billingMonth,
        billing_year: period.billingYear,
      },
    })

    const originalMonth = purchaseDate.getUTCMonth() + 1
    const wasMoved = period.billingMonth !== originalMonth

    console.log(
      `[${wasMoved ? 'MOVED' : 'SAME'}] ${t.description} | ` +
      `data: ${purchaseDate.toISOString().split('T')[0]} | ` +
      `closing_day: ${closingDay ?? 'N/A'} | ` +
      `billing: ${period.billingMonth}/${period.billingYear}`
    )

    if (wasMoved) moved++
    else same++
  }

  console.log(`\nConcluído: ${moved} movidas, ${same} mantidas no mesmo mês`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
