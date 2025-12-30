"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Download, Search, Volume2, SkipBack, SkipForward, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"

interface Recording {
  id: string
  customer?: {
    number?: string
    name?: string
  }
  phoneNumber?: string
  createdAt: string
  endedAt?: string
  duration?: number
  recordingUrl?: string
  status?: string
  type?: string
  cost?: number
}

export default function RecordingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    async function fetchRecordings() {
      try {
        setLoading(true)
        const response = await fetch("/api/vapi/recordings?limit=50")
        if (!response.ok) {
          throw new Error("Failed to fetch recordings")
        }
        const data = await response.json()
        setRecordings(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching recordings:", err)
        setError(err instanceof Error ? err.message : "Failed to load recordings")
      } finally {
        setLoading(false)
      }
    }

    fetchRecordings()
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  useEffect(() => {
    if (!selectedRecording?.recordingUrl) return

    const audio = new Audio(selectedRecording.recordingUrl)
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => {
      setDuration(Math.floor(audio.duration))
    })

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(Math.floor(audio.currentTime))
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
    })

    return () => {
      audio.pause()
      audio.remove()
    }
  }, [selectedRecording])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

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

  const handleSeek = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
    }
  }

  const filteredRecordings = recordings.filter((recording) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      recording.customer?.name?.toLowerCase().includes(searchLower) ||
      recording.customer?.number?.toLowerCase().includes(searchLower) ||
      recording.phoneNumber?.toLowerCase().includes(searchLower) ||
      recording.id.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-sans text-3xl font-bold text-foreground">Call Recordings</h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            Listen to and download recorded calls for quality assurance
          </p>
        </div>

        {/* Audio Player */}
        {selectedRecording && selectedRecording.recordingUrl && (
          <Card className="mb-6 border-primary/50 bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">Now Playing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-sans text-lg font-semibold text-foreground">
                      {selectedRecording.customer?.name || "Unknown Customer"}
                    </h3>
                    <p className="font-mono text-sm text-muted-foreground">
                      {selectedRecording.customer?.number || selectedRecording.phoneNumber || "No phone number"}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {selectedRecording.status?.toUpperCase() || "COMPLETED"}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={handleSkipBack}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="h-12 w-12" onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </Button>
                    <Button size="icon" variant="outline" onClick={handleSkipForward}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setVolume(value[0])}
                      className="w-24"
                    />
                    <span className="font-mono text-xs text-muted-foreground w-8">{volume}%</span>
                  </div>

                  <Button
                    variant="outline"
                    className="gap-2 bg-transparent"
                    onClick={() => {
                      if (selectedRecording.recordingUrl) {
                        window.open(selectedRecording.recordingUrl, "_blank")
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
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
                    placeholder="Search recordings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-sans"
                  />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-[180px] font-sans">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
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

        {/* Recordings List */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
              All Recordings ({filteredRecordings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 font-sans text-muted-foreground">Loading recordings...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="font-sans text-destructive">{error}</p>
                <Button variant="outline" className="mt-4 bg-transparent" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : filteredRecordings.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-sans text-muted-foreground">No recordings found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecordings.map((recording) => (
                  <Card
                    key={recording.id}
                    className={`border-border bg-secondary/30 cursor-pointer transition-colors hover:bg-secondary/50 ${
                      selectedRecording?.id === recording.id ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedRecording(recording)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-10 w-10 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (selectedRecording?.id === recording.id) {
                                setIsPlaying(!isPlaying)
                              } else {
                                setSelectedRecording(recording)
                                setIsPlaying(true)
                              }
                            }}
                            disabled={!recording.recordingUrl}
                          >
                            {selectedRecording?.id === recording.id && isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <h3 className="font-sans text-base font-semibold text-foreground">
                              {recording.customer?.name || "Unknown Customer"}
                            </h3>
                            <p className="font-mono text-sm text-muted-foreground">
                              {recording.customer?.number || recording.phoneNumber || "No phone number"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-sans text-sm text-foreground">{formatDate(recording.createdAt)}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {formatDuration(recording.duration)}
                              {recording.cost && ` • $${recording.cost.toFixed(2)}`}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              recording.status === "ended"
                                ? "bg-success/20 text-success border-success/30"
                                : "bg-warning/20 text-warning border-warning/30"
                            }
                          >
                            {recording.status?.toUpperCase() || "COMPLETED"}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (recording.recordingUrl) {
                                window.open(recording.recordingUrl, "_blank")
                              }
                            }}
                            disabled={!recording.recordingUrl}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
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
