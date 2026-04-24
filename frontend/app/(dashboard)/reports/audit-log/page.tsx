"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useAuditLog } from "@/hooks/use-reports"

const actionColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
  IMPORT: "outline",
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [action, setAction] = useState("ALL")

  const { data, isLoading } = useAuditLog({
    page,
    limit: 20,
    action: action !== "ALL" ? action : undefined,
    search: search || undefined,
  })

  const logs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Riwayat semua aktivitas sistem</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
              <Input className="pl-8" placeholder="Cari..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
            </div>
            <Select value={action} onValueChange={v=>{setAction(v);setPage(1)}}>
              <SelectTrigger className="w-40"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Aksi</SelectItem>
                <SelectItem value="CREATE">CREATE</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="IMPORT">IMPORT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas</CardTitle>
          <CardDescription>Total {total} entri</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aksi</TableHead>
                <TableHead>Tabel</TableHead>
                <TableHead>Record ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length:5}).map((_,i)=>(
                <TableRow key={i}>{Array.from({length:5}).map((__,j)=><TableCell key={j}><Skeleton className="h-4 w-full"/></TableCell>)}</TableRow>
              ))}
              {!isLoading && logs.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada data</TableCell></TableRow>
              )}
              {!isLoading && logs.map((log: {
                id: string
                action: string
                tableName: string
                recordId: string | null
                createdAt: string
                user: { username: string } | null
              }) => (
                <TableRow key={log.id}>
                  <TableCell><Badge variant={actionColors[log.action] ?? "outline"}>{log.action}</Badge></TableCell>
                  <TableCell>{log.tableName}</TableCell>
                  <TableCell>{log.recordId ?? "-"}</TableCell>
                  <TableCell>{log.user?.username ?? "system"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(log.createdAt).toLocaleString("id-ID")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>
            <ChevronLeft className="h-4 w-4"/>Sebelumnya
          </Button>
          <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>
            Selanjutnya<ChevronRight className="h-4 w-4"/>
          </Button>
        </div>
      </div>
    </div>
  )
}