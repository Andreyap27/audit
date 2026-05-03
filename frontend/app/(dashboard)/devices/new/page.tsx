"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save } from "lucide-react";
import { useCreateDevice } from "@/hooks/use-devices";
import {
  useDepartments,
  useUnitTypes,
  useOperatingSystems,
  useMicrosoftSoftware,
} from "@/hooks/use-master";
import { EvidenceUploadField } from "@/components/devices/evidence-upload-field";
import { LicenseCombobox } from "@/components/devices/license-combobox";
import { useGlobalModal } from "@/lib/global-modal";

export default function NewDevicePage() {
  const router = useRouter();
  const [form, setForm] = useState({
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

  const { data: departments } = useDepartments();
  const { data: unitTypes } = useUnitTypes();
  const { data: osList } = useOperatingSystems();
  const { data: officeList } = useMicrosoftSoftware("OFFICE");
  const { data: visioList } = useMicrosoftSoftware("VISIO");
  const { data: projectList } = useMicrosoftSoftware("PROJECT");
  const { data: accessList } = useMicrosoftSoftware("ACCESS");
  const createMutation = useCreateDevice();
  const modal = useGlobalModal();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serialNumber || !form.departmentId || !form.unitTypeId) {
      modal.error({ title: "Serial Number, Departemen, dan Tipe Unit wajib diisi" });
      return;
    }
    if (!form.operatingSystemId || form.operatingSystemId === "none") {
      modal.error({ title: "Operating System wajib dipilih" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        serialNumber: form.serialNumber,
        userName: form.userName || undefined,
        departmentId: form.departmentId,
        unitTypeId: form.unitTypeId,
        operatingSystemId:
          form.operatingSystemId && form.operatingSystemId !== "none"
            ? form.operatingSystemId
            : undefined,
        officeId:
          form.officeId && form.officeId !== "none" ? form.officeId : undefined,
        visioId:
          form.visioId && form.visioId !== "none" ? form.visioId : undefined,
        projectId:
          form.projectId && form.projectId !== "none"
            ? form.projectId
            : undefined,
        accessId:
          form.accessId && form.accessId !== "none" ? form.accessId : undefined,
        serialNumberProofPath: form.serialNumberProofPath || undefined,
      });
      modal.success({ title: "Device berhasil ditambahkan" });
      router.push("/devices");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan device";
      modal.error({ title: msg });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/devices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Tambah Device Baru
          </h1>
          <p className="text-muted-foreground">
            Isi form untuk menambahkan perangkat baru
          </p>
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
                  placeholder="Contoh: SN-2024-001"
                  value={form.serialNumber}
                  onChange={(e) => set("serialNumber", e.target.value)}
                  required
                />
                <EvidenceUploadField
                  label="Serial Number"
                  value={form.serialNumberProofPath}
                  serialNumber={form.serialNumber}
                  onUploaded={(path) => set("serialNumberProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Nama User</FieldLabel>
                <Input
                  placeholder="Nama pengguna perangkat"
                  value={form.userName}
                  onChange={(e) => set("userName", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Departemen *</FieldLabel>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => set("departmentId", v)}
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
                <FieldLabel>Tipe Unit *</FieldLabel>
                <Select
                  value={form.unitTypeId}
                  onValueChange={(v) => set("unitTypeId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {(unitTypes ?? []).map(
                      (u: { id: string; code: string; name: string }) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name} ({u.code})
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
                  value={form.operatingSystemId}
                  onChange={(v) => set("operatingSystemId", v)}
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
                  value={form.officeId}
                  onChange={(v) => set("officeId", v)}
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
                  value={form.visioId}
                  onChange={(v) => set("visioId", v)}
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
                  value={form.projectId}
                  onChange={(v) => set("projectId", v)}
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
                  value={form.accessId}
                  onChange={(v) => set("accessId", v)}
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
          <Button type="submit" disabled={createMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending ? "Menyimpan..." : "Simpan Device"}
          </Button>
        </div>
      </form>
    </div>
  );
}
