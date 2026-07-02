'use client'

import { useSidebar } from '@/lib/sidebar-context'

export function Backdrop() {
  const { isMobileOpen, closeMobile } = useSidebar()

  if (!isMobileOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[40] lg:hidden"
      onClick={closeMobile}
      aria-hidden="true"
    />
  )
}
