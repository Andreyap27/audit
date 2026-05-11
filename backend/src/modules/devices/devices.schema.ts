import { z } from "zod";

const nullableUuid = z.string().uuid().nullable().optional();
const nullableString = z.string().nullable().optional();
const optionalUuid = z.string().uuid().optional();

export const createDeviceSchema = z.object({
  serialNumber: z.string().min(1),
  assetCode: z.string().optional(),
  userName: z.string().optional(),
  category: z.enum(["COMPUTER", "HARDWARE"]).default("COMPUTER"),
  canBeLent: z.boolean().default(false),
  departmentId: z.string().uuid(),
  unitTypeId: optionalUuid,
  operatingSystemId: optionalUuid,
  officeId: optionalUuid,
  visioId: optionalUuid,
  projectId: optionalUuid,
  accessId: optionalUuid,
  notes: z.string().optional(),
  serialNumberProofPaths: z.string().array().optional(),
});

export const updateDeviceSchema = z.object({
  serialNumber: z.string().min(1).optional(),
  assetCode: z.string().optional(),
  userName: z.string().optional(),
  canBeLent: z.boolean().optional(),
  departmentId: z.string().uuid().optional(),
  unitTypeId: nullableUuid,
  operatingSystemId: nullableUuid,
  officeId: nullableUuid,
  visioId: nullableUuid,
  projectId: nullableUuid,
  accessId: nullableUuid,
  notes: z.string().optional(),
  serialNumberProofPaths: z.string().array().optional(),
});

export const reassignDeviceSchema = z.object({
  userName: z.string().min(1, "Nama user wajib diisi"),
  departmentId: z.string().uuid().optional(),
  unitTypeId: z.string().uuid().optional(),
  operatingSystemId: z.string().uuid(),
  officeId: nullableUuid,
  visioId: nullableUuid,
  projectId: nullableUuid,
  accessId: nullableUuid,
  reassignmentNote: z.string().optional(),
  serialNumberProofPaths: z.string().array().optional(),
});

export const deviceFilterSchema = z.object({
  category: z.enum(["COMPUTER", "HARDWARE"]).optional(),
  departmentId: z.string().uuid().optional(),
  unitTypeId: z.string().uuid().optional(),
  operatingSystemId: z.string().uuid().optional(),
  officeId: z.string().uuid().optional(),
  visioId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  accessId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
