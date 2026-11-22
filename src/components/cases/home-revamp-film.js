/**
 * Home screen revamp: the old home screen rebuilt into the new one, as a scripted film.
 *
 * The whole film is a pure function of time: render(t) puts every layer, the cursor, the selection
 * boxes, the properties panel and the colour picker where they belong at t. That makes it cheap to
 * pause, seek and loop, keeps type sharp at any size, and needs only the still images (about 0.8 MB
 * of WebP) instead of a video file.
 *
 * mountFilm(host, { base }) builds a 1920 × 1080 stage inside host and returns a controller.
 * The caller scales the stage to fit (see HomeRevampFilm.astro) and decides when it plays.
 */
// chapter starts, in seconds; the film runs END seconds and loops
const S1 = 2.2, S2 = 13.0, S3 = 18.2, S4 = 26.0, S5 = 34.4, OUT = 40.6, END = 45.0;
export const DURATION = END;
export const CHAPTERS = [
  { t: 0, label: 'Before' }, { t: S1, label: 'Wallet' }, { t: S2, label: 'Banner' }, { t: S3, label: 'Double coins' },
  { t: S4, label: 'Invite' }, { t: S5, label: 'Story card' }, { t: OUT, label: 'After' },
];

export function mountFilm(host, { base = '' } = {}) {
const ASSET = {"n_bannerart.png": "banner-art.webp", "o_title.png": "banner-title.webp", "o_burger_a.png": "menu.webp", "o_streak_a.png": "streak.webp", "o_dbl_coins_a.png": "coins-old.webp", "o_dbl_2x_a.png": "two-x.webp", "o_dbl_title_a.png": "title-old.webp", "o_dbl_bartext_a.png": "bar-text-old.webp", "o_target_a.png": "target.webp", "o_dart_a.png": "dart.webp", "n_coincascade.png": "coins-new.webp", "o_starobj.png": "star.webp", "o_star2.png": "star-2.webp", "o_fox_invite.png": "fox-old.webp", "o_shortcut_a.png": "shortcut-old.webp", "n_roomfox.png": "story-new.webp", "n_check.png": "check.webp", "missions_a.png": "missions.webp", "bottom_menu.png": "bottom-menu.webp", "o_coin_raw_a.png": "coin.webp", "n_arrow.svg": "arrow.svg", "n_clock.svg": "clock.svg", "o_stripe.svg": "stripe.svg"};

host.insertAdjacentHTML('beforeend', `<div class="hrf-stage"><div class="hr-grid"></div>
  <img class="hr-oldStatic" src="${base}/cases/home-revamp/home-before.webp" width="1124" height="2444" alt="" style="position:absolute;transform-origin:0 0;opacity:0">
  <div class="hr-world"><div class="hr-phone"></div><div class="hr-screen"></div></div>
  <div class="hr-ov a" style="inset:0"></div></div>`);
const stage = host.lastElementChild;
const $ = (s, r = stage) => r.querySelector(s);
const world = $('.hr-world');
const phoneEl = $('.hr-phone');
const oldStatic = $('.hr-oldStatic');

// ---------------------------------------------------------------- helpers
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mix = (a, b, p) => a + (b - a) * p;
const E = {
  lin: (x) => x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  back: (x) => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  sine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
};
const P = (t, a, b, e = 'io') => E[e](clamp((t - a) / (b - a), 0, 1));
const UNITLESS = new Set(['fontWeight', 'opacity', 'zIndex', 'lineHeight', 'flex']);
const px = (v, k) => (typeof v === 'number' && !UNITLESS.has(k) ? v + 'px' : v);
function S(el, o) { for (const k in o) { const v = o[k]; if (k === 'o') el.style.opacity = v; else if (k === 'tf') el.style.transform = v; else el.style[k] = px(v, k); } }
function mk(parent, cls = 'a', style = {}, html = '') {
  const el = document.createElement(cls === 'img' ? 'img' : 'div');
  if (cls === 'img') { el.className = 'a'; el.src = style.src; delete style.src; } else el.className = cls;
  S(el, style);
  if (html) el.innerHTML = html;
  parent.appendChild(el);
  return el;
}
const hex2 = (h) => { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const rgb = (c, a = 1) => `rgba(${c.map((v) => Math.round(v)).join(',')},${a})`;
const toHex = (c) => c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
function rgb2hsv([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [((h * 60) + 360) % 360, mx ? d / mx : 0, mx];
}
function hsv2rgb([h, s, v]) {
  const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}
// colour along a picker drag: hue holds when one end is grey
function hsvMix(a, b, p) {
  const A = rgb2hsv(a), B = rgb2hsv(b);
  if (A[1] < 0.02) A[0] = B[0];
  if (B[1] < 0.02) B[0] = A[0];
  let dh = B[0] - A[0]; if (dh > 180) dh -= 360; if (dh < -180) dh += 360;
  return hsv2rgb([(A[0] + dh * p + 360) % 360, mix(A[1], B[1], p), mix(A[2], B[2], p)]);
}
const cmix = (a, b, p) => a.map((v, i) => mix(v, b[i], p));

const setHTML = (el, h) => { if (el._h !== h) { el.innerHTML = h; el._h = h; } };

// ---------------------------------------------------------------- timeline

// typing: select-all-and-retype for big changes, backspace edits for small ones
function typing(t, t0, from, to, cps = 16) {
  if (t < t0) return { s: from, sel: false, done: false };
  let pre = 0; while (pre < from.length && pre < to.length && from[pre] === to[pre]) pre++;
  let suf = 0; while (suf < from.length - pre && suf < to.length - pre && from[from.length - 1 - suf] === to[to.length - 1 - suf]) suf++;
  const delMid = from.length - pre - suf, insMid = to.length - pre - suf;
  const dt = t - t0;
  if (delMid + insMid > 3 || delMid > 1) {
    if (dt < 0.22) return { s: from, sel: true, done: false };
    const n = Math.floor((dt - 0.22) * cps);
    return { s: to.slice(0, Math.min(n, to.length)), sel: false, done: n >= to.length, caretAt: null };
  }
  const bs = 0.07, ty = 1 / cps;
  const del = Math.min(delMid, Math.floor(dt / bs));
  let s = from.slice(0, from.length - suf - del) + from.slice(from.length - suf);
  if (del < delMid) return { s, sel: false, done: false, caretAt: from.length - suf - del };
  const ins = Math.min(insMid, Math.floor((dt - delMid * bs) / ty));
  s = to.slice(0, pre + ins) + to.slice(to.length - suf);
  return { s, sel: false, done: ins >= insMid, caretAt: pre + ins };
}
function textHTML(r, caret) {
  const esc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (r.sel) return `<span class="hl">${esc(r.s)}</span>`;
  if (!caret) return esc(r.s) || '&#8203;';
  const at = r.caretAt == null ? r.s.length : r.caretAt;
  return esc(r.s.slice(0, at)) + '<span class="caret"></span>' + esc(r.s.slice(at));
}

// ---------------------------------------------------------------- the phone
const screen = $('.hr-screen');
const IMG = (n) => `${base}/cases/home-revamp/${ASSET[n] || n}`;
const pgOld = mk(screen, 'a', { left: 0, top: 0, width: 1074, height: 2394 });
const pgNew = mk(screen, 'a', { left: 0, top: 0, width: 1074, height: 2394, background: '#f7f8ff', o: 0 });

// banner
const bClip = mk(screen, 'a', { left: 0, top: 0, width: 1074, height: 354, overflow: 'hidden' });
const bArt = mk(bClip, 'img', { src: IMG('n_bannerart.png'), left: 0, top: 0, width: 1074, height: 974 });
const bTitle = mk(bClip, 'img', { src: IMG('o_title.png'), left: 40, top: 34, width: 469, height: 231 });
const bBurger = mk(bClip, 'img', { src: IMG('o_burger_a.png'), left: 909, top: 174, width: 109, height: 73 });
const bTimer = mk(bClip, 'a', { left: 58, top: 268, width: 443, height: 59, borderRadius: 46 });
const bTimerLbl = mk(bTimer, 't r', { left: 189, top: 4, font: '600 38px "Plus Jakarta Sans Variable"' }, 'Starts in:');
const bClock = mk(bTimer, 'a', { left: 200, top: 4, width: 50, height: 50, WebkitMask: `url(${IMG('n_clock.svg')}) center/contain no-repeat`, mask: `url(${IMG('n_clock.svg')}) center/contain no-repeat` });
const bTime = mk(bTimer, 't r', { left: 418, top: 2, font: '700 40px "Plus Jakarta Sans Variable"' });
const bInfo = mk(bClip, 'a', { borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', font: '700 34px "Plus Jakarta Sans Variable"' }, 'i');
const bDots = [12, 53, 94, 135].map((cx, i) => mk(bClip, 'a', { left: 461 + cx - 12, top: 369, width: 24, height: 24, borderRadius: '50%', background: i === 2 ? '#fff' : 'rgba(196,196,196,.66)' }));

// double coins card and its streak
const streak = mk(screen, 'a', { left: 5, top: 814, width: 1051, height: 228, overflow: 'hidden' });
mk(streak, 'img', { src: IMG('o_streak_a.png'), left: 0, top: 0, width: 1051, height: 228 });
const dbl = mk(screen, 'a', { left: 18, top: 619, width: 1038, height: 195, borderRadius: 40, overflow: 'hidden' });
const dBgOld = mk(dbl, 'a', { inset: 0, borderRadius: 40, background: 'linear-gradient(90deg,#56ccf2 0%,#56ccf2 62%,#49c4f3 69%,#21acfa 86%,#0d9ffe 96%)', boxShadow: 'inset 0 3px 0 #2bd3f7, inset 0 -4px 0 #30aadc' });
const dBgNew = mk(dbl, 'a', { inset: 0, borderRadius: 40, o: 0 });
const dCascade = mk(dbl, 'img', { src: IMG('n_coincascade.png'), left: 519, top: -180, width: 863, height: 486, o: 0 });
const dCoins = mk(dbl, 'img', { src: IMG('o_dbl_coins_a.png'), left: 728, top: 2, width: 307, height: 190 });
const d2x = mk(dbl, 'img', { src: IMG('o_dbl_2x_a.png'), left: 885, top: 10, width: 130, height: 156 });
const dTitleOld = mk(dbl, 'img', { src: IMG('o_dbl_title_a.png'), left: 241, top: 0, width: 558, height: 103 });
const dTitleNew = mk(dbl, 'a', { left: 53, top: 28, width: 385, font: '700 52px/1.24 "Plus Jakarta Sans Variable"', color: '#fff', WebkitTextStroke: '4px #0d4a3c', paintOrder: 'stroke fill' });
const dBar = mk(dbl, 'a', { overflow: 'hidden' });
const dBarFill = mk(dBar, 'a', { left: 0, top: 0, bottom: 0 });
const dBarTextOld = mk(dbl, 'img', { src: IMG('o_dbl_bartext_a.png'), left: 386, top: 108, width: 268, height: 46 });
const dBarTextNew = mk(dbl, 't', { left: 681, top: 148, font: '700 48px "Plus Jakarta Sans Variable"', color: '#010101' });
const dTarget = mk(dbl, 'img', { src: IMG('o_target_a.png'), width: 134, height: 133 });
const dDart = mk(dbl, 'img', { src: IMG('o_dart_a.png'), width: 90, height: 70 });

// invite card
const inv = mk(screen, 'a', { left: 18, top: 1075, width: 1038, height: 304 });
const iBg = mk(inv, 'a', { inset: 0 });
const iStripes = mk(inv, 'a', { inset: 0, overflow: 'hidden', borderRadius: 46 });
for (let i = 0; i < 7; i++) mk(iStripes, 'img', { src: IMG('o_stripe.svg'), left: 1010, top: 17 + 40 * i, width: 28, height: 39.5 });
const iDash = mk(inv, 'a', { boxSizing: 'border-box', borderStyle: 'dashed', borderWidth: 6 });
const iTitle = mk(inv, 't', { left: 89, top: 22, font: '700 65px "Baloo 2 Variable"', color: '#bffaff', textShadow: '0 2px 5px rgba(0,0,0,.8)' }, 'Invite Friends (0/5)');
const iText = mk(inv, 'a', { lineHeight: 'normal' }, 'Get 15% of what your friends earn!');
const iStarS = mk(inv, 'img', { src: IMG('o_starobj.png'), left: 82 - 17, top: 33 - 17, width: 34, height: 34 });
const iStarB = mk(inv, 'img', { src: IMG('o_starobj.png'), left: 44 - 27, top: 92 - 27, width: 54, height: 54, tf: 'rotate(-12deg)' });
const iStarR = mk(inv, 'img', { src: IMG('o_star2.png'), left: 937 - 25, top: 94 - 25, width: 50, height: 50, tf: 'rotate(-26.7deg)' });
const iFox = mk(inv, 'img', { src: IMG('o_fox_invite.png'), left: 719, top: -15, width: 234, height: 339 });
const iAv = [0, 1, 2, 3, 4].map((i) => mk(inv, 'a', { left: 119 + 99.387 * i, top: 111, width: 76.45, height: 76.45, borderRadius: '50%', background: '#c0cbd3', o: 0 }));
const iBtn = mk(inv, 'a', { left: 669, top: 105, width: 248, height: 89, borderRadius: 61, background: '#1154d0', o: 0 });
const iBtnTxt = mk(inv, 't', { left: 728, top: 113, font: '700 48px "Plus Jakarta Sans Variable"', color: '#fff' });

// shortcut card that becomes "Make room for more fun"
const mr = mk(screen, 'a', { overflow: 'hidden' });
const mOld = mk(mr, 'a', { inset: 0, backgroundImage: `url(${IMG('o_shortcut_a.png')})`, backgroundSize: 'cover', backgroundPosition: 'center' });
const mScene = mk(mr, 'a', { left: -36, top: -24, width: 1207, height: 598, backgroundImage: `url(${IMG('n_roomfox.png')})`, backgroundSize: '100% 100%', o: 0 });
const mText = mk(mr, 'a', { left: 60, top: 57, width: 568, font: '700 76px/0.9 "Plus Jakarta Sans Variable"', color: '#fff', WebkitTextStroke: '4px rgba(10,10,20,.55)', paintOrder: 'stroke fill' });
const mMax = mk(mr, 't c', { left: 303, top: 246, font: '700 42px "Plus Jakarta Sans Variable"', color: '#ffd900', WebkitTextStroke: '5px #2a2210', paintOrder: 'stroke fill' });
const mPill = mk(mr, 'a', { left: 62, top: 323, width: 461, height: 59, borderRadius: 46, background: '#f7f8ff', o: 0 });
const mEnds = mk(mPill, 't r', { left: 167, top: 4, font: '700 38px "Plus Jakarta Sans Variable"', color: '#050505' }, 'Ends in');
const mClock = mk(mPill, 'a', { left: 199, top: 4, width: 50, height: 50, background: '#090808', WebkitMask: `url(${IMG('n_clock.svg')}) center/contain no-repeat`, mask: `url(${IMG('n_clock.svg')}) center/contain no-repeat` });
const mTime = mk(mPill, 't r', { left: 437, top: 2, font: '700 40px "Plus Jakarta Sans Variable"', color: '#040404' }, '22:30:25');
const mC = [
  mk(mr, 'a', { left: 711, top: 322, width: 60.75, height: 60.75, borderRadius: '50%', background: '#6bfaff', boxShadow: '0 0 0 4.6px #3fedbb', o: 0 }),
  mk(mr, 'a', { left: 797.13, top: 322.9, width: 58.45, height: 58.45, borderRadius: '50%', background: '#000', boxShadow: 'inset 0 0 0 4.6px #3fedbb', o: 0 }),
  mk(mr, 'a', { left: 880.55, top: 322.9, width: 58.45, height: 58.45, borderRadius: '50%', background: '#000', boxShadow: 'inset 0 0 0 4.6px #3fedbb', o: 0 }),
];
const mCheck = mk(mr, 'img', { src: IMG('n_check.png'), left: 711, top: 322, width: 60.75, height: 60.75, o: 0 });
const mInfo = mk(mr, 'a', { left: 987, top: 33, width: 63, height: 63, borderRadius: '50%', background: '#3396ea', color: '#fff', font: '700 40px "Plus Jakarta Sans Variable"', display: 'grid', placeItems: 'center', o: 0 }, 'i');

const missions = mk(screen, 'img', { src: IMG('missions_a.png'), left: 15, top: 1855, width: 1042, height: 539 });

// wallet bar: the band and everything on it
const band = mk(screen, 'a', { left: 0, width: 1074 });
const wCard = mk(band, 'a', {});
const wChip = mk(band, 'a', { background: '#e7e7e9', borderRadius: 76 });
const wArrow = mk(band, 'img', { src: IMG('n_arrow.svg') });
const wNum = mk(band, 't', { color: '#171b20' });
const wCoin = mk(band, 'img', { src: IMG('o_coin_raw_a.png') });
const wGc = mk(band, 't c', { font: '600 36px "Plus Jakarta Sans Variable"', color: '#171b20' }, 'Game coins');
const wTime = mk(band, 't c', { color: '#04ae32' });
const wConv = mk(band, 't c', { color: '#171b20' });
const wBtn = mk(band, 'a', { borderRadius: 46, background: 'linear-gradient(200deg,#98f73a 0%,#0bdd66 100%)', boxShadow: '0 4px 6px rgba(30,36,97,.46)' });
const wAmt = mk(band, 't c', { color: '#171b20' });
const wLbl = mk(band, 't c', { color: '#171b20', font: '600 36px "Plus Jakarta Sans Variable"' }, 'Cash out');

mk(screen, 'a', { left: 370, top: 42, width: 339, height: 80, borderRadius: 40, background: '#000' }); // camera notch
mk(screen, 'img', { src: IMG('bottom_menu.png'), left: 0, top: 2165, width: 1074, height: 229 });

// ---------------------------------------------------------------- overlays
const ov = $('.hr-ov');
const selPool = Array.from({ length: 6 }, () => mk(ov, 'sel', { display: 'none' }, '<i></i><i></i><i></i><i></i><b></b>'));
const marq = mk(ov, 'a', { display: 'none' }); marq.classList.add('hr-marq');
const drawR = mk(ov, 'a', { display: 'none' }, '<b></b>'); drawR.classList.add('hr-draw');
const ripple = mk(ov, 'a', { o: 0 }); ripple.classList.add('hr-ripple');
const chip = mk(ov, 'a', { o: 0 }); chip.classList.add('hr-chip');
const panel = mk(ov, 'a', {}); panel.classList.add('hr-panel');
const picker = mk(ov, 'a', { o: 0 }); picker.classList.add('hr-picker');
picker.innerHTML = '<div class="tabs"><span>Solid</span><span>Linear</span></div><div class="sv"><div class="knob"></div></div><div class="hue"><div class="knob"></div></div><div class="hx"><span><i class="psw" style="width:16px;height:16px;border-radius:4px;display:block"></i><em style="font-style:normal"></em></span><span>100%</span></div>';
const cap = mk(ov, 'a', {}); cap.classList.add('hr-cap');
const flabel = mk(ov, 'a', {}); flabel.classList.add('hr-flabel');
const tagOld = mk(ov, 'tag', { o: 0 }, 'Before<small>original home screen</small>');
const tagNew = mk(ov, 'tag', { o: 0 }, 'After<small>revamped home screen</small>');
const cursor = mk(ov, 'a', {}); cursor.classList.add('hr-cursor');
const CUR = {
  arrow: '<svg width="34" height="34" viewBox="0 0 34 34"><path d="M7 4 L7 27 L13 21.5 L17.5 31 L21.5 29 L17 19.5 L25 19.5 Z" fill="#111" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>',
  text: '<svg width="34" height="34" viewBox="0 0 34 34"><path d="M12 6 h4 M18 6 h4 M17 6 v22 M12 28 h4 M18 28 h4" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M12 6 h4 M18 6 h4 M17 6 v22 M12 28 h4 M18 28 h4" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg>',
  cross: '<svg width="34" height="34" viewBox="0 0 34 34"><path d="M17 5 v24 M5 17 h24" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M17 5 v24 M5 17 h24" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg>',
};

// ---------------------------------------------------------------- layout through time
function layout(t) {
  const drag = P(t, S1 + 1.0, S1 + 2.4);
  const grow = P(t, S1 + 2.7, S1 + 3.3);
  const L = {};
  L.bandY = mix(354, 0, drag);
  L.bandH = mix(226, 377, grow);
  L.wShift = mix(0, 145, grow);
  L.bTop = mix(0, 377, P(t, S1 + 1.1, S1 + 2.5));
  L.bH = mix(354, 418, P(t, S1 + 1.1, S1 + 2.5));
  L.bIn = mix(0, 6, P(t, S1 + 1.1, S1 + 2.5));
  // double coins card, invite card, the story card and missions follow one another
  const streakH = 228 * (1 - P(t, S3 + 0.75, S3 + 1.2));
  L.streakH = streakH;
  L.dH = mix(195, 253, P(t, S3 + 1.45, S3 + 1.85));
  const gI = mix(33, 23, P(t, S3 + 1.45, S3 + 1.85));
  const swap = P(t, S4 + 7.95, S4 + 8.6);
  const dTop0 = mix(619, 818, drag);
  L.iH = mix(304, 237, P(t, S4 + 4.7, S4 + 5.0));
  const iFollow = dTop0 + L.dH + streakH + gI;
  L.iT = mix(iFollow, 818, swap);
  L.dT = mix(dTop0, 1078, swap);
  const lower = Math.max(L.dT + L.dH + streakH, L.iT + L.iH);
  const fit = P(t, S5 + 0.65, S5 + 1.0);
  L.sT = lower + mix(71, 23, fit);
  L.sX = mix(18, -4, fit);
  L.sW = mix(1038, 1082, fit);
  L.sH = mix(335, 415, P(t, S5 + 1.05, S5 + 1.35));
  L.sR = mix(40, 0, P(t, S5 + 1.45, S5 + 1.6));
  L.mT = L.sT + L.sH + mix(70, 23, fit);
  return L;
}

// colour picks: [open, close, dragFrom, dragTo, from, to, gradient?]
const PICKS = {
  band: { open: S1 + 4.15, close: S1 + 5.75, d0: S1 + 4.65, d1: S1 + 5.65, from: hex2('#1464ff'), to: hex2('#f2f2f2') },
  timer: { open: S2 + 1.8, close: S2 + 2.95, d0: S2 + 2.2, d1: S2 + 2.9, from: hex2('#24b29f'), to: hex2('#f7f8ff') },
  dbl: { open: S3 + 5.95, close: S3 + 6.95, solid: S3 + 6.2, d0: S3 + 6.4, d1: S3 + 6.9, from: hex2('#56ccf2'), to: hex2('#187ae3'), grad: true },
  inv: { open: S4 + 3.65, close: S4 + 4.45, solid: S4 + 3.85, d0: S4 + 3.95, d1: S4 + 4.4, from: hex2('#5aa4f8'), to: hex2('#f7f8ff'), grad: true },
};
function pickColor(k, t) { const p = PICKS[k]; return hsvMix(p.from, p.to, P(t, p.d0, p.d1, 'io')); }

// text edits
const ED = {
  num: { t0: S1 + 6.55, from: '236,378', to: '5.900.378', cps: 15 },
  time: { t0: S1 + 9.35, from: '3h 45', to: '3h 45m' },
  conv: { t0: S1 + 9.8, from: 'Converts in', to: 'Convert in' },
  amt: { t0: S1 + 10.4, from: '$99,99', to: '$99.99' },
  btime: { t0: S2 + 3.3, from: '22h 51m', to: '22:30:25', cps: 18 },
  dtitle: { t0: S3 + 4.15, from: 'Double Your Coins!', to: 'Play games to DOUBLE your coins', cps: 30 },
  dbar: { t0: S3 + 2.2, from: '', to: '200/400k', cps: 24 },
  invite: { t0: S4 + 7.35, from: '', to: 'Invite', cps: 20 },
  mtext: { t0: S5 + 2.75, from: '', to: 'Make room for more fun', cps: 26 },
  mmax: { t0: S5 + 3.8, from: '', to: 'Maximize your earnings', cps: 40 },
};
const tx = (k, t) => { const e = ED[k]; return typing(t, e.t0, e.from, e.to, e.cps || 14); };
const editing = (k, t, tail = 0.45) => { const e = ED[k]; const r = tx(k, t); return t >= e.t0 - 0.15 && (!r.done || t < e.t0 + 0.22 + (e.to.length / (e.cps || 14)) + tail); };

// ---------------------------------------------------------------- render
let measured = {};
function render(t) {
  const L = layout(t);

  // page
  pgOld.style.background = `linear-gradient(180deg,#fff 0px,#fff ${L.dT + 205}px,#eef3fd ${L.dT + 215}px,#f9f8f4 ${L.dT + 560}px)`;
  S(pgNew, { o: P(t, OUT + 0.2, OUT + 1.0) });

  // ----- banner
  S(bClip, { top: L.bTop, height: L.bH });
  S(bArt, { top: L.bIn });
  S(bTitle, { top: 34 + L.bIn });
  const bur = P(t, S2 + 0.8, S2 + 1.1);
  S(bBurger, { top: 174 + L.bIn, o: 1 - bur, tf: `scale(${1 - bur * 0.6})` });
  // timer pill: colour from the picker, then content and colours of the text
  const tc = t < PICKS.timer.d0 ? PICKS.timer.from : pickColor('timer', t);
  const tInk = P(t, S2 + 3.3, S2 + 3.6);
  const ink = rgb(cmix([255, 255, 255], [5, 5, 5], tInk));
  const tGrow = P(t, S2 + 3.35, S2 + 3.85);
  S(bTimer, { background: rgb(tc), width: mix(443, 461, tGrow), top: mix(268 + L.bIn, 283, tGrow) });
  S(bTimerLbl, { color: ink, fontWeight: tInk > 0.5 ? 700 : 600 });
  bClock.style.background = ink;
  S(bTime, { color: ink, left: mix(418, 437, tGrow) });
  setHTML(bTime, textHTML(tx('btime', t), editing('btime', t)));
  // info: teal dot by the timer travels to the top right corner and turns blue
  const im = P(t, S2 + 4.3, S2 + 4.75);
  const ic = P(t, S2 + 4.55, S2 + 4.85);
  const isz = mix(48, 63, ic);
  const icx = mix(546, 1013.5, im), icy = mix(291.5 + L.bIn, 64.5, im);
  S(bInfo, { left: icx - isz / 2, top: icy - isz / 2, width: isz, height: isz, background: rgb(cmix(hex2('#24b29f'), hex2('#3396ea'), ic)), fontSize: mix(32, 40, ic), boxShadow: `-2px 2px 0 rgba(60,60,60,${0.55 * (1 - ic)})` });
  bDots.forEach((d, i) => { const p = P(t, S2 + 5.05 + i * 0.09, S2 + 5.35 + i * 0.09, 'back'); S(d, { o: P(t, S2 + 5.05 + i * 0.09, S2 + 5.15 + i * 0.09), tf: `scale(${p})` }); });

  // ----- wallet band
  const bandC = t < PICKS.band.d0 ? PICKS.band.from : pickColor('band', t);
  S(band, { top: L.bandY, height: L.bandH, background: rgb(bandC) });
  const sh = L.wShift;
  S(wCard, { left: 18, top: 27 + sh, width: 1038, height: 170, borderRadius: mix(40, 46, P(t, S1 + 2.7, S1 + 3.3)), background: '#f2f2f2' });
  const chipGone = P(t, S1 + 8.85, S1 + 9.1);
  S(wChip, { left: 427, top: 35 + sh, width: 204, height: 153, o: 1 - chipGone, tf: `scale(${1 - 0.3 * chipGone})` });
  // number
  const nP = P(t, S1 + 6.85, S1 + 7.4);
  S(wNum, { left: mix(90, 33, nP), top: mix(55 + sh, 201, nP), font: `700 ${mix(55, 52, nP)}px "Plus Jakarta Sans Variable"` });
  setHTML(wNum, textHTML(tx('num', t), editing('num', t)));
  // align left: coin and "Game coins"
  const al = P(t, S1 + 8.25, S1 + 8.7);
  const gcW = measured.gc || 196;
  S(wGc, { left: mix(221, 33 + gcW / 2, al), top: 126 + sh });
  const coinS = mix(1, 55 / 71, al);
  const coinX = mix(326, 253, al), coinY = mix(57 + sh, 273, al);
  S(wCoin, { left: coinX - 6 * coinS, top: coinY - 7 * coinS, width: 84 * coinS, height: 92 * coinS });
  // middle column
  const mP = P(t, S1 + 9.4, S1 + 10.0);
  S(wTime, { left: mix(530, 537, mP), top: mix(69 + sh, 204, mP), font: `${mP > 0.5 ? 700 : 800} ${mix(42, 52, mP)}px "Plus Jakarta Sans Variable"` });
  setHTML(wTime, textHTML(tx('time', t), editing('time', t)));
  const cP = P(t, S1 + 9.85, S1 + 10.3);
  S(wConv, { left: mix(530, 537, cP), top: mix(112 + sh, 274, cP), font: `700 ${mix(30, 36, cP)}px "Plus Jakarta Sans Variable"` });
  setHTML(wConv, textHTML(tx('conv', t), editing('conv', t)));
  const aP = P(t, S1 + 9.85, S1 + 10.35);
  S(wArrow, { left: mix(499, 485, aP), top: mix(43 + sh, 150, aP), width: mix(67, 105, aP), height: mix(28, 44, aP) });
  // cash out
  const kP = P(t, S1 + 10.5, S1 + 11.0);
  S(wBtn, { left: mix(662, 720, kP), top: 40 + sh, width: mix(379, 321, kP), height: 144 });
  S(wAmt, { left: mix(851.5, 880, kP), top: 55 + sh, font: `700 ${mix(55, 52, kP)}px "Plus Jakarta Sans Variable"` });
  setHTML(wAmt, textHTML(tx('amt', t), editing('amt', t)));
  S(wLbl, { left: mix(852, 880.5, kP), top: 126 + sh, fontWeight: kP > 0.5 ? 700 : 600 });

  // ----- double coins
  S(streak, { top: L.dT + 195, height: L.streakH, o: L.streakH / 228 > 0.02 ? 0.25 + 0.75 * (L.streakH / 228) : 0 });
  S(dbl, { top: L.dT, height: L.dH });
  const dc = t < PICKS.dbl.d0 ? PICKS.dbl.from : pickColor('dbl', t);
  const dSolid = P(t, PICKS.dbl.solid, PICKS.dbl.solid + 0.15);
  S(dBgOld, { o: 1 - dSolid });
  S(dBgNew, { o: dSolid, background: rgb(dc), boxShadow: `inset 0 0 0 ${P(t, PICKS.dbl.d1, PICKS.dbl.d1 + .2)}px #00569e` });
  const dtr = tx('dtitle', t);
  S(dTitleOld, { o: t < ED.dtitle.t0 + 0.2 ? 1 : 0 });
  setHTML(dTitleNew, t < ED.dtitle.t0 + 0.2 ? '' : textHTML(dtr, editing('dtitle', t)));
  const bP = P(t, S3 + 2.15, S3 + 2.65);
  S(dBar, { left: mix(157, 588, bP), top: mix(88, 148, bP), width: mix(724, 412, bP), height: mix(70, 68, bP), borderRadius: 40, background: rgb(cmix(hex2('#022c7f'), hex2('#fdfefe'), bP)), boxShadow: `0 0 0 ${3 * (1 - bP)}px #31affe` });
  S(dBarFill, { width: mix(353, 187, bP), background: rgb(cmix(hex2('#8eff6e'), hex2('#8eff6f'), bP)), borderRadius: 40 });
  S(dBarTextOld, { left: mix(386, 600, bP), o: 1 - P(t, S3 + 2.15, S3 + 2.3) });
  setHTML(dBarTextNew, textHTML(tx('dbar', t), editing('dbar', t)));
  const gP = P(t, S3 + 2.95, S3 + 3.35);
  S(dTarget, { left: mix(8, 483, gP), top: mix(33, 112, gP) });
  S(dDart, { left: mix(82, 557, gP), top: mix(37, 116, gP) });
  const x2 = P(t, S3 + 3.65, S3 + 3.85);
  S(d2x, { o: 1 - x2, tf: `scale(${1 - 0.4 * x2})` });
  const cas = P(t, S3 + 7.45, S3 + 8.0);
  S(dCoins, { o: 1 - P(t, S3 + 7.45, S3 + 7.65) });
  S(dCascade, { o: P(t, S3 + 7.45, S3 + 7.65), tf: `scale(${mix(0.86, 1, cas)})`, transformOrigin: '60% 70%' });

  // ----- invite
  S(inv, { top: L.iT, height: L.iH });
  const iSolid = P(t, PICKS.inv.solid, PICKS.inv.solid + 0.15);
  const ic2 = t < PICKS.inv.d0 ? PICKS.inv.from : pickColor('inv', t);
  const shadowA = 0.5 * (1 - P(t, PICKS.inv.d0, PICKS.inv.d1));
  const iR = mix(46, 31, P(t, S4 + 5.2, S4 + 5.6));
  S(iBg, { borderRadius: iR, boxShadow: `0 4px 4px rgba(0,2,54,${shadowA})`, background: iSolid < 1 ? `linear-gradient(122deg, ${rgb(hex2('#5aa4f8'))} 17.8%, ${rgb(hex2('#6defe9'), 1 - iSolid)} 76.6%), ${rgb(ic2)}` : rgb(ic2) });
  if (iSolid >= 1) iBg.style.background = rgb(ic2);
  else iBg.style.background = `linear-gradient(122deg, ${rgb(cmix(hex2('#5aa4f8'), ic2, iSolid))} 17.8%, ${rgb(cmix(hex2('#6defe9'), ic2, iSolid))} 76.6%)`;
  S(iStripes, { borderRadius: iR });
  const fx = P(t, S4 + 0.55, S4 + 0.95);
  S(iFox, { left: 719 + 520 * fx, top: -15 - 60 * fx, o: 1 - P(t, S4 + 0.85, S4 + 1.05), tf: `rotate(${12 * fx}deg)` });
  const dec = P(t, S4 + 1.75, S4 + 1.95);
  [iTitle, iStarS, iStarB, iStarR, iStripes].forEach((el) => { el.style.opacity = 1 - dec; });
  // the line of copy becomes the headline
  const tw = P(t, S4 + 2.45, S4 + 2.85);
  const ta = P(t, S4 + 2.85, S4 + 3.25);
  const centred = t >= S4 + 2.85;
  S(iText, { left: centred ? mix(89, 0, ta) : 89, top: mix(150, 24, ta), width: centred ? mix(560, 1038, ta) : 496, textAlign: centred ? 'center' : 'left', whiteSpace: centred ? 'nowrap' : 'normal', font: `${tw > 0.3 ? 700 : 500} ${mix(40, 48, tw)}px "Plus Jakarta Sans Variable"`, color: rgb(cmix(hex2('#0a3e99'), hex2('#00060f'), tw)) });
  const dsh = P(t, S4 + 5.2, S4 + 5.6);
  S(iDash, { left: mix(51, 0, dsh), top: mix(131, 0, dsh), width: mix(565, 1038, dsh), height: mix(144, L.iH, dsh), borderRadius: mix(23, 31, dsh), borderColor: rgb(cmix(hex2('#3c8ae4'), hex2('#88bdd0'), dsh)) });
  // avatars: one drawn, four duplicated
  iAv.forEach((a, i) => {
    const t0 = i === 0 ? S4 + 6.05 : S4 + 6.15 + 0.15 * i;
    const p = P(t, t0, t0 + 0.28, 'back');
    S(a, { o: P(t, t0, t0 + 0.06), left: i === 0 ? 119 : mix(119 + 99.387 * (i - 1), 119 + 99.387 * i, P(t, t0, t0 + 0.22)), tf: `scale(${i === 0 ? p : 1})` });
  });
  S(iBtn, { o: P(t, S4 + 7.3, S4 + 7.36), tf: `scale(${mix(0.96, 1, P(t, S4 + 7.3, S4 + 7.5, 'back'))})` });
  setHTML(iBtnTxt, textHTML(tx('invite', t), editing('invite', t)));

  // ----- story card
  S(mr, { left: L.sX, top: L.sT, width: L.sW, height: L.sH, borderRadius: L.sR });
  const rep = P(t, S5 + 1.9, S5 + 2.5);
  S(mOld, { o: 1 - P(t, S5 + 1.9, S5 + 2.2) });
  S(mScene, { left: -36 - (L.sX + 4), o: P(t, S5 + 1.9, S5 + 2.15), tf: `scaleX(-1) scale(${mix(1.14, 1, E.out(rep))})` });
  setHTML(mText, t < ED.mtext.t0 ? '' : textHTML(tx('mtext', t), editing('mtext', t)));
  setHTML(mMax, t < ED.mmax.t0 ? '' : textHTML(tx('mmax', t), editing('mmax', t)));
  const pf = P(t, S5 + 4.85, S5 + 4.95);
  S(mPill, { o: pf });
  [mEnds, mClock, mTime].forEach((el, i) => { const p = P(t, S5 + 4.95 + i * 0.1, S5 + 5.2 + i * 0.1, 'back'); S(el, { o: P(t, S5 + 4.95 + i * 0.1, S5 + 5.02 + i * 0.1), tf: `${el === mClock ? '' : 'translateX(-100%)'} scale(${p})` }); });
  mC.forEach((c, i) => { const p = P(t, S5 + 5.4 + i * 0.1, S5 + 5.65 + i * 0.1, 'back'); S(c, { o: P(t, S5 + 5.4 + i * 0.1, S5 + 5.46 + i * 0.1), tf: `scale(${p})` }); });
  S(mCheck, { o: P(t, S5 + 5.75, S5 + 5.85), tf: `scale(${P(t, S5 + 5.75, S5 + 6.0, 'back')})` });
  S(mInfo, { o: P(t, S5 + 5.9, S5 + 5.96), tf: `scale(${P(t, S5 + 5.9, S5 + 6.15, 'back')})` });

  S(missions, { top: L.mT });

  // ----- camera
  const C = camera(t);
  const k = 0.4 * C[2];
  world.style.transform = `translate(${C[3] - C[0] * k}px, ${540 - C[1] * k}px) scale(${k})`;
  phoneEl.style.opacity = screen.style.opacity = P(t, 0, 0.6);

  overlays(t, L, k);
}

function camera(t) {
  const keys = [
    [0, [537, 1197, 1, 960]],
    [S1 + 0.1, [537, 1197, 1, 960]], [S1 + 0.8, [537, 560, 1.5, 760]],
    [S1 + 5.9, [537, 560, 1.5, 760]], [S1 + 6.5, [537, 255, 2.5, 760]],
    [S2 - 0.05, [537, 255, 2.5, 760]], [S2 + 0.6, [537, 590, 1.9, 840]],
    [S3 - 0.05, [537, 590, 1.9, 840]], [S3 + 0.6, [537, 1080, 1.85, 840]],
    [S4 - 0.05, [537, 1080, 1.85, 840]], [S4 + 0.6, [537, 1250, 1.85, 840]],
    [S4 + 7.9, [537, 1250, 1.85, 840]], [S4 + 8.6, [537, 1020, 1.85, 840]],
    [S5 - 0.05, [537, 1020, 1.85, 840]], [S5 + 0.6, [537, 1540, 1.8, 840]],
    [OUT + 0.2, [537, 1540, 1.8, 840]], [OUT + 1.4, [537, 1197, 1, 960]],
    [OUT + 1.7, [537, 1197, 1, 960]], [OUT + 2.6, [537, 1197, 0.86, 1270]],
  ];
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) { const p = E.io((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0])); return keys[i - 1][1].map((v, j) => mix(v, keys[i][1][j], p)); }
  }
  return keys[keys.length - 1][1];
}

// ---------------------------------------------------------------- overlays: cursor, selection, panel, picker
let SR = { left: 0, top: 0, width: 1920 }, SK = 1;
const R = (el) => { const r = el.getBoundingClientRect(); return { left: (r.left - SR.left) / SK, top: (r.top - SR.top) / SK, right: (r.right - SR.left) / SK, bottom: (r.bottom - SR.top) / SK, width: r.width / SK, height: r.height / SK }; };
const at = (el, fx = 0.5, fy = 0.5, dx = 0, dy = 0) => () => { const r = R(el); return [r.left + r.width * fx + dx, r.top + r.height * fy + dy]; };
const D = (x, y) => () => { const r = R(screen); const k = r.width / 1074; return [r.left + x * k, r.top + y * k]; };
const inScr = (el, x, y) => () => { const r = R(el); const k = R(screen).width / 1074; return [r.left + x * k, r.top + y * k]; };
const pf = (sel, fx = 0.5, fy = 0.5) => () => { const el = panel.querySelector(sel); if (!el) return [1700, 400]; const r = R(el); return [r.left + r.width * fx, r.top + r.height * fy]; };
const pk = (fn) => () => fn();

// selection: [t0, t1, () => [elements], label]
const SEL = [
  [S1 + 0.85, S1 + 4.05, () => [band], 'Wallet bar'],
  [S1 + 4.05, S1 + 6.2, () => [band], 'Wallet bar'],
  [S1 + 6.25, S1 + 7.95, () => [wNum], 'Coins value'],
  [S1 + 8.0, S1 + 8.8, () => [wCoin, wGc], ''],
  [S1 + 8.75, S1 + 9.1, () => [wChip], 'Pill'],
  [S1 + 9.15, S1 + 9.7, () => [wTime], 'Timer'],
  [S1 + 9.7, S1 + 10.25, () => [wConv], 'Label'],
  [S1 + 10.25, S1 + 11.3, () => [wAmt, wBtn], 'Cash out'],
  [S2 + 0.65, S2 + 0.85, () => [bBurger], 'Menu'],
  [S2 + 1.45, S2 + 3.2, () => [bTimer], 'Event timer'],
  [S2 + 3.2, S2 + 4.15, () => [bTime], 'Time'],
  [S2 + 4.2, S2 + 4.95, () => [bInfo], 'Info'],
  [S2 + 5.2, S2 + 5.7, () => [bDots[0], bDots[3]], 'Carousel dots', true],
  [S3 + 0.6, S3 + 0.8, () => [streak], 'Daily streak'],
  [S3 + 1.2, S3 + 2.05, () => [dbl], 'Double coins'],
  [S3 + 2.1, S3 + 2.85, () => [dBar], 'Progress'],
  [S3 + 2.9, S3 + 3.5, () => [dTarget], 'Target'],
  [S3 + 3.6, S3 + 3.7, () => [d2x], '2x'],
  [S3 + 4.05, S3 + 5.6, () => [dTitleNew.textContent ? dTitleNew : dTitleOld], 'Title'],
  [S3 + 5.7, S3 + 7.05, () => [dbl], 'Double coins'],
  [S3 + 7.2, S3 + 8.2, () => [dCascade.style.opacity > 0.5 ? dCascade : dCoins], 'Coins'],
  [S4 + 0.5, S4 + 0.95, () => [iFox], 'Fox'],
  [S4 + 1.65, S4 + 1.8, () => [iTitle, iStarS, iStarB, iStarR, iStripes], ''],
  [S4 + 2.25, S4 + 3.35, () => [iText], 'Text'],
  [S4 + 3.5, S4 + 5.1, () => [inv], 'Invite'],
  [S4 + 5.15, S4 + 5.65, () => [iDash], 'Stroke'],
  [S4 + 7.75, S4 + 8.75, () => [inv], 'Invite'],
  [S5 + 0.45, S5 + 2.6, () => [mr], 'Story card'],
  [S5 + 5.95, S5 + 6.3, () => [mr], 'Story card'],
];
// [t0, t1, from(), to(), label, kind]
const DRAWS = [
  [S2 + 4.85, S2 + 5.05, D(461, 0), D(608, 0), '', 'draw', () => { const r = R(bClip); const k = R(screen).width / 1074; return [r.left + 457 * k, r.top + 365 * k, r.left + 612 * k, r.top + 397 * k]; }],
  [S4 + 1.3, S4 + 1.65, null, null, '', 'marq', () => { const r = R(inv); const k = R(screen).width / 1074; return [r.left - 12 * k, r.top - 30 * k, r.left + 1050 * k, r.top + 128 * k]; }],
  [S4 + 5.8, S4 + 6.05, null, null, '76 × 76', 'draw', () => { const r = R(inv); const k = R(screen).width / 1074; return [r.left + 119 * k, r.top + 111 * k, r.left + 195.45 * k, r.top + 187.45 * k]; }, 'circle'],
  [S4 + 7.0, S4 + 7.3, null, null, '248 × 89', 'draw', () => { const r = R(inv); const k = R(screen).width / 1074; return [r.left + 669 * k, r.top + 105 * k, r.left + 917 * k, r.top + 194 * k]; }],
  [S5 + 4.55, S5 + 4.85, null, null, '461 × 59', 'draw', () => { const r = R(mr); const k = R(screen).width / 1074; return [r.left + 62 * k, r.top + 323 * k, r.left + 523 * k, r.top + 382 * k]; }],
];
// cursor path: [start moving, arrive, target()]
const CP = [
  [0, 0, () => [1720, 1010]],
  [1.2, 1.9, () => [1480, 820]],
  [S1 + 0.3, S1 + 0.8, at(wCard, 0.35, 0.5)],
  [S1 + 1.0, S1 + 2.4, at(wCard, 0.35, 0.5)],
  [S1 + 2.45, S1 + 2.65, at(band, 0.5, 1)],
  [S1 + 2.7, S1 + 3.3, at(band, 0.5, 1)],
  [S1 + 3.65, S1 + 4.0, pf('[data-f=fill] .sw')],
  [S1 + 4.25, S1 + 4.6, () => pickerKnob('band')],
  [S1 + 4.65, S1 + 5.65, () => pickerKnob('band')],
  [S1 + 5.8, S1 + 6.2, at(wNum, 0.5, 0.55)],
  [S1 + 6.25, S1 + 6.5, pf('[data-f=content]', 0.85, 0.5)],
  [S1 + 7.55, S1 + 7.95, at(wCoin, 0.5, 0.5)],
  [S1 + 8.0, S1 + 8.2, pf('[data-f=align] span:first-child')],
  [S1 + 8.5, S1 + 8.75, at(wChip, 0.15, 0.2)],
  [S1 + 9.0, S1 + 9.2, at(wTime, 0.8, 0.5)],
  [S1 + 9.5, S1 + 9.75, at(wConv, 0.75, 0.5)],
  [S1 + 10.05, S1 + 10.35, at(wAmt, 0.5, 0.5)],
  [S1 + 10.5, S1 + 11.0, at(wBtn, 0.5, 0.88)],
  [S2 + 0.1, S2 + 0.6, at(bBurger, 0.5, 0.5)],
  [S2 + 1.1, S2 + 1.4, at(bTimer, 0.3, 0.5)],
  [S2 + 1.45, S2 + 1.75, pf('[data-f=fill] .sw')],
  [S2 + 1.85, S2 + 2.15, () => pickerKnob('timer')],
  [S2 + 2.2, S2 + 2.9, () => pickerKnob('timer')],
  [S2 + 2.95, S2 + 3.2, at(bTime, 0.6, 0.5)],
  [S2 + 3.95, S2 + 4.2, at(bInfo, 0.5, 0.5)],
  [S2 + 4.3, S2 + 4.75, at(bInfo, 0.5, 0.5)],
  [S2 + 4.75, S2 + 4.85, inScr(bClip, 457, 365)],
  [S2 + 4.85, S2 + 5.05, inScr(bClip, 612, 397)],
  [S3 + 0.15, S3 + 0.55, at(streak, 0.5, 0.45)],
  [S3 + 1.2, S3 + 1.4, at(dbl, 0.5, 1)],
  [S3 + 1.45, S3 + 1.85, at(dbl, 0.5, 1)],
  [S3 + 1.9, S3 + 2.05, at(dBar, 0.3, 0.5)],
  [S3 + 2.75, S3 + 2.9, at(dTarget, 0.5, 0.5)],
  [S3 + 2.95, S3 + 3.35, at(dTarget, 0.5, 0.5)],
  [S3 + 3.4, S3 + 3.55, at(d2x, 0.5, 0.5)],
  [S3 + 3.85, S3 + 4.0, at(dTitleOld, 0.5, 0.5)],
  [S3 + 4.15, S3 + 4.3, pf('[data-f=content]', 0.9, 0.5)],
  [S3 + 5.5, S3 + 5.65, inScr(dbl, 520, 60)],
  [S3 + 5.75, S3 + 5.9, pf('[data-f=fill] .sw')],
  [S3 + 6.0, S3 + 6.15, () => pickerTab(0)],
  [S3 + 6.25, S3 + 6.35, () => pickerKnob('dbl')],
  [S3 + 6.4, S3 + 6.9, () => pickerKnob('dbl')],
  [S3 + 7.0, S3 + 7.15, at(dCoins, 0.5, 0.6)],
  [S3 + 7.25, S3 + 7.4, pf('[data-f=replace]')],
  [S4 + 0.2, S4 + 0.45, at(iFox, 0.5, 0.45)],
  [S4 + 0.55, S4 + 0.95, at(iFox, 0.5, 0.45)],
  [S4 + 1.1, S4 + 1.25, inScr(inv, -12, -30)],
  [S4 + 1.3, S4 + 1.65, inScr(inv, 1050, 128)],
  [S4 + 2.0, S4 + 2.2, at(iText, 0.3, 0.5)],
  [S4 + 2.6, S4 + 2.8, pf('[data-f=align] span:nth-child(2)')],
  [S4 + 3.3, S4 + 3.45, inScr(inv, 600, 280)],
  [S4 + 3.5, S4 + 3.6, pf('[data-f=fill] .sw')],
  [S4 + 3.7, S4 + 3.82, () => pickerTab(0)],
  [S4 + 3.87, S4 + 3.93, () => pickerKnob('inv')],
  [S4 + 3.95, S4 + 4.4, () => pickerKnob('inv')],
  [S4 + 4.5, S4 + 4.65, at(inv, 0.5, 1)],
  [S4 + 4.7, S4 + 5.0, at(inv, 0.5, 1)],
  [S4 + 5.0, S4 + 5.15, at(iDash, 0, 0)],
  [S4 + 5.2, S4 + 5.6, at(iDash, 0, 0)],
  [S4 + 5.6, S4 + 5.75, inScr(inv, 119, 111)],
  [S4 + 5.8, S4 + 6.05, inScr(inv, 195, 187)],
  [S4 + 6.7, S4 + 6.95, inScr(inv, 669, 105)],
  [S4 + 7.0, S4 + 7.3, inScr(inv, 917, 194)],
  [S4 + 7.7, S4 + 7.9, at(inv, 0.45, 0.4)],
  [S4 + 7.95, S4 + 8.6, at(inv, 0.45, 0.4)],
  [S5 + 0.2, S5 + 0.4, at(mr, 0.6, 0.6)],
  [S5 + 0.5, S5 + 0.6, at(mr, 1, 0.5)],
  [S5 + 0.65, S5 + 1.0, at(mr, 1, 0.5)],
  [S5 + 1.0, S5 + 1.05, at(mr, 0.5, 1)],
  [S5 + 1.05, S5 + 1.35, at(mr, 0.5, 1)],
  [S5 + 1.38, S5 + 1.5, pf('[data-f=radius]', 0.8, 0.5)],
  [S5 + 1.65, S5 + 1.8, pf('[data-f=replace]')],
  [S5 + 2.55, S5 + 2.7, inScr(mr, 66, 120)],
  [S5 + 3.7, S5 + 3.78, inScr(mr, 90, 275)],
  [S5 + 4.4, S5 + 4.5, inScr(mr, 62, 323)],
  [S5 + 4.55, S5 + 4.85, inScr(mr, 523, 382)],
  [S5 + 5.2, S5 + 5.35, inScr(mr, 820, 352)],
  [OUT + 0.1, OUT + 0.9, () => [2000, 1180]],
];
const CTYPE = [[0, 'arrow'], [S2 + 4.75, 'cross'], [S2 + 5.1, 'arrow'], [S4 + 5.62, 'cross'], [S4 + 6.1, 'arrow'], [S4 + 6.75, 'cross'], [S4 + 7.35, 'arrow'], [S5 + 2.5, 'text'], [S5 + 4.38, 'cross'], [S5 + 4.9, 'arrow']];
const CLICKS = [S1 + 0.85, S1 + 4.05, S1 + 6.2, S1 + 6.3, S1 + 6.52, S1 + 7.98, S1 + 8.25, S1 + 8.78, S1 + 9.2, S1 + 9.27, S1 + 9.76, S1 + 9.82, S1 + 10.35, S1 + 10.41,
  S2 + 0.65, S2 + 1.45, S2 + 1.8, S2 + 3.2, S2 + 3.26, S2 + 4.25,
  S3 + 0.6, S3 + 1.45, S3 + 2.1, S3 + 2.95, S3 + 3.6, S3 + 4.05, S3 + 4.11, S3 + 5.7, S3 + 5.95, S3 + 6.2, S3 + 7.2, S3 + 7.45,
  S4 + 0.5, S4 + 2.25, S4 + 2.85, S4 + 3.5, S4 + 3.65, S4 + 3.85, S4 + 7.75,
  S5 + 0.45, S5 + 1.55, S5 + 1.85, S5 + 2.75, S5 + 3.8, S5 + 5.4];
const CHIPS = [[S1 + 8.9, 'Delete'], [S2 + 0.75, 'Delete'], [S3 + 0.72, 'Delete'], [S3 + 3.65, 'Delete'], [S4 + 0.9, 'Delete'], [S4 + 1.72, 'Delete'], [S4 + 6.12, '⌘ D  ×4'], [S5 + 0.6, '⌥  resize from centre'], [S5 + 2.5, 'T  Text'], [S5 + 4.38, 'R  Rectangle'], [S5 + 5.3, 'Paste components']];
// rectangle tool and circle tool chips in the invite scene
CHIPS.push([S4 + 5.62, 'O  Ellipse'], [S4 + 6.75, 'R  Rectangle']);
CHIPS.sort((a, b) => a[0] - b[0]);

function cursorAt(t) {
  let pos = CP[0][2]();
  for (let i = 1; i < CP.length; i++) {
    const [t0, t1, fn] = CP[i];
    if (t < t0) break;
    const target = fn();
    if (t >= t1) pos = target;
    else { const p = E.io((t - t0) / (t1 - t0)); pos = [mix(pos[0], target[0], p), mix(pos[1], target[1], p)]; }
  }
  return pos;
}
function pickerKnob(k) {
  const pr = R(picker); const c = R($('.hr-picker .sv'));
  const col = PICKS[k].d0 > tNow ? PICKS[k].from : pickColor(k, tNow);
  const [, s, v] = rgb2hsv(col);
  return [c.left + s * c.width, c.top + (1 - v) * c.height];
}
function pickerTab(i) { const r = R($('.hr-picker .tabs').children[i]); return [r.left + r.width / 2, r.top + r.height / 2]; }

// panel content by time
function panelState(t, L) {
  const fillRow = (hex, on, label = 'Fill') => `<div class="sec"><div class="lb">${label}</div><div class="row"><div class="f${on ? ' on' : ''}" data-f="fill"><span class="sw" style="background:#${hex}"></span>${hex}<small style="margin-left:auto">100%</small></div></div></div>`;
  const textSec = (o) => `<div class="sec"><div class="lb">Text</div>
      <div class="row"><div class="f tall${o.on === 'content' ? ' on' : ''}" data-f="content">${o.content}</div></div>
      <div class="row"><div class="f${o.on === 'font' ? ' on' : ''}" data-f="font">${o.font}</div></div>
      <div class="row"><div class="f${o.on === 'weight' ? ' on' : ''}" data-f="weight">${o.weight}</div><div class="f${o.on === 'size' ? ' on' : ''}" data-f="size" style="flex:.7"><small>Size</small>${o.size}</div></div>
      <div class="row"><div class="al" data-f="align"><span class="${o.align === 'left' ? 'on' : ''}"><i style="width:14px"></i></span><span class="${o.align === 'center' ? 'on' : ''}"><i style="width:10px"></i></span><span class="${o.align === 'right' ? 'on' : ''}"><i style="width:14px"></i></span></div></div></div>`;
  const frame = (o) => `<div class="sec"><div class="lb">Frame</div><div class="row"><div class="f"><small>X</small>${Math.round(o.x)}</div><div class="f"><small>Y</small>${Math.round(o.y)}</div></div><div class="row"><div class="f${o.on === 'w' ? ' on' : ''}"><small>W</small>${Math.round(o.w)}</div><div class="f${o.on === 'h' ? ' on' : ''}"><small>H</small>${Math.round(o.h)}</div></div>${o.r != null ? `<div class="row"><div class="f${o.on === 'r' ? ' on' : ''}" data-f="radius"><small>Radius</small>${Math.round(o.r)}</div></div>` : ''}</div>`;
  const imgSec = (src, on) => `<div class="sec"><div class="lb">Image fill</div><div class="row" style="align-items:center"><span class="thumb" style="background-image:url(${src})"></span><div class="btn${on ? ' on' : ''}" data-f="replace">Replace image</div></div></div>`;
  const hd = (ic, name) => `<div class="hd"><span class="ic">${ic}</span>${name}</div>`;
  const ed = (k) => { const r = tx(k, t); return textHTML(r, editing(k, t, 0.8)); };

  if (t < S1 + 0.85) return null;
  if (t < S1 + 6.25) {
    const c = t < PICKS.band.d0 ? PICKS.band.from : pickColor('band', t);
    return hd('#', 'Wallet bar') + frame({ x: 0, y: L.bandY, w: 1074, h: L.bandH, on: t > S1 + 2.65 && t < S1 + 3.4 ? 'h' : '' }) + fillRow(toHex(c), t > S1 + 4.0 && t < S1 + 5.8);
  }
  if (t < S1 + 7.98) return hd('T', 'Coins value') + textSec({ content: ed('num'), font: 'Plus Jakarta Sans', weight: 'Bold', size: Math.round(mix(55, 52, P(t, S1 + 6.85, S1 + 7.4))), align: 'left', on: t < S1 + 7.5 ? 'content' : '' }) + fillRow('171B20', false);
  if (t < S1 + 8.75) return hd('⌗', '2 layers') + textSec({ content: 'Mixed', font: 'Plus Jakarta Sans', weight: 'SemiBold', size: 36, align: t > S1 + 8.25 ? 'left' : 'center', on: '' });
  if (t < S1 + 9.15) return hd('#', 'Pill') + frame({ x: 427, y: 180, w: 204, h: 153, r: 76 }) + fillRow('E7E7E9', false);
  if (t < S1 + 9.7) return hd('T', 'Timer') + textSec({ content: ed('time'), font: 'Plus Jakarta Sans', weight: P(t, S1 + 9.4, S1 + 10) > 0.5 ? 'Bold' : 'ExtraBold', size: Math.round(mix(42, 52, P(t, S1 + 9.4, S1 + 10))), align: 'center', on: 'content' }) + fillRow('04AE32', false);
  if (t < S1 + 10.25) return hd('T', 'Label') + textSec({ content: ed('conv'), font: 'Plus Jakarta Sans', weight: 'Bold', size: Math.round(mix(30, 36, P(t, S1 + 9.85, S1 + 10.3))), align: 'center', on: 'content' }) + fillRow('171B20', false);
  if (t < S1 + 11.4) return hd('T', 'Cash out') + textSec({ content: ed('amt'), font: 'Plus Jakarta Sans', weight: 'Bold', size: Math.round(mix(55, 52, P(t, S1 + 10.5, S1 + 11.0))), align: 'center', on: t < S1 + 10.9 ? 'content' : '' }) + frame({ x: mix(662, 720, P(t, S1 + 10.5, S1 + 11.0)), y: 185, w: mix(379, 321, P(t, S1 + 10.5, S1 + 11.0)), h: 144, on: t > S1 + 10.5 ? 'w' : '' });
  if (t < S2 + 0.65) return null;
  if (t < S2 + 1.45) return hd('#', 'Menu') + frame({ x: 909, y: 174, w: 109, h: 73 });
  if (t < S2 + 3.2) { const c = t < PICKS.timer.d0 ? PICKS.timer.from : pickColor('timer', t); return hd('#', 'Event timer') + frame({ x: 58, y: 268, w: 443, h: 59, r: 46 }) + fillRow(toHex(c), t > S2 + 1.7 && t < S2 + 3.0); }
  if (t < S2 + 4.2) { const ink = toHex(cmix([255, 255, 255], [4, 4, 4], P(t, S2 + 3.3, S2 + 3.6))); return hd('T', 'Time') + textSec({ content: ed('btime'), font: 'Plus Jakarta Sans', weight: 'Bold', size: 40, align: 'right', on: 'content' }) + fillRow(ink, false); }
  if (t < S2 + 5.0) { const ic = P(t, S2 + 4.55, S2 + 4.85); return hd('#', 'Info') + frame({ x: mix(522, 982, P(t, S2 + 4.3, S2 + 4.75)), y: mix(267, 33, P(t, S2 + 4.3, S2 + 4.75)), w: mix(48, 63, ic), h: mix(48, 63, ic) }) + fillRow(toHex(cmix(hex2('#24b29f'), hex2('#3396ea'), ic)), ic > 0 && ic < 1); }
  if (t < S2 + 5.7) return hd('◦', 'Carousel dots') + frame({ x: 461, y: 369, w: 147, h: 24 }) + fillRow('C4C4C4', false);
  if (t < S3 + 0.6) return null;
  if (t < S3 + 2.1) return hd('#', t < S3 + 1.2 ? 'Daily streak' : 'Double coins') + frame({ x: 18, y: Math.round(L.dT), w: 1038, h: L.dH, on: t > S3 + 1.4 ? 'h' : '' });
  if (t < S3 + 2.9) { const bP = P(t, S3 + 2.15, S3 + 2.65); return hd('#', 'Progress') + frame({ x: mix(157, 588, bP), y: mix(88, 148, bP), w: mix(724, 412, bP), h: 68, r: 40, on: 'w' }) + fillRow(toHex(cmix(hex2('#022c7f'), hex2('#fdfefe'), bP)), bP > 0 && bP < 1); }
  if (t < S3 + 3.6) return hd('▣', 'Target') + frame({ x: mix(8, 483, P(t, S3 + 2.95, S3 + 3.35)), y: mix(33, 112, P(t, S3 + 2.95, S3 + 3.35)), w: 134, h: 133 });
  if (t < S3 + 4.05) return hd('▣', '2x') + frame({ x: 885, y: 10, w: 130, h: 156 });
  if (t < S3 + 5.7) { const fP = P(t, S3 + 4.35, S3 + 4.55); return hd('T', 'Title') + textSec({ content: ed('dtitle'), font: fP > 0.5 ? 'Plus Jakarta Sans' : 'Baloo', weight: fP > 0.5 ? 'Bold' : 'Regular', size: fP > 0.5 ? 52 : 65, align: fP > 0.5 ? 'left' : 'center', on: 'content' }) + fillRow('FFFFFF', false); }
  if (t < S3 + 7.2) { const c = t < PICKS.dbl.solid ? null : (t < PICKS.dbl.d0 ? PICKS.dbl.from : pickColor('dbl', t)); return hd('#', 'Double coins') + frame({ x: 18, y: Math.round(L.dT), w: 1038, h: 253, r: 40 }) + (c ? fillRow(toHex(c), true) : `<div class="sec"><div class="lb">Fill</div><div class="row"><div class="f on" data-f="fill"><span class="sw" style="background:linear-gradient(90deg,#56ccf2,#0d9ffe)"></span>Linear<small style="margin-left:auto">100%</small></div></div></div>`); }
  if (t < S3 + 8.3) return hd('▣', 'Coins') + frame({ x: t > S3 + 7.45 ? 519 : 728, y: t > S3 + 7.45 ? -180 : 2, w: t > S3 + 7.45 ? 863 : 307, h: t > S3 + 7.45 ? 486 : 190 }) + imgSec(IMG(t > S3 + 7.45 ? 'n_coincascade.png' : 'o_dbl_coins_a.png'), t > S3 + 7.3 && t < S3 + 7.55);
  if (t < S4 + 0.5) return null;
  if (t < S4 + 1.6) return hd('▣', 'Fox') + frame({ x: 719, y: -15, w: 234, h: 339 });
  if (t < S4 + 2.25) return hd('⌗', '5 layers') + frame({ x: 0, y: -15, w: 1038, h: 143 });
  if (t < S4 + 3.5) { const tw = P(t, S4 + 2.45, S4 + 2.85); return hd('T', 'Text') + textSec({ content: 'Get 15% of what your friends earn!', font: 'Plus Jakarta Sans', weight: tw > 0.3 ? 'Bold' : 'Medium', size: Math.round(mix(40, 48, tw)), align: t > S4 + 2.85 ? 'center' : 'left', on: t < S4 + 2.6 ? 'weight' : t < S4 + 2.85 ? 'size' : '' }) + fillRow(toHex(cmix(hex2('#0a3e99'), hex2('#00060f'), tw)), tw > 0 && tw < 1); }
  if (t < S4 + 5.15) { const c = t < PICKS.inv.solid ? null : (t < PICKS.inv.d0 ? PICKS.inv.from : pickColor('inv', t)); return hd('#', 'Invite') + frame({ x: 18, y: Math.round(L.iT), w: 1038, h: L.iH, r: 46, on: t > S4 + 4.6 ? 'h' : '' }) + (c ? fillRow(toHex(c), t < S4 + 4.5) : `<div class="sec"><div class="lb">Fill</div><div class="row"><div class="f on" data-f="fill"><span class="sw" style="background:linear-gradient(122deg,#5aa4f8,#6defe9)"></span>Linear<small style="margin-left:auto">100%</small></div></div></div>`); }
  if (t < S4 + 5.75) { const d = P(t, S4 + 5.2, S4 + 5.6); return hd('▭', 'Stroke') + frame({ x: mix(51, 0, d), y: mix(131, 0, d), w: mix(565, 1038, d), h: mix(144, 237, d), r: mix(23, 31, d) }) + fillRow(toHex(cmix(hex2('#3c8ae4'), hex2('#88bdd0'), d)), d > 0 && d < 1, 'Stroke · dashed 6'); }
  if (t < S4 + 6.95) return hd('○', t < S4 + 6.15 ? 'Avatar' : 'Avatars · 5') + frame({ x: 119, y: 111, w: t < S4 + 6.15 ? 76 : 474, h: 76 }) + fillRow('C0CBD3', false);
  if (t < S4 + 7.75) return hd('#', 'Invite button') + frame({ x: 669, y: 105, w: 248, h: 89, r: 61 }) + fillRow('1154D0', false);
  if (t < S4 + 8.75) return hd('#', 'Invite') + frame({ x: 18, y: Math.round(L.iT), w: 1038, h: 237, r: 31 });
  if (t < S5 + 0.45) return null;
  if (t < S5 + 2.6) return hd('▣', 'Story card') + frame({ x: L.sX, y: Math.round(L.sT), w: L.sW, h: L.sH, r: L.sR, on: t > S5 + 1.38 && t < S5 + 1.65 ? 'r' : t > S5 + 0.6 && t < S5 + 1.4 ? 'w' : '' }) + imgSec(IMG(t > S5 + 1.9 ? 'n_roomfox.png' : 'o_shortcut_a.png'), t > S5 + 1.7 && t < S5 + 1.95);
  if (t < S5 + 3.75) return hd('T', 'Headline') + textSec({ content: ed('mtext'), font: 'Plus Jakarta Sans', weight: 'Bold', size: 76, align: 'left', on: 'content' }) + fillRow('FFFFFF', false);
  if (t < S5 + 4.45) return hd('T', 'Subline') + textSec({ content: ed('mmax'), font: 'Plus Jakarta Sans', weight: 'Bold', size: 42, align: 'left', on: 'content' }) + fillRow('FFD900', false);
  if (t < S5 + 5.3) return hd('#', 'Timer pill') + frame({ x: 62, y: 323, w: 461, h: 59, r: 46 }) + fillRow('F7F8FF', false);
  if (t < OUT) return hd('⌗', 'Progress · 3') + frame({ x: 711, y: 322, w: 228, h: 61 });
  return null;
}
// zoomed panel moments: [t0, t1, field]
const PZOOM = [[S1 + 6.4, S1 + 7.55, 'content'], [S1 + 9.2, S1 + 10.95, 'content'], [S2 + 3.25, S2 + 4.05, 'content'], [S3 + 4.15, S3 + 5.55, 'content'], [S4 + 2.35, S4 + 3.25, 'size'], [S5 + 2.75, S5 + 4.4, 'content']];

let tNow = 0;
let lastPanelHTML = '';
function overlays(t, L, k) {
  tNow = t;
  { const s = stage.getBoundingClientRect(); SR = s; SK = s.width / 1920; }
  // scene captions
  const CAPS = [
    [0.3, S1 - 0.2, '', 'BestPlay home', 'The current home screen, rebuilt into the new one step by step.'],
    [S1, S2 - 0.2, '01', 'Wallet goes on top', 'Balance, timer and cash out lead the screen.'],
    [S2, S3 - 0.2, '02', 'Event banner', 'Lighter timer, no menu clutter, carousel dots.'],
    [S3, S4 - 0.2, '03', 'Double coins', 'One clear line, one progress pill.'],
    [S4, S5 - 0.2, '04', 'Invite friends', 'The offer becomes the headline, avatars show progress.'],
    [S5, OUT - 0.1, '05', 'Story card', 'A full-width story card replaces the old promo.'],
    [OUT + 1.6, END + 1, '', 'Before and after', 'Same content, clearer hierarchy, calmer surfaces.'],
  ];
  const c = CAPS.find((x) => t >= x[0] && t < x[1]);
  if (c) {
    const a = P(t, c[0], c[0] + 0.45) * (1 - P(t, c[1] - 0.35, c[1]));
    cap.innerHTML = `${c[2] ? `<div class="n">STEP ${c[2]}</div>` : ''}<div class="h">${c[3]}</div><div class="s">${c[4]}</div>`;
    S(cap, { o: a, tf: `translateY(${(1 - a) * 10}px)` });
  } else S(cap, { o: 0 });

  // frame label and before/after
  const sr = R(screen);
  flabel.textContent = t < OUT + 0.6 ? 'Home' : 'Home · revamp';
  S(flabel, { left: sr.left - 2, top: sr.top - 26 * (k / 0.4) - 14, fontSize: 15, o: P(t, 0.3, 0.9) * (1 - P(t, OUT + 1.6, OUT + 2.0)) });
  const os = oldStatic;
  const ok = 0.344;
  S(os, { left: 650 - 562 * ok, top: 540 - 1222 * ok, width: 1124, tf: `scale(${ok})`, o: P(t, OUT + 1.9, OUT + 2.6) });
  S(tagOld, { left: 650, top: 540 + 1222 * ok + 18, o: P(t, OUT + 2.4, OUT + 2.9) });
  S(tagNew, { left: 1270, top: 540 + 1222 * ok + 18, o: P(t, OUT + 2.4, OUT + 2.9) });
  // the phones sit a little higher when tagged
  // selection boxes
  let used = 0;
  for (const [t0, t1, fn, label, union] of SEL) {
    if (t < t0 || t >= t1) continue;
    const els = fn();
    const rects = els.map(R);
    const boxes = union ? [rects.reduce((a, r) => ({ left: Math.min(a.left, r.left), top: Math.min(a.top, r.top), right: Math.max(a.right, r.right), bottom: Math.max(a.bottom, r.bottom) }), { left: 1e9, top: 1e9, right: -1e9, bottom: -1e9 })] : rects;
    boxes.forEach((r, i) => {
      const b = selPool[used++]; if (!b) return;
      const w = r.right - r.left, h = r.bottom - r.top;
      S(b, { display: 'block', left: r.left - 2, top: r.top - 2, width: w + 4, height: h + 4, o: P(t, t0, t0 + 0.08) });
      const kk = sr.width / 1074;
      b.querySelector('b').textContent = label && i === 0 ? `${label}  ${Math.round(w / kk)} × ${Math.round(h / kk)}` : '';
      b.querySelector('b').style.display = label && i === 0 ? 'block' : 'none';
    });
  }
  for (let i = used; i < selPool.length; i++) selPool[i].style.display = 'none';

  // draw rectangles and marquee
  marq.style.display = 'none'; drawR.style.display = 'none';
  for (const [t0, t1, , , label, kind, box, shape] of DRAWS) {
    if (t < t0 || t > t1 + (kind === 'draw' ? 0.25 : 0.05)) continue;
    const [x0, y0, x1, y1] = box();
    const p = E.io(clamp((t - t0) / (t1 - t0), 0, 1));
    const el = kind === 'marq' ? marq : drawR;
    S(el, { display: 'block', left: x0, top: y0, width: (x1 - x0) * p, height: (y1 - y0) * p, borderRadius: shape === 'circle' ? '50%' : 4, o: t > t1 ? 1 - P(t, t1 + 0.1, t1 + 0.25) : 1 });
    if (kind === 'draw') { drawR.querySelector('b').textContent = label; drawR.querySelector('b').style.display = label ? 'block' : 'none'; }
  }

  // panel
  const st = panelState(t, L);
  const shown = st ? 1 : 0;
  if (st && st !== lastPanelHTML) { panel.innerHTML = st; lastPanelHTML = st; }
  let z = 0, field = 'content';
  for (const [t0, t1, f] of PZOOM) { const a = P(t, t0, t0 + 0.3) * (1 - P(t, t1 - 0.25, t1)); if (a > z) { z = a; field = f; } }
  const fe = panel.querySelector(`[data-f=${field}]`);
  if (fe) {
    const tfNow = panel.style.transform; panel.style.transform = 'none';
    const r0 = R(panel); const fr = R(fe);
    panel.style.transform = tfNow;
    panel.style.transformOrigin = `${fr.left - r0.left + fr.width / 2}px ${fr.top - r0.top + fr.height / 2}px`;
  }
  const vis = panelVis(t);
  S(panel, { o: vis, tf: `translateX(${(1 - vis) * 60}px) translateX(${-z * 150}px) scale(${1 + 0.55 * z})`, boxShadow: `0 ${24 + 20 * z}px ${60 + 40 * z}px rgba(20,20,40,${0.16 + 0.08 * z}), 0 0 0 1px rgba(0,0,0,.06)` });

  // picker
  let pkOn = null;
  for (const key in PICKS) { const p = PICKS[key]; if (t >= p.open - 0.01 && t < p.close + 0.2) pkOn = key; }
  if (pkOn) {
    const p = PICKS[pkOn];
    const a = P(t, p.open, p.open + 0.18) * (1 - P(t, p.close, p.close + 0.18));
    const fr = panel.querySelector('[data-f=fill]');
    const anchor = fr ? R(fr) : { top: 400, left: 1512 };
    const col = t < p.d0 ? p.from : pickColor(pkOn, t);
    const [h, s, v] = rgb2hsv(col);
    const tabs = $('.hr-picker .tabs');
    tabs.style.display = p.grad ? 'flex' : 'none';
    tabs.children[0].className = p.grad && t >= p.solid ? 'on' : '';
    tabs.children[1].className = p.grad && t < p.solid ? 'on' : '';
    $('.hr-picker .sv').style.background = `hsl(${s > 0.03 ? h : rgb2hsv(rgb2hsv(p.from)[1] > 0.03 ? p.from : p.to)[0]},100%,50%)`;
    const hue = s > 0.03 ? h : rgb2hsv(rgb2hsv(p.from)[1] > 0.03 ? p.from : p.to)[0];
    const kn = $('.hr-picker .sv .knob'); S(kn, { left: s * 256, top: (1 - v) * 170, background: rgb(col) });
    S($('.hr-picker .hue .knob'), { left: (hue / 360) * 256 });
    $('.hr-picker .psw').style.background = p.grad && t < p.solid ? 'linear-gradient(90deg,#5aa4f8,#6defe9)' : rgb(col);
    $('.hr-picker .hx em').textContent = p.grad && t < p.solid ? 'Linear' : toHex(col);
    S(picker, { left: 1512 - 252, top: clamp(anchor.top - 120, 120, 700), o: a, tf: `scale(${mix(0.94, 1, a)})`, transformOrigin: '100% 30%' });
  } else S(picker, { o: 0 });

  // cursor
  const cp = cursorAt(t);
  let type = 'arrow'; for (const [tt, ty] of CTYPE.slice().sort((a, b) => a[0] - b[0])) if (t >= tt) type = ty;
  if (cursor._type !== type) { cursor.innerHTML = CUR[type]; cursor._type = type; }
  const off = type === 'arrow' ? [-7, -4] : [-17, -17];
  S(cursor, { left: cp[0] + off[0], top: cp[1] + off[1], o: P(t, 1.2, 1.5) * (1 - P(t, OUT + 0.5, OUT + 0.9)) });
  // click ripple
  const lc = CLICKS.filter((x) => x <= t).pop();
  if (lc != null && t - lc < 0.35) { const p = (t - lc) / 0.35; S(ripple, { left: cp[0], top: cp[1], o: 0.9 * (1 - p), tf: `scale(${0.3 + 0.9 * E.out(p)})` }); } else S(ripple, { o: 0 });
  // key chip
  const kc = CHIPS.filter((x) => x[0] <= t).pop();
  if (kc && t - kc[0] < 0.7) { chip.textContent = kc[1]; S(chip, { left: cp[0] + 22, top: cp[1] + 26, o: P(t, kc[0], kc[0] + 0.08) * (1 - P(t, kc[0] + 0.55, kc[0] + 0.7)) }); } else S(chip, { o: 0 });
}
const PV_STEP = 0.05;
let PV = null;
function panelVis(t) {
  // fades between edits rather than blinking: visible while any state is near
  if (!PV) { PV = []; for (let x = 0; x <= END + 1; x += PV_STEP) PV.push(panelState(x, layout(x)) != null); }
  const near = (dt) => PV[Math.round((t + dt) / PV_STEP)] ?? false;
  if (near(0)) {
    // fade in at the start of a run of states
    let a = 1; for (const d of [0.05, 0.1, 0.15, 0.2]) if (!near(-d)) { a = d / 0.2; break; }
    return a;
  }
  for (const d of [0.05, 0.1, 0.15, 0.2]) if (near(-d)) return 1 - d / 0.2;
  return 0;
}


const images = () => [...stage.querySelectorAll('img')];
async function ready() {
  await Promise.all([
    '700 52px "Plus Jakarta Sans Variable"', '600 36px "Plus Jakarta Sans Variable"', '800 42px "Plus Jakarta Sans Variable"',
    '700 65px "Baloo 2 Variable"', '600 15px "Inter Variable"',
  ].map((f) => document.fonts.load(f).catch(() => null)));
  await Promise.all(images().map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  measured.gc = wGc.offsetWidth;
}
return { stage, render, ready };
}
