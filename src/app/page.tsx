import { RegisterForm } from "@/components/RegisterForm";
import { getDb } from "@/lib/db";
import { EVENT } from "@/lib/event";
import { getRegistrationState } from "@/lib/register";

export const dynamic = "force-dynamic";

export default async function Home() {
  const state = await getRegistrationState(await getDb());

  return (
    <main>
      <h1>{EVENT.name}</h1>
      <p className="muted">
        {EVENT.dateText} · {EVENT.place} · Ücretsiz
      </p>

      {!state.open ? (
        <p className="alert alert-err">Kayıtlar şu anda kapalı.</p>
      ) : state.full ? (
        <p className="alert alert-err">Üzgünüz, kontenjan doldu.</p>
      ) : (
        <>
          <p>Kaydını yap, QR biletin hemen ekranda oluşsun. Girişte QR kodunu göstermen yeterli.</p>
          <RegisterForm />
        </>
      )}
    </main>
  );
}
