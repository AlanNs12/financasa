'use client'

import { Suspense } from 'react'
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { MonthSelector } from './month-selector'
import { PersonAvatar } from '@/components/shared/person-avatar'
import { useSidebar } from '@/lib/sidebar-context'
import { Logo } from '@/components/shared/logo'

function MonthSelectorFallback() {
  const now = new Date()
  const label = now.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
  return (
    <div className="flex items-center gap-1 rounded-xl border border-border
                    bg-background px-1 py-1 shadow-theme-xs">
      <div className="w-7 h-7 flex items-center justify-center rounded-lg">
        <ChevronLeft size={16} className="text-muted-foreground" />
      </div>
      <span className="min-w-[120px] text-center text-sm font-semibold
                       text-foreground uppercase tracking-wide px-2">
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

  return (
    <header className="sticky top-0 z-[30] flex h-16 items-center gap-3
                       border-b border-border bg-card/80 backdrop-blur-sm
                       px-4 lg:px-6">

      <button
        onClick={toggleMobile}
        aria-label="Abrir menu"
        className="lg:hidden w-9 h-9 flex items-center justify-center
                   rounded-lg text-muted-foreground hover:bg-muted
                   transition-colors shrink-0"
      >
        <Menu size={20} />
      </button>

      <Link href="/"
            className="lg:hidden flex items-center gap-2 shrink-0">
        <Logo size={24} variant="auto"
              className="text-primary" />
      </Link>

      <div className="flex-1 flex items-center justify-center lg:justify-start">
        <Suspense fallback={<MonthSelectorFallback />}>
          <MonthSelector />
        </Suspense>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Link
          href="/configuracoes"
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5
                     hover:bg-muted transition-colors group"
        >
          <PersonAvatar
            user={user ? { name: user.name, avatar_url: user.avatarUrl } : null}
            size="sm"
          />
          <span className="hidden md:block text-sm font-medium text-foreground
                           max-w-[160px] truncate group-hover:text-primary
                           transition-colors">
            {user?.name || 'Usuário'}
          </span>
        </Link>
      </div>
    </header>
  )
}
