"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Power } from "lucide-react"
import { toast } from "sonner"
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/use-master"

type DeptForm = { name: string; code: string; description: string }

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments()
  const createMut = useCreateDepartment()
  const updateMut = useUpdateDepartment()
  const deleteMut = useDeleteDepartment()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<DeptForm>({ name: "", code: "", description: "" })

  const openAdd = () => { setEditId(null); setForm({ name: "", code: "", description: "" }); setOpen(true) }
  const openEdit = (d: { id: string; name: string; code: string; description: string | null }) => {
    setEditId(d.id); setForm({ name: d.name, code: d.code, description: d.description ?? "" }); setOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.code) { toast.error("Nama dan Kode wajib diisi"); return }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: form })
        toast.success("Departemen berhasil diperbarui")
      } else {
        await createMut.mutateAsync(form)
        toast.success("Departemen berhasil ditambahkan")
      }
      setOpen(false)
    } catch { toast.error("Gagal menyimpan departemen") }
  }

  const handleToggle = async (d: { id: string; isActive: boolean }) => {
    try {
      await updateMut.mutateAsync({ id: d.id, data: { isActive: !d.isActive } })
      toast.success(`Departemen ${d.isActive ? "dinonaktifkan" : "diaktifkan"}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengubah status"
      toast.error(msg)
    }
  }

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
        <CardHeader><CardTitle>Daftar Departemen</CardTitle><CardDescription>Total {departments?.length ?? 0} departemen</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length:4}).map((_,i)=>(
                <TableRow key={i}>{Array.from({length:5}).map((__,j)=><TableCell key={j}><Skeleton className="h-4 w-full"/></TableCell>)}</TableRow>
              ))}
              {!isLoading && (departments ?? []).map((d: { id: string; name: string; code: string; description: string | null; isActive: boolean }) => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono font-medium">{d.code}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell className="text-muted-foreground">{d.description ?? "-"}</TableCell>
                  <TableCell><Badge variant={d.isActive ? "default" : "secondary"}>{d.isActive ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggle(d)}><Power className="h-4 w-4"/></Button>
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
            <DialogTitle>{editId ? "Edit Departemen" : "Tambah Departemen"}</DialogTitle>
            <DialogDescription>Isi data departemen</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Kode *</Label><Input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} placeholder="Contoh: IT"/></div>
            <div><Label>Nama *</Label><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Contoh: Information Technology"/></div>
            <div><Label>Deskripsi</Label><Input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Opsional"/></div>
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