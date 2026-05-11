"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, Upload, X, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadEvidence } from "@/hooks/use-devices";
import { cn } from "@/lib/utils";

interface LivePhotoCaptureProps {
  serialNumber: string;
  value: string;
  onUploaded: (path: string) => void;
  onError?: (msg: string) => void;
  label?: string;
}

export function LivePhotoCapture({
  serialNumber,
  value,
  onUploaded,
  onError,
  label = "Foto Bukti",
}: LivePhotoCaptureProps) {
  const [mode, setMode] = useState<"camera" | "file">("camera");
  const [cameraActive, setCameraActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uploadEvidence = useUploadEvidence();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "camera" || preview || value) return;

    const isSecureContext =
      window.isSecureContext ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";

    if (!isSecureContext) {
      setCameraError(
        "Akses kamera memerlukan HTTPS. Gunakan mode Upload File untuk melanjutkan.",
      );
      setMode("file");
      return;
    }

    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
        setCameraError(null);
      })
      .catch(() => {
        if (mounted) {
          setCameraError("Kamera tidak dapat diakses. Silakan gunakan mode Upload File.");
          setMode("file");
        }
      });

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [mode, preview, value, stopCamera, onError]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      stopCamera();
      const previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);
      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" });
      try {
        const res = await uploadEvidence.mutateAsync({ file, serialNumber });
        onUploaded(res.path);
      } catch {
        onError?.("Gagal upload foto, coba lagi");
        URL.revokeObjectURL(previewUrl);
        setPreview(null);
      }
    }, "image/jpeg", 0.9);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    try {
      const res = await uploadEvidence.mutateAsync({ file, serialNumber });
      onUploaded(res.path);
    } catch {
      onError?.("Gagal upload foto, coba lagi");
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
      setFileName("");
    }
  };

  const clearPhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName("");
    onUploaded("");
  };

  const switchMode = (next: "camera" | "file") => {
    stopCamera();
    setCameraError(null);
    setMode(next);
  };

  // ── Preview after capture/upload ──
  if (preview) {
    return (
      <div className="space-y-2">
        <div
          className="relative overflow-hidden rounded-xl border bg-muted"
          style={{ aspectRatio: "4/3" }}
        >
          <img
            src={preview}
            alt={label}
            className="h-full w-full object-cover"
          />
          {uploadEvidence.isPending && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
              <Loader2 className="h-7 w-7 animate-spin text-white" />
              <span className="text-xs text-white">Mengupload…</span>
            </div>
          )}
          {value && !uploadEvidence.isPending && (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
              <CheckCircle2 className="h-3 w-3" />
              Terupload
            </div>
          )}
          <button
            type="button"
            onClick={clearPhoto}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {fileName && (
          <p className="text-xs text-muted-foreground truncate">{fileName}</p>
        )}
      </div>
    );
  }

  // ── Camera / File selector ──
  return (
    <div className="space-y-2">
      {cameraError && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}
      <div className="flex overflow-hidden rounded-lg border">
        <button
          type="button"
          onClick={() => switchMode("camera")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
            mode === "camera"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Camera className="h-3.5 w-3.5" />
          Foto Langsung
        </button>
        <button
          type="button"
          onClick={() => switchMode("file")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 border-l py-2 text-xs font-medium transition-colors",
            mode === "file"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload File
        </button>
      </div>

      {mode === "camera" && (
        <div className="space-y-2">
          <div
            className="relative overflow-hidden rounded-xl bg-black"
            style={{ aspectRatio: "4/3" }}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <Button
            type="button"
            onClick={() => void handleCapture()}
            disabled={!cameraActive || uploadEvidence.isPending}
            className="w-full"
          >
            {uploadEvidence.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengupload…
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Ambil Foto
              </>
            )}
          </Button>
        </div>
      )}

      {mode === "file" && (
        <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 transition-all hover:border-primary/50 hover:bg-primary/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/15">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Klik untuk upload foto</p>
            <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WEBP</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
