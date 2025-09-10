// Zustand store for KPIs and analytics

import { create } from "zustand"
import type { KPI } from "../types"
import { mockAPI } from "../api/mock-server"

interface KPIState {
  kpis: KPI | null
  monsoonMode: boolean
  loading: boolean
  error: string | null

  // Actions
  fetchKPIs: () => Promise<void>
  toggleMonsoonMode: () => Promise<void>
  clearError: () => void
}

export const useKPIStore = create<KPIState>((set) => ({
  kpis: null,
  monsoonMode: false,
  loading: false,
  error: null,

  fetchKPIs: async () => {
    set({ loading: true, error: null })

    try {
      const response = await mockAPI.getKPIs()

      if (response.success && response.data) {
        set({ kpis: response.data, loading: false })
      } else {
        set({ error: response.error || "Failed to fetch KPIs", loading: false })
      }
    } catch (error) {
      set({ error: "Network error", loading: false })
    }
  },

  toggleMonsoonMode: async () => {
    try {
      const response = await mockAPI.toggleMonsoonMode()

      if (response.success && response.data) {
        set({ monsoonMode: response.data.enabled })
      } else {
        set({ error: response.error || "Failed to toggle monsoon mode" })
      }
    } catch (error) {
      set({ error: "Network error" })
    }
  },

  clearError: () => set({ error: null }),
}))
