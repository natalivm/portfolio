/**
 * Distortion wave: a screen transition that carries one view of an element into the next.
 *
 * The element is drawn into a picture before and after the change, and a WebGL shader blends one
 * into the other. A glow gathers at the source, then a wave leaves it, bending the old picture like
 * a lens as it passes, splitting its colours at the front, ringed by a rainbow rim and a white
 * hairline, throwing off sparks, and leaving colour on the element's edges. 'out' sends the wave
 * from the source and brings the new view in; 'in' collapses it back into the source.
 *
 * Made for popups: start it from the button that was pressed.
 *
 *   import { createDistortionWave } from '../effects/distortion-wave';
 *   const wave = createDistortionWave(popup, { source: () => pressedButton });
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
 * Status: a first version, to be polished.
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
  /** Milliseconds the wave takes to cross, outward. Default 1050. */
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
  uniform float uA;        // anticipation: the picture drawn toward the source, a glow gathering
  uniform float uRim;      // colour on the front and edges, 0..1
  uniform float uT;
  const float L = 0.16;    // lens width
  vec3 pal(float t) { return 0.58 + 0.42 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))); }
  float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
  void main() {
    vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
    float asp = uRes.x / uRes.y;
    vec2 k = vec2(asp, 1.0);
    vec2 p = (uv - uS) * k;
    float d = length(p);
    vec2 dir = p / max(d, 1e-4);
    vec2 dirUV = dir / k;

    // anticipation: the old picture is drawn in toward the source
    vec2 uvA = uv - (uv - uS) * uA * 0.07 * exp(-d * 1.4);

    // the lens: content near the front bends along the wave, colours split
    float sgn = d - uR;
    float s = sgn / L;
    float bend = 0.05 * s * exp(-s * s * 1.5);
    float ab = 0.012 * exp(-s * s * 2.0) * uRim;
    vec2 q = uvA - dirUV * bend;
    float inside = smoothstep(0.006, -0.006, sgn);
    vec3 cIn = vec3(texture2D(uIn, q + dirUV * ab).r, texture2D(uIn, q).g, texture2D(uIn, q - dirUV * ab).b);
    vec3 cOut = vec3(texture2D(uOut, q + dirUV * ab).r, texture2D(uOut, q).g, texture2D(uOut, q - dirUV * ab).b);
    vec3 col = mix(cOut, cIn, inside);

    // rainbow rim just behind the front, a white hairline on it
    float ang = atan(p.x, -p.y);
    vec3 rc = pal(ang * 0.35 + d * 1.2 - uT * 0.6);
    float back = max(-sgn, 0.0);
    float rim = exp(-pow(back / 0.06, 2.0)) * inside + exp(-pow(max(sgn, 0.0) / 0.014, 2.0)) * 0.5 * (1.0 - inside);
    col = mix(col, rc, rim * 0.7 * uRim) + rc * rim * 0.18 * uRim;
    col += vec3(1.0) * exp(-pow(sgn / 0.0035, 2.0)) * 0.85 * uRim;

    // colour left on the element's edges, behind the front, fading as the wave goes on
    float e = min(min(uv.x, 1.0 - uv.x) * asp, min(uv.y, 1.0 - uv.y));
    col += pal(ang * 0.35 + uv.y - uT * 0.4) * exp(-e / 0.016) * inside * exp(-back / 0.55) * smoothstep(0.06, 0.3, d) * 0.6 * uRim;

    // a glow gathering at the source before it leaves
    col += (vec3(1.0, 0.96, 0.9) * 0.7 + rc * 0.3) * uA * exp(-d / 0.09);

    // sparks thrown off the front
    for (int i = 0; i < 34; i++) {
      float fi = float(i);
      float a = (hash(fi) - 0.5) * 3.0;
      float r = uR * (0.9 + 0.18 * hash(fi + 7.1)) + 0.03 * sin(uT * 2.0 + fi);
      vec2 sp = vec2(sin(a), -cos(a)) * r;
      float sz = 0.0025 + 0.004 * hash(fi + 3.3);
      float g = exp(-dot(p - sp, p - sp) / (sz * sz));
      col += mix(vec3(1.0), pal(hash(fi + 1.7)), 0.45) * g * uRim * step(0.02, uR);
    }
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
      if (el === cv || el.closest('[hidden]') || options.skip?.(el)) continue;
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

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
  const frame = (r: number, a: number, rim: number, t: number) => {
    g3.uniform1f(U('uR'), r);
    g3.uniform1f(U('uA'), a);
    g3.uniform1f(U('uRim'), rim);
    g3.uniform1f(U('uT'), t);
    g3.drawArrays(g3.TRIANGLE_STRIP, 0, 4);
  };

  const run = async (dirn: 'out' | 'in', change: () => void | Promise<void>) => {
    const B = container.getBoundingClientRect();
    const S = sourcePoint(B); // read before the change: the button may go
    container.setAttribute('data-wave-snapping', '');
    const before = snap();
    cv.width = before.width;
    cv.height = before.height;
    g3.viewport(0, 0, cv.width, cv.height);
    g3.uniform2f(U('uRes'), cv.width, cv.height);
    g3.uniform2f(U('uS'), S[0], S[1]);
    const far = Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => Math.hypot((x - S[0]) * (B.width / B.height), y - S[1])));
    // hold the old picture on screen while the element changes underneath
    upload(0, tIn, before);
    upload(1, tOut, before);
    frame(0, 0, 0, 0);
    cv.style.display = 'block';
    try {
      await change();
      void container.offsetWidth;
      const after = snap();
      container.removeAttribute('data-wave-snapping');
      if (dirn === 'out') { upload(0, tIn, after); upload(1, tOut, before); }
      else { upload(0, tIn, before); upload(1, tOut, after); }
      const travel = options.travel ?? 1050;
      const ANT = dirn === 'out' ? 300 : 120;
      const TRAVEL = dirn === 'out' ? travel : travel * 0.8;
      const END = ANT + TRAVEL + 260;
      const max = far + 0.2;
      await new Promise<void>((done) => {
        let t0 = 0;
        const tick = (now: number) => {
          if (!t0) t0 = now;
          const t = now - t0;
          const pr = ease(clamp01((t - ANT) / TRAVEL));
          const r = dirn === 'out' ? pr * max : (1 - pr) * max;
          const a = dirn === 'out' ? clamp01(t / ANT) * (1 - clamp01((t - ANT) / 300)) : 0;
          const rim = clamp01((t - ANT * 0.5) / 120) * (1 - clamp01((t - ANT - TRAVEL) / 260));
          frame(r, a, rim, t / 1000);
          if (t < END) requestAnimationFrame(tick);
          else done();
        };
        requestAnimationFrame(tick);
      });
    } finally {
      container.removeAttribute('data-wave-snapping');
      cv.style.display = 'none';
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
