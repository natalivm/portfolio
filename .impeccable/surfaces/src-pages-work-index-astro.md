---
version: 1
slug: "src-pages-work-index-astro"
primary_target: "src/pages/work/index.astro"
related_targets: ["src/pages/index.astro","src/pages/work/[slug].astro"]
---

# Surface: portfolio site (home, work index, case studies)

Mode: Experience. Audience: recruiters, studio leads and clients scanning many portfolios fast. Job: see the range at a glance, narrow to one discipline, open a project, return without losing place. Content: placeholder projects only (owner to replace); no invented clients, quotes or metrics. Unresolved: owner's name, positioning, real work.

## Direction contract

THESIS: The index is the portfolio. Every project sits on one calm contact sheet, one step from anywhere; the page refuses the category default of a hero plus a sideways "recent work" carousel that hides everything past the second card.

OWN-WORLD: Reference's calm base, owner's twist. Cool pale-grey ground, white tiles with soft offset shadows, near-black ink, 28px radii, pill controls. Type pinned by owner to match the reference exactly: Apple system stack (SF Pro) with self-hosted Inter fallback, 600 display at -0.03em, 400/500 text. Twist: two-tone headlines (ink, then mid-grey meeting AA) carried onto the work count; tabular numerals everywhere counts and years appear; one ultramarine accent reserved for interactive state (active filter, focus, selection); availability uses a status green, as on the reference. No kickers, no glass decoration, no gradient text.

STORY: Visitor learns who this is in one line, sees how much work exists (the count is always visible), filters to their discipline, opens a case study or a lightbox, and goes back to the exact filter and scroll position.

FIRST VIEWPORT: Home: two-tone headline left over two lines at display scale, "See all N projects" primary pill beneath, availability line; the featured grid starts inside the first viewport (top row visible at 1440x900). Work page: one-line two-tone headline "N projects / newest first" (suffix becomes "in <Discipline>"), filter chip row directly under it, 4-column grid with two full rows (8 tiles) above the fold at 1440x900.

FORM: Pinned by the owner. seed: none (pinned) — "i like the style" (designbymariam.com), "Same calm base, own twist", "Filterable grid", "Mix" (6–8 case studies, rest in a lightbox). Signature interaction: filtering reflows the grid with a view transition while the headline count rolls to the new number ("8 in Packaging"); opening a case study morphs its tile cover into the case-study hero and back (cross-document view transition). Motion grammar: exponential ease-out, 280–420ms, transform/opacity/clip only, all gated by reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
