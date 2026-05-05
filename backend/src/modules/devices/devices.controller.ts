import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import {
  createDeviceSchema,
  reassignDeviceSchema,
  updateDeviceSchema,
  deviceFilterSchema,
} from "./devices.schema";
import * as service from "./devices.service";

export const getAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = deviceFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.json(await service.getDevices(parsed.data));
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
    res.json(await service.getDeviceById(req.params.id as string));
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
    const parsed = createDeviceSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.status(201).json(await service.createDevice(parsed.data, req.user!.id));
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
    const parsed = updateDeviceSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.json(
      await service.updateDevice(
        req.params.id as string,
        parsed.data,
        req.user!.id,
      ),
    );
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
    await service.deleteDevice(req.params.id as string, req.user!.id);
    res.json({ message: "Device deleted" });
  } catch (err) {
    next(err);
  }
};

export const reassign = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = reassignDeviceSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.json(
      await service.reassignDevice(
        req.params.id as string,
        parsed.data,
        req.user!.id,
      ),
    );
  } catch (err) {
    next(err);
  }
};

export const nextAssetCode = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const code = await service.getNextAssetCode();
    res.json({ assetCode: code });
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
    res.json(await service.getDeviceAssignmentHistory(req.params.id as string));
  } catch (err) {
    next(err);
  }
};
