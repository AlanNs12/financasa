import { signOut } from '@/app/actions/auth'
import { getCurrentUserHousehold, getHouseholdInviteCode } from '@/lib/db/queries/user'
import { getCreditCards } from '@/lib/db/queries/credit-cards'
import { CopyButton } from './copy-button'
import { CreditCardsManager } from '@/components/configuracoes/credit-cards-manager'
import { ThemeToggle } from '@/components/configuracoes/theme-toggle'

export default async function ConfiguracoesPage() {
  const current = await getCurrentUserHousehold()
  const inviteCode = current ? await getHouseholdInviteCode(current.householdId) : null
  const creditCards = current ? await getCreditCards(current.householdId, true) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Configurações</h1>
        <p className="text-sm text-gray-500">Gerencie sua conta e casa</p>
      </div>

      {inviteCode && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Código de convite</h2>
          <p className="text-xs text-gray-500 mb-3">
            Compartilhe este código com seu parceiro(a) para que ele(a) entre na sua casa
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-center text-2xl font-bold tracking-[0.3em] bg-gray-50 rounded-xl py-3 text-gray-900 font-mono">
              {inviteCode}
            </code>
            <CopyButton code={inviteCode} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Aparência</h2>
        <ThemeToggle />
      </div>

      <CreditCardsManager cards={creditCards} />

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Conta</h2>
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
  )
}
