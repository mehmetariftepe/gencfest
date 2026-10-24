import type { Metadata } from "next";
import Link from "next/link";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = { title: `KVKK Aydınlatma Metni · ${EVENT.name}` };

// Taslak metindir; yayından önce organizatör kurumun hukuk birimince gözden geçirilmelidir.
export default function KvkkPage() {
  return (
    <main className="container narrow prose">
      <nav className="topbar">
        <Link href="/" className="brand">
          Alucra <span>GençFest</span>
        </Link>
      </nav>
      <h1>KVKK Aydınlatma Metni</h1>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, {EVENT.name} etkinliği kapsamında
        kişisel verileriniz veri sorumlusu sıfatıyla <strong>{EVENT.dataController}</strong> ({EVENT.dataControllerAddress})
        tarafından aşağıda açıklanan şekilde işlenmektedir.
      </p>

      <h2>İşlenen veriler</h2>
      <p>Ad soyad, e-posta adresi, telefon numarası, yaş grubu (18 yaş altı / 18 yaş ve üstü), onay zamanları ve etkinlik girişine ait kayıt (giriş saati).</p>

      <h2>İşleme amaçları</h2>
      <ul>
        <li>Etkinlik kaydının alınması ve aynı kişinin birden fazla kayıt olmasının önlenmesi,</li>
        <li>Biletin (QR kod) oluşturulması ve size iletilmesi,</li>
        <li>Etkinlik girişinde bilet kontrolünün yapılması,</li>
        <li>Etkinlikle ilgili zorunlu bilgilendirmelerin yapılması (ör. saat veya yer değişikliği).</li>
      </ul>
      <p>Verileriniz pazarlama veya reklam amacıyla kullanılmaz, üçüncü kişilere satılmaz.</p>

      <h2>Hukuki sebep ve toplama yöntemi</h2>
      <p>
        Verileriniz, internet sitesindeki kayıt formu aracılığıyla elektronik ortamda; KVKK m.5/2-(c) uyarınca etkinlik
        katılımına ilişkin hizmetin sunulması ve m.5/1 uyarınca açık rızanıza dayanılarak işlenir.
      </p>

      <h2>18 yaş altı katılımcılar</h2>
      <p>
        18 yaşından küçük katılımcıların kaydı, veli veya yasal temsilcilerinin bilgisi ve onayıyla yapılmalıdır. Kayıt
        sırasında bu onay ayrıca beyan edilir.
      </p>

      <h2>Aktarım</h2>
      <p>
        Verileriniz yalnızca sistemin çalışması için gerekli barındırma, veritabanı ve e-posta gönderim hizmet
        sağlayıcılarının sunucularında saklanır. Bu sunucuların bir kısmı yurt dışında bulunduğundan aktarım açık
        rızanıza ve KVKK m.9&apos;daki şartlara dayanır.
      </p>

      <h2>Saklama süresi</h2>
      <p>Kişisel verileriniz etkinlik tarihinden itibaren en geç {EVENT.retentionDays} gün içinde silinir veya anonim hâle getirilir.</p>

      <h2>Haklarınız</h2>
      <p>
        KVKK m.11 kapsamında verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme ve
        diğer haklarınızı kullanmak için <strong>{EVENT.contactEmail}</strong> adresine başvurabilirsiniz.
      </p>
    </main>
  );
}
