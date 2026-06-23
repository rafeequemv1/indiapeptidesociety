import { injectLayout } from "./layout";
import { initContactForm, initMobileMenu, initNewsletterForm } from "./shared";

injectLayout("contact");
initMobileMenu();
initContactForm();
initNewsletterForm();
