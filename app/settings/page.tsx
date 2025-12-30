"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Settings, Key, Bot, Webhook, CheckCircle2, XCircle } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-sans text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">Configure API integration and agent settings</p>
        </div>

        {/* Connection Status */}
        <Card className="mb-6 bg-card">
          <CardHeader>
            <CardTitle className="font-sans text-xl font-semibold text-card-foreground">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-success" />
                    <div>
                      <p className="font-sans text-base font-semibold text-foreground">Connected to API</p>
                      <p className="font-sans text-sm text-muted-foreground">Agent Omar is active and ready</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-destructive" />
                    <div>
                      <p className="font-sans text-base font-semibold text-foreground">Not Connected</p>
                      <p className="font-sans text-sm text-muted-foreground">Configure your API credentials below</p>
                    </div>
                  </>
                )}
              </div>
              <Badge
                variant="outline"
                className={
                  isConnected
                    ? "bg-success/20 text-success border-success/30"
                    : "bg-destructive/20 text-destructive border-destructive/30"
                }
              >
                {isConnected ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card className="mb-6 bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">API Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-key" className="font-sans text-sm font-medium">
                  API Key
                </Label>
                <Input id="api-key" type="password" placeholder="Enter your API key" className="mt-1.5 font-mono" />
                <p className="mt-1 font-sans text-xs text-muted-foreground">
                  Get your API key from your provider dashboard
                </p>
              </div>
              <div>
                <Label htmlFor="assistant-id" className="font-sans text-sm font-medium">
                  Assistant ID
                </Label>
                <Input id="assistant-id" placeholder="Enter your Assistant ID" className="mt-1.5 font-mono" />
                <p className="mt-1 font-sans text-xs text-muted-foreground">The unique identifier for Agent Omar</p>
              </div>
              <div>
                <Label htmlFor="phone-number" className="font-sans text-sm font-medium">
                  Phone Number
                </Label>
                <Input id="phone-number" placeholder="+1 XXX XXX XXXX" className="mt-1.5 font-mono" />
                <p className="mt-1 font-sans text-xs text-muted-foreground">Your phone number for outbound calls</p>
              </div>
              <Button className="gap-2" onClick={() => setIsConnected(true)}>
                <CheckCircle2 className="h-4 w-4" />
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agent Configuration */}
        <Card className="mb-6 bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Agent Omar Configuration
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-name" className="font-sans text-sm font-medium">
                  Agent Name
                </Label>
                <Input id="agent-name" defaultValue="Omar" className="mt-1.5 font-sans" />
              </div>
              <div>
                <Label htmlFor="company-name" className="font-sans text-sm font-medium">
                  Company Name
                </Label>
                <Input id="company-name" defaultValue="STC" className="mt-1.5 font-sans" />
              </div>
              <div>
                <Label htmlFor="voice-id" className="font-sans text-sm font-medium">
                  Voice ID
                </Label>
                <Input id="voice-id" placeholder="Select voice model" className="mt-1.5 font-mono" />
                <p className="mt-1 font-sans text-xs text-muted-foreground">Choose the voice model for Agent Omar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card className="mb-6 bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-primary" />
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Webhook Configuration
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-url" className="font-sans text-sm font-medium">
                  Webhook URL
                </Label>
                <Input
                  id="webhook-url"
                  defaultValue="https://your-domain.com/api/webhook"
                  className="mt-1.5 font-mono"
                />
                <p className="mt-1 font-sans text-xs text-muted-foreground">
                  Endpoint for receiving real-time call updates
                </p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="mb-2 font-sans text-sm font-semibold text-foreground">Webhook Events</p>
                <div className="space-y-2 font-mono text-xs text-muted-foreground">
                  <p>• call.started - When a call begins</p>
                  <p>• call.ended - When a call ends</p>
                  <p>• transcript.updated - Real-time transcript updates</p>
                  <p>• recording.ready - When recording is available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" className="gap-2">
            <Settings className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </main>
    </div>
  )
}
