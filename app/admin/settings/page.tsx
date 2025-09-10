"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Database, Save } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: "Civic-Connect AI",
    systemEmail: "admin@civic.gov.in",
    systemPhone: "+91 80 2222 3333",

    // SLA Settings
    acknowledgmentSLA: 30,
    resolutionSLA: 72,
    escalationThreshold: 48,

    // AI Settings
    aiTriageEnabled: true,
    duplicateDetectionEnabled: true,
    confidenceThreshold: 0.8,
    autoAssignmentEnabled: true,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    citizenUpdates: true,
    adminAlerts: true,

    // Security Settings
    sessionTimeout: 60,
    passwordExpiry: 90,
    twoFactorAuth: true,
    auditLogging: true,

    // Integration Settings
    mapsProvider: "google",
    weatherIntegration: true,
    socialMediaMonitoring: false,
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Mock save functionality
    console.log("Settings saved:", settings)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure system parameters and preferences</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => handleSettingChange("systemName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="systemEmail">System Email</Label>
              <Input
                id="systemEmail"
                type="email"
                value={settings.systemEmail}
                onChange={(e) => handleSettingChange("systemEmail", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="systemPhone">System Phone</Label>
              <Input
                id="systemPhone"
                value={settings.systemPhone}
                onChange={(e) => handleSettingChange("systemPhone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* SLA Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="acknowledgmentSLA">Acknowledgment SLA (minutes)</Label>
              <Input
                id="acknowledgmentSLA"
                type="number"
                value={settings.acknowledgmentSLA}
                onChange={(e) => handleSettingChange("acknowledgmentSLA", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="resolutionSLA">Resolution SLA (hours)</Label>
              <Input
                id="resolutionSLA"
                type="number"
                value={settings.resolutionSLA}
                onChange={(e) => handleSettingChange("resolutionSLA", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="escalationThreshold">Escalation Threshold (hours)</Label>
              <Input
                id="escalationThreshold"
                type="number"
                value={settings.escalationThreshold}
                onChange={(e) => handleSettingChange("escalationThreshold", Number.parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="aiTriage">AI Triage</Label>
              <Switch
                id="aiTriage"
                checked={settings.aiTriageEnabled}
                onCheckedChange={(checked) => handleSettingChange("aiTriageEnabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="duplicateDetection">Duplicate Detection</Label>
              <Switch
                id="duplicateDetection"
                checked={settings.duplicateDetectionEnabled}
                onCheckedChange={(checked) => handleSettingChange("duplicateDetectionEnabled", checked)}
              />
            </div>
            <div>
              <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
              <Input
                id="confidenceThreshold"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={settings.confidenceThreshold}
                onChange={(e) => handleSettingChange("confidenceThreshold", Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoAssignment">Auto Assignment</Label>
              <Switch
                id="autoAssignment"
                checked={settings.autoAssignmentEnabled}
                onCheckedChange={(checked) => handleSettingChange("autoAssignmentEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="citizenUpdates">Citizen Updates</Label>
              <Switch
                id="citizenUpdates"
                checked={settings.citizenUpdates}
                onCheckedChange={(checked) => handleSettingChange("citizenUpdates", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange("sessionTimeout", Number.parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleSettingChange("passwordExpiry", Number.parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
              <Switch
                id="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auditLogging">Audit Logging</Label>
              <Switch
                id="auditLogging"
                checked={settings.auditLogging}
                onCheckedChange={(checked) => handleSettingChange("auditLogging", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Integration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mapsProvider">Maps Provider</Label>
              <Select
                value={settings.mapsProvider}
                onValueChange={(value) => handleSettingChange("mapsProvider", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Maps</SelectItem>
                  <SelectItem value="mapbox">Mapbox</SelectItem>
                  <SelectItem value="osm">OpenStreetMap</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="weatherIntegration">Weather Integration</Label>
              <Switch
                id="weatherIntegration"
                checked={settings.weatherIntegration}
                onCheckedChange={(checked) => handleSettingChange("weatherIntegration", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="socialMediaMonitoring">Social Media Monitoring</Label>
              <Switch
                id="socialMediaMonitoring"
                checked={settings.socialMediaMonitoring}
                onCheckedChange={(checked) => handleSettingChange("socialMediaMonitoring", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
