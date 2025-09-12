export async function POST(request: Request) {
  const body = await request.json()
  const { issue_id, radius_m, window_days } = body

  if (request.url.includes("/diagnose")) {
    // Mock diagnosis response
    const response = {
      cause: "Water leak degrading sub-grade",
      confidence: 0.84,
      evidence: [
        { type: "pattern", value: "3 pothole + 2 water-leak in 500m/30d" },
        { type: "upstream", value: "DR-12 overflowed 6 days ago" },
        { type: "weather", value: "rain_+2σ last week" },
      ],
      departments: ["Public Works", "Water Board"],
      action: "Fix leak at junction DR-12 → re-lay top coat on RD-102",
      expected_reduction: 0.45,
    }
    return Response.json(response)
  }

  if (request.url.includes("/auto_link")) {
    // Mock auto-link response
    const response = {
      ok: true,
      tickets: ["PW-9912", "WB-5531"],
    }
    return Response.json(response)
  }

  return Response.json({ error: "Unknown endpoint" }, { status: 404 })
}
