"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/stat-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, Clock, TrendingUp, Users, CheckCircle2 } from "lucide-react"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

export default function AnalyticsPage() {
  // In a production environment, this would be calculated from real call data
  // using the /api/vapi/calls endpoint with date filters and aggregations

  const callVolumeData = [
    { day: "Mon", calls: 245, successful: 198, failed: 47 },
    { day: "Tue", calls: 312, successful: 267, failed: 45 },
    { day: "Wed", calls: 289, successful: 241, failed: 48 },
    { day: "Thu", calls: 356, successful: 298, failed: 58 },
    { day: "Fri", calls: 401, successful: 349, failed: 52 },
    { day: "Sat", calls: 178, successful: 142, failed: 36 },
    { day: "Sun", calls: 134, successful: 109, failed: 25 },
  ]

  const callOutcomeData = [
    { name: "Payment Scheduled", value: 342, color: "#8b5cf6" },
    { name: "Payment Received", value: 189, color: "#10b981" },
    { name: "Callback Requested", value: 156, color: "#f59e0b" },
    { name: "No Answer", value: 98, color: "#6b7280" },
    { name: "Dispute Raised", value: 45, color: "#ef4444" },
  ]

  const hourlyDistribution = [
    { hour: "8AM", calls: 23 },
    { hour: "9AM", calls: 45 },
    { hour: "10AM", calls: 67 },
    { hour: "11AM", calls: 89 },
    { hour: "12PM", calls: 78 },
    { hour: "1PM", calls: 56 },
    { hour: "2PM", calls: 92 },
    { hour: "3PM", calls: 103 },
    { hour: "4PM", calls: 87 },
    { hour: "5PM", calls: 64 },
    { hour: "6PM", calls: 42 },
    { hour: "7PM", calls: 28 },
  ]

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px] font-sans">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Calls" value="1,915" change="+18.2% vs last week" changeType="positive" icon={Phone} />
          <StatCard
            title="Success Rate"
            value="83.4%"
            change="+2.1% improvement"
            changeType="positive"
            icon={CheckCircle2}
          />
          <StatCard title="Avg Duration" value="4:47" change="-12s vs last week" changeType="positive" icon={Clock} />
          <StatCard
            title="Conversion Rate"
            value="67.8%"
            change="+5.3% increase"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Call Volume Trend */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">Call Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={callVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="successful" fill="#8b5cf6" name="Successful" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Call Outcomes */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Call Outcomes Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={callOutcomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {callOutcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Hourly Distribution */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Hourly Call Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#888" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#888" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="calls" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-sm text-muted-foreground">First Call Resolution</span>
                    <span className="font-sans text-sm font-semibold text-foreground">78.5%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-primary" style={{ width: "78.5%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-sm text-muted-foreground">Customer Satisfaction</span>
                    <span className="font-sans text-sm font-semibold text-foreground">92.3%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-success" style={{ width: "92.3%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-sm text-muted-foreground">Payment Collection Rate</span>
                    <span className="font-sans text-sm font-semibold text-foreground">67.8%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-chart-2" style={{ width: "67.8%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-sm text-muted-foreground">Callback Success Rate</span>
                    <span className="font-sans text-sm font-semibold text-foreground">84.1%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-warning" style={{ width: "84.1%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard title="Peak Call Time" value="3:00 PM" description="Highest activity period" icon={Clock} />
          <StatCard
            title="Total Customers Reached"
            value="1,604"
            change="+234 this week"
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Revenue Collected"
            value="342,500 SAR"
            change="+15.8% vs last week"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>
      </main>
    </div>
  )
}
