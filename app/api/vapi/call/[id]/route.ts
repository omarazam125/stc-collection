import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const apiKey = process.env.VAPI_API_KEY
  const baseUrl = process.env.VAPI_BASE_URL || "https://api.vapi.ai"

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const callId = params.id

    const response = await fetch(`${baseUrl}/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      let errorMessage = "Failed to fetch call details"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = (await response.text()) || errorMessage
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const callDetails = await response.json()

    return NextResponse.json(callDetails)
  } catch (error) {
    console.error("Error fetching call details:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
