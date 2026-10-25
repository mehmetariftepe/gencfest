import { asc } from "drizzle-orm";
import { toggleStaffActive } from "@/actions/staff";
import { CreateStaffForm, ResetPinButton, SetPinForm } from "@/components/StaffForms";
import { getDb } from "@/lib/db";
import { staff } from "@/lib/db/schema";

export default async function StaffPage() {
  const list = await (await getDb()).select().from(staff).orderBy(asc(staff.name));

  return (
    <>
      <h1>Kapı görevlileri</h1>
      <div className="card" style={{ marginBottom: 24 }}>
        <CreateStaffForm />
      </div>

      {list.length === 0 ? (
        <p className="muted">Henüz görevli yok.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>İsim</th>
                <th>PIN</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.pin ? <span className="pin-cell">{s.pin}</span> : <span className="muted">—</span>}</td>
                  <td>
                    <span className={`pill ${s.active ? "pill-ok" : "pill-off"}`}>{s.active ? "Aktif" : "Pasif"}</span>
                  </td>
                  <td style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <SetPinForm id={s.id} name={s.name} />
                    <ResetPinButton id={s.id} />
                    <form action={toggleStaffActive}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="btn btn-ghost btn-sm">{s.active ? "Pasifleştir" : "Aktifleştir"}</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
