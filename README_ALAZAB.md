# مجموعة العزب - AI Customer Service Bot
## The Alazab Group - Intelligent Multi-Channel Bot System

An advanced AI-powered customer service bot serving مجموعة العزب (The Alazab Group) with seamless integration across Web, WhatsApp, and Telegram channels.

---

## 🏢 About The Alazab Group

We represent five dynamic Saudi brands:

- **🏗️ Alazab Construction** - Building construction and project execution
- **✨ Luxury Finishing** - Luxury finishing and interior design  
- **🎨 Brand Identity** - Visual identity and space design
- **🔧 UberFix** - Smart maintenance and building operations
- **🪵 Laban Alasfour** - Premium materials and supplies (with VR)

---

## ✨ Key Features

### For Customers
- **Multi-Channel Support**: Web Chat, WhatsApp, Telegram
- **Intelligent Recommendations**: AI suggests services based on needs
- **Service Booking**: Place orders and track status
- **Long-Term Memory**: Bot remembers preferences and history
- **Instant Responses**: 24/7 availability
- **Bilingual**: Arabic and English support

### For Administrators  
- **Unified Dashboard**: Monitor all channels and orders
- **Order Management**: Track and update service requests
- **Customer Insights**: View conversation history and analytics
- **Real-time Analytics**: Track KPIs and metrics
- **Multi-Brand Support**: Manage all 5 brands from one platform

---

## 🏗️ Architecture

### Technology Stack

```
Frontend:
  - Next.js 16 (App Router)
  - React + TypeScript
  - Tailwind CSS
  - @ai-sdk/react for chat UI

Backend:
  - Next.js API Routes
  - Better Auth (email + password)
  - Drizzle ORM
  - Neon PostgreSQL

AI & Agents:
  - Vercel AI SDK v6
  - ToolLoopAgent with 6+ tools
  - OpenAI GPT-4o-mini

Integrations (Ready):
  - WhatsApp API (Meta)
  - Telegram Bot API
  - Database: Neon PostgreSQL
```

### Database Schema

```
users                 - Customer accounts & preferences
brands                - Brand information & metadata
conversations         - Chat sessions across channels
messages              - Individual messages & content
orders                - Service requests & bookings
ai_context            - Long-term customer context & preferences
```

### AI Agent Tools

1. **searchBrandServices** - Browse available services
2. **createServiceRequest** - Submit service requests
3. **checkOrderStatus** - Track order progress
4. **getRecommendations** - Get personalized suggestions
5. **faqHandler** - Answer common questions
6. **saveCustomerPreferences** - Store customer data

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database
- OpenAI API access (via Vercel AI Gateway)
- WhatsApp & Telegram API credentials (optional, for full deployment)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ai-edge-config

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials:
# - DATABASE_URL (Neon)
# - BETTER_AUTH_SECRET (generate: openssl rand -base64 32)
# - Optional: WHATSAPP_API_KEY, TELEGRAM_BOT_TOKEN

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 User Flows

### Customer Journey

```
1. User visits web app or messages WhatsApp/Telegram
2. Bot welcomes and understands their needs
3. Bot searches relevant services
4. User selects service and provides details
5. Order created in system
6. Bot confirms and provides order ID
7. Admin notified of new order
8. Customer can track status anytime
9. Bot remembers preferences for future
```

### Admin Operations

```
Dashboard:
  ├─ View Statistics (orders, conversations, revenue)
  ├─ Orders Management
  │  ├─ Filter by status
  │  ├─ Update order status
  │  └─ View order details
  ├─ Conversations Monitoring
  │  ├─ View all conversations
  │  ├─ Read conversation history
  │  └─ See customer context
  ├─ Customers Directory
  │  ├─ View all customers
  │  ├─ See interaction history
  │  └─ Manage preferences
  └─ Analytics & Reports
     ├─ Revenue metrics
     ├─ Top services
     └─ Channel distribution
```

---

## 🔌 API Endpoints

### Chat
```
POST /api/chat
Body: { messages: UIMessage[], conversationId: string, userId: string }
Returns: Server-Sent Events stream with AI responses
```

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/signin
POST   /api/auth/signout
GET    /api/auth/session
```

### Data Operations
```
# Server Actions (use in client/server components)
getOrders()
getConversations()
createConversation()
addMessage()
createOrder()
updateOrderStatus()
saveAIContext()
getAIContext()
```

---

## 🛠️ Configuration

### Adding a New Brand

1. Update database:
```sql
INSERT INTO brands VALUES (
  'brand-id',
  'Brand Name',
  'brand-slug',
  'domain.com',
  'description',
  'logo_url',
  '#primary',
  '#secondary',
  true
);
```

2. Update agent instructions in `/lib/ai/agent.ts`

3. Add services to tools in `/lib/ai/tools.ts`

### Customizing AI Behavior

Edit `/lib/ai/agent.ts`:
- Change model in `ToolLoopAgent({ model: '...' })`
- Modify instructions for different tone/behavior
- Add/remove tools as needed

### Styling

- Global styles: `/app/globals.css`
- Tailwind config: `/tailwind.config.ts`
- Component patterns follow utility-first approach

---

## 🔐 Security

- ✅ Email + password authentication via Better Auth
- ✅ Session-based auth with secure cookies
- ✅ Row-level scoping for all user data
- ✅ Per-user conversation access control
- ✅ No sensitive data in logs
- ✅ HTTPS only in production
- ✅ Environment variables for secrets

---

## 📊 Monitoring & Analytics

### Key Metrics Tracked
- Total orders and revenue
- Service popularity
- Customer satisfaction (via feedback)
- Channel distribution (Web/WhatsApp/Telegram)
- Response times
- Conversation completion rates

### Accessing Analytics
1. Navigate to Admin Dashboard: `/admin`
2. Click "Analytics" tab
3. View charts and generate reports

---

## 🔄 Integration Guide

### WhatsApp Integration (Coming)

```
1. Get Meta Business Account credentials
2. Set up webhook at /api/webhooks/whatsapp
3. Add WHATSAPP_API_KEY to .env
4. Messages auto-route to conversation system
```

### Telegram Integration (Coming)

```
1. Create Telegram bot (@BotFather)
2. Set webhook to /api/webhooks/telegram
3. Add TELEGRAM_BOT_TOKEN to .env
4. Messages auto-route to conversation system
```

### Payment Integration (Future)

```
1. Connect Stripe
2. Create quotation endpoint
3. Generate payment links in orders
4. Track payment status
```

---

## 📚 Project Structure

```
app/
  ├─ api/
  │  ├─ chat/              # Chat API endpoint
  │  ├─ auth/              # Authentication routes
  │  └─ webhooks/          # WhatsApp/Telegram webhooks
  ├─ admin/                # Admin dashboard
  │  ├─ page.tsx           # Dashboard home
  │  ├─ orders/            # Orders management
  │  ├─ conversations/     # Chat monitoring
  │  ├─ customers/         # Customer directory
  │  └─ analytics/         # Analytics & reports
  ├─ chat/                 # Customer chat interface
  ├─ sign-in/              # Authentication pages
  ├─ sign-up/
  └─ layout.tsx            # Root layout

lib/
  ├─ ai/
  │  ├─ agent.ts          # ToolLoopAgent configuration
  │  └─ tools.ts          # AI tools & capabilities
  ├─ db/
  │  ├─ index.ts          # Drizzle client
  │  └─ schema.ts         # Database schema
  ├─ auth.ts              # Better Auth config
  └─ auth-client.ts       # Client-side auth

components/
  ├─ auth-form.tsx        # Sign in/up form
  └─ [other components]

public/                     # Static assets
```

---

## 🧪 Testing

### Test Chat Flow
```bash
1. Sign up at /sign-up
2. Navigate to /chat
3. Ask bot questions like:
   - "ما هي خدماتكم؟" (What are your services?)
   - "أريد طلب خدمة تشطيب" (I want finishing service)
   - "ما هو سعر المقاولات؟" (What's construction pricing?)
```

### Test Admin Dashboard
```bash
1. Sign in as admin
2. Go to /admin
3. Create test orders via chat
4. Monitor in admin dashboard
5. Update order statuses
```

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Push to main branch
git push origin main

# Vercel auto-deploys

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - BETTER_AUTH_SECRET
# - BETTER_AUTH_URL (if custom domain)
```

### Deploy to Other Platforms

1. Ensure Node.js 18+ installed
2. Set all environment variables
3. Run `npm run build && npm start`
4. Configure reverse proxy for API routes
5. Set up SSL certificate

---

## 📝 Development Workflow

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/description`
2. Implement changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create pull request
6. Deploy to production

### Database Migrations

Changes made to `/lib/db/schema.ts` require DDL statements in Neon:

```bash
# Use Neon MCP or web console to run:
ALTER TABLE orders ADD COLUMN new_column TEXT;
```

---

## 🐛 Troubleshooting

### Chat Not Responding
- Check API route is deployed
- Verify OPENAI_API_KEY or AI Gateway access
- Check conversation ID is valid
- Review server logs

### Orders Not Saving
- Verify DATABASE_URL is correct
- Check Neon connection
- Review server logs for errors
- Ensure user is authenticated

### Admin Dashboard Empty
- Run sample requests via chat to create data
- Check user owns the conversations
- Verify database queries

---

## 📞 Support

For issues and questions:
1. Check error logs: `npm run dev` (watch console)
2. Review database schema in Neon console
3. Test API endpoints with curl/Postman
4. Check GitHub issues for similar problems
5. Contact team for assistance

---

## 📄 License

Proprietary - All Alazab Group

---

## 🎯 Roadmap

### Phase 1 ✅
- Database schema
- Authentication system
- Web chat interface
- AI agent with tools
- Admin dashboard basics

### Phase 2 (In Progress)
- WhatsApp integration
- Telegram integration
- Advanced analytics
- Multi-language improvements

### Phase 3 (Planned)
- Payment processing (Stripe)
- Email notifications
- SMS integration
- Mobile app (React Native)
- Machine learning for recommendations

### Phase 4 (Future)
- Video consultations
- AR visualizations (Brand Identity)
- VR showroom (Laban Alasfour)
- Advanced CRM features
- Automation & workflows

---

## 👥 Team

Built for مجموعة العزب by the AI Development team.

---

**Last Updated**: June 2026
**Version**: 1.0.0
