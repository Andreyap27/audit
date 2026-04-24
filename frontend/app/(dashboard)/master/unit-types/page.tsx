"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useUnitTypes, useCreateUnitType, useUpdateUnitType, useDeleteUnitType } from "@/hooks/use-master"

type UnitForm = { name: string; description: string }

export default function UnitTypesPage() {
  const { data: unitTypes, isLoading } = useUnitTypes()
  const createMut = useCreateUnitType()
  const updateMut = useUpdateUnitType()
  const deleteMut = useDeleteUnitType()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<UnitForm>({ name: "", description: "" })

  const openAdd = () => { setEditId(null); setForm({ name: "", description: "" }); setOpen(true) }
  const openEdit = (u: { id: string; name: string; description: string | null }) => {
    setEditId(u.id); setForm({ name: u.name, description: u.description ?? "" }); setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name) { toast.error("Nama wajib diisi"); return }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: form })
        toast.success("Unit Type berhasil diperbarui")
      } else {
        await createMut.mutateAsync(form)
        toast.success("Unit Type berhasil ditambahkan")
      }
      setOpen(false)
    } catch { toast.error("Gagal menyimpan Unit Type") }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus Unit Type ini?")) return
    try {
      await deleteMut.mutateAsync(id)
      toast.success("Unit Type berhasil dihapus")
    } catch { toast.error("Gagal menghapus Unit Type") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Tipe Unit</h1>
          <p className="text-muted-foreground">Kelola tipe unit perangkat</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Tambah Tipe</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Tipe Unit</CardTitle><CardDescription>Total {unitTypes?.length ?? 0} tipe</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length:3}).map((_,i)=>(
                <TableRow key={i}>{Array.from({length:3}).map((__,j)=><TableCell key={j}><Skeleton className="h-4 w-full"/></TableCell>)}</TableRow>
              ))}
              {!isLoading && (unitTypes ?? []).map((u: { id: string; name: string; description: string | null }) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.description ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Tipe Unit" : "Tambah Tipe Unit"}</DialogTitle>
            <DialogDescription>Isi data tipe unit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama *</Label><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Contoh: NB"/></div>
            <div><Label>Deskripsi</Label><Input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Contoh: Notebook"/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}