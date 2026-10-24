"use client";

import { useActionState } from "react";
import { createStaff, resetStaffPin, type StaffFormState } from "@/actions/staff";

function PinNotice({ state }: { state: StaffFormState }) {
  if (state.error) return <p className="alert alert-err">{state.error}</p>;
  if (!state.created) return null;
  return (
    <p className="alert alert-ok">
      <strong>{state.created.name}</strong> için PIN: <span className="pin-reveal">{state.created.pin}</span>
      <br />
      <small>Bu PIN yalnızca şimdi gösterilir. Görevliye iletin; unutulursa yenileyebilirsiniz.</small>
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
  const [state, action, pending] = useActionState<StaffFormState, FormData>(resetStaffPin, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {state.created ? (
        <span className="pin-reveal" style={{ fontSize: "1.1rem" }}>
          {state.created.pin}
        </span>
      ) : (
        <button className="btn btn-ghost btn-sm" disabled={pending}>
          PIN yenile
        </button>
      )}
    </form>
  );
}
