import { create } from 'zustand'

export const useStudentStore = create((set) => ({
  students: [],
  pagination: null,
  selectedStudent: null,
  filters: {
    search: '',
    branch: '',
    batch: '',
    placementStatus: '',
    minCGPA: '',
    maxCGPA: '',
  },

  setStudents: (students, pagination) => set({ students, pagination }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () =>
    set({
      filters: {
        search: '',
        branch: '',
        batch: '',
        placementStatus: '',
        minCGPA: '',
        maxCGPA: '',
      },
    }),
}))