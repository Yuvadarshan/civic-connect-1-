"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTicketStore } from "@/store/tickets"
import { STATUS_COLORS, SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/constants"
import { MapPin, Clock, CheckCircle, Star, MessageCircle } from "lucide-react"

export default function MyReportsPage() {
  const searchParams = useSearchParams()
  const newTicketId = searchParams.get("new")

  const { tickets, fetchTickets, loading } = useTicketStore()

  useEffect(() => {
    fetchTickets({ mine: true, userId: "user-1" })
  }, [fetchTickets])

  const userTickets = tickets.filter((t) => t.reporterId === "user-1")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Reports</h1>
        <p className="text-muted-foreground">Track the status of your civic issue reports</p>
      </div>

      {/* New ticket success message */}
      {newTicketId && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your report has been submitted successfully! We'll notify you when it's acknowledged.
          </AlertDescription>
        </Alert>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">Loading your reports...</div>
            </CardContent>
          </Card>
        ) : userTickets.length > 0 ? (
          userTickets.map((ticket) => (
            <Card key={ticket.id} className={newTicketId === ticket.id ? "ring-2 ring-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                      <Badge className={SEVERITY_COLORS[ticket.severity]}>{SEVERITY_LABELS[ticket.severity]}</Badge>
                      <span className="text-sm text-muted-foreground">{ticket.category}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>#{ticket.id.slice(-6)}</p>
                    <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.description && <p className="text-sm text-muted-foreground">{ticket.description}</p>}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {ticket.ward}
                  </div>
                  {ticket.dept && (
                    <div className="flex items-center gap-1">
                      <span>Assigned to {ticket.dept}</span>
                    </div>
                  )}
                  {ticket.eta && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ETA: {ticket.eta}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="border-l-2 border-muted pl-4 space-y-2">
                  {ticket.timeline.map((event) => (
                    <div key={event.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{event.type.replace("_", " ")}</span>
                        <span className="text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
                      </div>
                      {event.message && <p className="text-muted-foreground mt-1">{event.message}</p>}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      View Location
                    </Button>
                    {ticket.media.length > 0 && (
                      <Button variant="outline" size="sm">
                        View Photos ({ticket.media.length})
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {ticket.status === "Resolved" && !ticket.rating && (
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                        <Star className="h-4 w-4 mr-1" />
                        Rate Resolution
                      </Button>
                    )}
                    {ticket.status === "Resolved" && ticket.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{ticket.rating}/5</span>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't reported any issues yet. Help improve your community by reporting civic issues.
              </p>
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Report Your First Issue
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
