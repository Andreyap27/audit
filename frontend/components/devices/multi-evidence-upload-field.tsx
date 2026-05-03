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
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Eye,
} from "lucide-react";
import api from "@/lib/api";

type MultiEvidenceUploadFieldProps = {
  label: string;
  folder: string;
  value: string[];
  onChange: (paths: string[]) => void;
  onError: (message: string) => void;
};

const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(
    /\/api\/?$/,
    "",
  );

const isImagePath = (p: string) => /\.(png|jpe?g|gif|webp)$/i.test(p);

const getFileName = (p: string) => decodeURIComponent(p.split("/").pop() ?? p);

// --- Preview Dialog ---
function FilePreviewDialog({
  filePath,
  onClose,
}: {
  filePath: string | null;
  onClose: () => void;
}) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);

  const isImage = filePath ? isImagePath(filePath) : false;
  const fullUrl = filePath ? `${getApiBase()}${filePath}` : "";
  const name = filePath ? getFileName(filePath) : "";

  const handleOpen = (open: boolean) => {
    if (!open) {
      onClose();
      setTextContent(null);
    } else if (filePath && !isImage) {
      setLoadingText(true);
      fetch(fullUrl)
        .then((r) => r.text())
        .then((t) => setTextContent(t))
        .catch(() => setTextContent("Gagal memuat file."))
        .finally(() => setLoadingText(false));
    }
  };

  return (
    <Dialog open={!!filePath} onOpenChange={handleOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-mono truncate">{name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fullUrl}
              alt={name}
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
  );
}

// --- Saved file row ---
function SavedFileRow({
  filePath,
  onRemove,
  onPreview,
}: {
  filePath: string;
  onRemove: () => void;
  onPreview: () => void;
}) {
  const isImage = isImagePath(filePath);
  const name = getFileName(filePath);

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
      {isImage ? (
        <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
      ) : (
        <FileText className="h-4 w-4 shrink-0 text-orange-500" />
      )}
      <button
        type="button"
        onClick={onPreview}
        className="flex-1 truncate text-left text-sm hover:underline text-foreground cursor-pointer"
        title={name}
      >
        {name}
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// --- Pending file row (during upload) ---
function PendingFileRow({ file }: { file: File }) {
  const isImage = file.type.startsWith("image/");
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-primary/40 bg-muted/20 px-3 py-2 text-sm opacity-70">
      {isImage ? (
        <ImageIcon className="h-4 w-4 shrink-0 text-blue-400" />
      ) : (
        <FileText className="h-4 w-4 shrink-0 text-orange-400" />
      )}
      <span className="flex-1 truncate text-muted-foreground">{file.name}</span>
      <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
    </div>
  );
}

// --- Main component ---
export function MultiEvidenceUploadField({
  label,
  folder,
  value,
  onChange,
  onError,
}: MultiEvidenceUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    setPendingFiles((prev) => [...prev, ...newFiles]);
    setUploading(true);

    try {
      const formData = new FormData();
      newFiles.forEach((f) => formData.append("files", f));

      const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "_");
      const res = await api.post<{ files: { path: string }[] }>(
        `/uploads/evidence-multiple?folder=${encodeURIComponent(safeFolder)}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      onChange([...value, ...res.data.files.map((f) => f.path)]);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : `Upload ${label} gagal`);
    } finally {
      setPendingFiles([]);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      {value.map((p, i) => (
        <SavedFileRow
          key={`saved-${i}`}
          filePath={p}
          onRemove={() => onChange(value.filter((_, j) => j !== i))}
          onPreview={() => setPreviewPath(p)}
        />
      ))}

      {pendingFiles.map((f, i) => (
        <PendingFileRow key={`pending-${i}`} file={f} />
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full justify-start gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Bukti {label}
            {value.length > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                {value.length} file
              </span>
            )}
          </>
        )}
      </Button>

      {value.length > 0 && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Eye className="h-3 w-3" />
          Klik nama file untuk preview
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".txt,image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <FilePreviewDialog
        filePath={previewPath}
        onClose={() => setPreviewPath(null)}
      />
    </div>
  );
}
