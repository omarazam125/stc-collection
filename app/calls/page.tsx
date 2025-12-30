"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Phone, PhoneOff, Volume2, Mic, MicOff, Pause, Clock, User, Loader2, Languages } from "lucide-react"
import { useState, useEffect } from "react"
import { getAllScenarios } from "@/lib/call-scenarios"

interface LiveCall {
  id: string
  customerName: string
  phoneNumber: string
  status: string
  duration: string
  startedAt: string
  endedAt?: string
}

export default function CallsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isCallLoading, setIsCallLoading] = useState(false)
  const [callError, setCallError] = useState<string | null>(null)
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>([])
  const [isLoadingCalls, setIsLoadingCalls] = useState(true)
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en")
  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    customerEmail: "",
    accountBalance: "",
    dueDate: "",
    inquiryType: "",
    currentPlan: "",
    recommendedUpgrade: "",
    issueType: "",
    issueDescription: "",
    notes: "",
  })

  useEffect(() => {
    async function fetchCalls() {
      try {
        const response = await fetch("/api/vapi/calls?limit=50")
        if (response.ok) {
          try {
            const calls = await response.json()

            // Transform VAPI calls to our format
            const transformedCalls = calls
              .filter((call: any) => call.status === "in-progress" || call.status === "ringing")
              .map((call: any) => {
                const startTime = new Date(call.startedAt)
                const now = new Date()
                const durationMs = now.getTime() - startTime.getTime()
                const minutes = Math.floor(durationMs / 60000)
                const seconds = Math.floor((durationMs % 60000) / 1000)

                return {
                  id: call.id,
                  customerName: call.customer?.name || "Unknown",
                  phoneNumber: call.customer?.number || call.phoneNumber?.number || "N/A",
                  status: call.status,
                  duration: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
                  startedAt: call.startedAt,
                  endedAt: call.endedAt,
                }
              })

            setLiveCalls(transformedCalls)
          } catch (jsonError) {
            console.error("[v0] Error parsing calls JSON:", jsonError)
          }
        } else {
          console.error("[v0] Failed to fetch calls:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error fetching calls:", error)
      } finally {
        setIsLoadingCalls(false)
      }
    }

    fetchCalls()
    // Refresh every 5 seconds
    const interval = setInterval(fetchCalls, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMakeCall = async () => {
    setIsCallLoading(true)
    setCallError(null)

    try {
      console.log("[v0] Initiating call with scenario:", selectedScenario, formData)

      const response = await fetch("/api/vapi/call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenarioId: selectedScenario,
          language: selectedLanguage,
          customer: {
            name: formData.customerName,
            phoneNumber: formData.phoneNumber,
            email: formData.customerEmail,
          },
          variables: {
            customer_name: formData.customerName,
            phone_number: formData.phoneNumber,
            customer_email: formData.customerEmail,
            account_balance: formData.accountBalance,
            due_date: formData.dueDate,
            inquiry_type: formData.inquiryType,
            current_plan: formData.currentPlan,
            recommended_upgrade: formData.recommendedUpgrade,
            issue_type: formData.issueType,
            issue_description: formData.issueDescription,
            notes: formData.notes,
          },
        }),
      })

      console.log("[v0] Call response status:", response.status)

      if (response.ok) {
        try {
          const data = await response.json()
          console.log("[v0] Call initiated successfully:", data)
          setIsDialogOpen(false)
          setSelectedScenario("")
          setSelectedLanguage("en")
          setFormData({
            customerName: "",
            phoneNumber: "",
            customerEmail: "",
            accountBalance: "",
            dueDate: "",
            inquiryType: "",
            currentPlan: "",
            recommendedUpgrade: "",
            issueType: "",
            issueDescription: "",
            notes: "",
          })
        } catch (jsonError) {
          console.log("[v0] Error parsing call response:", jsonError)
          setCallError("Failed to parse server response")
        }
      } else {
        try {
          const errorData = await response.json()
          console.log("[v0] Call error:", errorData)
          setCallError(errorData.error || "Failed to initiate call")
        } catch (jsonError) {
          const errorText = await response.text()
          console.log("[v0] Call error (text):", errorText)
          setCallError(errorText || "Failed to initiate call")
        }
      }
    } catch (error) {
      console.log("[v0] Call exception:", error)
      setCallError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsCallLoading(false)
    }
  }

  const scenarios = getAllScenarios()
  const scenario = scenarios.find((s) => s.id === selectedScenario)

  return (
    <div className="flex h-screen flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-3xl font-bold text-foreground">Call Management</h1>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              Make calls and monitor live call activity in real-time
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(!isDialogOpen)} className="gap-2">
            <Phone className="h-4 w-4" />
            Make New Call
          </Button>
        </div>

        {isDialogOpen && (
          <Card className="mb-6 border-primary/50 bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Initiate Outbound Call
              </CardTitle>
              {scenario && <p className="mt-2 font-sans text-sm text-muted-foreground">{scenario.description}</p>}
            </CardHeader>
            <CardContent>
              {callError && (
                <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                  <p className="font-sans text-sm text-destructive">{callError}</p>
                </div>
              )}

              <div className="mb-6 grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="scenario" className="font-sans text-sm font-medium">
                    Call Scenario *
                  </Label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger id="scenario" className="mt-1.5 font-sans">
                      <SelectValue placeholder="Select a call scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                          {scenario.isCustom && <Badge className="ml-2 text-xs">Custom</Badge>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language" className="font-sans text-sm font-medium">
                    Call Language *
                  </Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger id="language" className="mt-1.5 font-sans">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          English
                        </div>
                      </SelectItem>
                      <SelectItem value="ar">
                        <div className="flex items-center gap-2">
                          <Languages className="h-4 w-4" />
                          Arabic (Khaleeji)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedScenario && (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer-name" className="font-sans text-sm font-medium">
                        Customer Name *
                      </Label>
                      <Input
                        id="customer-name"
                        placeholder="Enter customer name"
                        className="mt-1.5 font-sans"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone-number" className="font-sans text-sm font-medium">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone-number"
                        type="tel"
                        placeholder="+973 XX XXX XXXX"
                        className="mt-1.5 font-sans"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer-email" className="font-sans text-sm font-medium">
                        Customer Email *
                      </Label>
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="customer@example.com"
                        className="mt-1.5 font-sans"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Email is for internal records only - Agent Omar will not mention it during the call
                      </p>
                    </div>

                    {selectedScenario === "payment-reminder" && (
                      <>
                        <div>
                          <Label htmlFor="account-balance" className="font-sans text-sm font-medium">
                            Account Balance (SAR) *
                          </Label>
                          <Input
                            id="account-balance"
                            placeholder="0.00"
                            className="mt-1.5 font-sans"
                            value={formData.accountBalance}
                            onChange={(e) => setFormData({ ...formData, accountBalance: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="due-date" className="font-sans text-sm font-medium">
                            Due Date *
                          </Label>
                          <Input
                            id="due-date"
                            type="date"
                            className="mt-1.5 font-sans"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedScenario === "account-inquiry" && (
                      <>
                        <div>
                          <Label htmlFor="inquiry-type" className="font-sans text-sm font-medium">
                            Inquiry Type *
                          </Label>
                          <Input
                            id="inquiry-type"
                            placeholder="e.g., Billing question, Service inquiry"
                            className="mt-1.5 font-sans"
                            value={formData.inquiryType}
                            onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="account-balance" className="font-sans text-sm font-medium">
                            Account Balance (SAR)
                          </Label>
                          <Input
                            id="account-balance"
                            placeholder="0.00"
                            className="mt-1.5 font-sans"
                            value={formData.accountBalance}
                            onChange={(e) => setFormData({ ...formData, accountBalance: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedScenario === "service-upgrade" && (
                      <>
                        <div>
                          <Label htmlFor="current-plan" className="font-sans text-sm font-medium">
                            Current Plan *
                          </Label>
                          <Input
                            id="current-plan"
                            placeholder="e.g., Basic 5G Plan"
                            className="mt-1.5 font-sans"
                            value={formData.currentPlan}
                            onChange={(e) => setFormData({ ...formData, currentPlan: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="recommended-upgrade" className="font-sans text-sm font-medium">
                            Recommended Upgrade *
                          </Label>
                          <Input
                            id="recommended-upgrade"
                            placeholder="e.g., Premium 5G Plus"
                            className="mt-1.5 font-sans"
                            value={formData.recommendedUpgrade}
                            onChange={(e) => setFormData({ ...formData, recommendedUpgrade: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedScenario === "technical-support" && (
                      <>
                        <div>
                          <Label htmlFor="issue-type" className="font-sans text-sm font-medium">
                            Issue Type *
                          </Label>
                          <Input
                            id="issue-type"
                            placeholder="e.g., Internet connectivity, Device issue"
                            className="mt-1.5 font-sans"
                            value={formData.issueType}
                            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="issue-description" className="font-sans text-sm font-medium">
                            Issue Description *
                          </Label>
                          <Textarea
                            id="issue-description"
                            placeholder="Describe the technical issue..."
                            className="mt-1.5 font-sans"
                            rows={3}
                            value={formData.issueDescription}
                            onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes" className="font-sans text-sm font-medium">
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any additional information for Agent Omar..."
                        className="mt-1.5 font-sans"
                        rows={6}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button className="gap-2" onClick={handleMakeCall} disabled={isCallLoading || !selectedScenario}>
                  {isCallLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Start Call with Agent Omar
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCallLoading}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Live Calls ({liveCalls.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="font-sans text-sm text-muted-foreground">Real-time updates</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCalls ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : liveCalls.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <p className="font-sans text-sm text-muted-foreground">No active calls at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveCalls.map((call) => (
                  <Card key={call.id} className="border-border bg-secondary/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-sans text-base font-semibold text-foreground">{call.customerName}</h3>
                              <p className="font-mono text-sm text-muted-foreground">{call.phoneNumber}</p>
                            </div>
                            <Badge
                              variant={call.status === "in-progress" ? "default" : "secondary"}
                              className={
                                call.status === "in-progress"
                                  ? "bg-success text-white"
                                  : call.status === "ringing"
                                    ? "bg-warning text-white"
                                    : "bg-muted"
                              }
                            >
                              {call.status === "in-progress"
                                ? "Active"
                                : call.status === "ringing"
                                  ? "Ringing"
                                  : call.status}
                            </Badge>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <div>
                              <p className="font-sans text-xs text-muted-foreground">Duration</p>
                              <p className="mt-0.5 flex items-center gap-1.5 font-mono text-sm font-medium text-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {call.duration}
                              </p>
                            </div>
                            <div>
                              <p className="font-sans text-xs text-muted-foreground">Call ID</p>
                              <p className="mt-0.5 font-mono text-xs font-medium text-foreground">
                                {call.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="icon" variant="outline" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="outline">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive">
                            <PhoneOff className="h-4 w-4" />
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
