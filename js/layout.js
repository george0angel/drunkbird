import headHtml from "/content/layout/head.html?raw";
import headerHtml from "/content/layout/header.html?raw";
import simulatorHtml from "/content/layout/simulator.html?raw";
import footerHtml from "/content/layout/footer.html?raw";

import faviconUrl from "/assets/favicon.svg?url";
import githubIconUrl from "/assets/GitHub_Invertocat_Black.svg?url";

const head = document.querySelector("#site-head");
if (head) {
  head.insertAdjacentHTML("beforeend", headHtml);
  document.querySelector("#site-favicon").href = faviconUrl;
}

const header = document.querySelector("#site-header");
if (header) header.insertAdjacentHTML("beforeend", headerHtml);

const simulator = document.querySelector("#site-simulator");
if (simulator) {
  simulator.insertAdjacentHTML("beforeend", simulatorHtml);
  if (document.querySelector("#process-type").value === `rw`) {
    document.querySelector("#duration").value = 1000;
    document.querySelector("#branching-rate").value = 0.003;
  }
}

const footer = document.querySelector("#site-footer");
if (footer) footer.insertAdjacentHTML("beforeend", footerHtml);

document.querySelector("#github-icon").src = githubIconUrl;

document.body.style.opacity = 1;

document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown[open]").forEach((dropdown) => {
      dropdown.removeAttribute("open");
    });
  }
});
