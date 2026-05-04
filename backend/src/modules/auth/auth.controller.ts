import { Response, NextFunction } from "express";
import { loginSchema } from "./auth.schema";
import { loginService, getMeService } from "./auth.service";
import { AuthRequest } from "../../middleware/auth";

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }

    const result = await loginService(parsed.data.identifier, parsed.data.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await getMeService(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
