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
} from "./session";

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

function showSignedIn(email: string): void {
  clearPasswordRecovery();
  showEl("auth-forms", false);
  showEl("auth-set-password", false);
  showEl("auth-signed-in", true);
  const emailEl = document.getElementById("auth-user-email");
  if (emailEl) emailEl.textContent = email;
}

function showSetPassword(): void {
  markPasswordRecovery();
  showEl("auth-forms", false);
  showEl("auth-signed-in", false);
  showEl("auth-set-password", true);
}

export function openAuthModal(mode: AuthMode = "signin"): void {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("auth-modal-open");
  if (mode === "forgot") {
    showAuthForms("signin");
    setMode("forgot");
  } else {
    showAuthForms(mode);
  }
}

export function closeAuthModal(): void {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("auth-modal-open");
}

function bindAuthForms(): void {
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
    closeAuthModal();
    await refreshTopBarAuth();
  });

  document.querySelectorAll("[data-auth-close]").forEach((el) => {
    el.addEventListener("click", () => closeAuthModal());
  });

  document.getElementById("signup-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const signupForm = e.target as HTMLFormElement;
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
      window.location.href = "/dashboard.html";
      return;
    }
    setMsg("signup-ok", "Account created. You can sign in now.", true);
    setMode("signin");
    const signinEmail = document.getElementById("signin-email") as HTMLInputElement | null;
    if (signinEmail) signinEmail.value = email;
  });

  document.getElementById("signin-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const signinForm = e.target as HTMLFormElement;
    if (!authReady()) {
      setMsg("signin-error", "Sign in is unavailable. Supabase is not configured.", true);
      return;
    }
    clearPasswordRecovery();
    const data = new FormData(signinForm);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setMsg("signin-error", "", false);
    const { error } = await signInWithPassword(email, password);
    if (error) {
      setMsg("signin-error", error.message, true);
      return;
    }
    window.location.href = "/dashboard.html";
  });

  document.getElementById("forgot-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const forgotForm = e.target as HTMLFormElement;
    if (!authReady()) {
      setMsg("forgot-error", "Reset is unavailable. Supabase is not configured.", true);
      return;
    }
    const data = new FormData(forgotForm);
    const email = String(data.get("email") ?? "").trim();
    setMsg("forgot-error", "", false);
    setMsg("forgot-ok", "", false);
    const { error } = await requestPasswordReset(email, passwordResetRedirectUrl());
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

  document.getElementById("set-password-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const setPasswordForm = e.target as HTMLFormElement;
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
    window.location.href = "/dashboard.html";
  });
}

export function renderAuthModal(): string {
  return `
    <div class="auth-modal" id="auth-modal" hidden aria-hidden="true">
      <div class="auth-modal__backdrop" data-auth-close tabindex="-1"></div>
      <div class="auth-modal__dialog" role="dialog" aria-modal="true" aria-label="Account">
        <button type="button" class="auth-modal__close" data-auth-close aria-label="Close">&times;</button>

        <div id="auth-signed-in" class="auth-panel" hidden>
          <div class="auth-panel__card">
            <h2 class="auth-panel__title">Signed in</h2>
            <p class="auth-panel__lead">Signed in as <strong id="auth-user-email"></strong></p>
            <div class="auth-panel__actions">
              <a href="/dashboard.html" class="btn btn--primary">Open dashboard</a>
              <button type="button" class="btn btn--ghost" id="auth-signout">Sign out</button>
            </div>
          </div>
        </div>

        <div id="auth-set-password" class="auth-panel" hidden>
          <div class="auth-panel__card">
            <h2 class="auth-panel__title">Set a new password</h2>
            <p class="auth-panel__lead">You opened the reset link from your email. Choose a new password.</p>
            <form id="set-password-form" class="contact-form contact-form--plain">
              <div class="form-group">
                <label for="set-password">New password</label>
                <input id="set-password" name="password" type="password" required minlength="8" autocomplete="new-password" />
              </div>
              <div class="form-group">
                <label for="set-password-confirm">Confirm password</label>
                <input id="set-password-confirm" name="confirm" type="password" required minlength="8" autocomplete="new-password" />
              </div>
              <p class="auth-msg auth-msg--error" id="set-password-error" role="alert" hidden></p>
              <button type="submit" class="btn btn--primary btn--full">Save password</button>
            </form>
            <p class="auth-panel__links">
              <button type="button" class="auth-text-link" data-mode="signin">Cancel and sign in</button>
            </p>
          </div>
        </div>

        <div id="auth-forms" class="auth-panel">
          <div class="auth-panel__card" id="signin">
            <div class="auth-mode-tabs" role="tablist" aria-label="Account">
              <button type="button" class="auth-mode-tabs__btn is-active" data-mode="signin" role="tab" aria-selected="true">Sign In</button>
              <button type="button" class="auth-mode-tabs__btn" data-mode="signup" role="tab" aria-selected="false">Sign Up</button>
            </div>

            <form id="signin-form" class="contact-form contact-form--plain">
              <div class="form-group">
                <label for="signin-email">Email</label>
                <input id="signin-email" name="email" type="email" required autocomplete="username" />
              </div>
              <div class="form-group">
                <label for="signin-password">Password</label>
                <input id="signin-password" name="password" type="password" required autocomplete="current-password" />
              </div>
              <p class="auth-msg auth-msg--error" id="signin-error" role="alert" hidden></p>
              <button type="submit" class="btn btn--primary btn--full">Sign In</button>
            </form>

            <form id="signup-form" class="contact-form contact-form--plain" hidden>
              <div class="form-group">
                <label for="signup-name">Full name</label>
                <input id="signup-name" name="full_name" type="text" required autocomplete="name" />
              </div>
              <div class="form-group">
                <label for="signup-email">Email</label>
                <input id="signup-email" name="email" type="email" required autocomplete="email" />
              </div>
              <div class="form-group">
                <label for="signup-password">Password</label>
                <input id="signup-password" name="password" type="password" required minlength="8" autocomplete="new-password" />
              </div>
              <p class="auth-msg auth-msg--error" id="signup-error" role="alert" hidden></p>
              <p class="auth-msg auth-msg--ok" id="signup-ok" hidden></p>
              <button type="submit" class="btn btn--primary btn--full">Create account</button>
            </form>

            <form id="forgot-form" class="contact-form contact-form--plain" hidden>
              <p class="auth-panel__lead auth-panel__lead--tight">Enter your email and we will send a password reset link.</p>
              <div class="form-group">
                <label for="forgot-email">Email</label>
                <input id="forgot-email" name="email" type="email" required autocomplete="username" />
              </div>
              <p class="auth-msg auth-msg--error" id="forgot-error" role="alert" hidden></p>
              <p class="auth-msg auth-msg--ok" id="forgot-ok" hidden></p>
              <button type="submit" class="btn btn--primary btn--full">Send reset link</button>
            </form>

            <p class="auth-panel__links">
              <button type="button" class="auth-text-link" id="show-forgot">Forgot password?</button>
              <button type="button" class="auth-text-link" id="show-signin" hidden>Back to sign in</button>
            </p>
          </div>
        </div>
      </div>
    </div>`;
}

function mountAuthModal(): void {
  let mount = document.getElementById("auth-modal-mount");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "auth-modal-mount";
    document.body.appendChild(mount);
  }
  mount.innerHTML = renderAuthModal();
}

function bindAuthTriggers(): void {
  if (document.body.dataset.authTriggersBound === "1") return;
  document.body.dataset.authTriggersBound = "1";

  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.closest("#footer-signin")) {
      e.preventDefault();
      openAuthModal("signin");
      return;
    }

    const authBtn = target.closest("#top-bar-auth-btn");
    if (authBtn) {
      e.preventDefault();
      if (authBtn.getAttribute("data-auth-state") === "signed-in") {
        window.location.href = "/dashboard.html";
        return;
      }
      openAuthModal("signin");
    }
  });
}

export async function refreshTopBarAuth(): Promise<void> {
  const btn = document.getElementById("top-bar-auth-btn");
  if (!btn) return;

  try {
    if (!authReady()) {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg><span>Sign In</span>`;
      btn.removeAttribute("data-auth-state");
      return;
    }
    const session = await getSession();
    if (session?.user) {
      const email = session.user.email ?? "Account";
      const short = email.length > 18 ? `${email.slice(0, 16)}…` : email;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg><span>${short}</span>`;
      btn.setAttribute("data-auth-state", "signed-in");
    } else {
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg><span>Sign In</span>`;
      btn.removeAttribute("data-auth-state");
    }
  } catch {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg><span>Sign In</span>`;
  }
}

async function initAuthState(): Promise<void> {
  pruneStalePasswordRecovery();
  showEl("auth-set-password", false);

  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, "").toLowerCase();

  if (!authReady()) {
    return;
  }

  onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" || (session?.user && isPasswordResetReturn())) {
      openAuthModal("signin");
      showSetPassword();
      return;
    }
    void refreshTopBarAuth();
  });

  await new Promise((r) => setTimeout(r, 50));
  const session = await getSession();

  if ((params.get("reset") === "1" || hash === "auth-recovery") && session?.user) {
    openAuthModal("signin");
    showSetPassword();
  } else if (hash === "signin") {
    openAuthModal("signin");
  } else if (hash === "signup") {
    openAuthModal("signup");
  }

  await refreshTopBarAuth();
}

let authUiReady = false;

export function initAuthUi(): void {
  mountAuthModal();
  if (!authUiReady) {
    bindAuthForms();
    bindAuthTriggers();
    authUiReady = true;
  }
  void initAuthState();
}
