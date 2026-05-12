import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setAccessToken: (token) => set({ accessToken: token }),

  login: (user, token) => set({
    user,
    accessToken: token,
    isAuthenticated: true,
    isLoading: false,
  }),

  logout: () => set({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  setLoading: (isLoading) => set({ isLoading }),

  isOfficer: () => get().user?.role === 'officer',
  isStudent: () => get().user?.role === 'student',
}))