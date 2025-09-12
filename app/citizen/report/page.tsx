"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTicketStore } from "@/store/tickets"
import { useAIStore } from "@/store/ai"
import { CATEGORIES, WARDS, SEVERITY_LABELS } from "@/lib/constants"
import { Camera, MapPin, Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import type { Category, Severity } from "@/types"

type MediaFile = {
  file: File
  preview: string
  isProcessing: boolean
}

export default function ReportIssuePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { createTicket, loading: ticketLoading } = useTicketStore()
  const { performTriage, checkDuplicate, triageResult, dedupeResult, loading: aiLoading } = useAIStore()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as Category | "",
    severity: 3 as Severity,
    ward: "",
    location: { lat: 28.6139, lng: 77.209 }, // Default: Delhi
  })

  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [step, setStep] = useState(1)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // --- Fetch address from OpenStreetMap ---
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      return data.display_name || "Unknown location"
    } catch {
      return "Unknown location"
    }
  }

  // --- Add overlay with map + address + coords (fallback if map fails) ---
  const addMapOverlayToImage = async (
    file: File,
    location: { lat: number; lng: number },
    address: string,
    mapImageUrl: string
  ): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0)

        // Background card
        const cardHeight = 200
        ctx.fillStyle = "rgba(0,0,0,0.65)"
        ctx.fillRect(0, canvas.height - cardHeight, canvas.width, cardHeight)

        // Try to load map
        const mapImg = new Image()
        mapImg.crossOrigin = "anonymous"
        mapImg.src = mapImageUrl

        const drawText = () => {
          ctx.fillStyle = "white"
          ctx.font = "28px Arial"

          // Address wrap
          const maxWidth = canvas.width - 200
          const words = address.split(" ")
          const lines: string[] = []
          let line = ""
          for (let word of words) {
            const testLine = line + word + " "
            if (ctx.measureText(testLine).width > maxWidth) {
              lines.push(line)
              line = word + " "
            } else {
              line = testLine
            }
          }
          lines.push(line)

          lines.forEach((l, i) => {
            ctx.fillText(l.trim(), 190, canvas.height - cardHeight + 50 + i * 30)
          })

          // Coords
          ctx.fillText(
            `Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}`,
            190,
            canvas.height - 40
          )

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }))
            } else {
              resolve(file)
            }
          }, file.type)
        }

        mapImg.onload = () => {
          ctx.drawImage(mapImg, 20, canvas.height - cardHeight + 25, 150, 150)
          drawText()
        }

        mapImg.onerror = () => {
          // No map, still stamp text
          drawText()
        }
      }
    })
  }

  // --- Handle file upload with geo overlay ---
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const address = await fetchAddress(formData.location.lat, formData.location.lng)
    const mapImageUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${formData.location.lat},${formData.location.lng}&zoom=15&size=300x300&markers=${formData.location.lat},${formData.location.lng},red-pushpin`

    // Add placeholders
    const placeholders: MediaFile[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isProcessing: true,
    }))
    setSelectedFiles((prev) => [...prev, ...placeholders].slice(0, 3))

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      let finalFile = file
      if (file.type.startsWith("image/")) {
        finalFile = await addMapOverlayToImage(file, formData.location, address, mapImageUrl)
      }
      const previewUrl = URL.createObjectURL(finalFile)

      setSelectedFiles((prev) => {
        const updated = [...prev]
        const index = updated.findIndex((p) => p.preview === placeholders[i].preview)
        if (index !== -1) {
          updated[index] = { file: finalFile, preview: previewUrl, isProcessing: false }
        }
        return updated
      })
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // --- Location capture ---
  const getCurrentLocation = () => {
    setLocationStatus("loading")
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }))
          setLocationStatus("success")
        },
        () => setLocationStatus("error"),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setLocationStatus("error")
    }
  }

  // --- AI processing ---
  const handleAIProcessing = async () => {
    if (!formData.category || !formData.title) return
    setStep(2)
    await performTriage({
      category: formData.category,
      title: formData.title,
      description: formData.description,
      geo: formData.location,
    })
    await checkDuplicate({
      category: formData.category,
      geo: formData.location,
      title: formData.title,
    })
    setStep(3)
  }

  // --- Submit ---
  const handleSubmit = async () => {
    const ticketData = {
      reporterId: "user-1",
      title: formData.title,
      description: formData.description,
      category: formData.category as Category,
      severity: formData.severity,
      ward: formData.ward,
      geo: formData.location,
      media: selectedFiles.map((item, index) => ({
        id: `media-${Date.now()}-${index}`,
        uri: item.preview,
        type: item.file.type.startsWith("image/") ? "image" : "video",
        size: item.file.size,
      })),
    }
    const ticket = await createTicket(ticketData)
    if (ticket) router.push(`/citizen/reports?new=${ticket.id}`)
  }

  const canProceed = formData.title && formData.category && formData.ward && selectedFiles.every(f => !f.isProcessing)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Report an Issue</h1>
        <p className="text-muted-foreground">Help improve your community by reporting civic issues</p>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle>Issue Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">

            {/* Title */}
            <div>
              <Label htmlFor="title">Issue Title *</Label>
              <Input id="title" value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description" />
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Select value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Category })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Ward */}
            <div>
              <Label>Ward *</Label>
              <Select value={formData.ward}
                onValueChange={(value) => setFormData({ ...formData, ward: value })}>
                <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                <SelectContent>
                  {WARDS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label>Location</Label>
              <Button onClick={getCurrentLocation} disabled={locationStatus==="loading"}>
                {locationStatus==="loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                Get Current Location
              </Button>
              <p className="text-xs">
                Current: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </p>
            </div>

            {/* Media Upload */}
            <div>
              <Label>Photos/Videos</Label>
              <Button onClick={() => fileInputRef.current?.click()}><Camera className="h-4 w-4" /> Upload</Button>
              <input ref={fileInputRef} type="file" multiple accept="image/*,video/*"
                onChange={handleFileSelect} className="hidden" />

              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {selectedFiles.map((item, i) => (
                    <div key={i} className="relative border rounded-lg overflow-hidden">
                      {item.isProcessing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                      {item.file.type.startsWith("image/") ?
                        <img src={item.preview} alt="preview" className="w-full h-40 object-cover" /> :
                        <video src={item.preview} controls className="w-full h-40 object-cover" />}
                      <Button className="absolute top-1 right-1" variant="destructive" size="sm"
                        onClick={() => removeFile(i)}>×</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleAIProcessing} disabled={!canProceed || aiLoading} className="w-full">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
            </Button>

          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card><CardContent className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Analyzing your report...</p>
        </CardContent></Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card><CardContent>
          <h3>Review & Submit</h3>
          <Button onClick={handleSubmit} disabled={ticketLoading}>
            {ticketLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
          </Button>
        </CardContent></Card>
      )}
    </div>
  )
}
