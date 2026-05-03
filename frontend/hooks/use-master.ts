import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// --- Departments ---
export const useDepartments = () =>
  useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get("/departments").then((r) => r.data),
  });

export const useCreateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; name: string; description?: string }) =>
      api.post("/departments", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
};

export const useUpdateDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      code?: string;
      name?: string;
      description?: string;
      isActive?: boolean;
    }) => api.put(`/departments/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
};

export const useDeleteDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/departments/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
};

// --- Operating Systems ---
export const useOperatingSystems = () =>
  useQuery({
    queryKey: ["operating-systems"],
    queryFn: () => api.get("/operating-systems").then((r) => r.data),
  });

export const useCreateOs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      version: string;
      licenseType: string;
      serialNumber?: string;
      proofPaths?: string[];
    }) => api.post("/operating-systems", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operating-systems"] }),
  });
};

export const useUpdateOs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      version?: string;
      licenseType?: string;
      serialNumber?: string;
      proofPaths?: string[];
      isActive?: boolean;
    }) => api.put(`/operating-systems/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operating-systems"] }),
  });
};

export const useDeleteOs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/operating-systems/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operating-systems"] }),
  });
};

// --- Unit Types ---
export const useUnitTypes = () =>
  useQuery({
    queryKey: ["unit-types"],
    queryFn: () => api.get("/unit-types").then((r) => r.data),
  });

export const useCreateUnitType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; name: string }) =>
      api.post("/unit-types", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["unit-types"] }),
  });
};

export const useUpdateUnitType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      code?: string;
      name?: string;
      isActive?: boolean;
    }) => api.put(`/unit-types/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["unit-types"] }),
  });
};

export const useDeleteUnitType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/unit-types/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["unit-types"] }),
  });
};

// --- Microsoft Software ---
type MsType = "OFFICE" | "VISIO" | "PROJECT" | "ACCESS";

export const useMicrosoftSoftware = (type: MsType) =>
  useQuery({
    queryKey: ["microsoft", type],
    queryFn: () =>
      api.get("/microsoft", { params: { type } }).then((r) => r.data),
  });

export const useCreateMicrosoft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type: MsType;
      version: string;
      licenseType: string;
      serialNumber?: string;
      proofPaths?: string[];
    }) => api.post("/microsoft", data).then((r) => r.data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["microsoft", vars.type] }),
  });
};

export const useUpdateMicrosoft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      type?: MsType;
      version?: string;
      licenseType?: string;
      serialNumber?: string;
      proofPaths?: string[];
      isActive?: boolean;
    }) => api.put(`/microsoft/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["microsoft"] }),
  });
};

export const useDeleteMicrosoft = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/microsoft/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["microsoft"] }),
  });
};
