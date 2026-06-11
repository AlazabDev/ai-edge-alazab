'use server'

import { db } from '@/lib/db'
import {
  users,
  conversations,
  messages,
  orders,
  brands,
  aiContext,
} from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { getUserId } from './auth'
import { nanoid } from 'nanoid'

// User operations
export async function getOrCreateUser(email: string, name: string) {
  const userId = nanoid()
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existingUser) {
    return existingUser
  }

  const newUser = await db
    .insert(users)
    .values({
      id: userId,
      email,
      name,
    })
    .returning()

  return newUser[0]
}

// Brand operations
export async function getBrands() {
  return await db.query.brands.findMany({
    where: eq(brands.isActive, true),
  })
}

export async function getBrand(brandId: string) {
  return await db.query.brands.findFirst({
    where: eq(brands.id, brandId),
  })
}

// Conversation operations
export async function createConversation(
  brandId: string,
  channel: 'web' | 'whatsapp' | 'telegram' = 'web'
) {
  const userId = await getUserId()
  const conversationId = nanoid()

  const conversation = await db
    .insert(conversations)
    .values({
      id: conversationId,
      userId,
      brandId,
      channel,
      title: `Chat - ${new Date().toLocaleDateString()}`,
    })
    .returning()

  return conversation[0]
}

export async function getConversations(brandId?: string) {
  const userId = await getUserId()

  const query = db.query.conversations.findMany({
    where: eq(conversations.userId, userId),
    orderBy: desc(conversations.updatedAt),
    with: {
      messages: {
        orderBy: desc(messages.createdAt),
        limit: 50,
      },
    },
  })

  return await query
}

export async function getConversation(conversationId: string) {
  const userId = await getUserId()

  return await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.userId, userId)
    ),
    with: {
      messages: {
        orderBy: desc(messages.createdAt),
      },
    },
  })
}

// Message operations
export async function addMessage(
  conversationId: string,
  content: string,
  senderType: 'user' | 'bot' | 'agent',
  senderId?: string,
  metadata?: any
) {
  const userId = await getUserId()

  // Verify user owns the conversation
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.userId, userId)
    ),
  })

  if (!conversation) {
    throw new Error('Conversation not found')
  }

  const messageId = nanoid()

  const message = await db
    .insert(messages)
    .values({
      id: messageId,
      conversationId,
      senderType,
      senderId: senderId || userId,
      content,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    })
    .returning()

  // Update conversation's last message timestamp
  await db
    .update(conversations)
    .set({
      updatedAt: new Date(),
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversationId))

  return message[0]
}

export async function getMessages(conversationId: string, limit = 50) {
  const userId = await getUserId()

  // Verify user owns the conversation
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.userId, userId)
    ),
  })

  if (!conversation) {
    throw new Error('Conversation not found')
  }

  return await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: desc(messages.createdAt),
    limit,
  })
}

// Order operations
export async function createOrder(
  brandId: string,
  serviceType: string,
  data: {
    description?: string
    quantity?: number
    unitPrice?: string
    totalAmount?: string
    preferredDate?: string
    preferredTimeSlot?: string
    address?: string
    conversationId?: string
  }
) {
  const userId = await getUserId()
  const orderId = nanoid()
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const order = await db
    .insert(orders)
    .values({
      id: orderId,
      orderNumber,
      userId,
      brandId,
      serviceType,
      description: data.description,
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice,
      totalAmount: data.totalAmount,
      preferredDate: data.preferredDate,
      preferredTimeSlot: data.preferredTimeSlot,
      address: data.address,
      conversationId: data.conversationId,
    })
    .returning()

  return order[0]
}

export async function getOrders(status?: string) {
  const userId = await getUserId()

  const query = db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: desc(orders.createdAt),
  })

  return await query
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const userId = await getUserId()

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
  })

  if (!order || order.userId !== userId) {
    throw new Error('Order not found')
  }

  await db
    .update(orders)
    .set({
      status: newStatus as any,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  return true
}

// AI Context operations
export async function saveAIContext(
  contextKey: string,
  contextValue: any,
  conversationId?: string,
  expiresAt?: Date
) {
  const userId = await getUserId()
  const contextId = nanoid()

  const context = await db
    .insert(aiContext)
    .values({
      id: contextId,
      userId,
      conversationId,
      contextKey,
      contextValue: JSON.stringify(contextValue),
      expiresAt,
    })
    .returning()

  return context[0]
}

export async function getAIContext(contextKey: string) {
  const userId = await getUserId()

  const contexts = await db.query.aiContext.findMany({
    where: and(
      eq(aiContext.userId, userId),
      eq(aiContext.contextKey, contextKey)
    ),
  })

  return contexts
}
