"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useImportExcel } from "@/hooks/use-import-export"

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importMut = useImportExcel()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith(".xlsx")) setFile(f)
    else toast.error("Hanya file .xlsx yang diterima")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleImport = async () => {
    if (!file) return
    const fd = new FormData()
    fd.append("file", file)
    try {
      const result = await importMut.mutateAsync(fd)
      toast.success(`Import berhasil: ${result.imported ?? 0} device diproses`)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Import gagal"
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import Data</h1>
        <p className="text-muted-foreground">Upload file Excel untuk import data perangkat</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File Excel</CardTitle>
          <CardDescription>Format: .xlsx, maksimal 20MB. Setiap sheet mewakili satu departemen.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={e=>e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-green-500"/>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size/1024/1024).toFixed(2)} MB</p>
                <Badge variant="secondary">Siap diimport</Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground"/>
                <p className="font-medium">Drag & drop file Excel di sini</p>
                <p className="text-sm text-muted-foreground">atau klik untuk memilih file</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Setiap sheet Excel mewakili satu departemen (nama sheet = kode departemen)</p>
          <p>2. Kolom yang diperlukan: Serial No, User, Unit Type, OS, Office, Visio, Project, Access</p>
          <p>3. Format lisensi: <code className="font-mono">OEM (jumlah)</code> atau <code className="font-mono">OLP (jumlah)</code></p>
          <p>4. Serial number yang sudah ada akan diperbarui (upsert)</p>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value="" }}>Reset</Button>
        <Button onClick={handleImport} disabled={!file || importMut.isPending}>
          {importMut.isPending ? (
            <><CheckCircle2 className="mr-2 h-4 w-4 animate-spin"/>Mengimport...</>
          ) : (
            <><Upload className="mr-2 h-4 w-4"/>Mulai Import</>
          )}
        </Button>
      </div>
    </div>
  )
}