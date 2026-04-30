-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "MsType" AS ENUM ('OFFICE', 'VISIO', 'PROJECT', 'ACCESS');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('BORROWED', 'RETURNED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperatingSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OperatingSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MicrosoftSoftware" (
    "id" TEXT NOT NULL,
    "type" "MsType" NOT NULL,
    "version" TEXT NOT NULL,
    "licenseType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MicrosoftSoftware_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UnitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "assetCode" TEXT,
    "userName" TEXT,
    "departmentId" TEXT NOT NULL,
    "unitTypeId" TEXT NOT NULL,
    "operatingSystemId" TEXT,
    "officeId" TEXT,
    "visioId" TEXT,
    "projectId" TEXT,
    "accessId" TEXT,
    "notes" TEXT,
    "serialNumberProofPath" TEXT,
    "operatingSystemProofPath" TEXT,
    "officeProofPath" TEXT,
    "visioProofPath" TEXT,
    "projectProofPath" TEXT,
    "accessProofPath" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceLoan" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "borrowerName" TEXT NOT NULL,
    "borrowedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "returnPhotoPath" TEXT,
    "note" TEXT,
    "status" "LoanStatus" NOT NULL DEFAULT 'BORROWED',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceAssignmentHistory" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userName" TEXT,
    "departmentCode" TEXT,
    "departmentName" TEXT,
    "unitTypeCode" TEXT,
    "unitTypeName" TEXT,
    "operatingSystemLabel" TEXT,
    "officeLabel" TEXT,
    "visioLabel" TEXT,
    "projectLabel" TEXT,
    "accessLabel" TEXT,
    "serialNumberProofPath" TEXT,
    "operatingSystemProofPath" TEXT,
    "officeProofPath" TEXT,
    "visioProofPath" TEXT,
    "projectProofPath" TEXT,
    "accessProofPath" TEXT,
    "reassignmentNote" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceAssignmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OperatingSystem_name_key" ON "OperatingSystem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MicrosoftSoftware_type_version_licenseType_key" ON "MicrosoftSoftware"("type", "version", "licenseType");

-- CreateIndex
CREATE UNIQUE INDEX "UnitType_code_key" ON "UnitType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "Device"("serialNumber");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_unitTypeId_fkey" FOREIGN KEY ("unitTypeId") REFERENCES "UnitType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_operatingSystemId_fkey" FOREIGN KEY ("operatingSystemId") REFERENCES "OperatingSystem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "MicrosoftSoftware"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_visioId_fkey" FOREIGN KEY ("visioId") REFERENCES "MicrosoftSoftware"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "MicrosoftSoftware"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "MicrosoftSoftware"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLoan" ADD CONSTRAINT "DeviceLoan_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLoan" ADD CONSTRAINT "DeviceLoan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceAssignmentHistory" ADD CONSTRAINT "DeviceAssignmentHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
