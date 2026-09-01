import { injectLayout } from "./layout";
import { renderRegistrationPage } from "./render/registration";
import { initMobileMenu, initNewsletterForm } from "./shared";

injectLayout("registration");
renderRegistrationPage();
initMobileMenu();
initNewsletterForm();
