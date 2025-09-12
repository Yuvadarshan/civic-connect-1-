export const mockSeverityTickets = [
  {
    id: "ISS-101",
    title: "Large pothole on Main Street causing traffic delays",
    ward: "W2",
    category: "Pothole",
    severity: 3,
    confidence: 0.86,
    suggested_departments: ["Public Works", "Water Board"],
    sla_target: 240,
    status: "high_confidence" as const,
  },
  {
    id: "ISS-102",
    title: "Blocked drainage near market area",
    ward: "W1",
    category: "Drainage",
    severity: 2,
    confidence: 0.74,
    suggested_departments: ["Water Board"],
    sla_target: 180,
    status: "needs_review" as const,
  },
  {
    id: "ISS-103",
    title: "Streetlight not working for 3 days",
    ward: "W3",
    category: "Streetlight",
    severity: 1,
    confidence: 0.92,
    suggested_departments: ["Electrical"],
    sla_target: 120,
    status: "high_confidence" as const,
  },
  {
    id: "ISS-104",
    title: "Garbage overflow at collection point",
    ward: "W4",
    category: "Garbage",
    severity: 4,
    confidence: 0.68,
    suggested_departments: ["Sanitation", "Public Works"],
    sla_target: 360,
    status: "needs_review" as const,
  },
  {
    id: "ISS-105",
    title: "Water leak causing road damage",
    ward: "W2",
    category: "Pothole",
    severity: 3,
    confidence: 0.91,
    suggested_departments: ["Water Board", "Public Works"],
    sla_target: 240,
    status: "processing" as const,
  },
]

export const mockSeverityScore = {
  severity: 3,
  score: 0.78,
  confidence: 0.86,
  factors: ["overflow", "rain_+2σ", "traffic_p85", "image_damage"],
  departments: [
    { name: "Public Works", p: 0.72 },
    { name: "Water Board", p: 0.61 },
    { name: "Sanitation", p: 0.23 },
  ],
  sla_target_mins: 240,
}

export const mockSeverityDistribution = {
  s1: 12,
  s2: 43,
  s3: 18,
  s4: 6,
}

export const mockSeverityMapLayer = {
  features: [
    {
      ticket_id: "ISS-101",
      lat: 12.9716,
      lng: 77.5946,
      severity: 3,
      confidence: 0.86,
      suggested_departments: ["Public Works", "Water Board"],
    },
    {
      ticket_id: "ISS-102",
      lat: 12.9352,
      lng: 77.6245,
      severity: 2,
      confidence: 0.74,
      suggested_departments: ["Water Board"],
    },
    {
      ticket_id: "ISS-103",
      lat: 12.9698,
      lng: 77.75,
      severity: 1,
      confidence: 0.92,
      suggested_departments: ["Electrical"],
    },
    {
      ticket_id: "ISS-104",
      lat: 12.9279,
      lng: 77.6271,
      severity: 4,
      confidence: 0.68,
      suggested_departments: ["Sanitation", "Public Works"],
    },
  ],
}
