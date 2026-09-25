export interface BalanceTransaction {
  type: 'INCOME' | 'EXPENSE'
  amount: number
}

export interface BalanceMovement {
  amount: number
}

export interface AccountBalanceParts {
  income: number
  expenses: number
  transfersIn: number
  transfersOut: number
  cardPayments: number
  balance: number
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function computeAccountBalance(
  initialBalance: number,
  transactions: BalanceTransaction[],
  transfersIn: BalanceMovement[] = [],
  transfersOut: BalanceMovement[] = [],
  cardPayments: BalanceMovement[] = []
): AccountBalanceParts {
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const transfersInTotal = transfersIn.reduce((sum, t) => sum + t.amount, 0)
  const transfersOutTotal = transfersOut.reduce((sum, t) => sum + t.amount, 0)
  const cardPaymentsTotal = cardPayments.reduce((sum, t) => sum + t.amount, 0)

  return {
    income: round2(income),
    expenses: round2(expenses),
    transfersIn: round2(transfersInTotal),
    transfersOut: round2(transfersOutTotal),
    cardPayments: round2(cardPaymentsTotal),
    balance: round2(
      initialBalance +
        income -
        expenses +
        transfersInTotal -
        transfersOutTotal -
        cardPaymentsTotal
    ),
  }
}

export function sumAccountBalances(accounts: { balance: number }[]): number {
  return round2(accounts.reduce((sum, account) => sum + account.balance, 0))
}
