import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const ageGroup = pgEnum("age_group", ["under18", "adult"]);
export const ticketStatus = pgEnum("ticket_status", ["active", "cancelled"]);

// Tek satırlık ayar tablosu (id = 1).
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  capacity: integer("capacity"), // null = sınırsız
  registrationOpen: boolean("registration_open").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  pinHash: text("pin_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable("tickets", {
  // QR'daki rastgele ticketId (22 karakter base64url). Sıralı değildir.
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(), // küçük harfe normalize edilmiş
  phone: text("phone").notNull().unique(), // E.164 (+90...)
  ageGroup: ageGroup("age_group").notNull(),
  guardianConsent: boolean("guardian_consent").notNull().default(false),
  kvkkConsentAt: timestamp("kvkk_consent_at", { withTimezone: true }).notNull(),
  status: ticketStatus("status").notNull().default("active"),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  // Dolu olması = bileklik verildi.
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  checkedInBy: uuid("checked_in_by").references(() => staff.id),
  checkinOffline: boolean("checkin_offline").notNull().default(false),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Çevrimdışı senkronda, bilet başka kapıda zaten kullanılmışsa buraya düşer.
export const checkinConflicts = pgTable("checkin_conflicts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: text("ticket_id").notNull().references(() => tickets.id),
  staffId: uuid("staff_id").references(() => staff.id),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Ticket = typeof tickets.$inferSelect;
export type Staff = typeof staff.$inferSelect;
