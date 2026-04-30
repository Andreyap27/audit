import { z } from "zod";

export const createLoanSchema = z.object({
  deviceId: z.string().uuid("Device ID tidak valid"),
  borrowerName: z.string().min(1, "Nama peminjam wajib diisi").max(100),
});

export const returnLoanSchema = z.object({
  returnPhotoPath: z.string().min(1, "Foto bukti pengembalian wajib diisi"),
  note: z.string().max(500).nullable().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ReturnLoanInput = z.infer<typeof returnLoanSchema>;