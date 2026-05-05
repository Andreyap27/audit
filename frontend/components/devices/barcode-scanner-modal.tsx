"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScanLine, Camera } from "lucide-react";

interface BarcodeScannerModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onScanned: (value: string) => void;
}

export function BarcodeScannerModal({
  open,
  onOpenChange,
  onScanned,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  // Stable refs so the scan callback never closes over stale props
  const onScannedRef = useRef(onScanned);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => { onScannedRef.current = onScanned; }, [onScanned]);
  useEffect(() => { onOpenChangeRef.current = onOpenChange; }, [onOpenChange]);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  // Load camera list when modal opens
  useEffect(() => {
    if (!open) return;
    setError(null);

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices);
        if (devices.length > 0) {
          const backCam = devices.find((d) =>
            /back|rear|environment/i.test(d.label),
          );
          setSelectedCamera((backCam ?? devices[0]).deviceId);
        } else {
          setError("Tidak ada kamera yang ditemukan");
        }
      })
      .catch(() => setError("Tidak dapat mengakses kamera"));
  }, [open]);

  // Start/restart reader when camera selection changes
  useEffect(() => {
    if (!open || !selectedCamera) return;

    // Wait for next tick so the video element is mounted
    const timer = setTimeout(() => {
      if (!videoRef.current) return;

      setError(null);
      setScanning(true);

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      reader
        .decodeFromVideoDevice(
          selectedCamera,
          videoRef.current,
          (result, err) => {
            // Guard: only process if this reader is still the active one
            if (readerRef.current !== reader) return;

            if (result) {
              // Stop scanning immediately before calling parent callbacks
              // to prevent the callback from firing again mid-render
              readerRef.current = null;
              reader.reset();

              const text = result.getText();
              onScannedRef.current(text);
              onOpenChangeRef.current(false);
            } else if (err && !(err instanceof NotFoundException)) {
              // NotFoundException fires when no code is in frame — expected, ignore
              console.error("Scan error:", err);
            }
          },
        )
        .catch(() => {
          if (readerRef.current === reader) {
            setError(
              "Gagal memulai kamera. Pastikan izin kamera sudah diberikan.",
            );
            setScanning(false);
          }
        });
    }, 50);

    return () => {
      clearTimeout(timer);
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
      setScanning(false);
    };
  }, [open, selectedCamera]);

  const handleClose = (v: boolean) => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setScanning(false);
    setError(null);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" />
            Scan Barcode / QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {cameras.length > 1 && (
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Pilih kamera" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map((cam) => (
                    <SelectItem key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Kamera ${cam.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative overflow-hidden rounded-lg bg-black aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {scanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-32">
                  <div className="absolute inset-0 border-2 border-primary rounded-md opacity-70" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                </div>
              </div>
            )}
          </div>

          {error ? (
            <p className="text-sm text-destructive text-center">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Arahkan kamera ke barcode atau QR code pada dus perangkat
            </p>
          )}

          <Button variant="outline" onClick={() => handleClose(false)}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
