import { tool } from 'ai'
import { z } from 'zod'

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
    // This would normally query the database
    // For now, return mock data based on brand
    const brands: Record<
      string,
      {
        services: Array<{ name: string; description: string; price: string }>
      }
    > = {
      'alazab-construction': {
        services: [
          {
            name: 'Building Construction',
            description: 'Full building construction services',
            price: 'Custom quote',
          },
          {
            name: 'Project Management',
            description: 'Professional project management and oversight',
            price: 'Custom quote',
          },
          {
            name: 'Consultation',
            description: 'Architecture and construction consultation',
            price: 'From SAR 5,000',
          },
        ],
      },
      'luxury-finishing': {
        services: [
          {
            name: 'Interior Finishing',
            description: 'Luxury interior finishing and design',
            price: 'Custom quote',
          },
          {
            name: 'Paint & Flooring',
            description: 'Premium painting and flooring installation',
            price: 'Per sqm pricing',
          },
          {
            name: 'Custom Fixtures',
            description: 'Custom fixtures and installations',
            price: 'Custom quote',
          },
        ],
      },
      uberfix: {
        services: [
          {
            name: 'Emergency Maintenance',
            description: 'Emergency repair and maintenance services',
            price: 'Call for pricing',
          },
          {
            name: 'Preventive Maintenance',
            description: 'Scheduled maintenance plans',
            price: 'From SAR 500/month',
          },
          {
            name: 'Smart Operations',
            description: 'IoT-based building operations',
            price: 'Custom quote',
          },
        ],
      },
    }

    const brandData = brands[brandName.toLowerCase().replace(/\s+/g, '-')]
    if (!brandData) {
      return {
        success: false,
        message: `Brand "${brandName}" not found. Available brands: Alazab Construction, Luxury Finishing, Brand Identity, UberFix, Laban Alasfour`,
      }
    }

    const services = serviceType
      ? brandData.services.filter((s) =>
          s.name.toLowerCase().includes(serviceType.toLowerCase())
        )
      : brandData.services

    return {
      success: true,
      brand: brandName,
      services,
      count: services.length,
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
    description: z
      .string()
      .describe('Detailed description of what the customer needs'),
    preferredDate: z
      .string()
      .optional()
      .describe('Preferred date for the service (YYYY-MM-DD format)'),
    location: z.string().optional().describe('Location/address for the service'),
    budget: z
      .string()
      .optional()
      .describe('Customer budget range if mentioned'),
    contactInfo: z
      .object({
        phone: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
  }),
  execute: async ({
    serviceName,
    description,
    preferredDate,
    location,
    budget,
    contactInfo,
  }) => {
    // In real implementation, this would:
    // 1. Save to database
    // 2. Send notification to team
    // 3. Generate quote
    return {
      success: true,
      orderId: `ORD-${Date.now()}`,
      message: `Service request created successfully for ${serviceName}`,
      details: {
        service: serviceName,
        description,
        preferredDate,
        location,
        budget,
        contactInfo,
        status: 'pending_review',
        estimatedResponse: '24-48 hours',
      },
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
    orderId: z
      .string()
      .describe('The order ID or service request ID to check'),
    customerEmail: z.string().email().optional().describe('Customer email for verification'),
  }),
  execute: async ({ orderId, customerEmail }) => {
    // Mock order status data
    const orders: Record<
      string,
      {
        status: string
        service: string
        createdDate: string
        estimatedCompletion: string
        progress: number
      }
    > = {
      'ORD-1234567890': {
        status: 'in_progress',
        service: 'Building Construction',
        createdDate: '2024-05-15',
        estimatedCompletion: '2024-08-30',
        progress: 65,
      },
      'ORD-0987654321': {
        status: 'pending',
        service: 'Interior Finishing',
        createdDate: '2024-06-01',
        estimatedCompletion: '2024-06-15',
        progress: 10,
      },
    }

    const order = orders[orderId]
    if (!order) {
      return {
        success: false,
        message: `Order ${orderId} not found. Please verify the order ID.`,
      }
    }

    return {
      success: true,
      orderId,
      ...order,
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
  }),
  execute: async ({ projectType, budget, requirements }) => {
    const recommendations: Record<string, string[]> = {
      residential: [
        'Alazab Construction for structural work',
        'Luxury Finishing for interior design',
        'Brand Identity for custom fixtures',
      ],
      commercial: [
        'Alazab Construction for large-scale projects',
        'UberFix for smart building operations',
        'Laban Alasfour for quality materials',
      ],
      renovation: [
        'Luxury Finishing for modern renovations',
        'Brand Identity for custom design elements',
        'UberFix for building systems upgrades',
      ],
    }

    const services = recommendations[projectType.toLowerCase()] || recommendations.residential

    return {
      success: true,
      projectType,
      recommendations: services,
      nextSteps: [
        'Contact recommended services for quotes',
        'Schedule site visits',
        'Discuss timeline and budget',
      ],
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
