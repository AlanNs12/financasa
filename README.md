# Financasa

App web privado de controle financeiro familiar.

## Stack

Next.js 16, React 19, Prisma 6, Supabase, Tailwind v4, Zustand, RHF + Zod.

## Getting Started

### Pré-requisitos

- Node.js 20+
- PostgreSQL
- Conta no Supabase

### Instalação

```bash
npm install
```

Configure as variáveis de ambiente no `.env`:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Banco de dados

Para aplicar o schema e popular dados de exemplo:

```bash
npm run db:push && npm run db:seed
```

- `db:push` — aplica o schema Prisma no banco (cria/atualiza tabelas).
- `db:seed` — popula 1 household de exemplo ("Casa de Teste") com 2 usuários,
  12 categorias padrão, ~15 transações nos últimos 3 meses, 4 contas
  recorrentes, 1 orçamento do mês atual e 2 metas financeiras.

> **Nota sobre o seed:** os usuários criados pelo seed **não** existem no
> Supabase Auth — eles são criados apenas no Prisma para fins de
> desenvolvimento. O fluxo principal de cadastro via `/cadastro` continua
> sendo o recomendado para usuários reais.

### Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

## Testes

Os testes usam [Vitest](https://vitest.dev/) e cobrem funções puras de cálculo e validação (sem dependência de banco de dados ou rede).

### Rodar os testes

```bash
npm run test          # roda uma vez
npm run test:watch    # modo watch (reexecuta ao salvar)
```

### Convenção

Arquivos de teste ficam ao lado do arquivo testado, com sufixo `.test.ts`:

```
lib/format.ts                → lib/format.test.ts
lib/calculations/retirement.ts → lib/calculations/retirement.test.ts
lib/validations/goal.ts      → lib/validations/goal.test.ts
```

### Cobertura atual

- `lib/calculations/retirement.ts` — juros compostos, tabela regressiva de IR, cenários VGBL/PGBL/Outros.
- `lib/calculations/debts.ts` — paid_amount, remaining_amount, progress_pct, payoff de parcelas.
- `lib/calculations/investments.ts` — resumo da carteira, % por tipo de ativo, ganho individual.
- `lib/format.ts` — formatCurrency, formatPercentage, getMonthName, getMonthAbbr.
- `lib/validations/*.ts` — todos os schemas Zod (transaction, investment, goal, debt, credit-card, bill, auth, budget).

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Lint com ESLint |
| `npm run test` | Roda os testes uma vez |
| `npm run test:watch` | Testes em modo watch |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:push` | Aplica o schema no banco |
| `npm run db:seed` | Popula dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio |

## Segurança — Row Level Security (RLS)

### Arquitetura de segurança em duas camadas

O projeto usa **duas camadas de proteção** para isolamento de dados entre
households (casas):

1. **Camada de aplicação (Prisma)** — toda query no backend filtra por
   `household_id` obtido via `getCurrentUserHousehold()`, que cruza o
   usuário autenticado do Supabase Auth com a tabela `User` no Prisma. Esta
   é a camada **primária** e está ativa hoje.

2. **Camada de banco (RLS no Supabase)** — policies de Row Level Security
   no PostgreSQL que isolam dados por `household_id` usando `auth.uid()`.
   Esta é a camada **secundária** (defense in depth), ativada via script SQL
   manual.

### Limitação importante do RLS

**O RLS NÃO protege o acesso via Prisma.** O Prisma se conecta ao Postgres
via `DATABASE_URL`/`DIRECT_URL` com o role `postgres` (superusuário) ou
`service_role`, que **bypassa RLS** por design no Supabase. Isso é esperado
e aceitável — a camada de aplicação já filtra os dados corretamente.

O RLS protege contra:
- Vazamento da `anon key` do Supabase (o role `anon` é restrito pelas
  policies).
- Uso futuro do client `supabase-js` no browser com a `anon key`
  (não usado hoje, mas pode ser adicionado para features em tempo real).
- Acesso direto ao Postgres via SQL Editor com role `authenticated`.

### Como aplicar o RLS

O script SQL está em `prisma/sql/enable_rls.sql`. **Não é aplicado
automaticamente** — deve ser revisado e executado manualmente no SQL Editor
do Supabase Dashboard:

1. Abra o Supabase Dashboard → SQL Editor.
2. Cole o conteúdo de `prisma/sql/enable_rls.sql`.
3. Revise cada policy.
4. Execute.

O script:
- Habilita RLS em todas as 13 tabelas com dados de household.
- Cria uma função helper `auth.current_household_id()` que retorna o
  `household_id` do usuário autenticado.
- Cria policies que permitem SELECT/INSERT/UPDATE/DELETE apenas quando o
  `household_id` da linha corresponde ao do usuário autenticado.
- Trata `Category` especialmente: SELECT permite `household_id IS NULL`
  (categorias padrão globais), mas escrita só para categorias do próprio
  household.
- Tabelas sem `household_id` direto (`BillMonthlyStatus`, `BudgetItem`,
  `BudgetGoal`) são filtradas via FK indireto.

### Como reverter

Cada policy pode ser removida com `DROP POLICY`, e o RLS desabilitado com
`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`. Veja as instruções no final
do arquivo `prisma/sql/enable_rls.sql`.
