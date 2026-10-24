import { count, eq, or } from "drizzle-orm";
import type { Db } from "./db";
import { settings, tickets } from "./db/schema";
import { newTicketId } from "./token";
import type { RegistrationData } from "./validation";

export type RegisterError = "closed" | "full" | "duplicate_email" | "duplicate_phone";
export type RegisterResult = { ok: true; ticketId: string } | { ok: false; error: RegisterError };

/** settings satırı migration ile gelmez; yoksa varsayılanlarla oluşturulur. */
export async function ensureSettings(db: Db) {
  await db.insert(settings).values({ id: 1 }).onConflictDoNothing();
}

export async function getRegistrationState(db: Db): Promise<{ open: boolean; full: boolean }> {
  await ensureSettings(db);
  const [s] = await db.select().from(settings).where(eq(settings.id, 1));
  if (!s.registrationOpen) return { open: false, full: false };
  if (s.capacity === null) return { open: true, full: false };
  const [{ n }] = await db.select({ n: count() }).from(tickets).where(eq(tickets.status, "active"));
  return { open: true, full: n >= s.capacity };
}

export async function registerTicket(db: Db, data: RegistrationData): Promise<RegisterResult> {
  await ensureSettings(db);
  try {
    // settings satırı kilitlenir: eşzamanlı kayıtlar sıraya girer, kontenjan aşılamaz.
    return await db.transaction(async (tx) => {
      const [s] = await tx.select().from(settings).where(eq(settings.id, 1)).for("update");
      if (!s.registrationOpen) return { ok: false, error: "closed" } as const;

      const [dup] = await tx
        .select({ email: tickets.email })
        .from(tickets)
        .where(or(eq(tickets.email, data.email), eq(tickets.phone, data.phone)))
        .limit(1);
      if (dup) return { ok: false, error: dup.email === data.email ? "duplicate_email" : "duplicate_phone" } as const;

      if (s.capacity !== null) {
        const [{ n }] = await tx.select({ n: count() }).from(tickets).where(eq(tickets.status, "active"));
        if (n >= s.capacity) return { ok: false, error: "full" } as const;
      }

      const id = newTicketId();
      await tx.insert(tickets).values({
        id,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        ageGroup: data.ageGroup,
        guardianConsent: data.ageGroup === "under18" && data.guardianConsent,
        kvkkConsentAt: new Date(),
      });
      return { ok: true, ticketId: id } as const;
    });
  } catch (e) {
    // Kilit sayesinde pek olası değil ama UNIQUE ihlali yine de anlamlı hataya çevrilir.
    const constraint = uniqueViolation(e);
    if (constraint) return { ok: false, error: constraint.includes("phone") ? "duplicate_phone" : "duplicate_email" };
    throw e;
  }
}

function uniqueViolation(e: unknown): string | null {
  for (let err = e as { code?: string; constraint?: string; cause?: unknown } | undefined; err; err = err.cause as typeof err) {
    if (err.code === "23505") return err.constraint ?? "";
  }
  return null;
}
