"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
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
import { Plus, Pencil, Trash2, Key } from "lucide-react"
import { useMicrosoftSoftware, useCreateMicrosoft, useUpdateMicrosoft, useDeleteMicrosoft, useVersionMaster } from "@/hooks/use-master"
import { useGlobalModal } from "@/lib/global-modal"
import { MultiEvidenceUploadField } from "@/components/devices/multi-evidence-upload-field"

type MsType = "OFFICE" | "VISIO" | "PROJECT" | "ACCESS"
const TYPE_MAP: Record<string, MsType> = { office: "OFFICE", visio: "VISIO", project: "PROJECT", access: "ACCESS" }
const LABEL_MAP: Record<MsType, string> = {
  OFFICE: "Microsoft Office",
  VISIO: "Microsoft Visio",
  PROJECT: "Microsoft Project",
  ACCESS: "Microsoft Access",
}


type MsRow = {
  id: string
  version: string
  licenseType: string
  serialNumber?: string | null
  proofPaths?: string[]
}

type MsForm = {
  version: string
  licenseType: string
  serialNumber: string
  proofPaths: string[]
}

const emptyForm: MsForm = { version: "", licenseType: "OEM", serialNumber: "", proofPaths: [] }

export default function MicrosoftPage() {
  const params = useParams()
  const software = (params.software as string) ?? "office"
  const msType = TYPE_MAP[software] ?? "OFFICE"
  const label = LABEL_MAP[msType]
  const shortLabel = label.split(" ")[1]
const { data: items, isLoading } = useMicrosoftSoftware(msType)
  const createMut = useCreateMicrosoft()
  const updateMut = useUpdateMicrosoft()
  const deleteMut = useDeleteMicrosoft()
  const modal = useGlobalModal()
  const { data: msVersions } = useVersionMaster("MICROSOFT")

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<MsForm>(emptyForm)

  const openAdd = () => { setEditId(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (o: MsRow) => {
    setEditId(o.id)
    setForm({
      version: o.version,
      licenseType: o.licenseType,
      serialNumber: o.serialNumber ?? "",
      proofPaths: o.proofPaths ?? [],
    })
    setOpen(true)
  }

  const setField = <K extends keyof MsForm>(k: K, v: MsForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.version) { modal.error({ title: "Versi wajib dipilih" }); return }
    const payload = {
      type: msType,
      version: form.version,
      licenseType: form.licenseType,
      serialNumber: form.serialNumber || undefined,
      proofPaths: form.proofPaths,
    }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, ...payload })
        modal.success({ title: `${label} berhasil diperbarui` })
      } else {
        await createMut.mutateAsync(payload)
        modal.success({ title: `${label} berhasil ditambahkan` })
      }
      setOpen(false)
    } catch { modal.error({ title: `Gagal menyimpan ${label}` }) }
  }

  const handleDelete = async (id: string) => {
    const ok = await modal.confirm({ title: "Hapus entri ini?", confirmText: "Hapus" })
    if (!ok) return
    try {
      await deleteMut.mutateAsync(id)
      modal.success({ title: "Berhasil dihapus" })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      modal.error({ title: msg ?? "Gagal menghapus" })
    }
  }

  const columns: ColumnDef<MsRow>[] = [
    {
      accessorKey: "version",
      header: "Versi",
      cell: ({ row }) => (
        <span className="font-medium">{shortLabel} {row.original.version}</span>
      ),
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
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
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
          <h1 className="text-2xl font-bold tracking-tight">Master {label}</h1>
          <p className="text-muted-foreground">Kelola lisensi {label}</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(items ?? []) as MsRow[]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? `Edit ${label}` : `Tambah ${label}`}</DialogTitle>
            <DialogDescription>Isi data lisensi {label}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Versi *</Label>
                <Select value={form.version} onValueChange={v => setField("version", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih versi" />
                  </SelectTrigger>
                  <SelectContent>
                    {(msVersions ?? []).map(v => (
                      <SelectItem key={v.id} value={v.name}>{shortLabel} {v.name}</SelectItem>
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
                    <SelectItem value="SUBSCRIPTION">SUBSCRIPTION</SelectItem>
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
                label={shortLabel}
                folder={`ms-${software}-${form.version || "license"}-${form.licenseType}`}
                value={form.proofPaths}
                onChange={paths => setField("proofPaths", paths)}
                onError={msg => modal.error({ title: msg })}
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
    </div>
  )
}
