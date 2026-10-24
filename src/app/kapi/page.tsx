import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GateScanner } from "@/components/GateScanner";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Kapı · GençFest", robots: { index: false } };

export default async function GatePage() {
  const s = await getSession();
  if (!s) redirect("/kapi/giris");
  return <GateScanner who={s.role === "staff" ? s.name : "Yönetici"} role={s.role} />;
}
