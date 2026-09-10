import { loadContent, escapeHtml } from "../data/store";
import { formatMembershipDisplayNo } from "../lib/registration-numbers";
import type { SiteContent } from "../domain/types";

function buildSymposiumTicker(data: SiteContent): string {
  const reg = data.symposiumRegistration;
  if (reg.enabled && (reg.title || reg.dates || reg.venue)) {
    const title = reg.title || "Indian Peptide Symposium";
    const dates = reg.dates ? ` from ${reg.dates}` : "";
    const venue = reg.venue ? ` at ${reg.venue}` : "";
    return `${title} will be held${dates}${venue}. Register online — stay tuned for updates!`;
  }
  const upcoming = data.upcomingSymposia[0];
  if (upcoming) {
    return `${upcoming.title} — ${upcoming.dates}${upcoming.venue ? `, ${upcoming.venue}` : ""}. Stay tuned!`;
  }
  return data.announcement.ticker;
}

const SERVICE_ICONS = [
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>`,
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
];

function personCard(
  member: { name: string; role: string; affiliation: string; image: string; membershipNo?: string },
  centered = false,
): string {
  const mod = centered ? " person-card--centered" : "";
  const roleBlock = member.role
    ? `<p class="person-card__role">${escapeHtml(member.role)}</p><div class="person-card__line"></div>`
    : "";
  const membershipBlock = member.membershipNo
    ? `<p class="person-card__membership">Membership No. ${escapeHtml(formatMembershipDisplayNo(member.membershipNo))}</p>`
    : "";
  return `
    <article class="person-card person-card--text${mod}">
      <div class="person-card__body">
        <h3 class="person-card__name">${escapeHtml(member.name)}</h3>
        ${membershipBlock}
        ${roleBlock}
        ${member.affiliation ? `<p class="person-card__affiliation">${escapeHtml(member.affiliation)}</p>` : ""}
      </div>
    </article>`;
}

export function renderHomePage(): void {
  const data = loadContent();

  const lead = document.getElementById("announcement-lead");
  const details = document.getElementById("announcement-details");
  const ctaWrap = document.getElementById("announcement-cta-wrap");
  const ticker = document.getElementById("announcement-ticker");

  if (lead) lead.textContent = data.announcement.lead;
  if (details) {
    details.innerHTML = `
      <p><strong>Dates:</strong> ${escapeHtml(data.announcement.dates)}</p>
      <p><strong>Venue:</strong> ${escapeHtml(data.announcement.venue)}</p>
      <p><strong>Coordinator:</strong> ${escapeHtml(data.announcement.coordinator)}</p>`;
  }
  if (ctaWrap) {
    const parts: string[] = [
      `<a href="/ips-2027.html" class="btn btn--announcement">Symposium 2027</a>`,
    ];
    if (data.symposiumRegistration.enabled) {
      parts.push(
        `<a href="/registration.html" class="btn btn--register">Register</a>`,
      );
    }
    const { cta, ctaUrl, showCtaButton } = data.announcement;
    if (showCtaButton && ctaUrl) {
      parts.push(
        `<a href="${escapeHtml(ctaUrl)}" class="btn btn--announcement btn--announcement-secondary">${escapeHtml(cta || "Learn more")}</a>`,
      );
    }
    ctaWrap.innerHTML = parts.join("");
  }

  const heroImages = document.getElementById("announcement-images");
  if (heroImages) {
    const fromHero = data.heroImages.filter((h) => h.image);
    const fromGallery = data.galleryImages.filter((g) => g.image);
    const imgs = fromHero.length ? fromHero : fromGallery;
    if (!imgs.length) {
      heroImages.innerHTML = "";
      heroImages.hidden = true;
    } else {
      heroImages.hidden = false;
      heroImages.innerHTML = imgs
        .map(
          (h) => `
        <figure class="announcement__image">
          <img src="${escapeHtml(h.image)}" alt="${escapeHtml(h.title || "Symposium highlight")}" loading="lazy" />
          ${h.title ? `<figcaption>${escapeHtml(h.title)}</figcaption>` : ""}
        </figure>`,
        )
        .join("");
    }
  }
  if (ticker) {
    const text = escapeHtml(buildSymposiumTicker(data));
    ticker.innerHTML = `<span>${text}</span><span>${text}</span><span>${text}</span><span>${text}</span>`;
  }

  const newsGrid = document.getElementById("news-grid");
  if (newsGrid) {
    newsGrid.innerHTML = data.news
      .map(
        (item) => `
      <article class="news-card">
        <div class="news-card__body">
          <div class="news-card__meta">
            <span class="tag">${escapeHtml(item.tag)}</span>
            <time>${escapeHtml(item.date)}</time>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.excerpt)}</p>
        </div>
      </article>`,
      )
      .join("");
  }

  const awardsStats = document.getElementById("awards-stats");
  if (awardsStats) {
    awardsStats.innerHTML = data.stats
      .map(
        (s) => `
      <div class="awards-stat">
        <p class="awards-stat__value">${escapeHtml(s.value)}</p>
        <p class="awards-stat__label">${escapeHtml(s.label)}</p>
      </div>`,
      )
      .join("");
  }

  const awardsGallery = document.getElementById("awards-gallery");
  if (awardsGallery) {
    awardsGallery.innerHTML = data.lifetimeAwards
      .map(
        (award) => `
      <figure class="award-card">
        <div class="award-card__photo">
          <img src="${escapeHtml(award.image)}" alt="${escapeHtml(award.caption)}" loading="lazy" />
        </div>
        <figcaption class="award-card__caption">${escapeHtml(award.caption)}</figcaption>
      </figure>`,
      )
      .join("");
  }

  const servicesGrid = document.getElementById("services-grid");
  if (servicesGrid) {
    servicesGrid.innerHTML = data.services
      .map(
        (s, i) => `
      <article class="service-card">
        <div class="service-card__icon">${SERVICE_ICONS[i % SERVICE_ICONS.length]}</div>
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description)}</p>
      </article>`,
      )
      .join("");
  }

  const executives = data.team.filter((m) => m.section === "executive");
  const advisors = data.team.filter((m) => m.section === "advisors");

  const executiveGrid = document.getElementById("team-executive-grid");
  if (executiveGrid) {
    executiveGrid.innerHTML = executives.map((m) => personCard(m)).join("");
  }

  const advisorsGrid = document.getElementById("team-advisors-grid");
  if (advisorsGrid) {
    advisorsGrid.innerHTML = advisors.map((m) => personCard(m, true)).join("");
  }
}
