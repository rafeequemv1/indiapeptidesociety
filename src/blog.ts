import { loadContent, escapeHtml } from "./data/store";
import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

function renderBlogCard(post: {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  coverImage?: string;
}): string {
  const thumb = post.coverImage
    ? `<img src="${escapeHtml(post.coverImage)}" alt="" class="blog-card__thumb-img" loading="lazy" />`
    : `<div class="blog-card__thumb-placeholder" aria-hidden="true"></div>`;

  return `
    <a href="/blog-post.html?slug=${encodeURIComponent(post.slug)}" class="blog-card">
      <div class="blog-card__thumb">${thumb}</div>
      <div class="blog-card__body">
        <div class="blog-card__meta">
          <span class="blog-card__tag">${escapeHtml(post.tag)}</span>
          <time>${escapeHtml(post.date)}</time>
        </div>
        <h2 class="blog-card__title">${escapeHtml(post.title)}</h2>
        <p class="blog-card__excerpt">${escapeHtml(post.excerpt)}</p>
      </div>
      <span class="blog-card__read">Read more</span>
    </a>`;
}

function initBlogPage(): void {
  const grid = document.getElementById("blog-grid");
  if (!grid) return;

  const posts = loadContent().blogPosts;
  grid.innerHTML = posts.length
    ? posts.map(renderBlogCard).join("")
    : `<p class="members-empty">No blog posts yet.</p>`;
}

injectLayout("blog");
initMobileMenu();
initNewsletterForm();
initBlogPage();
