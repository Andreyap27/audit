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
  X,
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
  value?: string[] | null;
  serialNumber?: string;
  accept?: string;
  onUploaded: (paths: string[]) => void;
  onError: (message: string) => void;
};

export function EvidenceUploadField({
  label,
  value,
  serialNumber,
  accept = ".txt,image/*",
  onUploaded,
  onError,
}: EvidenceUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadEvidence();
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const paths = value ?? [];

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingCount(files.length);
    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const res = await uploadMutation.mutateAsync({
          file,
          module: "devices",
          folder: serialNumber?.trim() || undefined,
        });
        newPaths.push(res.path as string);
      } catch (err: unknown) {
        onError(err instanceof Error ? err.message : `Upload ${label} gagal`);
      }
    }
    setUploadingCount(0);
    if (newPaths.length > 0) {
      onUploaded([...paths, ...newPaths]);
    }
    // reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (idx: number) => {
    const next = paths.filter((_, i) => i !== idx);
    onUploaded(next);
  };

  const handlePreviewOpen = (path: string) => {
    setPreviewPath(path);
    if (!isImagePath(path)) {
      setLoadingText(true);
      fetch(`${getApiBase()}${path}`)
        .then((r) => r.text())
        .then((t) => setTextContent(t))
        .catch(() => setTextContent("Gagal memuat file."))
        .finally(() => setLoadingText(false));
    }
  };

  const isUploading = uploadingCount > 0;
  const previewIsImage = previewPath ? isImagePath(previewPath) : false;
  const previewFileName = previewPath ? getFileName(previewPath) : null;
  const previewFullUrl = previewPath ? `${getApiBase()}${previewPath}` : "";

  return (
    <div className="space-y-2">
      {/* List of uploaded files */}
      {paths.length > 0 && (
        <ul className="space-y-1">
          {paths.map((p, i) => {
            const isImg = isImagePath(p);
            const name = getFileName(p);
            return (
              <li
                key={i}
                className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
              >
                {isImg ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-orange-500" />
                )}
                <button
                  type="button"
                  onClick={() => handlePreviewOpen(p)}
                  className="flex-1 truncate text-left text-xs hover:underline text-foreground cursor-pointer"
                  title={name}
                >
                  {name}
                </button>
                <Eye className="h-3 w-3 text-muted-foreground shrink-0" />
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="ml-1 text-muted-foreground hover:text-destructive"
                  title="Hapus file ini"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {paths.length === 0 && (
        <p className="text-xs text-muted-foreground">Belum ada file</p>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="w-full justify-start"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading {uploadingCount} file...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {paths.length > 0 ? `Tambah Bukti ${label}` : `Upload Bukti ${label}`}
          </>
        )}
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {/* Preview dialog */}
      <Dialog
        open={!!previewPath}
        onOpenChange={(o) => {
          if (!o) {
            setPreviewPath(null);
            setTextContent(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-mono truncate">
              {previewFileName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewIsImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewFullUrl}
                alt={previewFileName ?? ""}
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
