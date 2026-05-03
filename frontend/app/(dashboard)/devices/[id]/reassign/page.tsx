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
import { ArrowLeft, Shuffle } from "lucide-react";
import { useDevice, useReassignDevice } from "@/hooks/use-devices";
import {
  useDepartments,
  useUnitTypes,
  useOperatingSystems,
  useMicrosoftSoftware,
} from "@/hooks/use-master";
import { LicenseCombobox } from "@/components/devices/license-combobox";
import { useGlobalModal } from "@/lib/global-modal";

const normalizeId = (value: string): string | null | undefined => {
  if (!value || value === "") return undefined;
  if (value === "none") return null;
  return value;
};

export default function ReassignDevicePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const modal = useGlobalModal();

  const { data: device, isLoading } = useDevice(id);
  const { data: departments } = useDepartments();
  const { data: unitTypes } = useUnitTypes();
  const { data: osList } = useOperatingSystems();
  const { data: officeList } = useMicrosoftSoftware("OFFICE");
  const { data: visioList } = useMicrosoftSoftware("VISIO");
  const { data: projectList } = useMicrosoftSoftware("PROJECT");
  const { data: accessList } = useMicrosoftSoftware("ACCESS");
  const reassignMutation = useReassignDevice(id);

  const [form, setForm] = useState({
    userName: "",
    departmentId: "",
    unitTypeId: "",
    operatingSystemId: "none",
    officeId: "none",
    visioId: "none",
    projectId: "none",
    accessId: "none",
    reassignmentNote: "",
  });

  useEffect(() => {
    if (!device) return;
    setForm((prev) => ({
      ...prev,
      userName: device.userName ?? "",
      departmentId: device.departmentId ?? "",
      unitTypeId: device.unitTypeId ?? "",
      operatingSystemId: device.operatingSystemId ?? "none",
      officeId: device.officeId ?? "none",
      visioId: device.visioId ?? "none",
      projectId: device.projectId ?? "none",
      accessId: device.accessId ?? "none",
    }));
  }, [device]);

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userName) {
      modal.error({ title: "Nama user baru wajib diisi" });
      return;
    }
    if (!form.operatingSystemId || form.operatingSystemId === "none") {
      modal.error({ title: "Operating System wajib dipilih" });
      return;
    }
    try {
      await reassignMutation.mutateAsync({
        userName: form.userName,
        departmentId: form.departmentId || undefined,
        unitTypeId: form.unitTypeId || undefined,
        operatingSystemId: normalizeId(form.operatingSystemId),
        officeId: normalizeId(form.officeId),
        visioId: normalizeId(form.visioId),
        projectId: normalizeId(form.projectId),
        accessId: normalizeId(form.accessId),
        serialNumberProofPath: device?.serialNumberProofPath ?? null,
        reassignmentNote: form.reassignmentNote || undefined,
      });
      modal.success({
        title: "Perangkat berhasil dialihkan",
        description: "History assignment sudah tercatat.",
      });
      router.push(`/devices/${id}`);
    } catch {
      modal.error({ title: "Gagal mengalihkan perangkat" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const serialNumber = device?.serialNumber ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/devices/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alihkan Perangkat</h1>
          <p className="text-muted-foreground">{serialNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi User Baru</CardTitle>
            <CardDescription>
              Saat alih user, pilih OS dan software untuk user baru.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Nama User Baru *</FieldLabel>
                <Input
                  placeholder="Nama pengguna baru"
                  value={form.userName}
                  onChange={(e) => set("userName", e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Catatan Perpindahan</FieldLabel>
                <Input
                  placeholder="Contoh: user resign"
                  value={form.reassignmentNote}
                  onChange={(e) => set("reassignmentNote", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Departemen</FieldLabel>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => set("departmentId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {(departments ?? []).map((d: { id: string; name: string }) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tipe Unit</FieldLabel>
                <Select
                  value={form.unitTypeId}
                  onValueChange={(v) => set("unitTypeId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {(unitTypes ?? []).map((u: { id: string; name: string }) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
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
            <Link href={`/devices/${id}`}>Batal</Link>
          </Button>
          <Button type="submit" disabled={reassignMutation.isPending}>
            <Shuffle className="mr-2 h-4 w-4" />
            {reassignMutation.isPending ? "Menyimpan..." : "Simpan Alih User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
