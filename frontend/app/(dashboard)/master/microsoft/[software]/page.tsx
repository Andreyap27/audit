"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
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
import { useMicrosoftSoftware, useCreateMicrosoft, useUpdateMicrosoft, useDeleteMicrosoft } from "@/hooks/use-master"

type MsType = "OFFICE" | "VISIO" | "PROJECT" | "ACCESS"
const TYPE_MAP: Record<string, MsType> = {
  office: "OFFICE",
  visio: "VISIO",
  project: "PROJECT",
  access: "ACCESS",
}
const LABEL_MAP: Record<MsType, string> = {
  OFFICE: "Microsoft Office",
  VISIO: "Microsoft Visio",
  PROJECT: "Microsoft Project",
  ACCESS: "Microsoft Access",
}

type MsForm = { version: string; licenseType: string }

export default function MicrosoftPage() {
  const params = useParams()
  const software = (params.software as string) ?? "office"
  const msType = TYPE_MAP[software] ?? "OFFICE"
  const label = LABEL_MAP[msType]

  const { data: items, isLoading } = useMicrosoftSoftware(msType)
  const createMut = useCreateMicrosoft()
  const updateMut = useUpdateMicrosoft()
  const deleteMut = useDeleteMicrosoft()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<MsForm>({ version: "", licenseType: "OEM" })

  const openAdd = () => { setEditId(null); setForm({ version: "", licenseType: "OEM" }); setOpen(true) }
  const openEdit = (o: { id: string; version: string; licenseType: string }) => {
    setEditId(o.id); setForm({ version: o.version, licenseType: o.licenseType }); setOpen(true)
  }

  const handleSave = async () => {
    if (!form.version) { toast.error("Versi wajib diisi"); return }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, data: { ...form, type: msType } })
        toast.success(`${label} berhasil diperbarui`)
      } else {
        await createMut.mutateAsync({ ...form, type: msType })
        toast.success(`${label} berhasil ditambahkan`)
      }
      setOpen(false)
    } catch { toast.error(`Gagal menyimpan ${label}`) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus entri ini?`)) return
    try {
      await deleteMut.mutateAsync(id)
      toast.success("Berhasil dihapus")
    } catch { toast.error("Gagal menghapus") }
  }

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
        <CardHeader><CardTitle>Daftar {label}</CardTitle><CardDescription>Total {items?.length ?? 0} entri</CardDescription></CardHeader>
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
              {!isLoading && (items ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{label.split(" ")[1]} {o.version}</TableCell>
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
            <DialogTitle>{editId ? `Edit ${label}` : `Tambah ${label}`}</DialogTitle>
            <DialogDescription>Isi data lisensi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Versi *</Label><Input value={form.version} onChange={e=>setForm(f=>({...f,version:e.target.value}))} placeholder="Contoh: 2021, 365"/></div>
            <div>
              <Label>Tipe Lisensi</Label>
              <Select value={form.licenseType} onValueChange={v=>setForm(f=>({...f,licenseType:v}))}>
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
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}