"use server";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { clearSession, setSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { adminPasswordHash } from "@/lib/keys";

export type LoginState = { error?: string };

const WRONG = "Bilgiler hatalı. Tekrar deneyin.";

export async function adminLogin(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const password = String(fd.get("password") ?? "");
  if (!password || !(await bcrypt.compare(password, adminPasswordHash()))) return { error: WRONG };
  await setSession({ role: "admin" });
  redirect("/yonetim");
}

export async function staffLogin(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const staffId = String(fd.get("staffId") ?? "");
  const pin = String(fd.get("pin") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(staffId) || !/^\d{6}$/.test(pin)) return { error: WRONG };

  const db = await getDb();
  const [s] = await db.select().from(staff).where(and(eq(staff.id, staffId), eq(staff.active, true)));
  if (!s || !(await bcrypt.compare(pin, s.pinHash))) return { error: WRONG };

  await setSession({ role: "staff", staffId: s.id, name: s.name });
  redirect("/kapi");
}

export async function logout(fd: FormData) {
  await clearSession();
  redirect(fd.get("to") === "kapi" ? "/kapi/giris" : "/yonetim/giris");
}
