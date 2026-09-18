import MarkdownIt from "markdown-it";
import { katex } from "@mdit/plugin-katex";
import { container } from "@mdit/plugin-container";
import { footnote } from "@mdit/plugin-footnote";
import tikzjax from "node-tikzjax";

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

        const heading = md.renderInline(
          label === "" ? title : `${label}${title ? ` (${title})` : ""}`,
        );

        if (collapsible) {
          return `
            <details class="md-content-box md-content-box--${name}"${open ? " open" : ""}>
              <summary class="md-content-box__title">
                ${heading}
              </summary>
          `;
        }

        return `
          <aside class="md-content-box md-content-box--${name}">
            ${
              heading
                ? `<div class="md-content-box__title">
                     ${heading}
                   </div>`
                : ""
            }
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

addBox("blue", "");
addBox("def", "Definition");
addBox("definition", "Definition");
addBox("keypoint", "Key Point");
addBox("sum", "Summary");
addBox("summary", "Summary");

addBox("purple", "");
addBox("thm", "Theorem");
addBox("theorem", "Theorem");

addBox("red", "");
addBox("warn", "Warning");
addBox("warning", "Warning");
addBox("pitfall", "Common Pitfall");

addBox("green", "");
addBox("pf", "Proof");
addBox("proof", "Proof");

addBox("orange", "");
addBox("exercise", "Exercise");
addBox("tryit", "Try it Yourself");

addBox("yellow", "");
addBox("intuition", "Intuition");
addBox("insight", "Insight");

addBox("cyan", "");
addBox("ex", "Example");
addBox("example", "Example");

addBox("magenta", "");
addBox("deeper", "Deeper Reading");

addBox("white", "");
addBox("sources", "Sources");
addBox("refs", "Reference Texts");
addBox("references", "Reference Texts");

addBox("grey", "");
addBox("gray", "");
addBox("rem", "Remark");
addBox("remark", "Remark");
addBox("note", "Note");
addBox("hist", "History");
addBox("history", "History");

const originalFence = md.renderer.rules.fence;

md.renderer.rules.fence = (tokens, index, options, env, self) => {
  const token = tokens[index];

  if (token.info.trim() === "tikz") {
    const id = env.tikz.length;
    env.tikz.push(token.content);
    return `<!--2gSl6P8p:${id}-->`;
  }

  return originalFence(tokens, index, options, env, self);
};

let tikzQueue = Promise.resolve();
const tikzCache = new Map();

function renderTikz(source) {
  if (tikzCache.has(source)) {
    return tikzCache.get(source);
  }

  const result = tikzQueue.then(() =>
    tikzjax.default(`\\begin{document}
               ${source}
             \\end{document}`),
  );

  tikzQueue = result.catch(() => {});
  tikzCache.set(source, result);

  result.catch(() => {
    tikzCache.delete(source);
  });

  return result;
}

// Scale is such that TikZ maths is the same size and KaTeX maths.
function scaleSvg(svg, scale = 1.452) {
  return svg
    .replace(/width="([\d.]+)"/, (_, width) => `width="${width * scale}"`)
    .replace(/height="([\d.]+)"/, (_, height) => `height="${height * scale}"`);
}

export async function renderMarkdown(source) {
  const env = { tikz: [] };

  let html = md.render(source, env);

  for (const [i, tikzItem] of env.tikz.entries()) {
    try {
      const svg = scaleSvg(await renderTikz(tikzItem));
      html = html.replace(
        `<!--2gSl6P8p:${i}-->`,
        `<div class="tikz">${svg}</div>`,
      );
    } catch (error) {
      html = html.replace(
        `<!--2gSl6P8p:${i}-->`,
        `<pre class="tikz-fail"><div>ERROR:</div>${md.utils.escapeHtml(env.tikz[i])}</pre>`,
      );
    }
  }
  return html;
}
