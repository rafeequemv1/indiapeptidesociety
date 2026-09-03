import { injectLayout } from "./layout";
import { loadContent, newId, saveContent } from "./data/store";
import { initMobileMenu, initNewsletterForm } from "./shared";

const MEMBERSHIP_FEES: Record<string, number> = {
  Student: 1000,
  "Life Academia": 5000,
  "Life Corporate": 7500,
};

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function openMembershipModal(): void {
  const modal = document.getElementById("membership-modal");
  if (!modal) return;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("membership-modal-open");
}

function closeMembershipModal(): void {
  const modal = document.getElementById("membership-modal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("membership-modal-open");
}

function resetMembershipModal(): void {
  const form = document.getElementById("membership-form") as HTMLFormElement | null;
  const success = document.getElementById("membership-success");
  if (form) {
    form.reset();
    form.hidden = false;
  }
  if (success) success.hidden = true;
  updateMembershipFeeSummary();
}

function updateMembershipFeeSummary(): void {
  const category = (document.getElementById("mem-category") as HTMLSelectElement | null)?.value ?? "";
  const summary = document.getElementById("mem-fee-summary");
  const amountEl = document.getElementById("mem-fee-amount");
  if (!summary || !amountEl) return;

  const fee = MEMBERSHIP_FEES[category];
  if (!fee) {
    summary.hidden = true;
    return;
  }
  summary.hidden = false;
  amountEl.textContent = formatInr(fee);
}

function bindMembershipModal(): void {
  document.getElementById("open-membership-modal")?.addEventListener("click", () => {
    resetMembershipModal();
    openMembershipModal();
  });
  document.getElementById("open-membership-modal-cta")?.addEventListener("click", () => {
    resetMembershipModal();
    openMembershipModal();
  });

  document.querySelectorAll("[data-membership-close]").forEach((el) => {
    el.addEventListener("click", () => closeMembershipModal());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !document.getElementById("membership-modal")?.hidden) {
      closeMembershipModal();
    }
  });
}

function bindMembershipForm(): void {
  const form = document.getElementById("membership-form") as HTMLFormElement | null;
  const success = document.getElementById("membership-success");
  const successMsg = document.getElementById("membership-success-msg");
  if (!form || !success) return;

  document.getElementById("mem-category")?.addEventListener("change", updateMembershipFeeSummary);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const affiliation = String(data.get("affiliation") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    const category = String(data.get("category") ?? "").trim();
    if (!name || !email || !phone || !affiliation || !category) return;

    const amountDue = MEMBERSHIP_FEES[category];
    const content = loadContent();
    content.membershipApplications.unshift({
      id: newId(),
      name,
      email,
      phone,
      affiliation,
      city: city || undefined,
      category,
      submittedAt: new Date().toISOString(),
      paymentStatus: "pending",
      amountDue,
      amountLabel: amountDue ? `${category} — ${formatInr(amountDue)}` : category,
    });
    saveContent(content);

    form.hidden = true;
    success.hidden = false;
    if (successMsg) {
      successMsg.textContent = amountDue
        ? `Thank you, ${name}. Your ${category} application is recorded (${formatInr(amountDue)}). Razorpay payment will be connected soon.`
        : `Thank you, ${name}. Your ${category} application is recorded.`;
    }
  });
}

injectLayout("membership");
initMobileMenu();
initNewsletterForm();
bindMembershipModal();
bindMembershipForm();
