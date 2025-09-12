import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get("id")

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 })
    }

    // Mock severity data based on ticket ID
    const mockSeverityData = {
      "ISS-101": { severity: 3, confidence: 0.86, departments: ["Public Works"] },
      "ISS-102": { severity: 4, confidence: 0.91, departments: ["Water Board"] },
      "ISS-103": { severity: 2, confidence: 0.78, departments: ["Electrical"] },
      "ISS-104": { severity: 1, confidence: 0.95, departments: ["Sanitation"] },
    }

    const severityInfo = mockSeverityData[ticketId as keyof typeof mockSeverityData] || {
      severity: 2,
      confidence: 0.75,
      departments: ["General"],
    }

    return NextResponse.json(severityInfo)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch severity data" }, { status: 500 })
  }
}
