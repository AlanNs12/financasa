'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useSearchParams } from 'next/navigation'

interface MonthContextType {
  month: number
  year: number
  setMonth: (month: number, year: number) => void
  getHref: (path: string) => string
}

const MonthCtx = createContext<MonthContextType | null>(null)

export function MonthProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const now = new Date()

  const [month, setMonth] = useState(
    () => Number(searchParams.get('month')) || now.getMonth() + 1
  )
  const [year, setYear] = useState(
    () => Number(searchParams.get('year')) || now.getFullYear()
  )

  const setMonthFn = useCallback((m: number, y: number) => {
    setMonth(m)
    setYear(y)
  }, [])

  const getHref = useCallback(
    (path: string) => {
      return `${path}?month=${month}&year=${year}`
    },
    [month, year]
  )

  return (
    <MonthCtx value={{ month, year, setMonth: setMonthFn, getHref }}>
      {children}
    </MonthCtx>
  )
}

export function useMonth() {
  const ctx = useContext(MonthCtx)
  if (!ctx)
    throw new Error('useMonth must be used within MonthProvider')
  return ctx
}
