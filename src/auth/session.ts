import { getSupabaseClient, isSupabaseConfigured } from "../data/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

const RECOVERY_STORAGE_KEY = "ips_password_recovery";

export function authReady(): boolean {
  return isSupabaseConfigured();
}

/** Redirect target after user clicks the reset email link. */
export function passwordResetRedirectUrl(page: "membership" | "dashboard" = "membership"): string {
  const path = page === "dashboard" ? "/dashboard.html" : "/membership.html";
  return `${window.location.origin}${path}?reset=1`;
}

/**
 * Sign up via Edge Function (creates a confirmed user, no confirmation email).
 * Avoids Supabase built-in SMTP rate limits that block /auth/v1/signup.
 * Then signs the user in with the password they just chose.
 */
export async function signUpWithPassword(email: string, password: string, fullName: string) {
  const client = getSupabaseClient();
  const { data: fnData, error: fnError } = await client.functions.invoke("member-signup", {
    body: { email, password, full_name: fullName },
  });

  if (fnError) {
    let message = fnError.message || "Could not create account";
    try {
      const ctx = (fnError as { context?: Response }).context;
      if (ctx) {
        const payload = (await ctx.json()) as { error?: string };
        if (payload?.error) message = payload.error;
      }
    } catch {
      /* keep default message */
    }
    if (/rate limit|over_email/i.test(message)) {
      message =
        "Email sending is temporarily limited by the provider. Sign up no longer needs email confirmation — please try again.";
    }
    return { data: { user: null, session: null }, error: { message } };
  }

  if (fnData?.error) {
    return { data: { user: null, session: null }, error: { message: String(fnData.error) } };
  }

  // Immediately sign in — account is already confirmed
  return client.auth.signInWithPassword({ email, password });
}

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.app_metadata?.role === "admin";
}

function urlLooksLikeRecoveryReturn(): boolean {
  const q = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (
    q.get("reset") === "1" ||
    q.get("type") === "recovery" ||
    hash.get("type") === "recovery" ||
    Boolean(q.get("code") && q.get("reset") === "1")
  );
}

/**
 * Drop stale recovery flags from earlier visits.
 * Keep the flag only when the URL itself is a reset-email return.
 */
export function pruneStalePasswordRecovery(): void {
  if (!urlLooksLikeRecoveryReturn()) {
    sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
  }
}

/** True when this page load came from a password-reset email link. */
export function isPasswordResetReturn(): boolean {
  return (
    urlLooksLikeRecoveryReturn() || sessionStorage.getItem(RECOVERY_STORAGE_KEY) === "1"
  );
}

export function markPasswordRecovery(): void {
  sessionStorage.setItem(RECOVERY_STORAGE_KEY, "1");
}

export function clearPasswordRecovery(): void {
  sessionStorage.removeItem(RECOVERY_STORAGE_KEY);
  const url = new URL(window.location.href);
  url.searchParams.delete("reset");
  url.searchParams.delete("code");
  url.searchParams.delete("type");
  const clean = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams}` : ""}`;
  window.history.replaceState({}, "", clean);
}

export async function getSession(): Promise<Session | null> {
  if (!authReady()) return null;
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) {
    console.error(error);
    return null;
  }
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function signInWithPassword(email: string, password: string) {
  return getSupabaseClient().auth.signInWithPassword({ email, password });
}

export async function signOut() {
  clearPasswordRecovery();
  return getSupabaseClient().auth.signOut();
}

export async function requestPasswordReset(email: string, redirectTo?: string) {
  return getSupabaseClient().auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || passwordResetRedirectUrl(),
  });
}

export async function updatePassword(password: string) {
  return getSupabaseClient().auth.updateUser({ password });
}

export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void,
) {
  if (!authReady()) return { data: { subscription: { unsubscribe() {} } } };
  return getSupabaseClient().auth.onAuthStateChange(callback);
}
