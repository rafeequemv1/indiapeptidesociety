import { loadContent } from "./data/store";
import { injectLayout } from "./layout";
import { renderEventCard } from "./render/events";
import { initMobileMenu, initNewsletterForm } from "./shared";

type TabId = "upcoming" | "past" | "student";

function initEventsPage(): void {
  const data = loadContent();
  const tabs = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const panels: Record<TabId, HTMLElement | null> = {
    upcoming: document.getElementById("panel-upcoming"),
    past: document.getElementById("panel-past"),
    student: document.getElementById("panel-student"),
  };

  const grids: Record<TabId, HTMLElement | null> = {
    upcoming: document.getElementById("upcoming-grid"),
    past: document.getElementById("past-grid"),
    student: document.getElementById("student-grid"),
  };

  if (grids.upcoming) {
    grids.upcoming.innerHTML = data.upcomingSymposia
      .map((e, i) => renderEventCard(e, i === 0))
      .join("");
  }
  if (grids.past) {
    grids.past.innerHTML = data.pastSymposia.map((e) => renderEventCard(e)).join("");
  }
  if (grids.student) {
    grids.student.innerHTML = data.pastStudentSymposia.map((e) => renderEventCard(e)).join("");
  }

  function setTab(tab: TabId): void {
    tabs.forEach((btn) => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });
    (Object.keys(panels) as TabId[]).forEach((key) => {
      if (panels[key]) panels[key]!.hidden = key !== tab;
    });
  }

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab as TabId));
  });

  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get("tab");
  if (tabParam === "past" || tabParam === "student") {
    setTab(tabParam);
  } else {
    setTab("upcoming");
  }
}

injectLayout("events");
initMobileMenu();
initNewsletterForm();
initEventsPage();
