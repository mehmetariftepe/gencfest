# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ticket registration + QR gate check-in system for **Alucra GençFest** (single-day free event, 31 Oct 2026). Hard deadline, so prefer the simplest reliable solution and do not add features beyond the approved plan. UI text, comments and user-facing messages are in **Turkish**.

Stack: Next.js 15 (App Router, TypeScript) on Vercel, Neon Postgres via Drizzle ORM, Ed25519-signed QR tokens, Resend for email, Vitest for tests.

## Commands

On this Windows machine Node/Git were installed via winget; if `node`/`npm` are not found in a fresh PowerShell, refresh PATH first:
`$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`

- `npm run dev` / `npm run build` / `npm run typecheck` / `npm run lint`
- `npm test` — all Vitest tests; single file: `npx vitest run tests/token.test.ts`; single test: `npx vitest run -t "sahte"`
- `npm run db:generate` — create a migration in `drizzle/` after editing `src/lib/db/schema.ts`
- `npm run db:migrate` — apply migrations to `DATABASE_URL`
- `npx tsx scripts/gen-keys.ts "<admin password>"` — prints the secret env vars (ticket signing key pair, session secret, admin password hash). Don't use `npm run gen-keys -- ...` from PowerShell; it swallows `--`.

Env vars are documented in `.env.example` (local copy goes in `.env.local`, not committed).

## Architecture

- **QR token** (`src/lib/token.ts`): `GF1.<ticketId>.<sig>`. `ticketId` is 16 random bytes (base64url), `sig` is the Ed25519 signature of `"GF1.<ticketId>"`. The module is isomorphic (no Node APIs) because the gate page also verifies tokens **in the browser** with `NEXT_PUBLIC_TICKET_PUBLIC_KEY` for offline mode. The private key (`TICKET_SIGNING_SECRET`) is read only via `src/lib/keys.ts` (`server-only`).
- **Double check-in prevention**: a single atomic `UPDATE tickets ... WHERE id=$1 AND status='active' AND checked_in_at IS NULL RETURNING *`. Zero rows means the ticket is invalid, cancelled, or already used; re-read the row to explain why (time + staff name). Don't replace this with read-then-write.
- **Capacity**: registration runs in a transaction that locks the `settings` row (`id = 1`) `FOR UPDATE` before counting active tickets. That's why `src/lib/db/index.ts` uses the WebSocket `Pool` driver (`drizzle-orm/neon-serverless`), not `neon-http`, which has no interactive transactions. The `settings` row is not seeded by migrations; code must create it if it's missing.
- **Dedup**: `tickets.email` (lowercased) and `tickets.phone` (E.164) are both `UNIQUE`; normalize before insert.
- **Wristband = check-in**: `checked_in_at IS NOT NULL` means a wristband was given. There is one wristband type for everyone; `age_group` is only for stats and a small badge on the gate screen.
- **Auth**: no auth provider. Admin password hash comes from env (`ADMIN_PASSWORD_BCRYPT_B64`, base64url-wrapped so `$` survives dotenv expansion). Gate staff are rows in `staff` (name + bcrypt PIN). Sessions are `jose`-signed httpOnly cookies with role `admin` or `staff`; `/yonetim` requires admin, `/kapi` requires staff or admin.
- **Offline gate mode**: the gate page caches the public key and the cancelled-ticket list, verifies signatures locally, records used IDs in localStorage, queues check-ins and syncs to `/api/checkin/sync`. Conflicts go to `checkin_conflicts`.
- **KVKK (minimum data)**: collect only full name, email, phone and age group, plus consent timestamps. Under-18 registrations require the `guardian_consent` checkbox. Don't store IPs or add fields without a reason.

Routes (Turkish paths): `/` registration, `/kvkk`, `/bilet/[token]` ticket, `/kapi` gate scanner, `/kapi/giris` staff login, `/yonetim/*` admin panel.
