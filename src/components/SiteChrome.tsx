import Image from "next/image";
import Link from "next/link";
import { EVENT } from "@/lib/event";

export function Logo({ size = 48, className = "logo" }: { size?: number; className?: string }) {
  return <Image src={EVENT.logo} alt={`${EVENT.org} ${EVENT.orgUnit} logosu`} width={size} height={size} className={className} />;
}

function InstagramIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Instagram">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Ana sayfa, bilet ve KVKK sayfalarındaki sabit üst menü.
export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-brand" title="Alucra GençFest Ana Sayfa">
          <Logo />
          <span>
            <span className="site-brand-name">
              ALUCRA <b>GENÇFEST</b>
            </span>
            <span className="site-brand-org">{EVENT.org}</span>
          </span>
        </Link>
        <div className="site-header-actions">
          <nav className="site-nav">
            <Link href="/#nasil-giris-yaparim">Nasıl Katılırım?</Link>
            <Link href="/#iletisim">İletişim</Link>
          </nav>
          {cta && (
            <Link href="/#bilet-formu" className="btn btn-gold btn-sm">
              Ücretsiz Bilet Al
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer" id="iletisim">
      <div className="container">
        <div className="site-footer-grid">
          <div className="site-footer-about" data-reveal>
            <div className="site-footer-brand">
              <Logo className="logo logo-plain" />
              <div>
                <h4>{EVENT.org}</h4>
                <p>{EVENT.orgUnit}</p>
              </div>
            </div>
            <p className="site-footer-text">
              Alucra gençliğinin eğitim, sosyal ve kültürel gelişimini desteklemek amacıyla 1998&apos;den beri birlik ve
              beraberlik içinde hizmet vermekteyiz.
            </p>
          </div>
          <div data-reveal>
            <h5>Sosyal Medya</h5>
            <ul>
              <li>
                <a href={`https://www.instagram.com/${EVENT.instagram}`} target="_blank" rel="noopener noreferrer">
                  <InstagramIcon /> {EVENT.instagram}
                </a>
              </li>
              <li>
                <a href={EVENT.website} target="_blank" rel="noopener noreferrer">
                  <span className="gold">🌐</span> {new URL(EVENT.website).host}
                </a>
              </li>
              <li>📍 {EVENT.placeDetail}</li>
            </ul>
          </div>
          <div data-reveal>
            <h5>Kurumsal</h5>
            <ul>
              <li>
                <Link href="/kvkk">KVKK Aydınlatma Metni</Link>
              </li>
              <li>
                <Link href="/kapi/giris">Görevli &amp; Gönüllü Girişi</Link>
              </li>
              <li>
                <Link href="/yonetim/giris">Vakıf Yönetimi</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-footer-bottom">
          <p>© {EVENT.year} Alucra GençFest. Tüm hakları {EVENT.org}&apos;na aittir.</p>
          <p>Birlik, Beraberlik ve Eğitim İle Geleceğe.</p>
        </div>
      </div>
    </footer>
  );
}
