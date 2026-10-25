import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { StaffLoginForm } from "@/components/LoginForms";
import { Logo } from "@/components/SiteChrome";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";

export const metadata: Metadata = { title: "Görevli girişi · GençFest", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function StaffLoginPage() {
  const list = await (await getDb())
    .select({ id: staff.id, name: staff.name })
    .from(staff)
    .where(eq(staff.active, true))
    .orderBy(asc(staff.name));

  return (
    <div className="auth">
      <div className="card">
        <Link href="/" className="auth-brand brand">
          <Logo size={44} />
          Alucra <span>GençFest</span>
        </Link>
        <h1>Görevli girişi</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Yöneticinin size verdiği 6 haneli PIN ile giriş yapın.
        </p>
        {list.length === 0 ? (
          <p className="alert alert-warn">Henüz görevli tanımlanmamış. Yöneticiden hesap açmasını isteyin.</p>
        ) : (
          <StaffLoginForm staff={list} />
        )}
        <div className="auth-links">
          <Link href="/">← Ana sayfa</Link>
          <Link href="/yonetim/giris">Yönetici girişi</Link>
        </div>
      </div>
    </div>
  );
}
