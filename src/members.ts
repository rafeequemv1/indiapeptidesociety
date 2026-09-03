import {
  loadContent,
  PAGE_SIZE,
  escapeHtml,
  type PermanentMember,
  type TeamMember,
  type RecognizedPerson,
  type SocietyMember,
} from "./data/store";
import { formatMembershipDisplayNo } from "./lib/registration-numbers";
import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

type TabId = "all" | "permanent" | "executive" | "recognized";

const VALID_TABS: TabId[] = ["all", "permanent", "executive", "recognized"];

interface MemberListing {
  name: string;
  lines: string[];
  badge: string;
  badgeClass: string;
  searchBlob: string;
}

function renderListingCard(
  name: string,
  lines: string[],
  badge?: string,
  badgeClass = "people-card__badge",
): string {
  return `
    <article class="people-card people-card--listing">
      <div class="people-card__body">
        ${badge ? `<span class="${badgeClass}">${escapeHtml(badge)}</span>` : ""}
        <h3 class="people-card__name">${escapeHtml(name)}</h3>
        ${lines
          .filter(Boolean)
          .map((line) => `<p class="people-card__meta">${escapeHtml(line)}</p>`)
          .join("")}
      </div>
    </article>`;
}

function membershipNoLine(...values: (string | number | undefined)[]): string {
  const formatted = values.map((value) => formatMembershipDisplayNo(value)).find(Boolean) ?? "";
  return formatted ? `Membership No. ${formatted}` : "";
}

function renderAllMemberCard(entry: MemberListing): string {
  return renderListingCard(entry.name, entry.lines, entry.badge, entry.badgeClass);
}

function renderPermanentCard(member: PermanentMember): string {
  const badge = member.isFounder ? "Founder" : "Permanent";
  const badgeClass = member.isFounder
    ? "people-card__badge people-card__badge--founder"
    : "people-card__badge people-card__badge--permanent";
  return renderListingCard(member.name, [membershipNoLine(member.membershipNo)], badge, badgeClass);
}

function renderExecutiveCard(member: TeamMember): string {
  const lines = [
    membershipNoLine(member.membershipNo),
    member.role || "",
    member.affiliation || "",
  ];
  return renderListingCard(
    member.name,
    lines,
    "Executive",
    "people-card__badge people-card__badge--executive",
  );
}

function renderRecognizedCard(person: RecognizedPerson): string {
  return renderListingCard(
    person.name,
    [person.honor, person.affiliation || "", person.year || ""],
    "Recognised",
    "people-card__badge people-card__badge--honor",
  );
}

function buildAllListings(
  allMembers: SocietyMember[],
  executives: TeamMember[],
  recognizedPeople: RecognizedPerson[],
): MemberListing[] {
  const executiveEntries: MemberListing[] = executives.map((member) => ({
    name: member.name,
    lines: [membershipNoLine(member.membershipNo), member.role || "", member.affiliation || ""].filter(Boolean),
    badge: "Executive",
    badgeClass: "people-card__badge people-card__badge--executive",
    searchBlob: [
      member.name,
      member.role,
      member.affiliation,
      formatMembershipDisplayNo(member.membershipNo),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  const memberEntries: MemberListing[] = allMembers.map((member) => ({
    name: member.name,
    lines: [
      membershipNoLine(member.registrationNo, member.membershipNo),
      member.affiliation || "",
      member.city || "",
    ].filter(Boolean),
    badge: "Member",
    badgeClass: "people-card__badge people-card__badge--member",
    searchBlob: [
      member.name,
      member.registrationNo,
      member.membershipNo,
      member.affiliation,
      member.city,
      formatMembershipDisplayNo(member.registrationNo),
      formatMembershipDisplayNo(member.membershipNo),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  const recognizedEntries: MemberListing[] = recognizedPeople.map((person) => ({
    name: person.name,
    lines: [person.honor, person.affiliation || "", person.year || ""].filter(Boolean),
    badge: "Recognised",
    badgeClass: "people-card__badge people-card__badge--honor",
    searchBlob: [person.name, person.honor, person.affiliation, person.year]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  }));

  return [...executiveEntries, ...memberEntries, ...recognizedEntries].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

function initMembersPage(): void {
  const data = loadContent();
  const navItems = document.querySelectorAll<HTMLButtonElement>(".members-nav__item[data-tab]");
  const panels: Record<TabId, HTMLElement | null> = {
    all: document.getElementById("panel-all"),
    permanent: document.getElementById("panel-permanent"),
    executive: document.getElementById("panel-executive"),
    recognized: document.getElementById("panel-recognized"),
  };
  const allGrid = document.getElementById("all-members-grid");
  const permanentGrid = document.getElementById("permanent-grid");
  const executiveGrid = document.getElementById("executive-grid");
  const recognizedGrid = document.getElementById("recognized-grid");
  const searchInput = document.getElementById("member-search") as HTMLInputElement | null;
  const allSearchInput = document.getElementById("all-member-search") as HTMLInputElement | null;
  const resultsText = document.getElementById("results-text");
  const allResultsText = document.getElementById("all-results-text");
  const nextBtn = document.getElementById("next-page") as HTMLButtonElement | null;
  const allNextBtn = document.getElementById("all-next-page") as HTMLButtonElement | null;

  if (!allGrid || !permanentGrid || !executiveGrid || !recognizedGrid) return;

  const executives = data.team.filter((m) => m.section === "executive");
  const allListings = buildAllListings(data.allMembers, executives, data.recognizedPeople);

  executiveGrid.innerHTML = executives.map(renderExecutiveCard).join("");
  recognizedGrid.innerHTML = data.recognizedPeople.map(renderRecognizedCard).join("");

  function setCount(id: string, n: number): void {
    const el = document.getElementById(id);
    if (el) el.textContent = String(n);
  }

  setCount("count-permanent", data.permanentMembers.length);
  setCount("count-executive", executives.length);
  setCount("count-recognized", data.recognizedPeople.length);
  setCount("count-all", allListings.length);

  let permanentPage = 0;
  let allPage = 0;

  function renderPermanent(reset = false): void {
    if (reset) permanentPage = 0;
    const q = (searchInput?.value ?? "").trim().toLowerCase();
    const filtered = data.permanentMembers
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          formatMembershipDisplayNo(m.membershipNo).toLowerCase().includes(q) ||
          String(m.membershipNo).includes(q),
      )
      .sort((a, b) => Number(Boolean(b.isFounder)) - Number(Boolean(a.isFounder)) || a.membershipNo - b.membershipNo);

    const end = (permanentPage + 1) * PAGE_SIZE;
    const slice = filtered.slice(0, end);
    permanentGrid!.innerHTML = slice.map(renderPermanentCard).join("");
    if (resultsText) {
      resultsText.textContent = `Showing ${slice.length} of ${Math.max(data.totalMembers, filtered.length)}`;
    }
    if (nextBtn) nextBtn.hidden = end >= filtered.length;
  }

  function renderAllMembers(reset = false): void {
    if (reset) allPage = 0;
    const q = (allSearchInput?.value ?? "").trim().toLowerCase();
    const filtered = allListings.filter((entry) => !q || entry.searchBlob.includes(q));
    const end = (allPage + 1) * PAGE_SIZE;
    const slice = filtered.slice(0, end);
    allGrid!.innerHTML =
      slice.map(renderAllMemberCard).join("") ||
      `<p class="members-empty">No members in the directory yet. Add them from the dashboard.</p>`;
    if (allResultsText) {
      allResultsText.textContent = `Showing ${slice.length} of ${filtered.length}`;
    }
    if (allNextBtn) allNextBtn.hidden = end >= filtered.length;
  }

  function setTab(tab: TabId): void {
    navItems.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    (Object.keys(panels) as TabId[]).forEach((key) => {
      if (panels[key]) panels[key]!.hidden = key !== tab;
    });
    const url = new URL(window.location.href);
    if (tab === "all") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url);
  }

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab as TabId));
  });

  searchInput?.addEventListener("input", () => renderPermanent(true));
  nextBtn?.addEventListener("click", () => {
    permanentPage += 1;
    renderPermanent();
  });

  allSearchInput?.addEventListener("input", () => renderAllMembers(true));
  allNextBtn?.addEventListener("click", () => {
    allPage += 1;
    renderAllMembers();
  });

  renderPermanent(true);
  renderAllMembers(true);

  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get("tab");
  if (tabParam && VALID_TABS.includes(tabParam as TabId) && tabParam !== "all") {
    setTab(tabParam as TabId);
  } else {
    setTab("all");
  }
}

injectLayout("members");
initMobileMenu();
initNewsletterForm();
initMembersPage();
