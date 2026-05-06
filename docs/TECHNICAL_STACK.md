# 🛠️ Technical Stack Documentation

**Date:** January 2026
**Version:** 1.0

This document provides a comprehensive and factual list of all tools, technologies, and libraries used in the development of the **NEXUS ED** Platform.

---

## 1. Programming Languages
*   **TypeScript (v5.9):** The primary language used for both Frontend and Backend development, ensuring type safety and code consistency across the monorepo.

## 2. Frontend Frameworks & Libraries
The frontend is built as a highly interactive Single Page Application (SPA) with Server-Side Rendering (SSR) capabilities.

*   **Next.js (v16):** The core React framework for routing, SSR, and API integration.
*   **React (v19):** The library for building user interfaces.
*   **Tailwind CSS (v3/v4):** Utility-first CSS framework for styling and responsive design.
*   **Shadcn/ui & Radix UI:** Accessible, unstyled component primitives (Dialogs, Dropdowns, Tabs, etc.) used as the foundation for the Design System.
*   **Framer Motion:** Used for complex animations, page transitions, and micro-interactions.
*   **Zustand:** A small, fast, and scalable state management solution.
*   **Recharts:** Composable charting library for analytics dashboards.
*   **Lucide React:** A clean and consistent icon library.
*   **Next-Intl:** For internationalization (i18n) and Right-to-Left (RTL) Arabic support.
*   **NextAuth.js:** For handling secure authentication sessions on the client side.
*   **React Query (TanStack Query):** For fetching, caching, and synchronizing server state.
*   **Jitsi React SDK:** For embedding video conferencing capabilities.

## 3. Backend Frameworks & Services
The backend is architectural as a modular monolith using NestJS.

*   **NestJS (v11):** A progressive Node.js framework for building efficient and scalable server-side applications.
*   **Express:** The underlying HTTP server framework for NestJS.
*   **Socket.IO:** For real-time, bi-directional event-based communication (used in "Million" quizzes).
*   **Passport.js:** Authentication middleware found handling JWT strategies.
*   **BullMQ:** A Redis-based queue system for handling background jobs (e.g., notifications).
*   **Multer:** Middleware for handling `multipart/form-data` for file uploads.
*   **Winston:** A versatile logging library for creating structured logs.
*   **Zod:** TypeScript-first schema declaration and validation library.
*   **Helmet:** For securing HTTP headers.

## 4. Databases & Caching Systems
*   **PostgreSQL:** The primary relational database management system.
*   **Prisma ORM (v6):** Next-generation ORM for Node.js and TypeScript, used for database modeling and queries.
*   **Redis:** In-memory data structure store, used for caching and BullMQ job queues.

## 5. AI, APIs & Third-Party Services
*   **OpenAI API:** Integrated for generating questions, analyzing student errors, and predicting performance.
*   **Firebase:** Used for secure file storage and cloud messaging.
*   **Stripe:** Integrated for payment processing.
*   **Twilio:** For SMS communication services.
*   **Nodemailer:** For sending transactional emails.
*   **Web Push:** For handling browser-based push notifications.

## 6. DevOps, Deployment & Infrastructure
*   **Docker & Docker Compose:** Containerization platform used to run database and cache services locally and in production.
*   **Turborepo:** High-performance build system for the monorepo structure.
*   **NPM Workspaces:** For managing dependencies across multiple packages/apps.
*   **Git:** Version control system.

## 7. Testing & Quality Assurance
*   **Jest:** JavaScript testing framework used for unit and integration testing.
*   **Supertest:** Used for HTTP assertions during E2E testing.
*   **ESLint:** Pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript/TypeScript.
*   **Prettier:** Opinionated code formatter.

## 8. Development Tools
*   **Swagger (OpenAPI):** For documenting and testing RESTful APIs.
*   **Postman:** Used for API exploration and testing.
