import { create } from 'zustand'

export const useAnalyticsStore = create((set) => ({
  summary:       null,
  branchWise:    [],
  companyWise:   [],
  driveWise:     [],
  monthlyTrend:  [],
  cgpaDistrib:   [],
  topPerformers: [],
  recentActivity: null,
  lastFetched:   null,

  setSummary:        (d) => set({ summary: d }),
  setBranchWise:     (d) => set({ branchWise: d }),
  setCompanyWise:    (d) => set({ companyWise: d }),
  setDriveWise:      (d) => set({ driveWise: d }),
  setMonthlyTrend:   (d) => set({ monthlyTrend: d }),
  setCGPADistrib:    (d) => set({ cgpaDistrib: d }),
  setTopPerformers:  (d) => set({ topPerformers: d }),
  setRecentActivity: (d) => set({ recentActivity: d }),
  setLastFetched:    ()  => set({ lastFetched: Date.now() }),
}))