import { count, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { settings, tickets } from "@/lib/db/schema";
import { ensureSettings } from "@/lib/register";

export default async function AdminHome() {
  const db = await getDb();
  await ensureSettings(db);
  const [[s], [c]] = await Promise.all([
    db.select().from(settings).where(eq(settings.id, 1)),
    db
      .select({
        active: count(),
        checkedIn: sql<number>`count(${tickets.checkedInAt})::int`,
        under18: sql<number>`count(*) filter (where ${tickets.ageGroup} = 'under18')::int`,
      })
      .from(tickets)
      .where(eq(tickets.status, "active")),
  ]);

  const pct = c.active ? Math.round((c.checkedIn / c.active) * 100) : 0;

  return (
    <>
      <h1>Özet</h1>
      <div className="stats">
        <div className="stat">
          <div className="stat-label">Kayıt</div>
          <div className="stat-value">{c.active}</div>
          <div className="stat-sub">{s.capacity ? `Kontenjan ${s.capacity}` : "Kontenjan sınırsız"}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Giriş / bileklik</div>
          <div className="stat-value">{c.checkedIn}</div>
          <div className="stat-sub">Kayıtların %{pct}&apos;i</div>
        </div>
        <div className="stat">
          <div className="stat-label">18 yaş altı</div>
          <div className="stat-value">{c.under18}</div>
        </div>
        <div className="stat">
          <div className="stat-label">18 yaş ve üstü</div>
          <div className="stat-value">{c.active - c.under18}</div>
        </div>
      </div>
      <p className="muted">
        Kayıt durumu: <strong>{s.registrationOpen ? "Açık" : "Kapalı"}</strong>. Katılımcı listesi, iptal ve
        kontenjan ayarları bir sonraki adımda eklenecek.
      </p>
    </>
  );
}
