"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useDevice, useUpdateDevice, useDeleteDevice } from "@/hooks/use-devices"
import { useDepartments, useUnitTypes, useOperatingSystems, useMicrosoftSoftware } from "@/hooks/use-master"

export default function EditDevicePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: device, isLoading } = useDevice(id)
  const { data: departments } = useDepartments()
  const { data: unitTypes } = useUnitTypes()
  const { data: osList } = useOperatingSystems()
  const { data: officeList } = useMicrosoftSoftware("OFFICE")
  const { data: visioList } = useMicrosoftSoftware("VISIO")
  const { data: projectList } = useMicrosoftSoftware("PROJECT")
  const { data: accessList } = useMicrosoftSoftware("ACCESS")
  const updateMutation = useUpdateDevice(id)
  const deleteMutation = useDeleteDevice()

  const [form, setForm] = useState({
    serialNo: "",
    userFullName: "",
    departmentId: "",
    unitTypeId: "",
    operatingSystemId: "",
    osProductKey: "",
    officeId: "",
    visioId: "",
    projectId: "",
    accessId: "",
  })

  useEffect(() => {
    if (device) {
      setForm({
        serialNo: device.serialNo ?? "",
        userFullName: device.userFullName ?? "",
        departmentId: device.departmentId ? String(device.departmentId) : "",
        unitTypeId: device.unitTypeId ? String(device.unitTypeId) : "",
        operatingSystemId: device.operatingSystemId ? String(device.operatingSystemId) : "",
        osProductKey: device.osProductKey ?? "",
        officeId: device.officeId ? String(device.officeId) : "",
        visioId: device.visioId ? String(device.visioId) : "",
        projectId: device.projectId ? String(device.projectId) : "",
        accessId: device.accessId ? String(device.accessId) : "",
      })
    }
  }, [device])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({
        serialNo: form.serialNo,
        userFullName: form.userFullName || undefined,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        unitTypeId: form.unitTypeId ? Number(form.unitTypeId) : undefined,
        operatingSystemId: form.operatingSystemId && form.operatingSystemId !== "none" ? Number(form.operatingSystemId) : null,
        osProductKey: form.osProductKey || undefined,
        officeId: form.officeId && form.officeId !== "none" ? Number(form.officeId) : null,
        visioId: form.visioId && form.visioId !== "none" ? Number(form.visioId) : null,
        projectId: form.projectId && form.projectId !== "none" ? Number(form.projectId) : null,
        accessId: form.accessId && form.accessId !== "none" ? Number(form.accessId) : null,
      })
      toast.success("Device berhasil diperbarui")
      router.push("/devices")
    } catch {
      toast.error("Gagal memperbarui device")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus device ini?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Device berhasil dihapus")
      router.push("/devices")
    } catch {
      toast.error("Gagal menghapus device")
    }
  }

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-48 w-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/devices"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Device</h1>
            <p className="text-muted-foreground">{form.serialNo}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus Device
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Perangkat</CardTitle>
            <CardDescription>Data dasar perangkat IT</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Serial Number *</FieldLabel>
                <Input value={form.serialNo} onChange={e => set("serialNo", e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel>Nama User</FieldLabel>
                <Input value={form.userFullName} onChange={e => set("userFullName", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>Departemen</FieldLabel>
                <Select value={form.departmentId} onValueChange={v => set("departmentId", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih departemen" /></SelectTrigger>
                  <SelectContent>
                    {(departments ?? []).map((d: { id: string; name: string }) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tipe Unit</FieldLabel>
                <Select value={form.unitTypeId} onValueChange={v => set("unitTypeId", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih tipe unit" /></SelectTrigger>
                  <SelectContent>
                    {(unitTypes ?? []).map((u: { id: string; name: string }) => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating System</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Versi OS</FieldLabel>
                <Select value={form.operatingSystemId || "none"} onValueChange={v => set("operatingSystemId", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih versi OS" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(osList ?? []).map((os: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={os.id} value={String(os.id)}>Windows {os.version} {os.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Product Key OS</FieldLabel>
                <Input value={form.osProductKey} onChange={e => set("osProductKey", e.target.value)} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Microsoft Software</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Microsoft Office</FieldLabel>
                <Select value={form.officeId || "none"} onValueChange={v => set("officeId", v)}>
                  <SelectTrigger><SelectValue placeholder="Office" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(officeList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={String(o.id)}>Office {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Microsoft Visio</FieldLabel>
                <Select value={form.visioId || "none"} onValueChange={v => set("visioId", v)}>
                  <SelectTrigger><SelectValue placeholder="Visio" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(visioList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={String(o.id)}>Visio {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Microsoft Project</FieldLabel>
                <Select value={form.projectId || "none"} onValueChange={v => set("projectId", v)}>
                  <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(projectList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={String(o.id)}>Project {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Microsoft Access</FieldLabel>
                <Select value={form.accessId || "none"} onValueChange={v => set("accessId", v)}>
                  <SelectTrigger><SelectValue placeholder="Access" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(accessList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={String(o.id)}>Access {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild><Link href="/devices">Batal</Link></Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  )
}