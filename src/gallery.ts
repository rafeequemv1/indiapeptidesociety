import { loadContent, escapeHtml } from "./data/store";
import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

function initGalleryPage(): void {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const images = loadContent().galleryImages.filter((g) => g.image);
  grid.innerHTML = images.length
    ? images
        .map(
          (item) => `
      <figure class="gallery-card">
        <div class="gallery-card__media">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title || "Gallery image")}" loading="lazy" />
        </div>
        ${item.title ? `<figcaption class="gallery-card__title">${escapeHtml(item.title)}</figcaption>` : ""}
      </figure>`,
        )
        .join("")
    : `<p class="members-empty">No gallery images yet.</p>`;
}

injectLayout("gallery");
initMobileMenu();
initNewsletterForm();
initGalleryPage();
