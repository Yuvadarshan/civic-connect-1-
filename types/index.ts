// Shared TypeScript types for Civic-Connect AI system

export type UserRole = "citizen" | "technician" | "admin"

export type Category =
  | "Pothole"
  | "Streetlight"
  | "Garbage"
  | "WaterLeak"
  | "Drainage"
  | "Sidewalk"
  | "TrafficSignal"
  | "Signs"
  | "ParkEquipment"
  | "FallenTree"
  | "Encroachment"
  | "Others"

export type TicketStatus = "Submitted" | "Acknowledged" | "In-Progress" | "Resolved"

export type Severity = 1 | 2 | 3 | 4 | 5 // 1 = Low, 5 = Critical

export interface GeoLocation {
  lat: number
  lng: number
}

export interface Media {
  id: string
  uri: string
  type: "image" | "video"
  size: number
  phash?: string
}

export interface TimelineEvent {
  id: string
  type: "created" | "acknowledged" | "assigned" | "in_progress" | "resolved" | "reopened" | "comment"
  timestamp: string
  userId?: string
  userName?: string
  message?: string
  metadata?: Record<string, any>
}

export interface Ticket {
  id: string
  reporterId: string
  media: Media[]
  category: Category
  severity: Severity
  status: TicketStatus
  ward: string
  geo: GeoLocation
  createdAt: string
  updatedAt: string
  slaAt?: string
  eta?: string
  dept?: string
  duplicateOf?: string
  timeline: TimelineEvent[]
  privacy: {
    facesBlurred: boolean
  }
  rating?: number
  reopenReason?: string
  title?: string
  description?: string
}

export interface User {
  id: string
  role: UserRole
  name: string
  phone?: string
  ward: string
  points: number
  badges: string[]
}

export interface TechnicianJob {
  id: string
  ticketId: string
  checklist: string[]
  parts: string[]
  startedAt?: string
  completedAt?: string
  geoFenceOk: boolean
}

export interface KPI {
  timeToAckMedian: number // minutes
  timeToFixMedian: number // hours
  backlogOverSLA: number
  duplicateCollapseRate: number // percentage
  firstAttemptFixRate: number // percentage
  hotspots: GeoLocation[]
}

export interface AITriageResponse {
  category: Category
  severity: Severity
  suggestedDept: string
  eta: string
  confidence: number
  priorityScore?: number
  reasoning?: string
}

export interface AIDedupeResponse {
  isDuplicate: boolean
  masterCaseId?: string
  similarity: number
  confidence: number
  reason?: string
  relatedCases?: string[]
  suggestedAction?: "merge" | "link" | "ignore"
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Filter types for admin dashboard
export interface TicketFilters {
  category?: Category[]
  severity?: Severity[]
  status?: TicketStatus[]
  ward?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

// Notification types
export interface NotificationPayload {
  ticketId: string
  type: "acknowledged" | "assigned" | "resolved" | "comment"
  title: string
  body: string
  data?: Record<string, any>
}
