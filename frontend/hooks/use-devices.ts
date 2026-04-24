import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface DeviceFilters {
  departmentId?: string;
  unitTypeId?: string;
  operatingSystemId?: string;
  officeId?: string;
  visioId?: string;
  projectId?: string;
  accessId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useDevices = (filters: DeviceFilters = {}) =>
  useQuery({
    queryKey: ["devices", filters],
    queryFn: () => api.get("/devices", { params: filters }).then((r) => r.data),
  });

export const useDevice = (id: string) =>
  useQuery({
    queryKey: ["devices", id],
    queryFn: () => api.get(`/devices/${id}`).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/devices", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  });
};

export const useUpdateDevice = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.put(`/devices/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["devices", id] });
    },
  });
};

export const useDeleteDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/devices/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  });
};
