# تدليل التكامل الشامل - بوت مجموعة العزب

## نظرة عامة

يستخدم البوت الذكي واجهة برمجية موحدة للتواصل مع جميع خدمات مجموعة العزب عبر **Bot Gateway** و **Maintenance Gateway**. هذا الدليل يشرح كيفية استخدام التكاملات المتاحة.

---

## المتطلبات الأساسية

### متغيرات البيئة

أضف المتغيرات التالية إلى ملف `.env.development.local`:

```env
# Bot Gateway API
BOT_API_KEY=your-api-key-here

# Database
DATABASE_URL=postgresql://...

# Authentication
BETTER_AUTH_SECRET=your-secret-here

# Optional: Daftra Integration
DAFTRA_API_KEY=your-daftra-key
DAFTRA_SUBDOMAIN=your-subdomain
```

### التحقق من الإعدادات

```bash
# اختبر اتصال Bot Gateway
curl -X POST https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway \
  -H "x-api-key: $BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_services","payload":{}}'
```

---

## البنية المعمارية

```
lib/
├── integrations/
│   └── bot-gateway.ts          ← وحدة التكامل الرئيسية
├── ai/
│   ├── tools.ts                ← أدوات الوكيل الذكي
│   └── agent.ts                ← إعدادات الوكيل
└── db/
    └── schema.ts               ← نموذج البيانات

app/
├── api/
│   └── chat/route.ts           ← نقطة نهاية الدردشة
└── chat/page.tsx               ← واجهة الدردشة
```

---

## الوحدات الرئيسية

### 1. Bot Gateway Integration (`lib/integrations/bot-gateway.ts`)

توفر هذه الوحدة وظائف موحدة للتواصل مع API بوابة البوت:

#### الدوال الأساسية:

```typescript
// إنشاء طلب صيانة
await createMaintenanceRequest(
  clientName: string,
  clientPhone: string,
  serviceType: string,      // 'plumbing', 'electrical', 'ac', etc.
  location: string,
  description: string,
  priority?: 'low' | 'medium' | 'high' | 'urgent'
)

// فحص حالة الطلب
await checkRequestStatus(
  searchTerm: string,
  searchType?: 'request_number' | 'phone' | 'text'
)

// الحصول على تفاصيل الطلب
await getRequestDetails(
  requestNumber: string,
  clientPhone: string
)

// الحصول على قائمة الخدمات
await listServices()

// الحصول على أقرب فرع
await findNearestBranch(
  latitude: number,
  longitude: number,
  city?: string
)

// الحصول على عرض سعر
await getQuote(
  serviceType: string,
  description: string,
  location: string,
  clientName: string,
  clientPhone: string
)
```

#### أمثلة الاستخدام:

```typescript
// مثال 1: إنشاء طلب صيانة
const result = await createMaintenanceRequest(
  'أحمد محمد',
  '+201001234567',
  'plumbing',
  'القاهرة، مصر الجديدة',
  'تسريب في حنفية المطبخ',
  'high'
)

if (result.success) {
  console.log('Request created:', result.data.request_id)
}

// مثال 2: فحص حالة الطلب
const status = await checkRequestStatus('UF/MR/260502/0042')
console.log('Status:', status.data)

// مثال 3: الحصول على أقرب فرع
const branches = await findNearestBranch(30.0444, 31.2357, 'Cairo')
console.log('Nearest branches:', branches.data)
```

---

### 2. AI Tools (`lib/ai/tools.ts`)

أدوات الوكيل الذكي المتخصصة:

#### الأدوات المتاحة:

1. **searchBrandServicesTool** - البحث عن خدمات البراند
2. **createServiceRequestTool** - إنشاء طلب خدمة
3. **checkOrderStatusTool** - فحص حالة الطلب
4. **getRecommendationsTool** - الحصول على توصيات
5. **faqHandlerTool** - الإجابة على الأسئلة الشائعة
6. **saveCustomerPreferencesTool** - حفظ تفضيلات العميل

#### كيفية استخدام الأدوات:

تُستدعى الأدوات تلقائياً من خلال وكيل الذكاء الاصطناعي بناءً على سياق المحادثة.

```typescript
// مثال: عندما يقول العميل "أريد طلب صيانة كهربائية"
// الوكيل سيستدعي createServiceRequestTool تلقائياً
```

---

### 3. خادم الدردشة (`app/api/chat/route.ts`)

نقطة نهاية API للدردشة:

```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "..." },
    ...
  ],
  "conversationId": "conv-uuid",
  "userId": "user-uuid"
}

Response:
Server-Sent Events Stream with AI responses
```

---

## سير العمل الكامل

### سيناريو 1: طلب صيانة بسيط

```
1. المستخدم: "أحتاج لصيانة تكييف في الإسكندرية"
   ↓
2. البوت يفهم النية (request_maintenance)
   ↓
3. يطلب تفاصيل إضافية:
   - رقم الهاتف
   - الموقع الدقيق
   - أولوية الطلب
   ↓
4. ينادي createMaintenanceRequest مع البيانات
   ↓
5. يحفظ الطلب في قاعدة البيانات المحلية
   ↓
6. يرسل إشعار WhatsApp للعميل (قد يكون تلقائياً من Bot Gateway)
   ↓
7. يرجع تفاصيل الطلب للعميل
```

### سيناريو 2: متابعة طلب موجود

```
1. المستخدم: "ما حالة طلبي UF/MR/260502/0042؟"
   ↓
2. البوت ينادي checkRequestStatus
   ↓
3. يرسل استعلام إلى Bot Gateway
   ↓
4. يرجع الحالة الحالية:
   {
     status: "in_progress",
     stage: "assigned",
     technician: "محمد علي",
     eta: "2025-06-15"
   }
   ↓
5. يقدم تحديثاً للعميل بطريقة ودية
```

### سيناريو 3: طلب عرض سعر

```
1. المستخدم: "أنا أريد تقدير لترميم شقتي 120 متر في القاهرة"
   ↓
2. البوت ينادي getQuote مع:
   - service_type: "renovation"
   - area_sqm: 120
   - location: "Cairo"
   ↓
3. يحصل على عرض سعر تقريبي
   ↓
4. يحفظ طلب العرض في Daftra (تلقائياً)
   ↓
5. يرسل التفاصيل للعميل
```

---

## أنواع الخدمات المدعومة

```typescript
enum ServiceType {
  'plumbing' = 'سباكة',
  'electrical' = 'كهرباء',
  'ac' = 'تكييف',
  'painting' = 'دهان',
  'carpentry' = 'نجارة',
  'cleaning' = 'تنظيف',
  'general' = 'صيانة عامة',
  'appliance' = 'أجهزة منزلية',
  'pest_control' = 'مكافحة الآفات',
  'landscaping' = 'تنسيق حدائق',
  'finishing' = 'تشطيب',
  'renovation' = 'ترميم'
}

enum Priority {
  'low' = 'منخفضة',
  'medium' = 'متوسطة',
  'high' = 'عالية',
  'urgent' = 'حتمية'
}
```

---

## معالجة الأخطاء

جميع دوال التكامل ترجع نفس الصيغة:

```typescript
{
  success: boolean,
  data?: any,        // البيانات عند النجاح
  message?: string,  // رسالة توضيحية
  error?: string     // رسالة الخطأ عند الفشل
}
```

#### أمثلة معالجة الأخطاء:

```typescript
const result = await createMaintenanceRequest(...)

if (!result.success) {
  // رسالة خطأ للعميل
  console.error('Failed to create request:', result.error)
  return {
    message: 'عذراً، حدث خطأ. يرجى المحاولة لاحقاً.',
    suggestion: 'يمكنك التواصل معنا مباشرة على ...'
  }
}

// معالجة البيانات
console.log('Request created:', result.data.request_number)
```

---

## اختبار التكاملات

### 1. اختبار البوابة الأساسية

```bash
# اختبر قائمة الخدمات (بدون حساسية)
curl -X POST https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway \
  -H "x-api-key: $BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_services","payload":{}}'

# اختبر إنشاء طلب
curl -X POST https://zrrffsjbfkphridqyais.supabase.co/functions/v1/bot-gateway \
  -H "x-api-key: $BOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"create_request",
    "payload":{
      "client_name":"أحمد",
      "client_phone":"+201001234567",
      "service_type":"plumbing",
      "location":"Cairo",
      "description":"تسريب",
      "priority":"high"
    }
  }'
```

### 2. اختبار الدردشة

استخدم صفحة الدردشة على `http://localhost:3000/chat`:

```
المستخدم: أريد طلب صيانة كهربائية
البوت: سأساعدك في إنشاء طلب صيانة كهربائية. يرجى تزويدي بالتفاصيل التالية:
1. رقم هاتفك
2. موقعك
3. وصف المشكلة
```

---

## نصائح وأفضل الممارسات

### 1. التوثيق والأمان

- **لا** تضع مفاتيح API في الكود الخاص بك
- استخدم متغيرات البيئة دائماً
- لا تسجل أرقام الهاتف الكاملة في السجلات

### 2. الأداء

- استخدم التخزين المؤقت (caching) للخدمات الثابتة
- قم بتحميل قائمة الخدمات مرة واحدة عند بدء البوت
- احفظ معلومات العميل للجلسة الواحدة

### 3. التجربة

- وفّر رسائل واضحة للعميل
- تعامل مع الأخطاء بلطف
- اطلب تأكيداً قبل إنشاء طلب

---

## استكشاف الأخطاء

### المشكلة: "Bot API Key is invalid"

```
الحل:
1. تحقق من المتغير BOT_API_KEY في .env
2. تأكد من أنه النسخة الصحيحة من الموقع الصحيح
3. عيّد الخادم بعد التغيير
```

### المشكلة: "Request failed with status 404"

```
الحل:
1. تحقق من URL البوابة الصحيح
2. تأكد من وجود الاتصال بالإنترنت
3. اطلب من المسؤول التحقق من حالة البوابة
```

### المشكلة: "Invalid service type"

```
الحل:
1. استخدم أحد الأنواع المسموحة من القائمة أعلاه
2. تحقق من الإملاء (بدون مسافات)
3. استدعِ listServices() للحصول على القائمة الحالية
```

---

## المراجع

- [Bot Gateway API Documentation](./BOTS_API_INTEGRATION_GUIDE.md)
- [API Testing Commands](./API_GATEWAY_TESTING_COMMANDS.md)
- [Daftra Integration](./daftra-module.md)
- [Database Schema](./lib/db/schema.ts)
- [AI Tools](./lib/ai/tools.ts)

---

**آخر تحديث**: 2025-06-11
**الإصدار**: 2.0
**الحالة**: جاهز للإنتاج ✅
