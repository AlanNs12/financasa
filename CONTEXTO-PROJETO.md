# Financasa — Contexto Completo do Projeto

App de controle financeiro familiar. Next.js 16 + React 19 + Tailwind v4 + Supabase + Prisma.

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19 + React Compiler + Tailwind CSS v4 + shadcn/ui
- **Auth:** Supabase Auth (SSR com cookies)
- **DB:** Prisma + PostgreSQL (dados) + Supabase (apenas auth)
- **Testes:** Vitest (142 testes, 13 suites)

---

## Arquitetura de Dados

### Dual Database
- **Supabase Auth:** Autenticação apenas (login, signup, password reset)
- **Prisma + PostgreSQL:** Todos os dados da aplicação (13 models)

### Prisma Models

| Model | Descrição | Relações Principais |
|---|---|---|
| `User` | Usuário (supabase_id, name, email) | belongs to Household, tem Transactions, Bills, Goals, Investments |
| `Household` | Casa/grupo familiar (name, invite_code, work_hours_per_day) | tem Users, Categories, Budgets, Cards, Debts, Goals, Investments, Bills, Incomes, Transactions |
| `Category` | Categoria (name, icon, color, type: INCOME/EXPENSE/BOTH) | belongs to Household, tem BudgetItems, Transactions, Bills |
| `Transaction` | Transação (type, amount, description, date, payment_method, installment_group_id) | belongs to Category, User, Household, CreditCard, RecurringBill, RecurringIncome |
| `RecurringBill` | Conta recorrente (name, amount, due_day, recurrence, is_active) | belongs to Household, User, Category; tem BillMonthlyStatus, Transactions |
| `RecurringIncome` | Renda recorrente (name, amount, recurrence, start_month/year) | belongs to Household, User; tem confirmedTransactions |
| `BillMonthlyStatus` | Status mensal de conta (status: PAID/PENDING/OVERDUE, paid_at) | belongs to RecurringBill. Unique: [recurring_bill_id, month, year] |
| `Budget` | Orçamento mensal (month, year, total_income) | belongs to Household; tem BudgetItems. Unique: [household_id, month, year] |
| `BudgetItem` | Item do orçamento (planned amount por categoria) | belongs to Budget, Category. Unique: [budget_id, category_id] |
| `FinancialGoal` | Meta financeira (name, target/current_amount, deadline, status, icon) | belongs to Household, User; tem Investments |
| `Investment` | Investimento (name, asset_type, rate_description, gross_invested/current) | belongs to Household, User, FinancialGoal |
| `Debt` | Dívida (institution, product, principal_amount, installment_amount/total/paid) | belongs to Household |
| `CreditCard` | Cartão de crédito (name, issuer, spending_cap, closing_day, due_day) | belongs to Household; tem Transactions |

### Enums
- `CategoryType`: INCOME, EXPENSE, BOTH
- `TransactionType`: INCOME, EXPENSE
- `PaymentMethod`: CASH, CREDIT_CARD, DEBIT_CARD, PIX, BANK_TRANSFER, OTHER
- `Recurrence`: MONTHLY, BIWEEKLY, YEARLY, ONE_TIME
- `BillStatus`: PAID, PENDING, OVERDUE
- `GoalStatus`: ACTIVE, COMPLETED, CANCELLED
- `InvestmentType`: CDB, LCI, LCA, TESOU_DIRETO, POUPANCA, ACOES, FII, ETF, FUNDO, OUTROS
- `DebtType`: FINANCIAMENTO, EMPRESTIMO, CONSORCIO, CARTAO, OUTROS

---

## Todas as Rotas/Páginas

### Rotas de Autenticação (`app/(auth)/`)

| Rota | Arquivo | Tipo | Descrição |
|---|---|---|---|
| `/login` | `app/(auth)/login/page.tsx` | Client | Formulário de login com react-hook-form + Zod. Modal de reset de senha. Query params: `?confirmed=true`, `?registered=true`, `?deleted=true` |
| `/cadastro` | `app/(auth)/cadastro/page.tsx` | Client | Cadastro com dois modos: "Nova casa" (cria household) ou "Tenho um convite" (código de 6 chars) |
| `/cadastro/reset-password` | `app/(auth)/cadastro/reset-password/page.tsx` | Client | Formulário de redefinição de senha |

### Rotas do Dashboard (`app/(dashboard)/`)

| Rota | Arquivo | Tipo | Descrição |
|---|---|---|---|
| `/` | `app/(dashboard)/page.tsx` | Server | Dashboard principal com MonthlyBudgetCard, SummaryCards, AlertsPanel, ExpensePieChart, RecentTransactions, UpcomingBills, QuickAddTransaction |
| `/transacoes` | `app/(dashboard)/transacoes/page.tsx` | Server | Lista completa de transações com filtros. Renderiza `TransactionsClient` |
| `/contas` | `app/(dashboard)/contas/page.tsx` | Server | Contas do mês, histórico 6 meses, rendas recorrentes. Renderiza `ContasClient` |
| `/faturas` | `app/(dashboard)/faturas/page.tsx` | Server | Faturas de cartão de crédito agrupadas por cartão. Renderiza `FaturasClient` |
| `/planejamento` | `app/(dashboard)/planejamento/page.tsx` | Server | Planejamento orçamentário: definir renda, planejar por categoria, acompanhar real vs planejado. Renderiza `PlanejamentoClient` |
| `/valor-real` | `app/(dashboard)/valor-real/page.tsx` | Server | Calculadora de valor/hora (renda / horas trabalhadas). Renderiza `ValorRealClient` |
| `/metas` | `app/(dashboard)/metas/page.tsx` | Server | Metas financeiras CRUD com progresso e depósitos. Renderiza `MetasClient` |
| `/investimentos` | `app/(dashboard)/investimentos/page.tsx` | Server | Carteira de investimentos com resumo e por-meta. Renderiza `InvestimentosClient` |
| `/investimentos/simulador` | `app/(dashboard)/investimentos/simulador/page.tsx` | Server | Simulador de aposentadoria com crescimento composto e imposto regressivo. Renderiza `SimuladorClient` |
| `/dividas` | `app/(dashboard)/dividas/page.tsx` | Server | Controle de dívidas com pagamento de parcelas e progresso. Renderiza `DividasClient` |
| `/relatorios` | `app/(dashboard)/relatorios/page.tsx` | Server | Relatórios: breakdown por categoria, evolução mensal, planejado vs real. Renderiza `RelatoriosClient` |
| `/relatorios/imprimir` | `app/(dashboard)/relatorios/imprimir/page.tsx` | Server | Página de impressão otimizada com CSS print |
| `/calendario` | `app/(datasheet)/calendario/page.tsx` | Server | Calendário mensal com transações, contas e datas de cartão como eventos. Renderiza `CalendarioClient` |
| `/configuracoes` | `app/(dashboard)/configuracoes/page.tsx` | Server | Configurações: código de convite, membros, tema, cartões, categorias, senha, exclusão de conta |

---

## Fluxo de Navegação entre Páginas

### Fluxo Não Autenticado
```
middleware.ts --> /login (usuário não autenticado)
  /login --> /cadastro (criar conta)
  /login --> /cadastro/reset-password (esqueci senha)
  /cadastro --> /login?registered=true (após cadastro)
  /cadastro/reset-password --> /login (após redefinir)
```

### Fluxo Autenticado
```
middleware.ts --> / (usuário autenticado em rota pública)

Sidebar (11 itens):
  / (Dashboard)
  /transacoes
  /contas
  /faturas
  /planejamento
  /valor-real
  /metas
  /investimentos
  /investimentos/simulador
  /dividas
  /relatorios
  /calendario
  /configuracoes (fim da sidebar)

BottomNav (mobile, 4 principais + grid):
  / (Home)
  /transacoes
  /contas
  /planejamento
  "Mais" overlay: /metas, /investimentos, /faturas, /dividas,
                   /valor-real, /relatorios, /calendario, /configuracoes
```

### Conexões entre Páginas
- **MonthSelector** (`components/layout/month-selector.tsx`): navegação mês/ano via `?month=X&year=Y` — afeta TODAS as páginas
- **AlertsPanel** (dashboard): links para `/contas?month=X&year=Y` e `/planejamento`
- **PrintButton** (relatórios): navega para `/relatorios/imprimir?month=X&year=Y`
- **Sidebar** links usam `prefetch={true}` para navegação instantânea
- **revalidatePath** em cada server action invalida rotas afetadas

---

## Todas as Server Actions (`app/actions/`)

### Auth (`auth.ts`)
| Função | Descrição |
|---|---|
| `signIn(email, password)` | Login via Supabase signInWithPassword |
| `signUp(name, email, password, invite_code?)` | Cadastro: cria Household+User+12 categorias padrão OU joins via código |
| `signOut()` | Logout + redirect /login |
| `resetPasswordAction(email)` | Envia email de redefinição de senha |
| `updatePasswordAction(password)` | Atualiza senha do usuário |

### Transações (`transactions.ts`)
| Função | Descrição |
|---|---|
| `createTransactionAction(data)` | Cria transação com suporte a parcelas, calcula billing_period |
| `updateTransactionAction(id, data)` | Atualiza transação |
| `deleteTransactionAction(id)` | Deleta transação |

### Contas (`bills.ts`)
| Função | Descrição |
|---|---|
| `markBillAsPaidAction(billId, month, year, amount?)` | Marca conta como paga + cria transação automaticamente |
| `createRecurringBillAction(data)` | Cria conta recorrente (fixa ou parcelada) |
| `updateRecurringBillAction(id, data)` | Atualiza conta recorrente |
| `deleteRecurringBillAction(id)` | Deleta conta recorrente (soft delete) |

### Rendas Recorrentes (`recurring-incomes.ts`)
| Função | Descrição |
|---|---|
| `createRecurringIncomeAction(data)` | Cria renda recorrente |
| `updateRecurringIncomeAction(id, data)` | Atualiza renda recorrente |
| `deleteRecurringIncomeAction(id)` | Deleta renda recorrente |
| `confirmRecurringIncomeAction(incomeId, month, year)` | Confirma recebimento + cria transação |
| `unconfirmRecurringIncomeAction(incomeId, month, year)` | Desfaz confirmação |

### Metas (`goals.ts`)
| Função | Descrição |
|---|---|
| `createGoalAction(data)` | Cria meta financeira |
| `updateGoalAction(id, data)` | Atualiza meta |
| `addGoalAmountAction(id, data)` | Adiciona valor à meta (depósito) |
| `deleteGoalAction(id)` | Deleta meta |

### Investimentos (`investments.ts`)
| Função | Descrição |
|---|---|
| `createInvestmentAction(data)` | Cria investimento |
| `updateInvestmentAction(id, data)` | Atualiza investimento |
| `deleteInvestmentAction(id)` | Deleta investimento |

### Dívidas (`debts.ts`)
| Função | Descrição |
|---|---|
| `createDebtAction(data)` | Cria dívida |
| `updateDebtAction(id, data)` | Atualiza dívida |
| `payInstallmentAction(id, data)` | Paga parcela da dívida |
| `deleteDebtAction(id)` | Deleta dívida |

### Orçamento (`budget.ts`)
| Função | Descrição |
|---|---|
| `updateBudgetIncomeAction(month, year, income)` | Atualiza renda total do orçamento mensal |
| `upsertBudgetItemAction(month, year, categoryId, planned)` | Atualiza valor planejado para uma categoria |

### Cartões de Crédito (`credit-cards.ts`)
| Função | Descrição |
|---|---|
| `createCreditCardAction(data)` | Cria cartão de crédito |
| `updateCreditCardAction(id, data)` | Atualiza cartão |
| `deleteCreditCardAction(id)` | Deleta cartão (soft delete) |

### Categorias (`categories.ts`)
| Função | Descrição |
|---|---|
| `createCategoryAction(data)` | Cria categoria customizada |
| `deleteCategoryAction(id)` | Deleta categoria (não permite se em uso) |

### Household (`household.ts`)
| Função | Descrição |
|---|---|
| `clearHouseholdDataAction()` | Limpa todos os dados do household (cascata) |
| `deleteAccountAction()` | Deleta conta + dados + auth user (usa Supabase admin) |

### Configurações (`household-settings.ts`)
| Função | Descrição |
|---|---|
| `updateWorkHoursAction(hours)` | Atualiza horas diárias de trabalho (para cálculo valor/hora) |

### Tema (`theme.ts`)
| Função | Descrição |
|---|---|
| `setThemeAction(theme)` | Salva tema no cookie |

### Exportação (`export.ts`)
| Função | Descrição |
|---|---|
| `exportTransactionsCsvAction(month, year)` | Exporta transações do mês em CSV (ponto-e-vírgula, BOM para Excel) |
| `exportPlanningCsvAction(month, year)` | Exporta planejamento do mês em CSV |

---

## Todas as Queries do Banco (`lib/db/queries/`)

### User (`user.ts`)
| Função | Descrição |
|---|---|
| `getCurrentUserHousehold()` | Retorna {userId, householdId} a partir do Supabase auth |
| `getCurrentUser()` | Retorna dados completos do usuário |
| `createUserAndHousehold(name, email)` | Cria Household + User + 12 categorias padrão |
| `joinHouseholdByInviteCode(userId, code)` | Usuário entra em household existente via código |
| `getHouseholdInviteCode(householdId)` | Retorna código de convite |
| `getHouseholdMembers(householdId)` | Retorna membros do household |

### Transactions (`transactions.ts`)
| Função | Descrição |
|---|---|
| `getTransactionsByMonth(householdId, month, year)` | Transações do mês (billing_month OU date range) |
| `createTransaction(data)` | Cria transação |
| `deleteTransaction(id, householdId)` | Deleta transação |
| `updateTransaction(id, data)` | Atualiza transação |

### Bills (`bills.ts`)
| Função | Descrição |
|---|---|
| `computeBillStatus(billId, month, year)` | Calcula status: PAID/PENDING/OVERDUE |
| `getRecurringBills(householdId, month, year)` | Contas recorrentes do mês com status |
| `getBillsHistory(householdId)` | Histórico 6 meses |
| `createRecurringBill(data)` | Cria conta recorrente |
| `updateBillStatus(billId, month, year, status)` | Atualiza status mensal |
| `createTransactionFromBill(billId, month, year)` | Cria transação a partir de conta paga |
| `getTotalBillsForMonth(householdId, month, year)` | Total de contas do mês |
| `deleteRecurringBill(id, householdId)` | Soft delete |
| `updateRecurringBill(id, data)` | Atualiza conta |
| `getBillsBreakdownForMonth(householdId, month, year)` | Breakdown para planejamento |

### Budget (`budget.ts`)
| Função | Descrição |
|---|---|
| `getPlanejamentoData(householdId, month, year)` | Dados completos do planejamento |
| `getEffectiveIncome(householdId, month, year)` | Renda efetiva (confirmada) |
| `getBudgetWithProgress(householdId, month, year)` | Orçamento com progresso real vs planejado |
| `upsertCategoryBudgetPlan(householdId, categoryId, amount)` | Atualiza plano de categoria |
| `deactivateCategoryBudgetPlan(householdId, categoryId)` | Desativa plano |
| `getActiveBudgetPlans(householdId)` | Planos ativos |

### Alerts (`alerts.ts`)
| Função | Descrição |
|---|---|
| `getActiveAlerts(householdId, month, year)` | Alertas: contas atrasadas, orçamento >70%, limite cartão >70% |

### Categories (`categories.ts`)
| Função | Descrição |
|---|---|
| `getCategories(householdId)` | Lista categorias |
| `createDefaultCategories(householdId)` | Cria 12 categorias padrão (Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Serviços, Investimentos, Rendas, Outras Receitas, Outros Gastos) |
| `createCategory(data)` | Cria categoria customizada |
| `updateCategory(id, data)` | Atualiza categoria |
| `deleteCategory(id, householdId)` | Deleta (não permite se em uso) |

### Credit Cards (`credit-cards.ts`)
| Função | Descrição |
|---|---|
| `getCreditCards(householdId)` | Lista cartões ativos |
| `getCreditCardSpending(householdId, month, year)` | Gastos por cartão no mês |
| `getCreditCardsWithSpending(householdId, month, year)` | Cartões com gastos |
| `createCreditCard(data)` | Cria cartão |
| `updateCreditCard(id, data)` | Atualiza cartão |
| `deleteCreditCard(id, householdId)` | Soft delete |

### Goals (`goals.ts`)
| Função | Descrição |
|---|---|
| `getFinancialGoals(householdId)` | Lista metas |
| `createFinancialGoal(data)` | Cria meta |
| `updateFinancialGoal(id, data)` | Atualiza meta |
| `addAmountToGoal(id, amount)` | Adiciona valor (atualiza current_amount) |
| `deleteFinancialGoal(id, householdId)` | Deleta meta |

### Investments (`investments.ts`)
| Função | Descrição |
|---|---|
| `getInvestments(householdId)` | Lista investimentos |
| `getInvestmentsSummary(householdId)` | Resumo total (aplicado, atual, lucro, por tipo) |
| `getInvestmentsByGoal(householdId)` | Investimentos agrupados por meta |
| `createInvestment(data)` | Cria investimento |
| `updateInvestment(id, data)` | Atualiza investimento |
| `deleteInvestment(id, householdId)` | Deleta investimento |

### Debts (`debts.ts`)
| Função | Descrição |
|---|---|
| `getDebts(householdId)` | Lista dívidas |
| `getDebtsSummary(householdId)` | Resumo (total, quitadas, pendentes) |
| `createDebt(data)` | Cria dívida |
| `updateDebt(id, data)` | Atualiza dívida |
| `payInstallment(id, amount)` | Registra pagamento de parcela |
| `deleteDebt(id, householdId)` | Deleta dívida |

### Reports (`reports.ts`)
| Função | Descrição |
|---|---|
| `getExpensesByCategory(householdId, month, year)` | Despesas por categoria |
| `getMonthlyEvolution(householdId, months)` | Evolução mensal (6 meses) |
| `getPlannedVsActual(householdId, month, year)` | Planejado vs real |

### Dashboard (`dashboard.ts`)
| Função | Descrição |
|---|---|
| `getDashboardSummary(householdId, month, year)` | Resumo: receitas, despesas, saldo, contas pendentes |

### Calendar (`calendar.ts`)
| Função | Descrição |
|---|---|
| `getCalendarData(householdId, month, year)` | Dados do calendário: transações, contas, datas de cartão mapeadas por dia |

### Recurring Incomes (`recurring-incomes.ts`)
| Função | Descrição |
|---|---|
| `getRecurringIncomes(householdId)` | Lista rendas recorrentes |
| `getRecurringIncomesForMonth(householdId, month, year)` | Rendas do mês |
| `getTotalExpectedIncomeForMonth(householdId, month, year)` | Total esperado |
| `createRecurringIncome(data)` | Cria renda |
| `updateRecurringIncome(id, data)` | Atualiza renda |
| `deleteRecurringIncome(id, householdId)` | Soft delete |
| `getRecurringIncomesWithStatus(householdId, month, year)` | Rendas com status de confirmação |

### Faturas (`faturas.ts`)
| Função | Descrição |
|---|---|
| `getFaturaData(householdId, month, year)` | Dados de faturas agrupados por cartão |

### Hourly Value (`hourly-value.ts`)
| Função | Descrição |
|---|---|
| `getHourlyValue(householdId)` | Calcula valor/hora: renda mensal / (dias * horas/dia) |

### Expected Budget (`expected-budget.ts`)
| Função | Descrição |
|---|---|
| `getExpectedBudget(householdId, month, year)` | Orçamento esperado: renda esperada vs real, breakdown de contas, saldo real vs previsto |

---

## Funções de Cálculo (`lib/calculations/`)

### Billing (`billing.ts`)
| Função | Descrição |
|---|---|
| `calculateBillingPeriod(closingDay, purchaseDate)` | Determina mês de faturamento baseado no dia de fechamento |
| `getBillingLabel(closingDay, month, year)` | Rótulo legível do período de faturamento |
| `previewBillingPeriod(closingDay)` | Preview do próximo período |
| `calculateInstallmentPlan(total, current)` | Calcula progresso de parcelas |

### Investments (`investments.ts`)
| Função | Descrição |
|---|---|
| `calculateInvestmentsSummary(investments)` | Totais: aplicado, atual, lucro, por tipo de ativo |
| `calculateInvestmentGain(investment)` | Calcula ganho percentual e absoluto |

### Debts (`debts.ts`)
| Função | Descrição |
|---|---|
| `calculateDebtProgress(debt)` | Progresso: pago, restante, percentual |
| `calculateDebtsSummary(debts)` | Resumo geral das dívidas |
| `calculateInstallmentPayoff(debt)` | Projeção de quitação |

### Retirement (`retirement.ts`)
| Função | Descrição |
|---|---|
| `calculateCompoundGrowth(principal, rate, years)` | Crescimento composto |
| `getRegressiveRate(years)` | Taxa regressiva IR (VGBL/PGBL): 30%→15% |
| `applyRegressiveTax(gain, years)` | Aplica imposto regressivo |
| `calculateNetResult(gross, tax)` | Resultado líquido |
| `runSimulation(params)` | Simulação completa: aporte mensal, tempo, rendimento, taxação |

---

## Utilitários (`lib/`)

### Format (`format.ts`)
| Função | Descrição |
|---|---|
| `formatCurrency(value)` | Formata valor em R$ |
| `formatDate(date)` | Formata data (dd/MM/yyyy) |
| `formatDateFull(date)` | Formata data por extenso |
| `formatPercentage(value)` | Formata percentual |
| `getMonthName(month)` | Nome do mês em português |
| `getMonthAbbr(month)` | Abreviação do mês |
| `getDefaultTransactionDate()` | Data padrão para nova transação |

### Utils (`utils.ts`)
| Função | Descrição |
|---|---|
| `cn(...inputs)` | clsx + tailwind-merge para classes |

### Validations (`lib/validations/`)
| Schema | Uso |
|---|---|
| `loginSchema` | Login: email + password |
| `registerSchema` | Cadastro: name + email + password + confirm + optional invite_code |
| `transactionSchema` | Transação: type, amount, description, date, category, payment_method |
| `updateRecurringBillSchema` | Atualização de conta |
| `goalSchema` / `updateGoalSchema` / `addGoalAmountSchema` | Metas financeiras |
| `investmentSchema` | Investimentos |
| `debtSchema` | Dívidas |
| `creditCardSchema` | Cartões de crédito |
| `recurringIncomeSchema` | Rendas recorrentes |

---

## Componentes

### Layout (`components/layout/`)
| Componente | Descrição |
|---|---|
| `Sidebar` | Desktop (colapsável, expande no hover) + mobile (slide-in). 11 itens de nav + config + logout |
| `Header` | Top bar sticky: hamburger mobile, Logo, MonthSelector, toggle visibilidade saldo, toggle tema, avatar |
| `MonthSelector` | Navegação mês/ano via URL search params `?month=X&year=Y` |
| `BottomNav` | Nav mobile: 4 itens principais + overlay "Mais" com 8+ itens |
| `MainContent` | Container que ajusta padding baseado no estado da sidebar |
| `Backdrop` | Overlay semi-transparente quando sidebar mobile aberta |
| `HeaderThemeToggle` | Toggle light/dark com persistência via cookie |

### Dashboard (`components/dashboard/`)
| Componente | Descrição |
|---|---|
| `MonthlyBudgetCard` | Card hero: saldo do mês, gasto vs orçamento, barra de progresso. Gradiente `#0F1115 → #2D2F36` |
| `SummaryCards` | Grid 4 cards: receitas, despesas, saldo, contas pendentes |
| `RecentTransactions` | Últimas 5 transações com ícones de categoria |
| `UpcomingBills` | Próximas 3 contas com status computed |
| `AlertsPanel` | Alertas warning/danger: contas atrasadas, orçamento estourado, limite cartão |
| `QuickAddTransaction` | FAB para adicionar transação rápido do dashboard |
| `ExpensePieChart` | Gráfico pizza de despesas por categoria |

### Transações (`components/transacoes/`)
| Componente | Descrição |
|---|---|
| `TransactionsClient` | Página completa de transações com filtros |
| `TransactionList` | Lista scrollável agrupada por data |
| `NewTransactionModal` | Modal formulário criar/editar transação com suporte a parcelas |
| `TransactionDetailModal` | Modal de detalhes da transação |
| `FAB` | Botão flutuante para adicionar transação (mobile) |

### Contas (`components/contas/`)
| Componente | Descrição |
|---|---|
| `ContasClient` | Página: contas do mês, histórico, rendas recorrentes |
| `NewBillModal` | Modal criar/editar conta recorrente (fixa ou parcelada) |
| `BillsHistory` | Histórico 6 meses com barras de progresso |
| `RecurringIncomeSection` | Gerenciamento de rendas recorrentes |

### Outros Componentes de Feature
| Componente | Descrição |
|---|---|
| `FaturasClient` | Visualização de faturas agrupadas por cartão |
| `MetasClient` | CRUD de metas financeiras com progresso e depósitos |
| `InvestimentosClient` | Carteira de investimentos com resumo e por-meta |
| `SimuladorClient` | Simulador de aposentadoria com crescimento composto e imposto regressivo |
| `DividasClient` | Controle de dívidas com pagamento de parcelas e visualização de progresso |
| `RelatoriosClient` | Relatórios: breakdown por categoria, evolução mensal, planejado vs real |
| `PrintButton` | Dispara `window.print()` para impressão |
| `PlanejamentoClient` | Planejamento orçamentário: definir renda, planejar por categoria |
| `CategoryDetailPanel` | Painel de drill-down por categoria no planejamento |
| `CalendarioClient` | Calendário mensal com eventos (transações, contas, datas de cartão) |
| `DayDetailPanel` | Painel lateral com eventos do dia selecionado |
| `ValorRealClient` | Calculadora de valor/hora |

### Shared (`components/shared/`)
| Componente | Descrição |
|---|---|
| `Logo` | SVG casa geométrica com variantes light/dark/auto |
| `PageHeader` | Header padrão de página (título + descrição) |
| `PageCard` | Wrapper de card com estilo consistente |
| `StatusBadge` | Badge colorido para status |
| `ProgressBar` | Barra de progresso animada com percentual |
| `LoadingSkeleton` | Skeleton loader |
| `PersonAvatar` | Avatar do usuário (imagem ou iniciais) |
| `EmptyState` | Placeholder de estado vazio |
| `CategoryIcon` | Ícone de categoria com cor de fundo |
| `MoneyDisplay` | Valor formatado com opção de ocultar saldo |

### Configurações (`components/configuracoes/`)
| Componente | Descrição |
|---|---|
| `ThemeToggle` | Seletor de tema |
| `PasswordManager` | Formulário trocar senha |
| `HouseholdMembers` | Lista de membros do household |
| `DangerZone` | Limpar dados + deletar conta |
| `CreditCardsManager` | CRUD de cartões de crédito |
| `CategoryManager` | CRUD de categorias customizadas |

---

## Contextos React

### SidebarContext (`lib/sidebar-context.tsx`)
- **Estado:** `isExpanded`, `isHovered`, `isMobileOpen`
- **Ações:** `toggleExpanded`, `setIsHovered`, `toggleMobile`, `closeMobile`
- **Usado por:** Sidebar, Header, MainContent, Backdrop

### BalanceVisibilityContext (`lib/balance-visibility-context.tsx`)
- **Estado:** `isHidden`
- **Ações:** `toggle`
- **Helper:** `hideValue(value)` — retorna mascarado ou real
- **Usado por:** Header, MoneyDisplay, MonthlyBudgetCard, SummaryCards

---

## Padrões de Data Fetching

### Padrão: Server Components + Server Actions
```
Server Component (page.tsx)
  --> getCurrentUserHousehold()        [Supabase auth + Prisma user lookup]
  --> Promise.all([query1, query2...])  [Queries Prisma paralelas]
  --> Serializar dados (Decimal->number, Date->ISO string)
  --> Passar para Client Component como props

Client Component ('use client')
  --> Exibe dados
  --> Ao interagir: chama Server Action
  --> Server Action: valida (Zod) --> Prisma mutation --> revalidatePath()
  --> Next.js re-fetcha server components afetadas
```

### Características
1. **Todas as queries rodam no servidor** — zero fetch/axios no client
2. **Busca paralela** com `Promise.all()` em todas as páginas
3. **Isolamento por household** — toda query filtra por `household_id`
4. **Queries conscientes de billing** — transações batem com `billing_month/year` OU range de data
5. **Cálculo de recorrência** — contas/rendas computadas por mês baseado no padrão
6. **Soft deletes** — contas, cartões, rendas usam `is_active = false`
7. **Invalidação de cache** — `revalidatePath()` em toda server action
8. **Fronteira de serialização** — Prisma Decimal -> Number, Date -> ISO string na camada de query

### Arquitetura de Queries
```
lib/db/queries/     -- Queries Prisma (camada de acesso a dados)
lib/calculations/   -- Funções puras de cálculo (lógica de negócio)
app/actions/        -- Server actions (validação + mutation + revalidation)
app/(dashboard)/*   -- Server pages (composição + data fetching)
components/*        -- Client components (UI + interatividade)
```

---

## Layout do Dashboard

```
app/(dashboard)/layout.tsx
  └─ SidebarProvider
       └─ BalanceVisibilityProvider
            ├─ Sidebar (desktop + mobile)
            ├─ Backdrop (mobile overlay)
            └─ MainContent
                 ├─ Header (sticky top)
                 │    ├─ Mobile hamburger
                 │    ├─ Logo
                 │    ├─ MonthSelector (centered)
                 │    ├─ Balance toggle
                 │    ├─ Theme toggle
                 │    └─ User avatar → /configuracoes
                 ├─ <main> {children}
                 └─ BottomNav (mobile)
```

---

## Layout de Autenticação

```
app/(auth)/layout.tsx
  └─ Split-screen:
       ├─ Left: formulário (Login/Cadastro/Reset)
       └─ Right: painel escuro com Logo + ícones de features
```

---

## Middleware (`middleware.ts`)

```
1. Cria cliente Supabase SSR com cookies
2. Verifica supabase.auth.getUser()
3. Rotas públicas: /login, /cadastro
4. Não autenticado + rota protegida → redirect /login
5. Autenticado + rota pública → redirect /
```

---

## Manifest PWA (`app/manifest.ts`)

- Nome: "Financasa"
- Theme color: #0F1115
- Background: #FFFFFF
- Display: standalone
- Ícones em `/financasa-icons/` (72px a 512px + maskable)

---

## Categorias Padrão (12)

1. 🍔 Alimentação
2. 🚗 Transporte
3. 🏠 Moradia
4. 🏥 Saúde
5. 📚 Educação
6. 🎮 Lazer
7. 👔 Vestuário
8. ⚙️ Serviços
9. 📈 Investimentos
10. 💰 Rendas
11. 💵 Outras Receitas
12. 📦 Outros Gastos
