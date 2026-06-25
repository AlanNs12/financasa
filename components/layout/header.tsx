'use client'

import { MonthSelector } from './month-selector'
import { useAuthStore } from '@/store/auth-store'
import { User } from 'lucide-react'

export function Header() {
  const { userName } = useAuthStore()

  return (
    <header className="sticky top-0 z-20 bg-[#f8f9fa] border-b border-gray-200 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <MonthSelector />
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
