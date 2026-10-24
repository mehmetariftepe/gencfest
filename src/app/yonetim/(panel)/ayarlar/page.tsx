import { eq } from "drizzle-orm";
import { AnonymizeForm, SettingsForm } from "@/components/AdminWidgets";
import { getDb } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { EVENT } from "@/lib/event";
import { ensureSettings } from "@/lib/register";

export default async function SettingsPage() {
  const db = await getDb();
  await ensureSettings(db);
  const [s] = await db.select().from(settings).where(eq(settings.id, 1));

  return (
    <>
      <h1>Ayarlar</h1>
      <div className="grid-2">
        <section className="panel">
          <h2>Kayıt ve kontenjan</h2>
          <SettingsForm capacity={s.capacity} registrationOpen={s.registrationOpen} />
        </section>

        <section className="panel panel-danger">
          <h2>KVKK: Kişisel verileri sil</h2>
          <p className="muted">
            Etkinlikten sonra en geç {EVENT.retentionDays} gün içinde yapılmalıdır. Tüm katılımcıların ad, e-posta ve
            telefon bilgileri <strong>geri döndürülemez</strong> biçimde silinir; toplam kayıt, giriş ve yaş grubu
            sayıları korunur. Gerekiyorsa önce Katılımcılar sayfasından CSV yedeği alın.
          </p>
          <AnonymizeForm />
        </section>
      </div>
    </>
  );
}
