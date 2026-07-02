import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  createMicrosoftSchema,
  filterMicrosoftSchema,
  updateMicrosoftSchema,
} from "./microsoft.schema";
import * as service from "./microsoft.service";
import { MsType } from "@prisma/client";

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = filterMicrosoftSchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          message:
            "type query param required: OFFICE | VISIO | PROJECT | ACCESS",
        });
      return;
    }
    res.json(await service.getAll(parsed.data.type as MsType));
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
    res.json(await service.getById(req.params.id as string));
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
    const parsed = createMicrosoftSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.status(201).json(await service.create(parsed.data));
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
    const parsed = updateMicrosoftSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.json(await service.update(req.params.id as string, parsed.data));
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(await service.getHistory(req.params.id as string));
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
    await service.remove(req.params.id as string);
    res.json({ message: "Microsoft software deactivated" });
  } catch (err) {
    next(err);
  }
};
