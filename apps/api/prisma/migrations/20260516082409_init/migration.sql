-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO');

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "email" TEXT,
    "scoreOverall" INTEGER NOT NULL DEFAULT 0,
    "scorePerformance" INTEGER NOT NULL DEFAULT 0,
    "scoreSeo" INTEGER NOT NULL DEFAULT 0,
    "scoreCro" INTEGER NOT NULL DEFAULT 0,
    "scoreMobile" INTEGER NOT NULL DEFAULT 0,
    "scoreUx" INTEGER NOT NULL DEFAULT 0,
    "scoreSecurity" INTEGER NOT NULL DEFAULT 0,
    "speedData" JSONB,
    "seoData" JSONB,
    "mobileData" JSONB,
    "securityData" JSONB,
    "analyticsData" JSONB,
    "appsData" JSONB,
    "revenueLeakEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "businessImpact" TEXT NOT NULL,
    "technicalDetails" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "estimatedGain" TEXT NOT NULL,
    "revenueImpact" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "priorityScore" INTEGER NOT NULL DEFAULT 0,
    "revenueImpact" TEXT NOT NULL,
    "quickWin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorBenchmark" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "yourScore" DOUBLE PRECISION NOT NULL,
    "industryAvg" DOUBLE PRECISION NOT NULL,
    "topPerformer" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CompetitorBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Audit_url_idx" ON "Audit"("url");

-- CreateIndex
CREATE INDEX "Audit_status_idx" ON "Audit"("status");

-- CreateIndex
CREATE INDEX "Audit_createdAt_idx" ON "Audit"("createdAt");

-- CreateIndex
CREATE INDEX "Issue_auditId_idx" ON "Issue"("auditId");

-- CreateIndex
CREATE INDEX "Issue_severity_idx" ON "Issue"("severity");

-- CreateIndex
CREATE INDEX "AiInsight_auditId_idx" ON "AiInsight"("auditId");

-- CreateIndex
CREATE INDEX "CompetitorBenchmark_auditId_idx" ON "CompetitorBenchmark"("auditId");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorBenchmark" ADD CONSTRAINT "CompetitorBenchmark_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
