import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { checkIn } from "@/lib/checkin";
import { createLocalDb, type Db } from "@/lib/db";
import { staff, tickets } from "@/lib/db/schema";
import { registerTicket } from "@/lib/register";

let db: Db;
let ticketId: string;
let ayse: string;
let mehmet: string;

beforeEach(async () => {
  db = await createLocalDb();
  const r = await registerTicket(db, {
    fullName: "Zeynep Kaya",
    email: "zeynep@example.com",
    phone: "+905321112233",
    ageGroup: "under18",
    kvkk: true,
    guardianConsent: true,
  });
  if (!r.ok) throw new Error("kayıt başarısız");
  ticketId = r.ticketId;
  [{ id: ayse }, { id: mehmet }] = await db
    .insert(staff)
    .values([
      { name: "Ayşe", pinHash: "x" },
      { name: "Mehmet", pinHash: "x" },
    ])
    .returning({ id: staff.id });
});

describe("kapı check-in", () => {
  it("ilk okutmada geçerli, ikincide kullanılmış (kim ve ne zaman) döner", async () => {
    expect(await checkIn(db, ticketId, ayse)).toEqual({ status: "ok", fullName: "Zeynep Kaya", ageGroup: "under18" });
    const second = await checkIn(db, ticketId, mehmet);
    expect(second.status).toBe("used");
    if (second.status === "used") {
      expect(second.usedBy).toBe("Ayşe");
      expect(second.usedAt).toBeInstanceOf(Date);
    }
  });

  it("aynı anda iki kapıda okutulursa yalnızca biri kabul edilir", async () => {
    const results = await Promise.all([checkIn(db, ticketId, ayse), checkIn(db, ticketId, mehmet)]);
    expect(results.map((r) => r.status).sort()).toEqual(["ok", "used"]);
  });

  it("iptal edilmiş bilet reddedilir", async () => {
    await db.update(tickets).set({ status: "cancelled" }).where(eq(tickets.id, ticketId));
    expect((await checkIn(db, ticketId, ayse)).status).toBe("cancelled");
  });

  it("bilinmeyen bilet bulunamadı döner", async () => {
    expect(await checkIn(db, "A".repeat(22), ayse)).toEqual({ status: "not_found" });
  });

  it("yönetici okutursa kullanan 'Yönetici' görünür", async () => {
    await checkIn(db, ticketId, null);
    const r = await checkIn(db, ticketId, ayse);
    expect(r.status === "used" && r.usedBy).toBe("Yönetici");
  });
});
