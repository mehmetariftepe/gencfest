// QR bilet token'ı: "GF1.<ticketId>.<imza>"
// - ticketId: 16 rastgele bayt (base64url, 22 karakter)
// - imza: "GF1.<ticketId>" metninin Ed25519 imzası (base64url, 86 karakter)
// Bu modül hem sunucuda hem tarayıcıda (çevrimdışı kapı doğrulaması) çalışır; Node'a özgü API kullanmaz.
import * as ed from "@noble/ed25519";

const PREFIX = "GF1";
const TOKEN_RE = /^GF1\.([A-Za-z0-9_-]{22})\.([A-Za-z0-9_-]{86})$/;

export function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function message(ticketId: string): Uint8Array {
  return new TextEncoder().encode(`${PREFIX}.${ticketId}`);
}

export function newTicketId(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
}

export async function signTicket(ticketId: string, secretKey: Uint8Array): Promise<string> {
  const sig = await ed.signAsync(message(ticketId), secretKey);
  return `${PREFIX}.${ticketId}.${toBase64Url(sig)}`;
}

/** Geçerli imzalı token ise ticketId döner, değilse null. */
export async function verifyTicket(token: string, publicKey: Uint8Array): Promise<string | null> {
  const m = TOKEN_RE.exec(token.trim());
  if (!m) return null;
  const [, ticketId, sig] = m;
  try {
    return (await ed.verifyAsync(fromBase64Url(sig), message(ticketId), publicKey)) ? ticketId : null;
  } catch {
    return null;
  }
}
