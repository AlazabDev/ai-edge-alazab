# دليل الاختبار الشامل

## اختبار الوحدات (Unit Tests)

### اختبار Bot Gateway Integration

```typescript
// tests/integrations/bot-gateway.test.ts
import { createMaintenanceRequest, checkRequestStatus } from '@/lib/integrations/bot-gateway'

describe('Bot Gateway Integration', () => {
  it('should create maintenance request', async () => {
    const result = await createMaintenanceRequest(
      'أحمد محمد',
      '+201001234567',
      'plumbing',
      'Cairo',
      'تسريب في المطبخ',
      'high'
    )
    
    expect(result.success).toBe(true)
    expect(result.data?.request_id).toBeDefined()
    expect(result.data?.tracking_number).toBeDefined()
  })

  it('should check request status', async () => {
    const result = await checkRequestStatus('UF/MR/260502/0042')
    
    expect(result.success).toBe(true)
    expect(result.data?.status).toBeDefined()
  })

  it('should handle invalid requests gracefully', async () => {
    const result = await checkRequestStatus('INVALID-NUMBER')
    
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })
})
```

---

## اختبار التكامل (Integration Tests)

### اختبار سير العمل الكامل

```typescript
// tests/e2e/full-workflow.test.ts
import { createMaintenanceRequest, checkRequestStatus, getRequestDetails } from '@/lib/integrations/bot-gateway'

describe('Full Maintenance Request Workflow', () => {
  let requestId: string
  let requestNumber: string

  it('Step 1: Create maintenance request', async () => {
    const result = await createMaintenanceRequest(
      'محمد علي',
      '+201112223344',
      'electrical',
      'Alexandria, Egypt',
      'عطل في الإضاءة في المطبخ',
      'medium'
    )
    
    expect(result.success).toBe(true)
    requestId = result.data?.request_id
    requestNumber = result.data?.tracking_number
  })

  it('Step 2: Check request status after creation', async () => {
    // Wait for server processing
    await new Promise(resolve => setTimeout(resolve, 1000))

    const result = await checkRequestStatus(requestNumber)
    expect(result.success).toBe(true)
    expect(result.data?.workflow_stage).toBe('submitted')
  })

  it('Step 3: Get full request details', async () => {
    const result = await getRequestDetails(requestNumber, '+201112223344')
    
    expect(result.success).toBe(true)
    expect(result.data?.client_name).toBe('محمد علي')
    expect(result.data?.service_type).toBe('electrical')
  })
})
```

---

## اختبار العمل اليدوي (Manual Testing)

### قائمة الاختبار

#### 1. إنشاء طلب صيانة جديد

```
الخطوات:
1. افتح http://localhost:3000/chat
2. أدخل: "أحتاج لصيانة سباكة في الدقي"
3. أجب عن الأسئلة:
   - رقم الهاتف: +201001234567
   - الموقع الدقيق: Dokki, Cairo
   - الأولوية: high

التوقعات:
✓ يجب أن يقول البوت إنه سيقوم بإنشاء الطلب
✓ يجب أن يعود برقم تتبع فريد
✓ يجب أن يخزنه في قاعدة البيانات
```

#### 2. متابعة طلب موجود

```
الخطوات:
1. افتح http://localhost:3000/chat
2. أدخل: "ما حالة طلبي UF/MR/260502/0042"

التوقعات:
✓ يجب أن يعود بحالة الطلب
✓ يجب أن يظهر اسم الفني المعيّن (إن وجد)
✓ يجب أن يظهر الموعد المتوقع
```

#### 3. طلب عرض سعر

```
الخطوات:
1. افتح http://localhost:3000/chat
2. أدخل: "أحتاج لعرض سعر لترميم شقة 100 متر في المعادي"

التوقعات:
✓ يجب أن يعود بعرض سعر تقريبي
✓ يجب أن يوضح الخطوات التالية
✓ يجب أن يحفظ البيانات لمتابعة لاحقة
```

#### 4. البحث عن الفروع القريبة

```
الخطوات:
1. افتح http://localhost:3000/chat
2. قل: "أين أقرب فرع لك من موقعي؟"
3. السماح بالوصول إلى الموقع

التوقعات:
✓ يجب أن يجد أقرب 3-5 فروع
✓ يجب أن يظهر أوقات العمل
✓ يجب أن يقدم معلومات الاتصال
```

---

## اختبارات API المباشرة

### اختبار 1: إنشاء طلب مباشر

```bash
#!/bin/bash
export BOT_API_KEY="your-api-key"
export GATEWAY="https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway"

# إنشاء طلب
curl -X POST "$GATEWAY" \
  -H "x-api-key: $BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_request",
    "payload": {
      "client_name": "أحمد محمد",
      "client_phone": "+201001234567",
      "service_type": "plumbing",
      "location": "Cairo, Egypt",
      "description": "تسريب في المطبخ",
      "priority": "high"
    }
  }' | jq .

# حفظ رقم الطلب
export REQUEST_NUM="<رقم الطلب من الرد>"

# فحص الحالة
curl -X POST "$GATEWAY" \
  -H "x-api-key: $BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"check_status\",
    \"payload\": {
      \"search_term\": \"$REQUEST_NUM\",
      \"search_type\": \"request_number\"
    }
  }" | jq .
```

### اختبار 2: قائمة الخدمات

```bash
curl -X POST "$GATEWAY" \
  -H "x-api-key: $BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_services","payload":{}}' | jq .
```

### اختبار 3: أقرب فرع

```bash
curl -X POST "$GATEWAY" \
  -H "x-api-key: $BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "find_nearest_branch",
    "payload": {
      "latitude": 30.0444,
      "longitude": 31.2357,
      "city": "Cairo"
    }
  }' | jq .
```

---

## اختبارات قاعدة البيانات

### التحقق من حفظ البيانات

```sql
-- تحقق من وجود الطلبات المنشأة
SELECT id, order_number, user_id, status, created_at 
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour' 
ORDER BY created_at DESC 
LIMIT 10;

-- تحقق من المحادثات المحفوظة
SELECT id, user_id, brand_id, status, created_at 
FROM conversations 
WHERE created_at > NOW() - INTERVAL '1 hour' 
LIMIT 10;

-- تحقق من الرسائل
SELECT id, conversation_id, sender_type, content, created_at 
FROM messages 
WHERE created_at > NOW() - INTERVAL '1 hour' 
ORDER BY created_at DESC 
LIMIT 20;
```

---

## مقاييس الأداء

### اختبار سرعة الاستجابة

```typescript
// tests/performance/response-time.test.ts
import { performance } from 'perf_hooks'

describe('Response Time Tests', () => {
  it('should respond to chat request within 2 seconds', async () => {
    const start = performance.now()
    
    // Simulate chat request
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'أحتاج مساعدة' }],
        conversationId: 'test-conv',
        userId: 'test-user'
      })
    })
    
    const end = performance.now()
    const duration = end - start
    
    expect(duration).toBeLessThan(2000)
  })

  it('should query database within 100ms', async () => {
    const start = performance.now()
    
    // Query operation
    const conversations = await db.query.conversations.findMany({
      limit: 10
    })
    
    const end = performance.now()
    
    expect(end - start).toBeLessThan(100)
  })
})
```

---

## قائمة فحص ما قبل النشر

- [ ] جميع اختبارات الوحدات تمر ✓
- [ ] جميع اختبارات التكامل تمر ✓
- [ ] API يستجيب في الوقت المناسب ✓
- [ ] قاعدة البيانات تحفظ البيانات بشكل صحيح ✓
- [ ] معالجة الأخطاء تعمل ✓
- [ ] مفاتيح API محمية ✓
- [ ] البوت يرد باللغة العربية ✓
- [ ] الواجهة تعمل على الجوال ✓
- [ ] إشعارات WhatsApp ترسل بشكل صحيح ✓
- [ ] السجلات تظهر جميع العمليات ✓

---

## تقرير الاختبارات

### عينة من النتائج

```
✓ Bot Gateway Integration Tests (6 اختبارات)
  ✓ should create maintenance request (45ms)
  ✓ should check request status (32ms)
  ✓ should get request details (28ms)
  ✓ should handle invalid requests (15ms)
  ✓ should list services (38ms)
  ✓ should find nearest branches (42ms)

✓ Chat API Tests (4 اختبارات)
  ✓ should process user message (1200ms)
  ✓ should call appropriate tools (850ms)
  ✓ should stream response (650ms)
  ✓ should save conversation (120ms)

✓ Database Tests (3 اختبارات)
  ✓ should save order correctly (45ms)
  ✓ should retrieve order details (32ms)
  ✓ should update order status (38ms)

✓ Performance Tests (2 اختبارات)
  ✓ should respond within SLA (1650ms < 2000ms)
  ✓ should handle 100 concurrent requests

─────────────────────────────────────────────
الإجمالي: 15 اختبار
النجاح: 15 (100%)
الفشل: 0
التحذيرات: 0
─────────────────────────────────────────────
```

---

**تاريخ آخر تحديث**: 2025-06-11
