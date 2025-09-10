"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTicketStore } from "@/store/tickets"
import { Plus, MapPin, Clock, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react"
import { STATUS_COLORS, SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/constants"

export default function CitizenHome() {
  const { tickets, fetchTickets, loading } = useTicketStore()

  useEffect(() => {
    // Fetch user's tickets
    fetchTickets({ mine: true, userId: "user-1" })
  }, [fetchTickets])

  const userTickets = tickets.filter((t) => t.reporterId === "user-1")
  const recentTickets = userTickets.slice(0, 3)

  const stats = {
    total: userTickets.length,
    pending: userTickets.filter((t) => t.status === "Submitted").length,
    inProgress: userTickets.filter((t) => t.status === "In-Progress").length,
    resolved: userTickets.filter((t) => t.status === "Resolved").length,
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Priya!</h1>
        <p className="text-muted-foreground mb-6">Help make your community better by reporting issues</p>
        <Link href="/citizen/report">
          <Button size="lg" className="bg-secondary hover:bg-secondary/90">
            <Plus className="h-5 w-5 mr-2" />
            Report New Issue
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Recent Reports
            </span>
            <Link href="/citizen/reports">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading your reports...</div>
          ) : recentTickets.length > 0 ? (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{ticket.title}</h3>
                      <Badge className={SEVERITY_COLORS[ticket.severity]}>{SEVERITY_LABELS[ticket.severity]}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>{ticket.ward}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't reported any issues yet</p>
              <Link href="/citizen/report">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Report Your First Issue
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/citizen/report">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Report New Issue
              </Button>
            </Link>
            <Link href="/citizen/reports">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <MapPin className="h-4 w-4 mr-2" />
                Track My Reports
              </Button>
            </Link>
            <Link href="/citizen/transparency">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                View City Stats
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your Points</span>
                <span className="font-bold text-primary">150 pts</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Community Rank</span>
                <span className="font-bold">#23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Badges Earned</span>
                <div className="flex gap-1">
                  <Badge variant="secondary">First Reporter</Badge>
                  <Badge variant="secondary">Helper</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
