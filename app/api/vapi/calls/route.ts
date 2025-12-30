import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const apiKey = process.env.VAPI_API_KEY
  const baseUrl = process.env.VAPI_BASE_URL || "https://api.vapi.ai"

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "100"
    const assistantId = searchParams.get("assistantId") || process.env.VAPI_ASSISTANT_ID

    const url = new URL(`${baseUrl}/call`)
    if (limit) url.searchParams.append("limit", limit)
    if (assistantId) url.searchParams.append("assistantId", assistantId)

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      let errorMessage = "Failed to fetch calls"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = (await response.text()) || errorMessage
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const calls = await response.json()

    return NextResponse.json(calls)
  } catch (error) {
    console.error("Error fetching calls:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
