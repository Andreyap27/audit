import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import * as service from "./device-loans.service";
import { createLoanSchema, returnLoanSchema } from "./device-loans.schema";

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await service.getLoans({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as string | undefined,
      search: search as string | undefined,
    });
    res.json(result);
  } catch (err) { next(err); }
};

export const getBySerial = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await service.getLoanBySerial(req.params.serialNumber);
    res.json(result);
  } catch (err) { next(err); }
};

export const getById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loan = await service.getLoanById(req.params.id);
    res.json(loan);
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = createLoanSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: parsed.error.errors[0].message }); return; }
    const loan = await service.createLoan(parsed.data, req.user!.id);
    res.status(201).json(loan);
  } catch (err) { next(err); }
};

export const returnDevice = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = returnLoanSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ message: parsed.error.errors[0].message }); return; }
    const loan = await service.returnLoan(req.params.id, parsed.data);
    res.json(loan);
  } catch (err) { next(err); }
};