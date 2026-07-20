/**
 * Sends a Supabase password-recovery email.
 * Usage: node scripts/send-password-reset.mjs rafeequemavoor@gmail.com
 * Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env (never prints keys).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(path) {
  const out = {};
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return out;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
  }
  return out;
}

const email = process.argv[2] || "rafeequemavoor@gmail.com";
const env = loadEnv(resolve(process.cwd(), ".env"));
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const redirectTo = process.env.RESET_REDIRECT || "http://localhost:5173/dashboard.html?reset=1";

const res = await fetch(`${url}/auth/v1/recover`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, redirect_to: redirectTo }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`Failed (${res.status}): ${body || res.statusText}`);
  process.exit(1);
}

console.log(`Password reset email requested for ${email}`);
console.log(`Redirect after click: ${redirectTo}`);
console.log("Check inbox (and spam).");
