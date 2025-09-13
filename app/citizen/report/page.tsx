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
import { Camera, MapPin, Upload, AlertTriangle, CheckCircle, Loader2, Mic, Square, Trash2 } from "lucide-react"
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
    category: "" as Category | "others" | "",
    severity: 3 as Severity,
    ward: "",
    location: { lat: 28.6139, lng: 77.209 }, // Default: Delhi
    customCategory: "", // for "Others"
  })

  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [step, setStep] = useState(1)
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  // ---- Voice note state ----
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordError, setRecordError] = useState<string>("")

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

        const cardHeight = 200
        ctx.fillStyle = "rgba(0,0,0,0.65)"
        ctx.fillRect(0, canvas.height - cardHeight, canvas.width, cardHeight)

        const mapImg = new Image()
        mapImg.crossOrigin = "anonymous"
        mapImg.src = mapImageUrl

        const drawText = () => {
          ctx.fillStyle = "white"
          ctx.font = "28px Arial"

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

          ctx.fillText(
            `Lat: ${location.lat.toFixed(5)}, Lng: ${location.lng.toFixed(5)}`,
            190,
            canvas.height - 40
          )

          canvas.toBlob((blob) => {
            if (blob) resolve(new File([blob], file.name, { type: file.type }))
            else resolve(file)
          }, file.type)
        }

        mapImg.onload = () => {
          ctx.drawImage(mapImg, 20, canvas.height - cardHeight + 25, 150, 150)
          drawText()
        }
        mapImg.onerror = drawText
      }
    })
  }

  // --- Handle file upload with geo overlay ---
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const address = await fetchAddress(formData.location.lat, formData.location.lng)
    const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${formData.location.lng},${formData.location.lat})/${formData.location.lng},${formData.location.lat},15/300x300?access_token=${'pk.eyJ1IjoieXV2YWRhcnNoYW4iLCJhIjoiY21maDEwNGplMDZ3dzJtczl6bzJvbThybyJ9.MKoAP7SFszLllaIeUSc1Hw'}`

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
        if (index !== -1) updated[index] = { file: finalFile, preview: previewUrl, isProcessing: false }
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

  // ---- Voice note handlers ----
  const startRecording = async () => {
    try {
      setRecordError("")
      // @ts-ignore - SSR guard
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setRecordError("Microphone not available.")
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      let mimeType = ""
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported?.("audio/webm")) mimeType = "audio/webm"
        else if (MediaRecorder.isTypeSupported?.("audio/mp4")) mimeType = "audio/mp4"
      }
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      const chunks: BlobPart[] = []

      mr.ondataavailable = (e) => e.data && e.data.size > 0 && chunks.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mr.mimeType || mimeType || "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioBlob(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((t) => t.stop())
      }

      mr.start()
      mediaRecorderRef.current = mr
      setIsRecording(true)
    } catch {
      setRecordError("Failed to start recording. Check permissions.")
    }
  }

  const stopRecording = () => {
    try {
      mediaRecorderRef.current?.stop()
    } finally {
      setIsRecording(false)
    }
  }

  const removeVoiceNote = () => {
    setAudioBlob(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl("")
  }

  // --- AI processing ---
  const handleAIProcessing = async () => {
    if (!formData.category || !formData.title) return
    const pickedCategory =
      formData.category === "others"
        ? (formData.customCategory.trim() || "Other")
        : (formData.category as string)

    setStep(2)
    await performTriage({
      category: pickedCategory as any,
      title: formData.title,
      description: formData.description, // can be empty if voice note used
      geo: formData.location,
    })
    await checkDuplicate({
      category: pickedCategory as any,
      geo: formData.location,
      title: formData.title,
    })
    setStep(3)
  }

  // --- Submit ---
  const handleSubmit = async () => {
    const normalizedCategory =
      formData.category === "others" ? "Other" : (formData.category as string)

    const ticketData: any = {
      reporterId: "user-1",
      title: formData.title,
      description: formData.description, // optional
      category: normalizedCategory as any as Category,
      severity: formData.severity,
      ward: formData.ward,
      geo: formData.location,
      customCategory: formData.category === "others" ? formData.customCategory.trim() : undefined,
      media: selectedFiles.map((item, index) => ({
        id: `media-${Date.now()}-${index}`,
        uri: item.preview,
        type: item.file.type.startsWith("image/") ? ("image" as const) : ("video" as const),
        size: item.file.size,
      })),
    }

    if (audioBlob && audioUrl) {
      ticketData.voiceNote = {
        id: `voice-${Date.now()}`,
        uri: audioUrl,
        mime: audioBlob.type || "audio/webm",
        size: audioBlob.size,
      }
    }

    const ticket = await createTicket(ticketData)
    if (ticket) router.push(`/citizen/reports?new=${ticket.id}`)
  }

  const canProceed =
    !!formData.title &&
    !!formData.category &&
    !!formData.ward &&
    selectedFiles.every((f) => !f.isProcessing) &&
    (formData.category !== "others" || !!formData.customCategory.trim()) &&
    (Boolean(formData.description.trim()) || Boolean(audioBlob)) // description not required if voice exists

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
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    category: value as Category | "others",
                    customCategory: value === "others" ? formData.customCategory : "",
                  })
                }
              >
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="others">
                    <span className="inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Others
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.category === "others" && (
                <div className="mt-2">
                  <Label>Enter your issue</Label>
                  <Input
                    placeholder="e.g., Noise pollution near school"
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Description + Voice (side by side) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="desc">Description (optional if you record)</Label>
                <Textarea
                  id="desc"
                  rows={4}
                  placeholder="Provide more details about the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Voice Note (Optional)</Label>
                <div className="flex items-center gap-2 mb-2">
                  {!isRecording ? (
                    <Button type="button" variant="outline" onClick={startRecording} className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button type="button" variant="destructive" onClick={stopRecording} className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      Stop
                    </Button>
                  )}

                  {audioUrl && (
                    <>
                      <audio src={audioUrl} controls className="max-w-[220px]" />
                      <Button type="button" variant="ghost" onClick={removeVoiceNote} className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </>
                  )}
                </div>
                {recordError && <p className="text-xs text-red-600">{recordError}</p>}
                {!recordError && typeof window !== "undefined" && !(window as any).MediaRecorder && (
                  <p className="text-xs text-muted-foreground">Voice notes may not be supported on this browser.</p>
                )}
              </div>
            </div>

            {/* Ward */}
            <div>
              <Label>Ward *</Label>
              <Select
                value={formData.ward}
                onValueChange={(value) => setFormData({ ...formData, ward: value })}
              >
                <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                <SelectContent>
                  {WARDS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[formData.severity]}
                  onValueChange={(value) => setFormData({ ...formData, severity: value[0] as Severity })}
                  min={1}
                  max={5}
                  step={1}
                  className="w-2/3"
                />
                <Badge variant="outline">{SEVERITY_LABELS[formData.severity]}</Badge>
              </div>
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
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
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
        <Card>
          <CardContent className="space-y-4">
            {triageResult && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  AI Analysis: Categorized as <strong>{triageResult.category}</strong> with{" "}
                  <strong>{SEVERITY_LABELS[triageResult.severity]}</strong>. ETA: <strong>{triageResult.eta}</strong>
                </AlertDescription>
              </Alert>
            )}
            {dedupeResult?.isDuplicate && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Similar issue detected (case #{dedupeResult.masterCaseId}). Your report may be merged.
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={handleSubmit} disabled={ticketLoading}>
              {ticketLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}