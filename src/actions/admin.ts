"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { anonymizeAll } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";
import { checkIn } from "@/lib/checkin";
import { getDb } from "@/lib/db";
import { settings, tickets } from "@/lib/db/schema";
import { ensureSettings } from "@/lib/register";

function done() {
  revalidatePath("/yonetim", "layout");
}

export async function cancelTicket(fd: FormData) {
  await requireAdmin();
  await (await getDb())
    .update(tickets)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(tickets.id, String(fd.get("id"))));
  done();
}

export async function restoreTicket(fd: FormData) {
  await requireAdmin();
  await (await getDb())
    .update(tickets)
    .set({ status: "active", cancelledAt: null })
    .where(eq(tickets.id, String(fd.get("id"))));
  done();
}

/** Telefonu kapanan/bileti açılmayan katılımcı için: isimle bulunup elle giriş yapılır. */
export async function manualCheckIn(fd: FormData) {
  await requireAdmin();
  await checkIn(await getDb(), String(fd.get("id")), null);
  done();
}

/** Yanlışlıkla okutulan bileti geri almak için. */
export async function undoCheckIn(fd: FormData) {
  await requireAdmin();
  await (await getDb())
    .update(tickets)
    .set({ checkedInAt: null, checkedInBy: null, checkinOffline: false })
    .where(eq(tickets.id, String(fd.get("id"))));
  done();
}

export type SettingsState = { error?: string; ok?: string };

export async function updateSettings(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  const raw = String(fd.get("capacity") ?? "").trim();
  const capacity = raw === "" ? null : Number(raw);
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 100_000)) {
    return { error: "Kontenjan 1 ile 100.000 arasında bir tam sayı olmalı (sınırsız için boş bırakın)." };
  }
  const db = await getDb();
  await ensureSettings(db);
  await db
    .update(settings)
    .set({ capacity, registrationOpen: fd.get("registrationOpen") === "on", updatedAt: new Date() })
    .where(eq(settings.id, 1));
  done();
  return { ok: "Ayarlar kaydedildi." };
}

export async function anonymizeData(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  if (String(fd.get("confirm") ?? "").trim().toLocaleUpperCase("tr-TR") !== "SİL") {
    return { error: 'Onaylamak için kutuya büyük harflerle "SİL" yazın.' };
  }
  const n = await anonymizeAll(await getDb());
  done();
  return { ok: `${n} katılımcının kişisel verisi silindi. İstatistikler korundu.` };
}
