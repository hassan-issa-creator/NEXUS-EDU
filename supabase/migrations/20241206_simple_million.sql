-- Simplified Million Module Migration
-- Run this in Supabase SQL Editor or PostgreSQL

-- Million Profiles Table
CREATE TABLE IF NOT EXISTS "MillionProfile" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE,
  "displayName" TEXT,
  "currentLevel" TEXT,
  "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "MillionProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Million Scores Table
CREATE TABLE IF NOT EXISTS "MillionScore" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "attendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "assignments" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "exams" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "participation" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
  
  CONSTRAINT "MillionScore_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "MillionProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "MillionProfile_userId_idx" ON "MillionProfile"("userId");
CREATE INDEX IF NOT EXISTS "MillionScore_profileId_idx" ON "MillionScore"("profileId");
CREATE INDEX IF NOT EXISTS "MillionScore_date_idx" ON "MillionScore"("date");

-- Updated At Trigger
CREATE OR REPLACE FUNCTION update_million_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER million_profile_updated_at
BEFORE UPDATE ON "MillionProfile"
FOR EACH ROW
EXECUTE FUNCTION update_million_profile_updated_at();

-- Comments
COMMENT ON TABLE "MillionProfile" IS 'Student profiles for Million Achiever program';
COMMENT ON TABLE "MillionScore" IS 'Daily/periodic scores for students';
