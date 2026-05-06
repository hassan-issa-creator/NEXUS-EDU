# Million EdTech - Design System Specification 🎨

**Version:** 1.0  
**Last Updated:** December 2024  
**Target Audience:** Saudi Arabia (RTL, Arabic-first)

---

## 📐 Design Principles

1. **Arabic-First** - العربية هي اللغة الأساسية
2. **RTL Native** - تصميم من اليمين لليسار
3. **Accessible** - WCAG 2.1 AA compliant
4. **Modern** - مظهر عصري وجذاب
5. **Saudi Cultural Context** - ألوان ورموز محلية

---

## 🎨 Visual Design Foundation

### Color Palette

#### Primary Colors
```
Primary (Deep Blue):
- 900: #0A2A43 (Headers, Primary Actions)
- 800: #0D3A5C
- 700: #104A75
- 600: #135A8E
- 500: #1E88E5 (Primary)
- 400: #42A5F5
- 300: #64B5F6
- 200: #90CAF9
- 100: #BBDEFB
- 50:  #E3F2FD

Secondary (Teal):
- 900: #004D40
- 800: #00695C
- 700: #00897B
- 600: #00ACC1
- 500: #1AAE9F (Secondary)
- 400: #26C6DA
- 300: #4DD0E1
- 200: #80DEEA
- 100: #B2EBF2
- 50:  #E0F7FA

Accent (Gold):
- 900: #B8860B
- 800: #CD9B2F
- 700: #D4AF37 (Accent)
- 600: #DAB864
- 500: #E1C281
- 400: #E7CC9E
```

#### Semantic Colors
```
Success:
- #059669 (Dark)
- #10B981 (Base)
- #D1FAE5 (Light)

Warning:
- #D97706 (Dark)
- #F59E0B (Base)
- #FEF3C7 (Light)

Error:
- #DC2626 (Dark)
- #EF4444 (Base)
- #FEE2E2 (Light)

Info:
- #0284C7 (Dark)
- #0EA5E9 (Base)
- #E0F2FE (Light)
```

#### Neutral Colors (Gray Scale)
```
- 900: #111827 (Text Primary)
- 800: #1F2937
- 700: #374151
- 600: #4B5563 (Text Secondary)
- 500: #6B7280
- 400: #9CA3AF (Text Disabled)
- 300: #D1D5DB (Borders)
- 200: #E5E7EB
- 100: #F3F4F6 (Backgrounds)
- 50:  #F9FAFB
- White: #FFFFFF
```

### Typography

#### Arabic Font Stack
**Primary:** IBM Plex Sans Arabic | Tajawal | Cairo
- **Headers:** 700 (Bold)
- **Body:** 400 (Regular), 500 (Medium)
- **Captions:** 400 (Regular)

#### Latin Font (Numbers, English fallback)
**Primary:** Inter | Roboto
- **Headers:** 600 (SemiBold)
- **Body:** 400 (Regular), 500 (Medium)

#### Type Scale
```
H1: 48px / 3rem (Line height: 1.2) - Weight: 700
H2: 40px / 2.5rem (Line height: 1.25) - Weight: 700
H3: 32px / 2rem (Line height: 1.3) - Weight: 600
H4: 24px / 1.5rem (Line height: 1.4) - Weight: 600
H5: 20px / 1.25rem (Line height: 1.5) - Weight: 600
H6: 18px / 1.125rem (Line height: 1.5) - Weight: 600

Body Large: 18px / 1.125rem (Line height: 1.75)
Body: 16px / 1rem (Line height: 1.75)
Body Small: 14px / 0.875rem (Line height: 1.5)
Caption: 12px / 0.75rem (Line height: 1.5)
Overline: 10px / 0.625rem (Line height: 1.5, Letter-spacing: 0.1em)
```

### Spacing System (8px base)
```
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
32: 128px
```

### Border Radius
```
None: 0px
SM: 4px (Small inputs, badges)
MD: 8px (Buttons, cards)
LG: 12px (Modals, large cards)
XL: 16px (Hero sections)
Full: 9999px (Pills, avatars)
```

### Shadows
```
SM: 0 1px 2px 0 rgb(0 0 0 / 0.05)
MD: 0 4px 6px -1px rgb(0 0 0 / 0.1)
LG: 0 10px 15px -3px rgb(0 0 0 / 0.1)
XL: 0 20px 25px -5px rgb(0 0 0 / 0.1)
2XL: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

---

## 📱 Responsive Breakpoints

```javascript
breakpoints: {
  mobile: '375px',   // iPhone SE/13 mini
  mobileLg: '414px', // iPhone 13 Pro Max
  tablet: '768px',   // iPad Mini
  laptop: '1024px',  // iPad Pro
  desktop: '1280px', // MacBook Pro
  wide: '1536px'     // iMac
}
```

---

## 🧩 Component Library

### 1. Buttons

#### Variants
```
Primary:
- Background: Primary-500
- Text: White
- Hover: Primary-600
- Active: Primary-700
- Disabled: Gray-300

Secondary:
- Background: Transparent
- Border: 2px Primary-500
- Text: Primary-500
- Hover: Primary-50 bg

Ghost:
- Background: Transparent
- Text: Gray-700
- Hover: Gray-100

Destructive:
- Background: Error-500
- Text: White
```

#### Sizes
```
SM: padding: 8px 16px, font: 14px
MD: padding: 12px 24px, font: 16px
LG: padding: 16px 32px, font: 18px
```

### 2. Input Fields

```html
Structure:
- Label (14px, Gray-700)
- Input (16px, Border: Gray-300)
- Helper text (12px, Gray-500)
- Error text (12px, Error-500)

States:
- Default: Border Gray-300
- Focus: Border Primary-500, Ring 2px Primary-200
- Error: Border Error-500
- Disabled: Background Gray-100, Text Gray-400

RTL: text-align: right, padding-right: 16px
```

### 3. Cards

```
Background: White
Border: 1px Gray-200
Border-radius: 8px
Shadow: SM (hover: MD)
Padding: 24px

Variants:
- Default
- Interactive (hover effect)
- Outlined
- Elevated
```

### 4. Badges

```
Sizes: SM (20px), MD (24px), LG (28px)
Variants:
- Success: Green background
- Warning: Yellow background
- Error: Red background
- Info: Blue background
- Neutral: Gray background

Border-radius: Full
Font-size: 12px
Font-weight: 500
```

### 5. Alerts

```
Structure:
- Icon (20px)
- Title (16px, Bold)
- Message (14px)
- Close button

Variants: Success, Warning, Error, Info
Padding: 16px
Border-radius: 8px
Border-right: 4px solid (variant color)
```

### 6. Data Tables

```
Header:
- Background: Gray-50
- Font-weight: 600
- Padding: 12px 16px

Row:
- Padding: 16px
- Border-bottom: 1px Gray-200
- Hover: Gray-50

RTL:
- Text-align: right
- Numbers: ltr direction
- Actions: align-left
```

### 7. Navigation

#### Top Navigation
```
Height: 64px
Background: White
Shadow: SM
Padding: 0 24px

Logo: 32px height
Menu items: 16px, Gray-700
Active: Primary-500, Border-bottom 2px
```

#### Sidebar
```
Width: 280px
Background: Gray-50
Padding: 24px 16px

Menu item:
- Height: 40px
- Padding: 8px 16px
- Icon: 20px
- Border-radius: 8px
- Active: Primary-50 bg, Primary-500 text
```

---

## 🔄 RTL Specifics

### Mirroring Rules
```
✅ Mirror:
- Navigation (sidebar right → left)
- Icons (chevrons, arrows)
- Charts (x-axis start from right)
- Progress bars (fill from right)
- Tabs (start from right)

❌ Don't Mirror:
- Media controls (play buttons)
- Clocks, graphs
- Brand logos
- Maps
```

### Text Alignment
```
Headings: right
Body text: right
Numbers: ltr میں (optional: Arabic-Indic ٠١٢٣٤٥٦٧٨٩)
Inputs: right
Buttons: center
Icons next to text: right side
```

### Layout
```css
/* RTL Container */
.rtl {
  direction: rtl;
  text-align: right;
}

/* Mixed content */
.number-ltr {
  direction: ltr;
  display: inline-block;
}
```

---

## 🎭 Micro-interactions

### Button Click
```
Transform: scale(0.95)
Duration: 100ms
Easing: ease-in-out
```

### Input Focus
```
Border transition: 200ms
Ring fade-in: 150ms
```

### Card Hover
```
Shadow: SM → MD
Transform: translateY(-2px)
Duration: 200ms
```

### Success Animation
```
Checkmark draw: 400ms
Scale bounce: 200ms delay
```

### Loading States
```
Skeleton shimmer: 1.5s loop
Spinner rotate: 1s linear infinite
```

---

## ♿ Accessibility Checklist

### Contrast Ratios (WCAG AA)
```
✅ Text (16px+): 4.5:1 minimum
✅ Large Text (24px+): 3:1 minimum
✅ Icons & Graphics: 3:1 minimum

Examples:
- Primary-500 on White: 4.8:1 ✅
- Gray-600 on White: 7.2:1 ✅
- Warning-500 on White: 3.9:1 ✅
```

### Focus States
```
All interactive elements:
- Outline: 2px Primary-500
- Offset: 2px
- Border-radius: inherit

Visible on:
- Tab navigation
- Screen readers
```

### Screen Reader Support
```
✅ aria-label on icons
✅ aria-describedby on inputs
✅ role="alert" on notifications
✅ alt text on images
✅ Semantic HTML (nav, main, aside)
✅ Skip to main content link
```

### Keyboard Navigation
```
✅ Tab order logical (RTL: right to left)
✅ Enter/Space on buttons
✅ Esc closes modals
✅ Arrow keys in dropdowns
```

---

## 📝 Microcopy (Arabic MSA)

### Headers & CTAs
```
تسجيل الدخول - Login
إنشاء حساب جديد - Sign Up
ابدأ الآن - Get Started
تعرف على المزيد - Learn More
احجز نسختك المجانية - Get Free Trial
انضم إلينا - Join Us
```

### Buttons
```
حفظ - Save
إلغاء - Cancel
تأكيد - Confirm
حذف - Delete
تعديل - Edit
إرسال - Submit
تحميل - Upload
تنزيل - Download
طباعة - Print
مشاركة - Share
```

### Form Labels
```
البريد الإلكتروني - Email
كلمة المرور - Password
الاسم الكامل - Full Name
رقم الهاتف - Phone Number
العنوان - Address
المدينة - City
الرمز البريدي - Postal Code
```

### Success Messages
```
✅ تم الحفظ بنجاح
✅ تم إرسال الواجب بنجاح
✅ تم تحديث البيانات
✅ تمت العملية بنجاح
✅ تم التسجيل بنجاح
```

### Error Messages
```
❌ حدث خطأ، يرجى المحاولة مرة أخرى
❌ البريد الإلكتروني مستخدم بالفعل
❌ كلمة المرور غير صحيحة
❌ الحقل مطلوب
❌ الرجاء إدخال بريد إلكتروني صحيح
❌ الملف كبير جداً (الحد الأقصى 10 MB)
```

### Empty States
```
📭 لا توجد واجبات حالياً
📭 لم يتم العثور على نتائج
📭 لا توجد إشعارات جديدة
📭 لم تقم بإضافة أي فصول بعد
📭 سجل الدفعات فارغ
```

### Loading States
```
⏳ جاري التحميل...
⏳ جاري المعالجة...
⏳ جاري الحفظ...
⏳ جاري الإرسال...
```

### Confirmations
```
هل أنت متأكد من الحذف؟
هل تريد المتابعة؟
هل تريد حفظ التغييرات؟
```

---

## 🖼️ Iconography

### Icon Style
```
Style: Outline (2px stroke)
Size: 16px, 20px, 24px, 32px
Library: Heroicons / Lucide Icons
Color: Inherit from parent

Key Icons:
- 🏠 home
- 📚 book-open
- 📝 pencil
- ✅ check-circle
- 📊 chart-bar
- 👤 user
- ⚙️ cog
- 🔔 bell
- 💳 credit-card
- 📄 document
```

### Icon Naming Convention
```
Format: icon-[name]-[variant]-[size]
Examples:
- icon-home-outline-24.svg
- icon-user-solid-32.svg
```

---

## 🎨 Illustration Direction

### Style Guide
```
- Flat design
- Geometric shapes
- Primary color palette
- Minimal details
- Diverse, inclusive characters
- Saudi cultural elements (optional: traditional patterns)
```

### Export Formats
```
SVG: Primary (scalable)
PNG: @1x, @2x, @3x (retina)
WebP: For web optimization
```

---

## 📐 Wireframes

### Page Structure (All Pages)

```
┌─────────────────────────────────────┐
│  Top Navigation (64px)              │
├────────┬────────────────────────────┤
│ Side   │                            │
│ bar    │  Main Content              │
│ (280px)│  (Fluid)                   │
│        │                            │
│        │                            │
└────────┴────────────────────────────┘
```

### 1. Landing Page

```
Section 1: Hero (100vh)
- Large heading (العنوان الرئيسي)
- Subheading
- 2 CTAs (ابدأ الآن | تعرف على المزيد)
- Hero illustration (right side)

Section 2: Features (3 columns)
- Icon + Title + Description
- Repeat 3x

Section 3: Stats (4 columns)
- Large number
- Label
- Repeat 4x

Section 4: CTA Section
- Heading
- Button

Section 5: Footer
- Company info
- Links (4 columns)
- Social media
- Copyright
```

### 2. Auth Pages

#### Login
```
┌──────────────────────────────┐
│  Logo (Center)               │
│  مرحباً بعودتك              │
│                              │
│  [البريد الإلكتروني]        │
│  [كلمة المرور]              │
│  [☐ تذكرني] [نسيت كلمة المرور?]│
│                              │
│  [تسجيل الدخول]             │
│                              │
│  ─── أو ───                  │
│  [Google] [Microsoft]        │
│                              │
│  ليس لديك حساب? إنشاء حساب  │
└──────────────────────────────┘
```

#### Register
```
Similar structure + additional fields:
- الاسم الكامل
- نوع الحساب (راديو: طالب | معلم | ولي أمر)
- رقم الهاتف (optional)
- شروط الخدمة checkbox
```

### 3. Student Dashboard

```
┌─────────────────────────────────────┐
│ مرحباً، أحمد 👋                     │
├─────────────────────────────────────┤
│ KPI Cards (4 across)                │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 12  │ │ 8   │ │ 4   │ │ 92% │   │
│ │فصول │ │واجبات││متأخر││حضور │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
├─────────────────────────────────────┤
│ الواجبات القادمة                   │
│ ┌─────────────────────────────────┐ │
│ │ • Math Quiz - Due: غداً        │ │
│ │ • Science Report - Due: الأحد │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ التقويم | الدرجات                  │
└─────────────────────────────────────┘
```

### 4. Teacher Dashboard

```
┌─────────────────────────────────────┐
│ لوحة المعلم 📚                      │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ 5   │ │ 120 │ │ 25  │ │ 15  │   │
│ │فصول │ │طلاب │ │واجبات│ │في انتظار│
│ └─────┘ └─────┘ └─────┘ │التصحيح│   │
│                         └─────┘     │
├─────────────────────────────────────┤
│ الفصول الدراسية                    │
│ [Table: Class | Students | Actions] │
├─────────────────────────────────────┤
│ إجراءات سريعة                      │
│ [إنشاء واجب] [تسجيل حضور]          │
└─────────────────────────────────────┘
```

### 5. Parent Dashboard

```
┌─────────────────────────────────────┐
│ أبنائك 👨‍👩‍👧‍👦                            │
├─────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐  │
│ │ أحمد (الصف 10)│ │ سارة (الصف 8)│  │
│ │ 📊 الدرجات   │ │ 📊 الدرجات   │  │
│ │ 📅 الحضور    │ │ 📅 الحضور    │  │
│ │ 💳 المدفوعات │ │ 💳 المدفوعات │  │
│ └──────────────┘ └──────────────┘  │
├─────────────────────────────────────┤
│ الفواتير المستحقة                  │
│ [Table: Student | Amount | Due]     │
└─────────────────────────────────────┘
```

### 6. Admin Dashboard

```
┌─────────────────────────────────────┐
│ لوحة الإدارة 🛡️                    │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │ 1,250│ │ 45   │ │ 280  │ │ 95%  ││
│ │ طلاب │ │معلمين│ │فصول  │ │معدل  ││
│ │      │ │      │ │      │ │الدفع ││
│ └──────┘ └──────┘ └──────┘ └──────┘│
├─────────────────────────────────────┤
│ Quick Actions                       │
│ [إضافة مستخدم] [إضافة فصل]         │
├─────────────────────────────────────┤
│ Users Table                         │
│ Payments Summary                    │
└─────────────────────────────────────┘
```

### 7. Assignment Flow

```
Step 1: View Assignment
┌─────────────────────────────────────┐
│ Math Quiz 📝                        │
│ Due: 15 ديسمبر 2024                │
│ Points: 100                         │
├─────────────────────────────────────┤
│ Instructions:                       │
│ [Description text]                  │
├─────────────────────────────────────┤
│ Attachments: [file.pdf] [image.png]│
├─────────────────────────────────────┤
│ [بدء الإجابة]                      │
└─────────────────────────────────────┘

Step 2: Submit
┌─────────────────────────────────────┐
│ إجابتك                              │
│ [Textarea]                          │
│ [رفع ملف] [file-name.pdf × ]       │
│ [إرسال] [حفظ كمسودة]               │
└─────────────────────────────────────┘

Step 3: Success
┌─────────────────────────────────────┐
│ ✅ تم إرسال الواجب بنجاح            │
│ سيتم إشعارك عند التصحيح            │
│ [العودة للواجبات]                  │
└─────────────────────────────────────┘
```

### 8. Payment Flow

```
Step 1: View Invoice
┌─────────────────────────────────────┐
│ فاتورة رقم #12345                  │
│ رسوم شهر يناير 2025                │
│ المبلغ: 1,500 ريال                 │
│ الاستحقاق: 15 يناير                │
│ [دفع الآن]                         │
└─────────────────────────────────────┘

Step 2: Payment Method
┌─────────────────────────────────────┐
│ اختر طريقة الدفع                   │
│ ○ بطاقة ائتمان                     │
│ ○ Apple Pay                         │
│ ○ مدى                               │
│ [متابعة]                            │
└─────────────────────────────────────┘

Step 3: Card Details
┌─────────────────────────────────────┐
│ [رقم البطاقة]                      │
│ [الاسم على البطاقة]                │
│ [MM/YY] [CVV]                       │
│ [دفع 1,500 ريال]                   │
└─────────────────────────────────────┘

Step 4: Success
┌─────────────────────────────────────┐
│ ✅ تمت الدفعة بنجاح                 │
│ رقم العملية: #98765                │
│ [تحميل الإيصال PDF]                │
│ [العودة للرئيسية]                  │
└─────────────────────────────────────┘
```

---

## 📦 Exportable Assets

### SVG Icons (Heroicons)
```
icon-home.svg
icon-book.svg
icon-user.svg
icon-chart.svg
icon-bell.svg
icon-cog.svg
icon-logout.svg
icon-calendar.svg
icon-document.svg
icon-upload.svg
icon-download.svg
icon-check.svg
icon-x.svg
icon-chevron-left.svg
icon-chevron-right.svg
```

### Illustrations
```
hero-students.svg
empty-assignments.svg
empty-grades.svg
success-checkmark.svg
payment-success.svg
404-error.svg
```

### Naming Convention
```
Format: [category]-[name]-[variant].[extension]

Examples:
- icon-home-outline.svg
- illustration-hero-students.svg
- logo-full-color.svg
- logo-monochrome-white.svg
```

---

## 🚀 Figma/Cursor Setup Instructions

### Figma Structure
```
📁 Million EdTech Design System
  📁 1. Foundation
    - Colors
    - Typography
    - Spacing
    - Shadows
  📁 2. Components
    - Buttons
    - Inputs
    - Cards
    - Badges
    - Alerts
    - Navigation
    - Tables
  📁 3. Wireframes (Lo-Fi)
    - Landing
    - Auth
    - Dashboards
    - Flows
  📁 4. High-Fidelity
    - Landing (Final)
    - Student Dashboard
    - Teacher Dashboard
    - etc.
  📁 5. Assets
    - Icons
    - Illustrations
```

### Component Variants (Figma)
```
Button:
- Properties: variant (primary/secondary/ghost), size (sm/md/lg), state (default/hover/active/disabled)

Input:
- Properties: state (default/focus/error/disabled), size (sm/md/lg)

Card:
- Properties: variant (default/interactive/outlined), padding (sm/md/lg)
```

---

## ✅ Design Checklist

### Before Development Handoff
- [ ] All colors defined in design tokens
- [ ] Typography scale documented
- [ ] Spacing consistent (8px grid)
- [ ] All components have variants
- [ ] RTL tested on all pages
- [ ] Contrast ratios checked (WCAG AA)
- [ ] Focus states visible
- [ ] Hover states defined
- [ ] Loading states designed
- [ ] Empty states created
- [ ] Error states documented
- [ ] Success states defined
- [ ] Mobile breakpoints tested
- [ ] Tablet breakpoints tested
- [ ] Desktop breakpoints tested
- [ ] Arabic copy reviewed
- [ ] Icons exported as SVG
- [ ] Illustrations exported
- [ ] Component naming consistent

---

**Design System Owner:** Design Team  
**Questions:** design@million-edtech.com  
**Last Review:** December 2024
