import { loadContent, escapeHtml } from "./data/store";
import { injectLayout } from "./layout";
import { initFaq, initMobileMenu, initNewsletterForm } from "./shared";

function renderFaqList(): void {
  const list = document.getElementById("faq-list");
  if (!list) return;

  const { faqItems } = loadContent();

  list.innerHTML = faqItems
    .map(
      (faq, index) => `
    <div class="faq-item${index === 0 ? " is-open" : ""}">
      <button type="button" class="faq-item__trigger" aria-expanded="${index === 0}">
        <span>${escapeHtml(faq.question)}</span>
        <svg class="faq-item__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="faq-item__panel">
        <p>${escapeHtml(faq.answer)}</p>
      </div>
    </div>`,
    )
    .join("");
}

injectLayout("faq");
renderFaqList();
initMobileMenu();
initFaq();
initNewsletterForm();
