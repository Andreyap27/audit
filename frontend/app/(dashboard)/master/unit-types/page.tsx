"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useUnitTypes,
  useCreateUnitType,
  useUpdateUnitType,
  useDeleteUnitType,
} from "@/hooks/use-master";
import { useGlobalModal } from "@/lib/global-modal";

type UnitTypeRow = {
  id: string;
  code: string;
  name: string;
};

type UnitForm = { code: string; name: string };

export default function UnitTypesPage() {
  const { data: unitTypes, isLoading } = useUnitTypes();
  const createMut = useCreateUnitType();
  const updateMut = useUpdateUnitType();
  const deleteMut = useDeleteUnitType();
  const modal = useGlobalModal();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<UnitForm>({ code: "", name: "" });

  const openAdd = () => {
    setEditId(null);
    setForm({ code: "", name: "" });
    setOpen(true);
  };
  const openEdit = (u: UnitTypeRow) => {
    setEditId(u.id);
    setForm({ code: u.code, name: u.name });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.name) {
      modal.error({ title: "Kode dan Nama wajib diisi" });
      return;
    }
    try {
      if (editId) {
        await updateMut.mutateAsync({ id: editId, ...form });
        modal.success({ title: "Unit Type berhasil diperbarui" });
      } else {
        await createMut.mutateAsync(form);
        modal.success({ title: "Unit Type berhasil ditambahkan" });
      }
      setOpen(false);
    } catch {
      modal.error({ title: "Gagal menyimpan Unit Type" });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await modal.confirm({
      title: "Hapus Unit Type ini?",
      description:
        "Data yang dipakai perangkat sebaiknya tidak langsung dihapus.",
      confirmText: "Hapus",
    });
    if (!ok) return;
    try {
      await deleteMut.mutateAsync(id);
      modal.success({ title: "Unit Type berhasil dihapus" });
    } catch {
      modal.error({ title: "Gagal menghapus Unit Type" });
    }
  };

  const columns: ColumnDef<UnitTypeRow>[] = [
    {
      accessorKey: "code",
      header: "Kode",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Nama",
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Master Tipe Unit
          </h1>
          <p className="text-muted-foreground">Kelola tipe unit perangkat</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tipe
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(unitTypes ?? []) as UnitTypeRow[]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Tipe Unit" : "Tambah Tipe Unit"}
            </DialogTitle>
            <DialogDescription>Isi data tipe unit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kode *</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
                }
                placeholder="Contoh: NB"
              />
            </div>
            <div>
              <Label>Nama *</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Contoh: Notebook"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMut.isPending || updateMut.isPending}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
