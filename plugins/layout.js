import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { parseHTML } from "linkedom";

import { renderMarkdown } from "./markdown.js";

export function layoutPlugin() {
  let base;
  let contentPath;

  return {
    name: "layout",

    configResolved(config) {
      base = config.base;
      contentPath = resolve(process.cwd(), "content");
    },

    configureServer(server) {
      server.watcher.on("all", (event, file) => {
        if (
          ["add", "change", "unlink"].includes(event) &&
          file.startsWith(`${contentPath}${sep}`)
        ) {
          server.ws.send({ type: "full-reload" });
        }
      });
    },

    transformIndexHtml: {
      order: "pre",

      async handler(html) {
        const { document } = parseHTML(html);

        const originalPageTitle = document.querySelector("#site-head > title");
        const hadOriginalPageTitle = originalPageTitle !== null;
        const pageTitle = originalPageTitle?.textContent.trim() ?? "";
        originalPageTitle?.remove();

        const [headHtml, headerHtml, simulatorHtml, footerHtml] =
          await Promise.all([
            readFile(resolve(contentPath, "layout/head.html"), "utf8"),
            readFile(resolve(contentPath, "layout/header.html"), "utf8"),
            readFile(resolve(contentPath, "layout/simulator.html"), "utf8"),
            readFile(resolve(contentPath, "layout/footer.html"), "utf8"),
          ]);

        const head = document.querySelector("#site-head");
        if (head) head.insertAdjacentHTML("beforeend", headHtml);

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

        for (const markdownContent of document.querySelectorAll("md-content")) {
          const src = markdownContent.getAttribute("src");
          const markdown = await readFile(
            resolve(contentPath, src.replace(/^\/+/, "")),
            "utf8",
          );

          markdownContent.innerHTML = await renderMarkdown(markdown);
        }

        document.querySelectorAll("a[href], area[href]").forEach((link) => {
          const href = link.getAttribute("href");
          if (href.startsWith("/") && !href.startsWith("//")) {
            link.setAttribute("href", `${base}${href.slice(1)}`);
          }
        });

        const title = document.querySelector("#site-head > title");
        const headTitle = title?.textContent.trim() ?? "";

        const heading =
          document
            .querySelector(
              "main h1, main h2, main h3, main h4, main h5, main h6",
            )
            ?.textContent.trim() ?? "";

        if (title) {
          const prefix = hadOriginalPageTitle ? pageTitle : heading;
          title.textContent = prefix ? `${prefix} | ${headTitle}` : headTitle;
        }

        return document.toString();
      },
    },
  };
}
