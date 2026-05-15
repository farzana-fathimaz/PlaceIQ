import { create } from 'zustand'

export const useDriveStore = create((set) => ({
  drives:     [],
  pagination: null,
  stats:      null,
  filters: {
    search:  '',
    status:  '',
    type:    '',
    company: '',
  },

  setDrives:     (drives, pagination) => set({ drives, pagination }),
  setStats:      (stats)              => set({ stats }),
  setFilters:    (f)                  => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters:  ()                   => set({ filters: { search: '', status: '', type: '', company: '' } }),
}))