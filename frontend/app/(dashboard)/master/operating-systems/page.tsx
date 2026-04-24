"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useOperatingSystems, useCreateOs, useUpdateOs, useDeleteOs } from "@/hooks/use-master"

type OsForm = { version: string; licenseType: string }

export default function OperatingSystemsPage() {
  const { data: osList, isLoading } = useOperatingSystems()
  const createMut = useCreateOs()
  const updateMut = useUpdateOs()
  const deleteMut = useDeleteOs()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<OsForm>({ version: "", licenseType: "OEM" })

  const openAdd = () => { setEditId(null); setForm({ version: "", licenseType: "OEM" }); setOpen(true) }
  const openEdit = (o: { id: string; version: string; licenseType: string }) => {
    setEditId(o.id); setForm({ version: o.version, licenseType: o.licenseType }); setOpen(true)
  }

  const handleSave = async () => {
    if (!form.version) { toast.error("Versi wajib diisi"); return }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: form })
        toast.success("OS berhasil diperbarui")
      } else {
        await createMut.mutateAsync(form)
        toast.success("OS berhasil ditambahkan")
      }
      setOpen(false)
    } catch { toast.error("Gagal menyimpan OS") }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus OS ini?")) return
    try {
      await deleteMut.mutateAsync(id)
      toast.success("OS berhasil dihapus")
    } catch { toast.error("Gagal menghapus OS") }
  }

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
        <CardHeader><CardTitle>Daftar OS</CardTitle><CardDescription>Total {osList?.length ?? 0} entri</CardDescription></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Versi</TableHead>
                <TableHead>Tipe Lisensi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({length:4}).map((_,i)=>(
                <TableRow key={i}>{Array.from({length:3}).map((__,j)=><TableCell key={j}><Skeleton className="h-4 w-full"/></TableCell>)}</TableRow>
              ))}
              {!isLoading && (osList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                <TableRow key={o.id}>
                  <TableCell>Windows {o.version}</TableCell>
                  <TableCell><Badge variant="outline">{o.licenseType}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(o)}><Pencil className="h-4 w-4"/></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
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
            <DialogTitle>{editId ? "Edit OS" : "Tambah OS"}</DialogTitle>
            <DialogDescription>Isi data sistem operasi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Versi *</Label><Input value={form.version} onChange={e=>setForm(f=>({...f,version:e.target.value}))} placeholder="Contoh: 11 Pro"/></div>
            <div>
              <Label>Tipe Lisensi</Label>
              <Select value={form.licenseType} onValueChange={v=>setForm(f=>({...f,licenseType:v}))}>
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
            <Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}