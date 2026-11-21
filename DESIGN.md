---
name: Portfolio
description: A calm, filterable contact sheet of one designer's whole body of work.
colors:
  ground: "#f2f3f5"
  surface: "#ffffff"
  surface-sunken: "#e8eaee"
  ink: "#16171a"
  ink-secondary: "#5d6169"
  ink-quiet: "#767a82"
  hairline: "#dcdfe4"
  ultramarine: "#3346d3"
  ultramarine-ink: "#ffffff"
  ultramarine-wash: "#e3e6fb"
  control-ink: "#16171a"
  control-ink-text: "#ffffff"
  status-green: "#1f9d55"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6.4vw, 5.6rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter Variable', system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter Variable', system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter Variable', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter Variable', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: "tnum"
  meta:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter Variable', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
rounded:
  lg: "28px"
  md: "20px"
  sm: "12px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  max-width: "1320px"
  tile-inset: "8px"
  grid-gap: "clamp(12px, 1.6vw, 20px)"
  section: "clamp(96px, 11vw, 152px)"
  control-height: "44px"
components:
  pill-dark:
    backgroundColor: "{colors.control-ink}"
    textColor: "{colors.control-ink-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "{spacing.control-height}"
  pill-dark-hover:
    backgroundColor: "#2c2e33"
  pill-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 1.25rem"
    height: "{spacing.control-height}"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "{spacing.control-height}"
  chip-active:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.ultramarine-ink}"
  tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.tile-inset}"
  tile-frame:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "{rounded.md}"
  count-badge:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "1px 7px"
  count-badge-current:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.ultramarine-ink}"
  round-button:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    size: "44px"
  round-button-hover:
    backgroundColor: "{colors.control-ink}"
    textColor: "{colors.control-ink-text}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
---

# Design System: Portfolio

## Overview

**Creative North Star: "The Contact Sheet"**

The whole body of work is laid out on one calm sheet: white tiles resting on a cool pale-grey ground, every project one step away, the count of projects always in view. The system borrows a quiet, Apple-adjacent register (system type, soft depth, generous radii, pill controls) and gives it one owned detail: two-tone headlines that set a statement in ink and finish it in a quieter grey, carried onto the live project count ("30 projects newest first", "8 projects in Packaging").

Density is moderate and even. Grids are uniform, tiles are identical in anatomy, and colour on the page comes almost entirely from the project imagery inside the tiles; the chrome around it stays neutral so the work leads. A single ultramarine is reserved for interactive state, and a single status green marks availability. Motion is short, exponential ease-out, and spatial: filtering reflows the grid through a view transition while the headline count rolls, and opening a case study morphs the tile cover into the case-study hero.

The confirmed rejections from the direction: no kickers or eyebrows above headings, no glass used as decoration, no gradient text.

**Key Characteristics:**
- Cool pale-grey ground, white tiles, near-black ink.
- Generous radii (28px tiles, 20px image frames) and fully round pill controls.
- Two-tone headlines: ink line, then a quieter grey line.
- Tabular numerals wherever counts and years appear.
- One ultramarine accent, for state only; one status green, for availability only.
- Soft, diffuse, ink-tinted shadows; lift on hover.
- Exponential ease-out motion through view transitions, all gated by reduced motion.

## Colors

A cool, near-monochrome neutral field with one saturated ultramarine held back for state.

### Primary
- **Signal Ultramarine** (`ultramarine`): Interactive state and nothing else: the active filter chip, the checked switch track, the current-page count badge in the nav, the focus ring (2px, 3px offset), and text selection. Its wash (`ultramarine-wash`) backs the selected row in the quick-jump list. Text on it is white (`ultramarine-ink`).

### Tertiary
- **Availability Green** (`status-green`): The availability dot (8px, with a slow ping ring) beside the availability line on the home hero. Status meaning only.

### Neutral
- **Cool Paper Ground** (`ground`): The page background and the sticky header's translucent fill; also the browser theme colour.
- **Tile White** (`surface`): Tiles, pills-light, chips at rest, dialogs, round buttons, the search trigger.
- **Sunken Grey** (`surface-sunken`): Image-frame backing inside tiles, count badges, `kbd` keys, the sample-content strip, placeholder image slots.
- **Near-Black Ink** (`ink`): Primary text and headline ink lines.
- **Secondary Grey** (`ink-secondary`): Supporting text: tile meta, intros, notes, inactive nav, definition-list terms, footer links. Meets AA on both ground (5.6:1) and white (6.3:1).
- **Quiet Grey** (`ink-quiet`): The second, quieter line of two-tone headlines and the work-page count suffix. 3.9:1 on ground, so large display text only.
- **Hairline** (`hairline`): 1px borders on chips, round buttons and the search trigger; rules between definition-list rows, discipline rows and the footer.
- **Control Ink** (`control-ink` / `control-ink-text`): Inverted controls (dark pill, monogram, skip link, the "view all" tile, hover state of round buttons). Kept as its own token, separate from `ink`, so a future dark surface never inherits it.

### Named Rules
**The State-Only Rule.** Ultramarine appears only where something is selected, current, focused or checked. It is never a decorative fill, a link colour at rest, or a brand flourish. Primary actions are dark pills, not ultramarine.

**The Status Is Green Rule.** Availability is signalled with status green, never with the accent, so "available" never reads as "selected".

**The Work Brings The Colour Rule.** The chrome stays neutral; saturated colour on the page belongs to project imagery inside tile frames.

## Typography

**Display Font:** SF Pro Display via the Apple system stack (with self-hosted Inter Variable, then system-ui)
**Body Font:** SF Pro Text via the Apple system stack (with self-hosted Inter Variable, then system-ui)

**Character:** Clean, neutral, slightly tight at display sizes; confident through weight 600 and negative tracking rather than through a distinctive face.

This pairing is a brand commitment, not a free choice: the owner pinned it to match the reference site exactly. SF Pro on Apple devices, Inter (self-hosted, optical-size axis) elsewhere, weights 400, 500 and 600 only. Do not substitute another family.

### Hierarchy
- **Display** (600, clamp(2.6rem, 6.4vw, 5.6rem) by default, 1.04, -0.03em): Page headlines. Pages tune the clamp (home hero to 4.5rem, work head to 4rem, contact to 4.8rem); weight, tracking and leading stay fixed. Balanced wrapping.
- **Headline** (600, clamp(2rem, 4vw, 3.4rem), 1.04, -0.03em): Section heads ("Selected work", "What I do", "About"). Also two-tone when a second line is present.
- **Title** (600, 1.125rem, 1.2, -0.02em): Tile titles; large tiles step up to clamp(1.25rem, 1.6vw, 1.5rem). Case-study section heads, pager titles and discipline names sit between title and headline at 600 with -0.025 to -0.03em.
- **Body** (400, 1rem, 1.55): Running text, measured at 52 to 64ch; intros and case-study paragraphs run 1.0625 to 1.1875rem. Pretty wrapping.
- **Label** (600, 0.9375rem): Pills, chips, switch labels, back links. Counts inside chips drop to 500 in secondary grey.
- **Meta** (400, 0.875rem): Tile discipline and year lines, pager direction, hints. Count badges and the tile "kind" tag go to 0.75rem at 600.

### Named Rules
**The Two-Tone Rule.** A headline may carry a second, quieter line in `ink-quiet` (as a block line, or inline as the work-page suffix). The ink part states; the quiet part qualifies. Only at headline or display size, never on body text, because the quiet grey only meets AA as large text.

**The Tabular Count Rule.** Numerals are tabular site-wide (`font-variant-numeric: tabular-nums` on body). Counts are always visible: in the nav badge, every chip, the work headline, the "view all" tile and the case-study position.

**The Three Weights Rule.** 400 for reading, 500 for navigation and secondary counts, 600 for headings and controls. Nothing heavier.

## Layout

A centred container (max 1320px) with a fluid gutter of clamp(16px, 4vw, 56px). Grids are uniform and gap between 12px and 20px (clamp(12px, 1.6vw, 20px); the work index uses 1.4vw).

- **Work index:** 4 columns, stepping to 3 under 1180px and 2 under 860px. Two full rows sit above the fold at 1440x900. Under 560px tiles tighten (5px inset, 20px radius) and the filter chips become a single horizontally scrolling row that bleeds to the screen edge.
- **Home featured grid:** 12-column; the two newest projects span 6, the rest span 4, and a dark "view all" tile spans 8, holding a 6-column contact sheet of thumbnails and the total count. A project with a live prototype takes one 4-column slot two rows tall: the same tile anatomy (8px inset, 20px frame, title, meta), with the running prototype as its cover and one line of description under the title. The prototype stays interactive; the text block is the link to the case study. The UX laws page closes the grid as a full-width tile (every breakpoint, so the project rows above stay whole): the same tile anatomy, its cover a strip of real Do / Don't pairs from the page drawn at half size (three on desktop, two on tablet, one on phone), title "UX laws", meta "Design psychology · 10 groups" and "100 laws", and a "Reference" pill on hover.
- **Case study:** a 1.7fr / 1fr intro (headline left, facts list right), a full-width 16:9 hero, story sections in a 1fr / 2fr label-and-text split, a 2-column gallery, a 2-column previous/next pager and a 3-column related row; all collapse to one column on small screens.
- **Case study with figures (Next Games):** each section keeps the 1fr / 2fr head (title left, text right) and follows it with full-width figures. A figure is a white tile (28px, 8px inset) holding a 20px frame in the project's own colour; project UI and its colours stay inside that frame, and the chrome around it (captions, rules, status marks, the flow diagram) stays neutral. Lists that are not imagery (stories, drivers, questions) are hairline-ruled rows, not tiles. Figures animate only while on screen, on the one ease-out curve, and hold a complete state under reduced motion.
- **UX laws page (`/ux-laws/`):** a reference of 100 laws in ten groups. The header repeats the work page's signature: a two-tone count headline ("100 laws of design psychology, / each with a do and a don’t", becoming "10 laws / in Economics" or "3 laws / matching “…”" when filtered), group chips and a search field. On desktop the filter bar sticks under the site header and its chip row scrolls sideways with a faded edge; on phones it scrolls away with the page. Each law is a hairline-ruled row: name, summary and "In practice" points on the left (1fr), and on the right (1.75fr) one white tile holding a Do frame (mint, #e7f5ed) and a Don't frame (pink, #fcebee), each labelled with a small white pill and captioned under the frame. Rows stack under 1080px; the two frames stack under 640px.
- **Vertical rhythm:** sections are separated by clamp(96px, 11vw, 152px); the contact block and footer get slightly more (up to 176px and 160px).
- **Header:** sticky, 72px tall (64px under 720px); labels for search and contact collapse to 44px icon buttons on small screens.
- **Touch targets:** every control is at least 44px tall.

## Elevation & Depth

Depth is soft and lifted, never hard. Tiles and light controls rest on a two-layer shadow: a tight 1px contact shadow plus a long, diffuse, slightly blue-tinted falloff below. Hover answers with a deeper version of the same shadow and a small upward translate. Dialogs (lightbox, quick-jump) cast a single large, very soft shadow over a dimmed, lightly blurred backdrop. Flat surfaces (chips, round buttons on the work page, the search trigger) separate with a 1px hairline instead of a shadow.

### Shadow Vocabulary
- **Tile rest** (`box-shadow: 0 1px 2px rgb(22 23 26 / 0.05), 0 10px 28px -14px rgb(31 38 72 / 0.22)`): Tiles, light pills, back link, pager cards, case-study hero frame, discipline arrows.
- **Lift** (`box-shadow: 0 2px 4px rgb(22 23 26 / 0.06), 0 22px 44px -18px rgb(31 38 72 / 0.32)`): Hover state of anything that rests on Tile rest.
- **Dialog** (`box-shadow: 0 40px 100px -30px rgb(16 18 40 / 0.55)`): The project lightbox. The quick-jump palette uses a slightly lighter variant (`0 30px 80px -20px rgb(16 18 40 / 0.45)`).

### Named Rules
**The Lift Rule.** Elevation changes only in response to hover: a resting tile lifts 4px (pager cards 3px) and moves from Tile rest to Lift; the cover inside scales to 1.03. Press scales down slightly (0.97 for pills, 0.99 for tiles).

**The Functional Blur Rule.** Backdrop blur exists only where content scrolls beneath chrome (the sticky header, 18px) or behind a modal (6px). It is never applied to tiles or cards as decoration.

## Shapes

Generous, consistent rounding with nested radii: the outer tile is 28px, the image frame inside it is 20px, and the 8px inset between them makes the curves read as concentric. Small screens step each level down one (tile 20px, frame 15px). Controls are fully round: pills, chips, count badges, switches, and 44px circular icon buttons. Quick-jump rows use the 12px radius; tiny elements (`kbd`, inline code, focus-ring corners) use 6px. Image covers are always cropped, never stretched: 4:3 in tiles, 16:9 as the case-study hero, 1:1 in thumbnails.

## Components

### Buttons
Calm, solid, round.
- **Shape:** fully round pill (999px), 44px tall, 0 1.25rem padding.
- **Primary (dark pill):** control ink with white text; may end in a small circular arrow chip (1.75rem, inverted colours) that tucks into the right edge. Hover lightens the fill slightly.
- **Secondary (light pill):** white with ink text on Tile rest shadow; hover moves to Lift.
- **Round icon button:** 44px circle, white, hairline border (or Tile rest shadow on case-study pages); hover inverts to control ink.
- **Press:** scale 0.97, 180ms ease-out.

### Chips
- **Style:** white, 1px hairline border, ink label at 600 with the count beside it at 500 in secondary grey.
- **State:** the active filter fills ultramarine with white text and a pale lavender count. Hover darkens the border only. Arrow keys move between chips.

### Switch
- **Style:** 40x24 pill track in light grey with an 18px white knob; checked fills ultramarine and slides the knob 16px. Focus ring sits on the track.

### Cards / Containers (Project Tile)
- **Corner Style:** 28px outer, 20px image frame.
- **Background:** white tile; sunken grey behind the cover.
- **Shadow Strategy:** Tile rest, Lift on hover (see Elevation & Depth).
- **Border:** none.
- **Internal Padding:** 8px around the cover; 14px 12px 10px around the text.
- **Anatomy:** cover, title, then a meta line with disciplines (joined by a middle dot) left and the year right. A small white pill naming the depth ("Case study" or "Quick view") fades in at the cover's top-left on hover and focus. Case-study tiles link to their page; the rest open the lightbox.

### Inputs / Fields
- **Search trigger:** a white pill with hairline border, search icon, "Find a project" in secondary grey and a `kbd` hint (⌘K or Ctrl K). Hover darkens border and text.
- **Quick-jump field:** a borderless 1.0625rem input at 500 inside the palette; the selected result row takes the ultramarine wash with a deep ultramarine title.

### Navigation
- **Style:** monogram circle (36px, control ink) plus name at 600; nav links at 500 in secondary grey, ink on hover and when current.
- **Count badge:** "Work" carries the project count in a sunken-grey pill; on the current page it fills ultramarine.
- **Mobile:** About hides; search and contact collapse to 44px icon buttons.

### Dialogs (Lightbox and Quick Jump)
- **Lightbox:** up to 1100px, 28px radius, Dialog shadow; cover left (1.55fr), details right (title, facts rows on hairlines, summary, optional case-study pill, previous/next with "n of N"). Stacks on small screens. Enters with a 12px rise and slight scale over 320ms.
- **Quick jump:** 640px command palette, 20px radius, keyboard-first (arrows, Enter, Esc hints shown).

### Signature: Two-Tone Count Headline
The work-page headline is the live count: "N projects" in ink, then "newest first" or "in <Discipline>" in quiet grey. Filtering rolls the number to its new value over 420ms (quartic ease-out) while the grid reflows through a view transition (tiles leave at 200ms, enter at 320ms, scaling from 0.94). The result is announced politely to screen readers.

### Signature: View-All Contact Sheet
On the home page, a dark control-ink tile spans the remaining width, filled with a grid of small square thumbnails and the total project count at display scale. It is the bridge from the curated selection to the full sheet.

### Imagery
Project covers come from real project imagery supplied by the owner. The geometric SVG posters currently drawn by the cover component are temporary sample art standing in until that imagery arrives; they are not part of the visual system and set no rules for illustration, palette or composition.

### UX law mockups
The Do / Don't examples are small interfaces drawn in HTML from one kit (`src/styles/ux-kit.css`, classes `mk-*`, icons in `src/components/ux/MkIcon.astro`), one component per law in `src/components/ux/examples/<slug>.astro`. They are imagery, like project art inside a tile frame: they keep their own neutral product palette (black primary buttons, a blue that is not the site's ultramarine, soft status colours), never use the site's chrome tokens, and are hidden from screen readers because the caption under each frame describes them. Brands, people and prices in them are invented.

### Motion
- **Easing:** one curve, exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Durations:** 180ms for colour and small state changes, 360ms for tile lift and switch knob, 420ms for page-level view transitions and the count roll.
- **Spatial transitions:** a case-study tile's cover and the case-study hero share a view-transition name, so navigation morphs one into the other (cropping between 4:3 and 16:9, never stretching).
- **Reduced motion:** view transitions turn off and all animation and transition durations collapse.

## Do's and Don'ts

### Do:
- **Do** keep the ground cool pale grey and put content on white tiles with 28px outer and 20px inner radii.
- **Do** reserve ultramarine for selected, current, focused and checked states.
- **Do** mark availability with status green only.
- **Do** set headings at weight 600 with -0.03em tracking in the pinned Apple system stack with Inter fallback.
- **Do** use the two-tone headline (ink, then quiet grey) at headline or display size only.
- **Do** keep counts visible and tabular wherever the set of projects is described.
- **Do** make every control at least 44px tall and fully round.
- **Do** answer hover on tiles and cards with lift (translate up, deeper shadow); small round controls invert to control ink.
- **Do** animate with the single ease-out curve between 180ms and 420ms, using transform, opacity and clip, and honour reduced motion.

### Don't:
- **Don't** use ultramarine as a decorative fill, a resting link colour, or a primary-button colour.
- **Don't** substitute another typeface or add weights beyond 400, 500 and 600.
- **Don't** set body text or small labels in the quiet grey (#767a82); it only passes as large text.
- **Don't** put kickers or eyebrow labels above headings.
- **Don't** use glass or backdrop blur as decoration on tiles or cards.
- **Don't** use gradient text.
- **Don't** use hard-edged, zero-blur shadows; depth is soft, diffuse and ink-tinted.
- **Don't** stretch covers between aspect ratios; crop them.
