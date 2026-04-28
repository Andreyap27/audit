"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Power } from "lucide-react"
import { useDepartments, useCreateDepartment, useUpdateDepartment } from "@/hooks/use-master"
import { useGlobalModal } from "@/lib/global-modal"

type DeptRow = { id: string; code: string; name: string; description: string | null; isActive: boolean }
type DeptForm = { name: string; code: string; description: string }

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments()
  const createMut = useCreateDepartment()
  const updateMut = useUpdateDepartment()
  const modal = useGlobalModal()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<DeptForm>({ name: "", code: "", description: "" })

  const openAdd = () => { setEditId(null); setForm({ name: "", code: "", description: "" }); setOpen(true) }
  const openEdit = (d: DeptRow) => {
    setEditId(d.id); setForm({ name: d.name, code: d.code, description: d.description ?? "" }); setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.code) { modal.error({ title: "Nama dan Kode wajib diisi" }); return }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, ...form })
        modal.success({ title: "Departemen berhasil diperbarui" })
      } else {
        await createMut.mutateAsync(form)
        modal.success({ title: "Departemen berhasil ditambahkan" })
      }
      setOpen(false)
    } catch { modal.error({ title: "Gagal menyimpan departemen" }) }
  }

  const handleToggle = async (d: DeptRow) => {
    const ok = await modal.confirm({
      title: `${d.isActive ? "Nonaktifkan" : "Aktifkan"} departemen ini?`,
      confirmText: d.isActive ? "Nonaktifkan" : "Aktifkan",
    })
    if (!ok) return
    try {
      await updateMut.mutateAsync({ id: d.id, isActive: !d.isActive })
      modal.success({ title: `Departemen ${d.isActive ? "dinonaktifkan" : "diaktifkan"}` })
    } catch { modal.error({ title: "Gagal mengubah status" }) }
  }

  const columns: ColumnDef<DeptRow>[] = [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span>,
    },
    { accessorKey: "name", header: "Nama" },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.description ?? "-"}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void handleToggle(row.original)}>
            <Power className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Departemen</h1>
          <p className="text-muted-foreground">Kelola data departemen</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah Departemen</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Departemen</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(departments ?? []) as DeptRow[]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Departemen" : "Tambah Departemen"}</DialogTitle>
            <DialogDescription>Isi data departemen</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Kode *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Contoh: IT" /></div>
            <div><Label>Nama *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Contoh: Information Technology" /></div>
            <div><Label>Deskripsi</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Opsional" /></div>
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
