# 🎓 Million Platform - نظام إدارة المدرسة الشامل

منصة تعليمية متكاملة لإدارة المدارس مع بوابات للطلاب والمعلمين وأولياء الأمور والإدارة.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [التقنيات المستخدمة](#التقنيات-المستخدمة)
- [الميزات الكاملة](#الميزات-الكاملة)
- [هيكل المشروع](#هيكل-المشروع)
- [التثبيت والتشغيل](#التثبيت-والتشغيل)
- [قاعدة البيانات](#قاعدة-البيانات)
- [البوابات والصفحات](#البوابات-والصفحات)
- [نظام الباك إند](#نظام-الباك-إند)

---

## 🎯 نظرة عامة

**Million Platform** هي منصة تعليمية شاملة تم بناؤها من الصفر باستخدام أحدث التقنيات. المنصة تدعم:

- 🎓 **بوابة الطالب**: لوحة تحكم، واجبات، درجات، حضور، جدول، دروس، ألعاب تعليمية
- 👨‍🏫 **بوابة المعلم**: إدارة الفصول، تصحيح الواجبات، تسجيل الحضور، متابعة الطلاب
- 👨‍👩‍👧 **بوابة ولي الأمر**: متابعة الأبناء، المدفوعات، التواصل مع المدرسة
- 👤 **بوابة الإدارة**: إدارة المستخدمين، الفصول، المواد، المحتوى، الألعاب

---

## 💻 التقنيات المستخدمة

### Frontend
- **Next.js 16** - React Framework مع App Router
- **TypeScript** - Type Safety
- **TailwindCSS** - Styling
- **Radix UI** - Component Library
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time Communication
- **Next-Intl** - Internationalization (AR/EN)
- **Zustand** - State Management
- **React Query** - Data Fetching
- **Axios** - HTTP Client

### Backend
- **NestJS** - Node.js Framework
- **TypeScript** - Type Safety
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Socket.IO** - WebSocket Server
- **Passport** - Auth Strategy
- **Bcrypt** - Password Hashing
- **Zod** - Validation
- **Helmet** - Security
- **Express Rate Limit** - Rate Limiting

### DevOps & Tools
- **Docker** - Containerization
- **Turbo** - Monorepo Build System
- **ESLint** - Linting
- **Prettier** - Code Formatting

---

## ✨ الميزات الكاملة

### 1. نظام المصادقة والأمان 🔐
- ✅ تسجيل دخول بـ JWT (Access + Refresh Tokens)
- ✅ إدارة الجلسات
- ✅ 4 أدوار (طالب، معلم، ولي أمر، إداري)
- ✅ حماية ضد CSRF & XSS
- ✅ Rate Limiting
- ✅ Password Hashing

### 2. بوابة الطالب 🎓
- ✅ **لوحة تحكم تفاعلية** - إحصائيات، رسوم بيانية، ملخص الأداء
- ✅ **الواجبات** - عرض، تقديم، رفع ملفات (Drag & Drop)
- ✅ **الدرجات** - عرض النتائج، تحميل التقارير، رسوم بيانية
- ✅ **الحضور** - سجل الحضور، إحصائيات، مخططات
- ✅ **الجدول الدراسي** - عرض الحصص، الأوقات، الغرف
- ✅ **المواد والدروس** - تصفح المحتوى التعليمي
- ✅ **المحتوى التعليمي** - فيديوهات، ملفات PDF، مواد تفاعلية
- ✅ **الألعاب التعليمية** - Million Quiz، ألعاب تفاعلية
- ✅ **الإعدادات** - تعديل الملف الشخصي، اللغة، الثيم

### 3. بوابة المعلم 👨‍🏫
- ✅ **لوحة التحكم** - نظرة عامة على الفصول والطلاب
- ✅ **إدارة الفصول** - عرض الفصول، الطلاب، الجداول
- ✅ **الواجبات** - إنشاء، تعديل، حذف، تصحيح
- ✅ **التصحيح** - تقييم الواجبات، إضافة تعليقات، منح درجات
- ✅ **الحضور** - تسجيل الحضور والغياب
- ✅ **QR Code Attendance** - تسجيل حضور سريع عبر QR
- ✅ **الدروس** - إدارة المحتوى التعليمي
- ✅ **الإشعارات** - تواصل مع الطلاب وأولياء الأمور

### 4. بوابة ولي الأمر 👨‍👩‍👧
- ✅ **لوحة التحكم** - متابعة الأبناء
- ✅ **الأطفال** - إضافة، إدارة، عرض معلومات الأبناء
- ✅ **الأداء الأكاديمي** - درجات، واجبات، تقارير
- ✅ **الحضور** - متابعة الحضور والغياب
- ✅ **المدفوعات** - عرض الفواتير، الدفع، السجل
- ✅ **التواصل** - رسائل مع المعلمين والإدارة

### 5. بوابة الإدارة 👤
- ✅ **لوحة التحكم** - إحصائيات شاملة
- ✅ **إدارة المستخدمين** - CRUD للطلاب، معلمين، أولياء أمور
- ✅ **إدارة الفصول** - إنشاء، تعديل، حذف فصول
- ✅ **إدارة المواد** - إضافة، تعديل مواد دراسية
- ✅ **التسجيلات** - إدارة تسجيل الطلاب في الفصول
- ✅ **إدارة المحتوى** - رفع، تنظيم، حذف محتوى تعليمي
- ✅ **إدارة الألعاب** - إضافة، تعديل ألعاب تعليمية
- ✅ **الصلاحيات** - إدارة الأدوار والصلاحيات
- ✅ **الإعدادات** - إعدادات عامة للنظام

### 6. المزايا المتقدمة 🚀
- ✅ **Million Dialogue** - لعبة كويز متعددة اللاعبين في الوقت الفعلي
  - غرف عامة وخاصة
  - نظام نقاط متقدم
  - لوحة متصدرين حية
  - 50 سؤال باللغة العربية
  
- ✅ **نظام الامتحانات**
  - إنشاء امتحانات
  - بنك أسئلة
  - تصحيح تلقائي
  - تقارير مفصلة

- ✅ **نظام الدردشة**
  - دردشة فورية
  - رسائل خاصة
  - دعم الملفات والصور

- ✅ **QR Attendance**
  - توليد QR Codes
  - مسح سريع
  - سجل تلقائي

### 7. المزايا التقنية ⚡
- ✅ **Real-time Updates** - Socket.IO للتحديثات الفورية
- ✅ **File Upload** - رفع ملفات مع تتبع التقدم
- ✅ **Responsive Design** - يعمل على جميع الأجهزة
- ✅ **Dark Mode** - وضع داكن/فاتح
- ✅ **Multi-language** - عربي/إنجليزي (RTL Support)
- ✅ **Offline Support** - يعمل بدون إنترنت (PWA Ready)
- ✅ **Performance** - تحسينات للأداء السريع
- ✅ **SEO Optimized** - محسن لمحركات البحث
- ✅ **Accessibility** - متوافق مع معايير الوصول

---

## 📁 هيكل المشروع

```
million-platform/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/                # Authentication & JWT
│   │   │   ├── user/                # User Management
│   │   │   ├── class/               # Classes
│   │   │   ├── subject/             # Subjects
│   │   │   ├── enrollment/          # Student Enrollments
│   │   │   ├── assignment/          # Assignments
│   │   │   ├── grade/               # Grades
│   │   │   ├── attendance/          # Attendance
│   │   │   ├── lesson/              # Lessons
│   │   │   ├── upload/              # File Upload
│   │   │   ├── analytics/           # Analytics
│   │   │   └── features/
│   │   │       ├── million/         # Million Dialogue Game
│   │   │       ├── exams/           # Exam System
│   │   │       ├── chat/            # Chat System
│   │   │       ├── qr-attendance/   # QR Attendance
│   │   │       ├── content/         # Content Management
│   │   │       ├── games/           # Games System
│   │   │       ├── parent-portal/   # Parent Portal APIs
│   │   │       └── admin-portal/    # Admin Portal APIs
│   │   └── prisma/
│   │       └── schema.prisma        # Database Schema
│   │
│   └── web/                          # Next.js Frontend
│       ├── app/
│       │   └── [locale]/
│       │       ├── login/           # Login Page
│       │       ├── register/        # Registration
│       │       ├── student/         # Student Portal
│       │       │   ├── page.tsx            # Dashboard
│       │       │   ├── assignments/        # Assignments Pages
│       │       │   ├── grades/             # Grades Pages
│       │       │   ├── attendance/         # Attendance Pages
│       │       │   ├── schedule/           # Schedule Page
│       │       │   ├── subjects/           # Subjects Pages
│       │       │   ├── lessons/            # Lessons Pages
│       │       │   ├── content/            # Content Pages
│       │       │   ├── games/              # Games Pages
│       │       │   ├── million/            # Million Quiz
│       │       │   ├── courses/            # Courses
│       │       │   └── settings/           # Settings
│       │       ├── teacher/         # Teacher Portal
│       │       │   ├── page.tsx            # Dashboard
│       │       │   ├── classes/            # Classes Management
│       │       │   ├── assignments/        # Assignment Management
│       │       │   ├── grading/            # Grading Interface
│       │       │   ├── attendance/         # Attendance Tracking
│       │       │   ├── lessons/            # Lessons Management
│       │       │   └── notifications/      # Notifications
│       │       ├── parent/          # Parent Portal
│       │       │   ├── page.tsx            # Dashboard
│       │       │   ├── children/           # Children Management
│       │       │   ├── performance/        # Academic Performance
│       │       │   ├── attendance/         # Attendance View
│       │       │   └── payments/           # Payment Management
│       │       └── admin/           # Admin Portal
│       │           ├── page.tsx            # Dashboard
│       │           ├── users/              # User Management
│       │           ├── classes/            # Class Management
│       │           ├── subjects/           # Subject Management
│       │           ├── enrollments/        # Enrollment Management
│       │           ├── content/            # Content Management
│       │           ├── games/              # Games Management
│       │           ├── permissions/        # Role & Permissions
│       │           └── settings/           # System Settings
│       ├── components/
│       │   ├── ui/                  # Reusable UI Components
│       │   ├── dashboard/           # Dashboard Widgets
│       │   ├── layout/              # Layout Components
│       │   └── forms/               # Form Components
│       └── lib/
│           ├── api/                 # API Client Functions
│           ├── hooks/               # Custom React Hooks
│           └── utils/               # Utility Functions
│
├── supabase/migrations/              # Database Migrations
│   ├── 001_initial_schema.sql
│   ├── 20241203_001_million_tables.sql
│   ├── 20241203_002_sidebar_tables.sql
│   ├── 20241203_005_exam_system.sql
│   ├── 20241203_006_chat_system.sql
│   ├── 20241203_007_content_platform.sql
│   ├── 20241203_008_games_system.sql
│   ├── 20241203_009_qr_attendance.sql
│   ├── 20241203_010_parent_portal.sql
│   └── 20241203_011_admin_portal.sql
│
├── docker-compose.yml                # Docker Configuration
├── package.json                      # Root Package
└── turbo.json                        # Turbo Configuration
```

---

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14.0 (أو Docker)

### 1. تثبيت المشروع

```bash
# استنساخ المشروع
git clone <repository-url>
cd million-platform

# تثبيت الحزم
npm install
```

### 2. إعداد قاعدة البيانات

```bash
# تشغيل PostgreSQL عبر Docker
docker-compose up -d

# أو تشغيل PostgreSQL محلياً
# تأكد من تشغيل PostgreSQL على المنفذ 5432
```

### 3. إعداد متغيرات البيئة

#### Backend (apps/api/.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/million_platform"
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-key-here"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend (apps/web/.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
```

### 4. تشغيل المشروع

```bash
# تشغيل كل شيء معاً (Recommended)
npm run dev

# أو تشغيل كل واحد على حدة:

# Backend
cd apps/api
npm run start:dev

# Frontend (في terminal آخر)
cd apps/web
npm run dev
```

**النتيجة:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: PostgreSQL على المنفذ 5432

---

## 🗄️ قاعدة البيانات

### الجداول الرئيسية (40+ جدول)

#### Core Tables
- `users` - المستخدمون (طلاب، معلمين، أولياء أمور، إداريين)
- `classes` - الفصول الدراسية
- `subjects` - المواد الدراسية
- `enrollments` - تسجيلات الطلاب في الفصول

#### Academic Tables
- `assignments` - الواجبات
- `assignment_submissions` - تسليمات الطلاب
- `grades` - الدرجات
- `attendance` - سجل الحضور
- `lessons` - الدروس
- `schedules` - الجداول الدراسية

#### Million Dialogue Game
- `million_rooms` - غرف اللعبة
- `million_participants` - المشاركون
- `million_questions` - بنك الأسئلة (50 سؤال عربي)
- `million_answers` - إجابات المشاركين
- `million_leaderboard` - لوحة المتصدرين

#### Exam System
- `exams` - الامتحانات
- `exam_questions` - أسئلة الامتحان
- `exam_attempts` - محاولات الطلاب
- `exam_answers` - إجابات الطلاب

#### Chat System
- `chat_rooms` - غرف الدردشة
- `chat_messages` - الرسائل
- `chat_participants` - المشاركون
- `chat_attachments` - المرفقات

#### Content & Games
- `content_items` - المحتوى التعليمي
- `content_categories` - تصنيفات المحتوى
- `games` - الألعاب التعليمية
- `game_scores` - النتائج

#### Parent Portal
- `parent_children` - ربط الأهل بالأطفال
- `payments` - المدفوعات
- `payment_items` - تفاصيل المدفوعات

#### Admin Portal
- `roles` - الأدوار
- `permissions` - الصلاحيات
- `role_permissions` - ربط الأدوار بالصلاحيات

### Migrations
تم إنشاء 12 ملف migration:
1. `001_initial_schema.sql` - الهيكل الأساسي
2. `20241203_001_million_tables.sql` - جداول Million Dialogue
3. `20241203_002_sidebar_tables.sql` - جداول Sidebar
4. `20241203_003_indexes.sql` - الفهارس
5. `20241203_004_seed_questions.sql` - بيانات الأسئلة (50 سؤال)
6. `20241203_005_exam_system.sql` - نظام الامتحانات
7. `20241203_006_chat_system.sql` - نظام الدردشة
8. `20241203_007_content_platform.sql` - منصة المحتوى
9. `20241203_008_games_system.sql` - نظام الألعاب
10. `20241203_009_qr_attendance.sql` - حضور QR
11. `20241203_010_parent_portal.sql` - بوابة الأهل
12. `20241203_011_admin_portal.sql` - بوابة الإدارة

---

## 📱 البوابات والصفحات

### 🎓 بوابة الطالب (13 صفحة)
1. **Dashboard** (`/student`) - لوحة التحكم
2. **Assignments** (`/student/assignments`) - الواجبات
3. **Assignment Details** (`/student/assignments/[id]`) - تفاصيل الواجب
4. **Grades** (`/student/grades`) - الدرجات
5. **Attendance** (`/student/attendance`) - الحضور
6. **Schedule** (`/student/schedule`) - الجدول
7. **Subjects** (`/student/subjects`) - المواد
8. **Subject Details** (`/student/subjects/[id]`) - تفاصيل المادة
9. **Lessons** (`/student/lessons`) - الدروس
10. **Content** (`/student/content`) - المحتوى
11. **Games** (`/student/games`) - الألعاب
12. **Million Quiz** (`/student/million`) - لعبة الكويز
13. **Settings** (`/student/settings`) - الإعدادات

### 👨‍🏫 بوابة المعلم (8 صفحات)
1. **Dashboard** (`/teacher`) - لوحة التحكم
2. **Classes** (`/teacher/classes`) - الفصول
3. **Assignments** (`/teacher/assignments`) - إدارة الواجبات
4. **Create Assignment** (`/teacher/assignments/new`) - إنشاء واجب
5. **Edit Assignment** (`/teacher/assignments/[id]/edit`) - تعديل واجب
6. **Grading** (`/teacher/grading`) - التصحيح
7. **Attendance** (`/teacher/attendance`) - الحضور
8. **Lessons** (`/teacher/lessons`) - الدروس
9. **Notifications** (`/teacher/notifications`) - الإشعارات

### 👨‍👩‍👧 بوابة ولي الأمر (5 صفحات)
1. **Dashboard** (`/parent`) - لوحة التحكم
2. **Children** (`/parent/children`) - الأطفال
3. **Performance** (`/parent/performance`) - الأداء الأكاديمي
4. **Attendance** (`/parent/attendance`) - الحضور
5. **Payments** (`/parent/payments`) - المدفوعات

### 👤 بوابة الإدارة (10 صفحات)
1. **Dashboard** (`/admin`) - لوحة التحكم
2. **Users** (`/admin/users`) - إدارة المستخدمين
3. **Classes** (`/admin/classes`) - إدارة الفصول
4. **Subjects** (`/admin/subjects`) - إدارة المواد
5. **Enrollments** (`/admin/enrollments`) - التسجيلات
6. **Content** (`/admin/content`) - إدارة المحتوى
7. **Games** (`/admin/games`) - إدارة الألعاب
8. **Permissions** (`/admin/permissions`) - الصلاحيات
9. **Dashboard Settings** (`/admin/dashboard`) - إعدادات لوحة التحكم
10. **Settings** (`/admin/settings`) - الإعدادات العامة

**المجموع: 36+ صفحة تفاعلية**

---

## 🔧 نظام الباك إند

### API Modules (15+ وحدة)

#### Core Modules
1. **Auth** (`/api/auth`)
   - `POST /login` - تسجيل دخول
   - `POST /register` - تسجيل حساب
   - `POST /refresh` - تجديد Token
   - `POST /logout` - تسجيل خروج

2. **Users** (`/api/users`)
   - `GET /users` - قائمة المستخدمين
   - `GET /users/:id` - مستخدم محدد
   - `POST /users` - إنشاء مستخدم
   - `PUT /users/:id` - تحديث مستخدم
   - `DELETE /users/:id` - حذف مستخدم

3. **Classes** (`/api/classes`)
   - CRUD للفصول
   - إدارة الطلاب في الفصول

4. **Subjects** (`/api/subjects`)
   - CRUD للمواد الدراسية

5. **Enrollments** (`/api/enrollments`)
   - تسجيل الطلاب في الفصول

6. **Assignments** (`/api/assignments`)
   - CRUD للواجبات
   - تقديم الواجبات
   - التصحيح

7. **Grades** (`/api/grades`)
   - إدارة الدرجات
   - التقارير

8. **Attendance** (`/api/attendance`)
   - تسجيل الحضور
   - الإحصائيات

9. **Lessons** (`/api/lessons`)
   - إدارة الدروس

10. **Upload** (`/api/upload`)
    - رفع الملفات
    - إدارة المرفقات

#### Advanced Features

11. **Million Dialogue** (`/api/million`)
    - `POST /rooms` - إنشاء غرفة
    - `GET /rooms` - قائمة الغرف
    - `POST /rooms/:id/join` - الانضمام
    - `GET /questions` - الأسئلة
    - `POST /answer` - إرسال إجابة
    - `GET /leaderboard/:roomId` - المتصدرين
    - **WebSocket Events**: 9 أحداث للتواصل الفوري

12. **Exams** (`/api/exams`)
    - إنشاء امتحانات
    - بنك الأسئلة
    - التصحيح التلقائي

13. **Chat** (`/api/chat`)
    - إنشاء محادثات
    - إرسال رسائل
    - مرفقات

14. **QR Attendance** (`/api/qr-attendance`)
    - توليد QR Codes
    - تسجيل حضور

15. **Content** (`/api/content`)
    - إدارة المحتوى التعليمي

16. **Games** (`/api/games`)
    - إدارة الألعاب

17. **Parent Portal APIs** (`/api/parent-portal`)
    - APIs خاصة بالأهل

18. **Admin Portal APIs** (`/api/admin-portal`)
    - APIs إدارة النظام

### WebSocket Events
- `million:room:created` - غرفة جديدة
- `million:participant:joined` - مشارك جديد
- `million:question:sent` - سؤال جديد
- `million:answer:received` - إجابة واردة
- `million:results:updated` - تحديث النتائج
- `million:leaderboard:updated` - تحديث المتصدرين
- `chat:message` - رسالة جديدة
- `notification:new` - إشعار جديد

---

## 📊 الإحصائيات

### أرقام المشروع
- **إجمالي الملفات**: 200+ ملف
- **أسطر الكود**: 15,000+ سطر
- **Commits**: Multiple phases
- **Components**: 50+ مكون React
- **API Endpoints**: 60+ endpoint
- **Database Tables**: 40+ جدول
- **Migrations**: 12 migration
- **Languages**: TypeScript, SQL, CSS
- **Features**: 8 ميزات متقدمة

### ما تم إنجازه
✅ Frontend كامل (Next.js 16)
✅ Backend كامل (NestJS)  
✅ قاعدة بيانات (PostgreSQL + 12 migrations)
✅ نظام المصادقة (JWT)
✅ 4 بوابات (طالب، معلم، ولي أمر، إداري)
✅ 36+ صفحة تفاعلية
✅ Real-time Features (WebSocket)
✅ Million Dialogue Game (50 سؤال)
✅ نظام الامتحانات
✅ نظام الدردشة
✅ QR Attendance
✅ نظام المحتوى
✅ نظام الألعاب
✅ Dark Mode
✅ Multi-language (AR/EN)
✅ Responsive Design
✅ File Upload System

---

## 🎮 Million Dialogue - ميزة خاصة

لعبة كويز متعددة اللاعبين في الوقت الفعلي:

### المميزات
- 🎯 50 سؤال باللغة العربية
- 🏆 نظام نقاط متقدم (الصعوبة + السرعة + التتابع)
- 👥 غرف عامة وخاصة
- ⚡ تحديثات فورية عبر WebSocket
- 📊 لوحة متصدرين حية
- 🎨 واجهة جميلة مع animations
- 📱 دعم RTL كامل
- 🔒 آمن ضد الغش

### كيفية اللعب
1. افتح `/student/million`
2. اضغط "إنشاء غرفة جديدة"
3. شارك رابط الغرفة مع الأصدقاء
4. ابدأ الجولة (15 ثانية لكل سؤال)
5. شاهد النتائج الفورية
6. الفائز يُعلن في النهاية! 🏆

---

## 🔐 الأمان

- ✅ JWT Authentication
- ✅ Password Hashing (Bcrypt)
- ✅ CORS Protection
- ✅ Rate Limiting
- ✅ Helmet Security Headers
- ✅ Input Validation (Zod)
- ✅ SQL Injection Prevention
- ✅ XSS Protection
- ✅ CSRF Protection

---

## 📝 Scripts المتاحة

### Root Level
```bash
npm run dev          # تشغيل Frontend + Backend
npm run build        # Build كل المشروع
npm run lint         # Lint الكود
```

### Backend (apps/api)
```bash
npm run start:dev    # تشغيل Backend
npm run build        # Build للإنتاج
npm run test         # تشغيل الاختبارات
```

### Frontend (apps/web)
```bash
npm run dev          # تشغيل Frontend
npm run build        # Build للإنتاج
npm run start        # تشغيل production build
```

---

## 🌟 الخلاصة

**Million Platform** هي منصة تعليمية شاملة ومتكاملة تم بناؤها بأحدث التقنيات:

- ✅ 4 بوابات كاملة الوظائف
- ✅ 36+ صفحة تفاعلية
- ✅ 40+ جدول في قاعدة البيانات
- ✅ 60+ API endpoint
- ✅ 8 ميزات متقدمة
- ✅ Real-time capabilities
- ✅ جاهزة للإنتاج

---

## 📞 الدعم

للمزيد من المعلومات، راجع الملفات التالية:
- `MILLION_PROJECT_SUMMARY.md` - ملخص مشروع Million
- `MILLION_PHASE1_README.md` - قاعدة البيانات
- `MILLION_PHASE2_README.md` - Backend APIs
- `MILLION_PHASE3_README.md` - Frontend Components

---

**Built with ❤️ for Education | بُني بحب للتعليم**

---

© 2024 Million Platform. All rights reserved.
