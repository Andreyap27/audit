import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./departments.schema";
import * as service from "./departments.service";

export const getAll = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(await service.getDepartments());
  } catch (err) {
    next(err);
  }
};

export const getById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(await service.getDepartmentById(req.params.id as string));
  } catch (err) {
    next(err);
  }
};

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = createDepartmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.status(201).json(await service.createDepartment(parsed.data));
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = updateDepartmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.json(await service.updateDepartment(req.params.id as string, parsed.data));
  } catch (err) {
    next(err);
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await service.deleteDepartment(req.params.id as string);
    res.json({ message: "Department deactivated" });
  } catch (err) {
    next(err);
  }
};
