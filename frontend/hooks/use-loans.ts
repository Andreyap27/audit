import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface LoanFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export const useLoans = (filters: LoanFilters = {}) =>
  useQuery({
    queryKey: ["loans", filters],
    queryFn: () => api.get("/device-loans", { params: filters }).then((r) => r.data),
    staleTime: 30_000,
    retry: 1,
  });

export const useLoanBySerial = (serialNumber: string) =>
  useQuery({
    queryKey: ["loans", "serial", serialNumber],
    queryFn: () =>
      api
        .get(`/device-loans/serial/${encodeURIComponent(serialNumber)}`)
        .then((r) => r.data),
    enabled: !!serialNumber,
    retry: 1,
    staleTime: 0,
  });

export const useCreateLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { deviceId: string; borrowerName: string; borrowPhotoPath: string }) =>
      api.post("/device-loans", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loans"] }),
  });
};

export const useReturnLoan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      returnPhotoPath: string;
      note?: string | null;
    }) => api.patch(`/device-loans/${id}/return`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loans"] }),
  });
};