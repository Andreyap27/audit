import { z } from "zod";

export const createOsSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  licenseType: z.string().min(1),
  serialNumber: z.string().optional(),
  proofPaths: z.array(z.string()).optional().default([]),
});

export const updateOsSchema = createOsSchema.partial().extend({
  isActive: z.boolean().optional(),
});
