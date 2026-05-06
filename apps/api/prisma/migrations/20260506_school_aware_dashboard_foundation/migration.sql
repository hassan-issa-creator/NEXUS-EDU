-- School-aware foundation for production dashboard flows

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
    CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'REQUIRES_ACTION', 'PAID', 'FAILED', 'REFUNDED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "School" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "School_slug_key" ON "School"("slug");

INSERT INTO "School" ("id", "name", "slug", "description", "isActive", "createdAt", "updatedAt")
SELECT
  'default-school',
  'Default School',
  'default-school',
  'Backfilled default school for legacy records',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "School" WHERE "id" = 'default-school');

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "Assignment" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

ALTER TABLE "Invoice"
  ALTER COLUMN "status" TYPE "InvoiceStatus"
  USING CASE
    WHEN "status" IN ('PENDING', 'REQUIRES_ACTION', 'PAID', 'FAILED', 'REFUNDED') THEN "status"::"InvoiceStatus"
    ELSE 'PENDING'::"InvoiceStatus"
  END;

ALTER TABLE "Invoice"
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

UPDATE "User" SET "schoolId" = 'default-school' WHERE "schoolId" IS NULL;
UPDATE "Class" SET "schoolId" = 'default-school' WHERE "schoolId" IS NULL;
UPDATE "Subject" SET "schoolId" = 'default-school' WHERE "schoolId" IS NULL;
UPDATE "Lesson" SET "schoolId" = 'default-school' WHERE "schoolId" IS NULL;
UPDATE "Assignment" SET "schoolId" = 'default-school' WHERE "schoolId" IS NULL;
UPDATE "Invoice" SET "schoolId" = 'default-school' WHERE "schoolId" IS NULL;

CREATE TABLE IF NOT EXISTS "ClassSubject" (
  "id" TEXT NOT NULL,
  "classId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "teacherId" TEXT,
  "schedule" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClassSubject_classId_subjectId_key" ON "ClassSubject"("classId", "subjectId");
CREATE INDEX IF NOT EXISTS "ClassSubject_classId_idx" ON "ClassSubject"("classId");
CREATE INDEX IF NOT EXISTS "ClassSubject_subjectId_idx" ON "ClassSubject"("subjectId");

INSERT INTO "ClassSubject" ("id", "classId", "subjectId", "teacherId", "createdAt")
SELECT
  'cs-' || md5(random()::text || clock_timestamp()::text || s."id"),
  s."classId",
  s."id",
  s."teacherId",
  CURRENT_TIMESTAMP
FROM "Subject" s
WHERE NOT EXISTS (
  SELECT 1
  FROM "ClassSubject" cs
  WHERE cs."classId" = s."classId" AND cs."subjectId" = s."id"
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_schoolId_idx" ON "AuditLog"("schoolId");
CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

CREATE INDEX IF NOT EXISTS "User_schoolId_idx" ON "User"("schoolId");
CREATE INDEX IF NOT EXISTS "Class_schoolId_idx" ON "Class"("schoolId");
CREATE INDEX IF NOT EXISTS "Subject_schoolId_idx" ON "Subject"("schoolId");
CREATE INDEX IF NOT EXISTS "Lesson_schoolId_idx" ON "Lesson"("schoolId");
CREATE INDEX IF NOT EXISTS "Assignment_schoolId_idx" ON "Assignment"("schoolId");
CREATE INDEX IF NOT EXISTS "Invoice_schoolId_idx" ON "Invoice"("schoolId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'User_schoolId_fkey'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Class_schoolId_fkey'
  ) THEN
    ALTER TABLE "Class" ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Subject_schoolId_fkey'
  ) THEN
    ALTER TABLE "Subject" ADD CONSTRAINT "Subject_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Lesson_schoolId_fkey'
  ) THEN
    ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Assignment_schoolId_fkey'
  ) THEN
    ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Invoice_schoolId_fkey'
  ) THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'AuditLog_schoolId_fkey'
  ) THEN
    ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'AuditLog_userId_fkey'
  ) THEN
    ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ClassSubject_classId_fkey'
  ) THEN
    ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'ClassSubject_subjectId_fkey'
  ) THEN
    ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
