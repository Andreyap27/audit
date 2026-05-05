"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"
import {
  useVersionMaster,
  useCreateVersion,
  useUpdateVersion,
  useDeleteVersion,
} from "@/hooks/use-master"
import { useGlobalModal } from "@/lib/global-modal"

type Category = "OS" | "MICROSOFT"
type VersionRow = { id: string; name: string }

export default function VersionsPage() {
  const [activeTab, setActiveTab] = useState<Category>("OS")
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const modal = useGlobalModal()

  const { data: versions, isLoading } = useVersionMaster(activeTab)
  const createMut = useCreateVersion()
  const updateMut = useUpdateVersion()
  const deleteMut = useDeleteVersion()

  const openAdd = () => { setEditId(null); setName(""); setOpen(true) }
  const openEdit = (row: VersionRow) => { setEditId(row.id); setName(row.name); setOpen(true) }

  const handleSave = async () => {
    if (!name.trim()) { modal.error({ title: "Nama versi wajib diisi" }); return }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, name: name.trim(), category: activeTab })
        modal.success({ title: "Versi berhasil diperbarui" })
      } else {
        await createMut.mutateAsync({ category: activeTab, name: name.trim() })
        modal.success({ title: "Versi berhasil ditambahkan" })
      }
      setOpen(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      modal.error({ title: msg ?? "Gagal menyimpan" })
    }
  }

  const handleDelete = async (row: VersionRow) => {
    const ok = await modal.confirm({ title: `Hapus versi "${row.name}"?`, confirmText: "Hapus" })
    if (!ok) return
    try {
      await deleteMut.mutateAsync({ id: row.id, category: activeTab })
      modal.success({ title: "Versi berhasil dihapus" })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      modal.error({ title: msg ?? "Gagal menghapus" })
    }
  }

  const columns: ColumnDef<VersionRow>[] = [
    {
      accessorKey: "name",
      header: "Nama Versi",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void handleDelete(row.original)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  const tabLabel = activeTab === "OS" ? "OS" : "Microsoft Software"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Versi</h1>
          <p className="text-muted-foreground">
            Kelola daftar versi untuk Operating System dan Microsoft Software
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Versi {tabLabel}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Category)}>
        <TabsList>
          <TabsTrigger value="OS">Operating System</TabsTrigger>
          <TabsTrigger value="MICROSOFT">Microsoft Software</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(versions ?? []) as VersionRow[]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Versi" : `Tambah Versi ${tabLabel}`}</DialogTitle>
            <DialogDescription>
              {activeTab === "OS"
                ? "Contoh: Windows 11, Ubuntu 22.04"
                : "Contoh: 2021, 2024, 365"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nama Versi *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={activeTab === "OS" ? "Windows 11" : "2021"}
                onKeyDown={(e) => e.key === "Enter" && void handleSave()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={() => void handleSave()} disabled={createMut.isPending || updateMut.isPending}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
