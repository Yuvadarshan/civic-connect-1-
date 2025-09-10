// Zustand store for ticket management

import { create } from "zustand"
import type { Ticket, TicketFilters } from "../types"
import { mockAPI } from "../api/mock-server"

interface TicketState {
  tickets: Ticket[]
  currentTicket: Ticket | null
  loading: boolean
  error: string | null
  filters: TicketFilters

  // Actions
  fetchTickets: (options?: { mine?: boolean; userId?: string }) => Promise<void>
  fetchTicket: (id: string) => Promise<void>
  createTicket: (ticketData: Partial<Ticket>) => Promise<Ticket | null>
  acknowledgeTicket: (id: string, message?: string) => Promise<void>
  assignTicket: (id: string, assigneeId: string, eta?: string) => Promise<void>
  confirmClose: (id: string, rating?: number) => Promise<void>
  reopenTicket: (id: string, reason: string) => Promise<void>
  setFilters: (filters: Partial<TicketFilters>) => void
  clearError: () => void
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  currentTicket: null,
  loading: false,
  error: null,
  filters: {},

  fetchTickets: async (options) => {
    set({ loading: true, error: null })

    try {
      const response = await mockAPI.getTickets(options)

      if (response.success && response.data) {
        set({ tickets: response.data, loading: false })
      } else {
        set({ error: response.error || "Failed to fetch tickets", loading: false })
      }
    } catch (error) {
      set({ error: "Network error", loading: false })
    }
  },

  fetchTicket: async (id) => {
    set({ loading: true, error: null })

    try {
      const response = await mockAPI.getTicket(id)

      if (response.success && response.data) {
        set({ currentTicket: response.data, loading: false })
      } else {
        set({ error: response.error || "Ticket not found", loading: false })
      }
    } catch (error) {
      set({ error: "Network error", loading: false })
    }
  },

  createTicket: async (ticketData) => {
    set({ loading: true, error: null })

    try {
      const response = await mockAPI.createTicket(ticketData)

      if (response.success && response.data) {
        const { tickets } = get()
        set({
          tickets: [response.data, ...tickets],
          loading: false,
        })
        return response.data
      } else {
        set({ error: response.error || "Failed to create ticket", loading: false })
        return null
      }
    } catch (error) {
      set({ error: "Network error", loading: false })
      return null
    }
  },

  acknowledgeTicket: async (id, message) => {
    try {
      const response = await mockAPI.acknowledgeTicket(id, message)

      if (response.success) {
        // Refresh tickets to get updated data
        await get().fetchTickets()
      } else {
        set({ error: response.error || "Failed to acknowledge ticket" })
      }
    } catch (error) {
      set({ error: "Network error" })
    }
  },

  assignTicket: async (id, assigneeId, eta) => {
    try {
      const response = await mockAPI.assignTicket(id, assigneeId, eta)

      if (response.success) {
        await get().fetchTickets()
      } else {
        set({ error: response.error || "Failed to assign ticket" })
      }
    } catch (error) {
      set({ error: "Network error" })
    }
  },

  confirmClose: async (id, rating) => {
    try {
      const response = await mockAPI.confirmClose(id, rating)

      if (response.success) {
        await get().fetchTickets()
      } else {
        set({ error: response.error || "Failed to confirm closure" })
      }
    } catch (error) {
      set({ error: "Network error" })
    }
  },

  reopenTicket: async (id, reason) => {
    try {
      const response = await mockAPI.reopenTicket(id, reason)

      if (response.success) {
        await get().fetchTickets()
      } else {
        set({ error: response.error || "Failed to reopen ticket" })
      }
    } catch (error) {
      set({ error: "Network error" })
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }))
  },

  clearError: () => set({ error: null }),
}))
