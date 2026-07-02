'use client'

import { useState, useTransition } from 'react'
import { Sun, Moon } from 'lucide-react'
import { setThemeAction } from '@/app/actions/theme'
import { cn } from '@/lib/utils'

function getInitialTheme(): 'light' | 'dark' {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }
  return 'light'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)
  const [isPending, startTransition] = useTransition()

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    startTransition(() => setThemeAction(newTheme))
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      disabled={isPending}
      className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-accent dark:hover:bg-gray-800 transition-colors w-full text-left disabled:opacity-50"
    >
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
        isDark ? 'bg-gray-800' : 'bg-amber-50'
      )}>
        {isDark ? (
          <Moon className="w-5 h-5 text-gray-300" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground dark:text-gray-100">Tema</p>
        <p className="text-xs text-muted-foreground dark:text-gray-500">
          {isDark ? 'Escuro' : 'Claro'}
        </p>
      </div>
      <div className={cn(
        'relative w-11 h-6 rounded-full transition-colors shrink-0',
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      )}>
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform',
            isDark ? 'translate-x-[22px]' : 'translate-x-0.5'
          )}
        />
      </div>
    </button>
  )
}
