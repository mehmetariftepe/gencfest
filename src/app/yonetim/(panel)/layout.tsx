import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Yönetim · GençFest", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="container">
          <Link href="/yonetim" className="brand">
            Gençfest <span>Panel</span>
          </Link>
          <nav className="admin-nav">
            <Link href="/yonetim">Özet</Link>
            <Link href="/yonetim/katilimcilar">Katılımcılar</Link>
            <Link href="/yonetim/gorevliler">Görevliler</Link>
            <Link href="/yonetim/ayarlar">Ayarlar</Link>
            <Link href="/kapi">Kapı ekranı</Link>
          </nav>
          <form action={logout}>
            <button className="btn btn-ghost btn-sm">Çıkış</button>
          </form>
        </div>
      </header>
      <main className="container admin-main">{children}</main>
    </div>
  );
}
