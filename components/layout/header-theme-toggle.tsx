'use client'

import { useSyncExternalStore, useTransition } from 'react'
import { Sun, Moon } from 'lucide-react'
import { setThemeAction } from '@/app/actions/theme'

function subscribe(callback: () => void) {
  window.addEventListener('themechange', callback)
  return () => window.removeEventListener('themechange', callback)
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot() {
  return false
}

export function HeaderThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [, startTransition] = useTransition()

  function toggle() {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    window.dispatchEvent(new Event('themechange'))
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
