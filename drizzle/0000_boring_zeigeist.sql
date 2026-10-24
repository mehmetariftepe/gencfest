CREATE TYPE "public"."age_group" AS ENUM('under18', 'adult');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
CREATE TABLE "checkin_conflicts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" text NOT NULL,
	"staff_id" uuid,
	"scanned_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"capacity" integer,
	"registration_open" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"pin_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"age_group" "age_group" NOT NULL,
	"guardian_consent" boolean DEFAULT false NOT NULL,
	"kvkk_consent_at" timestamp with time zone NOT NULL,
	"status" "ticket_status" DEFAULT 'active' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"checked_in_at" timestamp with time zone,
	"checked_in_by" uuid,
	"checkin_offline" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_email_unique" UNIQUE("email"),
	CONSTRAINT "tickets_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "checkin_conflicts" ADD CONSTRAINT "checkin_conflicts_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkin_conflicts" ADD CONSTRAINT "checkin_conflicts_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_checked_in_by_staff_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;