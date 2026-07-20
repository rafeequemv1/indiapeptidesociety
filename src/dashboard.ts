import {
  loadContent,
  saveContent,
  resetContent,
  type SiteContent,
  type SymposiumEvent,
  type NewsItem,
  type PermanentMember,
  type SymposiumAttendee,
  type RecognizedPerson,
  type BlogPost,
  type TeamMember,
} from "./data/store";

type SectionId =
  | "announcement"
  | "news"
  | "reg-settings"
  | "reg-entries"
  | "events-upcoming"
  | "events-past"
  | "events-student"
  | "members-permanent"
  | "members-executive"
  | "members-attendees"
  | "members-recognized"
  | "blog"
  | "inbox-contact";

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

function formatSubmittedAt(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const NAV: NavItem[] = [
  { id: "announcement", label: "Announcement", breadcrumb: ["Dashboard", "Home", "Announcement"] },
  { id: "news", label: "News", breadcrumb: ["Dashboard", "Home", "News"] },
  { id: "reg-settings", label: "Registration Settings", breadcrumb: ["Dashboard", "Registration", "Settings"] },
  { id: "reg-entries", label: "Registrations", breadcrumb: ["Dashboard", "Registration", "Entries"] },
  { id: "events-upcoming", label: "Upcoming Symposia", breadcrumb: ["Dashboard", "Events", "Upcoming"] },
  { id: "events-past", label: "Past Symposia", breadcrumb: ["Dashboard", "Events", "Past"] },
  { id: "events-student", label: "Student Symposia", breadcrumb: ["Dashboard", "Events", "Student"] },
  { id: "members-permanent", label: "Permanent Members", breadcrumb: ["Dashboard", "Members", "Permanent"] },
  { id: "members-executive", label: "Executive Members", breadcrumb: ["Dashboard", "Members", "Executive"] },
  { id: "members-attendees", label: "Symposium Attendees", breadcrumb: ["Dashboard", "Members", "Attendees"] },
  { id: "members-recognized", label: "Recognised People", breadcrumb: ["Dashboard", "Members", "Recognised"] },
  { id: "blog", label: "Blog Posts", breadcrumb: ["Dashboard", "Blog", "Posts"] },
  { id: "inbox-contact", label: "Contact Messages", breadcrumb: ["Dashboard", "Inbox", "Contact"] },
];

const NAV_GROUPS: { label: string; items: SectionId[] }[] = [
  { label: "Home", items: ["announcement", "news"] },
  { label: "Registration", items: ["reg-settings", "reg-entries"] },
  { label: "Events", items: ["events-upcoming", "events-past", "events-student"] },
  { label: "Members", items: ["members-permanent", "members-executive", "members-attendees", "members-recognized"] },
  { label: "Blog", items: ["blog"] },
  { label: "Inbox", items: ["inbox-contact"] },
];

const SYM_KEYS = {
  "events-upcoming": "upcomingSymposia" as const,
  "events-past": "pastSymposia" as const,
  "events-student": "pastStudentSymposia" as const,
};

let content = loadContent();
let activeSection: SectionId = "announcement";
let modalIndex: number | "new" | null = null;

function getExecutives(): TeamMember[] {
  return content.team.filter((m) => m.section === "executive");
}

function setExecutives(executives: TeamMember[]): void {
  const advisors = content.team.filter((m) => m.section === "advisors");
  content.team = [...executives, ...advisors];
}

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

function listRow(
  title: string,
  meta: string,
  index: number,
  canReorder: boolean,
  opts?: { editLabel?: string; canDelete?: boolean },
): string {
  const reorder = canReorder
    ? `<button type="button" data-move="up" data-index="${index}" aria-label="Move up">↑</button>
       <button type="button" data-move="down" data-index="${index}" aria-label="Move down">↓</button>`
    : "";
  const editLabel = opts?.editLabel ?? "Edit";
  const canDelete = opts?.canDelete ?? canReorder;
  return `
    <div class="dash-row" data-index="${index}">
      <div class="dash-row__info">
        <span class="dash-row__title">${esc(title) || "Untitled"}</span>
        <span class="dash-row__meta">${esc(meta)}</span>
      </div>
      <div class="dash-row__actions">
        ${reorder}
        <button type="button" class="dash-edit" data-edit="${index}">${EDIT_ICON}<span>${editLabel}</span></button>
        ${canDelete ? `<button type="button" class="dash-delete" data-delete="${index}">Delete</button>` : ""}
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

function renderPermanent(): string {
  const items = content.permanentMembers
    .map((item, i) =>
      listRow(
        item.name,
        `No. ${item.membershipNo}${item.isFounder ? " · Founder" : ""}`,
        i,
        true,
      ),
    )
    .join("");
  return `
    ${panelHead("Permanent Members", "Permanent members tab — founders show a Founder badge.", "+ Add member")}
    <div class="dash-inline-field">
      <label for="total-members">Total members</label>
      <input type="number" id="total-members" value="${content.totalMembers}" />
    </div>
    <div class="dash-list">${items}</div>`;
}

function renderExecutive(): string {
  const items = getExecutives()
    .map((item, i) => listRow(item.name, `${item.role} · ${item.affiliation}`, i, true))
    .join("");
  return `
    ${panelHead("Executive Members", "Office bearers on the members page and home team section.", "+ Add executive")}
    <div class="dash-list">${items}</div>`;
}

function renderAttendees(): string {
  const items = content.symposiumAttendees
    .map((item, i) =>
      listRow(
        item.name,
        `${item.symposiumYear}${item.affiliation ? ` · ${item.affiliation}` : ""}`,
        i,
        true,
      ),
    )
    .join("");
  return `
    ${panelHead("Symposium Attendees", "One symposium per year — filterable by year on the members page.", "+ Add attendee")}
    <div class="dash-list">${items}</div>`;
}

function renderRecognized(): string {
  const items = content.recognizedPeople
    .map((item, i) =>
      listRow(item.name, `${item.honor}${item.year ? ` · ${item.year}` : ""}`, i, true),
    )
    .join("");
  return `
    ${panelHead("Recognised People", "Lifetime Achievement and Young Scientist honorees.", "+ Add person")}
    <div class="dash-list">${items}</div>`;
}

function renderBlog(): string {
  const items = content.blogPosts
    .map((item, i) => listRow(item.title, `${item.tag} · ${item.date} · ${item.slug}`, i, true))
    .join("");
  return `
    ${panelHead("Blog Posts", "Medium-style articles on the blog page. Body supports HTML (p, h2, h3).", "+ Add post")}
    <div class="dash-list">${items}</div>`;
}

function renderRegSettings(): string {
  const r = content.symposiumRegistration;
  const status = r.enabled ? "Visible on home" : "Hidden";
  const pay = r.razorpayUrl ? "Razorpay link set" : "Razorpay link not set yet";
  return `
    ${panelHead("Registration Settings", "Home page symposium registration section. Add Razorpay payment URL when ready.")}
    <div class="dash-list">
      ${listRow(r.title || "Symposium Registration", `${status} · ${pay} · ${r.dates}`, 0, false)}
    </div>`;
}

let regFilter: "all" | "abstracts" | "no-abstract" = "all";

function renderRegEntries(): string {
  const all = content.symposiumRegistrations;
  const withAbstract = all.filter((r) => r.hasAbstract || Boolean(r.abstractFileName));
  const filtered =
    regFilter === "abstracts"
      ? withAbstract
      : regFilter === "no-abstract"
        ? all.filter((r) => !(r.hasAbstract || r.abstractFileName))
        : all;

  const rows = filtered.length
    ? filtered
        .map((item) => {
          const i = all.indexOf(item);
          const pay = (item.paymentStatus ?? "pending").toUpperCase();
          const abs = item.hasAbstract || item.abstractFileName ? " · Abstract" : "";
          return listRow(
            item.name,
            `${pay}${abs} · ${item.category} · ${item.email} · ${formatSubmittedAt(item.submittedAt)}`,
            i,
            false,
            { editLabel: "View", canDelete: true },
          );
        })
        .join("")
    : `<p class="dash-empty">No registrations in this filter.</p>`;

  return `
    ${panelHead("Registrations", `Form submissions (${all.length}). ${withAbstract.length} with abstract. Filter below; download receipts from View.`)}
    <div class="dash-filter-bar" role="group" aria-label="Filter registrations">
      <button type="button" class="dash-filter${regFilter === "all" ? " is-active" : ""}" data-reg-filter="all">All (${all.length})</button>
      <button type="button" class="dash-filter${regFilter === "abstracts" ? " is-active" : ""}" data-reg-filter="abstracts">With abstract (${withAbstract.length})</button>
      <button type="button" class="dash-filter${regFilter === "no-abstract" ? " is-active" : ""}" data-reg-filter="no-abstract">No abstract (${all.length - withAbstract.length})</button>
    </div>
    <div class="dash-list">${rows}</div>`;
}

function renderContactInbox(): string {
  const items = content.contactMessages;
  const rows = items.length
    ? items
        .map((item, i) =>
          listRow(
            item.name,
            `${item.email} · ${formatSubmittedAt(item.submittedAt)}`,
            i,
            false,
            { editLabel: "View", canDelete: true },
          ),
        )
        .join("")
    : `<p class="dash-empty">No contact messages yet.</p>`;
  return `
    ${panelHead("Contact Messages", `Submissions from the Contact Us form (${items.length}).`)}
    <div class="dash-list">${rows}</div>`;
}

function renderPanel(): void {
  const panel = document.getElementById("dashboard-panel");
  if (!panel) return;

  const map: Record<SectionId, () => string> = {
    announcement: renderAnnouncement,
    news: renderNews,
    "reg-settings": renderRegSettings,
    "reg-entries": renderRegEntries,
    "events-upcoming": () => renderSymposia("upcomingSymposia", "Upcoming Symposia", "Events page — upcoming tab."),
    "events-past": () => renderSymposia("pastSymposia", "Past Symposia", "Events page — past tab."),
    "events-student": () => renderSymposia("pastStudentSymposia", "Past Student Symposia", "Events page — student tab."),
    "members-permanent": renderPermanent,
    "members-executive": renderExecutive,
    "members-attendees": renderAttendees,
    "members-recognized": renderRecognized,
    blog: renderBlog,
    "inbox-contact": renderContactInbox,
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
  if (activeSection === "members-permanent") {
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
  if (activeSection === "members-permanent") {
    return [
      { key: "name", label: "Name" },
      { key: "membershipNo", label: "Membership No.", type: "number" },
      { key: "isFounder", label: "Founder member (shows Founder badge)", type: "checkbox" },
    ];
  }
  if (activeSection === "members-executive") {
    return [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "affiliation", label: "Affiliation" },
      { key: "image", label: "Image URL (optional)" },
    ];
  }
  if (activeSection === "members-attendees") {
    return [
      { key: "name", label: "Name" },
      { key: "affiliation", label: "Affiliation" },
      { key: "symposiumYear", label: "Symposium year", type: "number" },
      { key: "symposiumTitle", label: "Symposium title" },
    ];
  }
  if (activeSection === "members-recognized") {
    return [
      { key: "name", label: "Name" },
      { key: "honor", label: "Honor / award" },
      { key: "year", label: "Year" },
      { key: "affiliation", label: "Affiliation" },
    ];
  }
  if (activeSection === "blog") {
    return [
      { key: "title", label: "Title" },
      { key: "slug", label: "Slug", hint: "URL id, e.g. welcome-to-the-ips-blog" },
      { key: "tag", label: "Tag" },
      { key: "date", label: "Date", type: "month" },
      { key: "excerpt", label: "Excerpt", multiline: true },
      { key: "coverImage", label: "Cover image URL (optional)" },
      { key: "body", label: "Body (HTML: p, h2, h3)", multiline: true },
    ];
  }
  if (activeSection === "reg-settings") {
    return [
      { key: "enabled", label: "Show registration section on home page", type: "checkbox" },
      { key: "title", label: "Section title" },
      { key: "subtitle", label: "Subtitle", multiline: true },
      { key: "dates", label: "Dates" },
      { key: "venue", label: "Venue" },
      { key: "feeNote", label: "Fee / payment note", multiline: true },
      {
        key: "razorpayUrl",
        label: "Razorpay payment URL",
        type: "url",
        hint: "Paste the Razorpay payment link here when ready. After form submit, users open this link.",
      },
      { key: "ctaLabel", label: "Button label" },
    ];
  }
  if (activeSection === "reg-entries") {
    return [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "affiliation", label: "Affiliation" },
      { key: "category", label: "Category" },
      { key: "paymentStatus", label: "Payment status" },
      { key: "receiptNo", label: "Receipt No." },
      { key: "razorpayPaymentId", label: "Razorpay Payment ID" },
      { key: "abstractTitle", label: "Abstract title" },
      { key: "abstractFileName", label: "Abstract file" },
      { key: "abstractStoragePath", label: "Storage path (Supabase)" },
      { key: "submittedAt", label: "Submitted" },
    ];
  }
  if (activeSection === "inbox-contact") {
    return [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "message", label: "Message", multiline: true },
      { key: "submittedAt", label: "Submitted" },
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
  if (activeSection === "members-permanent") {
    const item = content.permanentMembers[i];
    return {
      name: item.name,
      membershipNo: String(item.membershipNo),
      isFounder: item.isFounder ? "true" : "false",
    };
  }
  if (activeSection === "members-executive") {
    const item = getExecutives()[i];
    return {
      name: item.name,
      role: item.role,
      affiliation: item.affiliation,
      image: item.image ?? "",
    };
  }
  if (activeSection === "members-attendees") {
    const item = content.symposiumAttendees[i];
    return {
      name: item.name,
      affiliation: item.affiliation ?? "",
      symposiumYear: String(item.symposiumYear),
      symposiumTitle: item.symposiumTitle ?? "",
    };
  }
  if (activeSection === "members-recognized") {
    const item = content.recognizedPeople[i];
    return {
      name: item.name,
      honor: item.honor,
      year: item.year ?? "",
      affiliation: item.affiliation ?? "",
    };
  }
  if (activeSection === "blog") {
    const item = content.blogPosts[i];
    return {
      title: item.title,
      slug: item.slug,
      tag: item.tag,
      date: parseNewsMonth(item.date),
      excerpt: item.excerpt,
      coverImage: item.coverImage ?? "",
      body: item.body,
    };
  }
  if (activeSection === "reg-settings") {
    const r = content.symposiumRegistration;
    return {
      enabled: r.enabled ? "true" : "false",
      title: r.title,
      subtitle: r.subtitle,
      dates: r.dates,
      venue: r.venue,
      feeNote: r.feeNote,
      razorpayUrl: r.razorpayUrl,
      ctaLabel: r.ctaLabel,
    };
  }
  if (activeSection === "reg-entries") {
    const item = content.symposiumRegistrations[i];
    return {
      name: item.name,
      email: item.email,
      phone: item.phone,
      affiliation: item.affiliation,
      category: item.category,
      paymentStatus: item.paymentStatus ?? "pending",
      receiptNo: item.receiptNo ?? "",
      razorpayPaymentId: item.razorpayPaymentId ?? "",
      abstractTitle: item.abstractTitle ?? "—",
      abstractFileName: item.abstractFileName ?? "—",
      abstractStoragePath: item.abstractStoragePath ?? "—",
      submittedAt: formatSubmittedAt(item.submittedAt),
    };
  }
  if (activeSection === "inbox-contact") {
    const item = content.contactMessages[i];
    return {
      name: item.name,
      email: item.email,
      phone: item.phone,
      message: item.message,
      submittedAt: formatSubmittedAt(item.submittedAt),
    };
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
      "members-permanent": "Add permanent member",
      "members-executive": "Add executive",
      "members-attendees": "Add attendee",
      "members-recognized": "Add recognised person",
      blog: "Add blog post",
    };
    return labels[activeSection] ?? "Add item";
  }
  if (activeSection === "announcement") return "Edit announcement";
  if (activeSection === "reg-settings") return "Edit registration settings";
  if (activeSection === "reg-entries") return "View registration";
  if (activeSection === "inbox-contact") return "View contact message";
  const labels: Partial<Record<SectionId, string>> = {
    news: "Edit news item",
    "events-upcoming": "Edit symposium",
    "events-past": "Edit symposium",
    "events-student": "Edit symposium",
    "members-permanent": "Edit permanent member",
    "members-executive": "Edit executive",
    "members-attendees": "Edit attendee",
    "members-recognized": "Edit recognised person",
    blog: "Edit blog post",
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
  const rows = field.key === "body" ? 12 : 3;
  const input = field.multiline
    ? `<textarea name="${field.key}" rows="${rows}">${esc(value)}</textarea>`
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
  const saveBtn = document.getElementById("dash-modal-save");
  if (!modal || !titleEl || !form) return;

  titleEl.textContent = modalTitle(index);
  const data = getModalData(index);
  const readOnly = activeSection === "inbox-contact" || activeSection === "reg-entries";
  form.innerHTML = getModalFields().map((f) => fieldHtml(f, data[f.key] ?? "")).join("");
  if (readOnly) {
    form.querySelectorAll("input, textarea, select").forEach((el) => {
      (el as HTMLInputElement).readOnly = true;
      (el as HTMLInputElement).disabled = true;
    });
  }
  if (activeSection === "reg-entries" && typeof index === "number") {
    const item = content.symposiumRegistrations[index];
    const paid = item.paymentStatus === "paid";
    const hasAbs = Boolean(item.hasAbstract || item.abstractFileName);
    form.insertAdjacentHTML(
      "beforeend",
      `<div class="dash-field dash-reg-actions">
        <button type="button" class="btn btn--outline btn--sm" id="dash-receipt-download">Download receipt</button>
        ${
          hasAbs && item.abstractDataUrl
            ? `<a class="btn btn--outline btn--sm" id="dash-abstract-download" href="${esc(item.abstractDataUrl)}" download="${esc(item.abstractFileName || "abstract.pdf")}">Download abstract</a>`
            : hasAbs
              ? `<p class="dash-field__hint">Abstract on file: ${esc(item.abstractFileName || "yes")} (Supabase path: ${esc(item.abstractStoragePath || "—")})</p>`
              : ""
        }
        ${
          paid
            ? ""
            : `<button type="button" class="btn btn--primary btn--sm" id="dash-mark-paid">Mark as paid (manual)</button>`
        }
        <p class="dash-field__hint">Manual mark is temporary until Razorpay webhook is connected.</p>
      </div>`,
    );
    document.getElementById("dash-receipt-download")?.addEventListener("click", async () => {
      const { downloadReceipt } = await import("./lib/receipt");
      const reg = content.symposiumRegistrations[index];
      const cfg = content.symposiumRegistration;
      downloadReceipt({
        registration: reg,
        event: { title: cfg.title, dates: cfg.dates, venue: cfg.venue },
      });
    });
    document.getElementById("dash-mark-paid")?.addEventListener("click", () => {
      content.symposiumRegistrations[index] = {
        ...content.symposiumRegistrations[index],
        paymentStatus: "paid",
        razorpayPaymentId:
          content.symposiumRegistrations[index].razorpayPaymentId || `manual_${Date.now()}`,
      };
      saveContent(content);
      closeModal();
      renderPanel();
      showStatus("Marked as paid. Receipt will show PAID.");
    });
  }
  if (saveBtn) {
    saveBtn.hidden = readOnly;
    saveBtn.textContent = "Save";
  }
  bindFormEnhancements();
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  if (!readOnly) {
    (form.querySelector("input, textarea") as HTMLElement | null)?.focus();
  }
}

function closeModal(): void {
  modalIndex = null;
  const modal = document.getElementById("dash-modal");
  const saveBtn = document.getElementById("dash-modal-save");
  if (modal) modal.hidden = true;
  if (saveBtn) saveBtn.hidden = false;
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
  if (activeSection === "inbox-contact" || activeSection === "reg-entries") {
    return;
  }

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

  if (activeSection === "reg-settings") {
    content.symposiumRegistration = {
      enabled: data.enabled === "true",
      title: data.title ?? "",
      subtitle: data.subtitle ?? "",
      dates: data.dates ?? "",
      venue: data.venue ?? "",
      feeNote: data.feeNote ?? "",
      razorpayUrl: data.razorpayUrl ?? "",
      ctaLabel: data.ctaLabel ?? "Register & Pay",
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

  const savePermanent = (): PermanentMember => ({
    name: data.name ?? "",
    membershipNo: Number(data.membershipNo) || 0,
    isFounder: data.isFounder === "true",
  });

  const saveExecutive = (): TeamMember => ({
    name: data.name ?? "",
    role: data.role ?? "",
    affiliation: data.affiliation ?? "",
    image: data.image ?? "",
    section: "executive",
  });

  const saveAttendee = (): SymposiumAttendee => ({
    name: data.name ?? "",
    affiliation: data.affiliation || undefined,
    symposiumYear: Number(data.symposiumYear) || new Date().getFullYear(),
    symposiumTitle: data.symposiumTitle || undefined,
  });

  const saveRecognized = (): RecognizedPerson => ({
    name: data.name ?? "",
    honor: data.honor ?? "",
    year: data.year || undefined,
    affiliation: data.affiliation || undefined,
  });

  const slugify = (text: string): string =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const saveBlog = (): BlogPost => ({
    title: data.title ?? "",
    slug: (data.slug || slugify(data.title ?? "")).trim(),
    tag: data.tag ?? "",
    date: formatNewsMonth(data.date ?? "") || data.date || "",
    excerpt: data.excerpt ?? "",
    coverImage: data.coverImage || undefined,
    body: data.body ?? "",
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

  if (activeSection === "members-permanent") {
    const item = savePermanent();
    if (modalIndex === "new") content.permanentMembers.push(item);
    else content.permanentMembers[modalIndex as number] = item;
    return;
  }

  if (activeSection === "members-executive") {
    const executives = getExecutives();
    const item = saveExecutive();
    if (modalIndex === "new") executives.push(item);
    else executives[modalIndex as number] = item;
    setExecutives(executives);
    return;
  }

  if (activeSection === "members-attendees") {
    const item = saveAttendee();
    if (modalIndex === "new") content.symposiumAttendees.push(item);
    else content.symposiumAttendees[modalIndex as number] = item;
    return;
  }

  if (activeSection === "members-recognized") {
    const item = saveRecognized();
    if (modalIndex === "new") content.recognizedPeople.push(item);
    else content.recognizedPeople[modalIndex as number] = item;
    return;
  }

  if (activeSection === "blog") {
    const item = saveBlog();
    if (modalIndex === "new") content.blogPosts.push(item);
    else content.blogPosts[modalIndex as number] = item;
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

  panel.querySelectorAll("[data-reg-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      regFilter = ((btn as HTMLElement).dataset.regFilter as typeof regFilter) || "all";
      renderPanel();
    });
  });

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

      if (activeSection === "members-executive") {
        const executives = getExecutives();
        moveItem(executives, index, dir as -1 | 1);
        setExecutives(executives);
      } else {
        const lists: Partial<Record<SectionId, keyof SiteContent>> = {
          news: "news",
          "events-upcoming": "upcomingSymposia",
          "events-past": "pastSymposia",
          "events-student": "pastStudentSymposia",
          "members-permanent": "permanentMembers",
          "members-attendees": "symposiumAttendees",
          "members-recognized": "recognizedPeople",
          blog: "blogPosts",
        };
        const key = lists[activeSection];
        if (key) moveItem(content[key] as unknown[], index, dir as -1 | 1);
      }
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
        "members-permanent": () => content.permanentMembers.splice(index, 1),
        "members-executive": () => {
          const executives = getExecutives();
          executives.splice(index, 1);
          setExecutives(executives);
        },
        "members-attendees": () => content.symposiumAttendees.splice(index, 1),
        "members-recognized": () => content.recognizedPeople.splice(index, 1),
        blog: () => content.blogPosts.splice(index, 1),
        "reg-entries": () => content.symposiumRegistrations.splice(index, 1),
        "inbox-contact": () => content.contactMessages.splice(index, 1),
      };

      deleteMap[activeSection]?.();
      if (activeSection === "reg-entries" || activeSection === "inbox-contact") {
        saveContent(content);
        showStatus("Deleted and saved.");
      }
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
