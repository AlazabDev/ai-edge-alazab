import {
  pgTable,
  text,
  timestamp,
  boolean,
  decimal,
  date,
  jsonb,
  index,
  pgEnum,
  integer,
} from 'drizzle-orm/pg-core'

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'agent', 'admin'])
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
])
export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'image',
  'document',
  'audio',
  'video',
])
export const channelTypeEnum = pgEnum('channel_type', ['web', 'whatsapp', 'telegram'])

// Users table
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').unique().notNull(),
    name: text('name').notNull(),
    role: userRoleEnum('role').default('customer'),
    phoneNumber: text('phone_number'),
    telegramId: text('telegram_id').unique(),
    whatsappId: text('whatsapp_id').unique(),
    preferredChannel: channelTypeEnum('preferred_channel').default('web'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    lastInteraction: timestamp('last_interaction', { withTimezone: true }),
  },
  (table) => [
    index('idx_users_email').on(table.email),
    index('idx_users_telegram_id').on(table.telegramId),
    index('idx_users_whatsapp_id').on(table.whatsappId),
  ]
)

// Brands table
export const brands = pgTable(
  'brands',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    domain: text('domain').unique(),
    description: text('description'),
    logoUrl: text('logo_url'),
    colorPrimary: text('color_primary'),
    colorSecondary: text('color_secondary'),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [index('idx_brands_slug').on(table.slug)]
)

// Conversations table
export const conversations = pgTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    brandId: text('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
    channel: channelTypeEnum('channel').default('web'),
    title: text('title'),
    status: text('status').default('active'),
    contextSummary: jsonb('context_summary'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_conversations_user_id').on(table.userId),
    index('idx_conversations_brand_id').on(table.brandId),
  ]
)

// Messages table
export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    senderType: text('sender_type').notNull(),
    senderId: text('sender_id'),
    messageType: messageTypeEnum('message_type').default('text'),
    content: text('content').notNull(),
    metadata: jsonb('metadata'),
    hasAttachments: boolean('has_attachments').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_messages_conversation_id').on(table.conversationId),
    index('idx_messages_created_at').on(table.createdAt),
  ]
)

// Orders table
export const orders = pgTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderNumber: text('order_number').unique().notNull(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    brandId: text('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
    conversationId: text('conversation_id').references(() => conversations.id, {
      onDelete: 'set null',
    }),
    status: orderStatusEnum('status').default('pending'),
    serviceType: text('service_type').notNull(),
    description: text('description'),
    quantity: integer('quantity').default(1),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
    notes: text('notes'),
    preferredDate: date('preferred_date'),
    preferredTimeSlot: text('preferred_time_slot'),
    address: text('address'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_orders_user_id').on(table.userId),
    index('idx_orders_brand_id').on(table.brandId),
    index('idx_orders_status').on(table.status),
    index('idx_orders_created_at').on(table.createdAt),
  ]
)

// AI Context table for storing long-term context
export const aiContext = pgTable(
  'ai_context',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    conversationId: text('conversation_id').references(() => conversations.id, {
      onDelete: 'set null',
    }),
    contextKey: text('context_key').notNull(),
    contextValue: jsonb('context_value').notNull(),
    relevanceScore: decimal('relevance_score', { precision: 3, scale: 2 }).default('1.00'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('idx_ai_context_user_id').on(table.userId),
    index('idx_ai_context_conversation_id').on(table.conversationId),
  ]
)

// Better Auth tables
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})
