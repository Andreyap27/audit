"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2 } from "lucide-react";
import { useUploadEvidence } from "@/hooks/use-devices";

type EvidenceUploadFieldProps = {
  label: string;
  value?: string | null;
  serialNumber?: string;
  onUploaded: (path: string) => void;
  onError: (message: string) => void;
};

export function EvidenceUploadField({
  label,
  value,
  serialNumber,
  onUploaded,
  onError,
}: EvidenceUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadEvidence();

  const handleFile = async (file?: File) => {
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync({
        file,
        serialNumber: serialNumber?.trim() || undefined,
      });
      onUploaded(res.path);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : `Upload ${label} gagal`);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className="w-full justify-start"
      >
        {uploadMutation.isPending ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-pulse" />
            Uploading {label}...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Bukti {label}
          </>
        )}
      </Button>

      {value ? (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          File tersimpan
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Belum ada file</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".txt,image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
