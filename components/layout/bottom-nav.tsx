'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowLeftRight, Receipt, Banknote, Grid3x3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/contas', label: 'Contas', icon: Receipt },
  { href: '/planejamento', label: 'Planejar', icon: Banknote },
]

const MORE_ITEMS = [
  { href: '/metas', label: 'Metas', icon: '🎯' },
  { href: '/investimentos', label: 'Investimentos', icon: '📈' },
  { href: '/dividas', label: 'Dívidas', icon: '💳' },
  { href: '/relatorios', label: 'Relatórios', icon: '📊' },
  { href: '/configuracoes', label: 'Config.', icon: '⚙️' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-[30] lg:hidden bg-card/95 backdrop-blur-sm border-t border-border safe-area-bottom">
        <div className="flex items-center h-16">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
              >
                <Icon
                  size={22}
                  className={
                    isActive ? 'text-brand-500' : 'text-muted-foreground'
                  }
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-brand-500' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </Link>
            )
          })}

          <button
            onClick={() => setShowMore(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
            aria-label="Ver mais opções"
          >
            <Grid3x3
              size={22}
              className="text-muted-foreground"
              strokeWidth={1.8}
            />
            <span className="text-[10px] font-medium text-muted-foreground">
              Mais
            </span>
          </button>
        </div>
      </nav>

      {showMore && (
        <div
          className="fixed inset-0 z-[50] lg:hidden"
          onClick={() => setShowMore(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 inset-x-0 bg-card rounded-t-3xl border-t border-border p-4 pb-8 safe-area-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />

            <div className="grid grid-cols-3 gap-3 mb-4">
              {MORE_ITEMS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMore(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/60 hover:bg-muted transition-colors"
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs font-medium text-foreground">
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-error-500 hover:bg-error-50 transition-colors"
              >
                Sair da conta
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
