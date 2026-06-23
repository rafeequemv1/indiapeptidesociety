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
  type?: "text" | "number" | "date" | "month" | "url" | "checkbox";
  hint?: string;
  group?: string;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateRange(dates: string): { start: string; end: string } {
  if (!dates.trim()) return { start: "", end: "" };
  if (/^\d{4}-\d{2}-\d{2}/.test(dates)) {
    const parts = dates.split(/\s*[–—-]\s*/);
    const start = parts[0]?.trim() ?? "";
    const end = parts[1]?.trim() || start;
    return { start, end };
  }
  const range = dates.match(/(\w+)\s+(\d{1,2})(?:[–—-](\d{1,2}))?,?\s*(\d{4})/);
  if (range) {
    const start = new Date(`${range[1]} ${range[2]}, ${range[4]}`);
    const endDay = range[3] ?? range[2];
    const end = new Date(`${range[1]} ${endDay}, ${range[4]}`);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return { start: toIsoDate(start), end: toIsoDate(end) };
    }
  }
  const single = new Date(dates);
  if (!isNaN(single.getTime())) {
    const iso = toIsoDate(single);
    return { start: iso, end: iso };
  }
  if (/^\d{4}$/.test(dates.trim())) {
    return { start: `${dates.trim()}-01-01`, end: `${dates.trim()}-12-31` };
  }
  return { start: "", end: "" };
}

function formatDateRange(start: string, end: string): string {
  if (!start) return "";
  const s = new Date(`${start}T12:00:00`);
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString("en-US", opts);
  if (!end || end === start) {
    return fmt(s, { month: "long", day: "numeric", year: "numeric" });
  }
  const e = new Date(`${end}T12:00:00`);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${fmt(s, { month: "long" })} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
  }
  return `${fmt(s, { month: "long", day: "numeric", year: "numeric" })} – ${fmt(e, { month: "long", day: "numeric", year: "numeric" })}`;
}

function parseNewsMonth(display: string): string {
  if (!display.trim()) return "";
  if (/^\d{4}-\d{2}$/.test(display)) return display;
  if (display.toLowerCase() === "latest") return "";
  const parsed = new Date(display);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
  }
  const m = display.match(/(\w+)\s*(\d{4})/);
  if (m) {
    const d = new Date(`${m[1]} 1, ${m[2]}`);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }
  }
  if (/^\d{4}$/.test(display.trim())) return `${display.trim()}-01`;
  return "";
}

function formatNewsMonth(monthIso: string): string {
  if (!monthIso) return "";
  const [y, m] = monthIso.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  if (isNaN(d.getTime())) return monthIso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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

const EDIT_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

function panelHead(title: string, desc: string, addLabel?: string): string {
  const addBtn = addLabel
    ? `<button type="button" class="btn btn--primary btn--sm dash-add" data-add>${addLabel}</button>`
    : "";
  return `
    <div class="dash-panel__head">
      <div class="dash-panel__intro">
        <h2 class="dash-panel__title">${title}</h2>
        <p class="dash-panel__desc">${desc}</p>
      </div>
      ${addBtn}
    </div>`;
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
        <button type="button" class="dash-edit" data-edit="${index}">${EDIT_ICON}<span>Edit</span></button>
        ${canReorder ? `<button type="button" class="dash-delete" data-delete="${index}">Delete</button>` : ""}
      </div>
    </div>`;
}

function renderAnnouncement(): string {
  const a = content.announcement;
  const preview = a.lead.slice(0, 80) + (a.lead.length > 80 ? "…" : "");
  return `
    ${panelHead("Announcement", "Home page banner and ticker text.")}
    <div class="dash-list">
      ${listRow(a.dates || "Home announcement", preview || a.ticker, 0, false)}
    </div>`;
}

function renderNews(): string {
  const items = content.news
    .map((item, i) => listRow(item.title, `${item.tag} · ${item.date}`, i, true))
    .join("");
  return `
    ${panelHead("News", "Latest info cards on the home page.", "+ Add news")}
    <div class="dash-list">${items}</div>`;
}

function renderSymposia(key: "upcomingSymposia" | "pastSymposia" | "pastStudentSymposia", title: string, desc: string): string {
  const items = content[key]
    .map((item, i) => listRow(item.title, `${item.dates} · ${item.venue}`, i, true))
    .join("");
  return `
    ${panelHead(title, desc, "+ Add symposium")}
    <div class="dash-list">${items}</div>`;
}

function renderDirectory(): string {
  const items = content.directoryMembers
    .map((item, i) => listRow(item.name, `Membership No. ${item.membershipNo}`, i, true))
    .join("");
  return `
    ${panelHead("Member Directory", "Members listed on the members page.", "+ Add member")}
    <div class="dash-inline-field">
      <label for="total-members">Total members</label>
      <input type="number" id="total-members" value="${content.totalMembers}" />
    </div>
    <div class="dash-list">${items}</div>`;
}

function renderFounders(): string {
  const items = content.founderMembers
    .map((item, i) => listRow(item.name, `${item.title} · ${item.role}`, i, true))
    .join("");
  return `
    ${panelHead("Founder Members", "Founder members tab on the members page.", "+ Add founder")}
    <div class="dash-list">${items}</div>`;
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
      { key: "dateStart", label: "Start date", type: "date" },
      { key: "dateEnd", label: "End date", type: "date" },
      { key: "venue", label: "Venue" },
      { key: "coordinator", label: "Coordinator" },
      { key: "showCtaButton", label: "Show CTA button on home page", type: "checkbox", group: "cta" },
      { key: "cta", label: "Button label", group: "cta", hint: "Shown when CTA button is enabled" },
      { key: "ctaUrl", label: "Button URL", type: "url", group: "cta", hint: "e.g. /events.html or https://…" },
      { key: "ticker", label: "Ticker text", multiline: true },
    ];
  }
  if (activeSection === "news") {
    return [
      { key: "image", label: "Image URL (optional)" },
      { key: "tag", label: "Tag" },
      { key: "date", label: "Date", type: "month" },
      { key: "title", label: "Title" },
      { key: "excerpt", label: "Excerpt", multiline: true },
    ];
  }
  if (activeSection === "events-upcoming") {
    return [
      { key: "title", label: "Title" },
      { key: "dateStart", label: "Start date", type: "date" },
      { key: "dateEnd", label: "End date", type: "date" },
      { key: "venue", label: "Venue" },
      { key: "coordinator", label: "Coordinator" },
      { key: "status", label: "Status" },
    ];
  }
  if (activeSection === "events-past" || activeSection === "events-student") {
    return [
      { key: "title", label: "Title" },
      { key: "dateStart", label: "Start date", type: "date" },
      { key: "dateEnd", label: "End date", type: "date" },
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
    const { start, end } = parseDateRange(a.dates);
    return {
      lead: a.lead,
      dateStart: start,
      dateEnd: end,
      venue: a.venue,
      coordinator: a.coordinator,
      showCtaButton: a.showCtaButton ? "true" : "false",
      cta: a.cta,
      ctaUrl: a.ctaUrl ?? "",
      ticker: a.ticker,
    };
  }
  if (index === "new") {
    return Object.fromEntries(getModalFields().map((f) => [f.key, f.type === "checkbox" ? "false" : ""]));
  }

  const i = index as number;
  if (activeSection === "news") {
    const item = content.news[i];
    return {
      image: item.image ?? "",
      tag: item.tag,
      date: parseNewsMonth(item.date),
      title: item.title,
      excerpt: item.excerpt,
    };
  }
  const symKey = SYM_KEYS[activeSection as keyof typeof SYM_KEYS];
  if (symKey) {
    const item = content[symKey][i];
    const { start, end } = parseDateRange(item.dates);
    return {
      title: item.title,
      dateStart: start,
      dateEnd: end,
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
  if (field.type === "checkbox") {
    const checked = value === "true" ? " checked" : "";
    return `<div class="dash-field dash-field--checkbox" data-group="${field.group ?? ""}"><label class="dash-checkbox"><input type="checkbox" name="${field.key}"${checked} /><span>${field.label}</span></label></div>`;
  }

  const hint = field.hint ? `<p class="dash-field__hint">${field.hint}</p>` : "";
  const inputType = field.type ?? "text";
  const input = field.multiline
    ? `<textarea name="${field.key}" rows="3">${esc(value)}</textarea>`
    : `<input type="${inputType}" name="${field.key}" value="${esc(value)}" />`;

  return `<div class="dash-field" data-group="${field.group ?? ""}"><label>${field.label}</label>${input}${hint}</div>`;
}

function bindFormEnhancements(): void {
  const form = document.getElementById("dash-modal-form");
  if (!form) return;

  const toggleCtaFields = (): void => {
    const enabled = (form.querySelector('[name="showCtaButton"]') as HTMLInputElement | null)?.checked;
    form.querySelectorAll('[data-group="cta"]').forEach((el) => {
      if ((el as HTMLElement).querySelector('[name="showCtaButton"]')) return;
      (el as HTMLElement).hidden = !enabled;
    });
  };

  form.querySelector('[name="showCtaButton"]')?.addEventListener("change", toggleCtaFields);
  toggleCtaFields();
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
  bindFormEnhancements();
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
    if (field.type === "checkbox") {
      const el = form.querySelector(`[name="${field.key}"]`) as HTMLInputElement | null;
      data[field.key] = el?.checked ? "true" : "false";
      return;
    }
    const el = form.querySelector(`[name="${field.key}"]`) as HTMLInputElement | HTMLTextAreaElement | null;
    data[field.key] = el?.value ?? "";
  });
  return data;
}

function applyModalData(data: Record<string, string>): void {
  if (activeSection === "announcement") {
    content.announcement = {
      lead: data.lead ?? "",
      dates: formatDateRange(data.dateStart ?? "", data.dateEnd ?? ""),
      venue: data.venue ?? "",
      coordinator: data.coordinator ?? "",
      showCtaButton: data.showCtaButton === "true",
      cta: data.cta ?? "",
      ctaUrl: data.ctaUrl ?? "",
      ticker: data.ticker ?? "",
    };
    return;
  }

  const saveNews = (): NewsItem => ({
    image: data.image ?? "",
    tag: data.tag ?? "",
    date: formatNewsMonth(data.date ?? "") || data.date || "",
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
  });

  const saveSymposium = (): SymposiumEvent => {
    const base: SymposiumEvent = {
      title: data.title ?? "",
      dates: formatDateRange(data.dateStart ?? "", data.dateEnd ?? ""),
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
    const item = saveSymposium();
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
