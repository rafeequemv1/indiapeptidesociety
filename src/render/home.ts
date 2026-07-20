import { loadContent, saveContent, newId, escapeHtml } from "../data/store";
import { abstractStoragePath, fileToAbstractPayload } from "../lib/abstract-file";
import { buildReceiptNumber, downloadReceipt, openReceiptForPrint } from "../lib/receipt";
import type { SiteContent, SymposiumRegistration } from "../domain/types";

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

function newsImageHtml(image: string, title: string): string {
  if (image) {
    return `<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" />`;
  }
  return `
    <div class="news-card__placeholder" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
    </div>`;
}

function personCard(member: { name: string; role: string; affiliation: string; image: string }, centered = false): string {
  const mod = centered ? " person-card--centered" : "";
  const roleBlock = member.role
    ? `<p class="person-card__role">${escapeHtml(member.role)}</p><div class="person-card__line"></div>`
    : "";
  return `
    <article class="person-card${mod}">
      <div class="person-card__photo">
        <img src="${escapeHtml(member.image)}" alt="${escapeHtml(member.name)}" loading="lazy" />
      </div>
      <div class="person-card__body">
        <h3 class="person-card__name">${escapeHtml(member.name)}</h3>
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
    const parts: string[] = [];
    if (data.symposiumRegistration.enabled) {
      parts.push(
        `<a href="#symposium-registration" class="btn btn--announcement" data-scroll-to="symposium-registration">Register</a>`,
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
        <div class="news-card__image">
          ${newsImageHtml(item.image, item.title)}
        </div>
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

  renderSymposiumRegistration(data.symposiumRegistration);
}

function renderSymposiumRegistration(config: {
  enabled: boolean;
  title: string;
  subtitle: string;
  dates: string;
  venue: string;
  feeNote: string;
  razorpayUrl: string;
  ctaLabel: string;
}): void {
  const section = document.getElementById("symposium-registration");
  if (!section) return;

  if (!config.enabled) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  const title = document.getElementById("symp-reg-title");
  const subtitle = document.getElementById("symp-reg-subtitle");
  const details = document.getElementById("symp-reg-details");
  const fee = document.getElementById("symp-reg-fee");
  const submitBtn = document.getElementById("symp-reg-submit");

  if (title) title.textContent = config.title;
  if (subtitle) subtitle.textContent = config.subtitle;
  if (details) {
    details.innerHTML = `
      <p><strong>Dates:</strong> ${escapeHtml(config.dates)}</p>
      <p><strong>Venue:</strong> ${escapeHtml(config.venue)}</p>`;
  }
  if (fee) fee.textContent = config.feeNote;
  if (submitBtn) submitBtn.textContent = config.ctaLabel || "Register & Pay";

  const form = document.getElementById("symposium-reg-form") as HTMLFormElement | null;
  const success = document.getElementById("symposium-reg-success");
  const successMsg = document.getElementById("symposium-reg-success-msg");
  const receiptActions = document.getElementById("symposium-reg-receipt-actions");
  const receiptHint = document.getElementById("symposium-reg-receipt-hint");
  const btnDownload = document.getElementById("btn-download-receipt");
  const btnPrint = document.getElementById("btn-print-receipt");
  if (!form || form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  let lastRegistration: SymposiumRegistration | null = null;

  const bindReceiptButtons = (): void => {
    btnDownload?.addEventListener("click", () => {
      if (!lastRegistration) return;
      downloadReceipt({
        registration: lastRegistration,
        event: {
          title: config.title,
          dates: config.dates,
          venue: config.venue,
        },
      });
    });
    btnPrint?.addEventListener("click", () => {
      if (!lastRegistration) return;
      openReceiptForPrint({
        registration: lastRegistration,
        event: {
          title: config.title,
          dates: config.dates,
          venue: config.venue,
        },
      });
    });
  };
  bindReceiptButtons();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    void (async () => {
      const fd = new FormData(form);
      const name = String(fd.get("name") ?? "").trim();
      const email = String(fd.get("email") ?? "").trim();
      const phone = String(fd.get("phone") ?? "").trim();
      const affiliation = String(fd.get("affiliation") ?? "").trim();
      const category = String(fd.get("category") ?? "").trim();
      const abstractTitle = String(fd.get("abstractTitle") ?? "").trim();
      const fileInput = form.querySelector<HTMLInputElement>("#reg-abstract-file");
      const file = fileInput?.files?.[0] ?? null;
      if (!name || !email || !phone || !affiliation || !category) return;

      const submitBtnEl = document.getElementById("symp-reg-submit") as HTMLButtonElement | null;
      if (submitBtnEl) {
        submitBtnEl.disabled = true;
        submitBtnEl.textContent = "Submitting…";
      }

      try {
        const id = newId();
        const submittedAt = new Date().toISOString();
        let abstractFields: Partial<SymposiumRegistration> = {
          hasAbstract: Boolean(abstractTitle),
          abstractTitle: abstractTitle || undefined,
        };

        if (file) {
          const payload = await fileToAbstractPayload(file);
          abstractFields = {
            hasAbstract: true,
            abstractTitle: abstractTitle || undefined,
            abstractFileName: payload.fileName,
            abstractMimeType: payload.mimeType,
            abstractFileSize: payload.fileSize,
            abstractDataUrl: payload.dataUrl,
            abstractStoragePath: abstractStoragePath(id, payload.fileName),
          };
        }

        const content = loadContent();
        const registration: SymposiumRegistration = {
          id,
          name,
          email,
          phone,
          affiliation,
          category,
          submittedAt,
          paymentStatus: "pending",
          amountLabel: content.symposiumRegistration.feeNote || undefined,
          receiptNo: buildReceiptNumber({
            id,
            name,
            email,
            phone,
            affiliation,
            category,
            submittedAt,
          }),
          ...abstractFields,
        };
        content.symposiumRegistrations.unshift(registration);
        saveContent(content);
        lastRegistration = registration;
        finishSuccess(
          form,
          success,
          receiptActions,
          successMsg,
          receiptHint,
          content.symposiumRegistration.razorpayUrl,
          Boolean(registration.hasAbstract),
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "Could not submit registration.");
      } finally {
        if (submitBtnEl) {
          submitBtnEl.disabled = false;
          submitBtnEl.textContent = config.ctaLabel || "Register & Pay";
        }
      }
    })();
  });
}

function finishSuccess(
  form: HTMLFormElement,
  success: HTMLElement | null,
  receiptActions: HTMLElement | null,
  successMsg: HTMLElement | null,
  receiptHint: HTMLElement | null,
  razorpayUrl: string,
  hasAbstract: boolean,
): void {
  form.hidden = true;
  if (success) success.hidden = false;
  if (receiptActions) receiptActions.hidden = false;

  const abstractNote = hasAbstract ? " Your abstract was uploaded and will appear in the admin list." : "";
  const payUrl = razorpayUrl.trim();
  if (payUrl) {
    if (successMsg) {
      successMsg.textContent =
        `Thank you. Download your acknowledgement receipt now, then complete payment on Razorpay.${abstractNote}`;
    }
    if (receiptHint) {
      receiptHint.textContent =
        "Tip: use Print / Save PDF for a PDF copy. Payment ID appears on the receipt after Razorpay confirmation.";
    }
    window.setTimeout(() => {
      window.open(payUrl, "_blank", "noopener,noreferrer");
    }, 800);
  } else if (successMsg) {
    successMsg.textContent =
      `Thank you. Your registration is recorded. Download your receipt below.${abstractNote} Razorpay will be enabled when payment details are shared.`;
    if (receiptHint) {
      receiptHint.textContent =
        "Current receipt status: PAYMENT PENDING until Razorpay webhook marks it paid.";
    }
  }
}
