import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";
import { getSupabaseClient, isSupabaseConfigured } from "./data/supabase/client";

const SECTION_IDS = [
  "overview",
  "about",
  "programme",
  "papers",
  "speakers",
  "fees",
  "sponsors",
  "venue",
  "faq",
  "contact",
] as const;

type SectionId = (typeof SECTION_IDS)[number];

function pad(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

function initCountdown(): void {
  const root = document.getElementById("ips2027-countdown");
  if (!root) return;
  const targetIso = root.dataset.target || "2027-02-25T09:00:00+05:30";
  const target = new Date(targetIso).getTime();
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");

  function tick(): void {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86_400_000);
    diff -= days * 86_400_000;
    const hours = Math.floor(diff / 3_600_000);
    diff -= hours * 3_600_000;
    const mins = Math.floor(diff / 60_000);
    diff -= mins * 60_000;
    const secs = Math.floor(diff / 1000);
    if (daysEl) daysEl.textContent = String(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl) minsEl.textContent = pad(mins);
    if (secsEl) secsEl.textContent = pad(secs);
  }

  tick();
  window.setInterval(tick, 1000);
}

function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

function sectionFromHash(): SectionId {
  const raw = (location.hash || "#overview").replace(/^#/, "").toLowerCase();
  if (raw === "register") return "fees";
  if (raw === "sponsorship" || raw === "sponsor") return "sponsors";
  if (isSectionId(raw)) return raw;
  return "overview";
}

function setActiveNav(id: SectionId): void {
  document.querySelectorAll<HTMLAnchorElement>(".ips2027-side__link").forEach((link) => {
    const active = link.dataset.section === id;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function scrollToSection(id: SectionId, pushHash = true): void {
  const el = document.getElementById(id);
  if (!el) return;
  setActiveNav(id);
  if (pushHash) {
    const next = `#${id}`;
    if (location.hash !== next) history.replaceState(null, "", next);
  }
  const headerOffset = 96;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: "smooth" });
}

function initSideNav(): void {
  document.querySelectorAll<HTMLAnchorElement>(".ips2027-side__link, .ips2027-jump").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = (link.dataset.section || link.getAttribute("href")?.replace(/^#/, "") || "").toLowerCase();
      if (!isSectionId(id)) return;
      e.preventDefault();
      scrollToSection(id);
    });
  });

  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => Boolean(el),
  );

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const top = visible[0];
      if (!top?.target?.id || !isSectionId(top.target.id)) return;
      setActiveNav(top.target.id);
      const next = `#${top.target.id}`;
      if (location.hash !== next && location.hash !== "" && location.hash !== "#") {
        history.replaceState(null, "", next);
      }
    },
    {
      rootMargin: "-20% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.5],
    },
  );

  sections.forEach((section) => observer.observe(section));

  window.addEventListener("hashchange", () => {
    scrollToSection(sectionFromHash(), false);
  });

  const initial = sectionFromHash();
  setActiveNav(initial);
  if (location.hash && location.hash !== "#overview") {
    requestAnimationFrame(() => scrollToSection(initial, false));
  }
}

async function loadProgrammeImage(): Promise<void> {
  const img = document.getElementById("ips2027-programme-img") as HTMLImageElement | null;
  if (!img) return;

  const fallback = img.dataset.fallback || "/images/ips2027/scientific-programme.png";
  img.addEventListener("error", () => {
    if (img.src !== fallback && !img.src.endsWith(fallback)) {
      img.src = fallback;
    }
  });

  if (!isSupabaseConfigured()) return;

  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("ips2027_assets")
      .select("image_url")
      .eq("id", "scientific-programme")
      .maybeSingle();

    if (error || !data?.image_url) return;

    const url = String(data.image_url).trim();
    if (url) img.src = url;
  } catch {
    // Keep current / fallback image
  }
}

injectLayout("ips2027");
initMobileMenu();
initNewsletterForm();
initCountdown();
initSideNav();
void loadProgrammeImage();
