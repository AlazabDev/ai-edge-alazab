import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Simple streaming response
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: 'أنت مساعد ذكي لخدمة عملاء مجموعة العزب. تقدم معلومات عن الخدمات بكفاءة واحترافية.',
      messages: messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
