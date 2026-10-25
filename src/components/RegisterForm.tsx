"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type RegisterFormState } from "@/actions/register";
import { EVENT } from "@/lib/event";

export function RegisterForm() {
  const [state, action, pending] = useActionState<RegisterFormState, FormData>(registerAction, {});
  const v = state.values ?? {};
  const fe = state.fieldErrors ?? {};
  const [ageGroup, setAgeGroup] = useState(String(v.ageGroup ?? ""));

  return (
    <div className="card card-glow" data-reveal="right">
      <div className="form-head">
        <h3>Ücretsiz Festival Bilet Formu</h3>
        <p>Lütfen bilgilerinizi eksiksiz ve doğru giriniz.</p>
      </div>

      <form action={action} className="form" noValidate>
        {state.error && <p className="alert alert-err">{state.error}</p>}

        <label className="field">
          <span>Ad Soyad *</span>
          <input name="fullName" autoComplete="name" placeholder="Adınız ve Soyadınız" required defaultValue={String(v.fullName ?? "")} />
          {fe.fullName && <small className="err">{fe.fullName}</small>}
        </label>

        <div className="form-row">
          <label className="field">
            <span>Cep Telefonu *</span>
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" required defaultValue={String(v.phone ?? "")} />
            {fe.phone && <small className="err">{fe.phone}</small>}
          </label>

          <label className="field">
            <span>E-posta Adresi *</span>
            <input name="email" type="email" inputMode="email" autoComplete="email" placeholder="ornek@posta.com" required defaultValue={String(v.email ?? "")} />
            {fe.email && <small className="err">{fe.email}</small>}
          </label>
        </div>

        <fieldset className="field">
          <legend>Yaş Grubu Seçimi *</legend>
          <div className="choices">
            {[
              ["under18", "18 Yaş Altı (Öğrenci / Genç)"],
              ["adult", "18 Yaş ve Üstü"],
            ].map(([value, label]) => (
              <label key={value} className="choice">
                <input type="radio" name="ageGroup" value={value} checked={ageGroup === value} onChange={() => setAgeGroup(value)} />
                {label}
              </label>
            ))}
          </div>
          {fe.ageGroup && <small className="err">{fe.ageGroup}</small>}
        </fieldset>

        {ageGroup === "under18" && (
          <label className="check guardian">
            <input type="checkbox" name="guardianConsent" defaultChecked={v.guardianConsent === true} />
            <span>
              <strong>Veli Onayı:</strong> 18 yaşından küçüğüm ve velimin/yasal temsilcimin bilgisi ve onayıyla kayıt
              oluyorum.
            </span>
            {fe.guardianConsent && <small className="err">{fe.guardianConsent}</small>}
          </label>
        )}

        <div className="consent-box">
          <p className="kvkk-note">
            Ad soyad, e-posta, telefon ve yaş grubu bilgileriniz yalnızca etkinlik kaydı, biletin iletilmesi ve giriş
            kontrolü için işlenir; etkinlikten sonra {EVENT.retentionDays} gün içinde silinir. Ayrıntılar için{" "}
            <Link href="/kvkk" target="_blank">KVKK Aydınlatma Metni</Link>.
          </p>
          <label className="check">
            <input type="checkbox" name="kvkk" defaultChecked={v.kvkk === true} />
            <span>
              <strong>KVKK Açık Rıza Beyanı:</strong> Aydınlatma metnini okudum; kişisel verilerimin bu amaçlarla
              işlenmesine ve yurt dışındaki hizmet sağlayıcıların sunucularında saklanmasına açık rıza veriyorum.
            </span>
            {fe.kvkk && <small className="err">{fe.kvkk}</small>}
          </label>
        </div>

        {/* Bot tuzağı */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

        <div>
          <button type="submit" className="btn btn-gold btn-block btn-lg btn-shine" disabled={pending}>
            {pending ? (
              "Biletin hazırlanıyor…"
            ) : (
              <>
                Kayıt Ol ve Ücretsiz Biletini Al
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
          <p className="form-foot">Girişte hiçbir ücret talep edilmez.</p>
        </div>
      </form>
    </div>
  );
}
