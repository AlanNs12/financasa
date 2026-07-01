'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Target,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/transacoes', icon: ArrowLeftRight, label: 'Transações' },
  { href: '/contas', icon: Receipt, label: 'Contas' },
  { href: '/planejamento', icon: Target, label: 'Planej.' },
]

const moreItems = [
  { href: '/metas', icon: Trophy, label: 'Metas' },
  { href: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
  { href: '/dividas', icon: TrendingDown, label: 'Dívidas' },
  { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
]

function isPathActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== '/' && pathname.startsWith(href))
}

export function BottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreActive = moreItems.some((item) => isPathActive(pathname, item.href))

  function closeMore() {
    setMoreOpen(false)
  }

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = isPathActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-0 flex-1 transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            )
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-2 py-1 min-w-0 flex-1 transition-colors',
              moreActive ? 'text-foreground' : 'text-muted-foreground'
            )}
            aria-label="Mais opções"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeMore} />
          <div className="relative bg-card rounded-t-3xl w-full p-4 pb-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-base font-bold text-foreground">Mais</h2>
              <button
                onClick={closeMore}
                className="p-1 rounded-lg hover:bg-accent"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {moreItems.map((item) => {
                const isActive = isPathActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMore}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-foreground'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
              <form action={signOut} className="pt-1">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
