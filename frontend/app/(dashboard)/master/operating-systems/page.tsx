"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useOperatingSystems, useCreateOs, useUpdateOs, useDeleteOs } from "@/hooks/use-master"
import { useGlobalModal } from "@/lib/global-modal"

type OsRow = { id: string; version: string; licenseType: string }
type OsForm = { version: string; licenseType: string }

export default function OperatingSystemsPage() {
  const { data: osList, isLoading } = useOperatingSystems()
  const createMut = useCreateOs()
  const updateMut = useUpdateOs()
  const deleteMut = useDeleteOs()
  const modal = useGlobalModal()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<OsForm>({ version: "", licenseType: "OEM" })

  const openAdd = () => { setEditId(null); setForm({ version: "", licenseType: "OEM" }); setOpen(true) }
  const openEdit = (o: OsRow) => { setEditId(o.id); setForm({ version: o.version, licenseType: o.licenseType }); setOpen(true) }

  const handleSave = async () => {
    if (!form.version) { modal.error({ title: "Versi wajib diisi" }); return }
    const name = `Windows ${form.version} ${form.licenseType}`
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, name, ...form })
        modal.success({ title: "OS berhasil diperbarui" })
      } else {
        await createMut.mutateAsync({ name, ...form })
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
    } catch { modal.error({ title: "Gagal menghapus OS" }) }
  }

  const columns: ColumnDef<OsRow>[] = [
    {
      accessorKey: "version",
      header: "Versi",
      cell: ({ row }) => <span>Windows {row.original.version}</span>,
    },
    {
      accessorKey: "licenseType",
      header: "Tipe Lisensi",
      cell: ({ row }) => <Badge variant="outline">{row.original.licenseType}</Badge>,
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
          <h1 className="text-2xl font-bold tracking-tight">Master Operating System</h1>
          <p className="text-muted-foreground">Kelola data sistem operasi</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah OS</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar OS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(osList ?? []) as OsRow[]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit OS" : "Tambah OS"}</DialogTitle>
            <DialogDescription>Isi data sistem operasi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Versi *</Label>
              <Input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="Contoh: 11 Pro" />
            </div>
            <div>
              <Label>Tipe Lisensi</Label>
              <Select value={form.licenseType} onValueChange={v => setForm(f => ({ ...f, licenseType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OEM">OEM</SelectItem>
                  <SelectItem value="OLP">OLP</SelectItem>
                  <SelectItem value="RETAIL">RETAIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
