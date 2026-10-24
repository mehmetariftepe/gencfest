"use client";

import { useActionState } from "react";
import { adminLogin, staffLogin, type LoginState } from "@/actions/auth";

export function StaffLoginForm({ staff }: { staff: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(staffLogin, {});
  return (
    <form action={action} className="form">
      {state.error && <p className="alert alert-err">{state.error}</p>}
      <label className="field">
        <span>Görevli</span>
        <select name="staffId" required defaultValue="">
          <option value="" disabled>
            İsminizi seçin
          </option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>PIN</span>
        <input
          name="pin"
          className="pin-input"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          autoComplete="one-time-code"
          placeholder="••••••"
          required
        />
      </label>
      <button className="btn btn-block" disabled={pending}>
        {pending ? "Giriş yapılıyor…" : "Kapıya geç"}
      </button>
    </form>
  );
}

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(adminLogin, {});
  return (
    <form action={action} className="form">
      {state.error && <p className="alert alert-err">{state.error}</p>}
      <label className="field">
        <span>Yönetici şifresi</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="btn btn-block" disabled={pending}>
        {pending ? "Giriş yapılıyor…" : "Panele gir"}
      </button>
    </form>
  );
}
