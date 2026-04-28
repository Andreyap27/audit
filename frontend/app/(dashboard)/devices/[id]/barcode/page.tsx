"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useDevice } from "@/hooks/use-devices";

function downloadSvgAsPng(svgEl: SVGElement, filename: string) {
  const bbox = svgEl.getBoundingClientRect();
  const width = bbox.width || svgEl.viewBox?.baseVal?.width || 300;
  const height = bbox.height || svgEl.viewBox?.baseVal?.height || 300;

  const svgStr = new XMLSerializer().serializeToString(svgEl);
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

export default function DeviceBarcodePage() {
  const { id } = useParams<{ id: string }>();
  const { data: device, isLoading } = useDevice(id);
  const qrRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  const serialNumber = device?.serialNumber ?? "";

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (svg) downloadSvgAsPng(svg, `QR-${serialNumber}.png`);
  };

  const handleDownloadBarcode = () => {
    const svg = barcodeRef.current?.querySelector("svg");
    if (svg) downloadSvgAsPng(svg, `Barcode-${serialNumber}.png`);
  };

  const handlePrint = () => {
    const qrSvg = qrRef.current?.querySelector("svg")?.outerHTML ?? "";
    const barcodeSvg = barcodeRef.current?.querySelector("svg")?.outerHTML ?? "";
    const printWindow = window.open("", "_blank", "width=520,height=700");
    if (!printWindow) return;

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
      gap: 20px;
    }
    .qr svg { width: 200px; height: 200px; }
    .barcode svg { width: 320px; }
    .serial { font-size: 16px; font-weight: 700; letter-spacing: 1px; }
    .meta { font-size: 12px; color: #555; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <div class="qr">${qrSvg}</div>
  <div class="barcode">${barcodeSvg}</div>
  <p class="serial">${serialNumber}</p>
  ${device?.userName ? `<p class="meta">${device.userName}</p>` : ""}
  ${device?.department?.code ? `<p class="meta">${device.department.code}</p>` : ""}
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/devices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Label Perangkat</h1>
          <p className="text-muted-foreground">
            QR Code dan Barcode untuk perangkat ini
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-48 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Info perangkat */}
          <Card>
            <CardHeader>
              <CardTitle>{serialNumber}</CardTitle>
              <CardDescription>
                {[device?.userName, device?.department?.code, device?.unitType?.name]
                  .filter(Boolean)
                  .join(" · ")}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* QR + Barcode */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>
                  Scan untuk melihat informasi perangkat
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div ref={qrRef} className="rounded-xl border bg-white p-6">
                  <QRCodeSVG
                    value={serialNumber}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadQr}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Barcode 1D */}
            <Card>
              <CardHeader>
                <CardTitle>Barcode</CardTitle>
                <CardDescription>
                  Barcode standar CODE128 dari serial number
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div
                  ref={barcodeRef}
                  className="flex w-full items-center justify-center rounded-xl border bg-white py-6"
                >
                  <Barcode
                    value={serialNumber || " "}
                    width={2}
                    height={100}
                    fontSize={14}
                    margin={8}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadBarcode}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Barcode
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Print */}
          <div className="flex justify-end">
            <Button size="lg" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print QR + Barcode
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
