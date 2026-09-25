import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const households = await prisma.household.findMany({
    select: { id: true, name: true },
  })

  console.log(`Encontradas ${households.length} casas para verificar`)

  let linked = 0

  for (const household of households) {
    const orphanCount = await prisma.transaction.count({
      where: { household_id: household.id, account_id: null },
    })

    if (orphanCount === 0) continue

    let account = await prisma.account.findFirst({
      where: { household_id: household.id, name: 'Conta principal' },
    })

    if (!account) {
      account = await prisma.account.create({
        data: {
          household_id: household.id,
          name: 'Conta principal',
          type: 'CHECKING',
        },
      })
      console.log(`[${household.name}] Conta principal criada`)
    }

    const result = await prisma.transaction.updateMany({
      where: { household_id: household.id, account_id: null },
      data: { account_id: account.id },
    })

    linked += result.count
    console.log(
      `[${household.name}] ${result.count} transações vinculadas à Conta principal`
    )
  }

  console.log(`\nConcluído: ${linked} transações vinculadas`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
