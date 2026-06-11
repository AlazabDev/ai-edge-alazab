# Deployment Guide - Alazab AI Bot

Complete step-by-step guide for deploying the Alazab AI Bot to production.

---

## Phase 1: Preparation

### 1. Code Repository Setup

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial commit: Alazab AI Bot"

# Add to GitHub
git remote add origin https://github.com/AlazabDev/ai-edge-config.git
git push -u origin main
```

### 2. Environment Variables

Create `.env.production.local` with:

```env
# Database
DATABASE_URL=postgresql://user:pass@neon-hostname/db

# Authentication
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=https://yourdomain.com

# Optional: Multi-channel support
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_ID=your_phone_id
TELEGRAM_BOT_TOKEN=your_telegram_token
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/webhooks/telegram

# Optional: Analytics
POSTHOG_API_KEY=your_posthog_key
SENTRY_DSN=your_sentry_dsn
```

### 3. Database Backup

```bash
# Export current schema
pg_dump $DATABASE_URL > schema-backup.sql

# Keep in safe location (GitHub private repo or backup service)
```

---

## Phase 2: Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. New Project → Import GitHub repository
3. Select: AlazabDev/ai-edge-config
4. Framework: Next.js
5. Environment Variables:
   - Add all vars from `.env.production.local`
6. Deploy

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables if prompted
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# ... add all others
```

### 3. Configure Custom Domain

```bash
# In Vercel dashboard:
# Project Settings → Domains
# Add: yourdomain.com
# Update DNS records as shown
```

---

## Phase 3: Database Setup

### 1. Create Neon Project

```bash
# Via Neon Console:
# 1. Create project
# 2. Get connection string
# 3. Add to environment variables
```

### 2. Run Migrations

All schema creation is via Neon MCP. No additional migration tool needed.

```bash
# Verify tables exist in Neon Console
# Test connection:
psql $DATABASE_URL -c "\dt"
```

### 3. Seed Initial Data (Optional)

```bash
# Add brands to database
psql $DATABASE_URL << EOF
INSERT INTO brands (id, name, slug, domain, description, is_active)
VALUES
  ('alazab-construction', 'Alazab Construction', 'alazab-construction', 'alazab.com', 'Building construction services', true),
  ('luxury-finishing', 'Luxury Finishing', 'luxury-finishing', 'luxury-finishing.alazab.com', 'Luxury interior finishing', true),
  ('brand-identity', 'Brand Identity', 'brand-identity', 'brand-identity.alazab.com', 'Visual identity and design', true),
  ('uberfix', 'UberFix', 'uberfix', 'uberfix.alazab.com', 'Smart maintenance services', true),
  ('laban-alasfour', 'Laban Alasfour', 'laban-alasfour', 'laban-alasfour.alazab.com', 'Premium materials and supplies', true);
EOF
```

---

## Phase 4: Multi-Channel Integration

### WhatsApp Integration

```bash
# 1. Get Meta Business Account credentials
# 2. Create System User with access to WhatsApp API

# 3. Update environment
WHATSAPP_API_KEY=your_key_here
WHATSAPP_PHONE_ID=your_phone_id

# 4. Create webhook endpoint: /api/webhooks/whatsapp
# 5. Configure in Meta dashboard:
#    - Webhook URL: https://yourdomain.com/api/webhooks/whatsapp
#    - Webhook Token: Generate & store as env var

# 6. Subscribe to message events
# 7. Test with message to your WhatsApp
```

### Telegram Integration

```bash
# 1. Create bot with @BotFather on Telegram

# 2. Update environment
TELEGRAM_BOT_TOKEN=your_token_here

# 3. Create webhook: /api/webhooks/telegram

# 4. Set webhook
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -d "url=https://yourdomain.com/api/webhooks/telegram"

# 5. Test messaging your bot
```

---

## Phase 5: Monitoring & Maintenance

### 1. Set Up Error Tracking (Optional)

```bash
# With Sentry
npm install @sentry/nextjs

# Update next.config.js:
const withSentryConfig = require("@sentry/nextjs").withSentryConfig;
module.exports = withSentryConfig(nextConfig, { org: "...", project: "..." });

# Add SENTRY_DSN to environment
```

### 2. Set Up Analytics

```bash
# With PostHog (optional)
npm install posthog-js

# Add tracking to components for insights
```

### 3. Set Up Uptime Monitoring

```bash
# Use services like:
# - Vercel Analytics
# - UptimeRobot
# - Pingdom
# - CloudWatch

# Monitor these endpoints:
GET /api/health (if implemented)
POST /api/chat (sample request)
```

### 4. Configure Logs

```bash
# Vercel automatically captures logs
# View in: Vercel Dashboard → Project → Logs

# For custom logging, add to code:
console.log('[v0] event:', details)

# Access logs via:
vercel logs [project]
```

---

## Phase 6: Security Hardening

### 1. API Rate Limiting

```typescript
// In /lib/middleware.ts (to be implemented)
import { Ratelimit } from "@upstash/ratelimit";

export const ratelimit = new Ratelimit({
  redis: process.env.UPSTASH_REDIS_URL,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
});
```

### 2. CORS Configuration

```typescript
// In API routes
const allowedOrigins = ['https://yourdomain.com', 'https://app.yourdomain.com'];

if (!allowedOrigins.includes(req.headers.origin)) {
  return new Response('Forbidden', { status: 403 });
}
```

### 3. Input Validation

```typescript
// All endpoints validate input with Zod
import { z } from 'zod';

const chatSchema = z.object({
  messages: z.array(z.object({...})),
  conversationId: z.string().uuid(),
  userId: z.string(),
});
```

### 4. Database Security

```bash
# Enable SSL in Neon
# Configure minimum required permissions
# Regular backups to secure location
# Monitor access logs
```

---

## Phase 7: Performance Optimization

### 1. Enable Caching

```typescript
// /vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600" }
      ]
    }
  ]
}
```

### 2. Database Query Optimization

```typescript
// Use indexes (already defined in schema)
// Implement query caching with Redis
// Monitor slow queries in Neon console
```

### 3. Image Optimization

```typescript
// Use Next.js Image component
<Image src="/logo.png" alt="Logo" width={200} height={100} />

// Automatically optimizes and caches
```

### 4. Code Splitting

```typescript
// Already done via Next.js dynamic imports
const AdminDashboard = dynamic(() => import('@/components/admin'), {
  loading: () => <LoadingSpinner />,
});
```

---

## Phase 8: Testing Before Go-Live

### 1. Test All User Flows

```bash
# Web Chat
1. Sign up at /sign-up
2. Navigate to /chat
3. Test various prompts
4. Create service orders
5. Check /admin dashboard

# Admin Operations
1. View dashboard statistics
2. Check orders management
3. Monitor conversations
4. Review analytics
```

### 2. Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Using wrk
wrk -t12 -c400 -d30s https://yourdomain.com/
```

### 3. Security Testing

```bash
# Check headers
curl -i https://yourdomain.com/

# Test authentication
curl -X POST https://yourdomain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

### 4. Cross-Browser Testing

- Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Android
- Check responsive design

---

## Phase 9: Go-Live Checklist

- [ ] All environment variables set in Vercel
- [ ] Database backups configured
- [ ] Custom domain configured with SSL
- [ ] Email notifications working (if applicable)
- [ ] Admin accounts created
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error tracking configured
- [ ] Monitoring/alerting set up
- [ ] Team trained on admin dashboard
- [ ] Documentation updated
- [ ] Load tested under expected traffic
- [ ] All user flows tested
- [ ] Cross-browser testing complete
- [ ] Mobile responsiveness verified
- [ ] Disaster recovery plan documented
- [ ] On-call rotation established
- [ ] Customer communication ready

---

## Phase 10: Post-Deployment

### Daily Checks (First Week)

- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Review user feedback
- [ ] Monitor server resources
- [ ] Check chat response times

### Weekly Checks

- [ ] Review analytics
- [ ] Update security patches
- [ ] Backup database
- [ ] Review customer orders
- [ ] Monitor AI model costs

### Monthly Maintenance

- [ ] Update dependencies
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Database optimization
- [ ] Cost analysis

---

## Rollback Procedure

If issues occur:

```bash
# 1. Identify last stable version
git log --oneline

# 2. Revert to previous commit
git revert <commit-hash>
git push origin main

# 3. Vercel auto-deploys previous version

# 4. Notify team and users

# 5. Investigate issue in development environment

# 6. Fix and test thoroughly before redeploying
```

---

## Emergency Contacts

- **Database Issues**: Neon Support
- **Deployment Issues**: Vercel Support
- **API Issues**: Check Vercel Logs → GitHub Issues
- **Security Issues**: Report privately to admin

---

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Better Auth Docs](https://better-auth.com)
- [AI SDK Guide](https://sdk.vercel.ai)

---

**Last Updated**: June 2026
**Maintained By**: Alazab Development Team
