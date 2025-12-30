"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface ConnectionStatus {
  isConnected: boolean
  isLoading: boolean
  error?: string
  details?: string
  assistantName?: string
  assistantId?: string
}

export function VAPIConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: true,
  })
  const [showDetails, setShowDetails] = useState(false)

  const checkConnection = async () => {
    setStatus({ isConnected: false, isLoading: true })

    try {
      const response = await fetch("/api/vapi/status")

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("[v0] Failed to parse status response:", jsonError)
        setStatus({
          isConnected: false,
          isLoading: false,
          error: "Invalid response from server",
        })
        return
      }

      if (response.ok && data.isConnected) {
        setStatus({
          isConnected: true,
          isLoading: false,
          assistantName: data.assistantName,
          assistantId: data.assistantId,
        })
      } else {
        setStatus({
          isConnected: false,
          isLoading: false,
          error: data.error || "Connection failed",
          details: data.details,
        })
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {status.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : status.isConnected ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <div className="flex-1">
              <p className="font-sans text-sm font-medium text-foreground">
                {status.isLoading
                  ? "Connecting to system..."
                  : status.isConnected
                    ? `Connected - ${status.assistantName}`
                    : "Connection Failed"}
              </p>
              {status.error && (
                <div className="mt-1 space-y-1">
                  <p className="font-sans text-xs text-destructive">{status.error}</p>
                  {status.details && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? "Hide" : "Show"} technical details
                    </Button>
                  )}
                  {showDetails && status.details && (
                    <div className="mt-2 rounded-md bg-muted p-2">
                      <p className="font-mono text-xs text-muted-foreground break-all">{status.details}</p>
                    </div>
                  )}
                </div>
              )}
              {status.isConnected && status.assistantId && (
                <p className="mt-0.5 font-sans text-xs text-muted-foreground">Assistant ID: {status.assistantId}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status.isConnected ? "default" : "destructive"} className="font-sans text-xs">
              {status.isConnected ? "Live" : "Offline"}
            </Badge>
            <Button size="sm" variant="ghost" onClick={checkConnection} disabled={status.isLoading}>
              <RefreshCw className={`h-4 w-4 ${status.isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {!status.isConnected && !status.isLoading && status.error?.includes("PRIVATE") && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-warning/50 bg-warning/10 p-3">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="font-sans text-xs font-medium text-warning">Quick Fix:</p>
              <ol className="font-sans text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Go to{" "}
                  <a
                    href="https://dashboard.vapi.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    dashboard.vapi.ai
                  </a>
                </li>
                <li>Click your account menu → API Keys</li>
                <li>
                  Copy the <strong>PRIVATE</strong> key (not public)
                </li>
                <li>Add it as API_KEY in Project Settings</li>
                <li>Click Publish to redeploy</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
