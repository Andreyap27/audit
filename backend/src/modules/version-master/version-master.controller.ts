import { Request, Response, NextFunction } from "express";
import * as service from "./version-master.service";

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = (req.query.category as string) ?? "OS";
    const data = await service.getVersions(category);
    res.json(data);
  } catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, name } = req.body as { category: string; name: string };
    if (!category || !name) { res.status(400).json({ message: "category dan name wajib diisi" }); return; }
    const data = await service.createVersion(category, name);
    res.status(201).json(data);
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body as { name: string };
    if (!name) { res.status(400).json({ message: "name wajib diisi" }); return; }
    const data = await service.updateVersion(req.params.id as string, name);
    res.json(data);
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await service.deleteVersion(req.params.id as string);
    res.json({ message: "Versi berhasil dihapus" });
  } catch (err) { next(err); }
};
