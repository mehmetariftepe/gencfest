"use server";

import bcrypt from "bcryptjs";
import { eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomInt } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";

export type StaffFormState = { error?: string; created?: { name: string; pin: string } };

const newPin = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export async function createStaff(_prev: StaffFormState, fd: FormData): Promise<StaffFormState> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 40) return { error: "İsim 2–40 karakter olmalı." };

  const pin = newPin();
  await (await getDb()).insert(staff).values({ name, pinHash: await bcrypt.hash(pin, 10) });
  revalidatePath("/yonetim/gorevliler");
  return { created: { name, pin } };
}

export async function resetStaffPin(_prev: StaffFormState, fd: FormData): Promise<StaffFormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const pin = newPin();
  const [s] = await (await getDb())
    .update(staff)
    .set({ pinHash: await bcrypt.hash(pin, 10) })
    .where(eq(staff.id, id))
    .returning({ name: staff.name });
  if (!s) return { error: "Görevli bulunamadı." };
  return { created: { name: s.name, pin } };
}

export async function toggleStaffActive(fd: FormData) {
  await requireAdmin();
  await (await getDb())
    .update(staff)
    .set({ active: not(staff.active) })
    .where(eq(staff.id, String(fd.get("id") ?? "")));
  revalidatePath("/yonetim/gorevliler");
}
