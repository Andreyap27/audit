import { z } from "zod";

export const msTypeEnum = z.enum(["OFFICE", "VISIO", "PROJECT", "ACCESS"]);

export const createMicrosoftSchema = z.object({
  type: msTypeEnum,
  version: z.string().min(1),
  licenseType: z.string().min(1),
});

export const updateMicrosoftSchema = createMicrosoftSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const filterMicrosoftSchema = z.object({
  type: msTypeEnum,
});
