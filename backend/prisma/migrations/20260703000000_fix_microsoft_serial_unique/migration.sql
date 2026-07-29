-- Drop the old global unique constraint on serialNumber
DROP INDEX IF EXISTS "MicrosoftSoftware_serialNumber_key";

-- Add composite unique constraint (type, serialNumber)
-- NULL values are excluded so multiple rows with NULL serialNumber per type are allowed
CREATE UNIQUE INDEX "MicrosoftSoftware_type_serialNumber_key"
  ON "MicrosoftSoftware" ("type", "serialNumber")
  WHERE "serialNumber" IS NOT NULL;
