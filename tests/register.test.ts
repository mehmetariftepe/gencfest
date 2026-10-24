import { beforeEach, describe, expect, it } from "vitest";
import { createLocalDb, type Db } from "@/lib/db";
import { settings, tickets } from "@/lib/db/schema";
import { getRegistrationState, registerTicket } from "@/lib/register";
import type { RegistrationData } from "@/lib/validation";

let db: Db;
let n = 0;

function person(over: Partial<RegistrationData> = {}): RegistrationData {
  n++;
  return {
    fullName: `Kişi ${n}`,
    email: `kisi${n}@example.com`,
    phone: `+90532000${String(n).padStart(4, "0")}`,
    ageGroup: "adult",
    kvkk: true,
    guardianConsent: false,
    ...over,
  };
}

beforeEach(async () => {
  db = await createLocalDb(); // her test için bellekte boş veritabanı
});

describe("kayıt", () => {
  it("bilet oluşturur ve rastgele 22 karakterlik id verir", async () => {
    const r = await registerTicket(db, person());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ticketId).toHaveLength(22);
    expect(await db.select().from(tickets)).toHaveLength(1);
  });

  it("aynı e-posta veya telefonla ikinci kaydı reddeder", async () => {
    const p = person();
    await registerTicket(db, p);
    expect(await registerTicket(db, { ...person(), email: p.email })).toEqual({ ok: false, error: "duplicate_email" });
    expect(await registerTicket(db, { ...person(), phone: p.phone })).toEqual({ ok: false, error: "duplicate_phone" });
  });

  it("kontenjan dolunca reddeder", async () => {
    await getRegistrationState(db);
    await db.update(settings).set({ capacity: 2 });
    expect((await registerTicket(db, person())).ok).toBe(true);
    expect((await registerTicket(db, person())).ok).toBe(true);
    expect(await registerTicket(db, person())).toEqual({ ok: false, error: "full" });
    expect(await getRegistrationState(db)).toEqual({ open: true, full: true });
  });

  it("eşzamanlı kayıtlarda kontenjan aşılmaz", async () => {
    await getRegistrationState(db);
    await db.update(settings).set({ capacity: 3 });
    const results = await Promise.all(Array.from({ length: 10 }, () => registerTicket(db, person())));
    expect(results.filter((r) => r.ok)).toHaveLength(3);
  });

  it("kayıt kapalıyken reddeder", async () => {
    await getRegistrationState(db);
    await db.update(settings).set({ registrationOpen: false });
    expect(await registerTicket(db, person())).toEqual({ ok: false, error: "closed" });
  });

  it("veli onayını yalnızca 18 yaş altı için saklar", async () => {
    await registerTicket(db, person({ ageGroup: "under18", guardianConsent: true }));
    await registerTicket(db, person({ guardianConsent: true }));
    const rows = await db.select().from(tickets);
    expect(rows.map((r) => [r.ageGroup, r.guardianConsent]).sort()).toEqual([
      ["adult", false],
      ["under18", true],
    ]);
  });
});
