"use client";

import { useState, useCallback, useEffect } from "react";
import { QRScanner } from "@/components/loans/qr-scanner";
import { StepWizard } from "@/components/loans/step-wizard";
import { useLoanBySerial, useCreateLoan } from "@/hooks/use-loans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGlobalModal } from "@/lib/global-modal";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ScanLine,
  Laptop,
  UserRound,
  RotateCcw,
  KeyboardIcon,
  Search,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { LivePhotoCapture } from "@/components/loans/live-photo-capture";

type Step = "scan" | "confirm" | "done";
type ScanMode = "camera" | "manual";

const STEPS = [
  { id: "scan", label: "Scan / Input" },
  { id: "confirm", label: "Isi Data" },
  { id: "done", label: "Selesai" },
];

export default function BorrowPage() {
  const [step, setStep] = useState<Step>("scan");
  const [scanMode, setScanMode] = useState<ScanMode>("camera");

  // Switch to manual if not on HTTPS/localhost (camera API unavailable)
  useEffect(() => {
    const secure =
      window.isSecureContext ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";
    if (!secure) setScanMode("manual");
  }, []);
  const [serialNumber, setSerialNumber] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowPhotoPath, setBorrowPhotoPath] = useState("");
  const modal = useGlobalModal();

  const { data: scanResult, isLoading: isLookingUp } = useLoanBySerial(serialNumber);
  const createLoan = useCreateLoan();

  const handleScan = useCallback((text: string) => {
    const sn = text.trim();
    setSerialNumber(sn);
    setStep("confirm");
  }, []);

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    setSerialNumber(manualInput.trim());
    setStep("confirm");
  };

  const handleBorrow = async () => {
    if (!scanResult?.device || !borrowerName.trim()) return;
    if (scanResult.activeLoan) {
      modal.error({ title: "Perangkat sedang dipinjam orang lain" });
      return;
    }
    if (!borrowPhotoPath) {
      modal.error({ title: "Foto peminjaman wajib diambil terlebih dahulu" });
      return;
    }
    try {
      await createLoan.mutateAsync({
        deviceId: scanResult.device.id,
        borrowerName: borrowerName.trim(),
        borrowPhotoPath,
      });
      setStep("done");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mencatat peminjaman";
      modal.error({ title: msg });
    }
  };

  const resetForm = () => {
    setStep("scan");
    setSerialNumber("");
    setManualInput("");
    setBorrowerName("");
    setBorrowPhotoPath("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/loans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pinjam Perangkat</h1>
          <p className="text-muted-foreground text-sm">
            Scan QR Code atau masukkan serial number perangkat
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
      {/* Step indicator */}
      <div className="flex justify-center">
        <StepWizard steps={STEPS} currentStep={step} />
      </div>

      {/* ── STEP: SCAN ── */}
      {step === "scan" && (
        <Card className="overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b">
            <button
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                scanMode === "camera"
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setScanMode("camera")}
            >
              <ScanLine className="h-4 w-4" />
              Scan QR Code
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                scanMode === "manual"
                  ? "border-b-2 border-primary text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setScanMode("manual")}
            >
              <KeyboardIcon className="h-4 w-4" />
              Input Manual
            </button>
          </div>

          <CardContent className="pt-6 pb-8">
            {scanMode === "camera" ? (
              <div className="flex flex-col items-center gap-4">
                <QRScanner onResult={handleScan} active={step === "scan" && scanMode === "camera"} />
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  Arahkan kamera ke QR Code yang tertempel pada perangkat. Pastikan QR Code terlihat jelas.
                </p>
              </div>
            ) : (
              <div className="max-w-sm mx-auto space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Serial Number Perangkat</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Masukkan serial number..."
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                      autoFocus
                      className="h-10"
                    />
                    <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Masukkan serial number sesuai yang tertera pada perangkat, lalu tekan Enter atau klik tombol cari.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── STEP: CONFIRM ── */}
      {step === "confirm" && (
        <div className="space-y-4">
          {/* Device info */}
          <Card>
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <Laptop className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Detail Perangkat</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">{serialNumber}</span>
            </div>
            <CardContent className="pt-4">
              {isLookingUp && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mencari perangkat…
                </div>
              )}

              {!isLookingUp && !scanResult?.device && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Perangkat tidak ditemukan</p>
                    <p className="text-xs text-destructive/70 mt-0.5">
                      Serial number <span className="font-mono">{serialNumber}</span> tidak terdaftar di sistem.
                    </p>
                  </div>
                </div>
              )}

              {scanResult?.activeLoan && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Sedang Dipinjam</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      Perangkat ini sedang dipinjam oleh <strong>{scanResult.activeLoan.borrowerName}</strong>.
                    </p>
                  </div>
                </div>
              )}

              {scanResult?.device && !isLookingUp && (
                <>
                  {!(scanResult.device as { canBeLent?: boolean }).canBeLent && !scanResult.activeLoan && (
                    <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                      <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-destructive">Perangkat tidak dapat dipinjam</p>
                        <p className="text-xs text-destructive/70 mt-0.5">
                          Perangkat ini tidak terdaftar sebagai perangkat yang dapat dipinjam.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="divide-y rounded-lg border text-sm overflow-hidden">
                    {[
                      ["Serial Number", <span key="sn" className="font-mono font-semibold text-xs">{scanResult.device.serialNumber}</span>],
                      ["Jenis Perangkat", <Badge key="t" variant="outline">{scanResult.device.unitType?.name ?? "—"}</Badge>],
                      ["Departemen", scanResult.device.department?.name ?? "—"],
                      ["Pengguna Tetap", scanResult.device.userName ?? "—"],
                      ["Status", <Badge key="s" variant={scanResult.activeLoan ? "destructive" : "outline"}
                        className={!scanResult.activeLoan ? "text-emerald-600 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : ""}>
                        {scanResult.activeLoan ? "Sedang Dipinjam" : "Tersedia"}
                      </Badge>],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex items-center justify-between px-4 py-2.5 gap-4">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className="text-right">{value as React.ReactNode}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Borrower form — only show if device is available and can be lent */}
          {scanResult?.device && !scanResult.activeLoan && !isLookingUp && (scanResult.device as { canBeLent?: boolean }).canBeLent && (
            <Card className="border-primary/30">
              <div className="flex items-center gap-2 border-b bg-primary/5 px-5 py-3">
                <UserRound className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Data Peminjam</span>
              </div>
              <CardContent className="pt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nama Peminjam <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Masukkan nama lengkap peminjam…"
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">Isi dengan nama lengkap sesuai identitas.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    Foto Kondisi Perangkat <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground">Ambil foto kondisi perangkat sebelum dipinjam.</p>
                  <LivePhotoCapture
                    serialNumber={serialNumber}
                    value={borrowPhotoPath}
                    onUploaded={setBorrowPhotoPath}
                    onError={(msg) => modal.error({ title: msg })}
                    label="Foto sebelum pinjam"
                  />
                </div>

                <Button
                  onClick={() => void handleBorrow()}
                  disabled={!borrowerName.trim() || !borrowPhotoPath || createLoan.isPending}
                  className="w-full h-11 font-semibold"
                >
                  {createLoan.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan…</>
                  ) : (
                    "Simpan Peminjaman"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          <Button variant="outline" size="sm" onClick={resetForm} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Scan / Input Ulang
          </Button>
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === "done" && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="py-12 text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400/20" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Peminjaman Berhasil!</h2>
              <p className="text-sm text-muted-foreground">
                Perangkat <span className="font-mono font-semibold text-foreground">{serialNumber}</span>{" "}
                kini dipinjam oleh <strong className="text-foreground">{borrowerName}</strong>.
              </p>
            </div>
            <div className="flex gap-3 max-w-xs mx-auto">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/loans">Lihat Riwayat</Link>
              </Button>
              <Button onClick={resetForm} className="flex-1">
                Pinjam Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
