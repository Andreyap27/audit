import { z } from "zod";

const nullableUuid = z.string().uuid().nullable().optional();
const nullableString = z.string().nullable().optional();
const optionalUuid = z.string().uuid().optional();

export const createDeviceSchema = z.object({
  serialNumber: z.string().min(1),
  assetCode: z.string().optional(),
  userName: z.string().optional(),
  departmentId: z.string().uuid(),
  unitTypeId: z.string().uuid(),
  operatingSystemId: optionalUuid,
  officeId: optionalUuid,
  visioId: optionalUuid,
  projectId: optionalUuid,
  accessId: optionalUuid,
  notes: z.string().optional(),
  serialNumberProofPath: z.string().optional(),
  operatingSystemProofPath: z.string().optional(),
  officeProofPath: z.string().optional(),
  visioProofPath: z.string().optional(),
  projectProofPath: z.string().optional(),
  accessProofPath: z.string().optional(),
});

export const updateDeviceSchema = z.object({
  serialNumber: z.string().min(1).optional(),
  assetCode: z.string().optional(),
  userName: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  unitTypeId: z.string().uuid().optional(),
  operatingSystemId: nullableUuid,
  officeId: nullableUuid,
  visioId: nullableUuid,
  projectId: nullableUuid,
  accessId: nullableUuid,
  notes: z.string().optional(),
  serialNumberProofPath: nullableString,
  operatingSystemProofPath: nullableString,
  officeProofPath: nullableString,
  visioProofPath: nullableString,
  projectProofPath: nullableString,
  accessProofPath: nullableString,
});

export const reassignDeviceSchema = z.object({
  userName: z.string().min(1, "Nama user wajib diisi"),
  departmentId: z.string().uuid().optional(),
  unitTypeId: z.string().uuid().optional(),
  operatingSystemId: nullableUuid,
  officeId: nullableUuid,
  visioId: nullableUuid,
  projectId: nullableUuid,
  accessId: nullableUuid,
  reassignmentNote: z.string().optional(),
  serialNumberProofPath: nullableString,
  operatingSystemProofPath: nullableString,
  officeProofPath: nullableString,
  visioProofPath: nullableString,
  projectProofPath: nullableString,
  accessProofPath: nullableString,
});

export const deviceFilterSchema = z.object({
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
