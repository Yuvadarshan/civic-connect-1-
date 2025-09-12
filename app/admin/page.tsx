"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTicketStore } from "@/store/tickets"
import { useKPIStore } from "@/store/kpis"
import Link from "next/link"
import { AlertTriangle, CheckCircle, Clock, Users, TrendingUp, MapPin, Zap, AlertCircle } from "lucide-react"
import { SEVERITY_COLORS, STATUS_COLORS } from "@/lib/constants"

export default function AdminDashboard() {
  const { tickets, fetchTickets, loading } = useTicketStore()
  const { kpis, fetchKPIs, monsoonMode, toggleMonsoonMode } = useKPIStore()

  useEffect(() => {
    fetchTickets()
    fetchKPIs()
  }, [fetchTickets, fetchKPIs])

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "Submitted").length,
    acknowledged: tickets.filter((t) => t.status === "Acknowledged").length,
    inProgress: tickets.filter((t) => t.status === "In-Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  }

  const earlyWarnings = 12 // Mock count of assets with ETA ≤ 7 days

  const recentTickets = tickets.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header with Monsoon Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time civic issue monitoring and management</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting acknowledgment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>

        {/* Early Warnings tile linking to AI Management */}
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <Link href="/admin/ai">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Early Warnings</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{earlyWarnings}</div>
              <p className="text-xs text-muted-foreground">Assets at risk ≤7 days</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* KPIs and Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KPIs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpis ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Acknowledgment Time</span>
                  <span className="font-medium">{kpis.timeToAckMedian} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Resolution Time</span>
                  <span className="font-medium">{kpis.timeToFixMedian} hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Backlog Over SLA</span>
                  <Badge variant="destructive">{kpis.backlogOverSLA}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duplicate Collapse Rate</span>
                  <span className="font-medium">{kpis.duplicateCollapseRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">First Attempt Fix Rate</span>
                  <span className="font-medium text-green-600">{kpis.firstAttemptFixRate}%</span>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">Loading metrics...</div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Recent Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground">Loading tickets...</div>
              ) : recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{ticket.title}</span>
                        <Badge className={SEVERITY_COLORS[ticket.severity]}>Severity {ticket.severity}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>{ticket.ward}</span>
                      </div>
                    </div>
                    <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">No recent tickets</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
