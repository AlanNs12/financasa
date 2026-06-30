'use client'

import { Suspense } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MonthSelector } from './month-selector'
import { useAuthStore } from '@/store/auth-store'
import { User } from 'lucide-react'

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

export function Header() {
  const { userName } = useAuthStore()

  return (
    <header className="sticky top-0 z-20 bg-[#f8f9fa] border-b border-gray-200 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <Suspense fallback={<MonthSelectorFallback />}>
          <MonthSelector />
        </Suspense>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-sm text-gray-600 hidden sm:block">
            {userName || 'Usuário'}
          </span>
        </div>
      </div>
    </header>
  )
}
