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
    <form action={action} className="card form" noValidate>
      {state.error && <p className="alert alert-err">{state.error}</p>}

      <label className="field">
        <span>Ad Soyad</span>
        <input name="fullName" autoComplete="name" required defaultValue={String(v.fullName ?? "")} />
        {fe.fullName && <small className="err">{fe.fullName}</small>}
      </label>

      <label className="field">
        <span>E-posta</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required defaultValue={String(v.email ?? "")} />
        {fe.email && <small className="err">{fe.email}</small>}
      </label>

      <label className="field">
        <span>Telefon</span>
        <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" required defaultValue={String(v.phone ?? "")} />
        {fe.phone && <small className="err">{fe.phone}</small>}
      </label>

      <fieldset className="field">
        <legend>Yaş grubu</legend>
        <div className="choices">
          {[
            ["under18", "18 yaş altı"],
            ["adult", "18 yaş ve üstü"],
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
        <label className="check">
          <input type="checkbox" name="guardianConsent" defaultChecked={v.guardianConsent === true} />
          <span>18 yaşından küçüğüm ve velimin/yasal temsilcimin bilgisi ve onayıyla kayıt oluyorum.</span>
          {fe.guardianConsent && <small className="err">{fe.guardianConsent}</small>}
        </label>
      )}

      <p className="kvkk-note">
        Ad soyad, e-posta, telefon ve yaş grubu bilgileriniz yalnızca etkinlik kaydı, biletin iletilmesi ve giriş
        kontrolü için işlenir; etkinlikten sonra {EVENT.retentionDays} gün içinde silinir. Ayrıntılar için{" "}
        <Link href="/kvkk" target="_blank">KVKK Aydınlatma Metni</Link>.
      </p>
      <label className="check">
        <input type="checkbox" name="kvkk" defaultChecked={v.kvkk === true} />
        <span>
          Aydınlatma metnini okudum; kişisel verilerimin bu amaçlarla işlenmesine ve yurt dışındaki hizmet
          sağlayıcıların sunucularında saklanmasına açık rıza veriyorum.
        </span>
        {fe.kvkk && <small className="err">{fe.kvkk}</small>}
      </label>

      {/* Bot tuzağı */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />

      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kayıt ol ve biletimi al"}
      </button>
    </form>
  );
}
