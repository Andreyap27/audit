import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export const useImportExcel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api
        .post("/import", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useExportExcel = () => {
  return useMutation({
    mutationFn: async (departmentId?: string) => {
      const res = await api.get("/export", {
        params: departmentId ? { departmentId } : {},
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `IT_Audit_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
};
