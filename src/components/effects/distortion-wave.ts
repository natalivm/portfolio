/**
 * Distortion wave: a screen transition that carries one view of an element into the next.
 *
 * The element is drawn into a picture before and after the change, and a WebGL shader blends one
 * into the other. First the old view is drawn toward the source, its colours splitting, while a
 * glow gathers there. Then a soft dome leaves the source: ahead of it the old view blurs and
 * splits as it comes near and bends like a lens as it passes; behind it lies a dark, dusty band
 * under a wide rainbow rim, and the new view arrives blurred and comes into focus. Colour lingers
 * on the edges for a moment, with a hairline. 'out' sends the wave from the source and brings the
 * new view in; 'in' collapses it back into the source.
 *
 * Made for popups: start it from the button that was pressed.
 *
 *   import { createDistortionWave } from '../effects/distortion-wave';
 *   const wave = createDistortionWave(popup, { source: () => button, overlay: () => [button] });
 *   await wave.play('out', () => { showNextStep(); });   // change the DOM inside the callback
 *
 * The callback runs while the old picture covers the element, so the change is never seen
 * directly. Without WebGL, or with reduced motion, play() just runs the change.
 *
 * Drawing the picture: images, solid backgrounds and borders (with their corner radius) and text
 * are drawn where they sit. Gradients, shadows and filters are not; draw those with `paint`.
 * While a picture is taken the container carries `data-wave-snapping`, so a page can stop its
 * own transitions for that moment.
 *
 * Status: tuned to the reference recording of a payment popup; not applied to a page yet.
 */

export type WaveSource = { x: number; y: number } | Element;
export type Box = { x: number; y: number; w: number; h: number };

export interface DistortionWaveOptions {
  /** Where the wave starts: a point in 0–1 of the element, or an element (its centre). Default: bottom centre. */
  source?: WaveSource | (() => WaveSource);
  /** Fill under the picture. Default: the element's own background colour, else white. */
  background?: string;
  /** Draw an element yourself (a gradient, a badge…). Return true if you drew it; its children are still drawn. */
  paint?: (el: HTMLElement, g: CanvasRenderingContext2D, box: Box, cs: CSSStyleDeclaration) => boolean;
  /** Leave an element out of the picture. */
  skip?: (el: HTMLElement) => boolean;
  /** Elements that stay crisp, as they were, while the wave rises (the pressed button, say); they join it as it passes. */
  overlay?: Element[] | (() => Element[]);
  /** Milliseconds the wave takes to cross, outward. Default 600. */
  travel?: number;
  /** Stacking order of the wave's canvas inside the element. Default 50. */
  zIndex?: number;
}

export interface DistortionWave {
  /** False without WebGL or with reduced motion: play() then only runs the change. */
  readonly available: boolean;
  play(direction: 'out' | 'in', change: () => void | Promise<void>): Promise<void>;
  destroy(): void;
}

const FRAG = `
  precision highp float;
  uniform sampler2D uIn;   // behind the front (near the source)
  uniform sampler2D uOut;  // ahead of it
  uniform vec2 uRes;
  uniform vec2 uS;         // source, in uv (y down)
  uniform float uR;        // front radius, in element heights
  uniform float uA;        // anticipation: everything drawn toward the source, colours splitting
  uniform float uRim;      // the front's colour, blur and dust, 0..1
  uniform float uSettle;   // the new view still out of focus, 0..1
  uniform float uEdge;     // colour lingering on the edges, 0..1
  uniform float uT;
  const float W = 0.14;    // lens width
  const float EX = 0.6;    // sideways distance counts for this much: the front is a wide dome
  vec2 K;
  vec3 pal(float t) { return 0.55 + 0.45 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))); }
  float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
  vec3 sharp(sampler2D tex, vec2 uv, vec2 ab) {
    return vec3(texture2D(tex, uv + ab).r, texture2D(tex, uv).g, texture2D(tex, uv - ab).b);
  }
  // ten taps on a golden spiral, each with its colours split along the wave
  vec3 soft(sampler2D tex, vec2 uv, float rad, vec2 ab) {
    vec3 c = vec3(0.0);
    for (int i = 0; i < 10; i++) {
      float fi = float(i);
      float a = fi * 2.39996;
      vec2 o = vec2(cos(a), sin(a)) * sqrt((fi + 0.5) / 10.0) * rad / K;
      c += sharp(tex, uv + o, ab);
    }
    return c / 10.0;
  }
  vec3 look(sampler2D tex, vec2 uv, float rad, vec2 ab) {
    if (rad < 0.0015) return sharp(tex, uv, ab);
    return soft(tex, uv, rad, ab);
  }
  void main() {
    vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
    float asp = uRes.x / uRes.y;
    K = vec2(asp, 1.0);
    vec2 p = (uv - uS) * K;
    vec2 pe = p * vec2(EX, 1.0);
    float d = length(pe);
    vec2 dir = pe / max(d, 1e-4);
    vec2 dirUV = dir / K;

    // anticipation: the old view is drawn down toward the source
    vec2 uvA = uv + (uS - uv) * uA * 0.05 * (0.4 + 0.6 * smoothstep(1.2, 0.0, d));

    // the lens: content near the front bends along the wave
    float sgn = d - uR;
    float back = max(-sgn, 0.0);
    float ahead = max(sgn, 0.0);
    float s = sgn / W;
    vec2 q = uvA - dirUV * 0.035 * s * exp(-s * s * 1.2) * uRim;
    float inside = smoothstep(0.01, -0.01, sgn);

    // the old view blurs and splits as the front comes near; the new one arrives blurred and settles
    float near = exp(-ahead / 0.12) * uRim;
    float radOut = 0.018 * near + 0.003 * uA;
    vec2 abOut = dirUV * (0.010 * near + 0.006 * uA);
    float radIn = 0.03 * exp(-back / 0.22) * uRim + 0.014 * uSettle;
    vec2 abIn = dirUV * (0.012 * exp(-back / 0.2) * uRim + 0.006 * uSettle);
    vec3 col;
    if (inside > 0.99) col = look(uIn, q, radIn, abIn);
    else if (inside < 0.01) col = look(uOut, q, radOut, abOut);
    else col = mix(look(uOut, q, radOut, abOut), look(uIn, q, radIn, abIn), inside);

    // deep, dusty space just behind the front
    float deep = exp(-back / 0.32) * inside * uRim;
    col = mix(col, vec3(0.05, 0.05, 0.14), deep * 0.68);
    vec2 cell = floor(gl_FragCoord.xy / 9.0);
    vec2 sp = (cell + 0.5 + (vec2(hash(cell + 1.3), hash(cell + 7.7)) - 0.5) * 0.8) * 9.0;
    vec2 dd = gl_FragCoord.xy - sp;
    col += vec3(0.9, 0.92, 1.0) * step(0.968, hash(cell)) * exp(-dot(dd, dd) / 0.9) * deep * 0.75;

    // the rim: a wide soft rainbow just behind the front, white at its leading edge
    float ang = atan(p.x, -p.y);
    vec3 rc = pal(ang * 0.45 + d * 0.9 - uT * 0.5);
    vec3 rp = mix(rc, vec3(1.0, 0.84, 1.0), 0.36);  // pastel: pinks, pale blues, a little gold
    float grow = smoothstep(0.03, 0.35, uR);          // the band gains its colour as the dome opens
    col += rp * exp(-pow((sgn + 0.06) / 0.11, 2.0)) * 0.6 * uRim * grow;
    col += vec3(1.0) * exp(-pow((sgn + 0.01) / 0.022, 2.0)) * 0.28 * uRim * (0.4 + 0.6 * grow);

    // colour left round the edges, lingering after the wave, and a hairline
    float e = min(min(uv.x, 1.0 - uv.x) * asp, min(uv.y, 1.0 - uv.y));
    vec3 ec = pal(atan(uv.y - 0.5, (uv.x - 0.5) * asp) * 0.16 + uT * 0.15);
    col += ec * exp(-e / 0.04) * 0.42 * uEdge * inside;
    col += vec3(1.0) * exp(-e / 0.004) * 0.35 * uEdge * inside;

    // a glow gathering at the source before the wave leaves
    col += (vec3(1.0, 0.93, 0.97) * 0.85 + rc * 0.15) * uA * exp(-d / 0.12) * 0.7;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }`;

const clear = /^(transparent|rgba\(0, 0, 0, 0\))$/;

export function createDistortionWave(container: HTMLElement, options: DistortionWaveOptions = {}): DistortionWave {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  Object.assign(cv.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'none',
    zIndex: String(options.zIndex ?? 50), pointerEvents: 'none', borderRadius: 'inherit',
  });
  const gl = reduce ? null : cv.getContext('webgl', { premultipliedAlpha: false, alpha: false });

  const prog = gl && gl.createProgram();
  if (gl && prog) {
    const sh = (type: number, src: string) => {
      const o = gl.createShader(type)!;
      gl.shaderSource(o, src);
      gl.compileShader(o);
      return o;
    };
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
  }
  const available = !!(gl && prog && gl.getProgramParameter(prog, gl.LINK_STATUS));
  if (!available) {
    return { available, play: async (_d, change) => { await change(); }, destroy: () => {} };
  }
  const g3 = gl!;
  g3.useProgram(prog);
  g3.bindBuffer(g3.ARRAY_BUFFER, g3.createBuffer());
  g3.bufferData(g3.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g3.STATIC_DRAW);
  const loc = g3.getAttribLocation(prog!, 'a');
  g3.enableVertexAttribArray(loc);
  g3.vertexAttribPointer(loc, 2, g3.FLOAT, false, 0, 0);
  const U = (n: string) => g3.getUniformLocation(prog!, n);
  const tex = (unit: number) => {
    const t = g3.createTexture()!;
    g3.activeTexture(g3.TEXTURE0 + unit);
    g3.bindTexture(g3.TEXTURE_2D, t);
    g3.texParameteri(g3.TEXTURE_2D, g3.TEXTURE_MIN_FILTER, g3.LINEAR);
    g3.texParameteri(g3.TEXTURE_2D, g3.TEXTURE_MAG_FILTER, g3.LINEAR);
    g3.texParameteri(g3.TEXTURE_2D, g3.TEXTURE_WRAP_S, g3.CLAMP_TO_EDGE);
    g3.texParameteri(g3.TEXTURE_2D, g3.TEXTURE_WRAP_T, g3.CLAMP_TO_EDGE);
    return t;
  };
  const tIn = tex(0);
  const tOut = tex(1);
  g3.uniform1i(U('uIn'), 0);
  g3.uniform1i(U('uOut'), 1);
  const upload = (unit: number, t: WebGLTexture, c: HTMLCanvasElement) => {
    g3.activeTexture(g3.TEXTURE0 + unit);
    g3.bindTexture(g3.TEXTURE_2D, t);
    g3.texImage2D(g3.TEXTURE_2D, 0, g3.RGBA, g3.RGBA, g3.UNSIGNED_BYTE, c);
  };

  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  container.appendChild(cv);

  let held: HTMLElement[] = []; // the crisp copies, never part of a picture

  // ---------- the element as a picture ----------
  const snap = () => {
    const B = container.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(B.width * dpr));
    c.height = Math.max(1, Math.round(B.height * dpr));
    const g = c.getContext('2d')!;
    g.scale(dpr, dpr);
    const own = getComputedStyle(container).backgroundColor;
    g.fillStyle = options.background ?? (clear.test(own) ? '#fff' : own);
    g.fillRect(0, 0, B.width, B.height);
    const box = (r: DOMRect): Box => ({ x: r.left - B.left, y: r.top - B.top, w: r.width, h: r.height });
    const radius = (cs: CSSStyleDeclaration, w: number) => {
      const v = cs.borderTopLeftRadius;
      return v.endsWith('%') ? (parseFloat(v) / 100) * w : parseFloat(v) || 0;
    };
    const alpha = (el: Element) => {
      let a = 1;
      for (let n: Element | null = el; n && n !== container; n = n.parentElement) a *= parseFloat(getComputedStyle(n).opacity) || 0;
      return a;
    };
    for (const el of container.querySelectorAll<HTMLElement>('*')) {
      if (el === cv || el.closest('[hidden]') || options.skip?.(el) || held.some((c) => c.contains(el))) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const b = box(el.getBoundingClientRect());
      if (!b.w || !b.h) continue;
      g.save();
      g.globalAlpha = alpha(el);
      if (!options.paint?.(el, g, b, cs)) {
        const r = radius(cs, b.w);
        if (!clear.test(cs.backgroundColor)) {
          g.fillStyle = cs.backgroundColor;
          g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, r); g.fill();
        }
        const bw = parseFloat(cs.borderTopWidth) || 0;
        if (bw && cs.borderTopStyle !== 'none' && !clear.test(cs.borderTopColor)) {
          g.strokeStyle = cs.borderTopColor;
          g.lineWidth = bw;
          g.beginPath(); g.roundRect(b.x + bw / 2, b.y + bw / 2, b.w - bw, b.h - bw, Math.max(0, r - bw / 2)); g.stroke();
        }
        if (el instanceof HTMLImageElement && el.complete && el.naturalWidth) {
          if (r) { g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, r); g.clip(); }
          g.drawImage(el, b.x, b.y, b.w, b.h);
        }
      }
      // text, word by word where it sits, so wrapped lines and any alignment come out right
      g.fillStyle = cs.color;
      g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      g.textBaseline = 'alphabetic';
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !n.textContent?.trim()) continue;
        const range = document.createRange();
        for (const m of n.textContent.matchAll(/\S+/g)) {
          range.setStart(n, m.index!);
          range.setEnd(n, m.index! + m[0].length);
          const w = box(range.getBoundingClientRect());
          if (w.w) g.fillText(m[0], w.x, w.y + w.h * 0.78);
        }
      }
      g.restore();
    }
    return c;
  };

  const sourcePoint = (B: DOMRect) => {
    const s = typeof options.source === 'function' ? options.source() : options.source;
    if (!s) return [0.5, 0.985];
    if (s instanceof Element) {
      const r = s.getBoundingClientRect();
      return [(r.left + r.width / 2 - B.left) / B.width, (r.top + r.height / 2 - B.top) / B.height];
    }
    return [s.x, s.y];
  };

  const ease = (t: number) => t * t * (3 - 2 * t);
  const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
  const frame = (r: number, a: number, rim: number, t: number, settle = 0, edge = 0) => {
    g3.uniform1f(U('uR'), r);
    g3.uniform1f(U('uA'), a);
    g3.uniform1f(U('uRim'), rim);
    g3.uniform1f(U('uSettle'), settle);
    g3.uniform1f(U('uEdge'), edge);
    g3.uniform1f(U('uT'), t);
    g3.drawArrays(g3.TRIANGLE_STRIP, 0, 4);
  };

  const run = async (dirn: 'out' | 'in', change: () => void | Promise<void>) => {
    const B = container.getBoundingClientRect();
    const S = sourcePoint(B); // read before the change: the button may go
    // crisp copies of the overlay elements as they are now, laid exactly over them, above the wave
    const keep = (typeof options.overlay === 'function' ? options.overlay() : options.overlay) ?? [];
    held = keep.map((o) => {
      const r = o.getBoundingClientRect();
      const c = o.cloneNode(true) as HTMLElement;
      c.removeAttribute('id');
      c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
      c.setAttribute('aria-hidden', 'true');
      c.inert = true;
      Object.assign(c.style, {
        position: 'absolute', margin: '0', boxSizing: 'border-box', transform: 'none', pointerEvents: 'none',
        left: `${r.left - B.left - container.clientLeft}px`, top: `${r.top - B.top - container.clientTop}px`,
        width: `${r.width}px`, height: `${r.height}px`, zIndex: String((options.zIndex ?? 50) + 2),
        transition: 'opacity 220ms ease-out',
      });
      return c;
    });
    container.setAttribute('data-wave-snapping', '');
    const before = snap();
    cv.width = before.width;
    cv.height = before.height;
    g3.viewport(0, 0, cv.width, cv.height);
    g3.uniform2f(U('uRes'), cv.width, cv.height);
    g3.uniform2f(U('uS'), S[0], S[1]);
    const far = Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => Math.hypot((x - S[0]) * (B.width / B.height) * 0.6, y - S[1])));
    // hold the old picture on screen while the element changes underneath
    upload(0, tIn, before);
    upload(1, tOut, before);
    frame(0, 0, 0, 0);
    cv.style.display = 'block';
    held.forEach((c) => container.appendChild(c));
    let lifted: { el: HTMLElement; position: string; zIndex: string }[] = [];
    try {
      await change();
      void container.offsetWidth;
      const after = snap();
      container.removeAttribute('data-wave-snapping');
      if (dirn === 'out') { upload(0, tIn, after); upload(1, tOut, before); }
      else { upload(0, tIn, before); upload(1, tOut, after); }
      const travel = options.travel ?? 600;
      const out = dirn === 'out';
      const ANT = out ? 190 : 100;
      const TRAVEL = out ? travel : travel * 0.8;
      const PASS = ANT + TRAVEL; // the front is past the far corner
      const END = PASS + 800;
      const max = far + 0.25;
      await new Promise<void>((done) => {
        let t0 = 0;
        const tick = (now: number) => {
          if (!t0) t0 = now;
          const t = now - t0;
          const pr = ease(clamp01((t - ANT) / TRAVEL));
          const r = dirn === 'out' ? pr * max : (1 - pr) * max;
          const a = out ? clamp01(t / ANT) * (1 - clamp01((t - ANT) / 160)) : 0;
          const rim = clamp01((t - ANT * 0.6) / 100) * (1 - clamp01((t - PASS) / 200));
          // the new view comes into focus once the wave has gone over it
          const settle = out ? clamp01((t - ANT - TRAVEL * 0.5) / 120) * (1 - clamp01((t - PASS) / 420)) : 0;
          // colour stays on the edges for a moment after the wave
          const edge = clamp01((t - ANT - TRAVEL * 0.5) / 200) * (1 - clamp01((t - PASS - 100) / 700));
          frame(r, a, rim, t / 1000, settle, edge);
          // once the front has gone over the top, the copies fade off the real elements, lifted crisp above the wave
          if (held.length && !lifted.length && t > ANT + TRAVEL * 0.72) {
            const now = (typeof options.overlay === 'function' ? options.overlay() : options.overlay) ?? [];
            lifted = now.filter((o) => container.contains(o)).map((o) => {
              const el = o as HTMLElement;
              const prev = { el, position: el.style.position, zIndex: el.style.zIndex };
              if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
              el.style.zIndex = String((options.zIndex ?? 50) + 1);
              return prev;
            });
            held.forEach((c) => { c.style.opacity = '0'; });
          }
          if (t < END) requestAnimationFrame(tick);
          else done();
        };
        requestAnimationFrame(tick);
      });
    } finally {
      container.removeAttribute('data-wave-snapping');
      cv.style.display = 'none';
      held.forEach((c) => c.remove());
      held = [];
      for (const { el, position, zIndex } of lifted) {
        el.style.position = position;
        el.style.zIndex = zIndex;
      }
    }
  };

  // one wave at a time: a second play waits for the first
  let queue: Promise<void> = Promise.resolve();
  return {
    available,
    play: (direction, change) => (queue = queue.then(() => run(direction, change))),
    destroy: () => {
      cv.remove();
      g3.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
