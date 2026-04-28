"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { useDepartmentReport } from "@/hooks/use-reports"

type DeptReport = { dept: string; deptName: string; total: number; nb: number; ws: number }

const columns: ColumnDef<DeptReport>[] = [
  { accessorKey: "dept", header: "Kode", cell: ({ row }) => <span className="font-mono">{row.original.dept}</span> },
  { accessorKey: "deptName", header: "Departemen" },
  { accessorKey: "total", header: "Total Device", cell: ({ row }) => <span className="font-medium">{row.original.total}</span> },
  { accessorKey: "nb", header: "NB" },
  { accessorKey: "ws", header: "WS" },
]

export default function DepartmentReportPage() {
  const { data: report, isLoading } = useDepartmentReport()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan per Departemen</h1>
        <p className="text-muted-foreground">Ringkasan jumlah perangkat per departemen</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Departemen</CardTitle>
          <CardDescription>Total {report?.length ?? 0} departemen</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(report ?? []) as DeptReport[]}
            isLoading={isLoading}
            searchable={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
