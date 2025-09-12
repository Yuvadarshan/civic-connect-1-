// app/api/map/route.ts
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 })
  }

  const mapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=300x300&markers=${lat},${lng},red-pushpin`

  const response = await fetch(mapUrl)
  const buffer = await response.arrayBuffer()

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  })
}
