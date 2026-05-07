"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Card } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useSoftwareReport } from "@/hooks/use-reports"

type MsType = "OS" | "OFFICE" | "VISIO" | "PROJECT" | "ACCESS"

type SoftwareRow = {
  id: string
  version: string
  licenseType: string
  total: number
  used: number
  available: number
  percentage: number
}

const columns: ColumnDef<SoftwareRow>[] = [
  {
    accessorKey: "version",
    header: "Nama/Versi",
    cell: ({ row }) => <span className="font-medium">{row.original.version}</span>,
  },
  {
    accessorKey: "licenseType",
    header: "Tipe Lisensi",
    cell: ({ row }) => <Badge variant="outline">{row.original.licenseType}</Badge>,
  },
  {
    accessorKey: "total",
    header: "Total Lisensi",
    cell: ({ row }) => <span className="font-mono font-medium">{row.original.total}</span>,
  },
  {
    accessorKey: "used",
    header: "Terpakai",
    cell: ({ row }) => (
      <span className={`font-mono font-medium ${row.original.used > 0 ? "text-primary" : "text-muted-foreground"}`}>
        {row.original.used}
      </span>
    ),
  },
  {
    accessorKey: "available",
    header: "Tersedia",
    cell: ({ row }) => (
      <span className={`font-mono font-medium ${row.original.available > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
        {row.original.available}
      </span>
    ),
  },
  {
    accessorKey: "percentage",
    header: "% Terpakai",
    cell: ({ row }) => {
      const pct = row.original.percentage
      return (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-sm tabular-nums">{pct.toFixed(1)}%</span>
        </div>
      )
    },
  },
]

const tabs: { value: MsType; label: string }[] = [
  { value: "OS", label: "Operating System" },
  { value: "OFFICE", label: "Office" },
  { value: "VISIO", label: "Visio" },
  { value: "PROJECT", label: "Project" },
  { value: "ACCESS", label: "Access" },
]

function SoftwareTab({ type }: { type: MsType }) {
  const { data: report, isLoading } = useSoftwareReport(type)
  return (
    <Card>
      <DataTable
        columns={columns}
        data={(report ?? []) as SoftwareRow[]}
        isLoading={isLoading}
      />
    </Card>
  )
}

export default function SoftwareReportPage() {
  const [activeTab, setActiveTab] = useState<MsType>("OS")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Laporan Software</h1>
        <p className="text-muted-foreground">Distribusi lisensi software per versi</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MsType)}>
        <TabsList>
          {tabs.map(t => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
        </TabsList>
        {tabs.map(t => (
          <TabsContent key={t.value} value={t.value}>
            <SoftwareTab type={t.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
