import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/LoginForms";
import { Logo } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Yönetici girişi · GençFest", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="auth">
      <div className="card">
        <Link href="/" className="auth-brand brand">
          <Logo size={44} />
          Alucra <span>GençFest</span>
        </Link>
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
