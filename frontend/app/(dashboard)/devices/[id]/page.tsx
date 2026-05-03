"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Save, Trash2, Shuffle, History } from "lucide-react";
import {
  useDevice,
  useUpdateDevice,
  useDeleteDevice,
  useDeviceHistory,
} from "@/hooks/use-devices";
import {
  useDepartments,
  useUnitTypes,
  useOperatingSystems,
  useMicrosoftSoftware,
} from "@/hooks/use-master";
import { EvidenceUploadField } from "@/components/devices/evidence-upload-field";
import { LicenseCombobox } from "@/components/devices/license-combobox";
import { useGlobalModal } from "@/lib/global-modal";

type DeviceFormState = {
  serialNumber: string;
  userName: string;
  departmentId: string;
  unitTypeId: string;
  operatingSystemId: string;
  officeId: string;
  visioId: string;
  projectId: string;
  accessId: string;
  serialNumberProofPath: string;
};

export default function EditDevicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const modal = useGlobalModal();

  const { data: device, isLoading } = useDevice(id);
  const { data: history } = useDeviceHistory(id);
  const { data: departments } = useDepartments();
  const { data: unitTypes } = useUnitTypes();
  const { data: osList } = useOperatingSystems();
  const { data: officeList } = useMicrosoftSoftware("OFFICE");
  const { data: visioList } = useMicrosoftSoftware("VISIO");
  const { data: projectList } = useMicrosoftSoftware("PROJECT");
  const { data: accessList } = useMicrosoftSoftware("ACCESS");

  const updateMutation = useUpdateDevice(id);
  const deleteMutation = useDeleteDevice();

  const [showHistory, setShowHistory] = useState(false);

  const [form, setForm] = useState<DeviceFormState>({
    serialNumber: "",
    userName: "",
    departmentId: "",
    unitTypeId: "",
    operatingSystemId: "",
    officeId: "",
    visioId: "",
    projectId: "",
    accessId: "",
    serialNumberProofPath: "",
  });

  useEffect(() => {
    if (!device) return;
    setForm({
      serialNumber: device.serialNumber ?? "",
      userName: device.userName ?? "",
      departmentId: device.departmentId ?? "",
      unitTypeId: device.unitTypeId ?? "",
      operatingSystemId: device.operatingSystemId ?? "none",
      officeId: device.officeId ?? "none",
      visioId: device.visioId ?? "none",
      projectId: device.projectId ?? "none",
      accessId: device.accessId ?? "none",
      serialNumberProofPath: device.serialNumberProofPath ?? "",
    });
  }, [device]);

  const setFormField = (k: keyof DeviceFormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const normalizeId = (value: string): string | null | undefined => {
    if (!value || value === "") return undefined;
    if (value === "none") return null;
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.operatingSystemId || form.operatingSystemId === "none") {
      modal.error({ title: "Operating System wajib dipilih" });
      return;
    }
    try {
      await updateMutation.mutateAsync({
        serialNumber: form.serialNumber,
        userName: form.userName || undefined,
        departmentId: form.departmentId || undefined,
        unitTypeId: form.unitTypeId || undefined,
        operatingSystemId: normalizeId(form.operatingSystemId),
        officeId: normalizeId(form.officeId),
        visioId: normalizeId(form.visioId),
        projectId: normalizeId(form.projectId),
        accessId: normalizeId(form.accessId),
        serialNumberProofPath: form.serialNumberProofPath || undefined,
      });
      modal.success({ title: "Device berhasil diperbarui" });
    } catch {
      modal.error({ title: "Gagal memperbarui device" });
    }
  };

  const handleDelete = async () => {
    const ok = await modal.confirm({
      title: "Yakin ingin menghapus device ini?",
      description: "Tindakan ini tidak bisa dibatalkan.",
      confirmText: "Hapus",
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
      modal.success({ title: "Device berhasil dihapus" });
      router.push("/devices");
    } catch {
      modal.error({ title: "Gagal menghapus device" });
    }
  };

  if (isLoading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/devices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Device</h1>
            <p className="text-muted-foreground">{form.serialNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/devices/${id}/reassign`}>
              <Shuffle className="mr-2 h-4 w-4" />
              Alihkan User
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="mr-2 h-4 w-4" />
            History User
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDelete()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Device
          </Button>
        </div>
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
                <Input
                  value={form.serialNumber}
                  onChange={(e) => setFormField("serialNumber", e.target.value)}
                  required
                />
                <EvidenceUploadField
                  label="Serial Number"
                  value={form.serialNumberProofPath}
                  serialNumber={form.serialNumber}
                  onUploaded={(path) =>
                    setFormField("serialNumberProofPath", path)
                  }
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Nama User</FieldLabel>
                <Input
                  value={form.userName}
                  onChange={(e) => setFormField("userName", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Departemen</FieldLabel>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => setFormField("departmentId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {(departments ?? []).map(
                      (d: { id: string; name: string }) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tipe Unit</FieldLabel>
                <Select
                  value={form.unitTypeId}
                  onValueChange={(v) => setFormField("unitTypeId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {(unitTypes ?? []).map(
                      (u: { id: string; name: string; slug?: string }) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                          {u.slug ? ` (${u.slug})` : ""}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating System</CardTitle>
            <CardDescription>
              Pilih lisensi OS dari master data. Bukti lisensi dikelola di Master OS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Versi OS *</FieldLabel>
                <LicenseCombobox
                  options={(osList ?? []).map((os: { id: string; version: string; licenseType: string; serialNumber?: string | null }) => ({
                    id: os.id,
                    label: `${os.version} ${os.licenseType}`,
                    serialNumber: os.serialNumber,
                  }))}
                  value={form.operatingSystemId || "none"}
                  onChange={(v) => setFormField("operatingSystemId", v)}
                  placeholder="Cari versi OS atau serial number..."
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Microsoft Software</CardTitle>
            <CardDescription>
              Pilih lisensi dari master data. Bukti lisensi dikelola di Master Microsoft.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Microsoft Office</FieldLabel>
                <LicenseCombobox
                  options={(officeList ?? []).map((o: { id: string; version: string; licenseType: string; serialNumber?: string | null }) => ({
                    id: o.id,
                    label: `Office ${o.version} ${o.licenseType}`,
                    serialNumber: o.serialNumber,
                  }))}
                  value={form.officeId || "none"}
                  onChange={(v) => setFormField("officeId", v)}
                  placeholder="Cari Office atau serial number..."
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Visio</FieldLabel>
                <LicenseCombobox
                  options={(visioList ?? []).map((o: { id: string; version: string; licenseType: string; serialNumber?: string | null }) => ({
                    id: o.id,
                    label: `Visio ${o.version} ${o.licenseType}`,
                    serialNumber: o.serialNumber,
                  }))}
                  value={form.visioId || "none"}
                  onChange={(v) => setFormField("visioId", v)}
                  placeholder="Cari Visio atau serial number..."
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Project</FieldLabel>
                <LicenseCombobox
                  options={(projectList ?? []).map((o: { id: string; version: string; licenseType: string; serialNumber?: string | null }) => ({
                    id: o.id,
                    label: `Project ${o.version} ${o.licenseType}`,
                    serialNumber: o.serialNumber,
                  }))}
                  value={form.projectId || "none"}
                  onChange={(v) => setFormField("projectId", v)}
                  placeholder="Cari Project atau serial number..."
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Access</FieldLabel>
                <LicenseCombobox
                  options={(accessList ?? []).map((o: { id: string; version: string; licenseType: string; serialNumber?: string | null }) => ({
                    id: o.id,
                    label: `Access ${o.version} ${o.licenseType}`,
                    serialNumber: o.serialNumber,
                  }))}
                  value={form.accessId || "none"}
                  onChange={(v) => setFormField("accessId", v)}
                  placeholder="Cari Access atau serial number..."
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/devices">Batal</Link>
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>History Pengguna Perangkat</DialogTitle>
            <DialogDescription>
              Riwayat user yang pernah menggunakan perangkat ini beserta
              OS/software saat itu.
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Departemen</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Office</TableHead>
                <TableHead>Visio</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Periode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(history ?? []).map(
                (item: {
                  id: string;
                  userName: string | null;
                  departmentCode: string | null;
                  unitTypeCode: string | null;
                  operatingSystemLabel: string | null;
                  officeLabel: string | null;
                  visioLabel: string | null;
                  projectLabel: string | null;
                  accessLabel: string | null;
                  assignedAt: string;
                  endedAt: string | null;
                }) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.userName ?? "-"}</TableCell>
                    <TableCell>{item.departmentCode ?? "-"}</TableCell>
                    <TableCell>{item.unitTypeCode ?? "-"}</TableCell>
                    <TableCell>{item.operatingSystemLabel ?? "-"}</TableCell>
                    <TableCell>{item.officeLabel ?? "-"}</TableCell>
                    <TableCell>{item.visioLabel ?? "-"}</TableCell>
                    <TableCell>{item.projectLabel ?? "-"}</TableCell>
                    <TableCell>{item.accessLabel ?? "-"}</TableCell>
                    <TableCell>
                      {new Date(item.assignedAt).toLocaleDateString("id-ID")} -{" "}
                      {item.endedAt
                        ? new Date(item.endedAt).toLocaleDateString("id-ID")
                        : "Sekarang"}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
