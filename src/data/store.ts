/**
 * Sync content facade used by the current UI.
 * Backed by localStorage today; switch to Supabase via `src/data/index.ts` when migrating.
 */
export type {
  Announcement,
  NewsItem,
  StatItem,
  LifetimeAward,
  ServiceItem,
  TeamMember,
  TeamGroup,
  SymposiumEvent,
  FounderMember,
  DirectoryMember,
  PermanentMember,
  SymposiumAttendee,
  RecognizedPerson,
  SocietyMember,
  BlogPost,
  GalleryImage,
  FaqItem,
  ContactMessage,
  SymposiumRegistrationConfig,
  SymposiumRegistration,
  PaymentStatus,
  SiteContent,
} from "../domain/types";

import type { PermanentMember, SiteContent, SocietyMember, TeamMember } from "../domain/types";
import { defaultContent } from "../domain/defaults";
import {
  formatMemberNo,
  normalizeMemberDisplayNo,
  normalizeRegistrationCounters,
  parseMemberSeq,
} from "../lib/registration-numbers";

export { defaultContent };

const STORAGE_KEY = "ips-site-content";

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteContent>;
      return normalizeContent(parsed);
    }
  } catch {
    /* use defaults */
  }
  return structuredClone(defaultContent);
}

function normalizePermanentMembers(parsed: Partial<SiteContent>): PermanentMember[] {
  const fromNew = parsed.permanentMembers;
  const fromLegacy = parsed.directoryMembers;
  if (fromNew?.length) {
    return fromNew.map((m) => ({
      name: m.name,
      membershipNo: Number(m.membershipNo) || 0,
      isFounder: Boolean(m.isFounder),
    }));
  }
  if (fromLegacy?.length) {
    const founderNames = new Set((parsed.founderMembers ?? defaultContent.founderMembers).map((f) => f.name));
    const mapped = fromLegacy.map((m) => ({
      name: m.name,
      membershipNo: Number(m.membershipNo) || 0,
      isFounder: Boolean(m.isFounder) || founderNames.has(m.name),
    }));
    const existing = new Set(mapped.map((m) => m.name));
    const founders = (parsed.founderMembers ?? defaultContent.founderMembers)
      .filter((f) => !existing.has(f.name))
      .map((f, i) => ({ name: f.name, membershipNo: i + 1, isFounder: true }));
    return [...founders, ...mapped];
  }
  return structuredClone(defaultContent.permanentMembers);
}

function normalizeAllMembers(
  parsed: Partial<SiteContent>,
  permanentMembers: PermanentMember[],
): SocietyMember[] {
  if (Array.isArray(parsed.allMembers) && parsed.allMembers.length) {
    return parsed.allMembers.map((m) => {
      const legacy = m.membershipNo ? String(m.membershipNo) : "";
      const registrationNo = normalizeMemberDisplayNo(
        m.registrationNo?.trim() ||
          (parseMemberSeq(legacy) ? formatMemberNo(parseMemberSeq(legacy)) : legacy) ||
          "",
      );
      return {
        name: m.name ?? "",
        registrationNo,
        membershipNo: normalizeMemberDisplayNo(legacy || registrationNo),
        affiliation: m.affiliation ?? "",
        city: m.city ?? "",
      };
    });
  }
  return permanentMembers.map((m) => ({
    name: m.name,
    membershipNo: String(m.membershipNo),
    registrationNo: formatMemberNo(m.membershipNo),
    affiliation: "",
    city: "",
  }));
}

function normalizeContent(parsed: Partial<SiteContent>): SiteContent {
  const base = structuredClone(defaultContent);
  const permanentMembers = normalizePermanentMembers(parsed);
  const allMembers = normalizeAllMembers(parsed, permanentMembers);
  const merged: SiteContent = {
    ...base,
    ...parsed,
    announcement: {
      ...base.announcement,
      ...parsed.announcement,
      showCtaButton: parsed.announcement?.showCtaButton ?? Boolean(parsed.announcement?.ctaUrl),
    },
    news: (parsed.news ?? base.news).map((item, i) => ({
      ...base.news[i],
      ...item,
      image: item.image ?? "",
    })),
    lifetimeAwards: parsed.lifetimeAwards?.length ? parsed.lifetimeAwards : base.lifetimeAwards,
    team: normalizeTeam(parsed.team),
    permanentMembers,
    allMembers,
    studentMembers: Array.isArray(parsed.studentMembers) ? parsed.studentMembers : base.studentMembers,
    symposiumAttendees: parsed.symposiumAttendees?.length
      ? parsed.symposiumAttendees
      : base.symposiumAttendees,
    recognizedPeople: parsed.recognizedPeople?.length
      ? parsed.recognizedPeople
      : base.recognizedPeople,
    blogPosts: parsed.blogPosts?.length ? parsed.blogPosts : base.blogPosts,
    heroImages: Array.isArray(parsed.heroImages)
      ? parsed.heroImages.map((g, i) => ({
          id: g.id || `hero-${i + 1}`,
          title: g.title ?? "",
          image: g.image ?? "",
          storagePath: g.storagePath,
        }))
      : base.heroImages,
    galleryImages: Array.isArray(parsed.galleryImages)
      ? parsed.galleryImages.map((g, i) => ({
          id: g.id || `gallery-${i + 1}`,
          title: g.title ?? "",
          image: g.image ?? "",
          storagePath: g.storagePath,
        }))
      : base.galleryImages,
    founderMembers: parsed.founderMembers?.length ? parsed.founderMembers : base.founderMembers,
    symposiumRegistration: {
      ...base.symposiumRegistration,
      ...parsed.symposiumRegistration,
    },
    contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
    membershipApplications: Array.isArray(parsed.membershipApplications)
      ? parsed.membershipApplications
      : [],
    symposiumRegistrations: normalizeRegistrations(parsed.symposiumRegistrations),
    registrationCounters: normalizeRegistrationCounters(parsed.registrationCounters, {
      allMembers,
      permanentMembers,
      symposiumRegistrations: normalizeRegistrations(parsed.symposiumRegistrations),
    }),
  };
  delete merged.directoryMembers;
  return merged;
}

function normalizeRegistrations(
  saved: SiteContent["symposiumRegistrations"] | undefined,
): SiteContent["symposiumRegistrations"] {
  const demos = structuredClone(defaultContent.symposiumRegistrations);
  if (!Array.isArray(saved) || saved.length === 0) return demos;

  const byId = new Map(saved.map((r) => [r.id, r]));
  // Keep demos that user hasn't overwritten; prepend any missing demo ids
  for (const demo of demos) {
    if (!byId.has(demo.id)) byId.set(demo.id, demo);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

function normalizeTeam(team: unknown): TeamMember[] {
  if (!Array.isArray(team) || team.length === 0) return defaultContent.team;
  const first = team[0] as Record<string, unknown>;
  if ("members" in first) return defaultContent.team;

  const members = team as TeamMember[];
  const executives = members.filter((m) => m.section === "executive");
  const advisors = members.filter((m) => m.section === "advisors");
  const defaultAdvisors = defaultContent.team.filter((m) => m.section === "advisors");

  const mergedAdvisors = defaultAdvisors.map((fallback, i) => {
    const saved = advisors[i];
    if (!saved) return fallback;
    const isPlaceholder = !saved.name || saved.name === "Scientific Advisor";
    return {
      ...fallback,
      ...saved,
      name: isPlaceholder ? fallback.name : saved.name,
      affiliation: saved.affiliation || fallback.affiliation,
      image:
        saved.image && !saved.image.includes("advisor-") && !saved.image.includes("chauhan")
          ? saved.image
          : fallback.image,
    };
  });

  const defaultExecutives = defaultContent.team.filter((m) => m.section === "executive");
  const mergedExecutives = defaultExecutives.map((fallback, i) => {
    const saved = executives[i] ?? {};
    const membershipNo =
      saved.membershipNo ||
      fallback.membershipNo ||
      (fallback.name ? formatMemberNo(i + 5) : undefined);
    return {
      ...fallback,
      ...saved,
      membershipNo,
    };
  });

  return [...mergedExecutives, ...mergedAdvisors];
}

export function saveContent(content: SiteContent): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export function resetContent(): SiteContent {
  let inbox: Pick<SiteContent, "contactMessages" | "symposiumRegistrations"> = {
    contactMessages: [],
    symposiumRegistrations: [],
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteContent>;
      inbox = {
        contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
        symposiumRegistrations: Array.isArray(parsed.symposiumRegistrations)
          ? parsed.symposiumRegistrations
          : [],
      };
    }
  } catch {
    /* ignore */
  }
  const next = {
    ...structuredClone(defaultContent),
    ...inbox,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const PAGE_SIZE = 32;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
