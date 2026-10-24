// Oturum token'ı (jose HS256). Hem middleware'de (edge) hem sunucu bileşenlerinde kullanılır.
import { jwtVerify, SignJWT } from "jose";
import { sessionSecret } from "./keys";

export type Session = { role: "admin" } | { role: "staff"; staffId: string; name: string };

export const SESSION_COOKIE = "gf_session";
export const SESSION_MAX_AGE = 60 * 60 * 18; // etkinlik günü boyunca yeterli

export async function createSessionToken(s: Session): Promise<string> {
  return new SignJWT({ ...s })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(sessionSecret());
}

export async function readSessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ["HS256"] });
    if (payload.role === "admin") return { role: "admin" };
    if (payload.role === "staff" && typeof payload.staffId === "string" && typeof payload.name === "string") {
      return { role: "staff", staffId: payload.staffId, name: payload.name };
    }
    return null;
  } catch {
    return null;
  }
}
