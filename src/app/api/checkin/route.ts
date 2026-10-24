import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkIn } from "@/lib/checkin";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { ticketPublicKey } from "@/lib/keys";
import { verifyTicket } from "@/lib/token";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const db = await getDb();
  let staffId: string | null = null;
  if (session.role === "staff") {
    // Pasifleştirilen görevlinin açık oturumu da çalışmasın.
    const [s] = await db.select({ active: staff.active }).from(staff).where(eq(staff.id, session.staffId));
    if (!s?.active) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    staffId = session.staffId;
  }

  const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
  const token = typeof body?.token === "string" ? body.token : "";
  const ticketId = await verifyTicket(token, ticketPublicKey());
  if (!ticketId) return NextResponse.json({ status: "invalid" });

  return NextResponse.json(await checkIn(db, ticketId, staffId));
}
