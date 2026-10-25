import { RegisterForm } from "@/components/RegisterForm";
import { Logo, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getDb } from "@/lib/db";
import { EVENT } from "@/lib/event";
import { getRegistrationState } from "@/lib/register";

export const dynamic = "force-dynamic";

const Arrow = () => (
  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default async function Home() {
  const state = await getRegistrationState(await getDb());
  const canRegister = state.open && !state.full;

  return (
    <>
      <SiteHeader cta={canRegister} />

      <main>
        <section className="hero">
          <div className="hero-glow" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="container hero-inner">
            <div className="eyebrow">
              <span className="dot" />
              <b>{EVENT.year} ALUCRA GENÇFEST</b>
              <span className="sep">|</span>
              <span className="place">{EVENT.place.toLocaleUpperCase("tr")}</span>
            </div>
            <p className="overline">
              {EVENT.org} {EVENT.orgUnit}
            </p>
            <h1 className="hero-title">
              ALUCRA <span className="grad-text">GENÇFEST</span> {EVENT.year}
            </h1>
            <p className="hero-sub">
              Gençlik, kültür, sanat ve birlik ruhu İstanbul&apos;da buluşuyor. Etkinliğe katılım tamamen <b>ücretsizdir</b>;
              yerinizi ayırtın, dijital QR biletiniz anında hazırlansın.
            </p>
            {canRegister ? (
              <div className="hero-actions">
                <a href="#bilet-formu" className="btn btn-lg btn-shine">
                  Ücretsiz Biletini Al <Arrow />
                </a>
                <a href="#nasil-giris-yaparim" className="btn btn-ghost btn-lg">
                  Nasıl Giriş Yaparım?
                </a>
              </div>
            ) : (
              <p className="alert alert-err">
                {state.full ? "Kontenjan doldu, kayıtlar kapandı." : "Kayıtlar şu anda kapalı."}
              </p>
            )}

            <div className="facts">
              <div className="fact fact-navy">
                <div className="fact-label">Tarih &amp; Saat</div>
                <p className="fact-value">
                  {EVENT.dateText}, {EVENT.weekday}
                </p>
                <p className="fact-sub">Kapı Açılışı: {EVENT.doorsOpen}</p>
              </div>
              <div className="fact fact-gold">
                <div className="fact-label">Yer</div>
                <p className="fact-value">{EVENT.place}</p>
                <p className="fact-sub">{EVENT.placeDetail}</p>
              </div>
              <div className="fact fact-green">
                <div className="fact-label">Giriş Şartı</div>
                <p className="fact-value">%100 Ücretsiz</p>
                <p className="fact-sub">Kişiye Özel Dijital QR Bilet</p>
              </div>
            </div>
          </div>
        </section>

        <section id="nasil-giris-yaparim" className="section section-howto">
          <div className="container">
            <div className="section-head" data-reveal>
              <span className="kicker">Giriş Rehberi</span>
              <h2 className="section-title">Nasıl Giriş Yaparım?</h2>
              <p className="section-lead">3 kolay adımda kayıt ol, kapıda beklemeden ve sıra olmadan festival alanına geç.</p>
            </div>
            <div className="steps">
              <div className="step" data-reveal="zoom">
                <div className="step-icon step-icon-gold">✓</div>
                <div>
                  <span className="step-no">01</span>
                  <h3>Kayıt Ol</h3>
                  <p>Ad soyad, e-posta, telefon ve yaş grubunu girerek bir dakikada kayıt formunu tamamla.</p>
                </div>
                <div className="step-foot">Formu doldur ve onayla</div>
              </div>
              <div className="step" data-reveal="zoom">
                <div className="step-icon step-icon-navy">QR</div>
                <div>
                  <span className="step-no">02</span>
                  <h3>QR Biletini Al</h3>
                  <p>Biletin anında ekranda görüntülenir ve e-posta ile cebine iletilir. Ekran görüntüsünü kaydet.</p>
                </div>
                <div className="step-foot">Anında e-posta ve karekod</div>
              </div>
              <div className="step" data-reveal="zoom">
                <div className="step-icon step-icon-green">➔</div>
                <div>
                  <span className="step-no">03</span>
                  <h3>Kapıda Göster</h3>
                  <p>
                    Girişte QR kodunu turnikedeki görevliye okut, festival bilekliğini al ve tüm gün boyunca dilediğince
                    giriş-çıkış yap.
                  </p>
                </div>
                <div className="step-foot">Turnikeden beklemeden geç</div>
              </div>
            </div>
          </div>
        </section>

        <section id="bilet-formu" className="section section-register">
          <div className="container register">
            <div className="register-info" data-reveal="left">
              <span className="tag">Resmi Katılım Protokolü</span>
              <h2 className="register-title">
                Biletini <span>Şimdi</span> Al
              </h2>
              <p className="register-lead">
                Kayıt tamamen ücretsizdir ve kişiye özeldir. Üretilen QR kod tekil olup ilk turnike okutmasında geçerlilik
                kazanır.
              </p>
              <div className="notes">
                <div className="note">
                  <span className="note-icon" style={{ background: "var(--amber-500)" }}>
                    !
                  </span>
                  <div>
                    <p className="note-title">18 Yaş Altı Katılımı</p>
                    <p className="note-text">
                      18 yaşından küçük katılımcılarımız veli/yasal temsilci onayı ile bilet oluşturabilir.
                    </p>
                  </div>
                </div>
              </div>
              <div className="org-card">
                <Logo size={64} />
                <div>
                  <p className="org-name">{EVENT.org}</p>
                  <p className="org-unit">{EVENT.orgUnit}</p>
                  <p className="org-desc">Resmi Gençlik Buluşması &amp; Kültür Organizasyonu</p>
                </div>
              </div>
            </div>

            {canRegister ? (
              <RegisterForm />
            ) : (
              <div className="card" data-reveal="right">
                <p className="alert alert-err">
                  {state.full ? "Kontenjan doldu, kayıtlar kapandı." : "Kayıtlar şu anda kapalı."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
