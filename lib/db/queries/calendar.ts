import { prisma } from '@/lib/db/prisma'

export type CalendarEventType =
  | 'income'
  | 'expense'
  | 'bill_pending'
  | 'bill_paid'
  | 'bill_overdue'
  | 'card_due'
  | 'card_closing'

export interface CalendarEvent {
  id: string
  type: CalendarEventType
  label: string
  sublabel?: string
  amount?: number
  categoryIcon?: string
  categoryColor?: string
}

export type CalendarDayMap = Record<number, CalendarEvent[]>

export async function getCalendarData(
  householdId: string,
  month: number,
  year: number
): Promise<CalendarDayMap> {
  const dayMap: CalendarDayMap = {}

  function addEvent(day: number, event: CalendarEvent) {
    if (!dayMap[day]) dayMap[day] = []
    dayMap[day].push(event)
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      household_id: householdId,
      date: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
    include: { category: true },
    orderBy: { date: 'asc' },
  })

  for (const t of transactions) {
    const day = new Date(t.date).getUTCDate()
    addEvent(day, {
      id: t.id,
      type: t.type === 'INCOME' ? 'income' : 'expense',
      label: t.description,
      sublabel: t.category.name,
      amount: Number(t.amount),
      categoryIcon: t.category.icon,
      categoryColor: t.category.color,
    })
  }

  const bills = await prisma.recurringBill.findMany({
    where: {
      household_id: householdId,
      is_active: true,
      OR: [
        { start_year: { lt: year } },
        { start_year: year, start_month: { lte: month } },
      ],
    },
    include: {
      monthlyStatus: {
        where: { month, year },
        take: 1,
      },
    },
  })

  for (const bill of bills) {
    const status = bill.monthlyStatus[0]?.status ?? 'PENDING'
    const eventType: CalendarEventType =
      status === 'PAID'    ? 'bill_paid'    :
      status === 'OVERDUE' ? 'bill_overdue' :
      'bill_pending'

    const createdMonth = new Date(bill.created_at).getMonth() + 1
    const monthDiff = month - createdMonth

    const applies = bill.recurrence === 'MONTHLY' ||
      (bill.recurrence === 'ANNUAL' && createdMonth === month) ||
      (bill.recurrence === 'QUARTERLY' && monthDiff % 3 === 0) ||
      (bill.recurrence === 'SEMIANNUAL' && monthDiff % 6 === 0) ||
      (bill.recurrence === 'BIMONTHLY' && monthDiff % 2 === 0)

    if (!applies) continue

    addEvent(bill.due_day, {
      id: bill.id,
      type: eventType,
      label: bill.name,
      amount: Number(bill.amount),
    })
  }

  const cards = await prisma.creditCard.findMany({
    where: {
      household_id: householdId,
      is_active: true,
    },
  })

  for (const card of cards) {
    if (card.closing_day) {
      addEvent(card.closing_day, {
        id: `${card.id}-closing`,
        type: 'card_closing',
        label: `Fechamento — ${card.name}`,
        sublabel: card.issuer ?? undefined,
      })
    }
    if (card.due_day) {
      addEvent(card.due_day, {
        id: `${card.id}-due`,
        type: 'card_due',
        label: `Fatura — ${card.name}`,
        sublabel: card.issuer ?? undefined,
      })
    }
  }

  return dayMap
}
