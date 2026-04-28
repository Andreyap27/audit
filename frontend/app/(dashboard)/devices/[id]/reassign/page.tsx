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
import { EvidenceUploadField } from "@/components/devices/evidence-upload-field";
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
    operatingSystemProofPath: "",
    officeProofPath: "",
    visioProofPath: "",
    projectProofPath: "",
    accessProofPath: "",
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
      operatingSystemProofPath: device.operatingSystemProofPath ?? "",
      officeProofPath: device.officeProofPath ?? "",
      visioProofPath: device.visioProofPath ?? "",
      projectProofPath: device.projectProofPath ?? "",
      accessProofPath: device.accessProofPath ?? "",
    }));
  }, [device]);

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userName) {
      modal.error({ title: "Nama user baru wajib diisi" });
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
        operatingSystemProofPath: form.operatingSystemProofPath || null,
        officeProofPath: form.officeProofPath || null,
        visioProofPath: form.visioProofPath || null,
        projectProofPath: form.projectProofPath || null,
        accessProofPath: form.accessProofPath || null,
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
      {/* Header */}
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
        {/* Informasi User Baru */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi User Baru</CardTitle>
            <CardDescription>
              Saat alih user, data OS dan software wajib diisi ulang.
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

        {/* Operating System */}
        <Card>
          <CardHeader>
            <CardTitle>Operating System</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Versi OS</FieldLabel>
                <Select
                  value={form.operatingSystemId}
                  onValueChange={(v) => set("operatingSystemId", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(osList ?? []).map((os: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={os.id} value={os.id}>
                        Windows {os.version} {os.licenseType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Operating System"
                  value={form.operatingSystemProofPath}
                  serialNumber={serialNumber}
                  onUploaded={(path) => set("operatingSystemProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Microsoft Software */}
        <Card>
          <CardHeader>
            <CardTitle>Microsoft Software</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>Microsoft Office</FieldLabel>
                <Select value={form.officeId} onValueChange={(v) => set("officeId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(officeList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={o.id}>Office {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Office"
                  value={form.officeProofPath}
                  serialNumber={serialNumber}
                  onUploaded={(path) => set("officeProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Visio</FieldLabel>
                <Select value={form.visioId} onValueChange={(v) => set("visioId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(visioList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={o.id}>Visio {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Visio"
                  value={form.visioProofPath}
                  serialNumber={serialNumber}
                  onUploaded={(path) => set("visioProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Project</FieldLabel>
                <Select value={form.projectId} onValueChange={(v) => set("projectId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(projectList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={o.id}>Project {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Project"
                  value={form.projectProofPath}
                  serialNumber={serialNumber}
                  onUploaded={(path) => set("projectProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
                />
              </Field>
              <Field>
                <FieldLabel>Microsoft Access</FieldLabel>
                <Select value={form.accessId} onValueChange={(v) => set("accessId", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {(accessList ?? []).map((o: { id: string; version: string; licenseType: string }) => (
                      <SelectItem key={o.id} value={o.id}>Access {o.version} {o.licenseType}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <EvidenceUploadField
                  label="Microsoft Access"
                  value={form.accessProofPath}
                  serialNumber={serialNumber}
                  onUploaded={(path) => set("accessProofPath", path)}
                  onError={(message) => modal.error({ title: message })}
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
