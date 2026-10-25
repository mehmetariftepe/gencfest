"use client";

import QRCode from "qrcode";
import { useState } from "react";
import { EVENT } from "@/lib/event";

type Props = { token: string; fullName: string; ageLabel: string; code: string };

// next/font'un ürettiği yazı tipi adını CSS değişkeninden alır; canvas da sayfayla aynı fontu kullansın.
const fontVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "system-ui";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Yuvarlak köşeli hap (rozet) çizer; metin dikeyde ortalanır.
function pill(ctx: CanvasRenderingContext2D, text: string, x: number, cy: number, align: "left" | "right", bg: string, fg: string) {
  const w = ctx.measureText(text).width + 40;
  const h = 48;
  const left = align === "left" ? x : x - w;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(left, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, left + w / 2, cy + 1);
  ctx.textBaseline = "alphabetic";
}

// Sayfadaki bilet tasarımının aynısını tek bir PNG'ye çizer (telefonda galeriye kaydedilebilir).
async function renderTicketPng({ token, fullName, ageLabel, code }: Props): Promise<Blob> {
  await document.fonts.ready;
  const font = fontVar("--font-body");
  const logo = await loadImage(EVENT.logo);

  const W = 1080;
  const H = 1572;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Arka plan: açık zemin, üstte altın ışık
  ctx.fillStyle = "#eef2f9";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 900);
  glow.addColorStop(0, "rgba(212,175,55,0.28)");
  glow.addColorStop(1, "rgba(212,175,55,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Dış kart
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#fde68a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(60, 60, W - 120, H - 120, 56);
  ctx.fill();
  ctx.stroke();

  // İç bilet kutusu
  const ix = 116;
  const iy = 116;
  const iw = W - 232;
  const ih = 1340;
  const box = ctx.createLinearGradient(0, iy, 0, iy + ih);
  box.addColorStop(0, "#f8fafc");
  box.addColorStop(1, "#f1f5f9");
  ctx.fillStyle = box;
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, 36);
  ctx.fill();
  ctx.stroke();

  const left = ix + 44;
  const right = ix + iw - 44;

  // Başlık: logo + etkinlik adı + ücretsiz rozeti
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(left + 38, iy + 82, 38, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, left, iy + 44, 76, 76);
    ctx.restore();
  }
  const tx = logo ? left + 96 : left;
  ctx.textAlign = "left";
  ctx.fillStyle = "#94a3b8";
  ctx.font = `600 22px ${font}`;
  ctx.fillText("ETKİNLİK", tx, iy + 72);
  ctx.fillStyle = "#0a2240";
  ctx.font = `900 34px ${font}`;
  ctx.fillText(`ALUCRA GENÇFEST ${EVENT.year}`, tx, iy + 112);
  ctx.font = `700 24px ${font}`;
  pill(ctx, "ÜCRETSİZ GİRİŞ", right, iy + 82, "right", "#d1fae5", "#065f46");

  // Kesik ayraç
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(left, iy + 160);
  ctx.lineTo(right, iy + 160);
  ctx.stroke();
  ctx.setLineDash([]);

  // Katılımcı
  const label = (text: string, x: number, y: number, align: CanvasTextAlign = "left") => {
    ctx.textAlign = align;
    ctx.fillStyle = "#94a3b8";
    ctx.font = `600 22px ${font}`;
    ctx.fillText(text, x, y);
  };
  label("KATILIMCI:", left, iy + 215);
  ctx.fillStyle = "#0a2240";
  ctx.font = `800 46px ${font}`;
  ctx.fillText(fullName, left, iy + 270, iw - 88);
  ctx.font = `700 24px ${font}`;
  pill(ctx, ageLabel, left, iy + 325, "left", "#dbeafe", "#0a2240");

  // Bilgi satırları
  const rows: [string, string, string, string][] = [
    ["TARİH:", EVENT.dateText, "KAPI AÇILIŞI:", EVENT.doorsOpen],
    ["LOKASYON:", EVENT.place, "BİLET NO:", `#${code}`],
  ];
  rows.forEach(([l1, v1, l2, v2], i) => {
    const top = iy + 380 + i * 120;
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(left, top, right - left, 2);
    label(l1, left, top + 45);
    label(l2, right, top + 45, "right");
    ctx.font = `600 32px ${font}`;
    ctx.fillStyle = "#334155";
    ctx.textAlign = "left";
    ctx.fillText(v1, left, top + 88);
    ctx.textAlign = "right";
    if (l2 === "BİLET NO:") {
      ctx.fillStyle = "#b45309";
      ctx.font = `700 30px ui-monospace, Menlo, monospace`;
    }
    ctx.fillText(v2, right, top + 88);
  });

  // QR: okuyucular için beyaz zemin üstünde siyah
  const qrSize = 560;
  const qrBox = qrSize + 48;
  const qx = (W - qrBox) / 2;
  const qy = iy + 640;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(qx, qy, qrBox, qrBox, 28);
  ctx.fill();
  ctx.stroke();
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, token, { width: qrSize, margin: 1, errorCorrectionLevel: "M" });
  ctx.drawImage(qr, qx + 24, qy + 24);

  ctx.textAlign = "center";
  ctx.fillStyle = "#64748b";
  ctx.font = `500 24px ${font}`;
  ctx.fillText("Girişte bu QR kodunu göster · Kişiye özeldir", W / 2, qy + qrBox + 56);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG oluşturulamadı"))), "image/png"),
  );
}

export function DownloadTicketButton(props: Props) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const blob = await renderTicketPng(props);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gencfest-bilet.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="btn btn-block btn-lg" onClick={download} disabled={busy}>
      {busy ? "Hazırlanıyor…" : "Bileti indir (PNG)"}
    </button>
  );
}
