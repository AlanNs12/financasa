'use server'

import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { getTransactionsByMonth } from '@/lib/db/queries/transactions'
import { getPlanejamentoData } from '@/lib/db/queries/budget'
import { getMonthAbbr } from '@/lib/format'

function escapeCsvField(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatCsvNumber(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

const CSV_BOM = '\uFEFF'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  CASH: 'Dinheiro',
  BANK_TRANSFER: 'Transferência',
  BOLETO: 'Boleto',
}

export async function exportTransactionsCsvAction(month: number, year: number) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const transactions = await getTransactionsByMonth(
    current.householdId,
    month,
    year
  )

  const header = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Pagamento', 'Usuário']
  const rows = transactions.map((t) => {
    const date = new Date(t.date).toLocaleDateString('pt-BR')
    const category = t.category?.name ?? ''
    const type = t.type === 'INCOME' ? 'Receita' : 'Despesa'
    const payment = PAYMENT_METHOD_LABELS[t.payment_method] ?? t.payment_method
    const user = t.user?.name ?? ''
    return [
      escapeCsvField(date),
      escapeCsvField(t.description),
      escapeCsvField(category),
      escapeCsvField(type),
      formatCsvNumber(t.amount),
      escapeCsvField(payment),
      escapeCsvField(user),
    ].join(';')
  })

  const csv = CSV_BOM + [header.join(';'), ...rows].join('\r\n')
  const filename = `transacoes-${getMonthAbbr(month).toLowerCase()}-${year}.csv`
  return { csv, filename }
}

export async function exportPlanningCsvAction(month: number, year: number) {
  const current = await getCurrentUserHousehold()
  if (!current) {
    return { error: 'Usuário não autenticado.' }
  }

  const data = await getPlanejamentoData(current.householdId, month, year)

  const header = ['Categoria', 'Planejado', 'Gasto', 'Percentual']
  const rows = data.items
    .filter((item) => item.planned > 0 || item.spent > 0)
    .map((item) => {
      return [
        escapeCsvField(item.name),
        formatCsvNumber(item.planned),
        formatCsvNumber(item.spent),
        `${item.percentage}%`,
      ].join(';')
    })

  const totalRow = [
    escapeCsvField('TOTAL'),
    formatCsvNumber(data.total_planned),
    formatCsvNumber(data.total_spent),
    data.total_planned > 0
      ? `${Math.round((data.total_spent / data.total_planned) * 100)}%`
      : '0%',
  ].join(';')

  const csv =
    CSV_BOM +
    [
      `Receita total;${formatCsvNumber(data.total_income)}`,
      `Receita realizada;${formatCsvNumber(data.actual_income)}`,
      '',
      header.join(';'),
      ...rows,
      totalRow,
    ].join('\r\n')

  const filename = `planejamento-${getMonthAbbr(month).toLowerCase()}-${year}.csv`
  return { csv, filename }
}
