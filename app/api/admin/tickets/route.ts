import { NextResponse } from "next/server"

const mockAdminTickets = [
  {
    id: "ISS-101",
    title: "Large pothole on MG Road",
    category: "Pothole",
    ward: "W2",
    lat: 23.37,
    lng: 85.33,
    status: "Open",
    severity: 3,
    confidence: 0.86,
    departments: ["Public Works"],
  },
  {
    id: "ISS-102",
    title: "Water leakage near Park St",
    category: "Water",
    ward: "W1",
    lat: 23.35,
    lng: 85.31,
    status: "Open",
    severity: 4,
    confidence: 0.91,
    departments: ["Water Board"],
  },
  {
    id: "ISS-103",
    title: "Broken streetlight on Main Road",
    category: "Lighting",
    ward: "W3",
    lat: 23.36,
    lng: 85.32,
    status: "Open",
    severity: 2,
    confidence: 0.78,
    departments: ["Electrical"],
  },
  {
    id: "ISS-104",
    title: "Garbage overflow at Market Square",
    category: "Sanitation",
    ward: "W4",
    lat: 23.38,
    lng: 85.34,
    status: "Open",
    severity: 1,
    confidence: 0.95,
    departments: ["Sanitation"],
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      tickets: mockAdminTickets,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 })
  }
}
