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
  operatingSystemProofPath: string;
  officeProofPath: string;
  visioProofPath: string;
  projectProofPath: string;
  accessProofPath: string;
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
    operatingSystemProofPath: "",
    officeProofPath: "",
    visioProofPath: "",
    projectProofPath: "",
    accessProofPath: "",
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
      operatingSystemProofPath: device.operatingSystemProofPath ?? "",
      officeProofPath: device.officeProofPath ?? "",
      visioProofPath: device.visioProofPath ?? "",
      projectProofPath: device.projectProofPath ?? "",
      accessProofPath: device.accessProofPath ?? "",
    });
  }, [device]);

  const setFormField = (k: keyof DeviceFormState, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // "" = not yet loaded (skip), "none" = explicitly cleared (null), uuid = set
  const normalizeId = (value: string): string | null | undefined => {
    if (!value || value === "") return undefined;
    if (value === "none") return null;
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        operatingSystemProofPath: form.operatingSystemProofPath || undefined,
        officeProofPath: form.officeProofPath || undefined,
        visioProofPath: form.visioProofPath || undefined,
        projectProofPath: form.projectProofPath || undefined,
        accessProofPath: form.accessProofPath || undefined,
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
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Versi OS</FieldLabel>
                <Select
                  value={form.operatingSystemId || "none"}
                  onValueChange={(v) => setFormField("operatingSystemId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih versi OS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(osList ?? []).map(
                      (os: {
                        id: string;
                        version: string;
                        licenseType: string;
                      }) => (
                        <SelectItem key={os.id} value={String(os.id)}>
                          Windows {os.version} {os.licenseType}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Operating System"
                  value={form.operatingSystemProofPath}
                  serialNumber={form.serialNumber}
                  onUploaded={(path) =>
                    setFormField("operatingSystemProofPath", path)
                  }
                  onError={(message) => modal.error({ title: message })}
                />
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
                <Select
                  value={form.officeId || "none"}
                  onValueChange={(v) => setFormField("officeId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Office" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(officeList ?? []).map(
                      (o: {
                        id: string;
                        version: string;
                        licenseType: string;
                      }) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          Office {o.version} {o.licenseType}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Office"
                  value={form.officeProofPath}
                  serialNumber={form.serialNumber}
                  onUploaded={(path) => setFormField("officeProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Visio</FieldLabel>
                <Select
                  value={form.visioId || "none"}
                  onValueChange={(v) => setFormField("visioId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Visio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(visioList ?? []).map(
                      (o: {
                        id: string;
                        version: string;
                        licenseType: string;
                      }) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          Visio {o.version} {o.licenseType}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Visio"
                  value={form.visioProofPath}
                  serialNumber={form.serialNumber}
                  onUploaded={(path) => setFormField("visioProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Project</FieldLabel>
                <Select
                  value={form.projectId || "none"}
                  onValueChange={(v) => setFormField("projectId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(projectList ?? []).map(
                      (o: {
                        id: string;
                        version: string;
                        licenseType: string;
                      }) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          Project {o.version} {o.licenseType}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Project"
                  value={form.projectProofPath}
                  serialNumber={form.serialNumber}
                  onUploaded={(path) => setFormField("projectProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Access</FieldLabel>
                <Select
                  value={form.accessId || "none"}
                  onValueChange={(v) => setFormField("accessId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(accessList ?? []).map(
                      (o: {
                        id: string;
                        version: string;
                        licenseType: string;
                      }) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                          Access {o.version} {o.licenseType}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Access"
                  value={form.accessProofPath}
                  serialNumber={form.serialNumber}
                  onUploaded={(path) => setFormField("accessProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
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
