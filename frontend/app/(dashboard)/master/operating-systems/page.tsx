"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, Key, History } from "lucide-react"
import { useOperatingSystems, useCreateOs, useUpdateOs, useDeleteOs, useVersionMaster, useOsHistory } from "@/hooks/use-master"
import { useGlobalModal } from "@/lib/global-modal"
import { MultiEvidenceUploadField } from "@/components/devices/multi-evidence-upload-field"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

type OsRow = {
  id: string
  version: string
  licenseType: string
  serialNumber?: string | null
  proofPaths?: string[]
  keterangan?: string | null
  createdAt?: string | null
  usedByDeviceId?: string | null
  usedByUserName?: string | null
  usedBySerialNumber?: string | null
}

type OsForm = {
  version: string
  licenseType: string
  serialNumber: string
  proofPaths: string[]
  keterangan: string
}

const emptyForm: OsForm = { version: "", licenseType: "OEM", serialNumber: "", proofPaths: [], keterangan: "" }

function OsHistoryDialog({ id, version, onClose }: { id: string; version: string; onClose: () => void }) {
  const { data: history, isLoading } = useOsHistory(id)
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Riwayat Penggunaan — {version}</DialogTitle>
          <DialogDescription>History lisensi ini berpindah antar perangkat</DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground py-4 text-center">Memuat...</p>}
          {!isLoading && (!history || history.length === 0) && (
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada riwayat</p>
          )}
          {(history ?? []).map((h: { id: string; action: string; serialNumber: string | null; userName: string | null; createdAt: string }) => (
            <div key={h.id} className="flex items-start gap-3 rounded-lg border px-3 py-2 text-sm">
              <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${h.action === "ASSIGNED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {h.action === "ASSIGNED" ? "Dipasang" : "Dilepas"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{h.userName ?? "-"}</p>
                <p className="font-mono text-xs text-muted-foreground">{h.serialNumber ?? "-"}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {format(new Date(h.createdAt), "dd MMM yyyy HH:mm", { locale: idLocale })}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function OperatingSystemsPage() {
  const { data: osList, isLoading } = useOperatingSystems()
  const createMut = useCreateOs()
  const updateMut = useUpdateOs()
  const deleteMut = useDeleteOs()
  const modal = useGlobalModal()
  const { data: osVersions } = useVersionMaster("OS")

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<OsForm>(emptyForm)
  const [historyTarget, setHistoryTarget] = useState<{ id: string; version: string } | null>(null)

  const openAdd = () => { setEditId(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (o: OsRow) => {
    setEditId(o.id)
    setForm({
      version: o.version,
      licenseType: o.licenseType,
      serialNumber: o.serialNumber ?? "",
      proofPaths: o.proofPaths ?? [],
      keterangan: o.keterangan ?? "",
    })
    setOpen(true)
  }

  const setField = <K extends keyof OsForm>(k: K, v: OsForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.version) { modal.error({ title: "Versi wajib dipilih" }); return }
    const name = `${form.version} ${form.licenseType}`
    const payload = {
      name,
      version: form.version,
      licenseType: form.licenseType,
      serialNumber: form.serialNumber || undefined,
      proofPaths: form.proofPaths,
      keterangan: form.keterangan || undefined,
    }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, ...payload })
        modal.success({ title: "OS berhasil diperbarui" })
      } else {
        await createMut.mutateAsync(payload)
        modal.success({ title: "OS berhasil ditambahkan" })
      }
      setOpen(false)
    } catch { modal.error({ title: "Gagal menyimpan OS" }) }
  }

  const handleDelete = async (id: string) => {
    const ok = await modal.confirm({ title: "Hapus OS ini?", confirmText: "Hapus" })
    if (!ok) return
    try {
      await deleteMut.mutateAsync(id)
      modal.success({ title: "OS berhasil dihapus" })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      modal.error({ title: msg ?? "Gagal menghapus OS" })
    }
  }

  const columns: ColumnDef<OsRow>[] = [
    {
      accessorKey: "createdAt",
      header: "Tgl Dibuat",
      cell: ({ row }) =>
        row.original.createdAt
          ? format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: idLocale })
          : "-",
    },
    {
      accessorKey: "version",
      header: "Versi OS",
      cell: ({ row }) => <span className="font-medium">{row.original.version}</span>,
    },
    {
      accessorKey: "licenseType",
      header: "Tipe Lisensi",
      cell: ({ row }) => <Badge variant="outline">{row.original.licenseType}</Badge>,
    },
    {
      accessorKey: "serialNumber",
      header: "Serial Number / License Key",
      cell: ({ row }) =>
        row.original.serialNumber ? (
          <span className="font-mono text-xs flex items-center gap-1">
            <Key className="h-3 w-3 text-muted-foreground" />
            {row.original.serialNumber}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      accessorKey: "proofPaths",
      header: "Bukti",
      cell: ({ row }) => {
        const count = (row.original.proofPaths ?? []).length
        return count > 0 ? (
          <Badge variant="secondary">{count} file</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      },
    },
    {
      id: "usedBy",
      header: "Digunakan Oleh",
      cell: ({ row }) =>
        row.original.usedByDeviceId ? (
          <div className="text-xs">
            <p className="font-medium text-green-700">{row.original.usedByUserName ?? "-"}</p>
            <p className="font-mono text-muted-foreground">{row.original.usedBySerialNumber}</p>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">Belum digunakan</span>
        ),
    },
    {
      accessorKey: "keterangan",
      header: "Keterangan",
      cell: ({ row }) => (
        <span className="block max-w-[160px] truncate text-xs text-muted-foreground">
          {row.original.keterangan ?? "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" title="Riwayat" onClick={() => setHistoryTarget({ id: row.original.id, version: row.original.version })}>
            <History className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Operating System</h1>
          <p className="text-muted-foreground">Kelola lisensi sistem operasi</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah OS</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(osList ?? []) as OsRow[]}
            isLoading={isLoading}
            getRowClassName={(row) =>
              row.usedByDeviceId ? "text-green-700 dark:text-green-400" : ""
            }
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit OS" : "Tambah OS"}</DialogTitle>
            <DialogDescription>Isi data lisensi sistem operasi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Versi OS *</Label>
                <Select value={form.version} onValueChange={v => setField("version", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih versi OS" />
                  </SelectTrigger>
                  <SelectContent>
                    {(osVersions ?? []).map(v => (
                      <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipe Lisensi</Label>
                <Select value={form.licenseType} onValueChange={v => setField("licenseType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OEM">OEM</SelectItem>
                    <SelectItem value="OLP">OLP</SelectItem>
                    <SelectItem value="RETAIL">RETAIL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Serial Number / License Key</Label>
              <Input
                value={form.serialNumber}
                onChange={e => setField("serialNumber", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                placeholder="Contoh: XXXXX-XXXXX-XXXXX-XXXXX"
                className="font-mono"
              />
            </div>
            <div>
              <Label>Bukti Lisensi</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Upload foto/screenshot bukti lisensi (bisa lebih dari 1 file)
              </p>
              <MultiEvidenceUploadField
                label="OS"
                module="master"
                folder={`os-${(form.version || "license").replace(/\s+/g, "-")}-${form.licenseType}`}
                value={form.proofPaths}
                onChange={paths => setField("proofPaths", paths)}
                onError={msg => modal.error({ title: msg })}
              />
            </div>
            <div>
              <Label>Keterangan</Label>
              <Textarea
                value={form.keterangan}
                onChange={e => setField("keterangan", e.target.value)}
                placeholder="Catatan tambahan (opsional)"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {historyTarget && (
        <OsHistoryDialog
          id={historyTarget.id}
          version={historyTarget.version}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  )
}
