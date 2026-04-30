"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useDepartmentReport } from "@/hooks/use-reports";

type DeptReport = {
  dept: string;
  deptName: string;
  total: number;
  nb: number;
  ws: number;
  office: number;
  visio: number;
  project: number;
  access: number;
};

const columns: ColumnDef<DeptReport>[] = [
  {
    accessorKey: "dept",
    header: "Kode",
    cell: ({ row }) => (
      <span className="font-mono font-medium">{row.original.dept}</span>
    ),
  },
  { accessorKey: "deptName", header: "Departemen" },
  {
    accessorKey: "total",
    header: "Total Device",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.total}</span>
    ),
  },
  { accessorKey: "nb", header: "NB" },
  { accessorKey: "ws", header: "WS" },
  { accessorKey: "office", header: "Office" },
  { accessorKey: "visio", header: "Visio" },
  { accessorKey: "project", header: "Project" },
  { accessorKey: "access", header: "Access" },
];

export default function DepartmentReportPage() {
  const { data: report, isLoading } = useDepartmentReport();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Laporan per Departemen
        </h1>
        <p className="text-muted-foreground">
          Ringkasan jumlah perangkat dan software per departemen
        </p>
      </div>

      <Card>
        <DataTable
          columns={columns}
          data={(report ?? []) as DeptReport[]}
          isLoading={isLoading}
          defaultPageSize={25}
        />
      </Card>
    </div>
  );
}
