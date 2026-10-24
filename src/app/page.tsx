import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { getDb } from "@/lib/db";
import { EVENT } from "@/lib/event";
import { getRegistrationState } from "@/lib/register";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getRegistrationState(await getDb());
  const canRegister = state.open && !state.full;

  return (
    <>
      <header className="stage">
        <div className="stage-fog" />
        <div className="container">
          <nav className="topbar">
            <Link href="/" className="brand">
              Alucra <span>GençFest</span>
            </Link>
            {canRegister && (
              <a href="#kayit" className="btn btn-ghost btn-sm">
                Bilet al
              </a>
            )}
          </nav>

          <section className="hero">
            <span className="eyebrow">
              <span className="dot" /> {EVENT.dateText} · {EVENT.weekday} · {EVENT.place}
            </span>
            <h1 className="hero-title">
              <small>Alucra</small>
              <span className="grad-text">GençFest</span>
            </h1>
            <p className="hero-sub">
              Müzik, sahne ve gençlik tek gecede buluşuyor. Giriş ücretsiz; yerini ayırt, QR biletin saniyeler içinde
              hazır olsun.
            </p>
            {canRegister ? (
              <a href="#kayit" className="btn">
                Ücretsiz biletini al →
              </a>
            ) : (
              <p className="alert alert-err" style={{ display: "inline-block" }}>
                {state.full ? "Kontenjan doldu, kayıtlar kapandı." : "Kayıtlar şu anda kapalı."}
              </p>
            )}

            <div className="facts">
              <div className="fact">
                <div className="fact-label">Tarih</div>
                <div className="fact-value">
                  {EVENT.dateText}, {EVENT.weekday}
                </div>
              </div>
              <div className="fact">
                <div className="fact-label">Yer</div>
                <div className="fact-value">{EVENT.place}</div>
              </div>
              <div className="fact">
                <div className="fact-label">Giriş</div>
                <div className="fact-value">Ücretsiz · QR bilet</div>
              </div>
            </div>
          </section>
        </div>
      </header>

      <main>
        <section className="section container">
          <h2 className="section-title">Nasıl giriş yaparım?</h2>
          <p className="muted">Üç adım, kuyrukta beklemeden içeri.</p>
          <div className="steps">
            <div className="step">
              <h3>Kayıt ol</h3>
              <p>Ad soyad, e-posta, telefon ve yaş grubunla bir dakikada kaydını tamamla.</p>
            </div>
            <div className="step">
              <h3>QR biletini al</h3>
              <p>Biletin anında ekranda; indir, ekran görüntüsünü al. E-postana da gönderilir.</p>
            </div>
            <div className="step">
              <h3>Kapıda okut</h3>
              <p>Girişte QR kodunu göster, bilekliğin takılsın. Bileklikle istediğin kadar girip çıkabilirsin.</p>
            </div>
          </div>
        </section>

        {canRegister && (
          <section id="kayit" className="section container">
            <div className="register">
              <div>
                <h2 className="section-title">
                  Biletini <span className="grad-text">şimdi</span> al
                </h2>
                <p className="muted">
                  Kayıt ücretsizdir ve kişiye özeldir. Her kişi bir bilet alabilir; bilet ilk okutmada geçerlidir.
                </p>
                <ul className="muted" style={{ paddingLeft: 20 }}>
                  <li>18 yaş altı katılımcılar veli/yasal temsilci onayıyla kayıt olabilir.</li>
                  <li>Kapıda kimlik veya bilet adı kontrolü yapılabilir.</li>
                </ul>
              </div>
              <RegisterForm />
            </div>
          </section>
        )}

        <footer className="container footer">
          <span>© 2026 {EVENT.name}</span>
          <nav className="footer-links">
            <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
            <Link href="/kapi/giris">Görevli girişi</Link>
            <Link href="/yonetim/giris">Yönetim</Link>
          </nav>
        </footer>
      </main>
    </>
  );
}
