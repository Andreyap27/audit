"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"
import { useExportExcel } from "@/hooks/use-import-export"
import { useDepartments } from "@/hooks/use-master"

export default function ExportPage() {
  const [selectedDepts, setSelectedDepts] = useState<number[]>([])
  const { data: departments, isLoading } = useDepartments()
  const exportMut = useExportExcel()

  const toggleDept = (id: string) => {
    setSelectedDepts(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id])
  }

  const toggleAll = () => {
    const all = (departments ?? []).map((d: { id: string }) => d.id)
    setSelectedDepts(p => p.length === all.length ? [] : all)
  }

  const handleExport = () => {
    exportMut.mutate(selectedDepts.length > 0 ? selectedDepts : undefined, {
      onSuccess: () => toast.success("File Excel berhasil diunduh"),
      onError: () => toast.error("Gagal export Excel"),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground">Download data inventaris dalam format Excel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Departemen</CardTitle>
          <CardDescription>Kosongkan untuk export semua departemen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <>
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  id="all"
                  checked={(departments ?? []).length > 0 && selectedDepts.length === (departments ?? []).length}
                  onCheckedChange={toggleAll}
                />
                <Label htmlFor="all" className="font-medium cursor-pointer">Pilih Semua</Label>
              </div>
              {(departments ?? []).map((d: { id: string; name: string; code: string }) => (
                <div key={d.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`dept-${d.id}`}
                    checked={selectedDepts.includes(d.id)}
                    onCheckedChange={() => toggleDept(d.id)}
                  />
                  <Label htmlFor={`dept-${d.id}`} className="cursor-pointer">{d.code} — {d.name}</Label>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <FileSpreadsheet className="h-8 w-8 text-green-600"/>
            <div>
              <p className="font-medium">IT_Audit_Inventory.xlsx</p>
              <p className="text-sm text-muted-foreground">
                {selectedDepts.length === 0
                  ? `Semua departemen (${(departments ?? []).length} sheet)`
                  : `${selectedDepts.length} departemen dipilih`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleExport} disabled={exportMut.isPending}>
          <Download className="mr-2 h-4 w-4"/>
          {exportMut.isPending ? "Memproses..." : "Download Excel"}
        </Button>
      </div>
    </div>
  )
}