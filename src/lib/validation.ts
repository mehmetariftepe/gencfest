import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

/** Telefonu E.164 biçimine (+905...) çevirir; geçersizse null. Ülke kodu yazılmazsa TR varsayılır. */
export function normalizePhone(raw: string): string | null {
  const p = parsePhoneNumberFromString(raw.trim(), "TR");
  return p && p.isValid() ? p.number : null;
}

export const registrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .transform((s) => s.replace(/\s+/g, " "))
      .pipe(z.string().min(3, "Ad soyad en az 3 karakter olmalı").max(100, "Ad soyad çok uzun")),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Geçerli bir e-posta adresi girin").max(254, "E-posta adresi çok uzun")),
    phone: z
      .string()
      .refine((v) => normalizePhone(v) !== null, "Geçerli bir telefon numarası girin")
      .transform((v) => normalizePhone(v)!),
    ageGroup: z.enum(["under18", "adult"], "Yaş grubunu seçin"),
    kvkk: z.literal(true, "Devam etmek için aydınlatma metnini onaylayın"),
    guardianConsent: z.boolean(),
  })
  .refine((d) => d.ageGroup !== "under18" || d.guardianConsent, {
    path: ["guardianConsent"],
    message: "18 yaş altı kayıtlar için veli/yasal temsilci onayı gerekli",
  });

export type RegistrationData = z.output<typeof registrationSchema>;

export function registrationFromForm(fd: FormData) {
  const str = (k: string) => String(fd.get(k) ?? "");
  return {
    fullName: str("fullName"),
    email: str("email"),
    phone: str("phone"),
    ageGroup: str("ageGroup"),
    kvkk: fd.get("kvkk") === "on",
    guardianConsent: fd.get("guardianConsent") === "on",
  };
}

/** Elle girilen görevli PIN'i için hata metni; sorun yoksa null. Tahmini kolay PIN'ler reddedilir. */
export function pinProblem(pin: string): string | null {
  if (!/^\d{6}$/.test(pin)) return "PIN tam 6 rakam olmalı.";
  const d = [...pin].map(Number);
  const allSame = d.every((x) => x === d[0]);
  const steps = d.slice(1).map((x, i) => x - d[i]);
  const sequential = steps.every((s) => s === 1) || steps.every((s) => s === -1);
  if (allSame || sequential) return "Bu PIN tahmin edilmesi kolay, başka bir PIN seçin.";
  return null;
}
