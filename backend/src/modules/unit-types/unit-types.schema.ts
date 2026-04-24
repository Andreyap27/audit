import { z } from "zod";

export const createUnitTypeSchema = z.object({
  code: z.string().min(1).max(10).toUpperCase(),
  name: z.string().min(1).max(100),
});

export const updateUnitTypeSchema = createUnitTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});
