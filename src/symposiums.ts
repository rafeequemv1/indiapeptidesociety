import { loadContent } from "./data/store";
import { injectLayout } from "./layout";
import { renderEventCard } from "./render/events";
import { initMobileMenu, initNewsletterForm } from "./shared";

function initSymposiumsPage(): void {
  const data = loadContent();

  const upcoming = document.getElementById("symposiums-upcoming");
  const past = document.getElementById("symposiums-past");
  const student = document.getElementById("symposiums-student");

  if (upcoming) {
    upcoming.innerHTML = data.upcomingSymposia.length
      ? data.upcomingSymposia.map((e, i) => renderEventCard(e, i === 0)).join("")
      : `<p class="symposiums-empty">No upcoming symposia announced yet.</p>`;
  }
  if (past) {
    past.innerHTML = data.pastSymposia.length
      ? data.pastSymposia.map((e) => renderEventCard(e)).join("")
      : `<p class="symposiums-empty">Past symposia will appear here.</p>`;
  }
  if (student) {
    student.innerHTML = data.pastStudentSymposia.length
      ? data.pastStudentSymposia.map((e) => renderEventCard(e)).join("")
      : `<p class="symposiums-empty">Student symposia will appear here.</p>`;
  }
}

injectLayout("symposiums");
initMobileMenu();
initNewsletterForm();
initSymposiumsPage();
