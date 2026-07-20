import {
  loadContent,
  PAGE_SIZE,
  escapeHtml,
  type PermanentMember,
  type TeamMember,
  type SymposiumAttendee,
  type RecognizedPerson,
} from "./data/store";
import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

type TabId = "all" | "permanent" | "executive" | "attendees" | "recognized";

const VALID_TABS: TabId[] = ["all", "permanent", "executive", "attendees", "recognized"];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function renderPermanentCard(member: PermanentMember): string {
  const badge = member.isFounder ? "Founder" : "Member";
  const badgeClass = member.isFounder
    ? "people-card__badge people-card__badge--founder"
    : "people-card__badge";
  const cardClass = member.isFounder ? "people-card people-card--founder" : "people-card";
  return `
    <article class="${cardClass}">
      <div class="people-card__avatar" aria-hidden="true">${escapeHtml(getInitials(member.name))}</div>
      <div class="people-card__body">
        <span class="${badgeClass}">${badge}</span>
        <h3 class="people-card__name">${escapeHtml(member.name)}</h3>
        <p class="people-card__meta">Membership No. ${member.membershipNo}</p>
      </div>
    </article>`;
}

function renderExecutiveCard(member: TeamMember): string {
  const photo = member.image
    ? `<img class="people-card__photo" src="${escapeHtml(member.image)}" alt="" width="72" height="72" />`
    : `<div class="people-card__avatar" aria-hidden="true">${escapeHtml(getInitials(member.name))}</div>`;
  return `
    <article class="people-card people-card--executive">
      ${photo}
      <div class="people-card__body">
        <span class="people-card__badge">Executive</span>
        <h3 class="people-card__name">${escapeHtml(member.name)}</h3>
        ${member.role ? `<p class="people-card__role">${escapeHtml(member.role)}</p>` : ""}
        <p class="people-card__title">${escapeHtml(member.affiliation)}</p>
      </div>
    </article>`;
}

function renderAttendeeCard(member: SymposiumAttendee): string {
  return `
    <article class="people-card">
      <div class="people-card__avatar" aria-hidden="true">${escapeHtml(getInitials(member.name))}</div>
      <div class="people-card__body">
        <span class="people-card__badge">Attendee</span>
        <h3 class="people-card__name">${escapeHtml(member.name)}</h3>
        ${member.affiliation ? `<p class="people-card__title">${escapeHtml(member.affiliation)}</p>` : ""}
        <p class="people-card__meta">${escapeHtml(member.symposiumTitle || `${member.symposiumYear} Symposium`)}</p>
      </div>
    </article>`;
}

function renderRecognizedCard(person: RecognizedPerson): string {
  return `
    <article class="people-card people-card--recognized">
      <div class="people-card__avatar" aria-hidden="true">${escapeHtml(getInitials(person.name))}</div>
      <div class="people-card__body">
        <span class="people-card__badge people-card__badge--honor">Recognised</span>
        <h3 class="people-card__name">${escapeHtml(person.name)}</h3>
        <p class="people-card__role">${escapeHtml(person.honor)}</p>
        ${person.affiliation ? `<p class="people-card__title">${escapeHtml(person.affiliation)}</p>` : ""}
        ${person.year ? `<p class="people-card__meta">${escapeHtml(person.year)}</p>` : ""}
      </div>
    </article>`;
}

function initMembersPage(): void {
  const data = loadContent();
  const navItems = document.querySelectorAll<HTMLButtonElement>(".members-nav__item[data-tab]");
  const panels: Record<TabId, HTMLElement | null> = {
    all: document.getElementById("panel-all"),
    permanent: document.getElementById("panel-permanent"),
    executive: document.getElementById("panel-executive"),
    attendees: document.getElementById("panel-attendees"),
    recognized: document.getElementById("panel-recognized"),
  };
  const allStack = document.getElementById("all-stack");
  const permanentGrid = document.getElementById("permanent-grid");
  const executiveGrid = document.getElementById("executive-grid");
  const attendeesGrid = document.getElementById("attendees-grid");
  const recognizedGrid = document.getElementById("recognized-grid");
  const searchInput = document.getElementById("member-search") as HTMLInputElement | null;
  const yearSelect = document.getElementById("attendee-year") as HTMLSelectElement | null;
  const resultsText = document.getElementById("results-text");
  const nextBtn = document.getElementById("next-page") as HTMLButtonElement | null;

  if (!allStack || !permanentGrid || !executiveGrid || !attendeesGrid || !recognizedGrid) return;

  const executives = data.team.filter((m) => m.section === "executive");
  executiveGrid.innerHTML = executives.map(renderExecutiveCard).join("");
  recognizedGrid.innerHTML = data.recognizedPeople.map(renderRecognizedCard).join("");

  const years = [...new Set(data.symposiumAttendees.map((a) => a.symposiumYear))].sort((a, b) => b - a);
  let selectedYear = years[0] ?? new Date().getFullYear();

  if (yearSelect) {
    yearSelect.innerHTML = years.length
      ? years.map((y) => `<option value="${y}">${y}</option>`).join("")
      : `<option value="">No attendees yet</option>`;
    yearSelect.value = String(selectedYear);
  }

  function setCount(id: string, n: number): void {
    const el = document.getElementById(id);
    if (el) el.textContent = String(n);
  }

  setCount("count-permanent", data.permanentMembers.length);
  setCount("count-executive", executives.length);
  setCount("count-attendees", data.symposiumAttendees.length);
  setCount("count-recognized", data.recognizedPeople.length);
  setCount(
    "count-all",
    data.permanentMembers.length +
      executives.length +
      data.symposiumAttendees.length +
      data.recognizedPeople.length,
  );

  function renderAttendees(): void {
    const list = data.symposiumAttendees.filter((a) => a.symposiumYear === selectedYear);
    attendeesGrid!.innerHTML = list.length
      ? list.map(renderAttendeeCard).join("")
      : `<p class="members-empty">No attendees listed for ${selectedYear}.</p>`;
  }

  function renderAll(): void {
    const previewPermanent = [...data.permanentMembers]
      .sort((a, b) => Number(Boolean(b.isFounder)) - Number(Boolean(a.isFounder)))
      .slice(0, 6);
    const previewAttendees = data.symposiumAttendees.filter((a) => a.symposiumYear === selectedYear).slice(0, 6);

    allStack!.innerHTML = `
      <section class="members-preview">
        <div class="members-preview__head">
          <h3>Permanent Members</h3>
          <button type="button" class="members-preview__link" data-goto="permanent">View all →</button>
        </div>
        <div class="people-grid">${previewPermanent.map(renderPermanentCard).join("")}</div>
      </section>
      <section class="members-preview">
        <div class="members-preview__head">
          <h3>Executive Members</h3>
          <button type="button" class="members-preview__link" data-goto="executive">View all →</button>
        </div>
        <div class="people-grid people-grid--executive">${executives.map(renderExecutiveCard).join("")}</div>
      </section>
      <section class="members-preview">
        <div class="members-preview__head">
          <h3>Symposium Attendees${years.length ? ` · ${selectedYear}` : ""}</h3>
          <button type="button" class="members-preview__link" data-goto="attendees">View all →</button>
        </div>
        <div class="people-grid">${
          previewAttendees.length
            ? previewAttendees.map(renderAttendeeCard).join("")
            : `<p class="members-empty">No attendees listed yet.</p>`
        }</div>
      </section>
      <section class="members-preview">
        <div class="members-preview__head">
          <h3>Recognised People</h3>
          <button type="button" class="members-preview__link" data-goto="recognized">View all →</button>
        </div>
        <div class="people-grid people-grid--recognized">${data.recognizedPeople.map(renderRecognizedCard).join("")}</div>
      </section>`;

    allStack!.querySelectorAll<HTMLButtonElement>("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => setTab(btn.dataset.goto as TabId));
    });
  }

  let currentPage = 1;
  let searchQuery = "";

  function getFiltered(): PermanentMember[] {
    const q = searchQuery.trim().toLowerCase();
    const sorted = [...data.permanentMembers].sort((a, b) => {
      if (a.isFounder && !b.isFounder) return -1;
      if (!a.isFounder && b.isFounder) return 1;
      return a.name.localeCompare(b.name);
    });
    if (!q) return sorted;
    return sorted.filter(
      (m) => m.name.toLowerCase().includes(q) || String(m.membershipNo).includes(q),
    );
  }

  function renderPermanent(): void {
    const filtered = getFiltered();
    const total = searchQuery ? filtered.length : Math.max(data.totalMembers, filtered.length);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    permanentGrid!.innerHTML = pageItems.map(renderPermanentCard).join("");

    if (resultsText) {
      const showingEnd = start + pageItems.length;
      const showingStart = pageItems.length ? start + 1 : 0;
      resultsText.textContent = `Showing ${showingStart} to ${showingEnd} of ${total} results`;
    }

    if (nextBtn) {
      const moreInList = start + PAGE_SIZE < filtered.length;
      nextBtn.disabled = !moreInList;
      nextBtn.hidden = !moreInList && currentPage === 1;
    }
  }

  function setTab(tab: TabId): void {
    navItems.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    (Object.keys(panels) as TabId[]).forEach((key) => {
      const panel = panels[key];
      if (panel) panel.hidden = key !== tab;
    });
    const url = new URL(window.location.href);
    if (tab === "all") url.searchParams.delete("tab");
    else url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }

  navItems.forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab as TabId));
  });

  const params = new URLSearchParams(window.location.search);
  const paramTab = params.get("tab");
  if (paramTab === "founders" || paramTab === "directory") {
    setTab("permanent");
  } else if (paramTab && VALID_TABS.includes(paramTab as TabId)) {
    setTab(paramTab as TabId);
  } else {
    setTab("all");
  }

  searchInput?.addEventListener("input", () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderPermanent();
  });

  nextBtn?.addEventListener("click", () => {
    currentPage += 1;
    renderPermanent();
  });

  yearSelect?.addEventListener("change", () => {
    selectedYear = Number(yearSelect.value) || selectedYear;
    renderAttendees();
    renderAll();
  });

  renderPermanent();
  renderAttendees();
  renderAll();
}

injectLayout("members");
initMobileMenu();
initNewsletterForm();
initMembersPage();
