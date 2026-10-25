import { and, count, desc, eq, ilike, isNotNull, isNull, like, or, sql, type SQL } from "drizzle-orm";
import type { Db } from "./db";
import { checkinConflicts, staff, tickets } from "./db/schema";

export type TicketFilter = "all" | "inside" | "waiting" | "cancelled";
export const PAGE_SIZE = 50;

function filterWhere(q: string, filter: TicketFilter): SQL | undefined {
  const conds: (SQL | undefined)[] = [];
  const term = q.trim();
  if (term) {
    const digits = term.replace(/\D/g, "").replace(/^0/, "");
    conds.push(
      or(
        ilike(tickets.fullName, `%${term}%`),
        ilike(tickets.email, `%${term}%`),
        digits.length >= 4 ? like(tickets.phone, `%${digits}%`) : undefined,
      ),
    );
  }
  if (filter === "inside") conds.push(eq(tickets.status, "active"), isNotNull(tickets.checkedInAt));
  if (filter === "waiting") conds.push(eq(tickets.status, "active"), isNull(tickets.checkedInAt));
  if (filter === "cancelled") conds.push(eq(tickets.status, "cancelled"));
  return and(...conds);
}

const listColumns = {
  id: tickets.id,
  fullName: tickets.fullName,
  email: tickets.email,
  phone: tickets.phone,
  ageGroup: tickets.ageGroup,
  status: tickets.status,
  createdAt: tickets.createdAt,
  checkedInAt: tickets.checkedInAt,
  staffName: staff.name,
};

export async function listTickets(db: Db, opts: { q?: string; filter?: TicketFilter; page?: number; all?: boolean }) {
  const where = filterWhere(opts.q ?? "", opts.filter ?? "all");
  const page = Math.max(1, opts.page ?? 1);
  const query = db
    .select(listColumns)
    .from(tickets)
    .leftJoin(staff, eq(staff.id, tickets.checkedInBy))
    .where(where)
    .orderBy(desc(tickets.createdAt));
  const rows = opts.all ? await query : await query.limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);
  const [{ total }] = await db.select({ total: count() }).from(tickets).where(where);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export type TicketRow = Awaited<ReturnType<typeof listTickets>>["rows"][number];

export async function getStats(db: Db) {
  const [s] = await db
    .select({
      active: sql<number>`count(*) filter (where ${tickets.status} = 'active')::int`,
      cancelled: sql<number>`count(*) filter (where ${tickets.status} = 'cancelled')::int`,
      inside: sql<number>`count(*) filter (where ${tickets.status} = 'active' and ${tickets.checkedInAt} is not null)::int`,
      under18: sql<number>`count(*) filter (where ${tickets.status} = 'active' and ${tickets.ageGroup} = 'under18')::int`,
      under18Inside: sql<number>`count(*) filter (where ${tickets.status} = 'active' and ${tickets.ageGroup} = 'under18' and ${tickets.checkedInAt} is not null)::int`,
      last24h: sql<number>`count(*) filter (where ${tickets.status} = 'active' and ${tickets.createdAt} > now() - interval '24 hours')::int`,
    })
    .from(tickets);
  return { ...s, adult: s.active - s.under18, adultInside: s.inside - s.under18Inside };
}

export async function recentCheckins(db: Db, limit = 8) {
  return db
    .select({ fullName: tickets.fullName, ageGroup: tickets.ageGroup, checkedInAt: tickets.checkedInAt, staffName: staff.name })
    .from(tickets)
    .leftJoin(staff, eq(staff.id, tickets.checkedInBy))
    .where(isNotNull(tickets.checkedInAt))
    .orderBy(desc(tickets.checkedInAt))
    .limit(limit);
}

/**
 * KVKK: etkinlikten sonra tüm katılımcı kayıtlarını geri döndürülemez biçimde siler; Özet sayıları da sıfırlanır.
 * Görevliler ve ayarlar korunur.
 */
export async function deleteAllTickets(db: Db) {
  return db.transaction(async (tx) => {
    await tx.delete(checkinConflicts);
    const rows = await tx.delete(tickets).returning({ id: tickets.id });
    return rows.length;
  });
}

/** Excel'in Türkçe ayarlarıyla doğru açılsın diye: UTF-8 BOM + noktalı virgül ayırıcı. */
export function toCsv(rows: (string | number | null)[][]): string {
  const cell = (v: string | number | null) => {
    let s = v === null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // formül enjeksiyonunu engelle
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
}
