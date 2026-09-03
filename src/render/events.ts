import type { SymposiumEvent } from "../data/store";
import { escapeHtml } from "../data/store";

export function renderEventCard(event: SymposiumEvent, highlight = false): string {
  const ctaUrl = event.ctaUrl || (highlight ? "/ips-2027.html" : "");
  const ctaLabel = event.ctaLabel || (highlight ? "IPS 2027 Page" : "");
  const cta =
    ctaUrl && ctaLabel
      ? `<a href="${escapeHtml(ctaUrl)}" class="btn btn--primary event-card__cta">${escapeHtml(ctaLabel)}</a>`
      : "";

  return `
    <article class="event-card${highlight ? " event-card--featured" : ""}">
      ${event.status ? `<span class="event-card__status">${escapeHtml(event.status)}</span>` : ""}
      <h3>${escapeHtml(event.title)}</h3>
      <dl class="event-card__details">
        <div><dt>Dates</dt><dd>${escapeHtml(event.dates)}</dd></div>
        <div><dt>Venue</dt><dd>${escapeHtml(event.venue)}</dd></div>
        ${event.coordinator ? `<div><dt>Coordinator</dt><dd>${escapeHtml(event.coordinator)}</dd></div>` : ""}
      </dl>
      ${cta}
    </article>`;
}
