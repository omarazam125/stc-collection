import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { description, scenarioType } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert at creating professional call center agent prompts for STC (Saudi Telecom Company - الاتصالات السعودية).

You will create a detailed, professional system prompt for an AI agent named Omar who works for STC.

IMPORTANT RULES FOR DYNAMIC VARIABLES:
- Use the format {variable_name} for ALL dynamic variables (with curly braces)
- Always include these base variables: {customer_name}, {phone_number}, {customer_email}
- Add scenario-specific variables based on the description
- Examples of variables: {account_balance}, {due_date}, {plan_name}, {account_id}, {issue_type}, {order_number}, {service_type}, {billing_amount}, etc.

The prompt MUST include:
1. Clear role definition (Omar from STC - الاتصالات السعودية)
2. Customer information placeholders with {variable_name} format
3. **IMPORTANT: Include a note that the agent should NEVER mention the customer's email during the call - it's for internal records only**
4. Clear objectives and call flow based on the scenario
5. A warm closing that thanks the customer for being an STC customer
6. Professional guidelines for handling different situations
7. Empathy and cultural sensitivity for Saudi Arabian customers
8. Support for both Arabic and English

Make it comprehensive, professional, and ready to use. Format it clearly with sections.

After creating the prompt, extract ALL dynamic variables used and list them.`,
          },
          {
            role: "user",
            content: `Scenario Type: ${scenarioType || "General"}
Description: ${description}

Create a complete system prompt for this scenario with all necessary dynamic variables.`,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] OpenAI API error:", errorData)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const generatedPrompt = data.choices[0]?.message?.content || ""

    // Extract all dynamic variables from the prompt using regex
    const variableRegex = /\{([a-z_]+)\}/g
    const matches = generatedPrompt.matchAll(variableRegex)
    const variablesSet = new Set<string>()
    for (const match of matches) {
      variablesSet.add(match[1])
    }
    const dynamicVariables = Array.from(variablesSet)

    // Categorize variables into required and optional
    const requiredVars = ["customer_name", "phone_number", "customer_email"]
    const requiredFields = dynamicVariables.filter((v) => requiredVars.includes(v) || !v.includes("notes"))
    const optionalFields = dynamicVariables.filter((v) => v.includes("notes") || v.includes("additional"))

    return NextResponse.json({
      prompt: generatedPrompt,
      dynamicVariables,
      requiredFields: requiredFields.map((v) => v.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()).replace(/ /g, "")),
      optionalFields: optionalFields.map((v) => v.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()).replace(/ /g, "")),
    })
  } catch (error) {
    console.error("[v0] OpenAI API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate prompt" },
      { status: 500 },
    )
  }
}
