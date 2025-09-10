"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTicketStore } from "@/store/tickets"
import { CheckSquare } from "lucide-react"

interface BulkOperationsProps {
  selectedTickets: string[]
  onSelectionChange: (ticketIds: string[]) => void
}

export function BulkOperations({ selectedTickets, onSelectionChange }: BulkOperationsProps) {
  const { tickets, updateTicketStatus, assignTicket } = useTicketStore()
  const [bulkAction, setBulkAction] = useState("")
  const [assignee, setAssignee] = useState("")

  const selectedTicketData = tickets.filter((t) => selectedTickets.includes(t.id))

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTickets.length === 0) return

    switch (bulkAction) {
      case "acknowledge":
        for (const ticketId of selectedTickets) {
          await updateTicketStatus(ticketId, "Acknowledged")
        }
        break
      case "in-progress":
        for (const ticketId of selectedTickets) {
          await updateTicketStatus(ticketId, "In-Progress")
        }
        break
      case "resolve":
        for (const ticketId of selectedTickets) {
          await updateTicketStatus(ticketId, "Resolved")
        }
        break
      case "assign":
        if (assignee) {
          for (const ticketId of selectedTickets) {
            await assignTicket(ticketId, assignee)
          }
        }
        break
    }

    // Clear selection after action
    onSelectionChange([])
    setBulkAction("")
    setAssignee("")
  }

  const mockAgents = ["Field Agent 1", "Field Agent 2", "Field Agent 3", "Supervisor A", "Supervisor B"]

  if (selectedTickets.length === 0) {
    return null
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Bulk Operations
          <Badge variant="secondary">{selectedTickets.length} selected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acknowledge">Acknowledge All</SelectItem>
              <SelectItem value="in-progress">Mark In Progress</SelectItem>
              <SelectItem value="resolve">Mark Resolved</SelectItem>
              <SelectItem value="assign">Assign to Agent</SelectItem>
            </SelectContent>
          </Select>

          {bulkAction === "assign" && (
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select agent..." />
              </SelectTrigger>
              <SelectContent>
                {mockAgents.map((agent) => (
                  <SelectItem key={agent} value={agent}>
                    {agent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button onClick={handleBulkAction} disabled={!bulkAction || (bulkAction === "assign" && !assignee)}>
            Apply to {selectedTickets.length} tickets
          </Button>

          <Button variant="outline" onClick={() => onSelectionChange([])}>
            Clear Selection
          </Button>
        </div>

        {/* Quick stats about selected tickets */}
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>High Priority: {selectedTicketData.filter((t) => t.severity === "High").length}</span>
          <span>Pending: {selectedTicketData.filter((t) => t.status === "Submitted").length}</span>
          <span>Categories: {new Set(selectedTicketData.map((t) => t.category)).size}</span>
        </div>
      </CardContent>
    </Card>
  )
}
