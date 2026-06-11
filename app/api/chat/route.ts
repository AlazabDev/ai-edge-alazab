import { createAgentUIStreamResponse, convertToModelMessages } from 'ai'
import { alazabAgent } from '@/lib/ai/agent'
import { db } from '@/lib/db'
import { messages as messagesTable, conversations } from '@/lib/db/schema'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const { messages: uiMessages, conversationId, userId } = await req.json()

    if (!uiMessages || !Array.isArray(uiMessages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: 'Conversation ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify conversation exists and belongs to user
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    })

    if (!conversation || conversation.userId !== userId) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(uiMessages)

    // Store user message in database
    if (uiMessages.length > 0) {
      const lastMessage = uiMessages[uiMessages.length - 1]
      if (lastMessage.role === 'user') {
        const messageId = nanoid()
        const content = lastMessage.parts
          ?.filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('') || ''

        await db.insert(messagesTable).values({
          id: messageId,
          conversationId,
          senderType: 'user',
          senderId: userId,
          content,
          messageType: 'text',
        })
      }
    }

    // Stream response from agent
    const response = createAgentUIStreamResponse({
      agent: alazabAgent,
      uiMessages,
      onFinish: async ({ messages: finalMessages }) => {
        // Save bot response to database
        try {
          if (finalMessages && finalMessages.length > 0) {
            const lastMessage = finalMessages[finalMessages.length - 1]
            if (lastMessage.role === 'assistant') {
              const messageId = nanoid()
              const content = lastMessage.parts
                ?.filter((p: any) => p.type === 'text')
                .map((p: any) => p.text)
                .join('') || ''

              if (content) {
                await db.insert(messagesTable).values({
                  id: messageId,
                  conversationId,
                  senderType: 'bot',
                  content,
                  messageType: 'text',
                })
              }
            }
          }

          // Update conversation updated timestamp
          await db
            .update(conversations)
            .set({
              updatedAt: new Date(),
              lastMessageAt: new Date(),
            })
            .where(eq(conversations.id, conversationId))
        } catch (error) {
          console.error('[v0] Error saving bot response:', error)
        }
      },
    })

    return response
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
