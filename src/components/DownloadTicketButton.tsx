"use client";

import QRCode from "qrcode";
import { useState } from "react";
import { EVENT } from "@/lib/event";

type Props = { token: string; fullName: string; ageLabel: string; code: string };

// next/font'un ürettiği yazı tipi adını CSS değişkeninden alır; canvas da sayfayla aynı fontu kullansın.
const fontVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "system-ui";

// Sayfadaki bilet tasarımının aynısını tek bir PNG'ye çizer (telefonda galeriye kaydedilebilir).
async function renderTicketPng({ token, fullName, ageLabel, code }: Props): Promise<Blob> {
  await document.fonts.ready;
  const display = fontVar("--font-display");
  const body = fontVar("--font-body");

  const W = 1080;
  const H = 1720;
  const HEAD = 560;
  const R = 56;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Arka plan (sahne)
  ctx.fillStyle = "#07040f";
  ctx.fillRect(0, 0, W, H);

  // Bilet gövdesi: yuvarlatılmış kart + koparma çentikleri
  const x = 70;
  const y = 70;
  const w = W - 140;
  const h = H - 140;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, R);
  ctx.clip();

  const head = ctx.createLinearGradient(x, y, x + w, y + HEAD);
  head.addColorStop(0, "#ff2e88");
  head.addColorStop(0.5, "#7c3aed");
  head.addColorStop(1, "#22d3ee");
  ctx.fillStyle = head;
  ctx.fillRect(x, y, w, HEAD);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y + HEAD, w, h - HEAD);
  ctx.restore();

  ctx.fillStyle = "#07040f";
  for (const cx of [x, x + w]) {
    ctx.beginPath();
    ctx.arc(cx, y + HEAD, 36, 0, Math.PI * 2);
    ctx.fill();
  }

  // Kesik çizgi
  ctx.strokeStyle = "#d7d3e6";
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(x + 60, y + HEAD);
  ctx.lineTo(x + w - 60, y + HEAD);
  ctx.stroke();
  ctx.setLineDash([]);

  // Başlık alanı
  const left = x + 64;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = `700 26px ${body}`;
  ctx.fillText("GİRİŞ BİLETİ", left, y + 90);
  ctx.textAlign = "right";
  ctx.fillText("ÜCRETSİZ", x + w - 64, y + 90);
  ctx.textAlign = "left";
  ctx.font = `600 40px ${display}`;
  ctx.fillText("A L U C R A", left, y + 215);
  ctx.font = `900 124px ${display}`;
  ctx.fillText("GENÇFEST", left - 4, y + 335, w - 128);

  const metas: [string, string][] = [
    ["TARİH", EVENT.dateText],
    ["GÜN", EVENT.weekday],
    ["YER", EVENT.place],
  ];
  let mx = left;
  for (const [label, value] of metas) {
    ctx.globalAlpha = 0.8;
    ctx.font = `700 22px ${body}`;
    ctx.fillText(label, mx, y + 440);
    ctx.globalAlpha = 1;
    ctx.font = `600 34px ${body}`;
    ctx.fillText(value, mx, y + 485);
    mx += ctx.measureText(value).width + 70;
  }

  // QR: okuyucular için beyaz zemin üstünde siyah
  const qrSize = 640;
  const qr = document.createElement("canvas");
  await QRCode.toCanvas(qr, token, { width: qrSize, margin: 1, errorCorrectionLevel: "M" });
  ctx.drawImage(qr, (W - qrSize) / 2, y + HEAD + 70);

  ctx.textAlign = "center";
  ctx.fillStyle = "#16161d";
  ctx.font = `800 52px ${display}`;
  ctx.fillText(fullName, W / 2, y + HEAD + qrSize + 160, w - 120);

  ctx.font = `700 30px ${body}`;
  const badge = ageLabel;
  const bw = ctx.measureText(badge).width + 56;
  ctx.fillStyle = "#f1ecfd";
  ctx.beginPath();
  ctx.roundRect(W / 2 - bw / 2, y + HEAD + qrSize + 195, bw, 56, 28);
  ctx.fill();
  ctx.fillStyle = "#5b21b6";
  ctx.fillText(badge, W / 2, y + HEAD + qrSize + 234);

  ctx.fillStyle = "#6b6880";
  ctx.font = `500 28px ui-monospace, Menlo, monospace`;
  ctx.fillText(`#${code}`, W / 2, y + HEAD + qrSize + 310);

  ctx.fillStyle = "#a69dc6";
  ctx.font = `500 26px ${body}`;
  ctx.fillText("Girişte bu QR kodunu göster · Kişiye özeldir", W / 2, H - 30);

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
    <button type="button" className="btn btn-block" onClick={download} disabled={busy}>
      {busy ? "Hazırlanıyor…" : "Bileti indir (PNG)"}
    </button>
  );
}
