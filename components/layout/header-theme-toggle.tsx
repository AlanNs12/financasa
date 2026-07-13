'use client'

import { useState, useTransition } from 'react'
import { Sun, Moon } from 'lucide-react'
import { setThemeAction } from '@/app/actions/theme'

export function HeaderThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  const [, startTransition] = useTransition()

  function toggle() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    startTransition(() => setThemeAction(next ? 'dark' : 'light'))
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="w-9 h-9 flex items-center justify-center rounded-lg
                 text-muted-foreground hover:bg-muted hover:text-foreground
                 transition-colors"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
