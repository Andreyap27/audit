-- AlterTable Device: add hardwareImagePaths array column
ALTER TABLE "Device"
  ADD COLUMN IF NOT EXISTS "hardwareImagePaths" TEXT[] DEFAULT ARRAY[]::TEXT[];
