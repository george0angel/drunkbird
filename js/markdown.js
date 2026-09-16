import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";
import { container } from "@mdit/plugin-container";
import { footnote } from "@mdit/plugin-footnote";
import DOMPurify from "dompurify";

import "katex/dist/katex.min.css";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

md.use(katex, {
  throwOnError: false,
  macros: {
    // Probability
    "\\prob": "\\mathbb{P}\\left( #1 \\right)",
    "\\qprob": "\\mathbb{Q}\\left( #1 \\right)",
    "\\Exp": "\\mathbb{E}\\left[ #1 \\right]",
    "\\qExp": "\\mathbb{Q}\\left[ #1 \\right]",
    "\\condprob": "\\mathbb{P}\\left( #1 \\middle| #2 \\right)",
    "\\condExp": "\\mathbb{E}\\left[ #1 \\middle| #2 \\right]",
    "\\indicator": "\\mathbf{1}_{\\left\\{ #1 \\right\\}}",

    // Convex hull
    "\\Hull": "\\mathcal{H}",
    "\\perim": "\\operatorname{perim}",
    "\\unitball": "\\mathcal{S}^{d-1}",
    "\\unitballtwo": "\\mathcal{S}^{1}",
    "\\conv": "\\operatorname{conv}",
    "\\M": "M^\\Theta_t",
    "\\mtilde": "\\widetilde{M}^\\Theta_t",
    "\\malpha": "\\widetilde{M}^\\alpha_t",

    // BBM
    "\\N": "\\mathcal{N}",

    // Left-right
    "\\bracket": "\\left( #1 \\right)",
    "\\curly": "\\left\\{ #1 \\right\\}",
    "\\rect": "\\left[ #1 \\right]",
    "\\inner": "\\left\\langle #1, #2 \\right\\rangle",
    "\\ceiling": "\\left\\lceil #1 \\right\\rceil",
    "\\floor": "\\left\\lfloor #1 \\right\\rfloor",

    // Miscellaneous
    "\\as": "\\;\\text{ as }\\;",
    "\\andtext": "\\;\\text{ and }\\;",
    "\\real": "\\mathbb{R}",
  },
}).use(footnote);

function addBox(name, label) {
  function registerBox(containerName, collapsible, open) {
    md.use(container, {
      name: containerName,

      openRenderer(tokens, index) {
        const info = tokens[index].info.trim();

        const title = info.slice(containerName.length).trim();

        const heading =
          label === "" ? title : `${label}${title ? ` (${title})` : ""}`;

        if (collapsible) {
          return `
            <details class="md-content-box md-content-box--${name}"${open ? "open" : ""}>
              <summary class="md-content-box__title">
                ${heading}
              </summary>
          `;
        }

        return `
          <aside class="md-content-box md-content-box--${name}">
            <div class="md-content-box__title">
              ${heading}
            </div>
        `;
      },

      closeRenderer() {
        return collapsible ? "</details>\n" : "</aside>\n";
      },
    });
  }

  registerBox(name, false, false);
  registerBox(`${name}-`, true, false);
  registerBox(`${name}+`, true, true);
}

addBox(`blue`, ``);
addBox(`def`, `Definition`);
addBox(`definition`, `Definition`);
addBox(`keypoint`, `Key Point`);
addBox(`sum`, `Summary`);
addBox(`summary`, `Summary`);

addBox(`purple`, ``);
addBox(`thm`, `Theorem`);
addBox(`theorem`, `Theorem`);

addBox(`red`, ``);
addBox(`warn`, `Warning`);
addBox(`warning`, `Warning`);
addBox(`pitfall`, `Common Pitfall`);

addBox(`green`, ``);
addBox(`pf`, `Proof`);
addBox(`proof`, `Proof`);

addBox(`orange`, ``);
addBox(`exercise`, `Exercise`);
addBox(`tryit`, `Try it Yourself`);

addBox(`yellow`, ``);
addBox(`intuition`, `Intuition`);
addBox(`insight`, `Insight`);

addBox(`cyan`, ``);
addBox(`ex`, `Example`);
addBox(`example`, `Example`);

addBox(`magenta`, ``);
addBox(`deeper`, `Deeper Reading`);

addBox(`white`, ``);
addBox(`sources`, `Sources`);
addBox(`refs`, `Reference Texts`);
addBox(`references`, `Reference Texts`);

addBox(`grey`, ``);
addBox(`gray`, ``);
addBox(`rem`, `Remark`);
addBox(`remark`, `Remark`);
addBox(`note`, `Note`);
addBox(`hist`, `History`);
addBox(`history`, `History`);

const mdFiles = import.meta.glob(`/content/**/*.md`, {
  query: `?raw`,
  import: `default`,
});

class MarkdownContent extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute(`src`);
    const markdown = await mdFiles[`/content/${src}`]();
    this.innerHTML = DOMPurify.sanitize(md.render(markdown));
    this.querySelectorAll(`.footnote-ref a, .footnote-backref`).forEach(
      (footnote) => {
        const link = footnote.getAttribute(`href`);
        if (link?.startsWith(`#`)) {
          footnote.setAttribute(`href`, `${window.location.pathname}${link}`);
        }
      },
    );
  }
}

customElements.define(`md-content`, MarkdownContent);
