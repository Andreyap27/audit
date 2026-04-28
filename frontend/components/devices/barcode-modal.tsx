"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

interface BarcodeModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  serialNumber: string;
  deviceInfo?: {
    userName?: string | null;
    department?: string | null;
    unitType?: string | null;
  };
}

function downloadSvgAsPng(svgEl: SVGElement, filename: string) {
  const bbox = svgEl.getBoundingClientRect();
  const width = bbox.width || svgEl.viewBox?.baseVal?.width || 300;
  const height = bbox.height || svgEl.viewBox?.baseVal?.height || 300;

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svgEl);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename;
    a.click();
  };
  img.src = url;
}

export function BarcodeModal({
  open,
  onOpenChange,
  serialNumber,
  deviceInfo,
}: BarcodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    downloadSvgAsPng(svg, `QR-${serialNumber}.png`);
  };

  const handleDownloadBarcode = () => {
    const svg = barcodeRef.current?.querySelector("svg");
    if (!svg) return;
    downloadSvgAsPng(svg, `Barcode-${serialNumber}.png`);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=500,height=700");
    if (!printWindow) return;

    const qrSvg = qrRef.current?.querySelector("svg")?.outerHTML ?? "";
    const barcodeSvg = barcodeRef.current?.querySelector("svg")?.outerHTML ?? "";

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Label - ${serialNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      gap: 16px;
    }
    .qr svg { width: 180px; height: 180px; }
    .barcode svg { width: 280px; }
    .serial { font-size: 15px; font-weight: 700; letter-spacing: 1px; }
    .meta { font-size: 12px; color: #555; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="qr">${qrSvg}</div>
  <div class="barcode">${barcodeSvg}</div>
  <p class="serial">${serialNumber}</p>
  ${deviceInfo?.userName ? `<p class="meta">${deviceInfo.userName}</p>` : ""}
  ${deviceInfo?.department ? `<p class="meta">${deviceInfo.department}</p>` : ""}
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Label Perangkat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          {/* QR Code + Barcode side by side */}
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">QR Code</p>
              <div ref={qrRef} className="rounded-lg border bg-white p-3">
                <QRCodeSVG
                  value={serialNumber}
                  size={110}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleDownloadQr}
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Download QR
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">Barcode</p>
              <div ref={barcodeRef} className="rounded-lg border bg-white p-2 flex items-center justify-center h-[138px]">
                <Barcode
                  value={serialNumber || " "}
                  width={1.2}
                  height={60}
                  fontSize={10}
                  margin={0}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleDownloadBarcode}
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="w-full text-center">
            <p className="font-mono font-semibold tracking-wider">{serialNumber}</p>
            {deviceInfo?.userName && (
              <p className="text-sm text-muted-foreground">{deviceInfo.userName}</p>
            )}
            {(deviceInfo?.department || deviceInfo?.unitType) && (
              <p className="text-xs text-muted-foreground">
                {[deviceInfo.department, deviceInfo.unitType].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Print QR + Barcode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
