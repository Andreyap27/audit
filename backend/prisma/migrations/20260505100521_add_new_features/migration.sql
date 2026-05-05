-- CreateEnum DeviceCategory (idempotent)
DO $$ BEGIN
  CREATE TYPE "DeviceCategory" AS ENUM ('COMPUTER', 'HARDWARE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable Device
ALTER TABLE "Device"
  ADD COLUMN IF NOT EXISTS "category" "DeviceCategory" NOT NULL DEFAULT 'COMPUTER',
  ADD COLUMN IF NOT EXISTS "canBeLent" BOOLEAN NOT NULL DEFAULT false,
  DROP COLUMN IF EXISTS "operatingSystemProofPath",
  DROP COLUMN IF EXISTS "officeProofPath",
  DROP COLUMN IF EXISTS "visioProofPath",
  DROP COLUMN IF EXISTS "projectProofPath",
  DROP COLUMN IF EXISTS "accessProofPath";

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Device' AND column_name = 'unitTypeId'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "Device" ALTER COLUMN "unitTypeId" DROP NOT NULL;
  END IF;
END $$;

-- Drop old Device_unitType FK and re-add as optional (nullable FK)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Device_unitTypeId_fkey' AND table_name = 'Device'
  ) THEN
    ALTER TABLE "Device" DROP CONSTRAINT "Device_unitTypeId_fkey";
  END IF;
  ALTER TABLE "Device" ADD CONSTRAINT "Device_unitTypeId_fkey"
    FOREIGN KEY ("unitTypeId") REFERENCES "UnitType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable OperatingSystem
DROP INDEX IF EXISTS "OperatingSystem_name_key";
ALTER TABLE "OperatingSystem"
  ADD COLUMN IF NOT EXISTS "serialNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "proofPaths" TEXT[] DEFAULT ARRAY[]::TEXT[];
CREATE UNIQUE INDEX IF NOT EXISTS "OperatingSystem_serialNumber_key" ON "OperatingSystem"("serialNumber");

-- AlterTable MicrosoftSoftware
DROP INDEX IF EXISTS "MicrosoftSoftware_type_version_licenseType_key";
ALTER TABLE "MicrosoftSoftware"
  ADD COLUMN IF NOT EXISTS "serialNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "proofPaths" TEXT[] DEFAULT ARRAY[]::TEXT[];
CREATE UNIQUE INDEX IF NOT EXISTS "MicrosoftSoftware_serialNumber_key" ON "MicrosoftSoftware"("serialNumber");

-- AlterTable DeviceAssignmentHistory
ALTER TABLE "DeviceAssignmentHistory"
  DROP COLUMN IF EXISTS "operatingSystemProofPath",
  DROP COLUMN IF EXISTS "officeProofPath",
  DROP COLUMN IF EXISTS "visioProofPath",
  DROP COLUMN IF EXISTS "projectProofPath",
  DROP COLUMN IF EXISTS "accessProofPath";

-- CreateTable VersionMaster
CREATE TABLE IF NOT EXISTS "VersionMaster" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "VersionMaster_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VersionMaster_category_name_key" ON "VersionMaster"("category", "name");
