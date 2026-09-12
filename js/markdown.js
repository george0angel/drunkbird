import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";
import { container } from "@mdit/plugin-container";

import "katex/dist/katex.min.css";

const md = new MarkdownIt({
  html: false,
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
});

function addBox(name, label) {
  md.use(container, {
    name,

    openRenderer(tokens, index) {
      const info = tokens[index].info.trim();
      const title = md.utils.escapeHtml(info.slice(name.length).trim());

      if (label === ``) {
        return `
          <aside class="md-content-box md-content-box--${name}">
              <div class="md-content-box__title">
                ${label}${title}
              </div>
          `;
      }
      return `
        <aside class="md-content-box md-content-box--${name}">
          <div class="md-content-box__title">
            ${label}${title ? ` (${title})` : ""}
          </div>
        `;
    },

    closeRenderer() {
      return "</aside>\n";
    },
  });
}

addBox(`def`, `Definition`);
addBox(`thm`, `Theorem`);
addBox(`deeper`, `Deeper Reading`);
addBox(`sources`, `Reference Texts`);

addBox(`red`, ``);
addBox(`blue`, ``);
addBox(`purple`, ``);
addBox(`green`, ``);

const mdFiles = import.meta.glob(`/content/**/*.md`, {
  query: `?raw`,
  import: `default`,
});

class MarkdownContent extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute(`src`);
    const markdown = await mdFiles[`/content/${src}`]();
    this.innerHTML = await md.render(markdown);
  }
}

customElements.define(`md-content`, MarkdownContent);
