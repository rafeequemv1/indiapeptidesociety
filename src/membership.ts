import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";

function initSignInForm(): void {
  const form = document.getElementById("signin-form") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Sign in is temporarily unavailable while membership services are under maintenance.");
  });
}

injectLayout("membership");
initMobileMenu();
initNewsletterForm();
initSignInForm();
