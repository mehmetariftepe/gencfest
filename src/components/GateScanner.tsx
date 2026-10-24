"use client";

import type QrScanner from "qr-scanner";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/actions/auth";
import { playError, playOk, unlockAudio } from "@/lib/sounds";

type AgeGroup = "under18" | "adult";
type Result =
  | { status: "ok"; fullName: string; ageGroup: AgeGroup }
  | { status: "used"; fullName: string; ageGroup: AgeGroup; usedAt: string; usedBy: string }
  | { status: "cancelled"; fullName: string; ageGroup: AgeGroup }
  | { status: "not_found" | "invalid" | "network" };

const SAME_CODE_COOLDOWN_MS = 4000; // aynı QR kamerada kalırsa tekrar tekrar okutulmasın
const OK_SHOW_MS = 2200;
const ERR_SHOW_MS = 4500;

const ageLabel = (a: AgeGroup) => (a === "under18" ? "18 YAŞ ALTI" : "18 YAŞ VE ÜSTÜ");
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

export function GateScanner({ who, role }: { who: string; role: "staff" | "admin" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const busy = useRef(false);
  const last = useRef<{ data: string; at: number } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [started, setStarted] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => () => scannerRef.current?.destroy(), []);

  async function start() {
    unlockAudio();
    setCamError(null);
    try {
      const { default: QrScannerLib } = await import("qr-scanner");
      const scanner = new QrScannerLib(videoRef.current!, (r) => void onScan(r.data), {
        preferredCamera: "environment",
        maxScansPerSecond: 10,
        returnDetailedScanResult: true,
      });
      await scanner.start();
      scannerRef.current = scanner;
      setHasFlash(await scanner.hasFlash());
      setStarted(true);
    } catch {
      setCamError("Kameraya erişilemedi. Tarayıcıda kamera iznini verip tekrar deneyin.");
    }
  }

  async function toggleFlash() {
    await scannerRef.current?.toggleFlash();
    setFlashOn(scannerRef.current?.isFlashOn() ?? false);
  }

  async function onScan(data: string) {
    const now = Date.now();
    if (busy.current) return;
    if (last.current?.data === data && now - last.current.at < SAME_CODE_COOLDOWN_MS) return;
    busy.current = true;
    last.current = { data, at: now };

    let res: Result;
    try {
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: data }),
      });
      if (r.status === 401) {
        window.location.href = "/kapi/giris";
        return;
      }
      res = r.ok ? await r.json() : { status: "network" };
    } catch {
      res = { status: "network" };
    }
    show(res);
  }

  function show(res: Result) {
    setResult(res);
    if (res.status === "ok") {
      setCount((c) => c + 1);
      playOk();
      navigator.vibrate?.(150);
    } else {
      playError();
      navigator.vibrate?.([250, 100, 250]);
    }
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(dismiss, res.status === "ok" ? OK_SHOW_MS : ERR_SHOW_MS);
  }

  function dismiss() {
    clearTimeout(hideTimer.current);
    setResult(null);
    busy.current = false;
  }

  return (
    <div className="gate">
      <header className="gate-bar">
        <div className="gate-who">
          {who}
          <small>{role === "admin" ? "Yönetici · Kapı" : "Kapı görevlisi"}</small>
        </div>
        <div className="gate-count">
          {count}
          <small>Bu cihazda giriş</small>
        </div>
        <form action={logout}>
          <input type="hidden" name="to" value="kapi" />
          <button className="btn btn-ghost btn-sm">Çıkış</button>
        </form>
      </header>

      <div className="gate-view">
        <video ref={videoRef} playsInline muted />
        {started ? (
          <>
            <div className="gate-frame" />
            {hasFlash && (
              <div className="gate-tools">
                <button type="button" className="btn btn-ghost btn-sm" onClick={toggleFlash}>
                  {flashOn ? "Feneri kapat" : "Fener"}
                </button>
              </div>
            )}
            <p className="gate-hint">QR kodu çerçevenin içine getirin</p>
          </>
        ) : (
          <div className="gate-start">
            <h1 className="display" style={{ margin: 0, fontSize: "1.8rem" }}>
              Kapı kontrolü
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Kamerayı açıp bilet QR kodlarını okutun. Sesin açık olduğundan emin olun.
            </p>
            <button type="button" className="btn" onClick={start}>
              Okutmaya başla
            </button>
            {camError && <p className="alert alert-err">{camError}</p>}
          </div>
        )}
      </div>

      {result && <ResultScreen result={result} onClose={dismiss} />}
    </div>
  );
}

function ResultScreen({ result, onClose }: { result: Result; onClose: () => void }) {
  let tone: "ok" | "err" | "warn" = "err";
  let icon = "✕";
  let title: string;
  let action: string | null = null;
  let detail: string | null = null;
  let person: { fullName: string; ageGroup: AgeGroup } | null = null;

  switch (result.status) {
    case "ok":
      tone = "ok";
      icon = "✓";
      title = "Geçerli";
      action = "Bileklik tak";
      person = result;
      break;
    case "used":
      title = "Kullanılmış";
      detail = `${time(result.usedAt)} · ${result.usedBy}`;
      person = result;
      break;
    case "cancelled":
      title = "İptal edilmiş";
      detail = "Bu bilet geçersiz";
      person = result;
      break;
    case "network":
      tone = "warn";
      icon = "!";
      title = "Bağlantı yok";
      detail = "İnternet bağlantısını kontrol edip tekrar okutun";
      break;
    default:
      title = "Geçersiz";
      detail = "Bu QR kod GençFest bileti değil";
  }

  return (
    <div className={`result result-${tone}`} onClick={onClose} role="alert">
      <div className="result-icon">{icon}</div>
      <div className="result-title">{title}</div>
      {action && <div className="result-action">{action}</div>}
      {person && (
        <>
          <div className="result-name">{person.fullName}</div>
          <span className="result-badge">{ageLabel(person.ageGroup)}</span>
        </>
      )}
      {detail && <div className="result-detail" style={{ marginTop: 10 }}>{detail}</div>}
      <div className="result-tap">Devam etmek için dokunun</div>
    </div>
  );
}
