import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

// Next dev sunucusu modülleri yeniden yüklediğinde tek bağlantı kalsın diye globalThis'te tutulur.
const g = globalThis as unknown as { __gencfestDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  g.__gencfestDb ??= createDb();
  return g.__gencfestDb;
}

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    // WebSocket tabanlı Pool: kontenjan kontrolü için gerçek transaction (FOR UPDATE) gerekir,
    // neon-http sürücüsü bunu desteklemez.
    const { Pool } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-serverless");
    return drizzle(new Pool({ connectionString: url }), { schema }) as unknown as Db;
  }
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL tanımlı değil");
  return createLocalDb(".pglite");
}

/** Yerel geliştirme ve testler için PGlite (dosyada veya dataDir verilmezse bellekte) + migration. */
export async function createLocalDb(dataDir?: string): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const db = drizzle(new PGlite(dataDir), { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
  return db as unknown as Db;
}

export { schema };
