import "server-only";
import { fromBase64Url } from "./token";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} tanımlı değil`);
  return v;
}

export const ticketSecretKey = () => fromBase64Url(required("TICKET_SIGNING_SECRET"));
export const ticketPublicKey = () => fromBase64Url(required("NEXT_PUBLIC_TICKET_PUBLIC_KEY"));
export const sessionSecret = () => fromBase64Url(required("SESSION_SECRET"));
export const adminPasswordHash = () =>
  new TextDecoder().decode(fromBase64Url(required("ADMIN_PASSWORD_BCRYPT_B64")));
