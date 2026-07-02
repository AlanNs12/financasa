'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface SidebarContextType {
  isExpanded: boolean
  isHovered: boolean
  isMobileOpen: boolean
  toggleExpanded: () => void
  setIsHovered: (v: boolean) => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleExpanded = useCallback(() => setIsExpanded((p) => !p), [])
  const toggleMobile = useCallback(() => setIsMobileOpen((p) => !p), [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  return (
    <SidebarContext
      value={{
        isExpanded,
        isHovered,
        isMobileOpen,
        toggleExpanded,
        setIsHovered,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
