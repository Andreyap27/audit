import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase().optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
