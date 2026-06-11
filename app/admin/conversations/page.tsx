'use client'

import { useEffect, useState } from 'react'
import { getConversations } from '@/app/actions/data'

interface Conversation {
  id: string
  title: string
  status: string
  channel: string
  createdAt: Date
  lastMessageAt: Date
  messages?: Array<{
    id: string
    content: string
    senderType: string
    createdAt: Date
  }>
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getConversations()
        setConversations(data || [])
        setIsLoading(false)
      } catch (error) {
        console.error('[v0] Error loading conversations:', error)
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Conversations Management</h2>
        <p className="mt-2 text-slate-600">Monitor and manage customer conversations across all channels</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="col-span-1 rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Conversations ({conversations.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-200">
            {conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">No conversations</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">{conv.title}</p>
                  <p className="text-xs text-slate-600">
                    {conv.channel} • {new Date(conv.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Status: <span className="font-medium">{conv.status}</span>
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation Details */}
        <div className="col-span-2 rounded-lg bg-white shadow-sm border border-slate-200 overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
                <h3 className="font-semibold text-slate-900">{selectedConversation.title}</h3>
                <div className="mt-2 flex gap-2">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {selectedConversation.channel}
                  </span>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    selectedConversation.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedConversation.status}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="max-h-80 overflow-y-auto p-6 space-y-4">
                {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                  selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          msg.senderType === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.senderType === 'user' ? 'text-blue-100' : 'text-slate-600'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500">No messages yet</div>
                )}
              </div>

              {/* Info */}
              <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 text-sm text-slate-600 space-y-2">
                <p>
                  <span className="font-medium">Created:</span> {new Date(selectedConversation.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Last Activity:</span>{' '}
                  {selectedConversation.lastMessageAt
                    ? new Date(selectedConversation.lastMessageAt).toLocaleString()
                    : 'No messages'}
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <p className="text-slate-500">Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
