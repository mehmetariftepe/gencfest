import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { DownloadTicketButton } from "@/components/DownloadTicketButton";
import { Logo, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getDb } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { EVENT } from "@/lib/event";
import { ticketPublicKey } from "@/lib/keys";
import { ticketCode, verifyTicket } from "@/lib/token";

export const metadata: Metadata = { title: `Biletim · ${EVENT.name}`, robots: { index: false, follow: false } };

type PageProps = { params: Promise<{ token: string }>; searchParams: Promise<{ kayitli?: string }> };

export default async function TicketPage({ params, searchParams }: PageProps) {
  const token = decodeURIComponent((await params).token);
  const alreadyRegistered = (await searchParams).kayitli === "1";
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
    <>
      <SiteHeader cta={false} />
      <main className="container ticket-page">
        <div className="ticket-card">
          {state === null && (
            <div className="ticket-done">
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
              </svg>
            </div>
          )}
          <h1>{state !== null ? "Biletiniz" : alreadyRegistered ? "Zaten Kayıtlısınız" : "Biletiniz Oluşturuldu!"}</h1>
          <p>
            {alreadyRegistered && "Bu bilgilerle daha önce alınmış biletiniz aşağıdadır. "}
            Lütfen giriş turnikelerinde aşağıdaki QR kodu gösteriniz.
          </p>

          <article className="ticket" aria-label="Etkinlik bileti">
            <div className="ticket-head">
              <div className="ticket-event">
                <Logo size={28} />
                <div>
                  <span className="ticket-label">Etkinlik</span>
                  <b>ALUCRA GENÇFEST {EVENT.year}</b>
                </div>
              </div>
              <span className="ticket-free">ÜCRETSİZ GİRİŞ</span>
            </div>

            <div className="ticket-info">
              <div>
                <span className="ticket-label">Katılımcı:</span>
                <p className="ticket-name">{t.fullName}</p>
                <span className="badge">{ageLabel}</span>
              </div>
              <div className="ticket-meta">
                <div>
                  <span className="ticket-label">Tarih:</span>
                  <p>{EVENT.dateText}</p>
                </div>
                <div>
                  <span className="ticket-label">Kapı Açılışı:</span>
                  <p>{EVENT.doorsOpen}</p>
                </div>
              </div>
              <div className="ticket-meta">
                <div>
                  <span className="ticket-label">Lokasyon:</span>
                  <p>{EVENT.place}</p>
                </div>
                <div>
                  <span className="ticket-label">Bilet No:</span>
                  <p className="ticket-no">#{ticketCode(id)}</p>
                </div>
              </div>
            </div>

            <div className="ticket-qr">
              <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />
              <p className="ticket-hint">Bileti ekran görüntüsü olarak kaydedebilirsiniz</p>
            </div>

            {state && (
              <div className={`ticket-state ${state}`}>
                <span>{state === "cancelled" ? "İptal edildi" : "Kullanıldı"}</span>
              </div>
            )}
          </article>

          <div className="ticket-actions">
            <DownloadTicketButton token={token} fullName={t.fullName} ageLabel={ageLabel} code={ticketCode(id)} />
          </div>
        </div>

        <ul className="tips">
          <li>Girişte bu QR kodunu göstermen yeterli. Ekran parlaklığını açman okutmayı hızlandırır.</li>
          <li>QR kod sana özeldir, kimseyle paylaşma. İlk okutmada geçerlidir.</li>
          <li>Bu sayfanın bağlantısını saklarsan biletine tekrar ulaşabilirsin.</li>
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
