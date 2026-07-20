CREATE TYPE "CmsPageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "Banner" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "linkUrl" TEXT,
  "position" TEXT NOT NULL DEFAULT 'HOME_HERO',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CmsPage" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "CmsPageStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CmsPage_slug_key" ON "CmsPage"("slug");
CREATE INDEX "CmsPage_status_idx" ON "CmsPage"("status");
CREATE INDEX "Banner_position_isActive_sortOrder_idx" ON "Banner"("position", "isActive", "sortOrder");

ALTER TABLE "AuditLog"
  ADD COLUMN "oldValues" JSONB,
  ADD COLUMN "newValues" JSONB,
  ADD COLUMN "ipAddress" TEXT,
  ADD COLUMN "userAgent" TEXT;
