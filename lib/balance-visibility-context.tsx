'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'

interface BalanceVisibilityContextType {
  isHidden: boolean
  toggle: () => void
  hideValue: (value: string) => ReactNode
}

const BalanceVisibilityCtx =
  createContext<BalanceVisibilityContextType | null>(null)

export function BalanceVisibilityProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isHidden, setIsHidden] = useState(false)
  const toggle = useCallback(() => setIsHidden((p) => !p), [])
  const hideValue = useCallback(
    (value: string) =>
      isHidden ? (
        <span className="tracking-widest text-muted-foreground transition-all duration-200">
          ••••••
        </span>
      ) : (
        <span className="transition-all duration-200">{value}</span>
      ),
    [isHidden]
  )

  return (
    <BalanceVisibilityCtx value={{ isHidden, toggle, hideValue }}>
      {children}
    </BalanceVisibilityCtx>
  )
}

export function useBalanceVisibility() {
  const ctx = useContext(BalanceVisibilityCtx)
  if (!ctx)
    throw new Error(
      'useBalanceVisibility must be used within BalanceVisibilityProvider'
    )
  return ctx
}
