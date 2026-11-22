# Effects

Reusable visual effects. Each one stands on its own; drop it in where it is wanted.

| Effect | File | Used on |
| --- | --- | --- |
| Border beam: a glowing streak running round a card, button or input. Variants `colorful`, `mono`, `ocean`, `sunset`, and `saber` (a red beam and a blue one, for Beat Saber). | `BorderBeam.astro` | Not yet; kept for Beat Saber |
| Distortion wave: a screen transition that bends one view of an element into the next, with a rainbow rim, colour split, sparks and colour left on the edges (WebGL). A first version, still to be polished. | `distortion-wave.ts` | Not yet; kept for a popup |

```astro
---
import BorderBeam from '../components/effects/BorderBeam.astro';
---
<BorderBeam variant="saber" radius="24px" strength={0.8}>
  <div class="card">…</div>
</BorderBeam>
```

Props: `variant`, `size` (`md` | `sm` | `line`), `strength` (glow, 0–1), `duration` (seconds per lap),
`active` (false pauses it), `radius` (match the wrapped element). Give the wrapped element its own
background so the glow shows only outside it. Reduced motion shows a still, faint ring.

### Distortion wave

```ts
import { createDistortionWave } from '../components/effects/distortion-wave';

const wave = createDistortionWave(popup, { source: () => pressedButton });
await wave.play('out', () => showNextStep()); // change the popup inside the callback
await wave.play('in', () => showFirstStep());  // collapse back into the source
```

The callback runs while a picture of the old view covers the element, so the change is never seen
directly. Options: `source` (a point in 0–1 of the element, or an element such as the pressed
button; default bottom centre), `background`, `paint` (draw gradients, badges and other things the
picture can't), `skip`, `travel` (ms), `zIndex`. Without WebGL or with reduced motion, `play()`
just runs the change.

## Built into pages

These live with the page they were made for. Lift them out here when a second page needs one.

| Effect | Where |
| --- | --- |
| Plasma reveal: an energy ring, a burst, then violet smoke that clears to show the page (WebGL) | `pages/work/[slug].astro`, Beat Saber |
| Neon sign: tube lettering that switches on with a stutter, with a flickering letter | `BeatSaberLogo.astro`, `pages/index.astro` |
| Space field: drifting specks and cubes on the ground, with a pointer parallax | `SpaceField.astro` |
| Spell: a wand stroke that calls items into place with sparks | `cases/SortJourney.astro`, the albums |
| Spring wobble and ripple on hover | `cases/SortJourney.astro`, the albums |
| Paw pattern shader | `cases/SortJourney.astro`, the background |
