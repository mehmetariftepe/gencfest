import Link from "next/link";
import { cancelTicket, manualCheckIn, restoreTicket, undoCheckIn } from "@/actions/admin";
import { ConfirmButton } from "@/components/AdminWidgets";
import { listTickets, type TicketFilter } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { ageLabel, fmtDateTime } from "@/lib/format";
import { ticketSecretKey } from "@/lib/keys";
import { signTicket, ticketCode } from "@/lib/token";

const FILTERS: [TicketFilter, string][] = [
  ["all", "Tümü"],
  ["waiting", "Gelmedi"],
  ["inside", "İçeride"],
  ["cancelled", "İptal"],
];

type Search = { q?: string; filtre?: string; sayfa?: string };

export default async function AttendeesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const filter = (FILTERS.find(([f]) => f === sp.filtre)?.[0] ?? "all") as TicketFilter;
  const { rows, total, page, pages } = await listTickets(await getDb(), { q, filter, page: Number(sp.sayfa) || 1 });
  const secret = ticketSecretKey();
  const links = await Promise.all(rows.map((r) => signTicket(r.id, secret)));

  const query = (over: Partial<Search> = {}) => {
    const p = new URLSearchParams({ ...(q && { q }), ...(filter !== "all" && { filtre: filter }), ...over });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    return p.size ? `?${p}` : "";
  };
  const href = (over: Partial<Search>) => `/yonetim/katilimcilar${query(over)}`;

  return (
    <>
      <div className="page-head">
        <h1>Katılımcılar</h1>
        <a href={`/yonetim/disa-aktar${query()}`} className="btn btn-ghost btn-sm">
          CSV indir (Excel)
        </a>
      </div>

      <form className="toolbar" action="/yonetim/katilimcilar">
        <input name="q" className="input" placeholder="İsim, e-posta veya telefon ara…" defaultValue={q} />
        {filter !== "all" && <input type="hidden" name="filtre" value={filter} />}
        <button className="btn btn-sm">Ara</button>
      </form>
      <nav className="tabs">
        {FILTERS.map(([f, label]) => (
          <Link key={f} href={href({ filtre: f === "all" ? "" : f, sayfa: "" })} className={f === filter ? "active" : ""}>
            {label}
          </Link>
        ))}
        <span className="muted" style={{ marginLeft: "auto" }}>
          {total} kişi
        </span>
      </nav>

      {rows.length === 0 ? (
        <p className="muted">Sonuç yok.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ad soyad</th>
                <th>İletişim</th>
                <th>Yaş</th>
                <th>Durum</th>
                <th>Kayıt</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.fullName}</strong>
                    <div className="ticket-no">#{ticketCode(r.id)}</div>
                  </td>
                  <td>
                    {r.email}
                    <div className="muted">{r.phone}</div>
                  </td>
                  <td>{ageLabel(r.ageGroup)}</td>
                  <td>
                    {r.status === "cancelled" ? (
                      <span className="pill pill-err">İptal</span>
                    ) : r.checkedInAt ? (
                      <>
                        <span className="pill pill-ok">İçeride</span>
                        <div className="muted">
                          {fmtDateTime(r.checkedInAt)} · {r.staffName ?? "Yönetici"}
                        </div>
                      </>
                    ) : (
                      <span className="pill pill-off">Gelmedi</span>
                    )}
                  </td>
                  <td className="muted">{fmtDateTime(r.createdAt)}</td>
                  <td>
                    <div className="actions">
                      <a href={`/bilet/${links[i]}`} target="_blank" className="btn btn-ghost btn-sm">
                        Bilet
                      </a>
                      {r.status === "active" && !r.checkedInAt && (
                        <form action={manualCheckIn}>
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmButton message={`${r.fullName} için elle giriş yapılsın mı?`}>Elle giriş</ConfirmButton>
                        </form>
                      )}
                      {r.status === "active" && r.checkedInAt && (
                        <form action={undoCheckIn}>
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmButton message={`${r.fullName} için giriş kaydı geri alınsın mı?`}>Girişi geri al</ConfirmButton>
                        </form>
                      )}
                      {r.status === "active" ? (
                        <form action={cancelTicket}>
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmButton message={`${r.fullName} adlı kişinin bileti iptal edilsin mi? Bilet kapıda reddedilir.`} className="btn btn-danger btn-sm">
                            İptal et
                          </ConfirmButton>
                        </form>
                      ) : (
                        <form action={restoreTicket}>
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmButton message={`${r.fullName} adlı kişinin bileti yeniden geçerli yapılsın mı?`}>Geri al</ConfirmButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="pager">
          {page > 1 && (
            <Link href={href({ sayfa: String(page - 1) })} className="btn btn-ghost btn-sm">
              ← Önceki
            </Link>
          )}
          <span className="muted">
            Sayfa {page} / {pages}
          </span>
          {page < pages && (
            <Link href={href({ sayfa: String(page + 1) })} className="btn btn-ghost btn-sm">
              Sonraki →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
