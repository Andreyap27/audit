"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Download, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { useDevices, useDeleteDevice } from "@/hooks/use-devices"
import { useDepartments, useUnitTypes } from "@/hooks/use-master"
import { useExportExcel } from "@/hooks/use-import-export"

const PAGE_SIZE = 20

export default function DevicesPage() {
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("all")
  const [unitFilter, setUnitFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filters = {
    search: search || undefined,
    departmentId: deptFilter !== "all" ? deptFilter : undefined,
    unitTypeId: unitFilter !== "all" ? unitFilter : undefined,
    page,
    limit: PAGE_SIZE,
  }

  const { data, isLoading } = useDevices(filters)
  const { data: departments } = useDepartments()
  const { data: unitTypes } = useUnitTypes()
  const deleteMutation = useDeleteDevice()
  const exportMutation = useExportExcel()

  const devices = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const handleDelete = async () => {
    if (deleteId == null) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success("Device berhasil dihapus")
      setDeleteId(null)
    } catch {
      toast.error("Gagal menghapus device")
    }
  }

  const handleExport = () => {
    exportMutation.mutate(undefined, {
      onSuccess: () => toast.success("File Excel berhasil diunduh"),
      onError: () => toast.error("Gagal export Excel"),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perangkat IT</h1>
          <p className="text-muted-foreground">Kelola daftar perangkat IT inventaris</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {exportMutation.isPending ? "Exporting..." : "Export Excel"}
          </Button>
          <Button asChild>
            <Link href="/devices/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Device
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>Cari dan filter data perangkat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari serial number atau nama user..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
            </div>
            <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="Departemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Departemen</SelectItem>
                {(departments ?? []).map((d: { id: string; name: string }) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={unitFilter} onValueChange={(v) => { setUnitFilter(v); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="Unit Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Type</SelectItem>
                {(unitTypes ?? []).map((u: { id: string; name: string }) => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial No</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Visio</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
              {!isLoading && devices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    Tidak ada data perangkat
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && devices.map((device: {
                id: string
                serialNo: string
                userFullName: string | null
                department: { code: string } | null
                unitType: { name: string } | null
                operatingSystem: { version: string; licenseType: string } | null
                office: { version: string; licenseType: string } | null
                visio: { version: string } | null
                project: { version: string } | null
                access: { version: string } | null
              }) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.serialNo}</TableCell>
                  <TableCell>{device.userFullName ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{device.department?.code ?? "-"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={device.unitType?.name === "NB" ? "default" : "secondary"}>
                      {device.unitType?.name ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {device.operatingSystem ? `Win ${device.operatingSystem.version} ${device.operatingSystem.licenseType}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {device.office ? `Office ${device.office.version} ${device.office.licenseType}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {device.visio ? `Visio ${device.visio.version}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {device.project ? `Project ${device.project.version}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {device.access ? `Access ${device.access.version}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/devices/${device.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(device.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan {devices.length} dari {total} perangkat
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Perangkat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Perangkat akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
