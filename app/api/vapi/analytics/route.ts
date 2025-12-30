import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const apiKey = process.env.VAPI_API_KEY
  const baseUrl = process.env.VAPI_BASE_URL || "https://api.vapi.ai"

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "1000"
    const assistantId = searchParams.get("assistantId") || process.env.VAPI_ASSISTANT_ID

    // Fetch all calls to calculate analytics
    const url = new URL(`${baseUrl}/call`)
    if (limit) url.searchParams.append("limit", limit)
    if (assistantId) url.searchParams.append("assistantId", assistantId)

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      let errorMessage = "Failed to fetch analytics"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = (await response.text()) || errorMessage
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const calls = await response.json()

    // Calculate real analytics from call data
    const totalCalls = calls.length
    const completedCalls = calls.filter((call: any) => call.status === "ended").length
    const activeCalls = calls.filter((call: any) => call.status === "in-progress").length
    const failedCalls = calls.filter((call: any) => call.endedReason && call.endedReason.includes("error")).length

    // Calculate average duration
    const callsWithDuration = calls.filter((call: any) => call.startedAt && call.endedAt)
    const totalDuration = callsWithDuration.reduce((sum: number, call: any) => {
      const start = new Date(call.startedAt).getTime()
      const end = new Date(call.endedAt).getTime()
      return sum + (end - start)
    }, 0)
    const avgDuration = callsWithDuration.length > 0 ? totalDuration / callsWithDuration.length / 1000 : 0

    // Calculate total cost
    const totalCost = calls.reduce((sum: number, call: any) => sum + (call.cost || 0), 0)

    // Group calls by date for trends
    const callsByDate: Record<string, number> = {}
    calls.forEach((call: any) => {
      const date = new Date(call.createdAt).toISOString().split("T")[0]
      callsByDate[date] = (callsByDate[date] || 0) + 1
    })

    const analytics = {
      totalCalls,
      completedCalls,
      activeCalls,
      failedCalls,
      avgDuration: Math.round(avgDuration),
      totalCost: totalCost.toFixed(2),
      successRate: totalCalls > 0 ? ((completedCalls / totalCalls) * 100).toFixed(1) : "0",
      callsByDate,
      recentCalls: calls.slice(0, 10),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
