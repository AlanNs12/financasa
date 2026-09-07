'use client'

import { Suspense } from 'react'
import { Menu, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { MonthSelector } from './month-selector'
import { PersonAvatar } from '@/components/shared/person-avatar'
import { HeaderThemeToggle } from './header-theme-toggle'
import { useSidebar } from '@/lib/sidebar-context'
import { useBalanceVisibility } from '@/lib/balance-visibility-context'
import { useMonth } from '@/lib/month-context'
import { Logo } from '@/components/shared/logo'

function MonthSelectorFallback() {
  const now = new Date()
  const label = now.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 rounded-xl border border-border
                    bg-background px-0.5 sm:px-1 py-1 shadow-theme-xs">
      <div className="w-7 h-7 flex items-center justify-center rounded-lg">
        <ChevronLeft size={16} className="text-muted-foreground" />
      </div>
      <span suppressHydrationWarning className="text-center text-xs sm:text-sm font-semibold
                       text-foreground uppercase tracking-wide px-1 sm:px-2 whitespace-nowrap">
        {label} {now.getFullYear()}
      </span>
      <div className="w-7 h-7 flex items-center justify-center rounded-lg">
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </div>
  )
}

interface HeaderProps {
  user?: { name: string; avatarUrl: string | null } | null
}

export function Header({ user }: HeaderProps) {
  const { toggleMobile } = useSidebar()
  const { isHidden, toggle } = useBalanceVisibility()
  const { getHref } = useMonth()

  return (
    <header className="sticky top-0 z-[30] flex h-14 sm:h-16 items-center gap-2 sm:gap-3
                       border-b border-border bg-card/80 backdrop-blur-sm
                       px-3 sm:px-4 lg:px-6">

      <button
        onClick={toggleMobile}
        aria-label="Abrir menu"
        className="lg:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center
                   rounded-lg text-muted-foreground hover:bg-muted
                   transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>

      <Link href={getHref('/')}
            className="lg:hidden flex items-center shrink-0">
        <Logo size={22} variant="auto"
              className="text-primary" />
      </Link>

      <div className="flex-1 flex items-center justify-center lg:justify-start min-w-0 overflow-hidden">
        <Suspense fallback={<MonthSelectorFallback />}>
          <MonthSelector />
        </Suspense>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          onClick={toggle}
          aria-label={isHidden ? 'Mostrar saldos' : 'Esconder saldos'}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg
                     text-muted-foreground hover:bg-muted hover:text-foreground
                     transition-colors"
        >
          {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <HeaderThemeToggle />
        <Link
          href={getHref('/configuracoes')}
          className="flex items-center rounded-lg p-1.5
                     hover:bg-muted transition-colors group"
        >
          <PersonAvatar
            user={user ? { name: user.name, avatar_url: user.avatarUrl } : null}
            size="sm"
          />
          <span className="hidden md:block text-sm font-medium text-foreground
                           max-w-[160px] truncate group-hover:text-primary
                           transition-colors ml-2">
            {user?.name || 'Usuário'}
          </span>
        </Link>
      </div>
    </header>
  )
}
