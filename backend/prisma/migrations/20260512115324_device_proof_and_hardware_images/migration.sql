-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "returnedToGAAt" TIMESTAMP(3),
ADD COLUMN     "returnedToGANote" TEXT;

-- AlterTable
ALTER TABLE "DeviceLoan" ADD COLUMN     "borrowPhotoPath" TEXT;
