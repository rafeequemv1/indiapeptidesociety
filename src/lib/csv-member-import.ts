import type { SiteContent, SocietyMember, PermanentMember, SymposiumAttendee, RecognizedPerson, TeamMember } from "../data/store";
import { allocateMemberNumber } from "./registration-numbers";

export type MemberCsvKind = "all" | "students" | "permanent" | "executive" | "attendees" | "recognized";

export interface CsvFieldDef {
  key: string;
  label: string;
  required?: boolean;
}

export const CSV_FIELD_SCHEMAS: Record<MemberCsvKind, CsvFieldDef[]> = {
  all: [
    { key: "name", label: "Name", required: true },
    { key: "registrationNo", label: "Registration / membership no." },
    { key: "affiliation", label: "Affiliation" },
    { key: "city", label: "City" },
  ],
  students: [
    { key: "name", label: "Name", required: true },
    { key: "registrationNo", label: "Registration / membership no." },
    { key: "affiliation", label: "Affiliation" },
    { key: "city", label: "City" },
  ],
  permanent: [
    { key: "name", label: "Name", required: true },
    { key: "membershipNo", label: "Membership no.", required: true },
    { key: "isFounder", label: "Founder (true/false)" },
  ],
  executive: [
    { key: "name", label: "Name", required: true },
    { key: "role", label: "Role" },
    { key: "affiliation", label: "Affiliation" },
    { key: "membershipNo", label: "Membership no." },
    { key: "image", label: "Image URL" },
  ],
  attendees: [
    { key: "name", label: "Name", required: true },
    { key: "affiliation", label: "Affiliation" },
    { key: "symposiumYear", label: "Symposium year" },
    { key: "symposiumTitle", label: "Symposium title" },
  ],
  recognized: [
    { key: "name", label: "Name", required: true },
    { key: "honor", label: "Honor / award", required: true },
    { key: "year", label: "Year" },
    { key: "affiliation", label: "Affiliation" },
  ],
};

const FIELD_ALIASES: Record<string, string[]> = {
  name: ["name", "fullname", "full name", "member name", "person", "member"],
  registrationNo: [
    "registrationno",
    "registration no",
    "registration number",
    "membershipno",
    "membership no",
    "membership number",
    "regno",
    "reg no",
    "ipsno",
    "ips no",
    "ips",
  ],
  affiliation: ["affiliation", "institute", "institution", "organization", "organisation", "org", "university", "college"],
  city: ["city", "location", "town", "place"],
  membershipNo: ["membershipno", "membership no", "membership number", "memberno", "member no", "number", "no"],
  isFounder: ["isfounder", "is founder", "founder"],
  role: ["role", "title", "position", "office"],
  image: ["image", "photo", "picture", "url", "avatar"],
  symposiumYear: ["symposiumyear", "symposium year", "eventyear", "event year", "year"],
  symposiumTitle: ["symposiumtitle", "symposium title", "event", "eventtitle", "event title", "symposium"],
  honor: ["honor", "honour", "award", "recognition", "distinction"],
  year: ["year", "awardyear", "award year"],
};

function normHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function guessColumnMapping(headers: string[], fields: CsvFieldDef[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const used = new Set<string>();

  for (const field of fields) {
    const aliases = [field.key, field.label, ...(FIELD_ALIASES[field.key] ?? [])].map(normHeader);
    let match = "";
    for (const header of headers) {
      if (used.has(header)) continue;
      const nh = normHeader(header);
      if (aliases.some((a) => nh === a || nh.includes(a) || a.includes(nh))) {
        match = header;
        break;
      }
    }
    if (match) {
      mapping[field.key] = match;
      used.add(match);
    } else {
      mapping[field.key] = "";
    }
  }

  return mapping;
}

export function applyColumnMapping(
  rawRows: Record<string, string>[],
  mapping: Record<string, string>,
): Record<string, string>[] {
  return rawRows.map((raw) => {
    const row: Record<string, string> = {};
    for (const [fieldKey, header] of Object.entries(mapping)) {
      if (header) row[fieldKey] = (raw[header] ?? "").trim();
    }
    return row;
  });
}

function importDirectoryMembers(rows: Record<string, string>[], content: SiteContent): SocietyMember[] {
  return rows
    .map((r) => {
      const registrationNo = (r.registrationNo || "").trim();
      return {
        name: r.name || "",
        registrationNo: registrationNo || undefined,
        membershipNo: registrationNo || undefined,
        affiliation: r.affiliation || undefined,
        city: r.city || undefined,
      };
    })
    .filter((m) => m.name)
    .map((m) => {
      if (m.registrationNo) return m;
      const registrationNo = allocateMemberNumber(content);
      return { ...m, registrationNo, membershipNo: registrationNo };
    });
}

export function importMappedMemberRows(
  kind: MemberCsvKind,
  rows: Record<string, string>[],
  content: SiteContent,
  setExecutives: (executives: TeamMember[]) => void,
): number {
  if (!rows.length) throw new Error("CSV has no data rows.");

  if (kind === "all") {
    const imported = importDirectoryMembers(rows, content);
    if (!imported.length) throw new Error("No valid members found. Map the Name column at minimum.");
    content.allMembers = imported;
    return imported.length;
  }

  if (kind === "students") {
    const imported = importDirectoryMembers(rows, content);
    if (!imported.length) throw new Error("No valid student members found. Map the Name column at minimum.");
    content.studentMembers = imported;
    return imported.length;
  }

  if (kind === "permanent") {
    const imported: PermanentMember[] = rows
      .map((r) => ({
        name: r.name || "",
        membershipNo: Number(r.membershipNo) || 0,
        isFounder: /^(true|1|yes)$/i.test(r.isFounder || ""),
      }))
      .filter((m) => m.name);
    if (!imported.length) throw new Error("No valid permanent members found. Map Name and Membership no.");
    content.permanentMembers = imported;
    return imported.length;
  }

  if (kind === "executive") {
    const imported: TeamMember[] = rows
      .map((r) => ({
        name: r.name || "",
        membershipNo: r.membershipNo || undefined,
        role: r.role || "",
        affiliation: r.affiliation || "",
        image: r.image || "",
        section: "executive" as const,
      }))
      .filter((m) => m.name);
    if (!imported.length) throw new Error("No valid executive members found. Map the Name column at minimum.");
    setExecutives(imported);
    return imported.length;
  }

  if (kind === "attendees") {
    const imported: SymposiumAttendee[] = rows
      .map((r) => ({
        name: r.name || "",
        affiliation: r.affiliation || undefined,
        symposiumYear: Number(r.symposiumYear) || new Date().getFullYear(),
        symposiumTitle: r.symposiumTitle || undefined,
      }))
      .filter((m) => m.name);
    if (!imported.length) throw new Error("No valid attendees found. Map the Name column at minimum.");
    content.symposiumAttendees = imported;
    return imported.length;
  }

  if (kind === "recognized") {
    const imported: RecognizedPerson[] = rows
      .map((r) => ({
        name: r.name || "",
        honor: r.honor || "",
        year: r.year || undefined,
        affiliation: r.affiliation || undefined,
      }))
      .filter((m) => m.name && m.honor);
    if (!imported.length) throw new Error("No valid recognised people found. Map Name and Honor columns.");
    content.recognizedPeople = imported;
    return imported.length;
  }

  throw new Error("Unknown member list.");
}

export function validateMapping(
  mapping: Record<string, string>,
  fields: CsvFieldDef[],
  mappedRows: Record<string, string>[],
): string | null {
  for (const field of fields) {
    if (field.required && !mapping[field.key]) {
      return `Map the required field: ${field.label}.`;
    }
  }
  const validRows = mappedRows.filter((row) => {
    return fields.filter((f) => f.required).every((f) => (row[f.key] ?? "").trim());
  });
  if (!validRows.length) {
    return "No rows have all required fields. Check your column mapping.";
  }
  return null;
}
