/**
 * Scalable IPS registration numbers for society members and symposium entries.
 *
 * Formats:
 *   Members:    IPS-000001
 *   Symposium:  IPS-SYM-2027-000001
 *
 * Counters live on SiteContent.registrationCounters and advance on allocate.
 */

import type { SiteContent } from "../domain/types";

const PAD = 6;

export interface RegistrationCounters {
  /** Last issued member sequence (IPS-######). */
  member: number;
  /** Last issued symposium sequence per event year. */
  symposium: Record<string, number>;
}

export function defaultRegistrationCounters(): RegistrationCounters {
  return { member: 0, symposium: {} };
}

export function normalizeRegistrationCounters(
  raw: Partial<RegistrationCounters> | undefined,
  content: Pick<SiteContent, "allMembers" | "permanentMembers" | "symposiumRegistrations">,
): RegistrationCounters {
  const counters: RegistrationCounters = {
    member: Math.max(0, Number(raw?.member) || 0),
    symposium: { ...(raw?.symposium ?? {}) },
  };

  // Seed member counter from existing directory numbers
  let maxMem = counters.member;
  for (const m of content.allMembers ?? []) {
    const fromReg = parseMemberSeq(m.registrationNo || m.membershipNo || "");
    const fromLegacy = Number(m.membershipNo) || 0;
    maxMem = Math.max(maxMem, fromReg, fromLegacy);
  }
  for (const m of content.permanentMembers ?? []) {
    maxMem = Math.max(maxMem, Number(m.membershipNo) || 0);
  }
  counters.member = maxMem;

  // Seed symposium counters from existing receipt numbers
  for (const r of content.symposiumRegistrations ?? []) {
    const parsed = parseSymposiumNo(r.receiptNo || "");
    if (!parsed) continue;
    const cur = counters.symposium[parsed.year] ?? 0;
    counters.symposium[parsed.year] = Math.max(cur, parsed.seq);
  }

  return counters;
}

export function formatMemberNo(seq: number): string {
  return `IPS-${String(seq).padStart(PAD, "0")}`;
}

/** Normalize legacy IPS-MEM- numbers to IPS- for display/storage. */
export function normalizeMemberDisplayNo(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^IPS-MEM-/i, "IPS-");
}

/** Display any stored member number as IPS-######. */
export function formatMembershipDisplayNo(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "";
  const raw = String(value).trim();
  const normalized = normalizeMemberDisplayNo(raw);
  if (/^IPS-\d+$/i.test(normalized)) {
    const seq = parseMemberSeq(normalized);
    return seq > 0 ? formatMemberNo(seq) : normalized.toUpperCase();
  }
  const seq = parseMemberSeq(raw);
  return seq > 0 ? formatMemberNo(seq) : normalized;
}

export function formatSymposiumNo(year: number | string, seq: number): string {
  return `IPS-SYM-${year}-${String(seq).padStart(PAD, "0")}`;
}

export function parseMemberSeq(value: string): number {
  const trimmed = value.trim();
  let m = trimmed.match(/^IPS-MEM-(\d+)$/i);
  if (m) return Number(m[1]) || 0;
  m = trimmed.match(/^IPS-(\d+)$/i);
  if (m) return Number(m[1]) || 0;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : 0;
}

export function parseSymposiumNo(value: string): { year: string; seq: number } | null {
  const m = value.trim().match(/^IPS-SYM-(\d{4})-(\d+)$/i);
  if (!m) return null;
  return { year: m[1], seq: Number(m[2]) || 0 };
}

/** Allocate next society member registration number and persist counters on content. */
export function allocateMemberNumber(content: SiteContent): string {
  if (!content.registrationCounters) {
    content.registrationCounters = normalizeRegistrationCounters(undefined, content);
  }
  content.registrationCounters.member += 1;
  return formatMemberNo(content.registrationCounters.member);
}

/** Allocate next symposium registration number for an event year. */
export function allocateSymposiumNumber(content: SiteContent, year: number | string): string {
  if (!content.registrationCounters) {
    content.registrationCounters = normalizeRegistrationCounters(undefined, content);
  }
  const y = String(year);
  const next = (content.registrationCounters.symposium[y] ?? 0) + 1;
  content.registrationCounters.symposium[y] = next;
  return formatSymposiumNo(y, next);
}

/** Prefer explicit year from symposium dates/config; fallback to calendar year. */
export function symposiumEventYear(datesOrTitle: string, fallback = new Date().getFullYear()): number {
  const m = datesOrTitle.match(/\b(20\d{2})\b/);
  return m ? Number(m[1]) : fallback;
}
