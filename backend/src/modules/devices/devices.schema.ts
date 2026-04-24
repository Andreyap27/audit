import { z } from "zod";

export const createDeviceSchema = z.object({
  serialNumber: z.string().min(1),
  assetCode: z.string().optional(),
  userName: z.string().optional(),
  departmentId: z.string().uuid(),
  unitTypeId: z.string().uuid(),
  operatingSystemId: z.string().uuid().optional(),
  officeId: z.string().uuid().optional(),
  visioId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  accessId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const updateDeviceSchema = createDeviceSchema.partial();

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
