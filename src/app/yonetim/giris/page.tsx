import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/LoginForms";

export const metadata: Metadata = { title: "Yönetici girişi · GençFest", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="stage auth">
      <div className="stage-fog" />
      <div className="card card-glow">
        <p className="brand" style={{ margin: "0 0 18px" }}>
          Alucra <span>GençFest</span>
        </p>
        <h1>Yönetim paneli</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Devam etmek için yönetici şifresini girin.
        </p>
        <AdminLoginForm />
        <div className="auth-links">
          <Link href="/">← Ana sayfa</Link>
          <Link href="/kapi/giris">Görevli girişi</Link>
        </div>
      </div>
    </div>
  );
}
