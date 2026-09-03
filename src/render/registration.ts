import { loadContent, saveContent, newId, escapeHtml } from "../data/store";
import { abstractStoragePath, fileToAbstractPayload } from "../lib/abstract-file";
import { downloadReceipt, openReceiptForPrint } from "../lib/receipt";
import {
  allocateSymposiumNumber,
  symposiumEventYear,
} from "../lib/registration-numbers";
import type { SymposiumRegistration, SymposiumRegistrationConfig } from "../domain/types";

export function renderRegistrationPage(): void {
  const data = loadContent();
  const config = data.symposiumRegistration;

  const page = document.getElementById("registration-page");
  const closed = document.getElementById("registration-closed");
  const open = document.getElementById("registration-open");

  if (!config.enabled) {
    if (closed) closed.hidden = false;
    if (open) open.hidden = true;
    if (page) page.dataset.state = "closed";
    const title = document.getElementById("symp-reg-title");
    if (title && config.title) title.textContent = config.title;
    fillHeroDetails(config, false);
    return;
  }

  if (closed) closed.hidden = true;
  if (open) open.hidden = false;
  if (page) page.dataset.state = "open";

  fillDetails(config);
  bindRegistrationForm(config);
}

function fillHeroDetails(config: SymposiumRegistrationConfig, open: boolean): void {
  const details = document.getElementById("symp-reg-details");
  if (!details) return;

  const items = [
    { label: "Dates", value: config.dates || "To be announced" },
    { label: "Venue", value: config.venue || "To be announced" },
    { label: "Fee", value: config.feeNote || "Details coming soon" },
  ];

  if (open) {
    items.push({
      label: "Payment",
      value: config.razorpayUrl.trim()
        ? "Razorpay after submit"
        : "Link coming soon",
    });
  }

  details.innerHTML = items
    .map(
      (item) => `
      <div class="reg-hero-detail">
        <span class="reg-hero-detail__label">${escapeHtml(item.label)}</span>
        <span class="reg-hero-detail__value">${escapeHtml(item.value)}</span>
      </div>`
    )
    .join("");
}

function fillDetails(config: SymposiumRegistrationConfig): void {
  const title = document.getElementById("symp-reg-title");
  const subtitle = document.getElementById("symp-reg-subtitle");
  const submitBtn = document.getElementById("symp-reg-submit");

  if (title) title.textContent = config.title;
  if (subtitle) subtitle.textContent = config.subtitle;
  if (submitBtn) submitBtn.textContent = config.ctaLabel || "Register & Pay";

  fillHeroDetails(config, true);
}

export function bindRegistrationForm(config: SymposiumRegistrationConfig): void {
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

  btnDownload?.addEventListener("click", () => {
    if (!lastRegistration) return;
    downloadReceipt({
      registration: lastRegistration,
      event: { title: config.title, dates: config.dates, venue: config.venue },
    });
  });
  btnPrint?.addEventListener("click", () => {
    if (!lastRegistration) return;
    openReceiptForPrint({
      registration: lastRegistration,
      event: { title: config.title, dates: config.dates, venue: config.venue },
    });
  });

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
        const eventYear = symposiumEventYear(
          content.symposiumRegistration.dates || content.symposiumRegistration.title || "",
          new Date(submittedAt).getFullYear(),
        );
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
          receiptNo: allocateSymposiumNumber(content, eventYear),
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
