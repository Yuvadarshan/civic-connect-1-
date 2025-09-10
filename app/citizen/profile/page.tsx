"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTicketStore } from "@/store/tickets"
import { User, MapPin, Calendar, Award, Edit, Save, X, Trophy, Star } from "lucide-react"
import { STATUS_COLORS, SEVERITY_COLORS, SEVERITY_LABELS } from "@/lib/constants"

export default function ProfilePage() {
  const { tickets, fetchTickets, loading } = useTicketStore()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 98765 43210",
    address: "123 MG Road, Koramangala, Bangalore - 560034",
    ward: "Ward 185 - Koramangala",
    joinDate: "2023-06-15",
    bio: "Active community member passionate about improving our neighborhood. I believe in civic engagement and making our city better for everyone.",
  })

  useEffect(() => {
    fetchTickets({ mine: true, userId: "user-1" })
  }, [fetchTickets])

  const userTickets = tickets.filter((t) => t.reporterId === "user-1")
  const recentTickets = userTickets.slice(0, 5)

  const stats = {
    total: userTickets.length,
    resolved: userTickets.filter((t) => t.status === "Resolved").length,
    points: 150,
    rank: 23,
  }

  const badges = [
    { name: "First Reporter", description: "Reported your first issue", earned: true, icon: "🎯" },
    { name: "Helper", description: "Helped resolve 5 community issues", earned: true, icon: "🤝" },
    { name: "Vigilant Citizen", description: "Reported 10+ issues", earned: userTickets.length >= 10, icon: "👁️" },
    { name: "Problem Solver", description: "Had 20+ issues resolved", earned: stats.resolved >= 20, icon: "🔧" },
    { name: "Community Champion", description: "Top 10 contributor", earned: stats.rank <= 10, icon: "🏆" },
  ]

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset form to original values
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">PS</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
            <p className="text-muted-foreground">Member since {new Date(profile.joinDate).toLocaleDateString()}</p>
          </div>
        </div>
        <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} className="flex items-center gap-2">
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
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
              <MapPin className="h-8 w-8 text-muted-foreground" />
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
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="text-2xl font-bold text-primary">{stats.points}</p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Community Rank</p>
                <p className="text-2xl font-bold text-foreground">#{stats.rank}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </span>
              {isEditing && (
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{profile.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{profile.phone}</p>
                )}
              </div>
              <div>
                <Label htmlFor="ward">Ward</Label>
                {isEditing ? (
                  <Input
                    id="ward"
                    value={profile.ward}
                    onChange={(e) => setProfile({ ...profile, ward: e.target.value })}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{profile.ward}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={2}
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{profile.address}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Badges & Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.name}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    badge.earned ? "border-primary/20 bg-primary/5" : "border-muted bg-muted/30"
                  }`}
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${badge.earned ? "text-foreground" : "text-muted-foreground"}`}>
                        {badge.name}
                      </h3>
                      {badge.earned && <Badge variant="secondary">Earned</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading your activity...</div>
          ) : recentTickets.length > 0 ? (
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
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
            <div className="text-center py-8 text-muted-foreground">No recent activity to display</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
