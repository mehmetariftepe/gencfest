import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { DownloadTicketButton } from "@/components/DownloadTicketButton";
import { getDb } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { EVENT } from "@/lib/event";
import { ticketPublicKey } from "@/lib/keys";
import { ticketCode, verifyTicket } from "@/lib/token";

export const metadata: Metadata = { title: `Biletim · ${EVENT.name}`, robots: { index: false, follow: false } };

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  const token = decodeURIComponent((await params).token);
  const id = await verifyTicket(token, ticketPublicKey());
  if (!id) notFound();

  const db = await getDb();
  const [t] = await db
    .select({ fullName: tickets.fullName, ageGroup: tickets.ageGroup, status: tickets.status, checkedInAt: tickets.checkedInAt })
    .from(tickets)
    .where(eq(tickets.id, id));
  if (!t) notFound();

  const svg = await QRCode.toString(token, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
  const ageLabel = t.ageGroup === "under18" ? "18 yaş altı" : "18 yaş ve üstü";
  const state = t.status === "cancelled" ? "cancelled" : t.checkedInAt ? "used" : null;

  return (
    <div className="stage ticket-page">
      <div className="stage-fog" />
      <div className="container">
        <nav className="topbar">
          <Link href="/" className="brand">
            Alucra <span>GençFest</span>
          </Link>
        </nav>

        {state === null && (
          <p className="alert alert-ok" style={{ maxWidth: 400, margin: "0 auto 12px", textAlign: "center" }}>
            Kaydın tamam! Biletin hazır 🎉
          </p>
        )}

        <article className="ticket" aria-label="Etkinlik bileti">
          <div className="ticket-head">
            <div className="ticket-kicker">
              <span>Giriş bileti</span>
              <span>Ücretsiz</span>
            </div>
            <h1 className="ticket-title">
              <small>Alucra</small>
              GençFest
            </h1>
            <div className="ticket-meta">
              <div>
                <b>Tarih</b>
                {EVENT.dateText}
              </div>
              <div>
                <b>Gün</b>
                {EVENT.weekday}
              </div>
              <div>
                <b>Yer</b>
                {EVENT.place}
              </div>
            </div>
          </div>

          <div className="ticket-body">
            <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="ticket-name">{t.fullName}</p>
            <div className="ticket-row">
              <span className="badge">{ageLabel}</span>
              <span className="ticket-no">#{ticketCode(id)}</span>
            </div>
            {state && (
              <div className={`ticket-state ${state}`}>
                <span>{state === "cancelled" ? "İptal edildi" : "Kullanıldı"}</span>
              </div>
            )}
          </div>
        </article>

        <div className="ticket-actions">
          <DownloadTicketButton token={token} fullName={t.fullName} ageLabel={ageLabel} code={ticketCode(id)} />
        </div>

        <ul className="tips">
          <li>Girişte bu QR kodunu göstermen yeterli. Ekran parlaklığını açman okutmayı hızlandırır.</li>
          <li>QR kod sana özeldir, kimseyle paylaşma. İlk okutmada geçerlidir.</li>
          <li>Bu sayfanın bağlantısını saklarsan biletine tekrar ulaşabilirsin.</li>
        </ul>
      </div>
    </div>
  );
}
