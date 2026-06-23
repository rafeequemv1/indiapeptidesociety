export type PageId = "home" | "membership" | "members" | "events" | "faq" | "contact";

const SOCIAL = {
  facebook: "https://www.facebook.com/indianpeptidesociety/",
  linkedin: "https://www.linkedin.com/company/indian-peptide-society/",
  youtube: "https://www.youtube.com/@peptide-atwistintale.7108",
};

const navItems: { label: string; href: string; id: PageId }[] = [
  { label: "Home", href: "/index.html", id: "home" },
  { label: "About", href: "/index.html#about", id: "home" },
  { label: "Membership", href: "/membership.html", id: "membership" },
  { label: "Members", href: "/members.html", id: "members" },
  { label: "Events", href: "/events.html", id: "events" },
  { label: "Faq", href: "/faq.html", id: "faq" },
  { label: "Contact Us", href: "/contact.html", id: "contact" },
];

function navLink(item: (typeof navItems)[0], active: PageId): string {
  const isActive =
    (active === "home" && item.label === "Home") ||
    (active === "membership" && item.label === "Membership") ||
    (active === "members" && item.label === "Members") ||
    (active === "events" && item.label === "Events") ||
    (active === "faq" && item.label === "Faq") ||
    (active === "contact" && item.label === "Contact Us");
  const activeClass = isActive ? ' class="is-active"' : "";
  return `<a href="${item.href}"${activeClass}>${item.label}</a>`;
}

function socialIcons(size = 16): string {
  const s = size;
  return `
    <a href="${SOCIAL.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="icon-link">
      <svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    </a>
    <a href="${SOCIAL.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="icon-link">
      <svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    </a>
    <a href="${SOCIAL.youtube}" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="icon-link">
      <svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    </a>`;
}

export function renderTopBar(): string {
  return `
    <div class="top-bar">
      <div class="container top-bar__inner">
        <div class="top-bar__social">${socialIcons(16)}</div>
        <p class="top-bar__member">
          Want to become a Member?
          <a href="/membership.html">Sign up</a>
        </p>
        <div class="top-bar__contact">
          <a href="mailto:indianpeptidesociety@gmail.com" class="top-bar__email">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span>indianpeptidesociety@gmail.com</span>
          </a>
          <span class="top-bar__divider"></span>
          <a href="/dashboard.html" class="top-bar__dashboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span>Dashboard</span>
          </a>
          <span class="top-bar__divider"></span>
          <a href="/membership.html#signin" class="top-bar__signin">Sign In</a>
        </div>
      </div>
    </div>`;
}

export function renderHeader(active: PageId): string {
  const links = navItems.map((item) => navLink(item, active)).join("\n          ");
  const mobileLinks = navItems.map((item) => navLink(item, active)).join("\n        ");

  return `
    <header class="header">
      <div class="container header__inner">
        <a href="/index.html" class="logo logo--image">
          <img src="/images/ips-logo.png" alt="Indian Peptide Society" class="logo__img" width="220" height="48" />
        </a>
        <nav class="nav" aria-label="Main navigation">
          ${links}
        </nav>
        <button type="button" class="menu-toggle" id="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
          <svg class="icon-menu" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
        ${mobileLinks}
      </nav>
    </header>`;
}

export function renderFooter(): string {
  return `
    <footer class="footer">
      <div class="container footer__grid">
        <div>
          <h3>Important Links</h3>
          <ul>
            <li><a href="/index.html">Home</a></li>
            <li><a href="/events.html">Upcoming Events</a></li>
            <li><a href="/members.html?tab=founders">Founder Member</a></li>
            <li><a href="/index.html#about">About us</a></li>
            <li><a href="#">Term Of Service</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Members Term</a></li>
          </ul>
        </div>
        <div>
          <h3>Past Symposia</h3>
          <ul>
            <li><a href="/events.html?tab=student">4th Student Indian Peptide Symposium</a></li>
            <li><a href="/events.html?tab=past">10th Indian Peptide Symposium</a></li>
            <li><a href="/events.html?tab=past">9th Indian Peptide Symposium</a></li>
            <li><a href="/events.html?tab=past">8th Indian Peptide Symposium</a></li>
          </ul>
        </div>
        <div>
          <h3>Newsletter</h3>
          <p>Please enter your email-id and get latest updates, news and events.</p>
          <form class="newsletter-form" id="newsletter-form">
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
        <div>
          <h3>Address</h3>
          <div class="footer__address">
            <p><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Jawahar Lal Nehru Centre for Advanced Scientific Research P.O. Jakkur, Bengaluru – 560064</p>
            <p><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Indian Peptide Society 824/3, Sukhdev Nagar Kotla Mubarakpur New Delhi – 110003</p>
            <a href="tel:+01124636224"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> +011 24636224</a>
            <a href="mailto:indianpeptidesociety@gmail.com"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> indianpeptidesociety@gmail.com</a>
          </div>
        </div>
      </div>
      <div class="container footer__bottom">
        <p>© Copyrights 2026 IPS All rights reserved.</p>
        <div class="footer__social">${socialIcons(18)}</div>
        <p class="footer__credit">Designed by Ecybertech</p>
      </div>
    </footer>`;
}

export function injectLayout(active: PageId): void {
  const topBar = document.getElementById("top-bar-mount");
  const header = document.getElementById("header-mount");
  const footer = document.getElementById("footer-mount");

  if (topBar) topBar.outerHTML = renderTopBar();
  if (header) header.outerHTML = renderHeader(active);
  if (footer) footer.outerHTML = renderFooter();
}
