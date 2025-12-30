import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyCEyQByGkrdaCItsERJoy4rIKUWdgL6jPE"

export async function POST(request: NextRequest) {
  try {
    const { description, scenarioType } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an expert at creating professional call center agent prompts for STC (Saudi Telecom Company).

Create a detailed, professional system prompt for an AI agent named Omar who works for STC.

Scenario Type: ${scenarioType || "General"}
User Description: ${description}

The prompt should include:
1. Clear role definition (Omar from STC)
2. Customer information placeholders: {customer_name}, {phone_number}, {customer_email}, and other relevant fields
3. **IMPORTANT: Include a note that the agent should NEVER mention the customer's email during the call - it's for internal records only**
4. Clear objectives and call flow
5. A warm closing that thanks the customer for being an STC customer
6. Professional guidelines for handling different situations
7. Empathy and cultural sensitivity for Saudi Arabian customers

Make it comprehensive, professional, and ready to use. Format it clearly with sections.`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const generatedPrompt = data.candidates[0]?.content?.parts[0]?.text || ""

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error("[v0] Gemini API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate prompt" },
      { status: 500 },
    )
  }
}
