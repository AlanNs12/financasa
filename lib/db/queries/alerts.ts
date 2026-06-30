import { prisma } from '@/lib/db/prisma'
import { getCreditCardsWithSpending } from '@/lib/db/queries/credit-cards'
import { formatCurrency } from '@/lib/format'

export type AlertSeverity = 'danger' | 'warning'

export type AlertType = 'bill' | 'budget' | 'credit_card'

export interface ActiveAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  href: string
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

export async function getActiveAlerts(
  householdId: string,
  month: number,
  year: number
): Promise<ActiveAlert[]> {
  const alerts: ActiveAlert[] = []

  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  const isCurrentMonth = month === currentMonth && year === currentYear

  const bills = await prisma.recurringBill.findMany({
    where: {
      household_id: householdId,
      is_active: true,
    },
    include: {
      monthlyStatus: {
        where: { month, year },
      },
    },
  })

  const dim = daysInMonth(month, year)

  for (const bill of bills) {
    const status = bill.monthlyStatus[0]
    if (status?.status === 'PAID' || status?.status === 'SKIPPED') continue

    let effectiveDueDay = bill.due_day
    if (effectiveDueDay > dim) effectiveDueDay = dim

    let daysUntilDue: number
    if (isCurrentMonth) {
      daysUntilDue = effectiveDueDay - currentDay
    } else {
      const dueDate = new Date(year, month - 1, effectiveDueDay)
      daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    if (daysUntilDue > 5) continue

    const severity: AlertSeverity = daysUntilDue <= 0 ? 'danger' : 'warning'

    let title: string
    if (daysUntilDue < 0) {
      title = `${bill.name} vencida`
    } else if (daysUntilDue === 0) {
      title = `${bill.name} vence hoje`
    } else {
      title = `${bill.name} vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'}`
    }

    alerts.push({
      id: `bill-${bill.id}`,
      type: 'bill',
      severity,
      title,
      description: `${formatCurrency(Number(bill.amount))} · venc. dia ${bill.due_day}`,
      href: '/contas',
    })
  }

  const budget = await prisma.budget.findUnique({
    where: {
      household_id_month_year: { household_id: householdId, month, year },
    },
    include: {
      items: {
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
        },
      },
    },
  })

  if (budget) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const transactions = await prisma.transaction.findMany({
      where: {
        household_id: householdId,
        date: { gte: startDate, lte: endDate },
        type: 'EXPENSE',
      },
      select: { category_id: true, amount: true },
    })

    const spentByCategory = new Map<string, number>()
    for (const t of transactions) {
      spentByCategory.set(
        t.category_id,
        (spentByCategory.get(t.category_id) ?? 0) + Number(t.amount)
      )
    }

    for (const item of budget.items) {
      const planned = Number(item.planned)
      if (planned <= 0) continue

      const spent = spentByCategory.get(item.category_id) ?? 0
      const percentage = (spent / planned) * 100

      if (percentage >= 70) {
        const severity: AlertSeverity = percentage >= 90 ? 'danger' : 'warning'
        const catName = item.category?.name ?? 'Categoria'
        const catIcon = item.category?.icon ?? '📦'

        alerts.push({
          id: `budget-${item.id}`,
          type: 'budget',
          severity,
          title: `${catIcon} ${catName}: ${Math.round(percentage)}% do orçamento`,
          description: `${formatCurrency(spent)} de ${formatCurrency(planned)}`,
          href: '/planejamento',
        })
      }
    }
  }

  const cardsWithSpending = await getCreditCardsWithSpending(householdId, month, year)

  for (const card of cardsWithSpending) {
    if (card.spending_cap == null || card.spending_cap <= 0) continue
    if (card.capPercentage == null || card.capPercentage < 70) continue

    const severity: AlertSeverity = card.capPercentage >= 90 ? 'danger' : 'warning'

    alerts.push({
      id: `card-${card.id}`,
      type: 'credit_card',
      severity,
      title: `Cartão ${card.name}: ${Math.round(card.capPercentage)}% do teto`,
      description: `${formatCurrency(card.spending)} de ${formatCurrency(card.spending_cap as number)}`,
      href: '/transacoes',
    })
  }

  const severityOrder: Record<AlertSeverity, number> = { danger: 0, warning: 1 }
  const typeOrder: Record<AlertType, number> = { bill: 0, budget: 1, credit_card: 2 }

  alerts.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return typeOrder[a.type] - typeOrder[b.type]
  })

  return alerts
}
