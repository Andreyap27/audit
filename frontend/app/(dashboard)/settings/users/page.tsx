"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Pencil, Key, Power, Search } from "lucide-react"

const users = [
  { id: 1, name: "Admin IT", email: "admin@company.com", role: "Admin", active: true, lastLogin: "2024-01-15 14:32" },
  { id: 2, name: "John Doe", email: "john.doe@company.com", role: "Editor", active: true, lastLogin: "2024-01-15 14:28" },
  { id: 3, name: "Jane Smith", email: "jane.smith@company.com", role: "Editor", active: true, lastLogin: "2024-01-15 13:45" },
  { id: 4, name: "Bob Wilson", email: "bob.wilson@company.com", role: "Viewer", active: true, lastLogin: "2024-01-14 09:00" },
  { id: 5, name: "Alice Brown", email: "alice.brown@company.com", role: "Viewer", active: false, lastLogin: "2024-01-10 10:30" },
]

const roleColors: Record<string, "default" | "secondary" | "outline"> = {
  Admin: "default",
  Editor: "secondary",
  Viewer: "outline",
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola akun pengguna sistem</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Isi data user baru yang akan ditambahkan
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel>Nama</FieldLabel>
                <Input placeholder="Nama lengkap" />
              </Field>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" placeholder="email@company.com" />
              </Field>
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input type="password" placeholder="Password awal" />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Hak Akses Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <Badge className="mb-2">Admin</Badge>
              <p className="text-sm text-muted-foreground">
                Akses penuh: CRUD data, import/export, kelola user, lihat audit log
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge variant="secondary" className="mb-2">Editor</Badge>
              <p className="text-sm text-muted-foreground">
                CRUD data perangkat, import/export, lihat laporan
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <Badge variant="outline" className="mb-2">Viewer</Badge>
              <p className="text-sm text-muted-foreground">
                Hanya melihat data dan laporan, export Excel
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
          <CardDescription>
            Total {users.filter((u) => u.active).length} user aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Login Terakhir</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={roleColors[user.role]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={user.active ? "default" : "secondary"}>
                      {user.active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Key className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Power className="mr-2 h-4 w-4" />
                          {user.active ? "Nonaktifkan" : "Aktifkan"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
