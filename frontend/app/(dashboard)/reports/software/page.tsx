"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSoftwareReport } from "@/hooks/use-reports"

type MsType = "OS" | "OFFICE" | "VISIO" | "PROJECT" | "ACCESS"

export default function SoftwareReportPage() {
  const [activeTab, setActiveTab] = useState<MsType>("OS")
  const { data: report, isLoading } = useSoftwareReport(activeTab)

  const tabs: { value: MsType; label: string }[] = [
    { value: "OS", label: "Operating System" },
    { value: "OFFICE", label: "Office" },
    { value: "VISIO", label: "Visio" },
    { value: "PROJECT", label: "Project" },
    { value: "ACCESS", label: "Access" },
  ]

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
            <Card>
              <CardHeader>
                <CardTitle>Distribusi {t.label}</CardTitle>
                <CardDescription>Jumlah device per versi {t.label}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama/Versi</TableHead>
                      <TableHead>Tipe Lisensi</TableHead>
                      <TableHead className="text-right">Jumlah Device</TableHead>
                      <TableHead className="text-right">Persentase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({length:4}).map((_,i)=>(
                      <TableRow key={i}>{Array.from({length:4}).map((__,j)=><TableCell key={j}><Skeleton className="h-4 w-full"/></TableCell>)}</TableRow>
                    ))}
                    {!isLoading && (report ?? []).map((r: {
                      version: string
                      licenseType: string
                      count: number
                      percentage: number
                    }, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.version}</TableCell>
                        <TableCell><Badge variant="outline">{r.licenseType}</Badge></TableCell>
                        <TableCell className="text-right">{r.count}</TableCell>
                        <TableCell className="text-right">{r.percentage?.toFixed(1) ?? 0}%</TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && (report ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}