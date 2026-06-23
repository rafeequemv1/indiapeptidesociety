import { loadContent, PAGE_SIZE, type DirectoryMember, type FounderMember } from "./data/store";
import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

type TabId = "directory" | "founders";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function renderFounderCard(member: FounderMember): string {
  return `
    <article class="people-card people-card--founder">
      <div class="people-card__avatar" aria-hidden="true">${getInitials(member.name)}</div>
      <div class="people-card__body">
        <span class="people-card__badge">Member</span>
        <h3 class="people-card__name">${member.name}</h3>
        <p class="people-card__title">${member.title}</p>
        <p class="people-card__role">${member.role}</p>
      </div>
    </article>`;
}

function renderDirectoryCard(member: DirectoryMember): string {
  return `
    <article class="people-card">
      <div class="people-card__avatar" aria-hidden="true">${getInitials(member.name)}</div>
      <div class="people-card__body">
        <span class="people-card__badge">Member</span>
        <h3 class="people-card__name">${member.name}</h3>
        <p class="people-card__meta">Membership No. ${member.membershipNo}</p>
      </div>
    </article>`;
}

function initMembersPage(): void {
  const data = loadContent();
  const tabs = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const directoryPanel = document.getElementById("panel-directory");
  const foundersPanel = document.getElementById("panel-founders");
  const foundersGrid = document.getElementById("founders-grid");
  const directoryGrid = document.getElementById("directory-grid");
  const searchInput = document.getElementById("member-search") as HTMLInputElement | null;
  const resultsText = document.getElementById("results-text");
  const nextBtn = document.getElementById("next-page") as HTMLButtonElement | null;

  if (!directoryPanel || !foundersPanel || !foundersGrid || !directoryGrid) return;

  const dirPanel = directoryPanel;
  const foundPanel = foundersPanel;
  const foundersEl = foundersGrid;
  const directoryEl = directoryGrid;

  foundersEl.innerHTML = data.founderMembers.map(renderFounderCard).join("");

  let currentPage = 1;
  let searchQuery = "";

  function getFiltered(): DirectoryMember[] {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data.directoryMembers;
    return data.directoryMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        String(m.membershipNo).includes(q),
    );
  }

  function renderDirectory(): void {
    const filtered = getFiltered();
    const total = searchQuery ? filtered.length : data.totalMembers;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = searchQuery
      ? filtered.slice(start, start + PAGE_SIZE)
      : filtered;

    directoryEl.innerHTML = pageItems.map(renderDirectoryCard).join("");

    if (resultsText) {
      const showingEnd = Math.min(start + pageItems.length, total);
      const showingStart = pageItems.length ? start + 1 : 0;
      resultsText.textContent = `Showing ${showingStart} to ${showingEnd} of ${total} results`;
    }

    if (nextBtn) {
      const hasMore = start + PAGE_SIZE < total;
      nextBtn.disabled = !hasMore;
      nextBtn.hidden = !hasMore && currentPage === 1;
    }
  }

  function setTab(tab: TabId): void {
    tabs.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    dirPanel.hidden = tab !== "directory";
    foundPanel.hidden = tab !== "founders";
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTab(btn.dataset.tab as TabId);
    });
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("tab") === "founders") {
    setTab("founders");
  } else {
    setTab("directory");
  }

  searchInput?.addEventListener("input", () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    renderDirectory();
  });

  nextBtn?.addEventListener("click", () => {
    currentPage += 1;
    renderDirectory();
  });

  renderDirectory();
}

injectLayout("members");
initMobileMenu();
initNewsletterForm();
initMembersPage();
