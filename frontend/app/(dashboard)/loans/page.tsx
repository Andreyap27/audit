"use client";

import { useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useLoans } from "@/hooks/use-loans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import {
  Plus,
  RotateCcw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const PAGE_SIZE = 20;
const FILE_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/api\/?$/, "");

type LoanRow = {
  id: string;
  borrowerName: string;
  borrowedAt: string;
  returnedAt: string | null;
  borrowPhotoPath: string | null;
  returnPhotoPath: string | null;
  note: string | null;
  status: "BORROWED" | "RETURNED";
  device: {
    serialNumber: string;
    userName: string | null;
    unitType: { name: string } | null;
    department: { name: string } | null;
  } | null;
};

type PhotoPreview = {
  borrowPhotoPath: string | null;
  returnPhotoPath: string | null;
  status: "BORROWED" | "RETURNED";
};

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function LoansPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [previewLoan, setPreviewLoan] = useState<PhotoPreview | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const resetPage = () => setPage(1);

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1);
  };

  const sortBy = sorting[0]?.id;
  const sortOrder = sorting[0]?.desc ? "desc" : "asc";

  const { data, isLoading } = useLoans({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortBy ? (sortOrder as "asc" | "desc") : undefined,
  });

  const loans = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const isAnyFilter = search !== "" || status !== "all";

  const columns: ColumnDef<LoanRow>[] = [
    {
      accessorKey: "device.serialNumber",
      header: "Serial Number",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">
          {row.original.device?.serialNumber ?? "-"}
        </span>
      ),
    },
    {
      id: "unitType",
      header: "Jenis Perangkat",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.device?.unitType?.name ?? "-"}
        </Badge>
      ),
    },
    {
      id: "deviceUser",
      header: "Nama User",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.device?.userName ?? "-"}</span>
      ),
    },
    {
      id: "department",
      header: "Departemen",
      cell: ({ row }) => row.original.device?.department?.name ?? "-",
    },
    {
      accessorKey: "borrowerName",
      header: "Peminjam",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.borrowerName}</span>
      ),
    },
    {
      accessorKey: "borrowedAt",
      header: "Tgl Pinjam",
      cell: ({ row }) =>
        format(new Date(row.original.borrowedAt), "dd MMM yyyy HH:mm", {
          locale: idLocale,
        }),
    },
    {
      accessorKey: "returnedAt",
      header: "Tgl Kembali",
      cell: ({ row }) =>
        row.original.returnedAt
          ? format(new Date(row.original.returnedAt), "dd MMM yyyy HH:mm", {
              locale: idLocale,
            })
          : "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "BORROWED" ? "destructive" : "outline"
          }
          className={
            row.original.status === "RETURNED"
              ? "text-green-600 border-green-600"
              : ""
          }
        >
          {row.original.status === "BORROWED" ? "Dipinjam" : "Dikembalikan"}
        </Badge>
      ),
    },
    {
      accessorKey: "note",
      header: "Catatan",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground max-w-40 truncate block">
          {row.original.note ?? "-"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Foto / Aksi",
      cell: ({ row }) => {
        const loan = row.original;
        const hasPhoto = loan.borrowPhotoPath || loan.returnPhotoPath;
        return (
          <div className="flex items-center gap-1">
            {hasPhoto && (
              <Button
                variant="ghost"
                size="icon"
                title="Lihat foto peminjaman"
                onClick={() =>
                  setPreviewLoan({
                    borrowPhotoPath: loan.borrowPhotoPath,
                    returnPhotoPath: loan.returnPhotoPath,
                    status: loan.status,
                  })
                }
              >
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
            {loan.status === "BORROWED" && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/loans/return">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Kembalikan
                </Link>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Peminjaman Perangkat
          </h1>
          <p className="text-muted-foreground">
            Riwayat peminjaman dan pengembalian perangkat IT
          </p>
        </div>
        <Button asChild>
          <Link href="/loans/borrow">
            <Plus className="mr-2 h-4 w-4" />
            Pinjam Perangkat
          </Link>
        </Button>
      </div>

      {/* Table card */}
      <Card>
        {/* Filter toolbar */}
        <div className="border-b bg-muted/20 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari peminjam atau serial number..."
                className="h-9 pl-8 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
              />
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  resetPage();
                }}
              >
                <SelectTrigger className="h-9 w-[190px] text-sm">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="BORROWED">Sedang Dipinjam</SelectItem>
                  <SelectItem value="RETURNED">Sudah Dikembalikan</SelectItem>
                </SelectContent>
              </Select>
              {isAnyFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    resetPage();
                  }}
                  className="h-9 text-muted-foreground hover:text-foreground"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={loans as LoanRow[]}
          isLoading={isLoading}
          searchable={false}
          paginated={false}
          manualSorting
          externalSorting={sorting}
          onExternalSortingChange={handleSortingChange}
        />

        {/* Pagination footer */}
        {!isLoading && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">
              <strong className="text-primary">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}
              </strong>{" "}
              dari <strong className="text-primary">{total}</strong> data
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40"
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-0.5 h-3 w-3" />
                  Prev
                </Button>

                {buildPages(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`el-${i}`}
                      className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 rounded-full p-0 text-xs font-semibold ${
                        p === page
                          ? "shadow-md"
                          : "hover:border-primary hover:text-primary"
                      }`}
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </Button>
                  ),
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold hover:border-primary hover:text-primary disabled:opacity-40"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="ml-0.5 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:border-border disabled:text-muted-foreground disabled:opacity-40"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                >
                  Last
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Foto peminjaman dialog */}
      <Dialog
        open={!!previewLoan}
        onOpenChange={(o) => !o && setPreviewLoan(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Foto Peminjaman</DialogTitle>
            <DialogDescription>
              {previewLoan?.status === "RETURNED"
                ? "Foto saat dipinjam dan saat dikembalikan"
                : "Foto saat perangkat dipinjam"}
            </DialogDescription>
          </DialogHeader>
          {previewLoan && (
            <div
              className={`grid gap-4 ${
                previewLoan.status === "RETURNED" && previewLoan.borrowPhotoPath && previewLoan.returnPhotoPath
                  ? "grid-cols-2"
                  : "grid-cols-1 max-w-md mx-auto w-full"
              }`}
            >
              {previewLoan.borrowPhotoPath && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Foto Saat Dipinjam
                  </p>
                  <div className="overflow-hidden rounded-md border">
                    <img
                      src={`${FILE_BASE_URL}${previewLoan.borrowPhotoPath}`}
                      alt="Foto saat dipinjam"
                      className="w-full object-contain max-h-[55vh]"
                    />
                  </div>
                  <a
                    href={`${FILE_BASE_URL}${previewLoan.borrowPhotoPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline underline-offset-2 text-muted-foreground"
                  >
                    Buka di tab baru
                  </a>
                </div>
              )}
              {previewLoan.returnPhotoPath && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Foto Saat Dikembalikan
                  </p>
                  <div className="overflow-hidden rounded-md border">
                    <img
                      src={`${FILE_BASE_URL}${previewLoan.returnPhotoPath}`}
                      alt="Foto saat dikembalikan"
                      className="w-full object-contain max-h-[55vh]"
                    />
                  </div>
                  <a
                    href={`${FILE_BASE_URL}${previewLoan.returnPhotoPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline underline-offset-2 text-muted-foreground"
                  >
                    Buka di tab baru
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
