import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Suspense } from "react"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "STC Call Center Dashboard - Call Management",
  description: "Professional call center dashboard for managing customer interactions",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <div className="flex h-screen w-full overflow-hidden">
          <Suspense fallback={<div>Loading...</div>}>
            <DashboardSidebar />
            <div className="flex-1 overflow-hidden">{children}</div>
          </Suspense>
        </div>
      </body>
    </html>
  )
}
