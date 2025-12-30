"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { StatCard } from "@/components/stat-card"
import { Phone, Clock, CheckCircle2, TrendingUp, Users, Calendar, PhoneCall, PhoneIncoming } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VAPIConnectionStatus } from "@/components/vapi-connection-status"
import { useEffect, useState } from "react"

interface CallStats {
  totalCalls: number
  activeCalls: number
  avgDuration: string
  successRate: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    activeCalls: 0,
    avgDuration: "0:00",
    successRate: "0%",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/vapi/calls?limit=100")
        if (response.ok) {
          try {
            const calls = await response.json()

            // Calculate real stats from VAPI data
            const totalCalls = calls.length
            const activeCalls = calls.filter((call: any) => call.status === "in-progress").length
            const completedCalls = calls.filter((call: any) => call.status === "ended")

            // Calculate average duration
            const totalDuration = completedCalls.reduce((sum: number, call: any) => {
              return sum + (call.endedAt ? new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime() : 0)
            }, 0)
            const avgDurationMs = completedCalls.length > 0 ? totalDuration / completedCalls.length : 0
            const avgMinutes = Math.floor(avgDurationMs / 60000)
            const avgSeconds = Math.floor((avgDurationMs % 60000) / 1000)

            setStats({
              totalCalls,
              activeCalls,
              avgDuration: `${avgMinutes}:${avgSeconds.toString().padStart(2, "0")}`,
              successRate:
                completedCalls.length > 0 ? `${((completedCalls.length / totalCalls) * 100).toFixed(1)}%` : "0%",
            })
          } catch (jsonError) {
            console.error("[v0] Error parsing stats JSON:", jsonError)
          }
        } else {
          console.error("[v0] Failed to fetch stats:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background w-full">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-sans text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            Real-time insights from your call center operations
          </p>
        </div>

        <div className="mb-6">
          <VAPIConnectionStatus />
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Calls"
            value={isLoading ? "..." : stats.totalCalls.toString()}
            change="Live data"
            changeType="positive"
            icon={Phone}
          />
          <StatCard
            title="Active Calls"
            value={isLoading ? "..." : stats.activeCalls.toString()}
            description="Currently in progress"
            icon={PhoneCall}
          />
          <StatCard
            title="Avg Call Duration"
            value={isLoading ? "..." : stats.avgDuration}
            change="Real-time data"
            changeType="positive"
            icon={Clock}
          />
          <StatCard
            title="Success Rate"
            value={isLoading ? "..." : stats.successRate}
            change="Calculated from calls"
            changeType="positive"
            icon={CheckCircle2}
          />
        </div>

        {/* Secondary Stats */}
        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <StatCard title="Overdue Follow-ups" value="342" description="Accounts pending contact" icon={Users} />
          <StatCard title="Scheduled Callbacks" value="156" description="Next 24 hours" icon={Calendar} />
          <StatCard title="Inbound Calls" value="89" description="Waiting in queue" icon={PhoneIncoming} />
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 bg-card">
          <CardHeader>
            <CardTitle className="font-sans text-xl font-semibold text-card-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button className="h-auto flex-col gap-2 py-6 bg-transparent" variant="outline">
                <Phone className="h-6 w-6" />
                <span className="font-sans text-sm font-medium">Make Call</span>
              </Button>
              <Button className="h-auto flex-col gap-2 py-6 bg-transparent" variant="outline">
                <Calendar className="h-6 w-6" />
                <span className="font-sans text-sm font-medium">Schedule Callback</span>
              </Button>
              <Button className="h-auto flex-col gap-2 py-6 bg-transparent" variant="outline">
                <Users className="h-6 w-6" />
                <span className="font-sans text-sm font-medium">View Customers</span>
              </Button>
              <Button className="h-auto flex-col gap-2 py-6 bg-transparent" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span className="font-sans text-sm font-medium">View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-sans text-xl font-semibold text-card-foreground">Recent Call Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center">
              <p className="font-sans text-sm text-muted-foreground">
                Call activity will appear here once system is connected
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
