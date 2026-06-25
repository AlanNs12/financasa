import { create } from 'zustand'

interface AuthState {
  userName: string
  userEmail: string
  setUser: (name: string, email: string) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  userName: '',
  userEmail: '',
  setUser: (name, email) => set({ userName: name, userEmail: email }),
  clearUser: () => set({ userName: '', userEmail: '' }),
}))
