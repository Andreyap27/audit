"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Key, Power } from "lucide-react"
import { useUsers, useCreateUser, useUpdateUser, useResetPassword } from "@/hooks/use-users"
import { useGlobalModal } from "@/lib/global-modal"

type Role = "ADMIN" | "EDITOR" | "VIEWER"

const roleColors: Record<Role, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  EDITOR: "secondary",
  VIEWER: "outline",
}

type UserRecord = {
  id: string
  username: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const { data: users, isLoading } = useUsers()
  const createMut = useCreateUser()
  const updateMut = useUpdateUser()
  const resetMut = useResetPassword()
  const modal = useGlobalModal()

  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "password" | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)

  const [createForm, setCreateForm] = useState({ username: "", email: "", password: "", role: "VIEWER" as Role })
  const [editForm, setEditForm] = useState({ username: "", email: "", role: "VIEWER" as Role })
  const [newPassword, setNewPassword] = useState("")

  const openCreate = () => {
    setCreateForm({ username: "", email: "", password: "", role: "VIEWER" })
    setDialogMode("create")
  }

  const openEdit = (u: UserRecord) => {
    setSelectedUser(u)
    setEditForm({ username: u.username, email: u.email, role: u.role })
    setDialogMode("edit")
  }

  const openResetPassword = (u: UserRecord) => {
    setSelectedUser(u)
    setNewPassword("")
    setDialogMode("password")
  }

  const handleCreate = async () => {
    if (!createForm.username || !createForm.email || !createForm.password) {
      modal.error({ title: "Semua field wajib diisi" }); return
    }
    try {
      await createMut.mutateAsync(createForm)
      modal.success({ title: "User berhasil ditambahkan" })
      setDialogMode(null)
    } catch { modal.error({ title: "Gagal menambahkan user" }) }
  }

  const handleEdit = async () => {
    if (!selectedUser) return
    try {
      await updateMut.mutateAsync({ id: selectedUser.id, ...editForm })
      modal.success({ title: "User berhasil diperbarui" })
      setDialogMode(null)
    } catch { modal.error({ title: "Gagal memperbarui user" }) }
  }

  const handleToggleActive = async (u: UserRecord) => {
    const ok = await modal.confirm({
      title: `${u.isActive ? "Nonaktifkan" : "Aktifkan"} user ini?`,
      confirmText: u.isActive ? "Nonaktifkan" : "Aktifkan",
    })
    if (!ok) return
    try {
      await updateMut.mutateAsync({ id: u.id, isActive: !u.isActive })
      modal.success({ title: `User ${u.isActive ? "dinonaktifkan" : "diaktifkan"}` })
    } catch { modal.error({ title: "Gagal mengubah status user" }) }
  }

  const handleResetPassword = async () => {
    if (!selectedUser || newPassword.length < 8) {
      modal.error({ title: "Password minimal 8 karakter" }); return
    }
    try {
      await resetMut.mutateAsync({ id: selectedUser.id, password: newPassword })
      modal.success({ title: "Password berhasil direset" })
      setDialogMode(null)
    } catch { modal.error({ title: "Gagal mereset password" }) }
  }

  const columns: ColumnDef<UserRecord>[] = [
    { accessorKey: "username", header: "Username", cell: ({ row }) => <span className="font-medium">{row.original.username}</span> },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <Badge variant={roleColors[row.original.role]}>{row.original.role}</Badge>,
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
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEdit(user)}>
                  <Pencil className="mr-2 h-4 w-4" />Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openResetPassword(user)}>
                  <Key className="mr-2 h-4 w-4" />Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleToggleActive(user)}>
                  <Power className="mr-2 h-4 w-4" />
                  {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola akun pengguna sistem</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah User</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Hak Akses Role</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <Badge className="mb-2">ADMIN</Badge>
              <p className="text-sm text-muted-foreground">Akses penuh: CRUD data, import/export, kelola user, lihat audit log</p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge variant="secondary" className="mb-2">EDITOR</Badge>
              <p className="text-sm text-muted-foreground">CRUD data perangkat, import/export, lihat laporan</p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge variant="outline" className="mb-2">VIEWER</Badge>
              <p className="text-sm text-muted-foreground">Hanya melihat data dan laporan, export Excel</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
          <CardDescription>Total {(users ?? []).filter((u: UserRecord) => u.isActive).length} user aktif</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={(users ?? []) as UserRecord[]}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogMode === "create"} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>Isi data user baru</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Username *</Label><Input value={createForm.username} onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} placeholder="Contoh: john.doe" /></div>
            <div><Label>Email *</Label><Input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="email@company.com" /></div>
            <div>
              <Label>Role</Label>
              <Select value={createForm.role} onValueChange={v => setCreateForm(f => ({ ...f, role: v as Role }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="EDITOR">EDITOR</SelectItem>
                  <SelectItem value="VIEWER">VIEWER</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Password * (min. 8 karakter)</Label><Input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Password awal" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={dialogMode === "edit"} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Ubah data user {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Username</Label><Input value={editForm.username} onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div>
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v as Role }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="EDITOR">EDITOR</SelectItem>
                  <SelectItem value="VIEWER">VIEWER</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
            <Button onClick={handleEdit} disabled={updateMut.isPending}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={dialogMode === "password"} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Reset password untuk {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Password Baru (min. 8 karakter)</Label>
            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password baru" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Batal</Button>
            <Button onClick={handleResetPassword} disabled={resetMut.isPending}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
