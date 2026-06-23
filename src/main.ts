function initMobileMenu(): void {
  const toggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (!toggle || !mobileNav) return;

  toggle.addEventListener("click", () => {
    const isOpen = toggle.classList.toggle("is-open");
    mobileNav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      toggle.classList.remove("is-open");
      mobileNav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initFaq(): void {
  const faqList = document.getElementById("faq-list");
  if (!faqList) return;

  faqList.querySelectorAll(".faq-item__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".faq-item");
      if (!item) return;

      const isOpen = item.classList.contains("is-open");

      faqList.querySelectorAll(".faq-item").forEach((faq) => {
        faq.classList.remove("is-open");
        faq.querySelector(".faq-item__trigger")?.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function initContactForm(): void {
  const form = document.getElementById("contact-form") as HTMLFormElement | null;
  const success = document.getElementById("contact-success");

  if (!form || !success) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.hidden = true;
    success.hidden = false;
  });
}

function initNewsletterForm(): void {
  const form = document.getElementById("newsletter-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.reset();
    alert("Thank you for subscribing to our newsletter!");
  });
}

initMobileMenu();
initFaq();
initContactForm();
initNewsletterForm();
