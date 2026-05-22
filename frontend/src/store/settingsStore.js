import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  settings:        null,
  isSetupComplete: false,

  setSettings: (settings, isSetupComplete) =>
    set({ settings, isSetupComplete: !!isSetupComplete }),

  updateSettings: (settings) => set({ settings, isSetupComplete: true }),
}))