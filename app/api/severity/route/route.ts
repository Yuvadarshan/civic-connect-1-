import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticket_id, departments, severity } = body

    if (!ticket_id || !departments || !severity) {
      return NextResponse.json({ error: "Missing required fields: ticket_id, departments, severity" }, { status: 400 })
    }

    // Mock routing logic
    console.log(`Routing ticket ${ticket_id} with severity ${severity} to departments:`, departments)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      ok: true,
      message: `Ticket ${ticket_id} successfully routed to ${departments.join(", ")}`,
      routing_id: `RT-${Date.now()}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to route ticket" }, { status: 500 })
  }
}
