import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { StaffLoginForm } from "@/components/LoginForms";
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
    <div className="stage auth">
      <div className="stage-fog" />
      <div className="card card-glow">
        <p className="brand" style={{ margin: "0 0 18px" }}>
          Alucra <span>GençFest</span>
        </p>
        <h1>Görevli girişi</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Yöneticinin size verdiği 6 haneli PIN ile giriş yapın.
        </p>
        {list.length === 0 ? (
          <p className="alert alert-warn">Henüz görevli tanımlanmamış. Yöneticiden hesap açmasını isteyin.</p>
        ) : (
          <StaffLoginForm staff={list} />
        )}
      </div>
    </div>
  );
}
