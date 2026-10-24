import { eq } from "drizzle-orm";
import Link from "next/link";
import { AutoRefresh } from "@/components/AdminWidgets";
import { getStats, recentCheckins } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { ageLabel, fmtTime } from "@/lib/format";
import { ensureSettings } from "@/lib/register";

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export default async function AdminHome() {
  const db = await getDb();
  await ensureSettings(db);
  const [[s], st, recent] = await Promise.all([
    db.select().from(settings).where(eq(settings.id, 1)),
    getStats(db),
    recentCheckins(db),
  ]);
  const remaining = s.capacity === null ? null : Math.max(0, s.capacity - st.active);

  return (
    <>
      <AutoRefresh />
      <div className="page-head">
        <h1>Özet</h1>
        <span className={`pill ${s.registrationOpen ? "pill-ok" : "pill-off"}`}>
          Kayıt {s.registrationOpen ? "açık" : "kapalı"}
        </span>
      </div>

      <div className="stats">
        <div className="stat stat-hero">
          <div className="stat-label">İçeride (bileklik verilen)</div>
          <div className="stat-value">{st.inside}</div>
          <div className="meter">
            <span style={{ width: `${pct(st.inside, st.active)}%` }} />
          </div>
          <div className="stat-sub">Kayıtlıların %{pct(st.inside, st.active)}&apos;i giriş yaptı</div>
        </div>
        <div className="stat">
          <div className="stat-label">Kayıtlı</div>
          <div className="stat-value">{st.active}</div>
          <div className="stat-sub">Son 24 saatte +{st.last24h}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Kalan kontenjan</div>
          <div className="stat-value">{remaining === null ? "∞" : remaining}</div>
          <div className="stat-sub">{s.capacity === null ? "Sınır yok" : `Kontenjan ${s.capacity}`}</div>
        </div>
        <div className="stat">
          <div className="stat-label">İptal</div>
          <div className="stat-value">{st.cancelled}</div>
        </div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <h2>Yaş grubu dağılımı</h2>
          {[
            ["18 yaş altı", st.under18, st.under18Inside],
            ["18 yaş ve üstü", st.adult, st.adultInside],
          ].map(([label, total, inside]) => (
            <div key={label} className="dist">
              <div className="dist-head">
                <span>{label}</span>
                <span>
                  <strong>{total}</strong> kayıt · {inside} içeride
                </span>
              </div>
              <div className="meter">
                <span style={{ width: `${pct(Number(total), st.active)}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Son girişler</h2>
          {recent.length === 0 ? (
            <p className="muted">Henüz giriş yok.</p>
          ) : (
            <ul className="feed">
              {recent.map((r, i) => (
                <li key={i}>
                  <span className="feed-time">{fmtTime(r.checkedInAt!)}</span>
                  <span className="feed-name">{r.fullName}</span>
                  <span className="muted">
                    {ageLabel(r.ageGroup)} · {r.staffName ?? "Yönetici"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/yonetim/katilimcilar?filtre=inside" className="muted">
            Tümünü gör →
          </Link>
        </section>
      </div>
      <p className="muted" style={{ fontSize: "0.82rem" }}>
        Bu sayfa 15 saniyede bir kendiliğinden yenilenir.
      </p>
    </>
  );
}
