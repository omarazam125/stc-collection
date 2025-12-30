"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Phone, Calendar, Eye, AlertCircle } from "lucide-react"
import { useState } from "react"

interface Customer {
  id: string
  name: string
  phoneNumber: string
  accountBalance: string
  dueDate: string
  lastContact: string
  totalCalls: number
  status: "current" | "overdue" | "critical"
  paymentHistory: string
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock customers data
  const customers: Customer[] = [
    {
      id: "cust-001",
      name: "Ahmed Al-Rashid",
      phoneNumber: "+966 50 123 4567",
      accountBalance: "2,450 SAR",
      dueDate: "2025-02-15",
      lastContact: "2025-02-10",
      totalCalls: 3,
      status: "overdue",
      paymentHistory: "Good",
    },
    {
      id: "cust-002",
      name: "Fatima Hassan",
      phoneNumber: "+966 55 987 6543",
      accountBalance: "0 SAR",
      dueDate: "2025-02-10",
      lastContact: "2025-02-10",
      totalCalls: 2,
      status: "current",
      paymentHistory: "Excellent",
    },
    {
      id: "cust-003",
      name: "Mohammed Khalid",
      phoneNumber: "+966 54 456 7890",
      accountBalance: "3,800 SAR",
      dueDate: "2025-02-05",
      lastContact: "2025-02-10",
      totalCalls: 5,
      status: "critical",
      paymentHistory: "Poor",
    },
    {
      id: "cust-004",
      name: "Sara Abdullah",
      phoneNumber: "+966 56 234 5678",
      accountBalance: "1,850 SAR",
      dueDate: "2025-02-12",
      lastContact: "2025-02-10",
      totalCalls: 4,
      status: "overdue",
      paymentHistory: "Fair",
    },
    {
      id: "cust-005",
      name: "Khalid Ibrahim",
      phoneNumber: "+966 53 345 6789",
      accountBalance: "5,200 SAR",
      dueDate: "2025-02-01",
      lastContact: "2025-02-10",
      totalCalls: 7,
      status: "critical",
      paymentHistory: "Poor",
    },
  ]

  const getStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "current":
        return "bg-success/20 text-success border-success/30"
      case "overdue":
        return "bg-warning/20 text-warning border-warning/30"
      case "critical":
        return "bg-destructive/20 text-destructive border-destructive/30"
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-sans text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            View and manage customer accounts and payment status
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-muted-foreground">Total Customers</p>
                  <h3 className="mt-2 font-sans text-3xl font-bold text-card-foreground">1,247</h3>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-muted-foreground">Current</p>
                  <h3 className="mt-2 font-sans text-3xl font-bold text-success">892</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-muted-foreground">Overdue</p>
                  <h3 className="mt-2 font-sans text-3xl font-bold text-warning">267</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm font-medium text-muted-foreground">Critical</p>
                  <h3 className="mt-2 font-sans text-3xl font-bold text-destructive">88</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
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
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px] font-sans">
                  <SelectValue placeholder="Payment History" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All History</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-sans text-xl font-semibold text-card-foreground">
              All Customers ({customers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-sans font-semibold text-foreground">Customer Name</TableHead>
                    <TableHead className="font-sans font-semibold text-foreground">Phone Number</TableHead>
                    <TableHead className="font-sans font-semibold text-foreground">Balance</TableHead>
                    <TableHead className="font-sans font-semibold text-foreground">Due Date</TableHead>
                    <TableHead className="font-sans font-semibold text-foreground">Last Contact</TableHead>
                    <TableHead className="font-sans font-semibold text-foreground">Total Calls</TableHead>
                    <TableHead className="font-sans font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-sans font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="border-border">
                      <TableCell className="font-sans font-medium text-foreground">{customer.name}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{customer.phoneNumber}</TableCell>
                      <TableCell className="font-mono text-sm font-medium text-foreground">
                        {customer.accountBalance}
                      </TableCell>
                      <TableCell className="font-sans text-sm text-foreground">{customer.dueDate}</TableCell>
                      <TableCell className="font-sans text-sm text-foreground">{customer.lastContact}</TableCell>
                      <TableCell className="font-mono text-sm text-foreground">{customer.totalCalls}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                            <Phone className="h-3.5 w-3.5" />
                            Call
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                            <Calendar className="h-3.5 w-3.5" />
                            Schedule
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
