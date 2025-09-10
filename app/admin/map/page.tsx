"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTicketStore } from "@/store/tickets"
import { MapPin, Filter, Layers, Navigation } from "lucide-react"

export default function MapPage() {
  const { tickets, fetchTickets } = useTicketStore()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [clusterMode, setClusterMode] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

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

              <div className="text-center text-muted-foreground z-10">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Interactive Map View</p>
                <p className="text-sm">Showing {filteredTickets.length} filtered issues</p>
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
