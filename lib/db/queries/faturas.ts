import { prisma } from '@/lib/db/prisma'

export interface FaturaTransaction {
  id: string
  description: string
  amount: number
  date: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  billingMoved: boolean
  purchaseDate: string
  installment_total: number | null
  installment_current: number | null
}

export interface FaturaPayment {
  id: string
  account_id: string
  accountName: string
  amount: number
  paid_at: string
}

export interface FaturaCard {
  cardId: string
  cardName: string
  issuer: string | null
  dueDay: number | null
  closingDay: number | null
  total: number
  transactions: FaturaTransaction[]
  payment: FaturaPayment | null
}

export interface FaturaData {
  month: number
  year: number
  totalGeral: number
  cards: FaturaCard[]
  transactionsSemCartao: FaturaTransaction[]
  totalSemCartao: number
}

export async function getFaturaData(
  householdId: string,
  month: number,
  year: number
): Promise<FaturaData> {
  const [transactions, payments] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        household_id: householdId,
        type: 'EXPENSE',
        payment_method: 'CREDIT_CARD',
        OR: [
          { billing_month: month, billing_year: year },
          {
            billing_month: null,
            date: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        ],
      },
      include: {
        category: { select: { name: true, icon: true, color: true } },
        credit_card: {
          select: {
            id: true,
            name: true,
            issuer: true,
            due_day: true,
            closing_day: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.cardInvoicePayment.findMany({
      where: { household_id: householdId, billing_month: month, billing_year: year },
      include: { account: { select: { name: true } } },
    }),
  ])

  const paymentByCard = new Map(payments.map((p) => [p.credit_card_id, p]))

  const cardMap = new Map<string, FaturaCard>()
  const semCartao: FaturaTransaction[] = []

  for (const t of transactions) {
    const dateStr =
      t.date instanceof Date
        ? t.date.toISOString().split('T')[0]
        : String(t.date).split('T')[0]

    const purchaseMonth = parseInt(dateStr.split('-')[1], 10)
    const billingMoved =
      t.billing_month != null && t.billing_month !== purchaseMonth

    const ft: FaturaTransaction = {
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
      date: dateStr,
      categoryName: t.category.name,
      categoryIcon: t.category.icon,
      categoryColor: t.category.color,
      billingMoved,
      purchaseDate: dateStr,
      installment_total: t.installment_total,
      installment_current: t.installment_current,
    }

    if (!t.credit_card) {
      semCartao.push(ft)
      continue
    }

    const cid = t.credit_card.id
    if (!cardMap.has(cid)) {
      cardMap.set(cid, {
        cardId: cid,
        cardName: t.credit_card.name,
        issuer: t.credit_card.issuer,
        dueDay: t.credit_card.due_day,
        closingDay: t.credit_card.closing_day,
        total: 0,
        transactions: [],
        payment: null,
      })
    }
    const card = cardMap.get(cid)!
    card.total += ft.amount
    card.transactions.push(ft)
  }

  const cards = Array.from(cardMap.values())
    .sort((a, b) => b.total - a.total)
    .map((c) => {
      const p = paymentByCard.get(c.cardId)
      return {
        ...c,
        payment: p
          ? {
              id: p.id,
              account_id: p.account_id,
              accountName: p.account.name,
              amount: Number(p.amount),
              paid_at: p.paid_at.toISOString(),
            }
          : null,
      }
    })

  const totalSemCartao = semCartao.reduce((s, t) => s + t.amount, 0)
  const totalGeral = cards.reduce((s, c) => s + c.total, 0) + totalSemCartao

  return {
    month,
    year,
    totalGeral,
    cards,
    transactionsSemCartao: semCartao,
    totalSemCartao,
  }
}

export async function upsertCardInvoicePayment(data: {
  household_id: string
  user_id: string
  credit_card_id: string
  account_id: string
  billing_month: number
  billing_year: number
  amount: number
}) {
  return prisma.cardInvoicePayment.upsert({
    where: {
      credit_card_id_billing_month_billing_year: {
        credit_card_id: data.credit_card_id,
        billing_month: data.billing_month,
        billing_year: data.billing_year,
      },
    },
    create: data,
    update: {
      account_id: data.account_id,
      amount: data.amount,
      user_id: data.user_id,
      paid_at: new Date(),
    },
  })
}

export async function deleteCardInvoicePayment(
  creditCardId: string,
  month: number,
  year: number,
  householdId: string
): Promise<number> {
  const result = await prisma.cardInvoicePayment.deleteMany({
    where: {
      credit_card_id: creditCardId,
      billing_month: month,
      billing_year: year,
      household_id: householdId,
    },
  })
  return result.count
}
