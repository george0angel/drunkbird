import headHtml from "/content/layout/head.html?raw";
import headerHtml from "/content/layout/header.html?raw";
import footerHtml from "/content/layout/footer.html?raw";

import faviconUrl from "/assets/favicon.svg?url";
import githubIconUrl from "/assets/GitHub_Invertocat_Black.svg?url";

document.querySelector("#site-head").insertAdjacentHTML("beforeend", headHtml);
document.querySelector("#site-favicon").href = faviconUrl;

document
  .querySelector("#site-header")
  .insertAdjacentHTML("beforeend", headerHtml);

document
  .querySelector("#site-footer")
  .insertAdjacentHTML("beforeend", footerHtml);
document.querySelector("#github-icon").src = githubIconUrl;

document.body.style.opacity = 1;
