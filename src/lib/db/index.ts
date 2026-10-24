import { Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// WebSocket tabanlı Pool kullanılıyor: kontenjan kontrolü için gerçek transaction (FOR UPDATE) gerekir,
// neon-http sürücüsü bunu desteklemez.
let _db: NeonDatabase<typeof schema> | undefined;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL tanımlı değil");
    _db = drizzle(new Pool({ connectionString: url }), { schema });
  }
  return _db;
}

export { schema };
