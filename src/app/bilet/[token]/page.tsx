import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { DownloadTicketButton } from "@/components/DownloadTicketButton";
import { getDb } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { EVENT } from "@/lib/event";
import { ticketPublicKey } from "@/lib/keys";
import { verifyTicket } from "@/lib/token";

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

  return (
    <main>
      <div className="card ticket">
        <p className="ticket-event">{EVENT.name}</p>
        <p className="muted">
          {EVENT.dateText} · {EVENT.place}
        </p>

        {t.status === "cancelled" && <p className="alert alert-err">Bu bilet iptal edilmiştir.</p>}
        {t.status === "active" && t.checkedInAt && <p className="alert alert-warn">Bu bilet ile giriş yapılmıştır.</p>}

        <div className="qr" dangerouslySetInnerHTML={{ __html: svg }} />

        <p className="ticket-name">{t.fullName}</p>
        <span className="badge">{t.ageGroup === "under18" ? "18 yaş altı" : "18 yaş ve üstü"}</span>
      </div>

      <DownloadTicketButton token={token} fullName={t.fullName} />

      <ul className="tips">
        <li>Girişte bu QR kodunu göstermen yeterli. Ekran görüntüsü alabilir veya biletini indirebilirsin.</li>
        <li>QR kod sana özeldir, kimseyle paylaşma. İlk okutmada geçerlidir.</li>
        <li>Bu sayfanın bağlantısını saklarsan biletine tekrar ulaşabilirsin.</li>
      </ul>
    </main>
  );
}
