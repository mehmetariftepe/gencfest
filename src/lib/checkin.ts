import { and, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "./db";
import { staff, tickets } from "./db/schema";

type Who = { fullName: string; ageGroup: "under18" | "adult" };

export type CheckinResult =
  | ({ status: "ok" } & Who)
  | ({ status: "used"; usedAt: Date; usedBy: string } & Who)
  | ({ status: "cancelled" } & Who)
  | { status: "not_found" };

/**
 * Bileti tek bir atomik UPDATE ile "kullanıldı" yapar. Aynı bilet iki kapıda aynı anda okutulsa bile
 * yalnızca biri satır döndürür. Satır dönmezse nedeni okunup açıklanır.
 * staffId null ise okutmayı yönetici yapmıştır.
 */
export async function checkIn(db: Db, ticketId: string, staffId: string | null): Promise<CheckinResult> {
  const [row] = await db
    .update(tickets)
    .set({ checkedInAt: sql`now()`, checkedInBy: staffId })
    .where(and(eq(tickets.id, ticketId), eq(tickets.status, "active"), isNull(tickets.checkedInAt)))
    .returning({ fullName: tickets.fullName, ageGroup: tickets.ageGroup });
  if (row) return { status: "ok", ...row };

  const [t] = await db
    .select({
      fullName: tickets.fullName,
      ageGroup: tickets.ageGroup,
      status: tickets.status,
      checkedInAt: tickets.checkedInAt,
      staffName: staff.name,
    })
    .from(tickets)
    .leftJoin(staff, eq(staff.id, tickets.checkedInBy))
    .where(eq(tickets.id, ticketId));

  if (!t) return { status: "not_found" };
  const who = { fullName: t.fullName, ageGroup: t.ageGroup };
  if (t.status === "cancelled") return { status: "cancelled", ...who };
  return { status: "used", usedAt: t.checkedInAt!, usedBy: t.staffName ?? "Yönetici", ...who };
}
