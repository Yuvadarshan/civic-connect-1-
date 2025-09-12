import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { aadhaar, otp } = body

    // Validate Aadhaar number (12 digits)
    if (!aadhaar || aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) {
      return NextResponse.json({ error: "Invalid Aadhaar number. Must be exactly 12 digits." }, { status: 400 })
    }

    // Validate OTP (4 digits)
    if (!otp || otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid OTP. Must be exactly 4 digits." }, { status: 400 })
    }

    // Mock authentication - accept any valid format
    return NextResponse.json({
      ok: true,
      token: "mock_citizen_token_" + Date.now(),
      user: {
        aadhaar: aadhaar,
        name: "Citizen User",
        verified: true,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
