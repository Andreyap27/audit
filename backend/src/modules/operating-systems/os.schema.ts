import { z } from "zod";

export const createOsSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  licenseType: z.string().min(1),
});

export const updateOsSchema = createOsSchema.partial().extend({
  isActive: z.boolean().optional(),
});
