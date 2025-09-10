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
    location: { lat: 28.6139, lng: 77.209 }, // Default to Delhi coordinates
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [step, setStep] = useState(1) // 1: Form, 2: AI Processing, 3: Review & Submit
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 3)) // Max 3 files
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

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
        (error) => {
          console.error("Geolocation error:", error)
          setLocationStatus("error")
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    } else {
      setLocationStatus("error")
    }
  }

  const handleAIProcessing = async () => {
    if (!formData.category || !formData.title) return

    setStep(2)

    // Perform AI triage
    await performTriage({
      category: formData.category,
      title: formData.title,
      description: formData.description,
      geo: formData.location,
    })

    // Check for duplicates
    await checkDuplicate({
      category: formData.category,
      geo: formData.location,
      title: formData.title,
    })

    setStep(3)
  }

  const handleSubmit = async () => {
    const ticketData = {
      reporterId: "user-1", // Mock user ID
      title: formData.title,
      description: formData.description,
      category: formData.category as Category,
      severity: formData.severity,
      ward: formData.ward,
      geo: formData.location,
      media: selectedFiles.map((file, index) => ({
        id: `media-${Date.now()}-${index}`,
        uri: URL.createObjectURL(file),
        type: file.type.startsWith("image/") ? ("image" as const) : ("video" as const),
        size: file.size,
      })),
    }

    const ticket = await createTicket(ticketData)

    if (ticket) {
      router.push(`/citizen/reports?new=${ticket.id}`)
    }
  }

  const canProceed = formData.title && formData.category && formData.ward

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Report an Issue</h1>
        <p className="text-muted-foreground">Help improve your community by reporting civic issues</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNum ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {stepNum}
            </div>
            {stepNum < 3 && <div className={`w-12 h-0.5 mx-2 ${step > stepNum ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Form */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as Category }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label>Severity: {SEVERITY_LABELS[formData.severity]}</Label>
              <Slider
                value={[formData.severity]}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, severity: value[0] as Severity }))}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Critical</span>
              </div>
            </div>

            {/* Ward */}
            <div className="space-y-2">
              <Label>Ward *</Label>
              <Select
                value={formData.ward}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, ward: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your ward" />
                </SelectTrigger>
                <SelectContent>
                  {WARDS.map((ward) => (
                    <SelectItem key={ward} value={ward}>
                      {ward}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={locationStatus === "loading"}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {locationStatus === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  Get Current Location
                </Button>
                {locationStatus === "success" && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Location captured
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide more details about the issue..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label>Photos/Videos (Optional)</Label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Add Photos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Files
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative border border-border rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            ×
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleAIProcessing} disabled={!canProceed || aiLoading} className="w-full">
              {aiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: AI Processing */}
      {step === 2 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Processing Your Report</h3>
            <p className="text-muted-foreground">
              Our AI is analyzing your report for categorization and checking for duplicates...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          {/* AI Results */}
          {triageResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                AI Analysis: Categorized as <strong>{triageResult.category}</strong> with{" "}
                <strong>{SEVERITY_LABELS[triageResult.severity]}</strong> severity. Estimated resolution:{" "}
                <strong>{triageResult.eta}</strong>
              </AlertDescription>
            </Alert>
          )}

          {dedupeResult?.isDuplicate && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Similar issue detected! This might be a duplicate of case #{dedupeResult.masterCaseId}. Your report will
                be merged with the existing case to avoid duplication.
              </AlertDescription>
            </Alert>
          )}

          {/* Final Review */}
          <Card>
            <CardHeader>
              <CardTitle>Review Your Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-sm">{formData.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm">{formData.category}</p>
              </div>

              <div>
                <Label className="text-sm font-medium">Severity</Label>
                <Badge
                  className={`${formData.severity >= 4 ? "bg-red-100 text-red-800" : formData.severity >= 3 ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                >
                  {SEVERITY_LABELS[formData.severity]}
                </Badge>
              </div>

              <div>
                <Label className="text-sm font-medium">Ward</Label>
                <p className="text-sm">{formData.ward}</p>
              </div>

              {formData.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{formData.description}</p>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Attachments</Label>
                  <p className="text-sm">{selectedFiles.length} file(s) attached</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Edit Report
                </Button>
                <Button onClick={handleSubmit} disabled={ticketLoading} className="flex-1">
                  {ticketLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
