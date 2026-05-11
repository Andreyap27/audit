"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, AlertTriangle } from "lucide-react";

interface QRScannerProps {
  onResult: (text: string) => void;
  active?: boolean;
}

export function QRScanner({ onResult, active = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const resultHandled = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopScanning = useCallback(() => {
    controlsRef.current?.stop();
    BrowserMultiFormatReader.releaseAllStreams();
    controlsRef.current = null;
  }, []);

  useEffect(() => {
    if (!active || !videoRef.current) return;

    const isSecureContext =
      window.isSecureContext ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";

    if (!isSecureContext) {
      setCameraError(
        "Scan QR Code memerlukan koneksi HTTPS. Gunakan mode Input Manual untuk melanjutkan.",
      );
      return;
    }

    resultHandled.current = false;
    setCameraError(null);
    const reader = new BrowserMultiFormatReader();
    reader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result, error, controls) => {
        if (!controlsRef.current) controlsRef.current = controls;
        if (result && !resultHandled.current) {
          resultHandled.current = true;
          stopScanning();
          onResult(result.getText());
        }
        if (error && !error.message?.includes("No MultiFormat Readers")) {
          console.warn("QR scan error:", error);
        }
      },
    ).catch(() => {
      setCameraError("Kamera tidak dapat diakses. Gunakan mode Input Manual.");
    });
    return () => {
      stopScanning();
    };
  }, [active, onResult, stopScanning]);

  if (cameraError) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertTriangle className="h-7 w-7 text-amber-600" />
        </div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Kamera Tidak Tersedia</p>
        <p className="text-xs text-muted-foreground max-w-xs">{cameraError}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Outer glow ring */}
      <div className="rounded-[20px] p-[3px] bg-gradient-to-br from-primary/60 via-primary/20 to-primary/60 shadow-lg shadow-primary/20">
        {/* Scanner — forced square 280×280 */}
        <div
          className="relative overflow-hidden rounded-2xl bg-black"
          style={{ width: "280px", height: "280px" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
          />

          {/* Spotlight overlay — box-shadow creates a true transparent cutout */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              style={{
                width: "176px",
                height: "176px",
                borderRadius: "10px",
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)",
              }}
            />
          </div>

          {/* Corner brackets — positioned over the cutout */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="relative"
              style={{ width: "176px", height: "176px" }}
            >
              <span className="absolute top-0 left-0 w-9 h-9 border-t-[3px] border-l-[3px] border-white/90 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-9 h-9 border-t-[3px] border-r-[3px] border-white/90 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-9 h-9 border-b-[3px] border-l-[3px] border-white/90 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-9 h-9 border-b-[3px] border-r-[3px] border-white/90 rounded-br-lg" />

              {/* Animated scan line with gradient */}
              <div
                className="absolute left-1 right-1 h-[2px] rounded-full animate-scan-line"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 30%, white 50%, hsl(var(--primary)) 70%, transparent 100%)",
                  boxShadow: "0 0 10px 4px hsl(var(--primary) / 0.5)",
                }}
              />
            </div>
          </div>

          {/* Bottom hint bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-5 pb-3 flex items-center justify-center gap-1.5 pointer-events-none">
            <Camera className="h-3 w-3 text-white/60" />
            <span className="text-white/60 text-[11px] tracking-wide">
              Arahkan QR Code ke kotak
            </span>
          </div>
        </div>
      </div>

      {/* Pulse indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        Kamera aktif · menunggu QR Code…
      </div>
    </div>
  );
}
