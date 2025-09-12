"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText } from "lucide-react"
import Link from "next/link"

export default function CitizenHomePage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)

  useEffect(() => {
    const session = localStorage.getItem("citizen_session")
    if (!session) {
      router.push("/citizen/login")
      return
    }

    try {
      const sessionData = JSON.parse(session)
      setUserInfo(sessionData)
    } catch (error) {
      router.push("/citizen/login")
    }
  }, [router])

  if (!userInfo) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Civic Connect</h1>
        <p className="text-muted-foreground">Logged in with Aadhaar: ****-****-{userInfo.aadhaar?.slice(-4)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Report Issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Report civic issues in your area and track their resolution.</p>
            <Link href="/citizen/report">
              <Button className="w-full">Report New Issue</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">View and track the status of your reported issues.</p>
            <Link href="/citizen/reports">
              <Button variant="outline" className="w-full bg-transparent">
                View My Tickets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
