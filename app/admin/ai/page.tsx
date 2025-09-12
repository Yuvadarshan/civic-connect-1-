"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import {
  Brain,
  TrendingDown,
  AlertTriangle,
  Activity,
  Zap,
  MapPin,
  Plus,
  Download,
  Info,
  Clock,
  Target,
  CheckCircle,
  Send,
  ShoppingCart,
} from "lucide-react"

import { mockEnhancedSimulation } from "../../../api/mock-enhanced-uhf"
import { mockSeverityTickets, mockSeverityScore, mockSeverityDistribution } from "../../../api/mock-severity"

interface SeverityTicket {
  id: string
  title: string
  ward: string
  category: string
  severity: number
  confidence: number
  suggested_departments: string[]
  sla_target: number
  status: "high_confidence" | "needs_review" | "processing"
}

interface SeverityScore {
  severity: number
  score: number
  confidence: number
  factors: string[]
  departments: Array<{ name: string; p: number }>
  sla_target_mins: number
}

interface SeverityDistribution {
  s1: number
  s2: number
  s3: number
  s4: number
}

interface EnhancedSimulationResult {
  summary: {
    prevented_damage: number
    complaints_reduction: number
    sla_breach_reduction: number
    budget_utilization: number
  }
  ranked: Array<{
    asset: string
    ward: string
    cost: number
    prevented_damage: number
    rop: number
    complaints_drop: number
    risk_drop: number
    post_fix_eta: number
  }>
  sensitivity: Array<{
    asset: string
    rank_vs_weight: Array<{ w: number; rank: number }>
  }>
}

interface Asset {
  id: string
  ward: string
  health: number
  p10: number
  p90: number
  eta_days: [number, number]
  failure_curve: number[]
  fused: {
    weather: string
    traffic: string
    geology: string
  }
}

interface SimulationResult {
  summary: {
    prevented_damage: number
    complaints_reduction: number
    sla_breach_reduction: number
    budget_utilization: number
  }
  ranked: Array<{
    asset: string
    ward: string
    cost: number
    prevented_damage: number
    rop: number
    complaints_drop: number
    risk_drop: number
    post_fix_eta: number
  }>
}

interface Issue {
  id: string
  title: string
  type: string
  ward: string
  created_at: string
  status: string
}

interface CauseAnalysis {
  cause: string
  confidence: number
  evidence: Array<{
    type: string
    value: string
  }>
  departments: string[]
  action: string
  expected_reduction: number
}

interface AdminTicket {
  id: string
  title: string
  ward: string
  category: string
  severity: number
  confidence: number
  departments: string[]
  status: "Open" | "Closed" | "Pending"
  location: {
    lat: number
    lng: number
  }
}

export default function AIManagementPage() {
  const [activeTab, setActiveTab] = useState("severity")

  const [severityWard, setSeverityWard] = useState("ALL")
  const [severityCategory, setSeverityCategory] = useState("ALL")
  const [severityDateRange, setSeverityDateRange] = useState("7d")
  const [severityTickets, setSeverityTickets] = useState<SeverityTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SeverityTicket | null>(null)
  const [severityScore, setSeverityScore] = useState<SeverityScore | null>(null)
  const [severityDistribution, setSeverityDistribution] = useState<SeverityDistribution | null>(null)
  const [severityLoading, setSeverityLoading] = useState(false)

  // Urban Health Forecaster state
  const [city, setCity] = useState("Ranchi")
  const [ward, setWard] = useState("ALL")
  const [assetType, setAssetType] = useState("ALL")
  const [timeHorizon, setTimeHorizon] = useState("30")
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)

  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [budget, setBudget] = useState(5000000)
  const [horizon, setHorizon] = useState("30")
  const [preMonsoon, setPreMonsoon] = useState(true)
  const [equityMin, setEquityMin] = useState(0.2)
  const [damageWeight, setDamageWeight] = useState(0.5)
  const [complaintsWeight, setComplaintsWeight] = useState(0.3)
  const [breachesWeight, setBreachesWeight] = useState(0.2)
  const [includeWards, setIncludeWards] = useState<string[]>(["W1", "W2", "W3", "W4"])
  const [simulationResult, setSimulationResult] = useState<EnhancedSimulationResult | null>(null)
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  // Root Cause Diagnostic state
  const [issues, setIssues] = useState<Issue[]>([])
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [causeAnalysis, setCauseAnalysis] = useState<CauseAnalysis | null>(null)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

  // Admin Tickets State
  const [adminTickets, setAdminTickets] = useState<AdminTicket[]>([
    {
      id: "AT-001",
      title: "Water Leak on Main Street",
      ward: "W1",
      category: "Water",
      severity: 1,
      confidence: 0.95,
      departments: ["Water Board"],
      status: "Open",
      location: { lat: 23.3441, lng: 85.3096 },
    },
    {
      id: "AT-002",
      title: "Pothole near City Hall",
      ward: "W2",
      category: "Roads",
      severity: 2,
      confidence: 0.88,
      departments: ["Public Works"],
      status: "Open",
      location: { lat: 23.3522, lng: 85.3184 },
    },
    {
      id: "AT-003",
      title: "Garbage Overflow at Market",
      ward: "W3",
      category: "Sanitation",
      severity: 3,
      confidence: 0.75,
      departments: ["Sanitation"],
      status: "Open",
      location: { lat: 23.3389, lng: 85.3021 },
    },
    {
      id: "AT-004",
      title: "Streetlight Outage near Park",
      ward: "W4",
      category: "Lighting",
      severity: 4,
      confidence: 0.92,
      departments: ["Electrical"],
      status: "Open",
      location: { lat: 23.3478, lng: 85.3135 },
    },
  ])

  // Mock API calls
  const fetchAssets = async () => {
    setLoading(true)
    // Mock API call
    setTimeout(() => {
      const mockAssets: Asset[] = [
        {
          id: "RD-102",
          ward: "W2",
          health: 62,
          p10: 55,
          p90: 70,
          eta_days: [12, 24],
          failure_curve: [0.08, 0.12, 0.18, 0.25],
          fused: { weather: "rain_+2σ", traffic: "p85", geology: "low_stability" },
        },
        {
          id: "DR-45",
          ward: "W1",
          health: 45,
          p10: 38,
          p90: 52,
          eta_days: [5, 15],
          failure_curve: [0.15, 0.22, 0.35, 0.48],
          fused: { weather: "rain_+1σ", traffic: "p92", geology: "medium_stability" },
        },
        {
          id: "SL-78",
          ward: "W3",
          health: 78,
          p10: 72,
          p90: 85,
          eta_days: [25, 45],
          failure_curve: [0.05, 0.08, 0.12, 0.18],
          fused: { weather: "normal", traffic: "p65", geology: "high_stability" },
        },
      ]
      setAssets(mockAssets)
      setLoading(false)
    }, 1000)
  }

  const runSimulation = async () => {
    // Mock simulation API call
    setTimeout(() => {
      const mockResult: SimulationResult = {
        summary: {
          prevented_damage: 1500000,
          complaints_reduction: 0.4,
          sla_breach_reduction: 0.18,
          budget_utilization: 0.96,
        },
        ranked: [
          {
            asset: "RD-102",
            ward: "W2",
            cost: 900000,
            prevented_damage: 450000,
            rop: 0.5,
            complaints_drop: 0.32,
            risk_drop: 0.41,
            post_fix_eta: 90,
          },
          {
            asset: "DR-12",
            ward: "W4",
            cost: 600000,
            prevented_damage: 360000,
            rop: 0.6,
            complaints_drop: 0.28,
            risk_drop: 0.37,
            post_fix_eta: 120,
          },
        ],
      }
      setSimulationResult(mockResult)
    }, 1500)
  }

  const fetchIssues = async () => {
    // Mock issues API call
    const mockIssues: Issue[] = [
      {
        id: "ISS-778",
        title: "Pothole on Main Street",
        type: "Road",
        ward: "W2",
        created_at: "2024-01-15",
        status: "Open",
      },
      {
        id: "ISS-779",
        title: "Blocked drain near market",
        type: "Drainage",
        ward: "W1",
        created_at: "2024-01-14",
        status: "Open",
      },
      {
        id: "ISS-780",
        title: "Streetlight not working",
        type: "Lighting",
        ward: "W3",
        created_at: "2024-01-13",
        status: "Open",
      },
    ]
    setIssues(mockIssues)
  }

  const diagnoseIssue = async (issueId: string) => {
    // Mock diagnosis API call
    setTimeout(() => {
      const mockAnalysis: CauseAnalysis = {
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
      setCauseAnalysis(mockAnalysis)
      setSelectedDepartments(mockAnalysis.departments)
    }, 1000)
  }

  const createLinkedTickets = async () => {
    // Mock ticket creation API call
    setTimeout(() => {
      alert("Created tickets: PW-9912, WB-5531")
    }, 500)
  }

  const fetchSeverityData = async () => {
    setSeverityLoading(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Filter mock data based on current filters
      const filteredTickets = mockSeverityTickets.filter((ticket) => {
        const matchesWard = severityWard === "all" || ticket.ward === severityWard
        const matchesCategory = severityCategory === "all" || ticket.category === severityCategory
        return matchesWard && matchesCategory
      })

      setSeverityTickets(filteredTickets)
      setSeverityDistribution(mockSeverityDistribution)
    } catch (error) {
      console.error("Failed to fetch severity data:", error)
    } finally {
      setSeverityLoading(false)
    }
  }

  const scoreTicket = async (ticketId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSeverityScore(mockSeverityScore)
    } catch (error) {
      console.error("Failed to score ticket:", error)
    }
  }

  const routeTicket = async (ticketId: string, departments: string[], severity: number) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Ticket routed successfully" })
    } catch (error) {
      console.error("Failed to route ticket:", error)
    }
  }

  const runEnhancedSimulation = useCallback(async () => {
    setIsSimulating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSimulationResult(mockEnhancedSimulation)
    } catch (error) {
      console.error("Failed to run simulation:", error)
    } finally {
      setIsSimulating(false)
    }
  }, [budget, horizon, preMonsoon, damageWeight, complaintsWeight, breachesWeight, equityMin, includeWards])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (simulatorOpen) {
        runEnhancedSimulation()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [
    budget,
    damageWeight,
    complaintsWeight,
    breachesWeight,
    equityMin,
    includeWards,
    runEnhancedSimulation,
    simulatorOpen,
  ])

  useEffect(() => {
    fetchAssets()
    fetchIssues()
    fetchSeverityData()
  }, [])

  const severityKpis = severityDistribution
    ? {
        highConfidence: severityTickets.filter((t) => t.status === "high_confidence").length,
        needsReview: severityTickets.filter((t) => t.status === "needs_review").length,
        processing: severityTickets.filter((t) => t.status === "processing").length,
        triageAccuracy: 87,
        avgProcessingTime: 4.2,
        totalScored:
          severityDistribution.s1 + severityDistribution.s2 + severityDistribution.s3 + severityDistribution.s4,
      }
    : null

  const kpiData = {
    atRiskAssets: assets.filter((a) => a.eta_days[1] <= 30).length,
    projectedBreaches: 8,
    avgHealthScore: Math.round(assets.reduce((sum, a) => sum + a.health, 0) / assets.length || 0),
    uncertaintyWidth: 15,
  }

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "bg-green-100 text-green-800"
      case 2:
        return "bg-yellow-100 text-yellow-800"
      case 3:
        return "bg-orange-100 text-orange-800"
      case 4:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const normalizeWeights = () => {
    const total = damageWeight + complaintsWeight + breachesWeight
    if (total !== 1) {
      const factor = 1 / total
      setDamageWeight(damageWeight * factor)
      setComplaintsWeight(complaintsWeight * factor)
      setBreachesWeight(breachesWeight * factor)
    }
  }

  const handleViewOnMap = (ticket: AdminTicket) => {
    alert(`Navigating to location: Lat ${ticket.location.lat}, Lng ${ticket.location.lng}`)
  }

  const handleRouteTicket = (ticket: AdminTicket) => {
    alert(`Routing ticket ${ticket.id} to appropriate department(s).`)
  }

  const handleMapMarkerClick = (ticket: AdminTicket) => {
    alert(`Ticket ${ticket.id} selected: ${ticket.title}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Management</h1>
        <p className="text-muted-foreground">
          Severity Calculator, Urban Health Forecasting and Root Cause Diagnostics
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="severity">Severity Calculator</TabsTrigger>
          <TabsTrigger value="forecaster">Urban Health Forecaster & Resource Simulator</TabsTrigger>
          <TabsTrigger value="diagnostics">Root Cause Diagnostic Engine</TabsTrigger>
        </TabsList>

        <TabsContent value="severity" className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {adminTickets.filter((t) => t.severity === 1).length}
                </div>
                <p className="text-sm text-muted-foreground">S1 Critical</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {adminTickets.filter((t) => t.severity === 2).length}
                </div>
                <p className="text-sm text-muted-foreground">S2 High</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {adminTickets.filter((t) => t.severity === 3).length}
                </div>
                <p className="text-sm text-muted-foreground">S3 Medium</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {adminTickets.filter((t) => t.severity === 4).length}
                </div>
                <p className="text-sm text-muted-foreground">S4 Low</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{adminTickets.filter((t) => t.status === "Open").length}</div>
                <p className="text-sm text-muted-foreground">Total Open</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin Tickets Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Admin Tickets with Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminTickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{ticket.id}</span>
                            <Badge variant="outline">{ticket.ward}</Badge>
                            <Badge variant="outline">{ticket.category}</Badge>
                            <Badge className={getSeverityColor(ticket.severity)}>S{ticket.severity}</Badge>
                            <Badge className="bg-blue-100 text-blue-800">{(ticket.confidence * 100).toFixed(0)}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{ticket.title}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Dept: {ticket.departments.join(", ")}</span>
                            <span>Status: {ticket.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewOnMap(ticket)}>
                            <MapPin className="h-4 w-4 mr-1" />
                            View on Map
                          </Button>
                          <Button size="sm" onClick={() => handleRouteTicket(ticket)}>
                            <Send className="h-4 w-4 mr-1" />
                            Route
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Mini Severity Map */}
            <Card>
              <CardHeader>
                <CardTitle>Severity Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                    {adminTickets.map((ticket, index) => (
                      <div
                        key={ticket.id}
                        className={`absolute w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                          ticket.severity === 1
                            ? "bg-red-500"
                            : ticket.severity === 2
                              ? "bg-orange-500"
                              : ticket.severity === 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                        }`}
                        style={{
                          left: `${20 + (index % 5) * 15}%`,
                          top: `${20 + Math.floor(index / 5) * 20}%`,
                        }}
                        onClick={() => handleMapMarkerClick(ticket)}
                        title={`${ticket.id}: ${ticket.title}`}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>S1 Critical</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>S2 High</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>S3 Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>S4 Low</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecaster" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>City/Ward</Label>
                  <Select value={ward} onValueChange={setWard}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Wards</SelectItem>
                      <SelectItem value="W1">Ward 1</SelectItem>
                      <SelectItem value="W2">Ward 2</SelectItem>
                      <SelectItem value="W3">Ward 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Asset Type</Label>
                  <Select value={assetType} onValueChange={setAssetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="Road">Road</SelectItem>
                      <SelectItem value="Drain">Drain</SelectItem>
                      <SelectItem value="Streetlight">Streetlight</SelectItem>
                      <SelectItem value="Bin">Bin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time Horizon</Label>
                  <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchAssets} disabled={loading}>
                    {loading ? "Loading..." : "Update Forecast"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Strip */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">At-Risk Assets (≤30d)</p>
                    <p className="text-2xl font-bold text-red-600">{kpiData.atRiskAssets}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Projected SLA Breaches</p>
                    <p className="text-2xl font-bold text-orange-600">{kpiData.projectedBreaches}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Health Score</p>
                    <p className="text-2xl font-bold text-blue-600">{kpiData.avgHealthScore}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Uncertainty Width (p90-p10)</p>
                    <p className="text-2xl font-bold text-green-600">{kpiData.uncertaintyWidth}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Health Table */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Asset Health Analysis</CardTitle>
                  <Sheet open={simulatorOpen} onOpenChange={setSimulatorOpen}>
                    <SheetTrigger asChild>
                      <Button>
                        <Target className="h-4 w-4 mr-2" />
                        Resource Simulator
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[700px] sm:w-[900px]">
                      <SheetHeader>
                        <SheetTitle>Enhanced Resource Simulator</SheetTitle>
                      </SheetHeader>
                      <div className="space-y-6 mt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Budget (₹)</Label>
                            <Slider
                              value={[budget]}
                              onValueChange={(value) => setBudget(value[0])}
                              max={10000000}
                              min={1000000}
                              step={100000}
                              className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground mt-1">₹{budget.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label>Horizon (days)</Label>
                            <Input value={horizon} onChange={(e) => setHorizon(e.target.value)} />
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-medium">Objective Weights</Label>
                          <div className="grid grid-cols-3 gap-4 mt-2">
                            <div>
                              <Label className="text-sm">Prevented Damage</Label>
                              <Slider
                                value={[damageWeight]}
                                onValueChange={(value) => setDamageWeight(value[0])}
                                max={1}
                                min={0}
                                step={0.1}
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground">{(damageWeight * 100).toFixed(0)}%</p>
                            </div>
                            <div>
                              <Label className="text-sm">Complaint Reduction</Label>
                              <Slider
                                value={[complaintsWeight]}
                                onValueChange={(value) => setComplaintsWeight(value[0])}
                                max={1}
                                min={0}
                                step={0.1}
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground">{(complaintsWeight * 100).toFixed(0)}%</p>
                            </div>
                            <div>
                              <Label className="text-sm">SLA Breach Reduction</Label>
                              <Slider
                                value={[breachesWeight]}
                                onValueChange={(value) => setBreachesWeight(value[0])}
                                max={1}
                                min={0}
                                step={0.1}
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground">{(breachesWeight * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={normalizeWeights}
                            className="mt-2 bg-transparent"
                          >
                            Normalize to 100%
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Equity Minimum (% for low-report wards)</Label>
                            <Slider
                              value={[equityMin]}
                              onValueChange={(value) => setEquityMin(value[0])}
                              max={0.5}
                              min={0}
                              step={0.05}
                              className="mt-2"
                            />
                            <p className="text-sm text-muted-foreground">{(equityMin * 100).toFixed(0)}%</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-6">
                            <Switch checked={preMonsoon} onCheckedChange={setPreMonsoon} />
                            <Label>Pre-Monsoon Priority</Label>
                          </div>
                        </div>

                        {isSimulating && (
                          <div className="text-center py-4">
                            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              Recomputing...
                            </div>
                          </div>
                        )}

                        {simulationResult && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                              <div>
                                <p className="text-sm text-muted-foreground">Prevented Damage</p>
                                <p className="text-lg font-bold">
                                  ₹{simulationResult.summary.prevented_damage.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Complaint Reduction</p>
                                <p className="text-lg font-bold">
                                  {(simulationResult.summary.complaints_reduction * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">SLA Breach Reduction</p>
                                <p className="text-lg font-bold">
                                  {(simulationResult.summary.sla_breach_reduction * 100).toFixed(0)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Budget Utilization</p>
                                <p className="text-lg font-bold">
                                  {(simulationResult.summary.budget_utilization * 100).toFixed(0)}%
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium">Ranked Interventions</h4>
                              <div className="max-h-64 overflow-y-auto">
                                {simulationResult.ranked.map((intervention, index) => (
                                  <div key={index} className="p-3 border rounded-lg mb-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium">#{index + 1}</span>
                                          <span className="font-medium">{intervention.asset}</span>
                                          <Badge variant="outline">{intervention.ward}</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                          <span>Cost: ₹{intervention.cost.toLocaleString()}</span>
                                          <span>Prevented: ₹{intervention.prevented_damage.toLocaleString()}</span>
                                          <span>RoP: {intervention.rop.toFixed(2)}</span>
                                          <span>Risk ↓{(intervention.risk_drop * 100).toFixed(0)}%</span>
                                          <span>Complaints ↓{(intervention.complaints_drop * 100).toFixed(0)}%</span>
                                          <span>ETA: {intervention.post_fix_eta}d</span>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant={
                                          selectedInterventions.includes(intervention.asset) ? "default" : "outline"
                                        }
                                        onClick={() => {
                                          if (selectedInterventions.includes(intervention.asset)) {
                                            setSelectedInterventions((prev) =>
                                              prev.filter((id) => id !== intervention.asset),
                                            )
                                          } else {
                                            setSelectedInterventions((prev) => [...prev, intervention.asset])
                                          }
                                        }}
                                      >
                                        {selectedInterventions.includes(intervention.asset) ? (
                                          <>
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Added
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add to Plan
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {simulationResult.sensitivity && (
                              <div>
                                <h4 className="font-medium mb-2">Sensitivity Analysis (Top 5)</h4>
                                <div className="space-y-2">
                                  {simulationResult.sensitivity.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                      <span className="w-16 font-medium">{item.asset}</span>
                                      <div className="flex-1 flex gap-1">
                                        {item.rank_vs_weight.map((point, i) => (
                                          <div
                                            key={i}
                                            className="h-4 bg-blue-200 rounded"
                                            style={{ width: `${20 - point.rank * 4}px` }}
                                            title={`Weight: ${point.w}, Rank: ${point.rank}`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assets.map((asset) => (
                    <div key={asset.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{asset.id}</span>
                            <Badge variant="outline">{asset.ward}</Badge>
                            <Badge
                              className={
                                asset.health < 50
                                  ? "bg-red-100 text-red-800"
                                  : asset.health < 70
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-green-100 text-green-800"
                              }
                            >
                              Health: {asset.health}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Uncertainty: {asset.p10}-{asset.p90}
                            </span>
                            <span>
                              ETA: {asset.eta_days[0]}-{asset.eta_days[1]} days
                            </span>
                            <div className="flex gap-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Badge variant="secondary" className="cursor-pointer">
                                    <Info className="h-3 w-3 mr-1" />
                                    Fused Inputs
                                  </Badge>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <div className="space-y-2">
                                    <p>
                                      <strong>Weather:</strong> {asset.fused.weather}
                                    </p>
                                    <p>
                                      <strong>Traffic:</strong> {asset.fused.traffic}
                                    </p>
                                    <p>
                                      <strong>Geology:</strong> {asset.fused.geology}
                                    </p>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MapPin className="h-4 w-4 mr-1" />
                            View on Map
                          </Button>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Plan
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Plan Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedInterventions.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {selectedInterventions.map((assetId) => {
                          const intervention = simulationResult?.ranked.find((r) => r.asset === assetId)
                          return intervention ? (
                            <div key={assetId} className="p-2 border rounded text-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{intervention.asset}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    setSelectedInterventions((prev) => prev.filter((id) => id !== assetId))
                                  }
                                >
                                  ×
                                </Button>
                              </div>
                              <p className="text-muted-foreground">₹{intervention.cost.toLocaleString()}</p>
                            </div>
                          ) : null
                        })}
                      </div>

                      <div className="border-t pt-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Cost:</span>
                          <span className="font-medium">
                            ₹
                            {simulationResult?.ranked
                              .filter((r) => selectedInterventions.includes(r.asset))
                              .reduce((sum, r) => sum + r.cost, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Prevented:</span>
                          <span className="font-medium">
                            ₹
                            {simulationResult?.ranked
                              .filter((r) => selectedInterventions.includes(r.asset))
                              .reduce((sum, r) => sum + r.prevented_damage, 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button variant="outline" className="w-full bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Export Plan (JSON)
                        </Button>
                        <Button variant="outline" className="w-full bg-transparent">
                          <Download className="h-4 w-4 mr-2" />
                          Export Plan (CSV)
                        </Button>
                        <Button className="w-full">Apply Plan</Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No interventions selected</p>
                      <p className="text-sm">Add assets to build your plan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issue Cluster Map & Recent Issues */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Issue Cluster Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mini Map */}
                  <div>
                    <h4 className="font-medium mb-2">Spatial Clusters</h4>
                    <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg"></div>
                      <div className="absolute w-4 h-4 bg-red-500 rounded-full top-8 left-12"></div>
                      <div className="absolute w-3 h-3 bg-orange-500 rounded-full top-16 right-16"></div>
                      <div className="absolute w-2 h-2 bg-yellow-500 rounded-full bottom-12 left-20"></div>
                      <div className="text-center text-muted-foreground z-10">
                        <MapPin className="h-8 w-8 mx-auto mb-1 opacity-50" />
                        <p className="text-sm">Issue Clusters</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Issues */}
                  <div>
                    <h4 className="font-medium mb-2">Recent Issues</h4>
                    <div className="space-y-2">
                      {issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-2 border rounded cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedIssue(issue)
                            diagnoseIssue(issue.id)
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{issue.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {issue.type} • {issue.ward}
                              </p>
                            </div>
                            <Badge variant="outline">{issue.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cause Card */}
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedIssue && causeAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{selectedIssue.title}</h4>
                      <p className="text-sm text-muted-foreground">{selectedIssue.id}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Root Cause</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {(causeAnalysis.confidence * 100).toFixed(0)}% Confidence
                        </Badge>
                      </div>
                      <p className="text-sm">{causeAnalysis.cause}</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Evidence</h5>
                      <div className="space-y-1">
                        {causeAnalysis.evidence.map((evidence, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>{evidence.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-2">Linked Departments</h5>
                      <div className="space-y-1">
                        {causeAnalysis.departments.map((dept) => (
                          <div key={dept} className="flex items-center space-x-2">
                            <Checkbox
                              id={dept}
                              checked={selectedDepartments.includes(dept)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDepartments([...selectedDepartments, dept])
                                } else {
                                  setSelectedDepartments(selectedDepartments.filter((d) => d !== dept))
                                }
                              }}
                            />
                            <Label htmlFor={dept} className="text-sm">
                              {dept}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium mb-1">Recommended Action</h5>
                      <p className="text-sm text-muted-foreground">{causeAnalysis.action}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Expected {(causeAnalysis.expected_reduction * 100).toFixed(0)}% reduction
                      </p>
                    </div>

                    <Button
                      onClick={createLinkedTickets}
                      className="w-full"
                      disabled={selectedDepartments.length === 0}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Create Linked Tickets
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select an issue to analyze</p>
                    <p className="text-sm">Click on any recent issue to start diagnosis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
