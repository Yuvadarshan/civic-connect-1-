"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function CitizenLoginPage() {
  const router = useRouter()
  const [aadhaar, setAadhaar] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAadhaarChange = (value: string) => {
    // Only allow numeric input, max 12 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 12)
    setAadhaar(numericValue)
    setError("")
  }

  const handleOtpChange = (value: string) => {
    // Only allow numeric input, max 4 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 4)
    setOtp(numericValue)
    setError("")
  }

  const handleSendOtp = async () => {
    if (aadhaar.length !== 12) {
      setError("Aadhaar number must be exactly 12 digits")
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setShowOtp(true)
      setLoading(false)
    }, 1000)
  }

  const handleLogin = async () => {
    if (aadhaar.length !== 12) {
      setError("Aadhaar number must be exactly 12 digits")
      return
    }

    if (otp.length !== 4) {
      setError("OTP must be exactly 4 digits")
      return
    }

    setLoading(true)

    try {
      // Mock API call - accept any 4-digit OTP
      const response = await fetch("/api/auth/aadhaar/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar, otp }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store mock session
        localStorage.setItem(
          "citizen_session",
          JSON.stringify({
            token: data.token,
            aadhaar: aadhaar,
            loginTime: new Date().toISOString(),
          }),
        )
        router.push("/citizen/home")
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (error) {
      // Fallback client-side validation
      if (aadhaar.length === 12 && otp.length === 4) {
        localStorage.setItem(
          "citizen_session",
          JSON.stringify({
            token: "mock_token",
            aadhaar: aadhaar,
            loginTime: new Date().toISOString(),
          }),
        )
        router.push("/citizen/home")
      } else {
        setError("Invalid credentials")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Continue with Aadhaar</CardTitle>
          <p className="text-muted-foreground">Secure login for Civic Connect</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aadhaar">Aadhaar Number</Label>
            <Input
              id="aadhaar"
              type="text"
              placeholder="Enter 12-digit Aadhaar number"
              value={aadhaar}
              onChange={(e) => handleAadhaarChange(e.target.value)}
              maxLength={12}
            />
            {aadhaar.length > 0 && aadhaar.length !== 12 && (
              <p className="text-sm text-red-500">Aadhaar number must be exactly 12 digits</p>
            )}
          </div>

          {!showOtp ? (
            <Button onClick={handleSendOtp} className="w-full" disabled={aadhaar.length !== 12 || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send OTP
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  maxLength={4}
                />
                {otp.length > 0 && otp.length !== 4 && (
                  <p className="text-sm text-red-500">OTP must be exactly 4 digits</p>
                )}
              </div>

              <Button
                onClick={handleLogin}
                className="w-full"
                disabled={aadhaar.length !== 12 || otp.length !== 4 || loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
