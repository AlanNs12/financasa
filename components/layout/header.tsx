'use client'

import { Suspense } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthSelector } from './month-selector'
import { PersonAvatar } from '@/components/shared/person-avatar'

function MonthSelectorFallback() {
  const now = new Date()
  const label = now.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5">
        <ChevronLeft className="w-4 h-4 text-gray-300" />
      </div>
      <span className="text-sm font-semibold text-gray-400 min-w-[90px] text-center">
        {label} {now.getFullYear()}
      </span>
      <div className="p-1.5">
        <ChevronRight className="w-4 h-4 text-gray-300" />
      </div>
    </div>
  )
}

interface HeaderProps {
  user?: { name: string; avatarUrl: string | null } | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-[#f8f9fa] border-b border-gray-200 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <Suspense fallback={<MonthSelectorFallback />}>
          <MonthSelector />
        </Suspense>
        <div className="flex items-center gap-2">
          <PersonAvatar
            user={user ? { name: user.name, avatar_url: user.avatarUrl } : null}
            size="md"
          />
          <span className="text-sm text-gray-600 hidden sm:block">
            {user?.name || 'Usuário'}
          </span>
        </div>
      </div>
    </header>
  )
}
