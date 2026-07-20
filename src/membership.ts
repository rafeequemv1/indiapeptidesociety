import { injectLayout } from "./layout";
import { initMobileMenu, initNewsletterForm } from "./shared";
import {
  authReady,
  clearPasswordRecovery,
  getSession,
  isAdminUser,
  isPasswordResetReturn,
  markPasswordRecovery,
  onAuthStateChange,
  passwordResetRedirectUrl,
  pruneStalePasswordRecovery,
  requestPasswordReset,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  updatePassword,
} from "./auth/session";

type AuthMode = "signin" | "signup" | "forgot";

function showEl(id: string, visible: boolean): void {
  const el = document.getElementById(id);
  if (el) el.hidden = !visible;
}

function setMsg(id: string, text: string, show: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.hidden = !show;
}

function setHero(title: string, sub: string): void {
  const t = document.getElementById("auth-hero-title");
  const s = document.getElementById("auth-hero-sub");
  if (t) t.textContent = title;
  if (s) s.textContent = sub;
}

function setMode(mode: AuthMode): void {
  const signin = document.getElementById("signin-form");
  const signup = document.getElementById("signup-form");
  const forgot = document.getElementById("forgot-form");
  const showForgot = document.getElementById("show-forgot");
  const showSignin = document.getElementById("show-signin");
  const tabs = document.querySelectorAll<HTMLButtonElement>(".auth-mode-tabs__btn");

  if (signin) signin.hidden = mode !== "signin";
  if (signup) signup.hidden = mode !== "signup";
  if (forgot) forgot.hidden = mode !== "forgot";

  tabs.forEach((tab) => {
    const active = mode !== "forgot" && tab.dataset.mode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.hidden = mode === "forgot";
  });

  const tabBar = document.querySelector(".auth-mode-tabs") as HTMLElement | null;
  if (tabBar) tabBar.hidden = mode === "forgot";

  if (showForgot) showForgot.hidden = mode !== "signin";
  if (showSignin) showSignin.hidden = mode !== "forgot";

  if (mode === "signin") setHero("Sign In", "Indian Peptide Society Membership");
  if (mode === "signup") setHero("Sign Up", "Create your IPS membership account");
  if (mode === "forgot") setHero("Forgot password", "We will email you a reset link");

  setMsg("signin-error", "", false);
  setMsg("signup-error", "", false);
  setMsg("signup-ok", "", false);
  setMsg("forgot-error", "", false);
  setMsg("forgot-ok", "", false);

  if (mode === "forgot") {
    const loginEmail = (document.getElementById("signin-email") as HTMLInputElement | null)?.value;
    const forgotEmail = document.getElementById("forgot-email") as HTMLInputElement | null;
    if (forgotEmail && loginEmail) forgotEmail.value = loginEmail;
  }
}

function showAuthForms(mode: AuthMode = "signin"): void {
  showEl("auth-signed-in", false);
  showEl("auth-set-password", false);
  showEl("auth-forms", true);
  setMode(mode);
}

function showSignedIn(email: string, isAdmin: boolean): void {
  clearPasswordRecovery();
  showEl("auth-forms", false);
  showEl("auth-set-password", false);
  showEl("auth-signed-in", true);
  const emailEl = document.getElementById("auth-user-email");
  if (emailEl) emailEl.textContent = email;
  const dash = document.getElementById("auth-go-dashboard");
  if (dash) dash.hidden = !isAdmin;
  setHero("Welcome", "You are signed in");
}

function showSetPassword(): void {
  markPasswordRecovery();
  showEl("auth-forms", false);
  showEl("auth-signed-in", false);
  showEl("auth-set-password", true);
  setHero("Reset password", "Choose a new password for your account");
}

function bindForms(): void {
  document.querySelectorAll<HTMLElement>("[data-mode]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const mode = el.dataset.mode as AuthMode;
      if (mode !== "signin" && mode !== "signup" && mode !== "forgot") return;

      if (!document.getElementById("auth-set-password")?.hidden) {
        clearPasswordRecovery();
        void signOut();
      }
      showAuthForms(mode === "forgot" ? "signin" : mode);
      if (mode === "forgot") setMode("forgot");
    });
  });

  document.getElementById("show-forgot")?.addEventListener("click", () => setMode("forgot"));
  document.getElementById("show-signin")?.addEventListener("click", () => setMode("signin"));

  document.getElementById("auth-signout")?.addEventListener("click", async () => {
    await signOut();
    showAuthForms("signin");
    window.location.reload();
  });

  const signupForm = document.getElementById("signup-form") as HTMLFormElement | null;
  signupForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authReady()) {
      setMsg("signup-error", "Sign up is unavailable. Supabase is not configured.", true);
      return;
    }
    const data = new FormData(signupForm);
    const fullName = String(data.get("full_name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setMsg("signup-error", "", false);
    setMsg("signup-ok", "", false);
    const { data: result, error } = await signUpWithPassword(email, password, fullName);
    if (error) {
      setMsg("signup-error", error.message, true);
      return;
    }
    if (result.session) {
      if (isAdminUser(result.user)) {
        window.location.href = "/dashboard.html";
        return;
      }
      showSignedIn(email, false);
      return;
    }
    setMsg("signup-ok", "Account created. You can sign in now.", true);
    setMode("signin");
    const signinEmail = document.getElementById("signin-email") as HTMLInputElement | null;
    if (signinEmail) signinEmail.value = email;
  });

  const signinForm = document.getElementById("signin-form") as HTMLFormElement | null;
  signinForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authReady()) {
      setMsg("signin-error", "Sign in is unavailable. Supabase is not configured.", true);
      return;
    }
    clearPasswordRecovery();
    const data = new FormData(signinForm);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setMsg("signin-error", "", false);
    const { data: result, error } = await signInWithPassword(email, password);
    if (error) {
      setMsg("signin-error", error.message, true);
      return;
    }
    if (isAdminUser(result.user)) {
      window.location.href = "/dashboard.html";
      return;
    }
    showSignedIn(email, false);
  });

  const forgotForm = document.getElementById("forgot-form") as HTMLFormElement | null;
  forgotForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authReady()) {
      setMsg("forgot-error", "Reset is unavailable. Supabase is not configured.", true);
      return;
    }
    const data = new FormData(forgotForm);
    const email = String(data.get("email") ?? "").trim();
    setMsg("forgot-error", "", false);
    setMsg("forgot-ok", "", false);
    const { error } = await requestPasswordReset(email, passwordResetRedirectUrl("membership"));
    if (error) {
      setMsg("forgot-error", error.message, true);
      return;
    }
    setMsg(
      "forgot-ok",
      "Reset link sent. Check your email, then use the link to choose a new password.",
      true,
    );
  });

  const setPasswordForm = document.getElementById("set-password-form") as HTMLFormElement | null;
  setPasswordForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isPasswordResetReturn()) {
      showAuthForms("signin");
      return;
    }
    const data = new FormData(setPasswordForm);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");
    setMsg("set-password-error", "", false);
    if (password.length < 8) {
      setMsg("set-password-error", "Password must be at least 8 characters.", true);
      return;
    }
    if (password !== confirm) {
      setMsg("set-password-error", "Passwords do not match.", true);
      return;
    }
    const { error } = await updatePassword(password);
    if (error) {
      setMsg("set-password-error", error.message, true);
      return;
    }
    clearPasswordRecovery();
    const session = await getSession();
    if (isAdminUser(session?.user ?? null)) {
      window.location.href = "/dashboard.html";
      return;
    }
    showSignedIn(session?.user.email ?? "", false);
  });
}

async function initMembershipAuth(): Promise<void> {
  pruneStalePasswordRecovery();
  showEl("auth-set-password", false);

  if (!authReady()) {
    showAuthForms("signin");
    setMsg("signin-error", "Authentication is not configured yet.", true);
    return;
  }

  onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" || (session?.user && isPasswordResetReturn())) {
      showSetPassword();
      return;
    }
    if (session?.user) {
      showSignedIn(session.user.email ?? "", isAdminUser(session.user));
    } else {
      showAuthForms(window.location.hash === "#signup" ? "signup" : "signin");
    }
  });

  await new Promise((r) => setTimeout(r, 50));
  const session = await getSession();

  if (isPasswordResetReturn() && session?.user) {
    showSetPassword();
  } else if (session?.user) {
    showSignedIn(session.user.email ?? "", isAdminUser(session.user));
  } else {
    showAuthForms(window.location.hash === "#signup" ? "signup" : "signin");
  }
}

injectLayout("membership");
initMobileMenu();
initNewsletterForm();
bindForms();
void initMembershipAuth();
