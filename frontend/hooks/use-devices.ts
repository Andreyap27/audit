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
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

export const useNextAssetCode = () =>
  useQuery({
    queryKey: ["next-asset-code"],
    queryFn: () => api.get("/devices/next-asset-code").then((r) => (r.data as { assetCode: string }).assetCode),
    staleTime: 0,
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

export const useReturnDeviceToGA = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.post(`/devices/${id}/return-to-ga`, { note }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  });
};

export const useReactivateDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.patch(`/devices/${id}/reactivate`, { note }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["reports", "returned-to-ga"] });
    },
  });
};

export const useUploadEvidence = () => {
  return useMutation({
    mutationFn: ({ file, module, folder }: { file: File; module: string; folder?: string }) => {
      const fd = new FormData();
      fd.append("file", file);
      const params: Record<string, string> = { module };
      if (folder) params.folder = folder;
      return api
        .post("/uploads/evidence", fd, {
          headers: { "Content-Type": "multipart/form-data" },
          params,
        })
        .then((r) => r.data);
    },
  });
};

export const useReassignDevice = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post(`/devices/${id}/reassign`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["devices", id] });
      qc.invalidateQueries({ queryKey: ["devices", id, "history"] });
    },
  });
};

export const useDeviceHistory = (id: string) =>
  useQuery({
    queryKey: ["devices", id, "history"],
    queryFn: () => api.get(`/devices/${id}/history`).then((r) => r.data),
    enabled: !!id,
  });
