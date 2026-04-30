import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["reports", "stats"],
    queryFn: () => api.get("/reports/stats").then((r) => r.data),
  });

export const useDepartmentReport = () =>
  useQuery({
    queryKey: ["reports", "departments"],
    queryFn: () => api.get("/reports/departments").then((r) => r.data),
  });

type SoftwareReportType = "OFFICE" | "VISIO" | "PROJECT" | "ACCESS" | "OS";

export const useSoftwareReport = (type: SoftwareReportType) =>
  useQuery({
    queryKey: ["reports", "software", type],
    queryFn: () =>
      api.get("/reports/software", { params: { type } }).then((r) => r.data),
  });

export interface LoanReportFilters {
  status?: "BORROWED" | "RETURNED";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useLoanReport = (params: LoanReportFilters) =>
  useQuery({
    queryKey: ["reports", "loans", params],
    queryFn: () =>
      api.get("/reports/loans", { params }).then((r) => r.data),
  });

export const useExportLoanReport = () =>
  useMutation({
    mutationFn: async (params: { status?: string; dateFrom?: string; dateTo?: string }) => {
      const res = await api.get("/reports/loans/export", {
        params,
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-peminjaman-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

export const useAuditLog = (params: {
  action?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ["reports", "audit-log", params],
    queryFn: () =>
      api.get("/reports/audit-log", { params }).then((r) => r.data),
    refetchInterval: 30_000, // auto-refresh every 30s
  });
