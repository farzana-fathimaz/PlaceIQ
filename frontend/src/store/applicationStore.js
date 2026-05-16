import { create } from 'zustand'

export const useApplicationStore = create((set) => ({
  applications: [],
  pagination:   null,
  stats:        null,

  setApplications: (applications, pagination) => set({ applications, pagination }),
  setStats:        (stats)                     => set({ stats }),
  updateOneApplication: (id, updated) =>
    set((s) => ({
      applications: s.applications.map((a) =>
        a._id === id ? { ...a, ...updated } : a
      ),
    })),
}))