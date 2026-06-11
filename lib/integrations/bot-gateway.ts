'use server'

import { nanoid } from 'nanoid'

// Bot Gateway API Configuration
const BOT_GATEWAY_URL =
  'https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway'
const BOT_API_KEY = process.env.BOT_API_KEY || ''

export interface BotGatewayPayload {
  action: string
  payload: Record<string, any>
  session_id?: string
  metadata?: Record<string, any>
}

export interface BotGatewayResponse {
  success: boolean
  data?: any
  message?: string
  error?: string
}

/**
 * Call Bot Gateway with standardized format
 */
export async function callBotGateway(
  action: string,
  payload: Record<string, any>,
  sessionId?: string,
  source: 'azabot' | 'abuauf_bot' | 'uberfix_bot' = 'azabot'
): Promise<BotGatewayResponse> {
  try {
    const response = await fetch(BOT_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'x-api-key': BOT_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        payload,
        session_id: sessionId || nanoid(),
        metadata: { source, channel: 'web' },
      }),
    })

    const data = (await response.json()) as BotGatewayResponse

    if (!response.ok) {
      console.error(
        '[v0] Bot Gateway error:',
        data.error || 'Unknown error'
      )
      return { success: false, error: data.error || 'Unknown error' }
    }

    return data
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Bot Gateway request failed:', message)
    return { success: false, error: message }
  }
}

// ============================================================================
// MAINTENANCE REQUEST ACTIONS
// ============================================================================

export async function createMaintenanceRequest(
  clientName: string,
  clientPhone: string,
  serviceType: string,
  location: string,
  description: string,
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  clientEmail?: string,
  latitude?: number,
  longitude?: number,
  title?: string
) {
  return callBotGateway('create_request', {
    client_name: clientName,
    client_phone: clientPhone,
    service_type: serviceType,
    location,
    description,
    priority,
    client_email: clientEmail,
    latitude,
    longitude,
    title: title || description.substring(0, 50),
  })
}

export async function checkRequestStatus(
  searchTerm: string,
  searchType: 'request_number' | 'phone' | 'text' = 'request_number'
) {
  return callBotGateway('check_status', {
    search_term: searchTerm,
    search_type: searchType,
  })
}

export async function getRequestDetails(
  requestNumber: string,
  clientPhone: string
) {
  return callBotGateway('get_request_details', {
    request_number: requestNumber,
    client_phone: clientPhone,
  })
}

export async function updateMaintenanceRequest(
  requestId: string,
  clientPhone: string,
  updates: {
    description?: string
    location?: string
    priority?: string
    service_type?: string
    customer_notes?: string
    latitude?: number
    longitude?: number
    title?: string
  }
) {
  return callBotGateway('update_request', {
    request_id: requestId,
    client_phone: clientPhone,
    updates,
  })
}

export async function cancelMaintenanceRequest(
  requestId: string,
  clientPhone: string,
  reason: string
) {
  return callBotGateway('cancel_request', {
    request_id: requestId,
    client_phone: clientPhone,
    reason,
  })
}

export async function addRequestNote(
  requestId: string,
  note: string
) {
  return callBotGateway('add_note', {
    request_id: requestId,
    note,
  })
}

// ============================================================================
// TECHNICIAN ACTIONS
// ============================================================================

export async function listTechnicians(
  specialization?: string,
  cityId?: string,
  limit = 10
) {
  return callBotGateway('list_technicians', {
    specialization,
    city_id: cityId,
    limit,
  })
}

export async function assignTechnician(
  requestId: string,
  technicianId?: string,
  auto = true
) {
  return callBotGateway('assign_technician', {
    request_id: requestId,
    technician_id: technicianId,
    auto,
  })
}

// ============================================================================
// CATALOG ACTIONS
// ============================================================================

export async function listServices() {
  return callBotGateway('list_services', {})
}

export async function listCategories() {
  return callBotGateway('list_categories', {})
}

export async function getBranches() {
  return callBotGateway('get_branches', {})
}

export async function findNearestBranch(
  latitude: number,
  longitude: number,
  city?: string
) {
  return callBotGateway('find_nearest_branch', {
    latitude,
    longitude,
    city,
  })
}

// ============================================================================
// QUOTE AND CUSTOMER INFO ACTIONS
// ============================================================================

export async function getQuote(
  serviceType: string,
  description: string,
  location: string,
  clientName: string,
  clientPhone: string,
  areaSqm?: number
) {
  return callBotGateway('get_quote', {
    service_type: serviceType,
    description,
    location,
    area_sqm: areaSqm,
    client_name: clientName,
    client_phone: clientPhone,
  })
}

export async function collectCustomerInfo(
  sessionId: string,
  clientPhone: string,
  clientName: string,
  location: string
) {
  return callBotGateway(
    'collect_customer_info',
    {
      client_phone: clientPhone,
      client_name: clientName,
      location,
    },
    sessionId
  )
}

// ============================================================================
// ACCOUNTING AND NAVIGATION ACTIONS
// ============================================================================

export async function daftraSyncClient(
  clientName: string,
  clientPhone: string,
  clientEmail?: string
) {
  return callBotGateway('daftra_sync_client', {
    client_name: clientName,
    client_phone: clientPhone,
    client_email: clientEmail,
  })
}

export async function brandNavigator(
  clientPreferences: string[],
  previousInteractions?: string[]
) {
  return callBotGateway('brand_navigator', {
    client_preferences: clientPreferences,
    previous_interactions: previousInteractions,
  })
}
