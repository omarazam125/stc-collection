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
      let errorMessage = "Failed to fetch transcripts"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = (await response.text()) || errorMessage
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const calls = await response.json()

    // Fetch full details for each call to get transcript messages
    const transcriptsWithDetails = await Promise.all(
      calls.slice(0, Number.parseInt(limit)).map(async (call: any) => {
        try {
          const detailResponse = await fetch(`${baseUrl}/call/${call.id}`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          })
          if (detailResponse.ok) {
            const detailData = await detailResponse.json()
            return detailData
          }
        } catch (error) {
          console.error(`Error fetching details for call ${call.id}:`, error)
        }
        return call
      }),
    )

    // Filter calls that have messages (transcripts)
    return NextResponse.json(transcriptsWithDetails.filter((call) => call.messages && call.messages.length > 0))
  } catch (error) {
    console.error("Error fetching transcripts:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
