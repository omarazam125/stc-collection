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
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch recordings" },
        { status: response.status },
      )
    }

    const calls = await response.json()

    // Filter calls that have recordings
    const recordingsWithDetails = await Promise.all(
      calls
        .filter((call: any) => call.recordingUrl || call.id)
        .slice(0, Number.parseInt(limit))
        .map(async (call: any) => {
          // Fetch full call details to get recording URL if not present
          if (!call.recordingUrl && call.id) {
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
          }
          return call
        }),
    )

    return NextResponse.json(recordingsWithDetails.filter((call) => call.recordingUrl))
  } catch (error) {
    console.error("Error fetching recordings:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
