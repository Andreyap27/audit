import { z } from "zod";

export const createDepartmentSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase(),
  name: z.string().min(1).max(100),
});

export const updateDepartmentSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase().optional(),
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});
