import { loadContent, escapeHtml } from "./data/store";
import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildOutline(bodyEl: HTMLElement, navEl: HTMLElement): void {
  const headings = bodyEl.querySelectorAll("h2, h3");
  if (!headings.length) {
    navEl.innerHTML = `<p class="blog-outline__empty">No sections</p>`;
    return;
  }

  const used = new Set<string>();
  const items: string[] = [];

  headings.forEach((heading) => {
    const text = heading.textContent?.trim() || "Section";
    let id = heading.id || slugify(text);
    let unique = id;
    let n = 2;
    while (used.has(unique)) {
      unique = `${id}-${n}`;
      n += 1;
    }
    used.add(unique);
    heading.id = unique;
    const level = heading.tagName === "H3" ? "blog-outline__link--h3" : "";
    items.push(
      `<a href="#${unique}" class="blog-outline__link ${level}">${escapeHtml(text)}</a>`,
    );
  });

  navEl.innerHTML = items.join("");

  const links = navEl.querySelectorAll<HTMLAnchorElement>(".blog-outline__link");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = (entry.target as HTMLElement).id;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
  );

  headings.forEach((h) => observer.observe(h));
}

function initBlogPostPage(): void {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") ?? "";
  const data = loadContent();
  const post = data.blogPosts.find((p) => p.slug === slug) ?? data.blogPosts[0];

  const titleEl = document.getElementById("blog-post-title");
  const metaEl = document.getElementById("blog-post-meta");
  const excerptEl = document.getElementById("blog-post-excerpt");
  const bodyEl = document.getElementById("blog-post-body");
  const navEl = document.getElementById("blog-outline-nav");
  const coverEl = document.getElementById("blog-post-cover");

  if (!titleEl || !metaEl || !excerptEl || !bodyEl || !navEl) return;

  if (!post) {
    titleEl.textContent = "Post not found";
    metaEl.textContent = "";
    excerptEl.textContent = "This article is unavailable.";
    bodyEl.innerHTML = `<p><a href="/blog.html">Return to the blog</a></p>`;
    navEl.innerHTML = "";
    if (coverEl) coverEl.hidden = true;
    return;
  }

  document.title = `${post.title} | Indian Peptide Society`;
  titleEl.textContent = post.title;
  metaEl.innerHTML = `<span>${escapeHtml(post.tag)}</span><span aria-hidden="true">·</span><time>${escapeHtml(post.date)}</time>`;
  excerptEl.textContent = post.excerpt;
  bodyEl.innerHTML = post.body;
  if (coverEl) {
    if (post.coverImage) {
      coverEl.hidden = false;
      coverEl.innerHTML = `<img src="${escapeHtml(post.coverImage)}" alt="" />`;
    } else {
      coverEl.hidden = true;
      coverEl.innerHTML = "";
    }
  }
  buildOutline(bodyEl, navEl);
}

injectLayout("blog");
initMobileMenu();
initNewsletterForm();
initBlogPostPage();
