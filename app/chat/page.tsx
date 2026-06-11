'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/app/actions/auth'
import { createConversation } from '@/app/actions/data'

interface User {
  id: string
  email: string
  name: string
}

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [conversationId, setConversationId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const currentUser = await getUser()
        if (!currentUser) {
          router.push('/sign-in')
          return
        }

        setUser(currentUser as User)

        // Create a new conversation
        const conversation = await createConversation('alazab-construction', 'web')
        setConversationId(conversation.id)
        setIsLoading(false)
      } catch (error) {
        console.error('[v0] Error initializing chat:', error)
        router.push('/sign-in')
      }
    }

    initializeChat()
  }, [router])

  const { messages, input, handleInputChange, handleSubmit, append, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  })

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !conversationId) return

    await append({
      role: 'user',
      content: input,
      custom: {
        conversationId,
        userId: user?.id,
      },
    })

    handleInputChange({ target: { value: '' } } as any)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">مجموعة العزب</h1>
            <p className="text-sm text-slate-600">The Alazab Group - Your Service Partner</p>
          </div>
          {user && (
            <div className="text-right">
              <p className="font-medium text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-5xl">👋</div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900">Welcome to Alazab Services</h2>
              <p className="text-slate-600">
                How can we help you today? Ask about our construction, finishing, or maintenance
                services.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                }`}
              >
                <div className="text-sm">
                  {message.content ||
                    message.parts
                      ?.filter((p: any) => p.type === 'text')
                      .map((p: any) => p.text)
                      .join('')}
                </div>
              </div>
            </div>
          ))
        )}

        {status === 'streaming' && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-900 border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white px-6 py-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={status === 'streaming' || !conversationId}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100 disabled:text-slate-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || status === 'streaming' || !conversationId}
            className="rounded-lg bg-blue-500 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
