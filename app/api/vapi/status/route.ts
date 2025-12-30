import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.VAPI_API_KEY
    const baseUrl = process.env.VAPI_BASE_URL || "https://api.vapi.ai"
    const assistantId = process.env.VAPI_ASSISTANT_ID

    if (!apiKey || !assistantId) {
      return NextResponse.json(
        {
          isConnected: false,
          error:
            "VAPI credentials not configured. Please add VAPI_API_KEY and VAPI_ASSISTANT_ID to your environment variables.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Checking VAPI connection...")
    console.log("[v0] Base URL:", baseUrl)
    console.log("[v0] Assistant ID:", assistantId)
    console.log("[v0] API Key starts with:", apiKey.substring(0, 10) + "...")

    const response = await fetch(`${baseUrl}/assistant/${assistantId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    console.log("[v0] VAPI Response Status:", response.status)

    if (response.ok) {
      const data = await response.json()
      console.log("[v0] VAPI Assistant Data:", data)
      return NextResponse.json({
        isConnected: true,
        assistantName: data.name || "Agent Omar",
        assistantId: assistantId,
      })
    } else {
      const errorText = await response.text()
      console.log("[v0] VAPI Error Response:", errorText)

      if (response.status === 401) {
        return NextResponse.json(
          {
            isConnected: false,
            error:
              "Authentication failed. Please ensure you're using your PRIVATE API key (not the public key) from the VAPI dashboard. Go to dashboard.vapi.ai → API Keys → Copy the PRIVATE key.",
            details: errorText,
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          isConnected: false,
          error: `Connection failed: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }
  } catch (error) {
    console.log("[v0] VAPI Connection Error:", error)
    return NextResponse.json(
      {
        isConnected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
