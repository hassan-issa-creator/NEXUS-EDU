# طريقة تشغيل Million Platform

## قبل التشغيل
- شغّل Docker Desktop
- استخدم Node.js 18 أو أحدث
- انسخ `.env.example` إلى `.env`

## 1. شغّل قواعد البيانات
```powershell
cd C:\Users\hassa\Desktop\anti\million-platform
docker-compose up -d
```

## 2. جهّز وشغّل الـ API
```powershell
cd C:\Users\hassa\Desktop\anti\million-platform\apps\api
npx prisma generate
npm run dev
```

- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`

## 3. شغّل الـ Web
```powershell
cd C:\Users\hassa\Desktop\anti\million-platform\apps\web
npm run dev
```

- Web: `http://localhost:3002`

## إعدادات مهمة
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- `FRONTEND_URL=http://localhost:3002,http://localhost:3000`
- `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false`
- `STRIPE_WEBHOOK_SECRET` مطلوب لو عايز Stripe webhooks تغيّر حالة الفواتير محليًا

## ملاحظات
- `apps/api` هو المصدر الإنتاجي الأساسي.
- `prisma-backend` موجود كمرجع legacy فقط، وليس مسار تشغيل.
- لو حصل تعارض بورت، اقفل عملية Node القديمة ثم شغّل من جديد.
