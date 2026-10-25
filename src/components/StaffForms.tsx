"use client";

import { useActionState, useEffect, useState } from "react";
import { createStaff, resetStaffPin, setStaffPin, type SetPinState, type StaffFormState } from "@/actions/staff";

function PinNotice({ state }: { state: StaffFormState }) {
  if (state.error) return <p className="alert alert-err">{state.error}</p>;
  if (!state.created) return null;
  return (
    <p className="alert alert-ok">
      <strong>{state.created.name}</strong> için PIN: <span className="pin-reveal">{state.created.pin}</span>
      <br />
      <small>Görevliye iletin. PIN aşağıdaki listede de görünür; istediğiniz zaman değiştirebilirsiniz.</small>
    </p>
  );
}

export function CreateStaffForm() {
  const [state, action, pending] = useActionState<StaffFormState, FormData>(createStaff, {});
  return (
    <form action={action} className="form">
      <PinNotice state={state} />
      <div className="row-form">
        <label className="field">
          <span>Yeni görevli adı</span>
          <input name="name" placeholder="ör. Ayşe — Ana kapı" required maxLength={40} />
        </label>
        <button className="btn" disabled={pending}>
          Ekle ve PIN oluştur
        </button>
      </div>
    </form>
  );
}

export function ResetPinButton({ id }: { id: string }) {
  const [, action, pending] = useActionState<StaffFormState, FormData>(resetStaffPin, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-ghost btn-sm" disabled={pending}>
        Rastgele PIN
      </button>
    </form>
  );
}

export function SetPinForm({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<SetPinState, FormData>(setStaffPin, {});

  // Kaydedilince form kapanır; yeni PIN tablodaki PIN sütununda görünür.
  useEffect(() => {
    if (state.saved) setOpen(false);
  }, [state]);

  if (!open) {
    return (
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>
        PIN değiştir
      </button>
    );
  }
  return (
    <form action={action} className="pin-set">
      <input type="hidden" name="id" value={id} />
      <input
        name="pin"
        className="input"
        inputMode="numeric"
        autoComplete="off"
        pattern="[0-9]{6}"
        maxLength={6}
        placeholder="6 haneli PIN"
        aria-label={`${name} için yeni PIN`}
        required
        autoFocus
      />
      <button className="btn btn-sm" disabled={pending}>
        Kaydet
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
        Vazgeç
      </button>
      {state.error && <small className="err">{state.error}</small>}
    </form>
  );
}
