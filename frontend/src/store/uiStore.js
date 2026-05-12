import { create } from 'zustand'

export const useUiStore = create((set) => ({
  toasts: [],
  isPageLoading: false,

  addToast: (message, type = 'info') => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  showSuccess: (message) => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'success' }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },

  showError: (message) => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { id, message, type: 'error' }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 5000)
  },

  setPageLoading: (val) => set({ isPageLoading: val }),
}))