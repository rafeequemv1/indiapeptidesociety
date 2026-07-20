import type { SymposiumRegistration, SymposiumRegistrationConfig } from "../domain/types";
import { escapeHtml } from "../data/store";

export interface ReceiptData {
  registration: SymposiumRegistration;
  event: Pick<SymposiumRegistrationConfig, "title" | "dates" | "venue">;
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildReceiptNumber(reg: SymposiumRegistration): string {
  if (reg.receiptNo) return reg.receiptNo;
  const year = new Date(reg.submittedAt).getFullYear() || new Date().getFullYear();
  const short = reg.id.slice(-6).toUpperCase();
  return `IPS-${year}-${short}`;
}

/** Printable HTML receipt (downloadable). Ready for Razorpay payment id when present. */
export function buildReceiptHtml(data: ReceiptData): string {
  const { registration: r, event } = data;
  const status = r.paymentStatus ?? "pending";
  const statusLabel =
    status === "paid" ? "PAID" : status === "failed" ? "FAILED" : "PAYMENT PENDING";
  const receiptNo = buildReceiptNumber(r);
  const amount = r.amountLabel || "As per symposium fee schedule";
  const paymentId = r.razorpayPaymentId || "— (will appear after Razorpay payment)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt ${escapeHtml(receiptNo)} | Indian Peptide Society</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1a2744; margin: 0; padding: 2rem; background: #faf8f5; }
    .sheet { max-width: 40rem; margin: 0 auto; background: #fff; border: 1px solid #e5e7eb; padding: 2.5rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .org { font-size: 0.85rem; color: #6b7280; margin-bottom: 1.75rem; }
    .status { display: inline-block; font-family: system-ui, sans-serif; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; padding: 0.35rem 0.65rem; border-radius: 2px; margin-bottom: 1.5rem; }
    .status--paid { background: #dcfce7; color: #166534; }
    .status--pending { background: #ffedd5; color: #9a3412; }
    .status--failed { background: #fee2e2; color: #991b1b; }
    table { width: 100%; border-collapse: collapse; font-family: system-ui, sans-serif; font-size: 0.9rem; }
    th, td { text-align: left; padding: 0.55rem 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    th { width: 38%; color: #6b7280; font-weight: 600; }
    .note { margin-top: 1.75rem; font-size: 0.8rem; color: #6b7280; line-height: 1.5; font-family: system-ui, sans-serif; }
    @media print { body { background: #fff; padding: 0; } .sheet { border: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <h1>Payment Receipt</h1>
    <p class="org">Indian Peptide Society · ${escapeHtml(event.title || "Symposium Registration")}</p>
    <span class="status status--${status}">${statusLabel}</span>
    <table>
      <tr><th>Receipt No.</th><td>${escapeHtml(receiptNo)}</td></tr>
      <tr><th>Name</th><td>${escapeHtml(r.name)}</td></tr>
      <tr><th>Email</th><td>${escapeHtml(r.email)}</td></tr>
      <tr><th>Phone</th><td>${escapeHtml(r.phone)}</td></tr>
      <tr><th>Affiliation</th><td>${escapeHtml(r.affiliation)}</td></tr>
      <tr><th>Category</th><td>${escapeHtml(r.category)}</td></tr>
      <tr><th>Event dates</th><td>${escapeHtml(event.dates)}</td></tr>
      <tr><th>Venue</th><td>${escapeHtml(event.venue)}</td></tr>
      <tr><th>Amount</th><td>${escapeHtml(amount)}</td></tr>
      <tr><th>Razorpay Payment ID</th><td>${escapeHtml(paymentId)}</td></tr>
      <tr><th>Registered at</th><td>${escapeHtml(formatWhen(r.submittedAt))}</td></tr>
    </table>
    <p class="note">
      This is an official acknowledgement from the Indian Peptide Society.
      ${
        status === "paid"
          ? "Payment has been confirmed via Razorpay."
          : "Complete payment via the Razorpay link to receive a paid receipt. After payment confirmation, download again for the PAID copy."
      }
      For queries: indianpeptidesociety@gmail.com
    </p>
  </div>
</body>
</html>`;
}

export function downloadReceipt(data: ReceiptData): void {
  const html = buildReceiptHtml(data);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const receiptNo = buildReceiptNumber(data.registration);
  a.href = url;
  a.download = `${receiptNo}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Open receipt in a new tab for print → Save as PDF. */
export function openReceiptForPrint(data: ReceiptData): void {
  const html = buildReceiptHtml(data);
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    downloadReceipt(data);
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  window.setTimeout(() => w.print(), 300);
}
