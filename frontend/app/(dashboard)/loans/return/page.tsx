"use client";

import { useState, useCallback } from "react";
import { QRScanner } from "@/components/loans/qr-scanner";
import { StepWizard } from "@/components/loans/step-wizard";
import { useLoanBySerial, useReturnLoan } from "@/hooks/use-loans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useGlobalModal } from "@/lib/global-modal";
import { LivePhotoCapture } from "@/components/loans/live-photo-capture";
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ScanLine,
  ImageIcon,
  Calendar,
  UserRound,
  Laptop,
  KeyboardIcon,
  Search,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Step = "scan" | "confirm" | "done";
type ScanMode = "camera" | "manual";

const STEPS = [
  { id: "scan", label: "Scan / Input" },
  { id: "confirm", label: "Konfirmasi" },
  { id: "done", label: "Selesai" },
];

export default function ReturnPage() {
  const [step, setStep] = useState<Step>("scan");
  const [scanMode, setScanMode] = useState<ScanMode>("camera");
  const [serialNumber, setSerialNumber] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [note, setNote] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const modal = useGlobalModal();

  const { data: scanResult, isLoading } = useLoanBySerial(serialNumber);
  const returnLoan = useReturnLoan();

  const activeLoan = scanResult?.activeLoan;

  const handleScan = useCallback((text: string) => {
    setSerialNumber(text.trim());
    setStep("confirm");
  }, []);

  const handleManualSubmit = () => {
    if (!manualInput.trim()) return;
    setSerialNumber(manualInput.trim());
    setStep("confirm");
  };

  const handleReturn = async () => {
    if (!activeLoan || !photoPath) return;
    try {
      await returnLoan.mutateAsync({
        id: activeLoan.id,
        returnPhotoPath: photoPath,
        note: note.trim() || null,
      });
      setStep("done");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mencatat pengembalian";
      modal.error({ title: msg });
    }
  };

  const resetForm = () => {
    setStep("scan");
    setSerialNumber("");
    setManualInput("");
    setNote("");
    setPhotoPath("");
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
          <h1 className="text-2xl font-bold tracking-tight">Kembalikan Perangkat</h1>
          <p className="text-muted-foreground text-sm">
            Scan QR Code atau masukkan serial number, lalu upload foto bukti kondisi perangkat
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
                  Arahkan kamera ke QR Code pada perangkat yang akan dikembalikan.
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
                    Tekan Enter atau klik tombol cari untuk melanjutkan.
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
          {/* Loan info */}
          <Card>
            <div className="flex items-center gap-2 border-b px-5 py-3">
              <Laptop className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Data Peminjaman</span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">{serialNumber}</span>
            </div>
            <CardContent className="pt-4">
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mencari data peminjaman…
                </div>
              )}

              {!isLoading && !scanResult?.device && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Perangkat tidak ditemukan</p>
                    <p className="text-xs text-destructive/70 mt-0.5">
                      Serial number <span className="font-mono">{serialNumber}</span> tidak terdaftar.
                    </p>
                  </div>
                </div>
              )}

              {scanResult && !activeLoan && !isLoading && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Tidak ada peminjaman aktif</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      Perangkat ini tidak sedang dipinjam.
                    </p>
                  </div>
                </div>
              )}

              {scanResult?.device && activeLoan && !isLoading && (
                <div className="divide-y rounded-lg border text-sm overflow-hidden">
                  {[
                    ["Serial Number", <span key="sn" className="font-mono font-semibold text-xs">{scanResult.device.serialNumber}</span>],
                    ["Jenis Perangkat", scanResult.device.unitType?.name ?? "—"],
                    ["Peminjam", <span key="bn" className="flex items-center gap-1.5">
                      <UserRound className="h-3.5 w-3.5 text-primary" />
                      <strong className="text-primary">{activeLoan.borrowerName}</strong>
                    </span>],
                    ["Tgl. Pinjam", <span key="d" className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {format(new Date(activeLoan.borrowedAt), "dd MMM yyyy · HH:mm", { locale: idLocale })}
                    </span>],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-center justify-between px-4 py-2.5 gap-4">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-right">{value as React.ReactNode}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return form */}
          {scanResult?.device && activeLoan && !isLoading && (
            <Card className="border-primary/30">
              <div className="flex items-center gap-2 border-b bg-primary/5 px-5 py-3">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Bukti Pengembalian</span>
              </div>
              <CardContent className="pt-5 space-y-5">
                {/* Photo capture */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                    Foto Kondisi Perangkat <span className="text-destructive">*</span>
                  </label>
                  <p className="text-xs text-muted-foreground">Ambil foto kondisi perangkat saat dikembalikan.</p>
                  <LivePhotoCapture
                    serialNumber={serialNumber}
                    value={photoPath}
                    onUploaded={setPhotoPath}
                    onError={(msg) => modal.error({ title: msg })}
                    label="Foto saat pengembalian"
                  />
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Catatan{" "}
                    <span className="font-normal text-muted-foreground">(opsional)</span>
                  </label>
                  <Textarea
                    placeholder="Contoh: charger tidak dikembalikan, layar ada goresan…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={() => void handleReturn()}
                  disabled={!photoPath || returnLoan.isPending}
                  className="w-full h-11 font-semibold"
                >
                  {returnLoan.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan…</>
                  ) : (
                    "Konfirmasi Pengembalian"
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
              <h2 className="text-xl font-bold">Pengembalian Berhasil!</h2>
              <p className="text-sm text-muted-foreground">
                Perangkat{" "}
                <span className="font-mono font-semibold text-foreground">{serialNumber}</span>{" "}
                telah berhasil dikembalikan.
              </p>
            </div>
            <div className="flex gap-3 max-w-xs mx-auto">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/loans">Lihat Riwayat</Link>
              </Button>
              <Button onClick={resetForm} className="flex-1">
                Kembalikan Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
