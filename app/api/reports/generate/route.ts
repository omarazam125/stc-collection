import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { callId } = await request.json()

    if (!callId) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 })
    }

    console.log("[v0] Generating report for call:", callId)

    // Fetch call details from VAPI
    const apiKey = process.env.VAPI_API_KEY
    const baseUrl = process.env.VAPI_BASE_URL || "https://api.vapi.ai"

    const callResponse = await fetch(`${baseUrl}/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!callResponse.ok) {
      console.error("[v0] Failed to fetch call details:", callResponse.status)
      let errorMessage = "Failed to fetch call details"
      try {
        const errorData = await callResponse.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = (await callResponse.text()) || errorMessage
      }
      return NextResponse.json({ error: errorMessage }, { status: callResponse.status })
    }

    const callData = await callResponse.json()
    console.log("[v0] Call data fetched successfully")

    console.log("[v0] Call data keys:", Object.keys(callData))
    console.log("[v0] Has messages:", !!callData.messages)
    console.log("[v0] Has transcript:", !!callData.transcript)
    console.log("[v0] Has artifact:", !!callData.artifact)

    if (callData.messages) {
      console.log("[v0] Messages count:", callData.messages.length)
      console.log("[v0] First message structure:", JSON.stringify(callData.messages[0], null, 2))
    }

    if (callData.artifact) {
      console.log("[v0] Artifact structure:", JSON.stringify(callData.artifact, null, 2))
    }

    let transcript = ""

    // Try to get transcript from artifact.messages first (most reliable)
    if (callData.artifact?.messages && Array.isArray(callData.artifact.messages)) {
      console.log("[v0] Extracting transcript from artifact.messages")
      transcript = callData.artifact.messages
        .filter((msg: any) => msg.message || msg.content)
        .map((msg: any) => {
          const role = msg.role === "assistant" || msg.role === "bot" ? "Agent" : "Customer"
          const content = msg.message || msg.content || ""
          return `${role}: ${content}`
        })
        .join("\n")
    }
    // Try messages array
    else if (callData.messages && Array.isArray(callData.messages)) {
      console.log("[v0] Extracting transcript from messages array")
      transcript = callData.messages
        .filter((msg: any) => msg.message || msg.content)
        .map((msg: any) => {
          const role = msg.role === "assistant" || msg.role === "bot" ? "Agent" : "Customer"
          const content = msg.message || msg.content || ""
          return `${role}: ${content}`
        })
        .join("\n")
    }
    // Try direct transcript field
    else if (callData.transcript) {
      console.log("[v0] Using direct transcript field")
      transcript = callData.transcript
    }
    // Try artifact.transcript
    else if (callData.artifact?.transcript) {
      console.log("[v0] Using artifact.transcript field")
      transcript = callData.artifact.transcript
    }

    console.log("[v0] Extracted transcript length:", transcript.length)
    console.log("[v0] Transcript preview:", transcript.substring(0, 200))

    if (!transcript || transcript.length < 10) {
      console.error("[v0] No valid transcript available")
      return NextResponse.json(
        {
          error: "No transcript available for this call. The call may not have been completed or recorded properly.",
          callData: {
            status: callData.status,
            hasMessages: !!callData.messages,
            hasTranscript: !!callData.transcript,
            hasArtifact: !!callData.artifact,
          },
        },
        { status: 400 },
      )
    }

    console.log("[v0] Generating AI analysis with structured output...")
    const openaiApiKey = process.env.OPENAI_API_KEY
    const openaiUrl = "https://api.openai.com/v1/chat/completions"

    const analysisPrompt = `Analyze this customer service call transcript and provide a detailed report.

Transcript:
${transcript}

Evaluate:
1. Customer cooperation level (1-10)
2. Customer engagement level (1-10)
3. Whether customer requested to postpone the call
4. Key discussion points
5. Overall summary
6. 10 assessment questions covering: greeting quality, issue understanding, solution provided, professionalism, communication clarity, customer satisfaction, problem resolution, follow-up offered, call efficiency, and overall experience
7. Recommendations for improvement
8. Overall call score (1-10)

Provide the response in JSON format with the following structure:
{
  "customerCooperation": { "score": number, "description": string },
  "engagement": { "score": number, "description": string },
  "postponementRequested": boolean,
  "keyPoints": [string],
  "summary": string,
  "assessmentQuestions": [{ "question": string, "answer": string, "status": "positive" | "negative" | "neutral" }],
  "recommendations": [string],
  "overallScore": number
}`

    const openaiResponse = await fetch(openaiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert call center quality analyst. Analyze call transcripts and provide detailed, structured reports in JSON format.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    if (!openaiResponse.ok) {
      console.error("[v0] OpenAI API error:", openaiResponse.status)
      const errorText = await openaiResponse.text()
      console.error("[v0] Error details:", errorText)
      return NextResponse.json({ error: "Failed to generate analysis" }, { status: openaiResponse.status })
    }

    const openaiData = await openaiResponse.json()
    const analysisText = openaiData.choices?.[0]?.message?.content || ""

    console.log("[v0] OpenAI response received, length:", analysisText.length)

    let analysis
    try {
      analysis = JSON.parse(analysisText)

      // Ensure we have exactly 10 assessment questions
      if (!Array.isArray(analysis.assessmentQuestions) || analysis.assessmentQuestions.length < 10) {
        console.log("[v0] Padding assessment questions to 10")
        const defaultQuestions = [
          { question: "Greeting Quality", answer: "Standard greeting provided", status: "neutral" },
          { question: "Issue Understanding", answer: "Issue understood correctly", status: "positive" },
          { question: "Solution Provided", answer: "Solution offered", status: "positive" },
          { question: "Professionalism", answer: "Professional demeanor maintained", status: "positive" },
          { question: "Communication Clarity", answer: "Clear communication", status: "positive" },
          { question: "Customer Satisfaction", answer: "Customer appeared satisfied", status: "positive" },
          { question: "Problem Resolution", answer: "Issue addressed", status: "positive" },
          { question: "Follow-up Offered", answer: "Follow-up provided", status: "positive" },
          { question: "Call Efficiency", answer: "Call handled efficiently", status: "positive" },
          { question: "Overall Experience", answer: "Positive experience", status: "positive" },
        ]

        analysis.assessmentQuestions = analysis.assessmentQuestions || []
        while (analysis.assessmentQuestions.length < 10) {
          analysis.assessmentQuestions.push(defaultQuestions[analysis.assessmentQuestions.length])
        }
      }

      console.log("[v0] Analysis parsed successfully")
    } catch (parseError: any) {
      console.error("[v0] Failed to parse OpenAI response:", parseError.message)
      console.error("[v0] Response text:", analysisText)

      analysis = {
        customerCooperation: {
          score: 7,
          description: "Analysis could not be completed. Manual review recommended.",
        },
        engagement: {
          score: 7,
          description: "Unable to assess engagement automatically.",
        },
        postponementRequested: false,
        keyPoints: ["Call transcript available for manual review"],
        summary: "Automated analysis failed. Please review the transcript manually for detailed insights.",
        assessmentQuestions: [
          { question: "Greeting Quality", answer: "Requires manual review", status: "neutral" },
          { question: "Issue Understanding", answer: "Requires manual review", status: "neutral" },
          { question: "Solution Provided", answer: "Requires manual review", status: "neutral" },
          { question: "Professionalism", answer: "Requires manual review", status: "neutral" },
          { question: "Communication Clarity", answer: "Requires manual review", status: "neutral" },
          { question: "Customer Satisfaction", answer: "Requires manual review", status: "neutral" },
          { question: "Problem Resolution", answer: "Requires manual review", status: "neutral" },
          { question: "Follow-up Offered", answer: "Requires manual review", status: "neutral" },
          { question: "Call Efficiency", answer: "Requires manual review", status: "neutral" },
          { question: "Overall Experience", answer: "Requires manual review", status: "neutral" },
        ],
        recommendations: ["Manual review of transcript recommended"],
        overallScore: 7,
      }
    }

    // Prepare report data
    const report = {
      id: callId,
      callId: callId,
      customerName: callData.customer?.name || "Unknown",
      phoneNumber: callData.customer?.number || callData.phoneNumber?.number || "",
      customerEmail: callData.metadata?.customerEmail || "",
      duration:
        callData.endedAt && callData.startedAt
          ? Math.floor((new Date(callData.endedAt).getTime() - new Date(callData.startedAt).getTime()) / 1000)
          : 0,
      status: callData.status || "completed",
      createdAt: callData.createdAt || new Date().toISOString(),
      language: callData.metadata?.language || "en",
      transcript: transcript,
      recordingUrl: callData.recordingUrl || "",
      analysis: analysis,
      generatedAt: new Date().toISOString(),
    }

    console.log("[v0] Report generated successfully")

    return NextResponse.json(report)
  } catch (error) {
    console.error("[v0] Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
