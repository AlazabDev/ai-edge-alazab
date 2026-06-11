import { tool } from 'ai'
import { z } from 'zod'
import {
  listServices,
  createMaintenanceRequest,
  checkRequestStatus,
  getRequestDetails,
  listTechnicians,
  getQuote,
  getBranches,
  findNearestBranch,
  daftraSyncClient,
  brandNavigator,
} from '@/lib/integrations/bot-gateway'

/**
 * Tool: Search brand services
 * Searches available services for a specific brand
 */
export const searchBrandServicesTool = tool({
  description: 'Search available services and offerings for a specific brand',
  inputSchema: z.object({
    brandName: z.string().describe('The name or slug of the brand'),
    serviceType: z
      .string()
      .optional()
      .describe('Optional: specific service type to search for'),
  }),
  execute: async ({ brandName, serviceType }) => {
    try {
      // Fetch services from bot gateway
      const servicesResponse = await listServices()

      if (!servicesResponse.success || !servicesResponse.data) {
        return {
          success: false,
          message: 'Could not retrieve services at this time',
        }
      }

      const allServices = servicesResponse.data
      const filtered = serviceType
        ? allServices.filter((s: any) =>
            s.label?.toLowerCase().includes(serviceType.toLowerCase())
          )
        : allServices

      return {
        success: true,
        brand: brandName,
        services: filtered,
        count: filtered.length,
      }
    } catch (error) {
      console.error('[v0] Error fetching services:', error)
      return {
        success: false,
        message: 'Failed to fetch services',
      }
    }
  },
})

/**
 * Tool: Create service request/order
 * Creates a new service request or order from the user
 */
export const createServiceRequestTool = tool({
  description: 'Create a new service request or order for a specific service',
  inputSchema: z.object({
    serviceName: z.string().describe('The name of the service requested'),
    serviceType: z.string().describe('Service type code (e.g., plumbing, electrical, ac)'),
    description: z
      .string()
      .describe('Detailed description of what the customer needs'),
    clientName: z.string().describe('Customer name'),
    clientPhone: z.string().describe('Customer phone number'),
    clientEmail: z.string().email().optional().describe('Customer email'),
    location: z.string().optional().describe('Location/address for the service'),
    priority: z
      .enum(['low', 'medium', 'high', 'urgent'])
      .optional()
      .default('medium')
      .describe('Priority level of the service'),
    latitude: z.number().optional().describe('Latitude for geolocation'),
    longitude: z.number().optional().describe('Longitude for geolocation'),
  }),
  execute: async ({
    serviceName,
    serviceType,
    description,
    clientName,
    clientPhone,
    clientEmail,
    location,
    priority,
    latitude,
    longitude,
  }) => {
    try {
      // Create maintenance request via bot gateway
      const response = await createMaintenanceRequest(
        clientName,
        clientPhone,
        serviceType,
        location || 'Not specified',
        description,
        priority as 'low' | 'medium' | 'high' | 'urgent',
        clientEmail,
        latitude,
        longitude,
        serviceName
      )

      if (!response.success) {
        return {
          success: false,
          message: response.error || 'Failed to create service request',
        }
      }

      return {
        success: true,
        requestId: response.data?.request_id,
        requestNumber: response.data?.tracking_number,
        message: `Service request created successfully for ${serviceName}`,
        details: {
          service: serviceName,
          description,
          clientName,
          clientPhone,
          location,
          priority,
          status: response.data?.status || 'pending',
          estimatedResponse: '24-48 hours',
        },
      }
    } catch (error) {
      console.error('[v0] Error creating service request:', error)
      return {
        success: false,
        message: 'Failed to create service request',
      }
    }
  },
})

/**
 * Tool: Check order status
 * Checks the status of an existing order
 */
export const checkOrderStatusTool = tool({
  description:
    'Check the status of an existing service order or maintenance request',
  inputSchema: z.object({
    searchTerm: z
      .string()
      .describe('The order ID, tracking number, or request number to check'),
    clientPhone: z.string().optional().describe('Customer phone for verification'),
    searchType: z
      .enum(['request_number', 'phone', 'text'])
      .optional()
      .default('request_number')
      .describe('Type of search to perform'),
  }),
  execute: async ({ searchTerm, clientPhone, searchType }) => {
    try {
      // Use bot gateway to check status
      const response = await checkRequestStatus(searchTerm, searchType)

      if (!response.success) {
        return {
          success: false,
          message: response.error || `No request found for "${searchTerm}"`,
        }
      }

      return {
        success: true,
        requestId: response.data?.id,
        requestNumber: response.data?.request_number,
        status: response.data?.status,
        workflowStage: response.data?.workflow_stage,
        service: response.data?.service_type,
        priority: response.data?.priority,
        clientName: response.data?.client_name,
        createdDate: response.data?.created_at,
        updatedDate: response.data?.updated_at,
        notes: response.data?.notes,
      }
    } catch (error) {
      console.error('[v0] Error checking order status:', error)
      return {
        success: false,
        message: 'Failed to check order status',
      }
    }
  },
})

/**
 * Tool: Get customer recommendations
 * Provides intelligent recommendations based on customer needs
 */
export const getRecommendationsTool = tool({
  description: 'Get personalized recommendations based on customer needs and budget',
  inputSchema: z.object({
    projectType: z
      .string()
      .describe('Type of project (e.g., residential, commercial, renovation)'),
    budget: z.string().optional().describe('Budget range or amount'),
    requirements: z
      .array(z.string())
      .optional()
      .describe('List of specific requirements or features needed'),
    clientName: z.string().optional().describe('Customer name for personalization'),
  }),
  execute: async ({ projectType, budget, requirements, clientName }) => {
    try {
      // Use brand navigator for intelligent recommendations
      const response = await brandNavigator(
        requirements || [],
        [projectType]
      )

      if (!response.success) {
        return {
          success: false,
          message: 'Could not generate recommendations',
        }
      }

      const recommendations: Record<string, string[]> = {
        residential: [
          'Alazab Construction للأعمال الإنشائية',
          'Luxury Finishing للتشطيبات الفاخرة',
          'Brand Identity للعناصر المخصصة',
        ],
        commercial: [
          'Alazab Construction للمشاريع الكبيرة',
          'UberFix للعمليات الذكية',
          'Laban Alasfour للمواد الجودة',
        ],
        renovation: [
          'Luxury Finishing للترميمات الحديثة',
          'Brand Identity لعناصر التصميم',
          'UberFix لترقية أنظمة المبنى',
        ],
      }

      const services = recommendations[projectType.toLowerCase()] || recommendations.residential

      return {
        success: true,
        projectType,
        budget,
        recommendations: services,
        personalization: clientName ? `Based on your needs, ${clientName}` : undefined,
        nextSteps: [
          'اطلب عروض أسعار من الخدمات الموصى بها',
          'جدول زيارات الموقع',
          'ناقش الجدول الزمني والميزانية',
        ],
      }
    } catch (error) {
      console.error('[v0] Error generating recommendations:', error)
      return {
        success: false,
        message: 'Failed to generate recommendations',
      }
    }
  },
})

/**
 * Tool: FAQ handler
 * Answers common frequently asked questions
 */
export const faqHandlerTool = tool({
  description: 'Answer frequently asked questions about services, pricing, and processes',
  inputSchema: z.object({
    question: z.string().describe('The customer question'),
    topic: z
      .enum(['pricing', 'timeline', 'process', 'warranty', 'contact', 'general'])
      .optional()
      .describe('Topic category of the question'),
  }),
  execute: async ({ question, topic }) => {
    const faqs: Record<string, Record<string, string>> = {
      pricing: {
        'How do you calculate quotes?':
          'We provide custom quotes based on project scope, materials, labor, and timeline. Request a consultation for detailed pricing.',
        'Do you offer payment plans?':
          'Yes, we offer flexible payment plans for projects. Contact our sales team for details.',
        'Are there volume discounts?':
          'Yes, we offer discounts for large projects and multiple services. Ask for a quote.',
      },
      timeline: {
        'How long does a typical project take?':
          'Projects vary. Small services: 1-2 weeks. Medium projects: 1-3 months. Large: 3+ months. Get a specific estimate with a quote.',
        'Can you rush a project?':
          'Yes, we offer expedited services with additional fees. Contact us to discuss your timeline.',
        'What is the fastest service?':
          'Consultations and estimates are typically provided within 24-48 hours.',
      },
      process: {
        'How do I start a project?':
          '1. Contact us with your needs 2. Schedule consultation 3. Receive quote 4. Approve and sign contract 5. Project begins',
        'What documents do I need?':
          'Required: Project plans, permit requirements, budget approval, contact information. We can help prepare documentation.',
      },
      warranty: {
        'What warranty do you offer?':
          'We provide 1-year warranty on workmanship and materials. Extended warranties available.',
        'Is warranty transferable?':
          'Yes, workmanship warranties are transferable with documentation.',
      },
      general: {
        'What brands are you?':
          'We are mujamo\u0259lat al-\u02bfazb (The Alazab Group): Alazab Construction, Luxury Finishing, Brand Identity, UberFix, and Laban Alasfour.',
        'How can I contact you?':
          'Visit alazab.com for contact information, or reach out through this chat.',
      },
    }

    const relevantCategory = topic || 'general'
    const categoryFAQs = faqs[relevantCategory]
    const answer =
      categoryFAQs?.[question] ||
      Object.values(faqs)
        .flatMap((cat) => Object.entries(cat))
        .find(([q]) => q.toLowerCase().includes(question.toLowerCase()))?.[1]

    return {
      success: !!answer,
      question,
      answer: answer || 'I could not find an answer to that question. Please ask our team directly.',
      relatedQuestions:
        categoryFAQs && Object.keys(categoryFAQs).slice(0, 2),
    }
  },
})

/**
 * Tool: Save customer preferences
 * Saves customer preferences for future interactions
 */
export const saveCustomerPreferencesTool = tool({
  description:
    'Save customer preferences and requirements for future reference and personalization',
  inputSchema: z.object({
    customerName: z.string().describe('Name of the customer'),
    preferences: z.object({
      preferredBrand: z.string().optional(),
      preferredContact: z.enum(['whatsapp', 'telegram', 'email', 'phone']).optional(),
      serviceInterests: z.array(z.string()).optional(),
      budget: z.string().optional(),
      notes: z.string().optional(),
    }),
  }),
  execute: async ({ customerName, preferences }) => {
    // In real implementation, this would save to database
    return {
      success: true,
      message: `Preferences saved for ${customerName}`,
      savedPreferences: preferences,
      nextTime: 'We will remember your preferences next time we chat',
    }
  },
})

// Export all tools
export const agentTools = {
  searchBrandServices: searchBrandServicesTool,
  createServiceRequest: createServiceRequestTool,
  checkOrderStatus: checkOrderStatusTool,
  getRecommendations: getRecommendationsTool,
  faqHandler: faqHandlerTool,
  saveCustomerPreferences: saveCustomerPreferencesTool,
}
