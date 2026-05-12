"use client";

import { useState, useEffect, useRef } from "react";
import type { ColumnDef } from "@tanstack/react-table";
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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Checkbox } from "@/components/ui/checkbox";
import Barcode from "react-barcode";
import {
  Plus,
  Download,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  QrCode,
  FileQuestion,
  CheckCircle2,
  XCircle,
  PackageX,
} from "lucide-react";
import { useDevices, useDeleteDevice, useReturnDeviceToGA } from "@/hooks/use-devices";
import {
  useDepartments,
  useUnitTypes,
  useOperatingSystems,
  useMicrosoftSoftware,
} from "@/hooks/use-master";
import { useExportExcel } from "@/hooks/use-import-export";
import { useGlobalModal } from "@/lib/global-modal";

const PAGE_SIZE = 20;
const FILE_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

type DeviceRow = {
  id: string;
  serialNumber: string;
  userName: string | null;
  category: "COMPUTER" | "HARDWARE";
  canBeLent: boolean;
  department: { code: string } | null;
  unitType: { name: string } | null;
  operatingSystem: { version: string; licenseType: string; proofPaths?: string[] } | null;
  office: { version: string; licenseType: string; proofPaths?: string[] } | null;
  visio: { version: string; proofPaths?: string[] } | null;
  project: { version: string; proofPaths?: string[] } | null;
  access: { version: string; proofPaths?: string[] } | null;
  serialNumberProofPaths?: string[];
  hardwareImagePaths?: string[];
  notes?: string | null;
};

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function DevicesPage() {
  const [activeTab, setActiveTab] = useState<"COMPUTER" | "HARDWARE">("COMPUTER");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [osFilter, setOsFilter] = useState("all");
  const [officeFilter, setOfficeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<{ title: string; paths: string[]; idx: number } | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [returnToGATarget, setReturnToGATarget] = useState<{ id: string; serialNumber: string } | null>(null);
  const [returnToGANote, setReturnToGANote] = useState("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportAll, setExportAll] = useState(true);
  const [exportDeptIds, setExportDeptIds] = useState<string[]>([]);
  const modal = useGlobalModal();

  const currentPath = preview && preview.paths.length > 0 ? preview.paths[preview.idx] : null;

  useEffect(() => {
    if (!currentPath || /\.(png|jpg|jpeg|gif|webp)$/i.test(currentPath)) {
      setPreviewText(null);
      return;
    }
    setPreviewText(null);
    fetch(`${FILE_BASE_URL}${currentPath}`)
      .then((r) => r.text())
      .then(setPreviewText)
      .catch(() => setPreviewText("Gagal memuat konten file."));
  }, [currentPath]);

  const lastKeyTimeRef = useRef(0);
  const isScanningRef = useRef(false);
  const pendingFirstCharRef = useRef("");
  const scanBufferRef = useRef("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      isScanningRef.current = false;
      pendingFirstCharRef.current = "";
      scanBufferRef.current = "";
      return;
    }
    if (e.key.length !== 1) return;

    const now = Date.now();
    const gap = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    if (isScanningRef.current) {
      e.preventDefault();
      scanBufferRef.current += e.key;
      setSearch(scanBufferRef.current);
      resetPage();
      return;
    }

    if (gap < 50 && pendingFirstCharRef.current) {
      isScanningRef.current = true;
      scanBufferRef.current = pendingFirstCharRef.current + e.key;
      pendingFirstCharRef.current = "";
      e.preventDefault();
      setSearch(scanBufferRef.current);
      resetPage();
      return;
    }

    pendingFirstCharRef.current = gap > 300 ? e.key : "";
  };

  const resetFilters = () => {
    setSearch("");
    setDeptFilter("all");
    setUnitFilter("all");
    setOsFilter("all");
    setOfficeFilter("all");
    setPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "COMPUTER" | "HARDWARE");
    resetFilters();
  };

  const isAnyFilter =
    search !== "" ||
    deptFilter !== "all" ||
    unitFilter !== "all" ||
    osFilter !== "all" ||
    officeFilter !== "all";

  const filters = {
    category: activeTab,
    search: search || undefined,
    departmentId: deptFilter !== "all" ? deptFilter : undefined,
    unitTypeId: unitFilter !== "all" && activeTab === "COMPUTER" ? unitFilter : undefined,
    operatingSystemId: osFilter !== "all" && activeTab === "COMPUTER" ? osFilter : undefined,
    officeId: officeFilter !== "all" && activeTab === "COMPUTER" ? officeFilter : undefined,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading } = useDevices(filters);
  const { data: departments } = useDepartments();
  const { data: unitTypes } = useUnitTypes();
  const { data: osList } = useOperatingSystems();
  const { data: officeList } = useMicrosoftSoftware("OFFICE");
  const deleteMutation = useDeleteDevice();
  const returnToGAMutation = useReturnDeviceToGA();
  const exportMutation = useExportExcel();

  const devices = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const uniqueOsList = (osList ?? []).filter(
    (o: { id: string; version: string; licenseType: string }, idx: number, arr: { version: string; licenseType: string }[]) =>
      arr.findIndex((x) => x.version === o.version && x.licenseType === o.licenseType) === idx,
  );
  const uniqueOfficeList = (officeList ?? []).filter(
    (o: { id: string; version: string; licenseType: string }, idx: number, arr: { version: string; licenseType: string }[]) =>
      arr.findIndex((x) => x.version === o.version && x.licenseType === o.licenseType) === idx,
  );

  const resetPage = () => setPage(1);

  const handleDelete = async (id: string) => {
    const ok = await modal.confirm({
      title: "Hapus Perangkat?",
      description: "Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Hapus",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
      modal.success({ title: "Device berhasil dihapus" });
    } catch {
      modal.error({ title: "Gagal menghapus device" });
    }
  };

  const handleReturnToGA = async () => {
    if (!returnToGATarget) return;
    if (!returnToGANote.trim()) {
      modal.error({ title: "Catatan wajib diisi sebelum dikembalikan ke GA" });
      return;
    }
    try {
      await returnToGAMutation.mutateAsync({ id: returnToGATarget.id, note: returnToGANote.trim() });
      modal.success({ title: "Perangkat berhasil dikembalikan ke GA" });
      setReturnToGATarget(null);
      setReturnToGANote("");
    } catch {
      modal.error({ title: "Gagal mengembalikan perangkat ke GA" });
    }
  };

  const openExportDialog = () => {
    setExportAll(true);
    setExportDeptIds([]);
    setExportDialogOpen(true);
  };

  const toggleExportDept = (id: string) => {
    setExportAll(false);
    setExportDeptIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleExport = () => {
    const ids = exportAll ? undefined : exportDeptIds;
    exportMutation.mutate(ids, {
      onSuccess: () => {
        modal.success({ title: "File Excel berhasil diunduh" });
        setExportDialogOpen(false);
      },
      onError: () => modal.error({ title: "Gagal export Excel" }),
    });
  };

  const renderProofText = (
    label: string,
    value: string,
    paths: string[],
    alwaysClickable = false,
  ) => {
    if (paths.length === 0 && !alwaysClickable) return <span>{value}</span>;
    return (
      <button
        type="button"
        className="text-left underline underline-offset-2 hover:text-primary"
        onClick={() => setPreview({ title: label, paths, idx: 0 })}
      >
        {value}
      </button>
    );
  };

  const computerColumns: ColumnDef<DeviceRow>[] = [
    {
      id: "barcode",
      header: "Barcode",
      size: 120,
      cell: ({ row }) => (
        <div className="w-[110px]">
          <Barcode
            value={row.original.serialNumber || " "}
            width={0.9}
            height={30}
            fontSize={0}
            margin={0}
            displayValue={false}
          />
        </div>
      ),
    },
    {
      accessorKey: "serialNumber",
      header: "Serial No",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary" asChild>
            <Link href={`/devices/${row.original.id}/barcode`}>
              <QrCode className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-medium">
            {renderProofText(
              "Bukti Serial Number",
              row.original.serialNumber,
              row.original.serialNumberProofPaths ?? [],
              true,
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => row.original.userName ?? "-",
    },
    {
      id: "dept",
      header: "Dept",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.department?.code ?? "-"}</Badge>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant={row.original.unitType?.name === "NB" ? "default" : "secondary"}>
          {row.original.unitType?.name ?? "-"}
        </Badge>
      ),
    },
    {
      id: "canBeLent",
      header: "Dipinjam",
      cell: ({ row }) =>
        row.original.canBeLent ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        ),
    },
    {
      id: "os",
      header: "OS",
      cell: ({ row }) => {
        const os = row.original.operatingSystem;
        if (!os) return <span>-</span>;
        return renderProofText("Bukti Operating System", `${os.version} ${os.licenseType}`, os.proofPaths ?? []);
      },
    },
    {
      id: "office",
      header: "Office",
      cell: ({ row }) => {
        const office = row.original.office;
        if (!office) return <span>-</span>;
        return renderProofText("Bukti Microsoft Office", `Office ${office.version} ${office.licenseType}`, office.proofPaths ?? []);
      },
    },
    {
      id: "visio",
      header: "Visio",
      cell: ({ row }) => {
        const visio = row.original.visio;
        if (!visio) return <span>-</span>;
        return renderProofText("Bukti Microsoft Visio", `Visio ${visio.version}`, visio.proofPaths ?? []);
      },
    },
    {
      id: "project",
      header: "Project",
      cell: ({ row }) => {
        const project = row.original.project;
        if (!project) return <span>-</span>;
        return renderProofText("Bukti Microsoft Project", `Project ${project.version}`, project.proofPaths ?? []);
      },
    },
    {
      id: "access",
      header: "Access",
      cell: ({ row }) => {
        const access = row.original.access;
        if (!access) return <span>-</span>;
        return renderProofText("Bukti Microsoft Access", `Access ${access.version}`, access.proofPaths ?? []);
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/devices/${row.original.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Kembalikan ke GA"
            onClick={() => { setReturnToGANote(""); setReturnToGATarget({ id: row.original.id, serialNumber: row.original.serialNumber }); }}
          >
            <PackageX className="h-4 w-4 text-amber-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const hardwareColumns: ColumnDef<DeviceRow>[] = [
    {
      id: "barcode",
      header: "Barcode",
      size: 120,
      cell: ({ row }) => (
        <div className="w-[110px]">
          <Barcode
            value={row.original.serialNumber || " "}
            width={0.9}
            height={30}
            fontSize={0}
            margin={0}
            displayValue={false}
          />
        </div>
      ),
    },
    {
      accessorKey: "serialNumber",
      header: "Serial No",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary" asChild>
            <Link href={`/devices/${row.original.id}/barcode`}>
              <QrCode className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-medium">
            {renderProofText(
              "Bukti Serial Number",
              row.original.serialNumber,
              row.original.serialNumberProofPaths ?? [],
              true,
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "assetCode",
      header: "Asset Code",
      cell: ({ row }) => (row.original as DeviceRow & { assetCode?: string }).assetCode ?? "-",
    },
    {
      id: "dept",
      header: "Dept",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.department?.code ?? "-"}</Badge>
      ),
    },
    {
      accessorKey: "notes",
      header: "Keterangan",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.notes ?? "-"}</span>
      ),
    },
    {
      id: "hardware-images",
      header: "Foto",
      cell: ({ row }) => {
        const imgs = row.original.hardwareImagePaths ?? [];
        if (imgs.length === 0) return <span className="text-xs text-muted-foreground">-</span>;
        const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(/\/api\/?$/, "");
        return (
          <div className="flex items-center gap-1">
            {imgs.slice(0, 3).map((p, i) => (
              <a key={i} href={`${apiBase}${p}`} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${apiBase}${p}`}
                  alt={`foto-${i + 1}`}
                  className="h-8 w-8 rounded object-cover border hover:opacity-80 transition-opacity"
                />
              </a>
            ))}
            {imgs.length > 3 && (
              <span className="text-xs text-muted-foreground">+{imgs.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/devices/${row.original.id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Kembalikan ke GA"
            onClick={() => { setReturnToGANote(""); setReturnToGATarget({ id: row.original.id, serialNumber: row.original.serialNumber }); }}
          >
            <PackageX className="h-4 w-4 text-amber-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void handleDelete(row.original.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const paginationFooter = !isLoading && total > 0 && (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
      <span className="text-xs font-medium text-muted-foreground">
        <strong className="text-primary">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</strong>
        {" "}dari{" "}
        <strong className="text-primary">{total}</strong>
        {" "}perangkat
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40" onClick={() => setPage(1)} disabled={page <= 1}>First</Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}><ChevronLeft className="mr-0.5 h-3 w-3" />Prev</Button>
          {buildPages(page, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`el-${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">…</span>
            ) : (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className={`h-8 w-8 rounded-full p-0 text-xs font-semibold ${p === page ? "shadow-md" : "hover:border-primary hover:text-primary"}`} onClick={() => setPage(p as number)}>{p}</Button>
            ),
          )}
          <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>Next<ChevronRight className="ml-0.5 h-3 w-3" /></Button>
          <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Last</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perangkat IT</h1>
          <p className="text-muted-foreground">Kelola daftar perangkat IT inventaris</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openExportDialog}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button asChild>
            <Link href={`/devices/new?category=${activeTab}`}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah {activeTab === "COMPUTER" ? "Komputer" : "Hardware"}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="COMPUTER">Komputer (NB/WS)</TabsTrigger>
          <TabsTrigger value="HARDWARE">Hardware</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <div className="border-b bg-muted/20 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari serial number atau nama user..."
                className="h-9 pl-8 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                  if (!e.target.value) {
                    isScanningRef.current = false;
                    scanBufferRef.current = "";
                    pendingFirstCharRef.current = "";
                  }
                }}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); resetPage(); }}>
                <SelectTrigger className="h-9 w-[170px] text-sm">
                  <SelectValue placeholder="Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Departemen</SelectItem>
                  {(departments ?? []).map((d: { id: string; code: string; name: string }) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeTab === "COMPUTER" && (
                <>
                  <Select value={osFilter} onValueChange={(v) => { setOsFilter(v); resetPage(); }}>
                    <SelectTrigger className="h-9 w-[180px] text-sm">
                      <SelectValue placeholder="Operating System" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua OS</SelectItem>
                      {uniqueOsList.map((o: { id: string; version: string; licenseType: string }) => (
                        <SelectItem key={o.id} value={o.id}>{o.version} ({o.licenseType})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={officeFilter} onValueChange={(v) => { setOfficeFilter(v); resetPage(); }}>
                    <SelectTrigger className="h-9 w-[170px] text-sm">
                      <SelectValue placeholder="Microsoft Office" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Office</SelectItem>
                      {uniqueOfficeList.map((o: { id: string; version: string; licenseType: string }) => (
                        <SelectItem key={o.id} value={o.id}>Office {o.version} ({o.licenseType})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {isAnyFilter && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-muted-foreground hover:text-foreground">
                  <X className="mr-1 h-3.5 w-3.5" />Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        <DataTable
          columns={activeTab === "COMPUTER" ? computerColumns : hardwareColumns}
          data={devices as DeviceRow[]}
          isLoading={isLoading}
          searchable={false}
          paginated={false}
        />

        {paginationFooter}
      </Card>

      {/* Export dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Export Data Perangkat IT</DialogTitle>
            <DialogDescription>Pilih departemen yang ingin diexport ke Excel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50">
              <Checkbox
                checked={exportAll}
                onCheckedChange={(v) => {
                  setExportAll(!!v);
                  if (v) setExportDeptIds([]);
                }}
              />
              <span className="text-sm font-medium">Semua Departemen</span>
            </label>
            <ScrollArea className="h-56 rounded-md border">
              <div className="p-2 space-y-1">
                {(departments ?? []).map((d: { id: string; code: string; name: string }) => (
                  <label
                    key={d.id}
                    className="flex items-center gap-3 rounded px-2 py-1.5 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={!exportAll && exportDeptIds.includes(d.id)}
                      onCheckedChange={() => toggleExportDept(d.id)}
                    />
                    <span className="text-sm">{d.name} <span className="text-muted-foreground">({d.code})</span></span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Batal</Button>
            <Button
              onClick={handleExport}
              disabled={(!exportAll && exportDeptIds.length === 0) || exportMutation.isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              {exportMutation.isPending ? "Mengunduh..." : "Download"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kembalikan ke GA dialog */}
      <Dialog open={!!returnToGATarget} onOpenChange={(o) => !o && setReturnToGATarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kembalikan Perangkat ke GA</DialogTitle>
            <DialogDescription>
              {returnToGATarget?.serialNumber} — perangkat akan ditandai tidak aktif. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan *</label>
            <Textarea
              placeholder="Contoh: Rusak, layar pecah, tidak bisa menyala..."
              value={returnToGANote}
              onChange={(e) => setReturnToGANote(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnToGATarget(null)}>
              Batal
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => void handleReturnToGA()}
              disabled={!returnToGANote.trim() || returnToGAMutation.isPending}
            >
              <PackageX className="mr-2 h-4 w-4" />
              {returnToGAMutation.isPending ? "Memproses..." : "Kembalikan ke GA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File preview dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>
              {preview && preview.paths.length > 1
                ? `File ${preview.idx + 1} dari ${preview.paths.length}`
                : "Preview bukti file yang di-upload"}
            </DialogDescription>
          </DialogHeader>
          {preview && (
            currentPath ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                <div className="min-h-0 flex-1 overflow-auto rounded-md border">
                  {/\.(png|jpg|jpeg|gif|webp)$/i.test(currentPath) ? (
                    <img src={`${FILE_BASE_URL}${currentPath}`} alt={preview.title} className="max-h-full w-auto" />
                  ) : (
                    <pre className="h-full w-full bg-muted p-4 text-xs whitespace-pre-wrap break-all">
                      {previewText ?? "Memuat..."}
                    </pre>
                  )}
                </div>
                <div className="flex shrink-0 items-center justify-between gap-2">
                  <a href={`${FILE_BASE_URL}${currentPath}`} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-2">
                    Buka file di tab baru
                  </a>
                  {preview.paths.length > 1 && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPreview((p) => p && { ...p, idx: p.idx - 1 })} disabled={preview.idx === 0}>
                        <ChevronLeft className="h-4 w-4" />Prev
                      </Button>
                      <span className="text-xs text-muted-foreground">{preview.idx + 1} / {preview.paths.length}</span>
                      <Button variant="outline" size="sm" onClick={() => setPreview((p) => p && { ...p, idx: p.idx + 1 })} disabled={preview.idx === preview.paths.length - 1}>
                        Next<ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                <FileQuestion className="h-10 w-10" />
                <p className="text-sm">Belum ada file bukti yang diupload</p>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
