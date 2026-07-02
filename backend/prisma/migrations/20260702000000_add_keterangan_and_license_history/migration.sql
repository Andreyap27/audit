-- AlterTable
ALTER TABLE "OperatingSystem" ADD COLUMN "keterangan" TEXT;

-- AlterTable
ALTER TABLE "MicrosoftSoftware" ADD COLUMN "keterangan" TEXT;

-- CreateTable
CREATE TABLE "LicenseAssignmentHistory" (
    "id"           TEXT NOT NULL,
    "licenseKind"  TEXT NOT NULL,
    "licenseId"    TEXT NOT NULL,
    "deviceId"     TEXT,
    "serialNumber" TEXT,
    "userName"     TEXT,
    "action"       TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LicenseAssignmentHistory_pkey" PRIMARY KEY ("id")
);
