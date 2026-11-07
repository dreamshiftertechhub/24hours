export const COHORTS = [
  { id: "teen", label: "Teen" },
  { id: "youth", label: "Youth" },
  { id: "believer", label: "Believer" },
] as const;

export const ROLES = [
  "Ushering",
  "Protocol",
  "Media",
  "Welfare & meals",
  "Prayer & altar",
  "Registration desk",
  "Transport",
  "Other",
] as const;

export type CohortLabel = (typeof COHORTS)[number]["label"];
export type RoleLabel = (typeof ROLES)[number];
export type SignupKind = "attendee" | "volunteer";

export const VENUE_LINES = [
  "RCCG Light Headquarters",
  "1–2 Church Street, via Omolara Okunbadejo Road",
  "Iyana-Abule, Ijoko, Ogun State",
] as const;

export function phoneKey(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) return digits;
  if (digits.startsWith("0") && digits.length === 11) return `234${digits.slice(1)}`;
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return null;
}

export function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
