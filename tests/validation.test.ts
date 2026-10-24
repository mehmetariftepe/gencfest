import { describe, expect, it } from "vitest";
import { normalizePhone, registrationSchema } from "@/lib/validation";

const valid = {
  fullName: "  Ayşe   Yılmaz ",
  email: " Ayse@Example.COM ",
  phone: "0532 123 45 67",
  ageGroup: "adult",
  kvkk: true,
  guardianConsent: false,
};

describe("kayıt doğrulama", () => {
  it("geçerli girdiyi normalize eder", () => {
    const r = registrationSchema.parse(valid);
    expect(r.fullName).toBe("Ayşe Yılmaz");
    expect(r.email).toBe("ayse@example.com");
    expect(r.phone).toBe("+905321234567");
  });

  it("farklı telefon yazımları aynı numaraya çevrilir", () => {
    for (const p of ["05321234567", "5321234567", "+90 532 123 45 67", "(0532) 123-4567"]) {
      expect(normalizePhone(p)).toBe("+905321234567");
    }
    expect(normalizePhone("123")).toBeNull();
  });

  it("KVKK onayı olmadan reddeder", () => {
    expect(registrationSchema.safeParse({ ...valid, kvkk: false }).success).toBe(false);
  });

  it("18 yaş altı için veli onayı ister", () => {
    const r = registrationSchema.safeParse({ ...valid, ageGroup: "under18" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["guardianConsent"]);
    expect(registrationSchema.safeParse({ ...valid, ageGroup: "under18", guardianConsent: true }).success).toBe(true);
  });

  it("geçersiz e-posta ve yaş grubunu reddeder", () => {
    expect(registrationSchema.safeParse({ ...valid, email: "ayse@" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, ageGroup: "" }).success).toBe(false);
  });
});
