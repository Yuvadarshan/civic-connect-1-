"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTicketStore } from "@/store/tickets"
import { useKPIStore } from "@/store/kpis"
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Users, MapPin } from "lucide-react"
import { STATUS_COLORS, SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/constants"

export default function TransparencyPage() {
  const { tickets, fetchTickets, loading } = useTicketStore()
  const { kpis, fetchKPIs } = useKPIStore()

  useEffect(() => {
    fetchTickets({})
    fetchKPIs()
  }, [fetchTickets, fetchKPIs])

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "Submitted").length,
    inProgress: tickets.filter((t) => t.status === "In-Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  }

  const categoryStats = tickets.reduce(
    (acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const wardStats = tickets.reduce(
    (acc, ticket) => {
      acc[ticket.ward] = (acc[ticket.ward] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const recentResolvedTickets = tickets
    .filter((t) => t.status === "Resolved")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
          <BarChart3 className="h-8 w-8" />
          City Transparency Dashboard
        </h1>
        <p className="text-muted-foreground">Real-time insights into city services and issue resolution</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Issues</p>
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
              <TrendingUp className="h-8 w-8 text-blue-600" />
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Target: 85%</span>
                <span>
                  {stats.resolved} of {stats.total} resolved
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">2.3</p>
                <p className="text-sm text-muted-foreground">days average</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">High Priority</span>
                  <span className="font-medium">4.2 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Medium Priority</span>
                  <span className="font-medium">1.8 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Low Priority</span>
                  <span className="font-medium">4.1 days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Ward</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(wardStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([ward, count]) => (
                  <div key={ward} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{ward}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-secondary h-2 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-sm w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Resolutions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Recently Resolved Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading recent resolutions...</div>
          ) : recentResolvedTickets.length > 0 ? (
            <div className="space-y-4">
              {recentResolvedTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{ticket.title}</h3>
                      <Badge className={SEVERITY_COLORS[ticket.severity]}>{SEVERITY_LABELS[ticket.severity]}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{ticket.ward}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>Resolved {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No resolved issues to display yet</div>
          )}
        </CardContent>
      </Card>

      {/* Community Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Active Citizens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">3,891</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">92%</p>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
