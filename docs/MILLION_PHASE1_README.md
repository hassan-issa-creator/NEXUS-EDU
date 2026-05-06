# Million Platform - Phase 1: Database Foundation & Backend Infrastructure

## Overview

Phase 1 provides the complete database schema, migrations, seed data, and backend infrastructure for the Million Dialogue feature and Interactive Sidebar.

## What's Included ✅

### Database (Supabase/PostgreSQL)
- ✅ **7 Million Dialogue Tables** - Rooms, rounds, questions, answers, scores, participants
- ✅ **5 Sidebar Tables** - Assignments, grades, attendance, notifications, settings
- ✅ **40+ Optimized Indexes** - Performance-tuned queries
- ✅ **50 Arabic Questions** - Across 5 subjects (Science, Math, Arabic, History, Geography)
- ✅ **Sample Data** - Users, rooms, rounds with completed game

### Backend Middleware
- ✅ **JWT Authentication** - Token verification, role-based access
- ✅ **Rate Limiting** - Multiple limiters for different endpoints
- ✅ **Input Validation** - Zod schemas with sanitization
- ✅ **Configuration** - Scoring logic, game settings
- ✅ **TypeScript Types** - Complete type definitions

---

## 📁 File Structure

```
million-platform/
├── supabase/
│   ├── migrations/
│   │   ├── 20241203_001_million_tables.sql      # Million Dialogue tables
│   │   ├── 20241203_002_sidebar_tables.sql      # Sidebar feature tables
│   │   ├── 20241203_003_indexes.sql             # Performance indexes
│   │   └── 20241203_004_seed_questions.sql      # 50 Arabic questions
│   └── seed.sql                                 # Additional seed data
│
└── apps/
    └── api/
        └── src/
            ├── middleware/
            │   ├── auth.middleware.ts           # JWT authentication
            │   ├── ratelimit.middleware.ts      # Rate limiting
            │   └── validation.middleware.ts     # Input validation
            ├── config/
            │   └── million.config.ts            # Game configuration
            └── types/
                └── million.types.ts             # TypeScript types
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js >= 18.x
- PostgreSQL >= 14.x (or Supabase project)
- npm or yarn

### 1. Environment Variables

Create `.env` file in `apps/api`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/million_platform
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3001
NODE_ENV=development

# WebSocket
SOCKET_PATH=/socket.io

# Rate Limiting (optional customization)
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional: LLM for question generation
OPENAI_API_KEY=sk-...
```

### 2. Install Dependencies

```bash
cd apps/api
npm install

# Required dependencies for Phase 1:
npm install express jsonwebtoken express-rate-limit zod
npm install --save-dev @types/express @types/jsonwebtoken
```

### 3. Run Database Migrations

#### Option A: Using Supabase CLI
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or run individually
supabase db execute --file supabase/migrations/20241203_001_million_tables.sql
supabase db execute --file supabase/migrations/20241203_002_sidebar_tables.sql
supabase db execute --file supabase/migrations/20241203_003_indexes.sql
supabase db execute --file supabase/migrations/20241203_004_seed_questions.sql
```

#### Option B: Using psql
```bash
psql $DATABASE_URL -f supabase/migrations/20241203_001_million_tables.sql
psql $DATABASE_URL -f supabase/migrations/20241203_002_sidebar_tables.sql
psql $DATABASE_URL -f supabase/migrations/20241203_003_indexes.sql
psql $DATABASE_URL -f supabase/migrations/20241203_004_seed_questions.sql
```

### 4. Verify Installation

```bash
# Check if tables exist
psql $DATABASE_URL -c "\dt million_*"

# Check questions count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM million_questions;"
# Should return: 50

# Check question distribution
psql $DATABASE_URL -c "
  SELECT 
    tags->0 as subject,
    COUNT(*) as count
  FROM million_questions
  GROUP BY tags->0;
"
```

---

## 📊 Database Schema

### Million Dialogue Tables

#### `million_rooms`
Game rooms where players compete.
```sql
- id (UUID, PK)
- title (VARCHAR)
- host_id (UUID, FK → users)
- status (waiting|in_progress|finished|cancelled)
- type (public|private)
- settings (JSONB)
- created_at, updated_at
```

#### `million_rounds`
Rounds within each room.
```sql
- id (UUID, PK)
- room_id (UUID, FK → million_rooms)
- round_number (INT)
- started_at, finished_at
```

#### `million_questions`
Question bank (50+ Arabic questions).
```sql
- id (SERIAL, PK)
- text_ar (TEXT)
- options (JSONB array)
- correct_index (INT)
- difficulty (1-5)
- tags (JSONB array)
```

#### `million_answers`
Player answers with scoring.
```sql
- id (UUID, PK)
- round_id (UUID, FK)
- question_id (INT, FK)
- user_id (UUID, FK)
- chosen_index (INT)
- time_taken (INT milliseconds)
- points_awarded (INT)
- is_correct (BOOLEAN, computed)
```

#### `million_scores`
Aggregated player scores per room.
```sql
- room_id, user_id (composite unique)
- total_points
- questions_answered
- correct_answers
```

### Sidebar Tables

See `supabase/migrations/20241203_002_sidebar_tables.sql` for full schema.

---

## 🎯 Scoring Formula

### Points Calculation
```typescript
// Base points based on difficulty
basePoints = difficulty * 100

// Time bonus (faster = more points)
timeBonus = (timeLimit - timeTaken) * 5

// First correct answer bonus
firstBonus = isFirstCorrect ? 50 : 0

// Streak bonus (consecutive correct)
streakBonus = currentStreak * 25

// Total
totalPoints = basePoints + timeBonus + firstBonus + streakBonus
```

### Examples
- **Easy question (difficulty=1), answered in 5s (limit=15s):**
  - Base: 100
  - Time: (15-5) × 5 = 50
  - **Total: 150 points**

- **Hard question (difficulty=4), answered in 3s:**
  - Base: 400
  - Time: (15-3) × 5 = 60
  - First bonus: +50
  - **Total: 510 points**

---

## 🔒 Security Features

### JWT Authentication
```typescript
// Protect routes
import { authenticateToken } from './middleware/auth.middleware';

router.get('/protected', authenticateToken, handler);

// Role-based access
import { authorizeRoles } from './middleware/auth.middleware';

router.get('/admin', authenticateToken, authorizeRoles('admin'), handler);
```

### Rate Limiting
```typescript
import { answerLimiter, roomCreationLimiter } from './middleware/ratelimit.middleware';

// Limit answer submissions
router.post('/answer', answerLimiter, submitAnswer);

// Limit room creation
router.post('/create-room', roomCreationLimiter, createRoom);
```

### Input Validation
```typescript
import { validate, schemas } from './middleware/validation.middleware';

// Validate request body
router.post('/create-room', 
  validate(schemas.createRoom),
  createRoom
);
```

---

## 📝 Usage Examples

### 1. Query Questions by Subject
```sql
SELECT * FROM million_questions
WHERE tags @> '["science"]'::jsonb
LIMIT 10;
```

### 2. Get Leaderboard
```sql
SELECT 
  u.name,
  ms.total_points,
  ms.correct_answers,
  ms.questions_answered,
  RANK() OVER (ORDER BY ms.total_points DESC) as rank
FROM million_scores ms
JOIN users u ON ms.user_id = u.id
WHERE ms.room_id = 'room-uuid-here'
ORDER BY ms.total_points DESC
LIMIT 10;
```

### 3. Check Student Attendance
```sql
SELECT 
  date,
  status,
  check_in_time
FROM attendance
WHERE student_id = 'student-uuid'
  AND date BETWEEN '2024-12-01' AND '2024-12-31'
ORDER BY date DESC;
```

---

## 🧪 Testing

### Verify Middleware
```bash
# In apps/api
npm run test
```

### Manual API Testing
```bash
# Generate test JWT
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: 'test-user-id', email: 'test@example.com', role: 'student' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
console.log(token);
"

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/million/rooms
```

---

## 🔄 Next Steps (Phase 2-4)

- **Phase 2:** Million Dialogue Backend (APIs + WebSocket)
- **Phase 3:** Million Dialogue Frontend (React Components)
- **Phase 4:** Interactive Sidebar + Integration

---

## 📚 API Documentation (Coming in Phase 2)

Preview of endpoints being built:
- `POST /api/million/create-room`
- `POST /api/million/join-room`
- `POST /api/million/start-round`
- `POST /api/million/answer`
- `GET /api/million/leaderboard/:roomId`
- `GET /api/assignments`
- `GET /api/grades`
- `GET /api/attendance`

---

## 🐛 Troubleshooting

### Migration Errors
```bash
# Check current migration status
supabase migration list

# Rollback last migration
supabase migration revert

# Fix and re-run
supabase db push
```

### Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check Supabase project status
supabase status
```

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Token format: `Bearer <token>`
- Check token expiration

---

## 📞 Support

For Phase 2-4 implementation or issues:
- Refer to `million_4_part_plan.md`
- Check migration files for schema details
- Review types in `million.types.ts`

---

**Phase 1 Complete!** ✅  
Ready for Phase 2: Backend APIs + WebSocket implementation.
