import * as ed from "@noble/ed25519";
import { describe, expect, it } from "vitest";
import { newTicketId, signTicket, verifyTicket } from "@/lib/token";

const secret = ed.utils.randomSecretKey();
const publicKey = await ed.getPublicKeyAsync(secret);

describe("bilet token'ı", () => {
  it("imzalanan token doğrulanır ve ticketId döner", async () => {
    const id = newTicketId();
    const token = await signTicket(id, secret);
    expect(token).toMatch(/^GF1\./);
    expect(await verifyTicket(token, publicKey)).toBe(id);
  });

  it("ticketId'ler benzersiz ve 22 karakter", () => {
    const ids = new Set(Array.from({ length: 1000 }, newTicketId));
    expect(ids.size).toBe(1000);
    for (const id of ids) expect(id).toHaveLength(22);
  });

  it("ticketId'si değiştirilmiş token reddedilir", async () => {
    const token = await signTicket(newTicketId(), secret);
    const [p, , sig] = token.split(".");
    expect(await verifyTicket(`${p}.${newTicketId()}.${sig}`, publicKey)).toBeNull();
  });

  it("imzası bozulmuş token reddedilir", async () => {
    const token = await signTicket(newTicketId(), secret);
    const last = token.at(-2) === "A" ? "B" : "A";
    expect(await verifyTicket(token.slice(0, -2) + last + token.at(-1), publicKey)).toBeNull();
  });

  it("başka anahtarla imzalanmış (sahte) token reddedilir", async () => {
    const forged = await signTicket(newTicketId(), ed.utils.randomSecretKey());
    expect(await verifyTicket(forged, publicKey)).toBeNull();
  });

  it("biçimsiz girdiler reddedilir", async () => {
    for (const s of ["", "GF1", "https://example.com", "GF1.abc.def", "GF2." + "a".repeat(22) + "." + "b".repeat(86)]) {
      expect(await verifyTicket(s, publicKey)).toBeNull();
    }
  });
});
