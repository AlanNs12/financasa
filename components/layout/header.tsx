'use client'

import { Suspense } from 'react'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { MonthSelector } from './month-selector'
import { PersonAvatar } from '@/components/shared/person-avatar'
import { useSidebar } from '@/lib/sidebar-context'

function MonthSelectorFallback() {
  const now = new Date()
  const label = now.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5">
        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-semibold text-muted-foreground min-w-[90px] text-center">
        {label} {now.getFullYear()}
      </span>
      <div className="p-1.5">
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
    <header className="sticky top-0 z-20 bg-background border-b border-border px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMobile}
            aria-label="Abrir menu"
            className="lg:hidden w-10 h-10 flex items-center justify-center
                       rounded-lg hover:bg-muted transition-colors"
          >
            <Menu size={20} className="text-muted-foreground" />
          </button>
          <Suspense fallback={<MonthSelectorFallback />}>
            <MonthSelector />
          </Suspense>
        </div>
        <div className="flex items-center gap-2">
          <PersonAvatar
            user={user ? { name: user.name, avatar_url: user.avatarUrl } : null}
            size="md"
          />
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.name || 'Usuário'}
          </span>
        </div>
      </div>
    </header>
  )
}
