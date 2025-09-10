// Zustand store for AI services (triage and deduplication)

import { create } from "zustand"
import type { AITriageResponse, AIDedupeResponse, Ticket } from "../types"
import { mockAPI } from "../api/mock-server"

interface AIState {
  triageResult: AITriageResponse | null
  dedupeResult: AIDedupeResponse | null
  loading: boolean
  error: string | null

  // Actions
  performTriage: (ticketData: Partial<Ticket>) => Promise<AITriageResponse | null>
  checkDuplicate: (ticketData: Partial<Ticket>) => Promise<AIDedupeResponse | null>
  clearResults: () => void
  clearError: () => void
}

export const useAIStore = create<AIState>((set) => ({
  triageResult: null,
  dedupeResult: null,
  loading: false,
  error: null,

  performTriage: async (ticketData) => {
    set({ loading: true, error: null })

    try {
      const response = await mockAPI.aiTriage(ticketData)

      if (response.success && response.data) {
        set({ triageResult: response.data, loading: false })
        return response.data
      } else {
        set({ error: response.error || "AI triage failed", loading: false })
        return null
      }
    } catch (error) {
      set({ error: "Network error", loading: false })
      return null
    }
  },

  checkDuplicate: async (ticketData) => {
    set({ loading: true, error: null })

    try {
      const response = await mockAPI.aiDedupe(ticketData)

      if (response.success && response.data) {
        set({ dedupeResult: response.data, loading: false })
        return response.data
      } else {
        set({ error: response.error || "Duplicate check failed", loading: false })
        return null
      }
    } catch (error) {
      set({ error: "Network error", loading: false })
      return null
    }
  },

  clearResults: () => set({ triageResult: null, dedupeResult: null }),
  clearError: () => set({ error: null }),
}))
