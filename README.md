# 🎓 Million Platform

**The Ultimate Educational Management System.**

Million Platform is a comprehensive solution for modern education, tailored for the Egyptian high school system (Thanaweya Amma) but scalable globally. It features AI-powered tutoring, live virtual classrooms, gamified exams, and a cross-platform mobile app.

`apps/api` is the production source of truth for the platform. `prisma-backend` remains in the repository only as a legacy reference and should not be used for runtime or deployment.

---

## 🌐 Live Demo & Repository

- **GitHub Repository**: [https://github.com/hassanIssa00/million-platform](https://github.com/hassanIssa00/million-platform)
- **Live Platform**: [https://million-platform-web.vercel.app](https://million-platform-web.vercel.app)
- **API Documentation**: [https://api-million-platform.railway.app/docs](https://api-million-platform.railway.app/docs)

---

## 🚀 Key Features

### 🧑‍🎓 For Students
-   **🤖 AI Personal Tutor**: 24/7 homework help and study planning powered by GPT-4.
-   **📺 Live Classes**: Interactive video sessions with low-latency Jitsi integration.
-   **🎮 Gamified Exams**: Competitive testing with leaderboards and instant feedback.
-   **📱 Mobile App**: Study on the go with our sleek React Native application.

### 👨‍🏫 For Teachers & Admins
-   **📊 Analytics Dashboard**: Real-time insights into student performance and enrollment.
-   **📝 Content Management**: Effortlessly upload lessons and create interactive quizzes.
-   **💳 Secure Payments**: Full Stripe integration for seamless subscriptions and course purchases.

---

## 🛠️ Tech Stack

### Monorepo Architecture (`Turborepo`)

| Component | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/), [ShadcnUI](https://ui.shadcn.com/) |
| **Backend** | [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), [Redis](https://redis.io/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Mobile** | [React Native](https://reactnative.dev/) ([Expo](https://expo.dev/)) |
| **Real-time** | [Socket.io](https://socket.io/) |
| **Hosting** | [Vercel](https://vercel.com/) (Frontend), [Railway](https://railway.app/) (Backend) |

---

## 🏃‍♂️ Getting Started (Development)

### Prerequisites
-   **Node.js** 18 or higher
-   **PostgreSQL** & **Redis** (running locally or via Docker)
-   API Keys for **OpenAI** & **Stripe** (optional for local testing)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/hassanIssa00/million-platform.git
    cd million-platform
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    ```bash
    cp .env.example .env
    # Edit the .env file with your specific configuration
    ```
    - Set `JWT_SECRET` and `JWT_REFRESH_SECRET` for the API.
    - Set `STRIPE_WEBHOOK_SECRET` if you want invoice status changes to be confirmed by Stripe webhooks locally.
    - Set `FRONTEND_URL=http://localhost:3002,http://localhost:3000` so cookie auth and CORS match the current local stack.
    - Keep `NEXT_PUBLIC_ENABLE_DEMO_AUTH=false` unless you explicitly want local-only demo auth in development.

4.  **Database Initialization**
    ```bash
    # Start database services if using Docker
    docker-compose up -d postgres redis

     # Run Prisma migrations
     cd apps/api
     npx prisma migrate dev
     npx prisma generate
     ```

5.  **Launch the Platform**
    ```bash
    # From the root directory
    npm run dev
    ```
    -   **Web**: `http://localhost:3002`
    -   **API**: `http://localhost:3001`
    -   **Mobile**: `cd apps/mobile && npx expo start`

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

Developed with ❤️ by the **Million Platform Team**
