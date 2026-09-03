import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";
import { getSupabaseClient, isSupabaseConfigured } from "./data/supabase/client";

const TAB_IDS = [
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

type TabId = (typeof TAB_IDS)[number];

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

function isTabId(value: string): value is TabId {
  return (TAB_IDS as readonly string[]).includes(value);
}

function activateTab(tab: TabId, pushHash = true): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".ips2027-tabs__btn");
  const panels = document.querySelectorAll<HTMLElement>(".ips2027-panel");

  buttons.forEach((btn) => {
    const active = btn.dataset.tab === tab;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });

  panels.forEach((panel) => {
    const active = panel.id === `panel-${tab}`;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });

  if (pushHash) {
    const next = tab === "overview" ? "#overview" : `#${tab}`;
    if (location.hash !== next) {
      history.replaceState(null, "", next);
    }
  }

  const tabsWrap = document.getElementById("ips2027-tabs");
  const activeBtn = document.querySelector<HTMLButtonElement>(`.ips2027-tabs__btn[data-tab="${tab}"]`);
  activeBtn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  if (tabsWrap && location.hash && location.hash !== "#overview") {
    const top = tabsWrap.getBoundingClientRect().top + window.scrollY - 8;
    if (window.scrollY + 120 < top || window.scrollY > top + 200) {
      window.scrollTo({ top, behavior: "smooth" });
    }
  }
}

function tabFromHash(): TabId {
  const raw = (location.hash || "#overview").replace(/^#/, "").toLowerCase();
  if (raw === "register") return "fees";
  if (raw === "sponsorship" || raw === "sponsor") return "sponsors";
  if (isTabId(raw)) return raw;
  return "overview";
}

function initTabs(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".ips2027-tabs__btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab && isTabId(tab)) activateTab(tab);
    });
  });

  document.querySelectorAll<HTMLAnchorElement>(".ips2027-tab-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const tab = link.dataset.tab;
      if (tab && isTabId(tab)) {
        e.preventDefault();
        activateTab(tab);
      }
    });
  });

  window.addEventListener("hashchange", () => activateTab(tabFromHash(), false));
  activateTab(tabFromHash(), false);
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
initTabs();
void loadProgrammeImage();
