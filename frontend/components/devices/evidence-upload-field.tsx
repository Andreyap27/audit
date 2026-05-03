"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Eye,
  Loader2,
} from "lucide-react";
import { useUploadEvidence } from "@/hooks/use-devices";

const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(
    /\/api\/?$/,
    "",
  );

const isImagePath = (p: string) => /\.(png|jpe?g|gif|webp)$/i.test(p);
const getFileName = (p: string) => decodeURIComponent(p.split("/").pop() ?? p);

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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);

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

  const handlePreviewOpen = () => {
    if (!value) return;
    setPreviewOpen(true);
    if (!isImagePath(value)) {
      setLoadingText(true);
      fetch(`${getApiBase()}${value}`)
        .then((r) => r.text())
        .then((t) => setTextContent(t))
        .catch(() => setTextContent("Gagal memuat file."))
        .finally(() => setLoadingText(false));
    }
  };

  const isImage = value ? isImagePath(value) : false;
  const fileName = value ? getFileName(value) : null;
  const fullUrl = value ? `${getApiBase()}${value}` : "";

  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {isImage ? (
            <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-orange-500" />
          )}
          <button
            type="button"
            onClick={handlePreviewOpen}
            className="flex-1 truncate text-left text-sm hover:underline text-foreground cursor-pointer"
            title={fileName ?? ""}
          >
            {fileName}
          </button>
          <Eye className="h-3 w-3 text-muted-foreground shrink-0" />
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className="w-full justify-start"
      >
        {uploadMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {value ? "Ganti Bukti" : `Upload Bukti ${label}`}
          </>
        )}
      </Button>

      {!value && (
        <p className="text-xs text-muted-foreground">Belum ada file</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".txt,image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <Dialog
        open={previewOpen}
        onOpenChange={(o) => {
          setPreviewOpen(o);
          if (!o) setTextContent(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-mono truncate">
              {fileName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullUrl}
                alt={fileName ?? ""}
                className="w-full h-auto rounded"
              />
            ) : loadingText ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <pre className="text-xs bg-muted rounded p-4 overflow-auto whitespace-pre-wrap break-words">
                {textContent ?? ""}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
