import {
  loadContent,
  saveContent,
  resetContent,
  type SiteContent,
  type SymposiumEvent,
  type NewsItem,
  type FounderMember,
  type DirectoryMember,
} from "./data/store";

type SectionId =
  | "announcement"
  | "news"
  | "events-upcoming"
  | "events-past"
  | "events-student"
  | "members-directory"
  | "members-founders";

interface NavItem {
  id: SectionId;
  label: string;
  breadcrumb: string[];
}

interface FormField {
  key: string;
  label: string;
  multiline?: boolean;
  type?: "text" | "number";
}

const NAV: NavItem[] = [
  { id: "announcement", label: "Announcement", breadcrumb: ["Dashboard", "Home", "Announcement"] },
  { id: "news", label: "News", breadcrumb: ["Dashboard", "Home", "News"] },
  { id: "events-upcoming", label: "Upcoming Symposia", breadcrumb: ["Dashboard", "Events", "Upcoming"] },
  { id: "events-past", label: "Past Symposia", breadcrumb: ["Dashboard", "Events", "Past"] },
  { id: "events-student", label: "Student Symposia", breadcrumb: ["Dashboard", "Events", "Student"] },
  { id: "members-directory", label: "Directory", breadcrumb: ["Dashboard", "Members", "Directory"] },
  { id: "members-founders", label: "Founder Members", breadcrumb: ["Dashboard", "Members", "Founders"] },
];

const NAV_GROUPS: { label: string; items: SectionId[] }[] = [
  { label: "Home", items: ["announcement", "news"] },
  { label: "Events", items: ["events-upcoming", "events-past", "events-student"] },
  { label: "Members", items: ["members-directory", "members-founders"] },
];

const SYM_KEYS = {
  "events-upcoming": "upcomingSymposia" as const,
  "events-past": "pastSymposia" as const,
  "events-student": "pastStudentSymposia" as const,
};

let content = loadContent();
let activeSection: SectionId = "announcement";
let modalIndex: number | "new" | null = null;

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function listRow(title: string, meta: string, index: number, canReorder: boolean): string {
  const reorder = canReorder
    ? `<button type="button" data-move="up" data-index="${index}" aria-label="Move up">↑</button>
       <button type="button" data-move="down" data-index="${index}" aria-label="Move down">↓</button>`
    : "";
  return `
    <div class="dash-row" data-index="${index}">
      <div class="dash-row__info">
        <span class="dash-row__title">${esc(title) || "Untitled"}</span>
        <span class="dash-row__meta">${esc(meta)}</span>
      </div>
      <div class="dash-row__actions">
        ${reorder}
        <button type="button" class="dash-edit" data-edit="${index}">Edit</button>
        ${canReorder ? `<button type="button" class="dash-delete" data-delete="${index}">Delete</button>` : ""}
      </div>
    </div>`;
}

function renderAnnouncement(): string {
  const a = content.announcement;
  const preview = a.lead.slice(0, 80) + (a.lead.length > 80 ? "…" : "");
  return `
    <h2 class="dash-panel__title">Announcement</h2>
    <p class="dash-panel__desc">Home page banner and ticker text.</p>
    <div class="dash-list">
      ${listRow(a.dates || "Home announcement", preview || a.ticker, 0, false)}
    </div>`;
}

function renderNews(): string {
  const items = content.news
    .map((item, i) => listRow(item.title, `${item.tag} · ${item.date}`, i, true))
    .join("");
  return `
    <h2 class="dash-panel__title">News</h2>
    <p class="dash-panel__desc">Latest info cards on the home page.</p>
    <div class="dash-list">${items}</div>
    <button type="button" class="btn btn--primary dash-add" data-add>+ Add news item</button>`;
}

function renderSymposia(key: "upcomingSymposia" | "pastSymposia" | "pastStudentSymposia", title: string, desc: string): string {
  const items = content[key]
    .map((item, i) => listRow(item.title, `${item.dates} · ${item.venue}`, i, true))
    .join("");
  return `
    <h2 class="dash-panel__title">${title}</h2>
    <p class="dash-panel__desc">${desc}</p>
    <div class="dash-list">${items}</div>
    <button type="button" class="btn btn--primary dash-add" data-add>+ Add symposium</button>`;
}

function renderDirectory(): string {
  const items = content.directoryMembers
    .map((item, i) => listRow(item.name, `Membership No. ${item.membershipNo}`, i, true))
    .join("");
  return `
    <h2 class="dash-panel__title">Member Directory</h2>
    <p class="dash-panel__desc">Members listed on the members page.</p>
    <div class="dash-inline-field">
      <label for="total-members">Total members</label>
      <input type="number" id="total-members" value="${content.totalMembers}" />
    </div>
    <div class="dash-list">${items}</div>
    <button type="button" class="btn btn--primary dash-add" data-add>+ Add member</button>`;
}

function renderFounders(): string {
  const items = content.founderMembers
    .map((item, i) => listRow(item.name, `${item.title} · ${item.role}`, i, true))
    .join("");
  return `
    <h2 class="dash-panel__title">Founder Members</h2>
    <p class="dash-panel__desc">Founder members tab on the members page.</p>
    <div class="dash-list">${items}</div>
    <button type="button" class="btn btn--primary dash-add" data-add>+ Add founder</button>`;
}

function renderPanel(): void {
  const panel = document.getElementById("dashboard-panel");
  if (!panel) return;

  const map: Record<SectionId, () => string> = {
    announcement: renderAnnouncement,
    news: renderNews,
    "events-upcoming": () => renderSymposia("upcomingSymposia", "Upcoming Symposia", "Events page — upcoming tab."),
    "events-past": () => renderSymposia("pastSymposia", "Past Symposia", "Events page — past tab."),
    "events-student": () => renderSymposia("pastStudentSymposia", "Past Student Symposia", "Events page — student tab."),
    "members-directory": renderDirectory,
    "members-founders": renderFounders,
  };

  panel.innerHTML = map[activeSection]();
  bindPanelEvents();
}

function renderBreadcrumb(): void {
  const el = document.getElementById("breadcrumb");
  const item = NAV.find((n) => n.id === activeSection);
  if (!el || !item) return;
  el.innerHTML = item.breadcrumb
    .map((part, i) =>
      i < item.breadcrumb.length - 1
        ? `<span>${part}</span><span>/</span>`
        : `<strong>${part}</strong>`,
    )
    .join("");
}

function navLabel(id: SectionId): string {
  return NAV.find((n) => n.id === id)?.label ?? id;
}

function renderNav(): void {
  const nav = document.getElementById("dashboard-nav");
  if (!nav) return;

  nav.innerHTML = NAV_GROUPS.map((group) => {
    const items = group.items
      .map((id) => {
        const isChild = group.items.length > 1;
        const active = activeSection === id ? " is-active" : "";
        const childClass = isChild ? " dashboard-list__link--child" : "";
        return `<li><button type="button" class="dashboard-list__link${childClass}${active}" data-section="${id}">${navLabel(id)}</button></li>`;
      })
      .join("");
    return `
      <div class="dashboard-list__group">
        <p class="dashboard-list__label">${group.label}</p>
        <ul class="dashboard-list__items">${items}</ul>
      </div>`;
  }).join("");

  nav.querySelectorAll("[data-section]").forEach((btn) => {
    btn.addEventListener("click", () => {
      collectInlineFields();
      closeModal();
      activeSection = (btn as HTMLElement).dataset.section as SectionId;
      renderNav();
      renderBreadcrumb();
      renderPanel();
    });
  });
}

function collectInlineFields(): void {
  if (activeSection === "members-directory") {
    const totalEl = document.getElementById("total-members") as HTMLInputElement | null;
    if (totalEl) content.totalMembers = Number(totalEl.value) || 352;
  }
}

function getModalFields(): FormField[] {
  if (activeSection === "announcement") {
    return [
      { key: "lead", label: "Lead text", multiline: true },
      { key: "dates", label: "Dates" },
      { key: "venue", label: "Venue" },
      { key: "coordinator", label: "Coordinator" },
      { key: "cta", label: "Call to action text" },
      { key: "ctaUrl", label: "CTA link URL (optional)" },
      { key: "ticker", label: "Ticker text", multiline: true },
    ];
  }
  if (activeSection === "news") {
    return [
      { key: "image", label: "Image URL (optional)" },
      { key: "tag", label: "Tag" },
      { key: "date", label: "Date" },
      { key: "title", label: "Title" },
      { key: "excerpt", label: "Excerpt", multiline: true },
    ];
  }
  if (activeSection === "events-upcoming") {
    return [
      { key: "title", label: "Title" },
      { key: "dates", label: "Dates" },
      { key: "venue", label: "Venue" },
      { key: "coordinator", label: "Coordinator" },
      { key: "status", label: "Status" },
    ];
  }
  if (activeSection === "events-past" || activeSection === "events-student") {
    return [
      { key: "title", label: "Title" },
      { key: "dates", label: "Dates" },
      { key: "venue", label: "Venue" },
    ];
  }
  if (activeSection === "members-directory") {
    return [
      { key: "name", label: "Name" },
      { key: "membershipNo", label: "Membership No.", type: "number" },
    ];
  }
  if (activeSection === "members-founders") {
    return [
      { key: "name", label: "Name" },
      { key: "title", label: "Title" },
      { key: "role", label: "Role" },
    ];
  }
  return [];
}

function getModalData(index: number | "new"): Record<string, string> {
  if (activeSection === "announcement") {
    const a = content.announcement;
    return { lead: a.lead, dates: a.dates, venue: a.venue, coordinator: a.coordinator, cta: a.cta, ctaUrl: a.ctaUrl ?? "", ticker: a.ticker };
  }
  if (index === "new") {
    return Object.fromEntries(getModalFields().map((f) => [f.key, ""]));
  }

  const i = index as number;
  if (activeSection === "news") {
    const item = content.news[i];
    return { image: item.image ?? "", tag: item.tag, date: item.date, title: item.title, excerpt: item.excerpt };
  }
  const symKey = SYM_KEYS[activeSection as keyof typeof SYM_KEYS];
  if (symKey) {
    const item = content[symKey][i];
    return {
      title: item.title,
      dates: item.dates,
      venue: item.venue,
      coordinator: item.coordinator ?? "",
      status: item.status ?? "",
    };
  }
  if (activeSection === "members-directory") {
    const item = content.directoryMembers[i];
    return { name: item.name, membershipNo: String(item.membershipNo) };
  }
  if (activeSection === "members-founders") {
    const item = content.founderMembers[i];
    return { name: item.name, title: item.title, role: item.role };
  }
  return {};
}

function modalTitle(index: number | "new"): string {
  if (index === "new") {
    const labels: Partial<Record<SectionId, string>> = {
      news: "Add news item",
      "events-upcoming": "Add symposium",
      "events-past": "Add symposium",
      "events-student": "Add symposium",
      "members-directory": "Add member",
      "members-founders": "Add founder",
    };
    return labels[activeSection] ?? "Add item";
  }
  if (activeSection === "announcement") return "Edit announcement";
  const labels: Partial<Record<SectionId, string>> = {
    news: "Edit news item",
    "events-upcoming": "Edit symposium",
    "events-past": "Edit symposium",
    "events-student": "Edit symposium",
    "members-directory": "Edit member",
    "members-founders": "Edit founder",
  };
  return labels[activeSection] ?? "Edit item";
}

function fieldHtml(field: FormField, value: string): string {
  const input =
    field.multiline
      ? `<textarea name="${field.key}" rows="3">${esc(value)}</textarea>`
      : `<input type="${field.type ?? "text"}" name="${field.key}" value="${esc(value)}" />`;
  return `<div><label>${field.label}</label>${input}</div>`;
}

function openModal(index: number | "new"): void {
  modalIndex = index;
  const modal = document.getElementById("dash-modal");
  const titleEl = document.getElementById("dash-modal-title");
  const form = document.getElementById("dash-modal-form");
  if (!modal || !titleEl || !form) return;

  titleEl.textContent = modalTitle(index);
  const data = getModalData(index);
  form.innerHTML = getModalFields().map((f) => fieldHtml(f, data[f.key] ?? "")).join("");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  (form.querySelector("input, textarea") as HTMLElement | null)?.focus();
}

function closeModal(): void {
  modalIndex = null;
  const modal = document.getElementById("dash-modal");
  if (modal) modal.hidden = true;
  document.body.style.overflow = "";
}

function readModalForm(): Record<string, string> {
  const form = document.getElementById("dash-modal-form");
  if (!form) return {};
  const data: Record<string, string> = {};
  getModalFields().forEach((field) => {
    const el = form.querySelector(`[name="${field.key}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
    data[field.key] = el?.value ?? "";
  });
  return data;
}

function applyModalData(data: Record<string, string>): void {
  if (activeSection === "announcement") {
    content.announcement = {
      lead: data.lead ?? "",
      dates: data.dates ?? "",
      venue: data.venue ?? "",
      coordinator: data.coordinator ?? "",
      cta: data.cta ?? "",
      ctaUrl: data.ctaUrl ?? "",
      ticker: data.ticker ?? "",
    };
    return;
  }

  const saveNews = (): NewsItem => ({
    image: data.image ?? "",
    tag: data.tag ?? "",
    date: data.date ?? "",
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
  });

  const saveSymposium = (item: SymposiumEvent): SymposiumEvent => {
    const base: SymposiumEvent = {
      title: data.title ?? "",
      dates: data.dates ?? "",
      venue: data.venue ?? "",
    };
    if (activeSection === "events-upcoming") {
      base.coordinator = data.coordinator ?? "";
      base.status = data.status ?? "";
    }
    return base;
  };

  const saveDirectory = (): DirectoryMember => ({
    name: data.name ?? "",
    membershipNo: Number(data.membershipNo) || 0,
  });

  const saveFounder = (): FounderMember => ({
    name: data.name ?? "",
    title: data.title ?? "",
    role: data.role ?? "",
  });

  if (activeSection === "news") {
    const item = saveNews();
    if (modalIndex === "new") content.news.push(item);
    else content.news[modalIndex as number] = item;
    return;
  }

  const symKey = SYM_KEYS[activeSection as keyof typeof SYM_KEYS];
  if (symKey) {
    const item = saveSymposium({ title: "", dates: "", venue: "" });
    if (modalIndex === "new") content[symKey].push(item);
    else content[symKey][modalIndex as number] = item;
    return;
  }

  if (activeSection === "members-directory") {
    const item = saveDirectory();
    if (modalIndex === "new") content.directoryMembers.push(item);
    else content.directoryMembers[modalIndex as number] = item;
    return;
  }

  if (activeSection === "members-founders") {
    const item = saveFounder();
    if (modalIndex === "new") content.founderMembers.push(item);
    else content.founderMembers[modalIndex as number] = item;
  }
}

function moveItem<T>(arr: T[], index: number, dir: -1 | 1): void {
  const next = index + dir;
  if (next < 0 || next >= arr.length) return;
  [arr[index], arr[next]] = [arr[next], arr[index]];
}

function bindPanelEvents(): void {
  const panel = document.getElementById("dashboard-panel");
  if (!panel) return;

  panel.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      collectInlineFields();
      openModal(Number((btn as HTMLElement).dataset.edit));
    });
  });

  panel.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      collectInlineFields();
      openModal("new");
    });
  });

  panel.querySelectorAll("[data-move]").forEach((btn) => {
    btn.addEventListener("click", () => {
      collectInlineFields();
      const index = Number((btn as HTMLElement).dataset.index);
      const dir = (btn as HTMLElement).dataset.move === "up" ? -1 : 1;

      const lists: Partial<Record<SectionId, keyof SiteContent>> = {
        news: "news",
        "events-upcoming": "upcomingSymposia",
        "events-past": "pastSymposia",
        "events-student": "pastStudentSymposia",
        "members-directory": "directoryMembers",
        "members-founders": "founderMembers",
      };

      const key = lists[activeSection];
      if (key) moveItem(content[key] as unknown[], index, dir as -1 | 1);
      renderPanel();
    });
  });

  panel.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("Delete this item?")) return;
      collectInlineFields();
      const index = Number((btn as HTMLElement).dataset.delete);

      const deleteMap: Partial<Record<SectionId, () => void>> = {
        news: () => content.news.splice(index, 1),
        "events-upcoming": () => content.upcomingSymposia.splice(index, 1),
        "events-past": () => content.pastSymposia.splice(index, 1),
        "events-student": () => content.pastStudentSymposia.splice(index, 1),
        "members-directory": () => content.directoryMembers.splice(index, 1),
        "members-founders": () => content.founderMembers.splice(index, 1),
      };

      deleteMap[activeSection]?.();
      renderPanel();
    });
  });
}

function bindModalEvents(): void {
  document.getElementById("dash-modal-save")?.addEventListener("click", () => {
    applyModalData(readModalForm());
    closeModal();
    renderPanel();
  });

  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalIndex !== null) closeModal();
  });
}

function showStatus(msg: string, isError = false): void {
  const el = document.getElementById("save-status");
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle("is-error", isError);
  setTimeout(() => {
    el.textContent = "";
  }, 3000);
}

document.getElementById("btn-save")?.addEventListener("click", () => {
  collectInlineFields();
  saveContent(content);
  showStatus("Changes saved successfully.");
});

document.getElementById("btn-reset")?.addEventListener("click", () => {
  if (!confirm("Reset all content to defaults? This cannot be undone.")) return;
  content = resetContent();
  closeModal();
  renderPanel();
  showStatus("Content reset to defaults.");
});

bindModalEvents();
renderNav();
renderBreadcrumb();
renderPanel();
