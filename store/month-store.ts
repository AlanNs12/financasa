import { create } from 'zustand'

interface MonthState {
  month: number
  year: number
  setMonth: (month: number) => void
  setYear: (year: number) => void
  setMonthYear: (month: number, year: number) => void
  nextMonth: () => void
  prevMonth: () => void
}

const now = new Date()

export const useMonthStore = create<MonthState>((set) => ({
  month: now.getMonth() + 1,
  year: now.getFullYear(),
  setMonth: (month) => set({ month }),
  setYear: (year) => set({ year }),
  setMonthYear: (month, year) => set({ month, year }),
  nextMonth: () =>
    set((state) => {
      if (state.month === 12) {
        return { month: 1, year: state.year + 1 }
      }
      return { month: state.month + 1 }
    }),
  prevMonth: () =>
    set((state) => {
      if (state.month === 1) {
        return { month: 12, year: state.year - 1 }
      }
      return { month: state.month - 1 }
    }),
}))
