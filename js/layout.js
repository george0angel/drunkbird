import headHtml from "/content/layout/head.html?raw";
import headerHtml from "/content/layout/header.html?raw";
import footerHtml from "/content/layout/footer.html?raw";

document.querySelector("#site-head").insertAdjacentHTML("beforeend", headHtml);

document
  .querySelector("#site-header")
  .insertAdjacentHTML("beforeend", headerHtml);

document
  .querySelector("#site-footer")
  .insertAdjacentHTML("beforeend", footerHtml);

document.body.style.opacity = 1;
