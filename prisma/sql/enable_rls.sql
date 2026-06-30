-- ============================================================================
-- ROW LEVEL SECURITY (RLS) — ISOLAMENTO POR HOUSEHOLD
-- ============================================================================
--
-- PROPÓSITO:
--   Habilita RLS no Supabase para todas as tabelas que contêm dados de
--   household, criando policies que isolam o acesso por household_id do
--   usuário autenticado (via auth.uid() cruzado contra a tabela "User").
--
-- LIMITAÇÃO IMPORTANTE — LEIA ANTES DE USAR:
--   Estas policies NÃO afetam o Prisma, que se conecta via DATABASE_URL/
--   DIRECT_URL com privilégios de service_role (superusuário). RLS no
--   Supabase é bypassado pelo role `service_role` e pelo `postgres` role
--   usado pela connection string privilegiada.
--
--   RLS aqui serve como SEGUNDA CAMADA DE DEFESA (defense in depth) para
--   o caso de:
--     1. Vazamento de DATABASE_URL com role `anon` ou `authenticated`
--        (não service_role).
--     2. Uso futuro do client supabase-js (anon key) no browser para
--        alguma feature — o que NÃO acontece hoje, mas pode ser adicionado.
--     3. Acesso direto ao Postgres via Supabase SQL Editor com role
--        `authenticated`.
--
--   A aplicação backend (Prisma) continua sendo a principal camada de
--   segurança: toda query filtra por household_id via
--   getCurrentUserHousehold(). RLS é complementar, não substitutiva.
--
-- COMO APLICAR:
--   Cole este arquivo no SQL Editor do Supabase Dashboard e execute.
--   NÃO rode via prisma db push ou migração automática — revise cada
--   policy manualmente antes de aplicar em produção.
--
-- COMO TESTAR:
--   Após aplicar, faça login com dois usuários de households diferentes
--   via supabase-js client e confirme que um não vê os dados do outro.
--   O Prisma não é afetado (continue testando o app normalmente).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Helper: função para obter o household_id do usuário autenticado
-- ---------------------------------------------------------------------------
-- Esta função evita repetir a subquery em cada policy.
-- Retorna NULL se não houver usuário autenticado ou não estiver na tabela User.

CREATE OR REPLACE FUNCTION auth.current_household_id()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT household_id FROM "User" WHERE supabase_id = auth.uid()::text LIMIT 1
$$;

-- ---------------------------------------------------------------------------
-- 1. Habilitar RLS em todas as tabelas com dados de household
-- ---------------------------------------------------------------------------

ALTER TABLE "Household"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Category"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RecurringBill"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillMonthlyStatus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BudgetItem"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FinancialGoal"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BudgetGoal"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Investment"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Debt"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditCard"       ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Policies — Household
-- ---------------------------------------------------------------------------
-- O usuário só pode ver/editar a household à qual pertence.

CREATE POLICY "household_select_own"
  ON "Household" FOR SELECT TO authenticated
  USING (
    id = auth.current_household_id()
  );

CREATE POLICY "household_update_own"
  ON "Household" FOR UPDATE TO authenticated
  USING (id = auth.current_household_id())
  WITH CHECK (id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 3. Policies — User
-- ---------------------------------------------------------------------------
-- O usuário pode ver todos os membros do seu household (parceiro, etc.),
-- mas só pode editar o próprio registro.

CREATE POLICY "user_select_household"
  ON "User" FOR SELECT TO authenticated
  USING (
    household_id = auth.current_household_id()
  );

CREATE POLICY "user_update_own"
  ON "User" FOR UPDATE TO authenticated
  USING (
    household_id = auth.current_household_id()
    AND supabase_id = auth.uid()::text
  )
  WITH CHECK (
    household_id = auth.current_household_id()
    AND supabase_id = auth.uid()::text
  );

CREATE POLICY "user_insert_household"
  ON "User" FOR INSERT TO authenticated
  WITH CHECK (
    household_id = auth.current_household_id()
  );

-- ---------------------------------------------------------------------------
-- 4. Policies — Category
-- ---------------------------------------------------------------------------
-- SELECT: permite categorias padrão globais (household_id IS NULL) OU
--         categorias do próprio household.
-- INSERT/UPDATE/DELETE: só para categorias do próprio household (não globais).

CREATE POLICY "category_select_visible"
  ON "Category" FOR SELECT TO authenticated
  USING (
    household_id IS NULL
    OR household_id = auth.current_household_id()
  );

CREATE POLICY "category_modify_own"
  ON "Category" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 5. Policies — Transaction
-- ---------------------------------------------------------------------------

CREATE POLICY "transaction_isolation"
  ON "Transaction" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 6. Policies — RecurringBill
-- ---------------------------------------------------------------------------

CREATE POLICY "recurring_bill_isolation"
  ON "RecurringBill" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 7. Policies — BillMonthlyStatus (sem household_id direto)
-- ---------------------------------------------------------------------------
-- Filtra via recurring_bill_id → RecurringBill.household_id.

CREATE POLICY "bill_monthly_status_isolation"
  ON "BillMonthlyStatus" FOR ALL TO authenticated
  USING (
    recurring_bill_id IN (
      SELECT id FROM "RecurringBill"
      WHERE household_id = auth.current_household_id()
    )
  )
  WITH CHECK (
    recurring_bill_id IN (
      SELECT id FROM "RecurringBill"
      WHERE household_id = auth.current_household_id()
    )
  );

-- ---------------------------------------------------------------------------
-- 8. Policies — Budget
-- ---------------------------------------------------------------------------

CREATE POLICY "budget_isolation"
  ON "Budget" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 9. Policies — BudgetItem (sem household_id direto)
-- ---------------------------------------------------------------------------
-- Filtra via budget_id → Budget.household_id.

CREATE POLICY "budget_item_isolation"
  ON "BudgetItem" FOR ALL TO authenticated
  USING (
    budget_id IN (
      SELECT id FROM "Budget"
      WHERE household_id = auth.current_household_id()
    )
  )
  WITH CHECK (
    budget_id IN (
      SELECT id FROM "Budget"
      WHERE household_id = auth.current_household_id()
    )
  );

-- ---------------------------------------------------------------------------
-- 10. Policies — FinancialGoal
-- ---------------------------------------------------------------------------

CREATE POLICY "financial_goal_isolation"
  ON "FinancialGoal" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 11. Policies — BudgetGoal (sem household_id direto)
-- ---------------------------------------------------------------------------
-- Filtra via user_id → User.household_id.
-- Permite que qualquer membro do household veja as metas de orçamento
-- de todos os membros da casa.

CREATE POLICY "budget_goal_isolation"
  ON "BudgetGoal" FOR ALL TO authenticated
  USING (
    user_id IN (
      SELECT id FROM "User"
      WHERE household_id = auth.current_household_id()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM "User"
      WHERE household_id = auth.current_household_id()
    )
  );

-- ---------------------------------------------------------------------------
-- 12. Policies — Investment
-- ---------------------------------------------------------------------------

CREATE POLICY "investment_isolation"
  ON "Investment" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 13. Policies — Debt
-- ---------------------------------------------------------------------------

CREATE POLICY "debt_isolation"
  ON "Debt" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- 14. Policies — CreditCard
-- ---------------------------------------------------------------------------

CREATE POLICY "credit_card_isolation"
  ON "CreditCard" FOR ALL TO authenticated
  USING (household_id = auth.current_household_id())
  WITH CHECK (household_id = auth.current_household_id());

-- ---------------------------------------------------------------------------
-- FIM
-- ---------------------------------------------------------------------------
-- Após executar este script, todas as 13 tabelas têm RLS habilitado com
-- policies que isolam dados por household.
--
-- Para reverter (em caso de emergência):
--   ALTER TABLE "Transaction" DISABLE ROW LEVEL SECURITY;
--   (repita para cada tabela)
--   DROP FUNCTION IF EXISTS auth.current_household_id();
-- ============================================================================
