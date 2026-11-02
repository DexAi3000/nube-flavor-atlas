/* NUBE — Flavor Atlas · one fitted screen of video tiles, cursor-lens tilt, clip-path detail */
(() => {
'use strict';
const V = 2;                                   // asset cache version (bump when files are re-exported)
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
// desktop (mouse + a big screen) gets the 1080p set; phones and small screens keep the light files
const HD = FINE && Math.min(screen.width, screen.height) >= 720 && innerWidth >= 900;
const IMG = HD ? 'assets/hd/' : 'assets/img/', VID = HD ? 'assets/hd/' : 'assets/vid/';
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const expo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);

/* ---------- data ---------- */
const S = (id, no, name, c, desc, p) => ({ id: 'salt-' + id, kind: 'salt', no, name, c, desc, prof: p, price: 14, vid: true });
const D = (id, kind, no, name, c, desc, specs, price) => ({ id, kind, no, name, c, desc, specs, price, vid: true });
const ITEMS = [
  S('mango',      '01', 'Mango Ice',        '#FF9A2E', 'Sun-ripe Alphonso mango cut with a clean menthol chill. Bright, round, cold on the exhale.', [4, 3, 5]),
  S('bluerazz',   '02', 'Blue Razz',        '#4D86FF', 'Sharp blue-raspberry candy with a sour edge that keeps it from ever getting heavy.', [4, 1, 4]),
  S('watermelon', '03', 'Watermelon Chill', '#FF5A6E', 'Juicy red watermelon poured over crushed ice. Light, wet, endlessly easy.', [3, 4, 4]),
  S('mint',       '04', 'Double Mint',      '#5BE3A6', 'Spearmint and peppermint, layered cold. No sugar, just clarity.', [1, 5, 0]),
  S('strawkiwi',  '05', 'Strawberry Kiwi',  '#FF4D3D', 'Ripe strawberry against tart green kiwi, the sweet and the sour in balance.', [4, 1, 5]),
  S('grape',      '06', 'Black Grape',      '#A77BFF', 'Dark Concord grape with a little ice. Deep, jammy, quietly cool.', [4, 2, 4]),
  S('tobacco',    '07', 'Tobacco Vanilla',  '#D6A46C', 'Golden Virginia leaf softened with Madagascar vanilla. Warm, dry, grown-up.', [2, 0, 1]),
  S('lychee',     '08', 'Lychee Rose',      '#F7B6C8', 'Peeled lychee and a whisper of rose. Floral, pale and very clean.', [3, 1, 4]),
  D('pod-pen',    'pod', '09', 'NUBE Stick',  '#C9D3E8', 'A pen-slim pod for all-day salts. Draw-activated, quiet, gone in a pocket.', [['Battery', '600 mAh'], ['Pod', '2 ml'], ['Coil', '0.8 Ω mesh'], ['Charge', 'USB-C']], 29),
  D('pod-card',   'pod', '10', 'NUBE Slate',  '#C8F03C', 'Card-flat and pocket-first, with a clear side-fill pod you can read at a glance.', [['Battery', '800 mAh'], ['Pod', '2 ml'], ['Coil', '0.6 Ω'], ['Draw', 'Auto + button']], 34),
  D('pod-pebble', 'pod', '11', 'NUBE Pebble', '#FF7A3D', 'Palm-sized and rubber-soft, shaped to sit in the hand like a river stone.', [['Battery', '1000 mAh'], ['Pod', '3 ml'], ['Coil', '0.8 Ω'], ['Airflow', 'Adjustable']], 32),
  D('vape-box',   'mod', '12', 'NUBE Timber', '#D49A60', 'A walnut-panel box mod with a 25 mm sub-ohm tank. Warm in the hand, serious in the cloud.', [['Power', '5–80 W'], ['Cell', '1 × 18650'], ['Tank', '5 ml'], ['Coil', '0.2 Ω']], 69),
  D('vape-tube',  'mod', '13', 'NUBE Halo',   '#3FD6C8', 'Machined chrome tube, a 24 mm tank and one button. Nothing else to think about.', [['Power', '40 W'], ['Battery', '3000 mAh'], ['Tank', '3.5 ml'], ['Coil', '0.3 Ω']], 55),
];
const KIND = { salt: 'Nicotine salt · 30 ml', pod: 'Pod system', mod: 'Mod kit' };
const byId = Object.fromEntries(ITEMS.map(t => [t.id.replace('salt-', ''), t]));
const DECOR = [
  { id: 'mark', cls: 'mark', html: '<h1>NUBE</h1><p>an atlas of eight salts &amp; five machines</p>' },
  { id: 'strength', cls: 'note', html: '<b>How strong?</b><div class="row"><span>20 mg</span><span>light, all day</span></div><div class="row"><span>35 mg</span><span>ex-smokers</span></div><div class="row"><span>50 mg</span><span>heavy, few puffs</span></div>' },
  { id: 'adult', cls: 'note', html: '<b>18+ only</b>Contains nicotine, an addictive chemical. Keep away from children and pets.' },
];
const byDec = Object.fromEntries(DECOR.map(o => [o.id, o]));
// cinematic light pools in the flavours' own colours; positions are fractions of the layout's half-size
const LIGHTS = [[-.85, -.6, '#FF8A1F', .3], [-.45, .75, '#FF3D4F', .26], [-1, .3, '#7B4DFF', .3], [-.1, -.95, '#2F6BFF', .3],
  [.6, -.55, '#8FA8FF', .22], [.9, .5, '#FF6A2A', .28], [.25, .95, '#15C9B8', .26], [1, -.95, '#C8F03C', .2]];
LIGHTS.forEach(([fx, fy, c, a], i) => DECOR.push({ fx, fy, d: .7, cls: 'light', style: `--l:${c};--a:${a};--t:${9 + i * 1.7}s` }));

/* ---------- layouts (world units; a tile is 220 wide) ---------- */
const TW = 220, TH = TW * 1.25 + 62;
// desktop: a 7 x 3 grid, NUBE owns the middle of the centre row with an empty cell on each side of it
const GRID = [
  ['tobacco', 'mango', 'bluerazz', 'lychee', 'pod-pen', 'pod-card', 'adult'],
  ['watermelon', null, 'mark', null, null, null, 'pod-pebble'],
  ['strength', 'grape', 'strawkiwi', 'mint', 'vape-tube', 'vape-box', null],
];
function layoutDesk() {
  const PX = 270, PY = 390;
  GRID.forEach((row, r) => row.forEach((id, c) => {
    if (!id || id === 'mark') return;
    const o = byId[id] || byDec[id];
    o.x = (c - 3) * PX; o.y = (r - 1) * PY + (c % 2 ? 26 : -10);
  }));
  byDec.mark.x = 0; byDec.mark.y = 0;
}
// phone: NUBE on top, then two staggered columns you scroll through
function layoutPhone() {
  const order = ['mango', 'bluerazz', 'watermelon', 'mint', 'strawkiwi', 'grape', 'tobacco', 'lychee',
    'pod-pen', 'pod-card', 'pod-pebble', 'vape-box', 'vape-tube', 'strength'];
  byDec.mark.x = 0; byDec.mark.y = 0;
  order.forEach((id, i) => {
    const o = byId[id] || byDec[id];
    o.x = i % 2 ? 132 : -132; o.y = 300 + Math.floor(i / 2) * 400 + (i % 2 ? 150 : 0);
  });
  byDec.adult.x = 0; byDec.adult.y = 300 + 7 * 400 + 40;
}

/* ---------- build DOM ---------- */
const tilesL = $('#tiles'), decoL = $('#deco'), stage = $('#stage');
ITEMS.forEach((t, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'it tile'; b.style.width = TW + 'px'; b.style.setProperty('--c', t.c);
  b.setAttribute('aria-label', `${t.name}, ${KIND[t.kind]}, $${t.price}. Open`);
  b.innerHTML = `<span class="media"><img src="${IMG}${t.id}-card.webp?v=${V}" alt="" draggable="false"></span>` +
    `<span class="cap"><small><i>N°${t.no}</i> · ${t.kind === 'salt' ? 'Salt' : t.kind === 'pod' ? 'Pod' : 'Mod'}</small><b>${t.name}</b><em>$${t.price}</em></span>`;
  tilesL.appendChild(b);
  Object.assign(t, { el: b, i, d: 1, w: TW, h: TH, tile: true });
  b.addEventListener('click', e => { if (moved > 8) { e.preventDefault(); return; } open(t); });
  b.addEventListener('focus', () => { if (kbd && phone) scrollTo(t.y); });
  b.addEventListener('pointerenter', () => { setCur('open'); hover = t; });
  b.addEventListener('pointerleave', () => { setCur(''); if (hover === t) hover = null; });
});
DECOR.forEach(o => {
  const e = document.createElement('div');
  e.className = 'it dec ' + o.cls; e.setAttribute('aria-hidden', o.cls === 'mark' ? 'false' : 'true');
  if (o.html) e.innerHTML = o.html; if (o.style) e.style.cssText = o.style;
  decoL.appendChild(e); o.el = e; o.d = o.d || 1;
});
const measure = () => DECOR.forEach(o => { o.w = o.el.offsetWidth; o.h = o.el.offsetHeight; });

/* ---------- camera: fit the layout to the screen ---------- */
let vw = innerWidth, vh = innerHeight, phone = false, z = 1, intro = 0, dirty = true;
const cam = { x: 0, y: 0 }, tgt = { x: 0, y: 0 }, box = {};
let yMin = 0, yMax = 0, vy = 0;
function fit() {
  vw = innerWidth; vh = innerHeight; phone = vw < 760 || vw / vh < .85;
  document.documentElement.classList.toggle('phone', phone);
  measure();
  phone ? layoutPhone() : layoutDesk();
  const all = [...ITEMS, byDec.mark, byDec.strength, byDec.adult];
  box.l = Math.min(...all.map(o => o.x - o.w / 2)); box.r = Math.max(...all.map(o => o.x + o.w / 2));
  box.t = Math.min(...all.map(o => o.y - o.h / 2)); box.b = Math.max(...all.map(o => o.y + o.h / 2));
  const top = phone ? 118 : 84, bot = phone ? 40 : 34, side = phone ? 14 : 48;
  if (phone) {
    z = (vw - 2 * side) / (box.r - box.l);
    cam.x = tgt.x = (box.l + box.r) / 2;
    yMin = box.t + (vh / 2 - top) / z; yMax = Math.max(yMin, box.b - (vh / 2 - bot) / z);
    tgt.y = cam.y = clamp(cam.y || yMin, yMin, yMax);
  } else {
    z = Math.min((vw - 2 * side) / (box.r - box.l), (vh - top - bot) / (box.b - box.t), 1.25);
    cam.x = tgt.x = (box.l + box.r) / 2;
    cam.y = tgt.y = (box.t + box.b) / 2 - (top - bot) / 2 / z;
    yMin = yMax = cam.y;
  }
  const hx = (box.r - box.l) / 2, hy = (box.b - box.t) / 2;
  DECOR.forEach(o => { if (o.fx !== undefined) { o.x = cam.x + o.fx * hx; o.y = (box.t + box.b) / 2 + o.fy * hy; } });
  stage.style.touchAction = phone ? 'none' : 'auto';
  dirty = true;
}
fit();
let lastW = vw, lastH = vh;
addEventListener('resize', () => {
  // phones fire a height-only resize on every address-bar move: ignore those
  if (innerWidth === lastW && Math.abs(innerHeight - lastH) < 140) return;
  lastW = innerWidth; lastH = innerHeight; fit();
});
function scrollTo(y) { if (phone) { tgt.y = clamp(y, yMin, yMax); vy = 0; } }

/* ---------- input: cursor lens on desktop, vertical drag/scroll on phones ---------- */
let moved = 0, drag = null, kbd = false, hover = null, samples = [], mx = .5, my = .5;
stage.addEventListener('pointerdown', e => {
  moved = 0;
  if (!phone) return;
  drag = { y: e.clientY, cy: tgt.y, id: e.pointerId }; vy = 0; samples = [{ y: e.clientY, t: e.timeStamp }];
});
addEventListener('pointermove', e => {
  if (FINE) { curX = e.clientX; curY = e.clientY; mx = e.clientX / vw; my = e.clientY / vh; }
  if (!drag || e.pointerId !== drag.id) return;
  const dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dy));
  tgt.y = clamp(drag.cy - dy / z, yMin - 60 / z, yMax + 60 / z);
  samples.push({ y: e.clientY, t: e.timeStamp }); if (samples.length > 6) samples.shift();
});
function up(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const a = samples[0], b = samples[samples.length - 1];
  if (b.t - a.t < 160 && moved > 8) vy = clamp(-(b.y - a.y) / Math.max(16, b.t - a.t) * 16 / z, -60 / z, 60 / z);
  drag = null;
}
addEventListener('pointerup', up); addEventListener('pointercancel', up);
stage.addEventListener('wheel', e => { if (!phone) return; e.preventDefault(); tgt.y = clamp(tgt.y + e.deltaY / z, yMin, yMax); vy = 0; }, { passive: false });
addEventListener('keydown', e => {
  if (e.key === 'Tab') kbd = true;
  if (!detail.hidden) { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); return; }
  if (phone && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) scrollTo(tgt.y + (e.key === 'ArrowDown' ? 1 : -1) * 160 / z);
});
addEventListener('pointerdown', () => { kbd = false; }, true);
$('#home').onclick = e => { e.preventDefault(); setFilter('all'); };

/* ---------- filter: the others step back into the dark ---------- */
function setFilter(f) {
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c.dataset.f === f));
  ITEMS.forEach(t => t.el.classList.toggle('dim', f !== 'all' && t.kind !== f));
  const first = ITEMS.filter(t => f === 'all' || t.kind === f).sort((a, b) => a.y - b.y)[0];
  if (phone) scrollTo(f === 'all' ? yMin : first.y);
}
document.querySelectorAll('.chip').forEach(c => c.onclick = () => setFilter(c.dataset.f));

/* ---------- cursor ---------- */
const cur = $('#cur'), curT = cur.querySelector('span');
let curX = vw / 2, curY = vh / 2, cx = curX, cy = curY;
function setCur(m) {
  if (!FINE) return;
  cur.classList.toggle('open', m === 'open'); cur.classList.toggle('small', m !== 'open');
  curT.textContent = m === 'open' ? 'Open' : '';
}
setCur('');
if (FINE) {
  stage.addEventListener('pointerenter', () => cur.classList.add('show'));
  stage.addEventListener('pointerleave', () => cur.classList.remove('show'));
}

/* ---------- card videos: every tile on screen keeps playing, always ---------- */
// the board's tiles are small, so they use the light 480x600 loops even on desktop (13 decoders at once)
function ensureVid(t) {
  if (t.v || !t.vid) return t.v;
  const v = document.createElement('video');
  v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto'; v.setAttribute('aria-hidden', 'true');
  // desktop: the 48 fps 600x750 loop; phones keep the light 24 fps one
  v.src = `${HD ? 'assets/hd/' : 'assets/vid/'}${t.id}-card.mp4?v=${V}`;
  // start each tile at its own point in the loop so the board doesn't move in lockstep
  v.addEventListener('loadedmetadata', () => { if (!v.currentTime) v.currentTime = (t.i * 1.37) % v.duration; }, { once: true });
  v.addEventListener('playing', () => v.classList.add('on'));
  t.el.querySelector('.media').appendChild(v); t.v = v; return v;
}
let vidTick = 0;
function videos() {
  ITEMS.forEach(t => {
    // phones only decode what's on screen; desktop keeps the whole board running
    const want = intro > 0 && (!phone || t.onScreen);
    if (want) { const v = ensureVid(t); if (v.paused) { v.playbackRate = RM ? .5 : 1; v.play().catch(() => {}); } }
    else if (t.v && !t.v.paused) t.v.pause();
  });
}

/* ---------- render loop ---------- */
let last = performance.now(), py = 0;
const tilt = { x: 0, y: 0 }, lens = { x: 0, y: 0 };
function frame(now) {
  const dt = Math.min(64, now - last); last = now;
  if (phone && !drag && vy) {
    tgt.y += vy * dt / 16; vy *= Math.pow(RM ? .85 : .92, dt / 16);
    if (tgt.y < yMin || tgt.y > yMax) { tgt.y = clamp(tgt.y, yMin, yMax); vy = 0; }
    if (Math.abs(vy) < .02) vy = 0;
  }
  if (phone && !drag) tgt.y += (clamp(tgt.y, yMin, yMax) - tgt.y) * .2;   // rubber band back inside
  const k = 1 - Math.pow(1 - (drag ? .45 : .16), dt / 16);
  cam.y += (tgt.y - cam.y) * k;
  // desktop: the board leans toward the cursor like a lens (a few px of shift + a few degrees of tilt)
  const lx = FINE && !phone && !RM ? mx - .5 : 0, ly = FINE && !phone && !RM ? my - .5 : 0;
  lens.x += (lx - lens.x) * .06; lens.y += (ly - lens.y) * .06;
  const svy = (cam.y - py) * z / dt * 16; py = cam.y;
  tilt.x += ((phone ? clamp(svy * .35, -6, 6) : -lens.y * 7) - tilt.x) * .12;
  tilt.y += ((phone ? 0 : lens.x * 9) - tilt.y) * .12;
  const moving = Math.abs(tgt.y - cam.y) > .05 || Math.abs(lens.x - lx) + Math.abs(lens.y - ly) > .0005 ||
    Math.abs(tilt.x) > .01 && phone || intro < 1;
  if (moving || dirty) { render(now); dirty = false; }
  if (FINE) { cx += (curX - cx) * .25; cy += (curY - cy) * .25; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; }
  if (++vidTick % 20 === 0) videos();
  requestAnimationFrame(frame);
}
function place(o, a) {
  // depth parallax against the lens: the tiles (d = 1) shift a little more than the light pools
  const sx = vw / 2 + (o.x - cam.x) * z - lens.x * 26 * o.d, sy = vh / 2 + (o.y - cam.y) * z - lens.y * 18 * o.d;
  o.sx = sx; o.sy = sy;
  const hw = o.w * z / 2 + 40, hh = o.h * z / 2 + 40;
  const on = sx > -hw && sx < vw + hw && sy > -hh && sy < vh + hh;
  if (on !== o.onScreen) { o.onScreen = on; o.el.classList.toggle('off', !on); }
  if (!on) return;
  const s = z * (a < 1 ? .82 + .18 * expo(a) : 1);
  // text-only decor stays a plain 2D transform on whole pixels so the browser repaints it crisp every frame
  // (a cached GPU layer gets stretched while it moves/scales and the letters smear into each other)
  o.el.style.transform = o.tile
    ? `translate3d(${(sx - o.w / 2).toFixed(1)}px,${(sy - o.h / 2).toFixed(1)}px,0) scale(${s.toFixed(4)})` +
      (tilt.x || tilt.y ? ` rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg)` : '')
    : `translate(${Math.round(sx - o.w / 2)}px,${Math.round(sy - o.h / 2)}px) scale(${s.toFixed(3)})`;
  if (a < 1) o.el.style.opacity = expo(a);
  else if (o.el.style.opacity) o.el.style.opacity = '';
}
function render(now) {
  if (intro > 0 && intro < 1) intro = clamp((now - introT0) / 1900, .0001, 1);
  ITEMS.forEach(t => place(t, intro >= 1 ? 1 : intro ? clamp((now - introT0 - 120 - t.i * 55) / 900, 0, 1) : 0));
  DECOR.forEach(o => place(o, intro >= 1 ? 1 : intro ? clamp((now - introT0) / 1100, 0, 1) : 0));
}

/* ---------- detail ---------- */
const detail = $('#detail'), dMedia = $('#dMedia');
let cur_t = null, strength = 20;
function rectOf(t) {
  const r = t.el.querySelector('.media').getBoundingClientRect();
  return `inset(${r.top}px ${vw - r.right}px ${vh - r.bottom}px ${r.left}px round ${16 * z}px)`;
}
function fill(t) {
  cur_t = t; detail.style.setProperty('--c', t.c);
  $('#dNo').textContent = 'N°' + t.no; $('#dKind').textContent = KIND[t.kind];
  $('#dName').textContent = t.name; $('#dDesc').textContent = t.desc; $('#dPrice').textContent = '$' + t.price;
  $('#dStory').hidden = t.kind === 'salt';
  const spec = $('#dSpec'), opt = $('#dOpt');
  if (t.kind === 'salt') {
    spec.innerHTML = ['Sweet', 'Cool', 'Fruit'].map((n, i) => `<div class="meter"><span>${n}</span><i>${[0, 1, 2, 3, 4].map(k => `<u class="${k < t.prof[i] ? 'f' : ''}"></u>`).join('')}</i></div>`).join('');
    opt.innerHTML = [20, 35, 50].map(mg => `<button type="button" data-mg="${mg}" aria-pressed="${mg === strength}">${mg} mg</button>`).join('');
    opt.querySelectorAll('button').forEach(b => b.onclick = () => { strength = +b.dataset.mg; opt.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
  } else {
    spec.innerHTML = `<div class="specs">${t.specs.map(([k, v]) => `<div>${k}<b>${v}</b></div>`).join('')}</div>`;
    opt.innerHTML = '';
  }
  const n = ITEMS.length, p = ITEMS[(t.i - 1 + n) % n], q = ITEMS[(t.i + 1) % n];
  $('#dPrev span').textContent = p.name; $('#dNext span').textContent = q.name;
  // media: new layer over the old one, old removed once the new one shows
  const old = [...dMedia.children];
  const img = new Image(); img.src = `${IMG}${t.id}-wide.webp?v=${V}`; img.alt = ''; img.className = 'fade' + (t.vid ? '' : ' still');
  dMedia.appendChild(img);
  const show = el => { requestAnimationFrame(() => el.classList.remove('fade')); setTimeout(() => old.forEach(o => { if (o.pause) o.pause(); o.remove(); }), 500); };
  img.decode().catch(() => {}).then(() => show(img));
  if (t.vid) {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.className = 'fade'; v.setAttribute('aria-hidden', 'true');
    v.src = `${VID}${t.id}-wide.mp4?v=${V}`; v.playbackRate = RM ? .5 : 1;
    // pick up exactly where the tile's loop is (card and wide loops share one timeline)
    v.addEventListener('loadedmetadata', () => { if (t.v) v.currentTime = t.v.currentTime % v.duration; }, { once: true });
    v.addEventListener('playing', () => { v.classList.remove('fade'); setTimeout(() => img.remove(), 500); }, { once: true });
    dMedia.appendChild(v); v.play().catch(() => {});
  }
}
// the transform that puts the full-screen media exactly over the tile: the card is the frame's centre 4:5 crop at
// full frame height, so scale by tile height / rendered frame height and move centre onto centre
function mediaToTile(t) {
  const r = t.el.querySelector('.media').getBoundingClientRect();
  const mw = dMedia.offsetWidth, mh = dMedia.offsetHeight, ml = dMedia.offsetLeft, mt = dMedia.offsetTop;
  const s = r.height / Math.max(mh, mw * 9 / 16);
  return `translate(${r.left + r.width / 2 - (ml + mw / 2)}px,${r.top + r.height / 2 - (mt + mh / 2)}px) scale(${s})`;
}
function open(t) {
  if (!detail.hidden || closing) return;
  fill(t);
  detail.classList.remove('anim', 'closing'); detail.hidden = false;
  detail.style.clipPath = rectOf(t); dMedia.style.transform = mediaToTile(t);
  detail.offsetWidth; // commit the start state
  detail.classList.add('anim'); detail.style.clipPath = 'inset(0px 0px 0px 0px round 0px)'; dMedia.style.transform = '';
  requestAnimationFrame(() => detail.classList.add('show'));
  setTimeout(() => $('#dClose').focus({ preventScroll: true }), 50);
}
let closing = false;
function close() {
  if (detail.hidden || closing) return;
  closing = true;
  const t = cur_t;
  detail.classList.remove('show'); detail.classList.add('closing');
  // hand the moment back to the tile: it lands showing the frame the big video will be on
  const w = dMedia.querySelector('video');
  if (t.v && w && w.readyState > 0) {
    const dur = t.v.duration || w.duration, at = (w.currentTime + (RM ? .46 : .86) * w.playbackRate) % dur;
    if (Math.abs(t.v.currentTime - at) > .12) t.v.currentTime = at;
  }
  // the media itself flies back into its tile, so the product lands where it came from
  detail.style.clipPath = rectOf(t); dMedia.style.transform = mediaToTile(t);
  setTimeout(() => {
    detail.hidden = true; detail.classList.remove('anim', 'closing'); dMedia.style.transform = '';
    dMedia.querySelectorAll('video').forEach(v => v.pause()); dMedia.innerHTML = '';
    closing = false;
    if (kbd) t.el.focus({ preventScroll: true });
  }, RM ? 460 : 860);
}
function step(dir) {
  const n = ITEMS.length, t = ITEMS[(cur_t.i + dir + n) % n];
  // phones: scroll the page behind so closing shrinks into the right tile
  if (phone) { cam.y = tgt.y = clamp(t.y, yMin, yMax); vy = 0; render(performance.now()); }
  fill(t);
}
$('#dClose').onclick = close; $('#dPrev').onclick = () => step(-1); $('#dNext').onclick = () => step(1);

/* ---------- bag ---------- */
const bag = [], bagEl = $('#bag'), bagBtn = $('#bagBtn');
function drawBag() {
  $('#bagN').textContent = bag.length;
  $('#bagList').innerHTML = bag.length ? bag.map((b, i) => `<li><i style="background:${b.t.c}"></i><span>${b.t.name}<small>${b.mg ? b.mg + ' mg' : KIND[b.t.kind]}</small></span><span>$${b.t.price}</span><button type="button" data-i="${i}" aria-label="Remove ${b.t.name}">×</button></li>`).join('') : '<li class="empty">Nothing here yet. Open a tile.</li>';
  $('#bagT').textContent = '$' + bag.reduce((s, b) => s + b.t.price, 0);
  $('#bagList').querySelectorAll('button').forEach(x => x.onclick = () => { bag.splice(+x.dataset.i, 1); drawBag(); });
}
$('#dAdd').onclick = () => {
  bag.push({ t: cur_t, mg: cur_t.kind === 'salt' ? strength : 0 }); drawBag();
  bagBtn.classList.remove('bump'); bagBtn.offsetWidth; bagBtn.classList.add('bump');
  const a = $('#dAdd'); a.textContent = 'Added ✓'; setTimeout(() => { a.textContent = 'Add to bag'; }, 1300);
};
bagBtn.onclick = () => { const o = bagEl.hidden; bagEl.hidden = !o; bagBtn.setAttribute('aria-expanded', o); };
$('#bagX').onclick = () => { bagEl.hidden = true; bagBtn.setAttribute('aria-expanded', 'false'); };
drawBag();

/* ---------- flavor finder: four questions, then the vapor parts on your salt ---------- */
const finder = $('#finder'), fStage = $('#fStage'), fRes = $('#fRes'), fSmoke = $('#fSmoke'), fGlow = $('#fGlow');
const Q = [
  { q: 'Sweet, or <i>cold</i>?', k: 'taste', a: [['sweet', 'Sweet', 'candy, ripe, round'], ['cold', 'Cold', 'ice on the exhale'], ['both', 'Both', 'sweet, then frozen']] },
  { q: 'Fruit, mint, or <i>leaf</i>?', k: 'family', a: [['fruit', 'Fruit', 'juicy and bright'], ['mint', 'Mint', 'clean and sharp'], ['leaf', 'Tobacco', 'warm and dry']] },
  { q: 'Which fruit <i>calls</i> you?', k: 'fruit', only: s => s.family === 'fruit',
    a: [['tropic', 'Tropical', 'mango, lychee'], ['berry', 'Berries', 'raspberry, grape, strawberry'], ['fresh', 'Fresh', 'watermelon on ice']] },
  { q: 'How much did you <i>smoke</i>?', k: 'mg', a: [[20, 'Rarely', 'a few, now and then'], [35, 'Daily', 'up to half a pack'], [50, 'Heavily', 'a pack or more']] },
];
const FAM = { tropic: ['mango', 'lychee'], berry: ['bluerazz', 'grape', 'strawkiwi'], fresh: ['watermelon'], mint: ['mint'], leaf: ['tobacco'] };
const TASTE = { sweet: [4.5, 1], cold: [1.5, 5], both: [4, 4] };
let fAns = {}, fStep = 0, fBusy = false;
const fSteps = () => Q.filter(q => !q.only || q.only(fAns));
function fGlowTo(c) { fGlow.style.setProperty('--g', c || '#3A4BFF'); }
function fShow() {
  const qs = fSteps(), q = qs[fStep];
  $('#fCount').textContent = `${String(fStep + 1).padStart(2, '0')} / ${String(qs.length).padStart(2, '0')}`;
  $('#fBar').style.transform = `scaleX(${(fStep + 1) / qs.length})`;
  const el = document.createElement('div');
  el.className = 'f-q in';
  el.innerHTML = `<p class="f-kick">Question ${String(fStep + 1).padStart(2, '0')}</p><h2 id="fQ">${q.q}</h2>` +
    `<div class="f-opts">${q.a.map(([v, t, s], i) => `<button type="button" data-v="${v}"><b>${t}</b><span>${s}</span><kbd>${i + 1}</kbd></button>`).join('')}</div>` +
    (fStep ? '<button type="button" class="f-back">← Back</button>' : '');
  const old = fStage.querySelector('.f-q:not(.out)');
  if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 700); }
  fStage.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('in')));
  el.querySelectorAll('.f-opts button').forEach(b => {
    b.onclick = () => pick(q.k, isNaN(b.dataset.v) ? b.dataset.v : +b.dataset.v);
    b.onpointerenter = () => fGlowTo(hint(q.k, b.dataset.v));
  });
  const back = el.querySelector('.f-back'); if (back) back.onclick = () => { fStep--; fShow(); };
  const first = el.querySelector('.f-opts button'); if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
}
// each answer tints the room with the colour of where it points
function hint(k, v) {
  if (k === 'taste') return { sweet: '#FF8A1F', cold: '#3FD6C8', both: '#A77BFF' }[v];
  if (k === 'family') return { fruit: '#FF4D3D', mint: '#5BE3A6', leaf: '#D6A46C' }[v];
  if (k === 'fruit') return { tropic: '#FF9A2E', berry: '#4D86FF', fresh: '#FF5A6E' }[v];
  return { 20: '#8FA8FF', 35: '#C8F03C', 50: '#FF6A2A' }[v];
}
function pick(k, v) {
  if (fBusy) return;
  fAns[k] = v; if (k === 'family' && v !== 'fruit') delete fAns.fruit;
  if (fStep < fSteps().length - 1) { fStep++; fShow(); } else reveal();
}
function match() {
  const [ts, tc] = TASTE[fAns.taste];
  const fam = FAM[fAns.family === 'fruit' ? fAns.fruit : fAns.family] || [];
  const tf = fAns.family === 'fruit' ? 5 : fAns.family === 'leaf' ? 1 : 0;
  return ITEMS.filter(t => t.kind === 'salt').map(t => {
    const [s, c, f] = t.prof, key = t.id.replace('salt-', '');
    return { t, score: -((s - ts) ** 2 + (c - tc) ** 2 + (f - tf) ** 2) + (fam.includes(key) ? 12 : 0) };
  }).sort((a, b) => b.score - a.score)[0].t;
}
function why() {
  const taste = { sweet: 'Sweet', cold: 'Cold', both: 'Sweet and cold' }[fAns.taste];
  const fam = fAns.family === 'fruit' ? { tropic: 'tropical', berry: 'full of berries', fresh: 'fresh off the ice' }[fAns.fruit]
    : fAns.family === 'mint' ? 'pure mint' : 'warm leaf';
  return `${taste}, ${fam}, at ${fAns.mg} mg. Exactly what you told us.`;
}
let fPick = null;
function reveal() {
  fBusy = true;
  const t = fPick = match();
  fGlowTo(t.c);
  // result underneath, dense vapor on top that opens onto it (the same screen-blend trick as the intro)
  $('#fNo').textContent = `N°${t.no} · Your flavor`;
  $('#fName').textContent = t.name; $('#fWhy').textContent = why(); $('#fMg').textContent = `${fAns.mg} mg`;
  $('#fPrice').textContent = '$' + t.price;
  const m = $('#fMedia'); m.innerHTML = '';
  const img = new Image(); img.src = `${IMG}${t.id}-card.webp?v=${V}`; img.alt = ''; m.appendChild(img);
  const v = document.createElement('video');
  v.muted = v.loop = v.playsInline = v.autoplay = true; v.setAttribute('aria-hidden', 'true');
  v.src = `${HD ? 'assets/hd/' : 'assets/vid/'}${t.id}-card.mp4?v=${V}`; m.appendChild(v); v.play().catch(() => {});
  fRes.style.setProperty('--c', t.c);
  fStage.querySelector('.f-q:not(.out)')?.classList.add('out');
  finder.classList.add('done');
  fRes.hidden = false;
  fSmoke.currentTime = 0; fSmoke.playbackRate = RM ? 1 : 1.2;
  finder.classList.add('smoke');
  const p = fSmoke.play(); if (p) p.catch(() => finder.classList.remove('smoke'));
  setTimeout(() => fRes.classList.add('show'), RM ? 100 : 900);
  setTimeout(() => { finder.classList.remove('smoke'); fBusy = false; $('#fOpen').focus({ preventScroll: true }); }, RM ? 600 : 5200);
}
function openFinder() {
  fAns = {}; fStep = 0; fBusy = false; fPick = null;
  fStage.innerHTML = ''; fRes.hidden = true; fRes.classList.remove('show'); finder.classList.remove('done', 'smoke');
  if (!fSmoke.src) fSmoke.src = `${HD ? 'assets/hd/' : 'assets/vid/'}intro-out.mp4?v=${V}`;
  fGlowTo(); finder.hidden = false;
  requestAnimationFrame(() => finder.classList.add('open'));
  fShow();
}
function closeFinder() {
  finder.classList.remove('open');
  setTimeout(() => { finder.hidden = true; fSmoke.pause(); $('#fMedia').innerHTML = ''; }, 600);
}
$('#findBtn').onclick = openFinder;
$('#fClose').onclick = closeFinder;
$('#fRetake').onclick = openFinder;
$('#fAdd').onclick = () => {
  bag.push({ t: fPick, mg: fAns.mg }); drawBag();
  bagBtn.classList.remove('bump'); bagBtn.offsetWidth; bagBtn.classList.add('bump');
  const a = $('#fAdd'); a.textContent = 'Added ✓'; setTimeout(() => { a.textContent = 'Add to bag'; }, 1300);
};
$('#fOpen').onclick = () => { const t = fPick; strength = fAns.mg; closeFinder(); setTimeout(() => open(t), 450); };
addEventListener('keydown', e => {
  if (finder.hidden) return;
  if (e.key === 'Escape') { e.stopImmediatePropagation(); closeFinder(); return; }
  const n = +e.key; if (!fBusy && n >= 1 && n <= 3 && !finder.classList.contains('done')) {
    const b = fStage.querySelectorAll('.f-q:not(.out) .f-opts button')[n - 1]; if (b) b.click();
  }
}, true);

/* ---------- device story: one take (wake → heat → cloud) scrubbed by scroll ---------- */
const story = $('#story'), sScroll = $('#sScroll'), sCanvas = $('#sCanvas'), sCtx = sCanvas.getContext('2d');
// desktop: 720 frames at 1080p from the 48 fps take; phones: 240 portrait-ish frames
// phones scrub 240 frames; desktop scrubs one 1080p 48 fps video (1049 frames, keyframe every 4) by seeking
const SN = 240, SV = 3, SSET = 'p', SVID = !phone;
let sVid = null;
const COPY = {
  'pod-pen':    { wake: 'One slow breath on the mouthpiece and the slit of light wakes.', heat: 'A 0.8 Ω mesh coil turns salt to vapor in a heartbeat.', cloud: 'Soft, round, quiet. Then it is gone.' },
  'pod-card':   { wake: 'Card-flat, pocket-cold. One touch and the pod lights from inside.', heat: 'A 0.6 Ω coil and a clear side pod: you watch it work.', cloud: 'Dense for its size. Gone before you put it away.' },
  'pod-pebble': { wake: 'It sits in your palm like a stone. Then it glows.', heat: 'The 0.8 Ω coil warms, the liquid swirls, the airflow opens.', cloud: 'A cloud that rolls, not one that shoots.' },
  'vape-box':   { wake: 'Walnut and gunmetal. The screen wakes first.', heat: 'Up to 80 W into a 0.2 Ω coil, behind 5 ml of glass.', cloud: 'This is the big one. Let it fill the room.' },
  'vape-tube':  { wake: 'One button, one ring of light.', heat: 'A 0.3 Ω coil under 3.5 ml of glass, 40 W of steady heat.', cloud: 'Clean chrome, clean cloud.' },
};
let sT = null, sFrames = [], sLoaded = 0, sP = 0, sTarget = 0, sRaf = 0, sDrawn = -1;
function sSize() {
  const r = Math.min(devicePixelRatio || 1, 2);
  sCanvas.width = Math.round(sCanvas.clientWidth * r); sCanvas.height = Math.round(sCanvas.clientHeight * r); sDrawn = -1; if (sVid) sVid.__f = -1;
}
// nearest loaded frame (coarse-to-fine loading leaves gaps early on)
function sFrame(i) {
  for (let d = 0; d < SN; d++) {
    const a = sFrames[i - d], b = sFrames[i + d];
    if (a && a.ok) return a; if (b && b.ok) return b;
  }
  return null;
}
function sDraw(i) { const im = sFrame(i); if (im) sPaint(im, im.naturalWidth, im.naturalHeight); }
function sPaint(im, iw, ih) {
  const cw = sCanvas.width, ch = sCanvas.height;
  if (phone) {
    // phones: the 8:9 frame at full width, a little above centre; the backdrop's own colour fills above and below
    const s = cw / iw, w = cw, h = ih * s, y = Math.round(ch * .4 - h / 2);
    if (!im.edge) { const t = document.createElement('canvas'); t.width = t.height = 1; const c = t.getContext('2d');
      c.drawImage(im, 0, 0, iw, 8, 0, 0, 1, 1); const top = c.getImageData(0, 0, 1, 1).data;
      c.drawImage(im, 0, ih - 8, iw, 8, 0, 0, 1, 1); const bot = c.getImageData(0, 0, 1, 1).data;
      im.edge = [`rgb(${top[0]},${top[1]},${top[2]})`, `rgb(${bot[0]},${bot[1]},${bot[2]})`]; }
    sCtx.fillStyle = im.edge[0]; sCtx.fillRect(0, 0, cw, y + h / 2);
    sCtx.fillStyle = im.edge[1]; sCtx.fillRect(0, y + h / 2, cw, ch - y - h / 2);
    sCtx.drawImage(im, 0, y, w, h);
    // soften the frame's top and bottom edges into the fill
    const f = Math.round(h * .12);
    let g = sCtx.createLinearGradient(0, y, 0, y + f); g.addColorStop(0, im.edge[0]); g.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = g; sCtx.fillRect(0, y, cw, f);
    g = sCtx.createLinearGradient(0, y + h, 0, y + h - f); g.addColorStop(0, im.edge[1]); g.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = g; sCtx.fillRect(0, y + h - f, cw, f);
    return;
  }
  const s = Math.max(cw / iw, ch / ih), w = iw * s, h = ih * s;
  sCtx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
}
function sLoad(t) {
  sFrames = []; sLoaded = 0;
  if (SVID) {
    if (sVid) { sVid.removeAttribute('src'); sVid.load(); }
    const v = sVid = document.createElement('video');
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.addEventListener('loadeddata', () => { $('#sLoad').classList.add('done'); v.__f = -1; });
    v.addEventListener('progress', () => { if (v.duration && v.buffered.length) $('#sPct').textContent = String(Math.min(99, Math.round(v.buffered.end(v.buffered.length - 1) / v.duration * 100))).padStart(2, '0'); });
    v.src = `assets/hd/story/${t.id}.mp4?v=${SV}`;
    return;
  }
  const set = SSET, order = [];
  for (let step = 32; step >= 1; step = step >> 1) for (let i = 0; i < SN; i += step) if (!order.includes(i)) order.push(i);
  let k = 0;
  const next = () => {
    if (sT !== t || k >= order.length) return;
    const i = order[k++], im = new Image();
    im.decoding = 'async';
    im.onload = () => { im.ok = true; sLoaded++; if (sLoaded === 23 || sLoaded % 24 === 0 || sLoaded === SN) sReady(); next(); };
    im.onerror = () => { sLoaded++; next(); };
    im.src = `assets/story/${t.id}/${set}/f_${String(i + 1).padStart(3, '0')}.webp?v=${SV}`;
    sFrames[i] = im;
  };
  for (let n = 0; n < (phone ? 6 : 12); n++) next();
}
function sReady() {
  $('#sPct').textContent = String(Math.round(sLoaded / SN * 100)).padStart(2, '0');
  if (sLoaded >= 23) $('#sLoad').classList.add('done');
  sDrawn = -1;
}
function sLoop() {
  sP += (sTarget - sP) * (RM ? 1 : .14);
  if (SVID) {
    const v = sVid;
    if (v && v.readyState >= 1 && v.duration) {
      const tt = clamp(sP, 0, 1) * (v.duration - .03);
      // one seek at a time; with a keyframe every 4 frames each lands in a few ms
      if (!v.seeking && Math.abs(v.currentTime - tt) > .01) v.currentTime = tt;
      if (v.readyState >= 2 && v.__f !== v.currentTime && !v.seeking) { sPaint(v, v.videoWidth, v.videoHeight); v.__f = v.currentTime; }
    }
  } else {
    const i = Math.round(clamp(sP, 0, 1) * (SN - 1));
    if (i !== sDrawn) { sDraw(i); sDrawn = i; }
  }
  $('#sHead').classList.toggle('gone', sP > .05);
  story.querySelectorAll('.s-ch').forEach(c => c.classList.toggle('on', sP >= +c.dataset.a && sP < +c.dataset.b));
  $('#sEnd').classList.toggle('on', sP > .9);
  $('#sRail').style.transform = `scaleY(${clamp(sP, 0, 1)})`;
  sRaf = requestAnimationFrame(sLoop);
}
sScroll.addEventListener('scroll', () => { sTarget = sScroll.scrollTop / Math.max(1, sScroll.scrollHeight - sScroll.clientHeight); }, { passive: true });
function openStory(t) {
  sT = t; story.style.setProperty('--c', t.c);
  $('#sKick').textContent = `N°${t.no} · ${KIND[t.kind]}`; $('#sName').textContent = t.name;
  story.querySelectorAll('.s-copy').forEach(p => p.textContent = COPY[t.id][p.dataset.k]);
  $('#sSpecs').innerHTML = t.specs.map(([k, v]) => `<div>${k}<b>${v}</b></div>`).join('');
  $('#sPrice').textContent = '$' + t.price;
  $('#sLoad').classList.remove('done'); $('#sPct').textContent = '00';
  story.hidden = false; sScroll.scrollTop = 0; sP = sTarget = 0; sDrawn = -1;
  sSize(); sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
  sLoad(t);
  requestAnimationFrame(() => story.classList.add('open'));
  cancelAnimationFrame(sRaf); sLoop();
  setTimeout(() => sScroll.focus({ preventScroll: true }), 60);
}
function closeStory() {
  story.classList.remove('open');
  setTimeout(() => { story.hidden = true; cancelAnimationFrame(sRaf); sT = null; sFrames = [];
    if (sVid) { sVid.removeAttribute('src'); sVid.load(); sVid = null; } }, 600);
}
sScroll.tabIndex = -1;
addEventListener('resize', () => { if (!story.hidden) sSize(); });
$('#sClose').onclick = closeStory;
$('#sAdd').onclick = () => {
  bag.push({ t: sT, mg: 0 }); drawBag();
  bagBtn.classList.remove('bump'); bagBtn.offsetWidth; bagBtn.classList.add('bump');
  const a = $('#sAdd'); a.textContent = 'Added ✓'; setTimeout(() => { a.textContent = 'Add to bag'; }, 1300);
};
const DEVS = ITEMS.filter(t => t.kind !== 'salt');
$('#sNext').onclick = () => {
  const n = DEVS[(DEVS.indexOf(sT) + 1) % DEVS.length];
  story.classList.remove('open');
  setTimeout(() => { if (!detail.hidden) { step(n.i - cur_t.i); } openStory(n); }, 350);
};
$('#dStory').onclick = () => openStory(cur_t);
addEventListener('keydown', e => { if (!story.hidden && e.key === 'Escape') { e.stopImmediatePropagation(); closeStory(); } }, true);

/* ---------- gate: vapor in -> 18+ question -> vapor opens onto the board ---------- */
const gate = $('#gate'), vIn = $('#vIn'), vOut = $('#vOut'), gYes = $('#gYes');
// smoke: a portrait cut for phones (drawn 1:1), a cleaned 2560x1440 for big desktop screens, 1080p otherwise
const smoke = n => phone ? `assets/vid/${n}-portrait.mp4?v=${V}` : HD ? `assets/hd/${n}-2k.mp4?v=${V}` : `assets/hd/${n}.mp4?v=${V}`;
const holdImg = phone ? `assets/img/intro-hold-portrait.webp?v=${V}` : HD ? `assets/hd/intro-hold-2k.webp?v=${V}` : `assets/hd/intro-hold.webp?v=${V}`;
let introT0 = 0;
function store(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
const returning = store('nube18') === '1';
vOut.src = smoke('intro-out'); vOut.poster = holdImg;
// the question shows once the two walls of vapor have met (or straight away when the clip can't play)
const ready = () => gate.classList.add('ready');
if (!returning) {
  vIn.src = smoke('intro-in');
  vIn.addEventListener('timeupdate', () => { if (vIn.currentTime > vIn.duration * .6) ready(); });
  vIn.addEventListener('ended', ready);
  const p = vIn.play(); if (p) p.catch(() => { vIn.poster = vOut.poster; ready(); });
  setTimeout(ready, 9000);
}
const imgs = ITEMS.map(t => t.el.querySelector('img'));
let loaded = 0; const total = imgs.length + 1;
const tickLoad = () => {
  loaded++; $('#gPct').textContent = String(Math.min(99, Math.round(loaded / total * 100))).padStart(2, '0');
  if (loaded >= total) { gYes.disabled = false; gYes.textContent = "I'm 18 or older"; if (returning) enter(); }
};
imgs.forEach(i => i.complete ? tickLoad() : (i.addEventListener('load', tickLoad, { once: true }), i.addEventListener('error', tickLoad, { once: true })));
Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1500))]).then(() => {
  fit(); tickLoad();
});
let entered = false;
function enter() {
  if (entered) return; entered = true;
  store('nube18', '1');
  // the out-clip starts on the in-clip's last frame, so the switch is seamless
  vOut.playbackRate = RM ? 1 : 1.25;
  const go = () => { gate.classList.add('go'); vIn.pause(); };
  const p = vOut.play();
  if (p) p.then(go, () => { go(); vOut.style.display = 'none'; }); else go();
  // tiles rise through the hole as it opens; the gate fades once only wisps are left
  setTimeout(() => { introT0 = performance.now(); intro = .0001; }, RM ? 200 : 1500);
  setTimeout(() => gate.classList.add('gone'), RM ? 900 : 4300);
  setTimeout(() => gate.remove(), RM ? 2200 : 5600);
}
gYes.onclick = enter;
if (location.hash === '#skip') store('nube18', '1');

requestAnimationFrame(frame);
window.__nube = { cam, tgt, ITEMS, DECOR, open, close, setFilter, fit };
})();
