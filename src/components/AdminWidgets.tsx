"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { anonymizeData, updateSettings, type SettingsState } from "@/actions/admin";

/** Etkinlik günü panel açık dururken sayıların kendiliğinden güncellenmesi için. */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}

/** Geri alınması zor işlemlerden önce onay sorar. */
export function ConfirmButton({ message, children, className }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      className={className ?? "btn btn-ghost btn-sm"}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

function Notice({ state }: { state: SettingsState }) {
  if (state.error) return <p className="alert alert-err">{state.error}</p>;
  if (state.ok) return <p className="alert alert-ok">{state.ok}</p>;
  return null;
}

export function SettingsForm({ capacity, registrationOpen }: { capacity: number | null; registrationOpen: boolean }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateSettings, {});
  return (
    <form action={action} className="form">
      <Notice state={state} />
      <label className="check">
        <input type="checkbox" name="registrationOpen" defaultChecked={registrationOpen} />
        <span>
          <strong>Kayıt açık</strong>
          <br />
          <small className="muted">Kapatınca ana sayfada form yerine &quot;Kayıtlar kapalı&quot; yazar. Mevcut biletler geçerli kalır.</small>
        </span>
      </label>
      <label className="field">
        <span>Kontenjan</span>
        <input name="capacity" type="number" inputMode="numeric" min={1} placeholder="Sınırsız" defaultValue={capacity ?? ""} />
        <small className="muted">Aktif bilet sayısı bu sayıya ulaşınca kayıt otomatik durur. Boş bırakırsanız sınır olmaz.</small>
      </label>
      <button className="btn" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}

export function AnonymizeForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(anonymizeData, {});
  return (
    <form action={action} className="form">
      <Notice state={state} />
      <div className="row-form">
        <label className="field">
          <span>Onay için &quot;SİL&quot; yazın</span>
          <input name="confirm" autoComplete="off" />
        </label>
        <button className="btn btn-danger" disabled={pending}>
          Kişisel verileri kalıcı olarak sil
        </button>
      </div>
    </form>
  );
}
