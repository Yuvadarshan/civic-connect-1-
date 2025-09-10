// Mock API server for Civic-Connect AI
// This simulates the backend API endpoints

import { mockTickets, mockUsers, mockKPIs, mockJobs, generateTicketId } from "./mock-data"
import type { Ticket, AITriageResponse, AIDedupeResponse, ApiResponse } from "../types"
import { aiTriageEngine, aiDedupeEngine } from "../lib/utils/ai-engine"

// In-memory storage (simulates database)
const tickets = [...mockTickets]
const users = [...mockUsers]
const kpis = { ...mockKPIs }
const jobs = [...mockJobs]
let monsoonMode = false

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock API endpoints
export const mockAPI = {
  // Citizen endpoints
  async createTicket(ticketData: Partial<Ticket>): Promise<ApiResponse<Ticket>> {
    await delay(500) // Simulate network delay

    const newTicket: Ticket = {
      id: generateTicketId(),
      reporterId: ticketData.reporterId || "user-1",
      media: ticketData.media || [],
      category: ticketData.category || "Pothole",
      severity: ticketData.severity || 3,
      status: "Submitted",
      ward: ticketData.ward || "Ward 1 - Central",
      geo: ticketData.geo || { lat: 28.6139, lng: 77.209 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `event-${Date.now()}`,
          type: "created",
          timestamp: new Date().toISOString(),
          userId: ticketData.reporterId || "user-1",
          userName: "Citizen",
          message: "Issue reported",
        },
      ],
      privacy: { facesBlurred: true },
      title: ticketData.title || "New Issue",
      description: ticketData.description || "",
      ...ticketData,
    }

    tickets.push(newTicket)

    return {
      success: true,
      data: newTicket,
      message: "Ticket created successfully",
    }
  },

  async getTickets(filters?: { mine?: boolean; userId?: string }): Promise<ApiResponse<Ticket[]>> {
    await delay(200)

    let filteredTickets = tickets

    if (filters?.mine && filters?.userId) {
      filteredTickets = tickets.filter((t) => t.reporterId === filters.userId)
    }

    return {
      success: true,
      data: filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }
  },

  async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    await delay(150)

    const ticket = tickets.find((t) => t.id === id)

    if (!ticket) {
      return {
        success: false,
        error: "Ticket not found",
      }
    }

    return {
      success: true,
      data: ticket,
    }
  },

  async confirmClose(ticketId: string, rating?: number): Promise<ApiResponse<void>> {
    await delay(300)

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return { success: false, error: "Ticket not found" }
    }

    ticket.rating = rating
    ticket.updatedAt = new Date().toISOString()

    return {
      success: true,
      message: "Ticket confirmed as resolved",
    }
  },

  async reopenTicket(ticketId: string, reason: string): Promise<ApiResponse<void>> {
    await delay(300)

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return { success: false, error: "Ticket not found" }
    }

    ticket.status = "Submitted"
    ticket.reopenReason = reason
    ticket.updatedAt = new Date().toISOString()
    ticket.timeline.push({
      id: `event-${Date.now()}`,
      type: "reopened",
      timestamp: new Date().toISOString(),
      message: `Ticket reopened: ${reason}`,
    })

    return {
      success: true,
      message: "Ticket reopened successfully",
    }
  },

  // Enhanced AI endpoints
  async aiTriage(ticketData: Partial<Ticket>): Promise<ApiResponse<AITriageResponse>> {
    await delay(800) // Simulate AI processing time

    try {
      const result = await aiTriageEngine.performTriage(ticketData)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: "AI triage processing failed",
      }
    }
  },

  async aiDedupe(ticketData: Partial<Ticket>): Promise<ApiResponse<AIDedupeResponse>> {
    await delay(600)

    try {
      const result = await aiDedupeEngine.checkDuplicate(ticketData, tickets)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: "Duplicate detection failed",
      }
    }
  },

  // Batch AI processing for admin
  async batchAIProcess(ticketIds: string[]): Promise<ApiResponse<{ processed: number; results: any[] }>> {
    await delay(2000) // Longer processing time for batch

    const results = []
    let processed = 0

    for (const ticketId of ticketIds) {
      const ticket = tickets.find((t) => t.id === ticketId)
      if (ticket) {
        try {
          const triageResult = await aiTriageEngine.performTriage(ticket)
          const dedupeResult = await aiDedupeEngine.checkDuplicate(
            ticket,
            tickets.filter((t) => t.id !== ticketId),
          )

          results.push({
            ticketId,
            triage: triageResult,
            dedupe: dedupeResult,
          })
          processed++
        } catch (error) {
          results.push({
            ticketId,
            error: "Processing failed",
          })
        }
      }
    }

    return {
      success: true,
      data: { processed, results },
    }
  },

  // AI performance metrics
  async getAIMetrics(): Promise<
    ApiResponse<{
      triageAccuracy: number
      dedupeAccuracy: number
      avgProcessingTime: number
      totalProcessed: number
    }>
  > {
    await delay(300)

    // Mock AI performance metrics
    return {
      success: true,
      data: {
        triageAccuracy: 0.87, // 87% accuracy
        dedupeAccuracy: 0.92, // 92% accuracy
        avgProcessingTime: 1.2, // 1.2 seconds
        totalProcessed: 1247,
      },
    }
  },

  // Admin endpoints
  async acknowledgeTicket(ticketId: string, message?: string): Promise<ApiResponse<void>> {
    await delay(200)

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return { success: false, error: "Ticket not found" }
    }

    ticket.status = "Acknowledged"
    ticket.slaAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours SLA
    ticket.updatedAt = new Date().toISOString()
    ticket.timeline.push({
      id: `event-${Date.now()}`,
      type: "acknowledged",
      timestamp: new Date().toISOString(),
      userId: "admin-1",
      userName: "Municipal Admin",
      message: message || "Issue acknowledged",
    })

    return {
      success: true,
      message: "Ticket acknowledged successfully",
    }
  },

  async assignTicket(ticketId: string, assigneeId: string, eta?: string): Promise<ApiResponse<void>> {
    await delay(200)

    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) {
      return { success: false, error: "Ticket not found" }
    }

    ticket.status = "In-Progress"
    ticket.eta = eta
    ticket.updatedAt = new Date().toISOString()
    ticket.timeline.push({
      id: `event-${Date.now()}`,
      type: "assigned",
      timestamp: new Date().toISOString(),
      userId: "admin-1",
      userName: "Municipal Admin",
      message: `Assigned to technician${eta ? ` with ETA: ${eta}` : ""}`,
    })

    return {
      success: true,
      message: "Ticket assigned successfully",
    }
  },

  async getKPIs(): Promise<ApiResponse<typeof kpis>> {
    await delay(300)

    return {
      success: true,
      data: kpis,
    }
  },

  async toggleMonsoonMode(): Promise<ApiResponse<{ enabled: boolean }>> {
    await delay(200)

    monsoonMode = !monsoonMode

    return {
      success: true,
      data: { enabled: monsoonMode },
      message: `Monsoon mode ${monsoonMode ? "enabled" : "disabled"}`,
    }
  },
}
