# Effects

Reusable visual effects. Each one stands on its own; drop it in where it is wanted.

| Effect | File | Used on |
| --- | --- | --- |
| Border beam: light on the inside edge of a card, button or input. `orbit` (default): two soft beams running round the edge. `sweep`, for long thin shapes like a search field: one flare passing along the bottom edge, then resting. Variants `colorful`, `mono`, `ocean`, `sunset`, and `saber` (red and blue, for Beat Saber). | `BorderBeam.astro` | Not yet; kept for Beat Saber |
| Distortion wave: a screen transition for a popup. The view is drawn toward the pressed button, then a soft dome rises from it with a wide pastel band and a dark, dusty inside; the new view arrives blurred, comes into focus, and colour lingers on the edges (WebGL). Tuned to the payment popup recording. | `distortion-wave.ts` | Not yet; kept for a popup |

```astro
---
import BorderBeam from '../components/effects/BorderBeam.astro';
---
<BorderBeam variant="saber" radius="24px" strength={0.8}>
  <div class="card">…</div>
</BorderBeam>

<BorderBeam mode="sweep" radius="999px">
  <label class="search">…</label>
</BorderBeam>
```

Props: `mode` (`orbit` | `sweep`), `variant`, `size` (`md` | `sm` | `line`, which is just the lit border), `strength` (0–1),
`duration` (seconds per lap, default 2.5; for `sweep` per pass and rest, default 3.4), `active` (false pauses it), `radius` (match the wrapped
element), `fill` (stretch with the wrapped element; by default the beam hugs what it wraps). The
light traces the real rounded outline at an even pace and stays inside the edge. Reduced motion
holds it still.

### Distortion wave

```ts
import { createDistortionWave } from '../components/effects/distortion-wave';

const wave = createDistortionWave(popup, { source: () => button, overlay: () => [button] });
await wave.play('out', () => showNextStep()); // change the popup inside the callback
await wave.play('in', () => showFirstStep());  // collapse back into the source
```

The callback runs while a picture of the old view covers the element, so the change is never seen
directly. Options: `source` (a point in 0–1 of the element, or an element such as the pressed
button; default bottom centre), `overlay` (elements that stay crisp above the wave, like the pressed
button: it keeps its old look until the wave has passed, then shows its new one), `background`,
`paint` (draw gradients, badges and other things the picture can't), `skip`, `travel` (ms, default
600), `zIndex`. The whole run takes about 1.6 s, sharp again about 1.2 s after the press. Without
WebGL or with reduced motion, `play()` just runs the change.

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
