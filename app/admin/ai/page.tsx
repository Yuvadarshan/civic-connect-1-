"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AIInsightsPanel } from "@/components/admin/ai-insights-panel"
import { useTicketStore } from "@/store/tickets"
import { Brain, Zap, AlertTriangle, CheckCircle, TrendingUp, Settings } from "lucide-react"
import { STATUS_COLORS } from "@/lib/constants"

export default function AIManagementPage() {
  const { tickets, fetchTickets, loading } = useTicketStore()
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  // Filter tickets that need AI review
  const needsReview = tickets.filter(
    (ticket) => ticket.status === "Submitted" && !ticket.timeline.some((event) => event.type === "acknowledged"),
  )

  const highConfidenceTickets = needsReview.slice(0, Math.floor(needsReview.length * 0.7))
  const lowConfidenceTickets = needsReview.slice(Math.floor(needsReview.length * 0.7))

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets((prev) => (prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Management</h1>
        <p className="text-muted-foreground">Monitor and manage AI-powered triage and deduplication</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Confidence</p>
                    <p className="text-2xl font-bold text-green-600">{highConfidenceTickets.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Needs Review</p>
                    <p className="text-2xl font-bold text-orange-600">{lowConfidenceTickets.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Processing</p>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                  </div>
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* High Confidence Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  High Confidence Tickets
                </span>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Zap className="h-4 w-4 mr-1" />
                  Auto-Acknowledge All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {highConfidenceTickets.length > 0 ? (
                <div className="space-y-3">
                  {highConfidenceTickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleTicketSelection(ticket.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedTickets.includes(ticket.id)}
                            onChange={() => toggleTicketSelection(ticket.id)}
                            className="rounded"
                          />
                          <span className="font-medium text-sm">{ticket.title}</span>
                          <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>{ticket.ward}</span>
                          <span>•</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            92% Confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {highConfidenceTickets.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{highConfidenceTickets.length - 5} more tickets
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No high confidence tickets pending</p>
              )}
            </CardContent>
          </Card>

          {/* Low Confidence Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Tickets Needing Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowConfidenceTickets.length > 0 ? (
                <div className="space-y-3">
                  {lowConfidenceTickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{ticket.title}</span>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            45% Confidence
                          </Badge>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>AI Suggestion: {ticket.category} • Manual review recommended</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No tickets need manual review</p>
              )}
            </CardContent>
          </Card>

          {/* AI Training & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Model Performance:</strong> AI accuracy has improved by 12% this month through continuous
                  learning
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  <Brain className="h-4 w-4 mr-2" />
                  Retrain Models
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Adjust Thresholds
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <AIInsightsPanel showBatchProcessing={true} />
        </div>
      </div>
    </div>
  )
}
