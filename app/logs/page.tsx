"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface CallLog {
  id: string
  customerName: string
  phoneNumber: string
  date: string
  time: string
  duration: string
  status: string
  type: string
}

export default function CallLogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchCallLogs() {
      try {
        const response = await fetch("/api/vapi/calls?limit=100")
        if (response.ok) {
          try {
            const calls = await response.json()

            // Transform VAPI calls to our format
            const transformedLogs = calls.map((call: any) => {
              const startTime = new Date(call.startedAt || call.createdAt)
              const endTime = call.endedAt ? new Date(call.endedAt) : null
              const durationMs = endTime ? endTime.getTime() - startTime.getTime() : 0
              const minutes = Math.floor(durationMs / 60000)
              const seconds = Math.floor((durationMs % 60000) / 1000)

              return {
                id: call.id,
                customerName: call.customer?.name || "Unknown",
                phoneNumber: call.customer?.number || call.phoneNumber?.number || "N/A",
                date: startTime.toISOString().split("T")[0],
                time: startTime.toTimeString().slice(0, 5),
                duration: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
                status: call.status || "unknown",
                type: call.type || "outbound",
              }
            })

            setCallLogs(transformedLogs)
          } catch (jsonError) {
            console.error("[v0] Error parsing call logs JSON:", jsonError)
          }
        } else {
          console.error("[v0] Failed to fetch call logs:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error fetching call logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCallLogs()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ended":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "no-answer":
        return <AlertCircle className="h-4 w-4 text-warning" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ended: "bg-success/20 text-success border-success/30",
      failed: "bg-destructive/20 text-destructive border-destructive/30",
      "no-answer": "bg-warning/20 text-warning border-warning/30",
      "in-progress": "bg-primary/20 text-primary border-primary/30",
    }
    return variants[status] || "bg-muted text-muted-foreground border-muted"
  }

  const filteredLogs = callLogs.filter((log) => {
    const matchesSearch =
      log.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || log.phoneNumber.includes(searchQuery)
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleGenerateReport = async (callId: string) => {
    setGeneratingReportId(callId)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callId }),
      })

      if (response.ok) {
        try {
          const report = await response.json()

          // Store report in localStorage
          const existingReports = JSON.parse(localStorage.getItem("call-reports") || "[]")
          const updatedReports = [report, ...existingReports.filter((r: any) => r.id !== callId)]
          localStorage.setItem("call-reports", JSON.stringify(updatedReports))

          // Navigate to the report
          router.push(`/reports/${callId}`)
        } catch (jsonError) {
          console.error("[v0] Error parsing report JSON:", jsonError)
          alert("Failed to parse report. Please try again.")
        }
      } else {
        try {
          const errorData = await response.json()
          alert(errorData.error || "Failed to generate report. Please try again.")
        } catch {
          const errorText = await response.text()
          alert(errorText || "Failed to generate report. Please try again.")
        }
      }
    } catch (error) {
      console.error("[v0] Error generating report:", error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setGeneratingReportId(null)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-sans text-3xl font-bold text-foreground">Call Logs</h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">Complete history of all call center activity</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name or phone number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-sans"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] font-sans">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Call Logs Table */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
              Recent Calls ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <p className="font-sans text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all" ? "No calls match your filters" : "No calls found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-sans font-semibold text-foreground">Customer</TableHead>
                      <TableHead className="font-sans font-semibold text-foreground">Phone Number</TableHead>
                      <TableHead className="font-sans font-semibold text-foreground">Date & Time</TableHead>
                      <TableHead className="font-sans font-semibold text-foreground">Duration</TableHead>
                      <TableHead className="font-sans font-semibold text-foreground">Status</TableHead>
                      <TableHead className="font-sans font-semibold text-foreground">Call ID</TableHead>
                      <TableHead className="font-sans font-semibold text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.type === "outbound" ? "OUT" : "IN"}
                            </Badge>
                            <span className="font-sans font-medium text-foreground">{log.customerName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{log.phoneNumber}</TableCell>
                        <TableCell className="font-sans text-sm text-foreground">
                          <div>{log.date}</div>
                          <div className="text-xs text-muted-foreground">{log.time}</div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-foreground">{log.duration}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusBadge(log.status)}>
                            <span className="flex items-center gap-1.5">
                              {getStatusIcon(log.status)}
                              {log.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={() => handleGenerateReport(log.id)}
                              disabled={generatingReportId === log.id || log.status !== "ended"}
                            >
                              {generatingReportId === log.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <FileText className="h-4 w-4" />
                                  Generate Report
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
