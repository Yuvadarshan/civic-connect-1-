"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTicketStore } from "@/store/tickets"
import { useKPIStore } from "@/store/kpis"
import { MapPin, Filter, Layers, Navigation, Zap, Activity, AlertTriangle, Calculator } from "lucide-react"

import { mockSeverityMapLayer } from "../../../api/mock-severity"

interface SeverityMarker {
  ticket_id: string
  lat: number
  lng: number
  severity: number
  confidence: number
  suggested_departments: string[]
}

export default function MapPage() {
  const { tickets, fetchTickets } = useTicketStore()
  const { monsoonMode, toggleMonsoonMode } = useKPIStore()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [clusterMode, setClusterMode] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)

  const [severityLayerEnabled, setSeverityLayerEnabled] = useState(false)
  const [severityMarkers, setSeverityMarkers] = useState<SeverityMarker[]>([])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const fetchSeverityLayer = async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      setSeverityMarkers(mockSeverityMapLayer.features || [])
    } catch (error) {
      console.error("Failed to fetch severity layer:", error)
    }
  }

  useEffect(() => {
    if (severityLayerEnabled) {
      fetchSeverityLayer()
    }
  }, [severityLayerEnabled])

  const filteredTickets = tickets.filter((ticket) => {
    if (selectedCategory !== "all" && ticket.category !== selectedCategory) return false
    if (selectedStatus !== "all" && ticket.status !== selectedStatus) return false
    return true
  })

  const categories = [...new Set(tickets.map((t) => t.category))]
  const statuses = [...new Set(tickets.map((t) => t.status))]

  // Mock map clusters for demonstration
  const clusters = [
    { id: 1, lat: 12.9716, lng: 77.5946, count: 15, severity: "High", area: "Koramangala" },
    { id: 2, lat: 12.9352, lng: 77.6245, count: 8, severity: "Medium", area: "Whitefield" },
    { id: 3, lat: 12.9698, lng: 77.75, count: 12, severity: "High", area: "Electronic City" },
    { id: 4, lat: 12.9279, lng: 77.6271, count: 5, severity: "Low", area: "Marathahalli" },
  ]

  const mockAssets = [
    {
      id: "RD-102",
      health: 45,
      eta: 12,
      type: "Road",
      severity: 3,
      confidence: 0.86,
      suggested_departments: ["Public Works", "Water Board"],
    },
    {
      id: "DR-45",
      health: 62,
      eta: 8,
      type: "Drain",
      severity: 2,
      confidence: 0.74,
      suggested_departments: ["Water Board"],
    },
    {
      id: "SL-78",
      health: 78,
      eta: 25,
      type: "Streetlight",
      severity: 1,
      confidence: 0.92,
      suggested_departments: ["Electrical"],
    },
  ]

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1:
        return "bg-green-500"
      case 2:
        return "bg-yellow-500"
      case 3:
        return "bg-orange-500"
      case 4:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Geographic View</h1>
          <p className="text-muted-foreground">Interactive map with issue clustering and heat zones</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={monsoonMode ? "default" : "outline"}
            onClick={toggleMonsoonMode}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Monsoon Mode {monsoonMode ? "ON" : "OFF"}
          </Button>
          <div className="flex items-center gap-2">
            <Switch checked={severityLayerEnabled} onCheckedChange={setSeverityLayerEnabled} />
            <Label>Severity Layer</Label>
          </div>
          <Button
            variant={clusterMode ? "default" : "outline"}
            onClick={() => setClusterMode(!clusterMode)}
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            {clusterMode ? "Cluster View" : "Individual View"}
          </Button>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Navigation className="h-4 w-4" />
            Field Teams
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Map Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">{filteredTickets.length} issues shown</Badge>
            {monsoonMode && (
              <Badge className="bg-blue-100 text-blue-800">
                <Zap className="h-3 w-3 mr-1" />
                Monsoon Risk Mode Active
              </Badge>
            )}
            {severityLayerEnabled && (
              <Badge className="bg-purple-100 text-purple-800">
                <Calculator className="h-3 w-3 mr-1" />
                Severity Layer Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Interactive Map
              {severityLayerEnabled && (
                <div className="ml-auto flex items-center gap-2 text-sm">
                  <span>Severity:</span>
                  <div className="flex gap-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs">S1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs">S2</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-xs">S3</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs">S4</span>
                    </div>
                  </div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Mock Map Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50"></div>

              {/* Mock Clusters */}
              {clusterMode
                ? clusters.map((cluster) => (
                    <div
                      key={cluster.id}
                      className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-white font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                        cluster.severity === "High"
                          ? "bg-red-500"
                          : cluster.severity === "Medium"
                            ? "bg-orange-500"
                            : "bg-yellow-500"
                      }`}
                      style={{
                        left: `${20 + cluster.id * 15}%`,
                        top: `${30 + cluster.id * 10}%`,
                      }}
                    >
                      {cluster.count}
                    </div>
                  ))
                : filteredTickets.slice(0, 20).map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="absolute w-3 h-3 bg-blue-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 80 + 10}%`,
                      }}
                    />
                  ))}

              {monsoonMode &&
                mockAssets.map((asset, index) => (
                  <Popover key={asset.id}>
                    <PopoverTrigger asChild>
                      <div
                        className={`absolute w-6 h-6 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                          severityLayerEnabled
                            ? getSeverityColor(asset.severity)
                            : asset.health < 50
                              ? "bg-red-600"
                              : asset.health < 70
                                ? "bg-orange-500"
                                : "bg-green-500"
                        }`}
                        style={{
                          left: `${60 + index * 10}%`,
                          top: `${20 + index * 15}%`,
                        }}
                      >
                        <Activity className="h-3 w-3 text-white" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{asset.id}</span>
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
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span> {asset.type}
                          </div>
                          <div>
                            <span className="text-muted-foreground">ETA:</span> {asset.eta} days
                          </div>
                          {severityLayerEnabled && (
                            <>
                              <div>
                                <span className="text-muted-foreground">Severity:</span> S{asset.severity}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Confidence:</span>{" "}
                                {(asset.confidence * 100).toFixed(0)}%
                              </div>
                            </>
                          )}
                        </div>
                        {severityLayerEnabled && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Suggested Departments:</p>
                            <div className="flex flex-wrap gap-1">
                              {asset.suggested_departments.map((dept) => (
                                <Badge key={dept} variant="secondary" className="text-xs">
                                  {dept}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <Button size="sm" className="w-full" asChild>
                          <a href={`/admin/ai?tab=severity&ticket=${asset.id}`}>
                            {severityLayerEnabled ? (
                              <>
                                <Calculator className="h-4 w-4 mr-2" />
                                Open in Severity Calculator
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Open Cause Card
                              </>
                            )}
                          </a>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}

              {severityLayerEnabled &&
                !monsoonMode &&
                severityMarkers.map((marker, index) => (
                  <Popover key={marker.ticket_id}>
                    <PopoverTrigger asChild>
                      <div
                        className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${getSeverityColor(marker.severity)}`}
                        style={{
                          left: `${(marker.lng - 77.5) * 100 + 50}%`,
                          top: `${(13 - marker.lat) * 100 + 50}%`,
                        }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{marker.ticket_id}</span>
                          <Badge className={`${getSeverityColor(marker.severity)} text-white`}>
                            S{marker.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Confidence: {(marker.confidence * 100).toFixed(0)}%
                        </p>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Suggested Departments:</p>
                          <div className="flex flex-wrap gap-1">
                            {marker.suggested_departments.map((dept) => (
                              <Badge key={dept} variant="secondary" className="text-xs">
                                {dept}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button size="sm" className="w-full" asChild>
                          <a href={`/admin/ai?tab=severity&ticket=${marker.ticket_id}`}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Open in Severity Calculator
                          </a>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}

              <div className="text-center text-muted-foreground z-10">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Interactive Map View</p>
                <p className="text-sm">Showing {filteredTickets.length} filtered issues</p>
                {monsoonMode && <p className="text-sm text-blue-600 mt-1">+ Asset health monitoring active</p>}
                {severityLayerEnabled && <p className="text-sm text-purple-600 mt-1">+ Severity scoring active</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cluster Details */}
        <Card>
          <CardHeader>
            <CardTitle>Hot Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clusters.map((cluster) => (
                <div key={cluster.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{cluster.area}</span>
                    <Badge
                      className={
                        cluster.severity === "High"
                          ? "bg-red-100 text-red-800"
                          : cluster.severity === "Medium"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {cluster.severity}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{cluster.count} active issues</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
