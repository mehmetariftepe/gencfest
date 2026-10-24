import { getSession } from "@/lib/auth";
import { listTickets, toCsv, type TicketFilter } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { fmtDateTime } from "@/lib/format";
import { ticketCode } from "@/lib/token";

// Panel listesiyle aynı arama/filtreyi uygular, tüm satırları (sayfalamasız) CSV olarak verir.
export async function GET(req: Request) {
  if ((await getSession())?.role !== "admin") return new Response("Yetkisiz", { status: 401 });

  const sp = new URL(req.url).searchParams;
  const filter = (["all", "inside", "waiting", "cancelled"].includes(sp.get("filtre") ?? "") ? sp.get("filtre") : "all") as TicketFilter;
  const { rows } = await listTickets(await getDb(), { q: sp.get("q") ?? "", filter, all: true });

  const csv = toCsv([
    ["Bilet No", "Ad Soyad", "E-posta", "Telefon", "Yaş Grubu", "Durum", "Kayıt", "Giriş", "Okutan"],
    ...rows.map((r) => [
      ticketCode(r.id),
      r.fullName,
      r.email,
      r.phone,
      r.ageGroup === "under18" ? "18 yaş altı" : "18 yaş ve üstü",
      r.status === "cancelled" ? "İptal" : r.checkedInAt ? "İçeride" : "Gelmedi",
      fmtDateTime(r.createdAt),
      r.checkedInAt ? fmtDateTime(r.checkedInAt) : "",
      r.checkedInAt ? (r.staffName ?? "Yönetici") : "",
    ]),
  ]);

  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="gencfest-katilimcilar-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
