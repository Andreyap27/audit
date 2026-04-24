"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useDepartmentReport } from "@/hooks/use-reports"

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead className="text-right">Total Device</TableHead>
                <TableHead className="text-right">NB</TableHead>
                <TableHead className="text-right">WS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length:5}).map((_,i)=>(
                <TableRow key={i}>{Array.from({length:5}).map((__,j)=><TableCell key={j}><Skeleton className="h-4 w-full"/></TableCell>)}</TableRow>
              ))}
              {!isLoading && (report ?? []).map((d: {
                code: string
                name: string
                totalDevices: number
                totalNB: number
                totalWS: number
              }) => (
                <TableRow key={d.code}>
                  <TableCell className="font-mono">{d.code}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell className="text-right font-medium">{d.totalDevices}</TableCell>
                  <TableCell className="text-right">{d.totalNB}</TableCell>
                  <TableCell className="text-right">{d.totalWS}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}