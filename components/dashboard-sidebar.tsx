"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Phone,
  FileText,
  Mic,
  Calendar,
  Settings,
  BarChart3,
  Users,
  FileCode,
  ClipboardList,
} from "lucide-react"

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Live Calls", href: "/calls", icon: Phone },
  { name: "Call Logs", href: "/logs", icon: FileText },
  { name: "Reports", href: "/reports", icon: ClipboardList },
  { name: "Recordings", href: "/recordings", icon: Mic },
  { name: "Transcripts", href: "/transcripts", icon: FileText },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Templates", href: "/templates", icon: FileCode },
  { name: "Scheduling", href: "/scheduling", icon: Calendar },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      <div className="flex h-24 items-center justify-center border-b border-border px-6">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/e/e3/STC-01.svg"
          alt="STC Logo"
          className="h-16 w-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg bg-card p-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="font-sans text-xs font-medium text-card-foreground">Agent Omar Active</span>
          </div>
          <p className="mt-1 font-sans text-xs text-muted-foreground">System Connected</p>
        </div>
      </div>
    </div>
  )
}
