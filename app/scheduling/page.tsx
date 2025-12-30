"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Plus, Edit, Trash2, Phone, User } from "lucide-react"
import { useState } from "react"

interface ScheduledCall {
  id: string
  customerName: string
  phoneNumber: string
  scheduledDate: string
  scheduledTime: string
  purpose: string
  accountBalance: string
  notes: string
  status: "pending" | "completed" | "missed" | "cancelled"
  priority: "high" | "medium" | "low"
}

export default function SchedulingPage() {
  const [showForm, setShowForm] = useState(false)

  // Mock scheduled calls data
  const scheduledCalls: ScheduledCall[] = [
    {
      id: "sched-001",
      customerName: "Mohammed Khalid",
      phoneNumber: "+966 54 456 7890",
      scheduledDate: "2025-02-11",
      scheduledTime: "10:00",
      purpose: "Follow-up on payment plan",
      accountBalance: "3,800 SAR",
      notes: "Customer requested callback after receiving salary",
      status: "pending",
      priority: "high",
    },
    {
      id: "sched-002",
      customerName: "Layla Ahmed",
      phoneNumber: "+966 55 678 9012",
      scheduledDate: "2025-02-11",
      scheduledTime: "14:30",
      purpose: "Payment reminder",
      accountBalance: "1,250 SAR",
      notes: "Preferred afternoon calls",
      status: "pending",
      priority: "medium",
    },
    {
      id: "sched-003",
      customerName: "Omar Hassan",
      phoneNumber: "+966 56 789 0123",
      scheduledDate: "2025-02-11",
      scheduledTime: "16:00",
      purpose: "Dispute resolution follow-up",
      accountBalance: "2,100 SAR",
      notes: "Escalated case - handle with care",
      status: "pending",
      priority: "high",
    },
    {
      id: "sched-004",
      customerName: "Nora Abdullah",
      phoneNumber: "+966 53 890 1234",
      scheduledDate: "2025-02-12",
      scheduledTime: "09:00",
      purpose: "Payment confirmation",
      accountBalance: "950 SAR",
      notes: "Customer promised payment by Feb 12",
      status: "pending",
      priority: "medium",
    },
    {
      id: "sched-005",
      customerName: "Youssef Ibrahim",
      phoneNumber: "+966 54 901 2345",
      scheduledDate: "2025-02-12",
      scheduledTime: "11:30",
      purpose: "Account review",
      accountBalance: "4,500 SAR",
      notes: "Large balance - discuss payment options",
      status: "pending",
      priority: "high",
    },
  ]

  const getPriorityColor = (priority: ScheduledCall["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "medium":
        return "bg-warning/20 text-warning border-warning/30"
      case "low":
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  const getStatusColor = (status: ScheduledCall["status"]) => {
    switch (status) {
      case "pending":
        return "bg-primary/20 text-primary border-primary/30"
      case "completed":
        return "bg-success/20 text-success border-success/30"
      case "missed":
        return "bg-destructive/20 text-destructive border-destructive/30"
      case "cancelled":
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  // Group calls by date
  const groupedCalls = scheduledCalls.reduce(
    (acc, call) => {
      if (!acc[call.scheduledDate]) {
        acc[call.scheduledDate] = []
      }
      acc[call.scheduledDate].push(call)
      return acc
    },
    {} as Record<string, ScheduledCall[]>,
  )

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-3xl font-bold text-foreground">Call Scheduling</h1>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              Schedule and manage callback appointments with customers
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule New Call
          </Button>
        </div>

        {/* Schedule Form */}
        {showForm && (
          <Card className="mb-6 border-primary/50 bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">Schedule Callback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name" className="font-sans text-sm font-medium">
                      Customer Name
                    </Label>
                    <Input id="customer-name" placeholder="Enter customer name" className="mt-1.5 font-sans" />
                  </div>
                  <div>
                    <Label htmlFor="phone-number" className="font-sans text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input id="phone-number" type="tel" placeholder="+966 XX XXX XXXX" className="mt-1.5 font-sans" />
                  </div>
                  <div>
                    <Label htmlFor="scheduled-date" className="font-sans text-sm font-medium">
                      Scheduled Date
                    </Label>
                    <Input id="scheduled-date" type="date" className="mt-1.5 font-sans" />
                  </div>
                  <div>
                    <Label htmlFor="scheduled-time" className="font-sans text-sm font-medium">
                      Scheduled Time
                    </Label>
                    <Input id="scheduled-time" type="time" className="mt-1.5 font-sans" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="purpose" className="font-sans text-sm font-medium">
                      Call Purpose
                    </Label>
                    <Select>
                      <SelectTrigger id="purpose" className="mt-1.5 font-sans">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment-reminder">Payment Reminder</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="dispute">Dispute Resolution</SelectItem>
                        <SelectItem value="confirmation">Payment Confirmation</SelectItem>
                        <SelectItem value="review">Account Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority" className="font-sans text-sm font-medium">
                      Priority
                    </Label>
                    <Select>
                      <SelectTrigger id="priority" className="mt-1.5 font-sans">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="account-balance" className="font-sans text-sm font-medium">
                      Account Balance (SAR)
                    </Label>
                    <Input id="account-balance" placeholder="0.00" className="mt-1.5 font-sans" />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="font-sans text-sm font-medium">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional information..."
                      className="mt-1.5 font-sans"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Call
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Calls by Date */}
        <div className="space-y-6">
          {Object.entries(groupedCalls).map(([date, calls]) => (
            <Card key={date} className="bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                  <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                    {calls.length} {calls.length === 1 ? "call" : "calls"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calls
                    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                    .map((call) => (
                      <Card key={call.id} className="border-border bg-secondary/30">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4 flex-1">
                              <div className="flex flex-col items-center gap-1 pt-1">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="font-mono text-sm font-semibold text-foreground">
                                  {call.scheduledTime}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-sans text-base font-semibold text-foreground">
                                      {call.customerName}
                                    </h3>
                                    <p className="font-mono text-sm text-muted-foreground">{call.phoneNumber}</p>
                                  </div>
                                  <Badge variant="outline" className={getPriorityColor(call.priority)}>
                                    {call.priority.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" className={getStatusColor(call.status)}>
                                    {call.status}
                                  </Badge>
                                </div>
                                <div className="grid gap-3 md:grid-cols-3 mt-3">
                                  <div>
                                    <p className="font-sans text-xs text-muted-foreground">Purpose</p>
                                    <p className="mt-0.5 font-sans text-sm font-medium text-foreground">
                                      {call.purpose}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-sans text-xs text-muted-foreground">Account Balance</p>
                                    <p className="mt-0.5 font-mono text-sm font-medium text-foreground">
                                      {call.accountBalance}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="font-sans text-xs text-muted-foreground">Notes</p>
                                    <p className="mt-0.5 font-sans text-sm text-foreground">{call.notes}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="icon" variant="outline" className="bg-transparent">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="bg-transparent">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="outline" className="bg-transparent">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
