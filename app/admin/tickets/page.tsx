"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useTicketStore } from "@/store/tickets"
import { BulkOperations } from "@/components/admin/bulk-operations"
import { CATEGORIES, SEVERITY_LABELS, STATUS_COLORS, SEVERITY_COLORS } from "@/lib/constants"
import { Search, Filter, Eye, CheckCircle, Clock, Download } from "lucide-react"
import type { Category, Severity, TicketStatus } from "@/types"

export default function TicketsPage() {
  const { tickets, fetchTickets, acknowledgeTicket, loading } = useTicketStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all")
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"date" | "severity" | "status">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
      const matchesSeverity = severityFilter === "all" || ticket.severity === severityFilter

      return matchesSearch && matchesCategory && matchesStatus && matchesSeverity
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "severity":
          comparison = b.severity - a.severity // Higher severity first
          break
        case "status":
          const statusOrder = { Submitted: 0, Acknowledged: 1, "In-Progress": 2, Resolved: 3 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
      }
      return sortOrder === "desc" ? -comparison : comparison
    })

  const handleAcknowledge = async (ticketId: string) => {
    await acknowledgeTicket(ticketId, "Issue acknowledged and assigned to appropriate department")
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(filteredTickets.map((t) => t.id))
    } else {
      setSelectedTickets([])
    }
  }

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    if (checked) {
      setSelectedTickets((prev) => [...prev, ticketId])
    } else {
      setSelectedTickets((prev) => prev.filter((id) => id !== ticketId))
    }
  }

  const exportTickets = () => {
    const csvContent = [
      ["ID", "Title", "Category", "Status", "Severity", "Ward", "Created", "Description"].join(","),
      ...filteredTickets.map((ticket) =>
        [
          ticket.id,
          `"${ticket.title}"`,
          ticket.category,
          ticket.status,
          ticket.severity,
          ticket.ward,
          ticket.createdAt,
          `"${ticket.description || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ticket Management</h1>
          <p className="text-muted-foreground">Review, acknowledge, and manage civic issue reports</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={exportTickets} className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Badge variant="outline">{filteredTickets.length} tickets</Badge>
        </div>
      </div>

      {/* Bulk Operations */}
      <BulkOperations selectedTickets={selectedTickets} onSelectionChange={setSelectedTickets} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as Category | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatus | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                <SelectItem value="In-Progress">In-Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={severityFilter.toString()}
              onValueChange={(value) =>
                setSeverityFilter(value === "all" ? "all" : (Number.parseInt(value) as Severity))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [sort, order] = value.split("-")
                setSortBy(sort as "date" | "severity" | "status")
                setSortOrder(order as "asc" | "desc")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="severity-desc">High Severity First</SelectItem>
                <SelectItem value="severity-asc">Low Severity First</SelectItem>
                <SelectItem value="status-asc">Status: Submitted First</SelectItem>
                <SelectItem value="status-desc">Status: Resolved First</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("all")
                setStatusFilter("all")
                setSeverityFilter("all")
                setSelectedTickets([])
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTickets.length === filteredTickets.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">Select All ({filteredTickets.length} tickets)</span>
                {selectedTickets.length > 0 && <Badge variant="secondary">{selectedTickets.length} selected</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">Loading tickets...</div>
            </CardContent>
          </Card>
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className={selectedTickets.includes(ticket.id) ? "ring-2 ring-primary/20 bg-primary/5" : ""}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={(checked) => handleSelectTicket(ticket.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{ticket.title}</h3>
                        <Badge className={STATUS_COLORS[ticket.status]}>{ticket.status}</Badge>
                        <Badge className={SEVERITY_COLORS[ticket.severity]}>{SEVERITY_LABELS[ticket.severity]}</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{ticket.category}</span>
                        <span>•</span>
                        <span>{ticket.ward}</span>
                        <span>•</span>
                        <span>Reported {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.dept && (
                          <>
                            <span>•</span>
                            <span>{ticket.dept}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    {ticket.status === "Submitted" && (
                      <Button
                        size="sm"
                        onClick={() => handleAcknowledge(ticket.id)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}

                    {ticket.status === "Acknowledged" && (
                      <Button variant="secondary" size="sm">
                        <Clock className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">No tickets found matching your filters</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
