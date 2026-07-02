'use client'

import { useSidebar } from '@/lib/sidebar-context'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered } = useSidebar()
  const showWide = isExpanded || isHovered

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        showWide ? 'lg:pl-[290px]' : 'lg:pl-[88px]'
      }`}
    >
      {children}
    </div>
  )
}
