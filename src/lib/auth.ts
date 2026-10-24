import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, readSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, type Session } from "./session";

export async function getSession(): Promise<Session | null> {
  return readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function setSession(s: Session) {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(s), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Middleware zaten korur; server action'lar ayrıca doğrudan çağrılabildiği için yine kontrol edilir. */
export async function requireAdmin() {
  const s = await getSession();
  if (s?.role !== "admin") redirect("/yonetim/giris");
  return s;
}
