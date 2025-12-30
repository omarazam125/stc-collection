"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, User, Bot, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface TranscriptMessage {
  role: string
  message: string
  time?: number
  endTime?: number
  secondsFromStart?: number
}

interface Transcript {
  id: string
  customer?: {
    number?: string
    name?: string
  }
  phoneNumber?: string
  createdAt: string
  endedAt?: string
  duration?: number
  status?: string
  messages?: TranscriptMessage[]
  analysis?: {
    summary?: string
    successEvaluation?: string
  }
}

export default function TranscriptsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTranscript, setSelectedTranscript] = useState<Transcript | null>(null)
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTranscripts() {
      try {
        setLoading(true)
        const response = await fetch("/api/vapi/transcripts?limit=50")
        if (!response.ok) {
          throw new Error("Failed to fetch transcripts")
        }
        const data = await response.json()
        setTranscripts(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching transcripts:", err)
        setError(err instanceof Error ? err.message : "Failed to load transcripts")
      } finally {
        setLoading(false)
      }
    }

    fetchTranscripts()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (seconds?: number) => {
    if (seconds === undefined) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getSentiment = (transcript: Transcript): "positive" | "neutral" | "negative" => {
    if (transcript.analysis?.successEvaluation) {
      const evaluation = transcript.analysis.successEvaluation.toLowerCase()
      if (evaluation.includes("success") || evaluation.includes("positive")) return "positive"
      if (evaluation.includes("fail") || evaluation.includes("negative")) return "negative"
    }
    return "neutral"
  }

  const filteredTranscripts = transcripts.filter((transcript) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      transcript.customer?.name?.toLowerCase().includes(searchLower) ||
      transcript.customer?.number?.toLowerCase().includes(searchLower) ||
      transcript.phoneNumber?.toLowerCase().includes(searchLower) ||
      transcript.id.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-sans text-3xl font-bold text-foreground">Call Transcripts</h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            Review detailed transcripts of all calls with sentiment analysis
          </p>
        </div>

        {/* Transcript Viewer */}
        {selectedTranscript && (
          <Card className="mb-6 border-primary/50 bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                    {selectedTranscript.customer?.name || "Unknown Customer"}
                  </CardTitle>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    {selectedTranscript.customer?.number || selectedTranscript.phoneNumber || "No phone number"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={
                      getSentiment(selectedTranscript) === "positive"
                        ? "bg-success/20 text-success border-success/30"
                        : getSentiment(selectedTranscript) === "negative"
                          ? "bg-destructive/20 text-destructive border-destructive/30"
                          : "bg-muted text-muted-foreground"
                    }
                  >
                    {getSentiment(selectedTranscript).toUpperCase()}
                  </Badge>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
              {selectedTranscript.analysis?.summary && (
                <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="font-sans text-sm font-semibold text-foreground mb-1">Summary</p>
                  <p className="font-sans text-sm text-muted-foreground">{selectedTranscript.analysis.summary}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {selectedTranscript.messages && selectedTranscript.messages.length > 0 ? (
                  selectedTranscript.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === "assistant" || message.role === "bot" ? "justify-start" : "justify-end"}`}
                    >
                      {(message.role === "assistant" || message.role === "bot") && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.role === "assistant" || message.role === "bot"
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-secondary border border-border"
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-sans text-xs font-semibold text-foreground">
                            {message.role === "assistant" || message.role === "bot"
                              ? "Agent"
                              : selectedTranscript.customer?.name?.split(" ")[0] || "Customer"}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {formatTimestamp(message.secondsFromStart || message.time)}
                          </span>
                        </div>
                        <p className="font-sans text-sm leading-relaxed text-foreground">{message.message}</p>
                      </div>
                      {message.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chart-2/20">
                          <User className="h-4 w-4 text-chart-2" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="font-sans text-muted-foreground">No transcript messages available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6 bg-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search transcripts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-sans"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[180px] font-sans">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px] font-sans">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transcripts List */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
              All Transcripts ({filteredTranscripts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 font-sans text-muted-foreground">Loading transcripts...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="font-sans text-destructive">{error}</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : filteredTranscripts.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-sans text-muted-foreground">No transcripts found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTranscripts.map((transcript) => (
                  <Card
                    key={transcript.id}
                    className={`border-border bg-secondary/30 cursor-pointer transition-colors hover:bg-secondary/50 ${
                      selectedTranscript?.id === transcript.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedTranscript(transcript)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-sans text-base font-semibold text-foreground">
                                {transcript.customer?.name || "Unknown Customer"}
                              </h3>
                              <p className="font-mono text-sm text-muted-foreground">
                                {transcript.customer?.number || transcript.phoneNumber || "No phone number"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4">
                            <div>
                              <p className="font-sans text-xs text-muted-foreground">Date & Time</p>
                              <p className="font-sans text-sm text-foreground">{formatDate(transcript.createdAt)}</p>
                            </div>
                            <div>
                              <p className="font-sans text-xs text-muted-foreground">Duration</p>
                              <p className="font-mono text-sm text-foreground">{formatDuration(transcript.duration)}</p>
                            </div>
                            <div>
                              <p className="font-sans text-xs text-muted-foreground">Messages</p>
                              <p className="font-sans text-sm text-foreground">
                                {transcript.messages?.length || 0} messages
                              </p>
                            </div>
                            <div>
                              <p className="font-sans text-xs text-muted-foreground">Sentiment</p>
                              <Badge
                                variant="outline"
                                className={
                                  getSentiment(transcript) === "positive"
                                    ? "bg-success/20 text-success border-success/30"
                                    : getSentiment(transcript) === "negative"
                                      ? "bg-destructive/20 text-destructive border-destructive/30"
                                      : "bg-muted text-muted-foreground"
                                }
                              >
                                {getSentiment(transcript)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" className="gap-2">
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
