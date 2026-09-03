import {
  loadContent,
  PAGE_SIZE,
  escapeHtml,
  type PermanentMember,
  type TeamMember,
  type RecognizedPerson,
  type SocietyMember,
} from "./data/store";
import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

type TabId = "all" | "permanent" | "executive" | "recognized";

const VALID_TABS: TabId[] = ["all", "permanent", "executive", "recognized"];

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

function memberNumberLine(registrationNo?: string, membershipNo?: string | number): string {
  if (registrationNo) return `Membership No. ${registrationNo}`;
  if (membershipNo !== undefined && membershipNo !== "") return `Membership No. ${membershipNo}`;
  return "";
}

function renderAllMemberCard(member: SocietyMember): string {
  const lines = [
    memberNumberLine(member.registrationNo, member.membershipNo),
    member.affiliation || "",
    member.city || "",
  ];
  return renderListingCard(member.name, lines, "Member");
}

function renderPermanentCard(member: PermanentMember): string {
  const badge = member.isFounder ? "Founder" : "Permanent";
  const badgeClass = member.isFounder
    ? "people-card__badge people-card__badge--founder"
    : "people-card__badge";
  return renderListingCard(member.name, [`Membership No. ${member.membershipNo}`], badge, badgeClass);
}

function renderExecutiveCard(member: TeamMember): string {
  const lines = [
    member.membershipNo ? `Membership No. ${member.membershipNo}` : "",
    member.role || "",
    member.affiliation || "",
  ];
  return renderListingCard(
    member.name,
    lines,
    "Executive",
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
  executiveGrid.innerHTML = executives.map(renderExecutiveCard).join("");
  recognizedGrid.innerHTML = data.recognizedPeople.map(renderRecognizedCard).join("");

  function setCount(id: string, n: number): void {
    const el = document.getElementById(id);
    if (el) el.textContent = String(n);
  }

  setCount("count-permanent", data.permanentMembers.length);
  setCount("count-executive", executives.length);
  setCount("count-recognized", data.recognizedPeople.length);
  setCount("count-all", data.allMembers.length);

  let permanentPage = 0;
  let allPage = 0;

  function renderPermanent(reset = false): void {
    if (reset) permanentPage = 0;
    const q = (searchInput?.value ?? "").trim().toLowerCase();
    const filtered = data.permanentMembers
      .filter((m) => !q || m.name.toLowerCase().includes(q) || String(m.membershipNo).includes(q))
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
    const filtered = data.allMembers.filter((m) => {
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        (m.registrationNo || "").toLowerCase().includes(q) ||
        (m.membershipNo || "").toLowerCase().includes(q) ||
        (m.affiliation || "").toLowerCase().includes(q) ||
        (m.city || "").toLowerCase().includes(q)
      );
    });
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
