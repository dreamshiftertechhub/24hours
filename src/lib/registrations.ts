import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { COHORTS, ROLES, cleanText, phoneKey, type SignupKind } from "@/lib/retreat";

const submitSchema = z.object({
  kind: z.enum(["attendee", "volunteer"]),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(24),
  cohort: z.string().trim().max(40).default(""),
  city: z.string().trim().max(80).default(""),
  role: z.string().trim().max(40).default(""),
  note: z.string().trim().max(240).default(""),
});

const deskSchema = z.object({
  password: z.string().min(1).max(80),
});

export type SubmitResult =
  | { ok: true; status: "created" | "updated"; ref: string; name: string; kind: SignupKind }
  | { ok: false; error: string };

export type DeskRow = {
  ref: string;
  kind: SignupKind;
  name: string;
  phone: string;
  cohort: string;
  city: string;
  role: string;
  note: string;
  createdAt: string;
};

export type DeskResult = { ok: true; rows: DeskRow[] } | { ok: false; error: string };

type Gate = { fails: number; until: number };

function gate(): Gate {
  const g = globalThis as typeof globalThis & { __mimDesk?: Gate };
  if (!g.__mimDesk) g.__mimDesk = { fails: 0, until: 0 };
  return g.__mimDesk;
}

async function passwordMatches(input: string) {
  const adminDigest = "7a2c5a828b6bec266f9f4d6466e982f2558461dce619469e1c3049f87e2dbfe5";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const hex = [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  let diff = hex.length === adminDigest.length ? 0 : 1;
  const length = Math.max(hex.length, adminDigest.length);
  for (let i = 0; i < length; i += 1) {
    diff |= (hex.charCodeAt(i) || 0) ^ (adminDigest.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function stamp(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function asKind(value: string): SignupKind {
  return value === "volunteer" ? "volunteer" : "attendee";
}

function makeRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let ref = "";
  for (const byte of bytes) ref += alphabet[byte % alphabet.length] ?? "X";
  return ref;
}

const cohortLabels: readonly string[] = COHORTS.map((item) => item.label);
const roleLabels: readonly string[] = ROLES;

export const submitRegistration = createServerFn({ method: "POST" })
  .validator(submitSchema)
  .handler(async ({ data }): Promise<SubmitResult> => {
    const name = cleanText(data.name);
    const letters = name.match(/\p{L}/gu);
    if (!letters || letters.length < 2) {
      return { ok: false, error: "Enter the name you will register with." };
    }
    const key = phoneKey(data.phone);
    if (!key) return { ok: false, error: "Enter a WhatsApp number we can reach." };

    const cohort = data.kind === "attendee" ? cleanText(data.cohort) : "";
    const role = data.kind === "volunteer" ? cleanText(data.role) : "";
    if (data.kind === "attendee" && !cohortLabels.includes(cohort)) {
      return { ok: false, error: "Choose who is coming." };
    }
    if (data.kind === "volunteer" && !roleLabels.includes(role)) {
      return { ok: false, error: "Choose where you will serve." };
    }

    const city = cleanText(data.city);
    const note = data.kind === "volunteer" ? cleanText(data.note) : "";
    const phone = data.phone.trim();

    try {
      const sql = await getSql();
      const existing = await sql<{ ref: string }>`
        select ref from registrations where kind = ${data.kind} and phone_key = ${key} limit 1
      `;
      if (existing[0]) {
        await sql`
          update registrations
          set name = ${name},
              phone = ${phone},
              cohort = ${cohort},
              city = ${city},
              role = ${role},
              note = ${note}
          where kind = ${data.kind} and phone_key = ${key}
        `;
        return { ok: true, status: "updated", ref: existing[0].ref, name, kind: data.kind };
      }

      const ref = makeRef();
      await sql`
        insert into registrations (ref, kind, name, phone, phone_key, cohort, city, role, note)
        values (${ref}, ${data.kind}, ${name}, ${phone}, ${key}, ${cohort}, ${city}, ${role}, ${note})
      `;
      return { ok: true, status: "created", ref, name, kind: data.kind };
    } catch {
      return { ok: false, error: "The desk could not save that just now. Try again in a moment." };
    }
  });

export const openDesk = createServerFn({ method: "POST" })
  .validator(deskSchema)
  .handler(async ({ data }): Promise<DeskResult> => {
    const state = gate();
    const now = Date.now();
    if (state.until > now) {
      return { ok: false, error: "Too many tries. Wait a minute, then try the password again." };
    }
    const allowed = await passwordMatches(data.password);
    if (!allowed) {
      state.fails += 1;
      if (state.fails >= 5) {
        state.fails = 0;
        state.until = now + 60_000;
      }
      return { ok: false, error: "That password does not open the desk." };
    }
    state.fails = 0;
    state.until = 0;

    try {
      const sql = await getSql();
      const rows = await sql<{
        ref: string;
        kind: string;
        name: string;
        phone: string;
        cohort: string;
        city: string;
        role: string;
        note: string;
        created_at: unknown;
      }>`
        select ref, kind, name, phone, cohort, city, role, note, created_at
        from registrations
        order by created_at desc
      `;
      return {
        ok: true,
        rows: rows.map((row) => ({
          ref: row.ref,
          kind: asKind(row.kind),
          name: row.name,
          phone: row.phone,
          cohort: row.cohort,
          city: row.city,
          role: row.role,
          note: row.note,
          createdAt: stamp(row.created_at),
        })),
      };
    } catch {
      return { ok: false, error: "The list could not be opened just now. Try again in a moment." };
    }
  });
