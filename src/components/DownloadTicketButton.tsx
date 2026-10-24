"use client";

import QRCode from "qrcode";
import { EVENT } from "@/lib/event";

// Bileti tek bir PNG görsel olarak çizip indirir (PDF'e gerek kalmadan telefonda galeriye kaydedilebilir).
async function renderTicketPng(token: string, fullName: string): Promise<Blob> {
  const W = 800;
  const H = 1100;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#5b2bd6";
  ctx.fillRect(0, 0, W, 170);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 56px system-ui, sans-serif";
  ctx.fillText(EVENT.name, W / 2, 95);
  ctx.font = "30px system-ui, sans-serif";
  ctx.fillText(`${EVENT.dateText} · ${EVENT.place}`, W / 2, 145);

  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, token, { width: 620, margin: 2, errorCorrectionLevel: "M" });
  ctx.drawImage(qr, (W - 620) / 2, 220);

  ctx.fillStyle = "#16161d";
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText(fullName, W / 2, 920, W - 80);
  ctx.fillStyle = "#5d5d6b";
  ctx.font = "26px system-ui, sans-serif";
  ctx.fillText("Girişte bu QR kodunu gösterin · Kişiye özeldir", W / 2, 990);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG oluşturulamadı"))), "image/png"));
}

export function DownloadTicketButton({ token, fullName }: { token: string; fullName: string }) {
  async function download() {
    const blob = await renderTicketPng(token, fullName);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gencfest-bilet.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <button type="button" className="btn" onClick={download}>
      Bileti indir (PNG)
    </button>
  );
}
