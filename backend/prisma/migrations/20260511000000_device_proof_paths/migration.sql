-- AlterTable Device: replace serialNumberProofPath (single) with serialNumberProofPaths (array)
ALTER TABLE "Device"
  ADD COLUMN IF NOT EXISTS "serialNumberProofPaths" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing single-path data into the new array column
UPDATE "Device"
SET "serialNumberProofPaths" = ARRAY["serialNumberProofPath"]
WHERE "serialNumberProofPath" IS NOT NULL AND "serialNumberProofPath" <> '';

-- Drop the old column
ALTER TABLE "Device" DROP COLUMN IF EXISTS "serialNumberProofPath";
