export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city") || "Ranchi"
  const ward = searchParams.get("ward") || "ALL"
  const horizon = searchParams.get("horizon") || "30"
  const monsoon = searchParams.get("monsoon") === "true"

  // Mock response based on parameters
  const assets = [
    {
      id: "RD-102",
      ward: "W2",
      health: monsoon ? 45 : 62,
      p10: monsoon ? 38 : 55,
      p90: monsoon ? 52 : 70,
      eta_days: monsoon ? [8, 18] : [12, 24],
      failure_curve: [0.08, 0.12, 0.18, 0.25],
      fused: {
        weather: monsoon ? "rain_+3σ" : "rain_+2σ",
        traffic: "p85",
        geology: "low_stability",
      },
    },
    {
      id: "DR-45",
      ward: "W1",
      health: monsoon ? 35 : 45,
      p10: monsoon ? 28 : 38,
      p90: monsoon ? 42 : 52,
      eta_days: monsoon ? [3, 10] : [5, 15],
      failure_curve: [0.15, 0.22, 0.35, 0.48],
      fused: {
        weather: monsoon ? "rain_+2σ" : "rain_+1σ",
        traffic: "p92",
        geology: "medium_stability",
      },
    },
  ]

  return Response.json({ assets })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { budget, horizon, pre_monsoon, include_wards, equity_min } = body

  // Mock simulation response
  const response = {
    summary: {
      prevented_damage: Math.floor(budget * 0.3),
      complaints_reduction: pre_monsoon ? 0.45 : 0.3,
      sla_breach_reduction: pre_monsoon ? 0.25 : 0.18,
      budget_utilization: 0.96,
    },
    ranked: [
      {
        asset: "RD-102",
        ward: "W2",
        cost: Math.floor(budget * 0.18),
        prevented_damage: Math.floor(budget * 0.09),
        rop: 0.5,
        complaints_drop: 0.32,
        risk_drop: 0.41,
        post_fix_eta: 90,
      },
      {
        asset: "DR-12",
        ward: "W4",
        cost: Math.floor(budget * 0.12),
        prevented_damage: Math.floor(budget * 0.072),
        rop: 0.6,
        complaints_drop: 0.28,
        risk_drop: 0.37,
        post_fix_eta: 120,
      },
    ],
  }

  return Response.json(response)
}
