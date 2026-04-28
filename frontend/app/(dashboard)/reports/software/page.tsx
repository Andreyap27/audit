"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useSoftwareReport } from "@/hooks/use-reports"

type MsType = "OS" | "OFFICE" | "VISIO" | "PROJECT" | "ACCESS"

type SoftwareRow = { id: string; version: string; licenseType: string; count: number; percentage: number }

const columns: ColumnDef<SoftwareRow>[] = [
  { accessorKey: "version", header: "Nama/Versi", cell: ({ row }) => <span className="font-medium">{row.original.version}</span> },
  { accessorKey: "licenseType", header: "Tipe Lisensi", cell: ({ row }) => <Badge variant="outline">{row.original.licenseType}</Badge> },
  { accessorKey: "count", header: "Jumlah Device" },
  {
    accessorKey: "percentage",
    header: "Persentase",
    cell: ({ row }) => <span>{row.original.percentage?.toFixed(1) ?? 0}%</span>,
  },
]

const tabs: { value: MsType; label: string }[] = [
  { value: "OS", label: "Operating System" },
  { value: "OFFICE", label: "Office" },
  { value: "VISIO", label: "Visio" },
  { value: "PROJECT", label: "Project" },
  { value: "ACCESS", label: "Access" },
]

function SoftwareTab({ type, label }: { type: MsType; label: string }) {
  const { data: report, isLoading } = useSoftwareReport(type)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi {label}</CardTitle>
        <CardDescription>Jumlah device per versi {label}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={(report ?? []) as SoftwareRow[]}
          isLoading={isLoading}
          searchable={false}
          paginated={false}
        />
      </CardContent>
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
            <SoftwareTab type={t.value} label={t.label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
