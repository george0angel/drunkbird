# Markdown Examples

## KaTeX

Inline with custom macros examples:

$\Exp{X}$, $\prob{X > 0}$, $\condprob{A}{B}$, $\indicator{A}$, and $x \in \real$.

Display with custom macros examples:

$$
\condExp{X}{\mathcal F_t}
=
\inner{x}{y}
+
\ceiling{\alpha}
+
\floor{\beta},
$$

and

$$

\Hull = \conv\{x_1,\ldots,x_n\},
\qquad
\perim(\Hull),
\qquad
u \in \unitball.

$$

## Comments

Comment using `<!-- Comment text. -->`. In VS Code, the command `Shift+Alt+A` can be used to comment out selected text or `Ctrl+/` to comment whole lines. Commented text will not be rendered.

<!-- This is commented out. -->

## Boxes

To make a box:

`::: BOX_TYPE/COLOUR TITLE`

`Box text...`

`:::`

::: def Sqaure
(_geometry_) A polygon with ~~three~~ four straight sides of equal length and four right angles; an equilateral rectangle; a regular quadrilateral.
:::

::: orange Title
This is a **orange** box!
:::

### Collapsible

Make collapsible boxes by appending `-` or `+` to the end of the box type/colour. `+` makes a collapsible box that starts open whereas `-` makes one that starts closed.

::: theorem- Closed by default
This uses `theorem-`.
:::

::: yellow+ Open by default
This uses `yellow+`.
:::

### Nested

Add more colons to outer box to nest boxes. For example:

`:::: blue Title`

`Text for outer box.`

`::: ex Title`

`Text for inner box`

`:::`

`::::`

::::: blue Nested Boxes
Outer blue box.

:::: theorem Conditional Expectation
A theorem box nested in blue box.

::: pf
A proof box nested in theorem box.

:::

Back in theorem box.
::::

Back in blue box.
:::::

### Full Box List

::: blue

blue

or

"Definition": def, definition

or

"Key Point": keypoint

or

"Summary": sum, summary

:::

::: purple

purple

or

"Theorem": thm, theorem

:::

::: red

red

or

"Warning": warn, warning

or

"Common Pitfall": pitfall

:::

::: green

green

or

"Proof": pf, proof

:::

::: orange

orange

or

"Exercise": exercise

or

"Try it Yourself": tryit

:::

::: yellow

yellow

or

"Intuition": intuition

or

"Insight": insight

:::

::: cyan

cyan

or

"Example": ex, example

:::

::: magenta

magenta

or

"Deeper Reading": deeper

:::

::: white

white

or

"Sources": sources

or

"Reference Texts": refs, references

:::

::: grey

grey, gray

or

"Remark": rem, remark

or

"Note": note

or

"History": hist, history

:::

## HTML

You can also use html tags. For example `<b>text</b>` could be used to make <b>text</b> bold though it is recommended to use markdown syntax instead where possible.

::: rem Escape Characters
To write some characters you will sometimes need to escape them first with a backslash. For example, to write

'\<', type '\\\<',

'\>', type '\\\>',

'\`', type '\\\`',

'\\' type '\\\\'.

:::

::: warn
Scripts will not be removed.

<!-- The following script will run if uncommented.
<script>
  alert("This script has run.");
</script> -->

:::

## Footnotes

Link to footnote by `[^number]` and then write the footnotes by `[^number]: Footnote text.` Alternatively, write the footnote text inline by `^[Footnote text.]`.

Footnote 1[^1].

Footnote 2[^2].

Footnote 2[^2] again.

Footnote 3^[Text of footnote.].

[^1]: Footnote sentence.

[^2]: Footnote sentence.

    More of the same footnote.

<!-- Notice that leaving a tab space allows a new paragraph to be part of the same footnote. -->

More words.
