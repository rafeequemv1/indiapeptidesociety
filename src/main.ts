import { injectLayout } from "./layout";
import { renderHomePage } from "./render/home";
import { initMobileMenu, initNewsletterForm } from "./shared";

injectLayout("home");
renderHomePage();
initMobileMenu();
initNewsletterForm();
