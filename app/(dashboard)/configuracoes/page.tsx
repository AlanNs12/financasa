import { signOut } from '@/app/actions/auth'
import { getCurrentUserHousehold, getHouseholdInviteCode, getHouseholdMembers } from '@/lib/db/queries/user'
import { getCreditCards } from '@/lib/db/queries/credit-cards'
import { getCategories } from '@/lib/db/queries/categories'
import { CopyButton } from './copy-button'
import { CreditCardsManager } from '@/components/configuracoes/credit-cards-manager'
import { CategoryManager } from '@/components/configuracoes/category-manager'
import { ThemeToggle } from '@/components/configuracoes/theme-toggle'
import { HouseholdMembers } from '@/components/configuracoes/household-members'
import { PasswordManager } from '@/components/configuracoes/password-manager'
import { DangerZone } from '@/components/configuracoes/danger-zone'
import { PageHeader } from '@/components/shared/page-header'

export default async function ConfiguracoesPage() {
  const current = await getCurrentUserHousehold()
  const [inviteCode, creditCards, members, categories] = current
    ? await Promise.all([
        getHouseholdInviteCode(current.householdId),
        getCreditCards(current.householdId, true),
        getHouseholdMembers(current.householdId),
        getCategories(current.householdId),
      ])
    : [null, [], [], []]

  const clientCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    type: c.type,
    is_default: c.is_default,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie sua conta e casa" />

      {inviteCode && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Código de convite</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Compartilhe este código com seu parceiro(a) para que ele(a) entre na sua casa
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-center text-2xl font-bold tracking-[0.3em] bg-muted rounded-xl py-3 text-foreground font-mono">
              {inviteCode}
            </code>
            <CopyButton code={inviteCode} />
          </div>
        </div>
      )}

      {current && members.length > 0 && (
        <HouseholdMembers members={members} currentUserId={current.userId} />
      )}

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Aparência</h2>
        <ThemeToggle />
      </div>

      <CreditCardsManager cards={creditCards} />

      <CategoryManager categories={clientCategories} />

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Conta</h2>
        <div className="space-y-3">
          <PasswordManager />
          <form action={signOut}>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium text-sm hover:bg-red-100 transition-colors"
            >
              Sair da conta
            </button>
          </form>
        </div>
      </div>

      <DangerZone />
    </div>
  )
}
