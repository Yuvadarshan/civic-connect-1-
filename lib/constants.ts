// Shared constants for Civic-Connect AI

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "Pothole", label: "Pothole", icon: "🕳️" },
  { value: "Streetlight", label: "Street Light", icon: "💡" },
  { value: "Garbage", label: "Garbage", icon: "🗑️" },
  { value: "WaterLeak", label: "Water Leak", icon: "💧" },
  { value: "Drainage", label: "Drainage", icon: "🌊" },
  { value: "Sidewalk", label: "Sidewalk", icon: "🚶" },
  { value: "TrafficSignal", label: "Traffic Signal", icon: "🚦" },
  { value: "Signs", label: "Signs", icon: "🪧" },
  { value: "ParkEquipment", label: "Park Equipment", icon: "🏞️" },
  { value: "FallenTree", label: "Fallen Tree", icon: "🌳" },
  { value: "Encroachment", label: "Encroachment", icon: "🚧" },
]

export const SEVERITY_LABELS = {
  1: "Low",
  2: "Minor",
  3: "Moderate",
  4: "High",
  5: "Critical",
} as const

export const STATUS_COLORS = {
  Submitted: "bg-blue-100 text-blue-800",
  Acknowledged: "bg-yellow-100 text-yellow-800",
  "In-Progress": "bg-orange-100 text-orange-800",
  Resolved: "bg-green-100 text-green-800",
} as const

export const SEVERITY_COLORS = {
  1: "bg-gray-100 text-gray-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-orange-100 text-orange-800",
  5: "bg-red-100 text-red-800",
} as const

// SLA targets in minutes
export const SLA_TARGETS = {
  acknowledgment: 60, // 1 hour
  resolution: {
    1: 7 * 24 * 60, // 7 days for low severity
    2: 5 * 24 * 60, // 5 days
    3: 3 * 24 * 60, // 3 days
    4: 24 * 60, // 1 day
    5: 4 * 60, // 4 hours for critical
  },
} as const

// Ward list (mock data)
export const WARDS = [
  "Ward 1 - Central",
  "Ward 2 - North",
  "Ward 3 - South",
  "Ward 4 - East",
  "Ward 5 - West",
  "Ward 6 - Industrial",
  "Ward 7 - Residential",
]

// Department routing rules
export const DEPT_ROUTING = {
  Pothole: "Roads & Infrastructure",
  Streetlight: "Electrical",
  Garbage: "Sanitation",
  WaterLeak: "Water Works",
  Drainage: "Water Works",
  Sidewalk: "Roads & Infrastructure",
  TrafficSignal: "Traffic Management",
  Signs: "Traffic Management",
  ParkEquipment: "Parks & Recreation",
  FallenTree: "Parks & Recreation",
  Encroachment: "Enforcement",
} as const

import type { Category } from "../types"
