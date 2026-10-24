// Kullanım: npx tsx scripts/gen-keys.ts "<yönetici şifresi>"
// (PowerShell, `npm run gen-keys -- ...` içindeki `--` işaretini yuttuğu için doğrudan tsx ile çağırın.)
// Çıktıyı .env.local dosyasına ve Vercel ortam değişkenlerine yapıştırın.
import * as ed from "@noble/ed25519";
import bcrypt from "bcryptjs";
import { toBase64Url } from "../src/lib/token";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Kullanım: npx tsx scripts/gen-keys.ts "<en az 10 karakterlik yönetici şifresi>"');
  process.exit(1);
}

const secret = ed.utils.randomSecretKey();
const publicKey = await ed.getPublicKeyAsync(secret);
const sessionSecret = crypto.getRandomValues(new Uint8Array(32));
const hash = await bcrypt.hash(password, 12);

console.log(`TICKET_SIGNING_SECRET=${toBase64Url(secret)}`);
console.log(`NEXT_PUBLIC_TICKET_PUBLIC_KEY=${toBase64Url(publicKey)}`);
console.log(`SESSION_SECRET=${toBase64Url(sessionSecret)}`);
console.log(`ADMIN_PASSWORD_BCRYPT_B64=${toBase64Url(new TextEncoder().encode(hash))}`);
