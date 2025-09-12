"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  MapPin,
  AlertTriangle,
  Clock,
  Brain,
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Tickets",
    href: "/admin/tickets",
    icon: Ticket,
  },
  {
    name: "Map View",
    href: "/admin/map",
    icon: MapPin,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "AI Management",
    href: "/admin/ai",
    icon: Brain,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Civic Connect</span>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Status indicators */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">System Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  <span>12 Pending</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span>8 In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Municipal Admin Portal</h1>
                <p className="text-sm text-muted-foreground">Real-time civic issue management</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/citizen/login">
                <Button variant="outline" size="sm">
                  Citizen Portal
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center p-0">
                  3
                </Badge>
              </Button>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">MA</span>
                </div>
                <span className="text-sm font-medium">Municipal Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
