"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { ticketSecretKey } from "@/lib/keys";
import { registerTicket, type RegisterError } from "@/lib/register";
import { signTicket } from "@/lib/token";
import { registrationFromForm, registrationSchema } from "@/lib/validation";

export type RegisterFormState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  values?: Record<string, string | boolean>;
};

const ERROR_TEXT: Record<RegisterError, string> = {
  closed: "Kayıtlar şu anda kapalı.",
  full: "Üzgünüz, kontenjan doldu.",
  duplicate_email: "Bu e-posta adresiyle zaten kayıt yapılmış.",
  duplicate_phone: "Bu telefon numarasıyla zaten kayıt yapılmış.",
};

export async function registerAction(_prev: RegisterFormState, fd: FormData): Promise<RegisterFormState> {
  const values = registrationFromForm(fd);

  // Bot tuzağı: insanlar bu gizli alanı görmez, doldurmaz.
  if (fd.get("website")) return { error: "Kayıt alınamadı.", values };

  const parsed = registrationSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, v?.[0]]),
    );
    return { fieldErrors, values };
  }

  const result = await registerTicket(await getDb(), parsed.data);
  if (!result.ok) return { error: ERROR_TEXT[result.error], values };

  const token = await signTicket(result.ticketId, ticketSecretKey());
  redirect(`/bilet/${token}`);
}
