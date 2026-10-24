import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { anonymizeAll, getStats, listTickets, toCsv } from "@/lib/admin";
import { checkIn } from "@/lib/checkin";
import { createLocalDb, type Db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { registerTicket } from "@/lib/register";

let db: Db;
const ids: Record<string, string> = {};

async function add(name: string, email: string, phone: string, ageGroup: "under18" | "adult") {
  const r = await registerTicket(db, { fullName: name, email, phone, ageGroup, kvkk: true, guardianConsent: ageGroup === "under18" });
  if (!r.ok) throw new Error(r.error);
  ids[name] = r.ticketId;
}

beforeEach(async () => {
  db = await createLocalDb();
  await add("Ayşe Yılmaz", "ayse@example.com", "+905321111111", "adult");
  await add("Mehmet Demir", "mehmet@example.com", "+905332222222", "under18");
  await add("Can Kaya", "can@example.com", "+905443333333", "adult");
  await checkIn(db, ids["Ayşe Yılmaz"], null);
  await db.update(tickets).set({ status: "cancelled" }).where(eq(tickets.id, ids["Can Kaya"]));
});

describe("yönetim", () => {
  it("isim, e-posta ve telefonla (0'lı yazılsa da) arar", async () => {
    expect((await listTickets(db, { q: "ayşe" })).rows.map((r) => r.fullName)).toEqual(["Ayşe Yılmaz"]);
    expect((await listTickets(db, { q: "mehmet@" })).total).toBe(1);
    expect((await listTickets(db, { q: "0533 222" })).rows[0]?.fullName).toBe("Mehmet Demir");
  });

  it("duruma göre filtreler", async () => {
    expect((await listTickets(db, { filter: "inside" })).rows.map((r) => r.fullName)).toEqual(["Ayşe Yılmaz"]);
    expect((await listTickets(db, { filter: "waiting" })).rows.map((r) => r.fullName)).toEqual(["Mehmet Demir"]);
    expect((await listTickets(db, { filter: "cancelled" })).rows.map((r) => r.fullName)).toEqual(["Can Kaya"]);
  });

  it("istatistikler iptalleri saymaz", async () => {
    expect(await getStats(db)).toMatchObject({ active: 2, cancelled: 1, inside: 1, under18: 1, adult: 1, adultInside: 1, under18Inside: 0 });
  });

  it("anonimleştirme kişisel veriyi siler, sayıları korur", async () => {
    expect(await anonymizeAll(db)).toBe(3);
    const rows = await db.select().from(tickets);
    expect(rows.every((r) => r.fullName === "Silindi" && r.email.startsWith("silindi-") && r.phone.startsWith("silindi-"))).toBe(true);
    expect(await getStats(db)).toMatchObject({ active: 2, inside: 1, under18: 1 });
    expect(await anonymizeAll(db)).toBe(0);
  });
});

describe("CSV", () => {
  it("BOM, noktalı virgül, tırnak kaçışı ve formül koruması", () => {
    const csv = toCsv([
      ["Ad", "Not"],
      ['A "B"', "x;y"],
      ["=HYPERLINK()", "+905321111111"],
    ]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.slice(1).split("\r\n")).toEqual(["Ad;Not", '"A ""B""";"x;y"', "'=HYPERLINK();'+905321111111"]);
  });
});
