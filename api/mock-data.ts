// Mock data seeds for Civic-Connect AI

import type { Ticket, User, KPI, TechnicianJob } from "../types"

// Sample users
export const mockUsers: User[] = [
  {
    id: "user-1",
    role: "citizen",
    name: "Priya Sharma",
    phone: "+91-9876543210",
    ward: "Ward 2 - North",
    points: 150,
    badges: ["First Reporter", "Community Helper"],
  },
  {
    id: "user-2",
    role: "citizen",
    name: "Rajesh Kumar",
    phone: "+91-9876543211",
    ward: "Ward 1 - Central",
    points: 75,
    badges: ["First Reporter"],
  },
  {
    id: "admin-1",
    role: "admin",
    name: "Municipal Admin",
    ward: "All Wards",
    points: 0,
    badges: [],
  },
  {
    id: "tech-1",
    role: "technician",
    name: "Suresh Patel",
    phone: "+91-9876543212",
    ward: "Ward 1 - Central",
    points: 0,
    badges: [],
  },
]

// Sample tickets with realistic data
export const mockTickets: Ticket[] = [
  {
    id: "ticket-1",
    reporterId: "user-1",
    media: [
      {
        id: "media-1",
        uri: "/large-pothole-on-main-road.jpg",
        type: "image",
        size: 245760,
        phash: "abc123def456",
      },
    ],
    category: "Pothole",
    severity: 4,
    status: "Acknowledged",
    ward: "Ward 2 - North",
    geo: { lat: 28.6139, lng: 77.209 },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T11:15:00Z",
    slaAt: "2024-01-16T10:30:00Z",
    eta: "2024-01-17T16:00:00Z",
    dept: "Roads & Infrastructure",
    timeline: [
      {
        id: "event-1",
        type: "created",
        timestamp: "2024-01-15T10:30:00Z",
        userId: "user-1",
        userName: "Priya Sharma",
        message: "Issue reported",
      },
      {
        id: "event-2",
        type: "acknowledged",
        timestamp: "2024-01-15T11:15:00Z",
        userId: "admin-1",
        userName: "Municipal Admin",
        message: "Issue acknowledged and assigned to Roads department",
      },
    ],
    privacy: { facesBlurred: true },
    title: "Large pothole on MG Road",
    description: "Deep pothole causing traffic issues and vehicle damage",
  },
  {
    id: "ticket-2",
    reporterId: "user-2",
    media: [
      {
        id: "media-2",
        uri: "/broken-streetlight-night.png",
        type: "image",
        size: 189440,
        phash: "def456ghi789",
      },
    ],
    category: "Streetlight",
    severity: 3,
    status: "In-Progress",
    ward: "Ward 1 - Central",
    geo: { lat: 28.6129, lng: 77.2295 },
    createdAt: "2024-01-14T20:45:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    slaAt: "2024-01-17T20:45:00Z",
    eta: "2024-01-16T18:00:00Z",
    dept: "Electrical",
    timeline: [
      {
        id: "event-3",
        type: "created",
        timestamp: "2024-01-14T20:45:00Z",
        userId: "user-2",
        userName: "Rajesh Kumar",
        message: "Streetlight not working",
      },
      {
        id: "event-4",
        type: "acknowledged",
        timestamp: "2024-01-15T08:00:00Z",
        userId: "admin-1",
        userName: "Municipal Admin",
        message: "Assigned to electrical team",
      },
      {
        id: "event-5",
        type: "in_progress",
        timestamp: "2024-01-15T09:30:00Z",
        userId: "tech-1",
        userName: "Suresh Patel",
        message: "Technician dispatched to location",
      },
    ],
    privacy: { facesBlurred: false },
    title: "Broken streetlight on Park Street",
    description: "Streetlight pole damaged, area unsafe at night",
  },
  {
    id: "ticket-3",
    reporterId: "user-1",
    media: [
      {
        id: "media-3",
        uri: "/overflowing-garbage-bin.png",
        type: "image",
        size: 156780,
        phash: "ghi789jkl012",
      },
    ],
    category: "Garbage",
    severity: 2,
    status: "Resolved",
    ward: "Ward 2 - North",
    geo: { lat: 28.6149, lng: 77.2085 },
    createdAt: "2024-01-13T14:20:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    dept: "Sanitation",
    timeline: [
      {
        id: "event-6",
        type: "created",
        timestamp: "2024-01-13T14:20:00Z",
        userId: "user-1",
        userName: "Priya Sharma",
        message: "Garbage bin overflowing",
      },
      {
        id: "event-7",
        type: "acknowledged",
        timestamp: "2024-01-13T15:30:00Z",
        userId: "admin-1",
        userName: "Municipal Admin",
        message: "Assigned to sanitation team",
      },
      {
        id: "event-8",
        type: "resolved",
        timestamp: "2024-01-14T16:45:00Z",
        userId: "admin-1",
        userName: "Municipal Admin",
        message: "Garbage collected and bin cleaned",
      },
    ],
    privacy: { facesBlurred: false },
    rating: 5,
    title: "Overflowing garbage bin",
    description: "Public garbage bin near market overflowing for 3 days",
  },
]

// Sample KPIs
export const mockKPIs: KPI = {
  timeToAckMedian: 45, // 45 minutes
  timeToFixMedian: 18, // 18 hours
  backlogOverSLA: 12,
  duplicateCollapseRate: 15.5, // 15.5%
  firstAttemptFixRate: 78.2, // 78.2%
  hotspots: [
    { lat: 28.6139, lng: 77.209 }, // MG Road area
    { lat: 28.6129, lng: 77.2295 }, // Park Street area
    { lat: 28.6149, lng: 77.2085 }, // Market area
  ],
}

// Sample technician jobs
export const mockJobs: TechnicianJob[] = [
  {
    id: "job-1",
    ticketId: "ticket-2",
    checklist: ["Inspect pole damage", "Check electrical connections", "Replace bulb if needed"],
    parts: ["LED bulb", "Electrical wire", "Junction box"],
    startedAt: "2024-01-15T09:30:00Z",
    geoFenceOk: true,
  },
]

// Utility function to generate new ticket ID
export function generateTicketId(): string {
  return `ticket-${Date.now()}`
}

// Utility function to generate new media ID
export function generateMediaId(): string {
  return `media-${Date.now()}`
}
