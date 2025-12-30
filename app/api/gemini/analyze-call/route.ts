import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript, customerName, language } = body

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const analysisPrompt =
      language === "ar"
        ? `أنت محلل مكالمات خبير لمركز اتصالات STC. قم بتحليل النص التالي للمكالمة وقدم تقريراً شاملاً باللغة العربية.

نص المكالمة:
${transcript}

قدم التحليل التالي بصيغة JSON:

{
  "customerCooperation": {
    "score": (رقم من 1-10),
    "assessment": "تقييم مفصل لمدى تعاون العميل"
  },
  "engagement": {
    "score": (رقم من 1-10),
    "assessment": "تقييم مدى تفاعل العميل"
  },
  "postponementRequested": {
    "requested": (true/false),
    "reason": "السبب إن وجد"
  },
  "keyPoints": [
    "النقطة الأولى المهمة",
    "النقطة الثانية المهمة",
    "النقطة الثالثة المهمة"
  ],
  "assessmentQuestions": [
    {
      "question": "هل تم التعريف بالهوية بشكل صحيح؟",
      "answer": "نعم/لا",
      "status": "ناجح/فاشل",
      "details": "تفاصيل إضافية"
    },
    // ... 9 أسئلة أخرى
  ],
  "summary": "ملخص شامل للمكالمة (3-5 جمل)",
  "recommendations": [
    "توصية 1",
    "توصية 2"
  ],
  "overallScore": (رقم من 1-10)
}`
        : `You are an expert call analyst for STC call center. Analyze the following call transcript and provide a comprehensive report.

Call Transcript:
${transcript}

Provide the analysis in JSON format:

{
  "customerCooperation": {
    "score": (number 1-10),
    "assessment": "detailed assessment of customer cooperation"
  },
  "engagement": {
    "score": (number 1-10),
    "assessment": "assessment of customer engagement level"
  },
  "postponementRequested": {
    "requested": (true/false),
    "reason": "reason if any"
  },
  "keyPoints": [
    "first key discussion point",
    "second key discussion point",
    "third key discussion point"
  ],
  "assessmentQuestions": [
    {
      "question": "Was proper identification provided?",
      "answer": "Yes/No",
      "status": "Pass/Fail",
      "details": "additional details"
    },
    // ... 9 more questions covering: greeting quality, active listening, problem resolution, 
    // product knowledge, professionalism, call control, closing, follow-up, customer satisfaction
  ],
  "summary": "comprehensive call summary (3-5 sentences)",
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "overallScore": (number 1-10)
}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                  text: analysisPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Gemini API Error:", errorText)
      return NextResponse.json({ error: `Gemini API Error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse analysis from Gemini" }, { status: 500 })
    }

    const analysis = JSON.parse(jsonMatch[0])

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("[v0] Error analyzing call:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze call" },
      { status: 500 },
    )
  }
}
