// ── SEASON ART: New Year's, Valentine's, St. Patrick's, Spring/Easter, Fourth of July, Summer ──
// Plain script (no build step) loaded before app.js and store.js. It owns the art for the newer
// seasons so neither big file has to carry six more sets of drawings; Halloween, Thanksgiving and
// Christmas predate it and still live in app.js/store.js.
//
// Everything is drawn from small "primitives" (a heart, a star, an egg…) centred on (0,0) in a
// ±8 box, then composed per season in THEMES. Two consumers:
//   • app.js   → SeasonArt.avatar / flank / pageCorner / drift / hangerSvg  (60-box or small SVG strings)
//   • store.js → SeasonArt.kit(id) → placement helpers in the mall's coordinate space
// Pure decoration: nothing here is tappable, and every animation is dropped under reduced motion
// (SMIL ignores the CSS media query, so it is checked here).
const SeasonArt = (() => {
  const anim = xml => ((window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? '' : xml);
  const at = (x, y, s, inner, rot) => `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s})">${inner}</g>`;

  // ── primitives ──
  const HEART = 'M0 6.5 C-9.5 -.5 -7 -8 -3.4 -7.2 C-1.6 -6.8 0 -5.2 0 -3.6 C0 -5.2 1.6 -6.8 3.4 -7.2 C7 -8 9.5 -.5 0 6.5Z';
  const P = {
    heart: c => `<path d="${HEART}" fill="${c}"/><path d="M-5 -4.6 Q-4 -6 -2.4 -5.6" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" fill="none" stroke-linecap="round"/>`,
    star: c => `<path d="M0 -8 L2.35 -2.8 L8 -2.5 L3.7 1.3 L5 6.8 L0 3.8 L-5 6.8 L-3.7 1.3 L-8 -2.5 L-2.35 -2.8Z" fill="${c}"/>`,
    shamrock: c => [0, 120, 240].map(r => `<g transform="rotate(${r})"><g transform="translate(0 -4.2) scale(.62)"><path d="${HEART}" fill="${c}"/></g></g>`).join('') + `<path d="M0 1 Q1.4 5 3.6 8" stroke="#1b5e20" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
    egg: (c1, c2) => `<ellipse cx="0" cy="0" rx="5.6" ry="7.4" fill="${c1}"/><path d="M-5.3 -1 L-2.7 1.2 L0 -1 L2.7 1.2 L5.3 -1 L5 2.2 L2.7 4.4 L0 2.2 L-2.7 4.4 L-5 2.2Z" fill="${c2}"/><ellipse cx="-2" cy="-3.6" rx="1.2" ry="2" fill="#fff" opacity=".45"/>`,
    tulip: c => `<path d="M0 8 V0" stroke="#2e7d32" stroke-width="1.3"/><path d="M0 7 Q-6 4.5 -5 -.5 Q-1 2 0 7Z" fill="#43a047"/><path d="M-4.2 -7 L-2 -4.4 L0 -7.8 L2 -4.4 L4.2 -7 Q5.4 0 0 2 Q-5.4 0 -4.2 -7Z" fill="${c}"/>`,
    daisy: (c1, c2) => [0, 45, 90, 135].map(r => `<ellipse cx="0" cy="0" rx="1.9" ry="6.4" transform="rotate(${r})" fill="${c1}"/>`).join('') + `<circle r="2.4" fill="${c2}"/>`,
    butterfly: (c1, c2) => `<path d="M0 0 C-3 -8 -9 -6 -7.5 -1 C-6.5 2 -2 1.5 0 0Z M0 0 C3 -8 9 -6 7.5 -1 C6.5 2 2 1.5 0 0Z" fill="${c1}"/><path d="M0 0 C-2 4 -6 6 -5 8 C-3 8.5 -1 5 0 0Z M0 0 C2 4 6 6 5 8 C3 8.5 1 5 0 0Z" fill="${c2}"/><rect x="-.5" y="-3" width="1" height="8" rx=".5" fill="#3e2723"/>`,
    balloon: c => `<ellipse cx="0" cy="-2" rx="5.2" ry="6.4" fill="${c}"/><path d="M0 4.4 L-1.3 6.2 H1.3Z" fill="${c}"/><path d="M0 6.2 Q-2 9 0 11" stroke="#9e9e9e" fill="none" stroke-width=".7"/><ellipse cx="-2" cy="-4.6" rx="1.2" ry="2" fill="#fff" opacity=".45"/>`,
    sun: () => Array.from({ length: 12 }, (_, i) => `<path d="M0 -6.4 V-8.4" stroke="#ffb300" stroke-width="1.5" stroke-linecap="round" transform="rotate(${i * 30})"/>`).join('') + `<circle r="4.8" fill="#ffca28"/>`,
    sunface: () => P.sun() + `<rect x="-4.2" y="-1.6" width="3.7" height="2.6" rx=".8" fill="#212121"/><rect x=".5" y="-1.6" width="3.7" height="2.6" rx=".8" fill="#212121"/><path d="M-.6 -.6 H.6" stroke="#212121" stroke-width=".8"/><path d="M-2.4 2.4 Q0 4.4 2.4 2.4" stroke="#8a4b00" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
    palm: () => `<path d="M-1.4 8 Q2.2 1 .4 -4" stroke="#8d6e63" stroke-width="2.2" fill="none" stroke-linecap="round"/>` + ['M.4 -4 Q-5 -8.4 -8.4 -3.4 Q-4.4 -5 .4 -4Z', 'M.4 -4 Q5.6 -8.4 8.6 -3 Q4.6 -5 .4 -4Z', 'M.4 -4 Q-3 -9 -.6 -9.8 Q1 -8 .4 -4Z', 'M.4 -4 Q-6.6 -3.4 -7.4 1.4 Q-3.4 -2 .4 -4Z', 'M.4 -4 Q6.6 -3.4 7.6 1.4 Q3.4 -2 .4 -4Z'].map(d => `<path d="${d}" fill="#2e9e4f"/>`).join('') + `<circle cx="-.6" cy="-3.4" r="1" fill="#6d4c41"/><circle cx="1.4" cy="-3" r="1" fill="#6d4c41"/>`,
    beachball: () => `<circle r="6.2" fill="#fff"/><path d="M0 0 L0 -6.2 A6.2 6.2 0 0 1 5.4 -3.1Z" fill="#e53935"/><path d="M0 0 L5.4 3.1 A6.2 6.2 0 0 1 0 6.2Z" fill="#fdd835"/><path d="M0 0 L-5.4 3.1 A6.2 6.2 0 0 1 -5.4 -3.1Z" fill="#1e88e5"/><circle r="6.2" fill="none" stroke="#00000022" stroke-width=".5"/><circle r="1" fill="#fff"/>`,
    iceCream: () => `<path d="M-3.6 0 L0 9 L3.6 0Z" fill="#e0a96d"/><path d="M-1.8 2 L1.2 6 M1.8 2 L-1.2 6" stroke="#b98048" stroke-width=".6"/><circle cx="0" cy="-.4" r="4.2" fill="#f8bbd0"/><circle cx="0" cy="-4.4" r="3.4" fill="#fff8e1"/><circle cx="0" cy="-7.6" r="1.1" fill="#e53935"/>`,
    shell: () => `<path d="M-6 4 Q-7 -4 0 -6.4 Q7 -4 6 4 Q0 7.6 -6 4Z" fill="#ffccbc"/><path d="M0 -6 V6 M-3 -4.6 L-2.2 5.4 M3 -4.6 L2.2 5.4" stroke="#f4a58a" stroke-width=".7"/>`,
    confetti: c => `<rect x="-3" y="-1.4" width="6" height="2.8" rx=".6" fill="${c}"/>`,
    streamer: c => `<path d="M-6 -6 Q-2 -2 -6 2 Q-10 6 -5 8" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    hat: () => `<path d="M-5.4 8 L0 -8 L5.4 8Z" fill="#7e57c2"/><path d="M-3.2 3.4 L3.2 3.4 M-1.8 -.6 L1.8 -.6" stroke="#ffd54f" stroke-width="1.5"/><circle cx="0" cy="-8.4" r="1.9" fill="#ffd54f"/><ellipse cx="0" cy="8" rx="5.6" ry="1.2" fill="#5e35b1"/>`,
    clock: () => `<circle r="6.6" fill="#fffbe6" stroke="#d4a800" stroke-width="1.5"/>` + Array.from({ length: 12 }, (_, i) => `<path d="M0 -5.2 V-4.2" stroke="#8a6d00" stroke-width=".6" transform="rotate(${i * 30})"/>`).join('') + `<path d="M0 0 V-4.4 M0 0 L-.3 -3.6" stroke="#222" stroke-width="1" stroke-linecap="round"/><circle r=".8" fill="#222"/><g transform="translate(0 -7.4) scale(.6)">${`<path d="M-5.4 6 L0 -8 L5.4 6Z" fill="#7e57c2"/><circle cx="0" cy="-8.4" r="1.9" fill="#ffd54f"/>`}</g>`,
    bunny: () => `<ellipse cx="-2.8" cy="-6" rx="1.7" ry="4.4" fill="#f5f5f5"/><ellipse cx="2.8" cy="-6" rx="1.7" ry="4.4" fill="#f5f5f5"/><ellipse cx="-2.8" cy="-6" rx=".8" ry="3.2" fill="#f8bbd0"/><ellipse cx="2.8" cy="-6" rx=".8" ry="3.2" fill="#f8bbd0"/><ellipse cx="0" cy="4.2" rx="5.2" ry="4.4" fill="#f5f5f5"/><circle cx="0" cy="-.6" r="4.6" fill="#fafafa"/><circle cx="-1.7" cy="-1.2" r=".75" fill="#222"/><circle cx="1.7" cy="-1.2" r=".75" fill="#222"/><ellipse cx="0" cy=".8" rx=".9" ry=".6" fill="#f48fb1"/><path d="M0 1.4 V2.4 M0 2.4 Q-1 3.2 -1.8 2.8 M0 2.4 Q1 3.2 1.8 2.8" stroke="#8d6e63" stroke-width=".4" fill="none"/><circle cx="4.6" cy="6.4" r="1.6" fill="#fff"/>`,
    teddy: () => `<circle cx="-4.4" cy="-5.4" r="2.2" fill="#a1704a"/><circle cx="4.4" cy="-5.4" r="2.2" fill="#a1704a"/><circle cx="-4.4" cy="-5.4" r="1" fill="#d7a77d"/><circle cx="4.4" cy="-5.4" r="1" fill="#d7a77d"/><circle cx="0" cy="-2" r="5.4" fill="#b57e55"/><ellipse cx="0" cy="-.2" rx="2.4" ry="1.9" fill="#e6c29a"/><circle cx="0" cy="-.9" r=".8" fill="#3e2723"/><circle cx="-2" cy="-3" r=".7" fill="#3e2723"/><circle cx="2" cy="-3" r=".7" fill="#3e2723"/><ellipse cx="0" cy="5.4" rx="4.6" ry="3.6" fill="#b57e55"/><g transform="translate(0 4.6) scale(.5)">${`<path d="${HEART}" fill="#e53935"/>`}</g>`,
    rose: () => `<path d="M0 8 V1" stroke="#2e7d32" stroke-width="1.3"/><path d="M0 6 Q-5 4 -4.6 .6 Q-1 2.4 0 6Z M0 5 Q5 3 4.6 -.2 Q1 1.6 0 5Z" fill="#43a047"/><circle cx="0" cy="-2.6" r="4.8" fill="#d81b60"/><path d="M0 -2.6 m-2.6 0 a2.6 2.6 0 1 1 2.6 2.6 M-1.2 -2.6 a1.2 1.2 0 1 1 1.2 1.2" stroke="#ff80ab" stroke-width=".8" fill="none"/>`,
    pot: () => `<path d="M-6 0 Q-7.4 7.4 0 7.8 Q7.4 7.4 6 0Z" fill="#37474f"/><ellipse cx="0" cy="0" rx="6.6" ry="2.1" fill="#546e7a"/>${[[-3.6, -1.6], [0, -2.6], [3.6, -1.4], [-1.8, -4], [1.8, -3.8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#ffd54f" stroke="#e0a800" stroke-width=".5"/>`).join('')}`,
    unclehat: () => `<ellipse cx="0" cy="6.6" rx="8" ry="1.8" fill="#fff" stroke="#c62828" stroke-width=".5"/><rect x="-4.6" y="-8.4" width="9.2" height="14.6" fill="#fff"/>${[-6.2, -2, 2.2].map(y => `<rect x="-4.6" y="${y}" width="9.2" height="2.1" fill="#e53935"/>`).join('')}<rect x="-4.6" y="2.6" width="9.2" height="3.6" fill="#1e3a8a"/><path d="M0 3 L.5 4.2 L1.7 4.3 L.8 5 L1.1 6.1 L0 5.5 L-1.1 6.1 L-.8 5 L-1.7 4.3 L-.5 4.2Z" fill="#fff" transform="scale(.9) translate(0 .2)"/><ellipse cx="0" cy="-8.4" rx="4.6" ry="1.2" fill="#fff" stroke="#e53935" stroke-width=".4"/>`,
    flag: () => `<path d="M-6 8 V-8" stroke="#8d6e63" stroke-width="1.3" stroke-linecap="round"/><circle cx="-6" cy="-8.4" r="1.1" fill="#ffd54f"/>${Array.from({ length: 7 }, (_, i) => `<rect x="-5.4" y="${-7.4 + i * 1.8}" width="12.4" height="1.8" fill="${i % 2 ? '#fff' : '#e53935'}"/>`).join('')}<rect x="-5.4" y="-7.4" width="5.4" height="7.2" fill="#1e3a8a"/>${[[-4, -5.8], [-2, -5.8], [-3, -3.8], [-1, -3.8], [-4, -1.9], [-2, -1.9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".5" fill="#fff"/>`).join('')}`,
    burst: c => `<g>${anim('<animateTransform attributeName="transform" type="scale" values=".7;1.08;.7" dur="2.2s" repeatCount="indefinite"/>')}${Array.from({ length: 10 }, (_, i) => `<path d="M0 -3 L0 -8" stroke="${c[i % c.length]}" stroke-width="1.4" stroke-linecap="round" transform="rotate(${i * 36})"/><circle cx="0" cy="-9.4" r="1" fill="${c[(i + 1) % c.length]}" transform="rotate(${i * 36})"/>`).join('')}<circle r="1.6" fill="#fff"/></g>`,
    coin: () => `<circle r="5.4" fill="#ffd54f" stroke="#e0a800" stroke-width="1"/><circle r="3.4" fill="none" stroke="#e0a800" stroke-width=".7"/>`,
    bubble: () => `<circle r="5" fill="#b3e5fc" fill-opacity=".35" stroke="#e1f5fe" stroke-width=".9"/><path d="M-2.6 -2 Q-2 -3.4 -.6 -3.6" stroke="#fff" stroke-width=".9" fill="none" stroke-linecap="round"/>`,
    wreathOf: (piece, n) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return at((Math.sin(a) * 8).toFixed(1), (-Math.cos(a) * 8).toFixed(1), .55, piece(i), i * 360 / n); }).join(''),
    rainbow: () => ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5'].map((c, i) => `<path d="M${-9 + i * 1.4} 6 A${9 - i * 1.4} ${9 - i * 1.4} 0 0 1 ${9 - i * 1.4} 6" stroke="${c}" stroke-width="1.5" fill="none"/>`).join(''),
  };

  // A cluster of pieces for the 46-box corner overlays; sx<0 mirrors it for the right-hand corner.
  const cluster = pieces => sx => pieces.map(([x, y, s, r, inner]) => at(sx > 0 ? x : 46 - x, y, s, inner, sx > 0 ? r : -r)).join('');
  const cycle = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];

  // ── themes ──
  const THEMES = {
    newyear: {
      name: "New Year's", lights: ['#ffd54f', '#cfd8dc', '#ba68c8', '#4fc3f7'], bar: '#26266b', tint: ['#3a2a8a', .08],
      corner: cluster([[10, 10, 1.1, 10, P.star('#ffd54f')], [24, 7, 1, 25, P.confetti('#ec407a')], [8, 25, 1, 65, P.confetti('#4fc3f7')], [27, 18, 1, -30, P.confetti('#ffd54f')], [38, 9, 1, 50, P.confetti('#7e57c2')], [20, 22, .9, 0, P.star('#cfd8dc')], [13, 36, .9, 40, P.streamer('#ec407a')]]),
      hang: () => P.star('#ffd54f'), drift: i => P.confetti(cycle(['#ec407a', '#4fc3f7', '#ffd54f', '#7e57c2', '#66bb6a'], Math.floor(i * 7))),
      mascot: () => P.clock(), table: () => P.hat(), big: i => at(-4, 0, 1, P.balloon('#ffd54f')) + at(3, -1, 1, P.balloon('#cfd8dc')) + at(0, 4, 1, P.balloon(i % 2 ? '#ba68c8' : '#ec407a')),
      base: i => P.balloon(cycle(['#ffd54f', '#ba68c8', '#4fc3f7', '#ec407a'], i)), scatter: i => (i % 2 ? P.star('#ffd54f') : P.confetti(cycle(['#ec407a', '#4fc3f7', '#7e57c2'], i))),
      door: () => P.burst(['#ffd54f', '#cfd8dc', '#ec407a']),
      avatar: () => P.clock(), flank: () => [P.balloon('#ffd54f'), P.star('#ffd54f')],
    },
    valentines: {
      name: "Valentine's Day", lights: ['#ff4081', '#f8bbd0', '#e91e63', '#ffffff'], bar: '#c2185b', tint: ['#ff4081', .07],
      corner: cluster([[10, 10, 1.2, -15, P.heart('#e91e63')], [24, 7, .9, 15, P.heart('#f48fb1')], [9, 25, .9, 20, P.heart('#ff4081')], [27, 19, 1, -10, P.rose()], [38, 9, .7, 20, P.heart('#e91e63')], [18, 35, .7, -20, P.heart('#f8bbd0')]]),
      hang: () => P.heart('#e91e63'), drift: i => P.heart(cycle(['#e91e63', '#f48fb1', '#ff4081'], Math.floor(i * 7))),
      mascot: () => P.teddy(), table: () => P.heart('#e91e63') + `<path d="M-2.6 -5 L0 -3.4 L2.6 -5 L2.6 -2 L0 -3.4 L-2.6 -2Z" fill="#ffd54f"/>`,
      big: i => at(-3.4, 0, 1, P.heart('#e91e63')) + at(3.4, 1, .9, P.heart('#f48fb1')), base: i => P.rose(), scatter: i => P.heart(cycle(['#f48fb1', '#e91e63', '#ff80ab'], i)),
      door: () => P.wreathOf(() => P.heart('#e91e63'), 7),
      avatar: () => P.heart('#e91e63'), flank: () => [P.rose(), P.teddy()],
    },
    stpatricks: {
      name: "St. Patrick's Day", lights: ['#2e7d32', '#ffd54f', '#ffffff', '#43a047'], bar: '#1b7a3a', tint: ['#2e7d32', .08],
      corner: cluster([[10, 10, 1.2, -15, P.shamrock('#2e9e4f')], [24, 8, .9, 20, P.shamrock('#43a047')], [9, 25, .9, 25, P.shamrock('#1b8a3c')], [27, 19, 1, -10, P.coin()], [38, 9, .8, 15, P.shamrock('#2e9e4f')], [18, 35, .7, -20, P.coin()]]),
      hang: () => P.coin(), drift: i => P.shamrock(cycle(['#2e9e4f', '#43a047', '#66bb6a'], Math.floor(i * 7))),
      mascot: () => P.pot(), table: () => P.shamrock('#2e9e4f'), big: i => (i % 2 ? at(0, 0, 1.05, P.shamrock('#2e9e4f')) : P.pot()),
      base: i => P.shamrock('#2e9e4f'), scatter: i => (i % 2 ? P.coin() : P.shamrock('#43a047')), door: () => P.rainbow(),
      avatar: () => P.pot(), flank: () => [P.shamrock('#2e9e4f'), P.coin()],
    },
    spring: {
      name: 'Spring & Easter', lights: ['#f48fb1', '#fff176', '#81d4fa', '#a5d6a7'], bar: '#3a9d6b', tint: ['#a5d6a7', .1],
      corner: cluster([[10, 10, 1.1, -10, P.tulip('#ec407a')], [24, 8, 1, 10, P.daisy('#fff', '#ffca28')], [9, 26, .9, -20, P.daisy('#fff', '#ffca28')], [27, 19, 1, 15, P.tulip('#ffb300')], [38, 9, .8, 15, P.egg('#81d4fa', '#fff')], [18, 35, .8, -20, P.tulip('#ab47bc')]]),
      hang: () => P.egg('#f48fb1', '#fff'), drift: i => P.butterfly(cycle(['#f48fb1', '#81d4fa', '#ffd54f'], Math.floor(i * 7)), '#ba68c8'),
      mascot: () => P.bunny(), table: i => P.egg(cycle(['#f48fb1', '#81d4fa', '#fff176'], i), '#fff'), big: i => at(-4, 1, 1, P.tulip('#ec407a')) + at(0, 0, 1.1, P.tulip('#ffb300')) + at(4, 1, 1, P.tulip('#ab47bc')),
      base: i => P.tulip(cycle(['#ec407a', '#ffb300', '#ab47bc', '#ef5350'], i)), scatter: i => (i % 2 ? P.daisy('#fff', '#ffca28') : P.egg(cycle(['#f48fb1', '#81d4fa', '#fff176'], i), '#fff')),
      door: () => P.wreathOf(i => P.egg(cycle(['#f48fb1', '#81d4fa', '#fff176', '#a5d6a7'], i), '#fff'), 7),
      avatar: () => P.bunny(), flank: () => [P.tulip('#ec407a'), P.egg('#f48fb1', '#fff')],
    },
    july4: {
      name: 'Fourth of July', lights: ['#e53935', '#ffffff', '#1e88e5', '#ffffff'], bar: '#1f3f8f', tint: ['#1e3a8a', .08],
      corner: cluster([[10, 10, 1.1, 10, P.star('#e53935')], [24, 7, .9, -15, P.star('#fff')], [9, 25, .9, 20, P.star('#1e88e5')], [27, 18, 1, -10, P.star('#e53935')], [38, 9, .8, 15, P.star('#fff')], [18, 35, .8, 20, P.star('#1e88e5')]]),
      hang: () => P.star('#e53935'), drift: i => P.star(cycle(['#e53935', '#fff', '#1e88e5'], Math.floor(i * 7))),
      mascot: () => P.unclehat(), table: () => at(0, 0, .85, P.flag()), big: i => P.burst(cycle([['#e53935', '#fff', '#1e88e5'], ['#ffd54f', '#e53935', '#fff']], i)),
      base: () => at(0, 0, 1, P.flag()), scatter: i => P.star(cycle(['#fff', '#e53935', '#1e88e5'], i)), door: () => P.burst(['#e53935', '#fff', '#1e88e5']),
      avatar: () => P.flag(), flank: () => [P.star('#e53935'), P.burst(['#e53935', '#fff', '#1e88e5'])],
    },
    summer: {
      name: 'Summer', lights: ['#ffb300', '#ff7043', '#26c6da', '#66bb6a'], bar: '#e08a00', tint: ['#ffe082', .12],
      corner: cluster([[11, 11, 1.1, -20, P.palm()], [26, 9, 1, 15, P.sun()], [9, 27, .9, 10, P.shell()], [30, 21, .9, -10, P.beachball()], [39, 9, .7, 0, P.bubble()]]),
      hang: () => P.beachball(), drift: i => P.bubble(), mascot: () => P.sunface(), table: () => P.iceCream(), big: () => P.palm(),
      base: () => P.beachball(), scatter: i => (i % 2 ? P.shell() : P.bubble()), door: () => P.sun(),
      avatar: () => P.sunface(), flank: () => [P.beachball(), P.palm()],
    },
  };

  const svg60 = inner => `<svg viewBox="-10 -10 20 20" width="54" height="54" aria-hidden="true" focusable="false" style="overflow:visible">${inner}</svg>`;

  return {
    ids: Object.keys(THEMES),
    has: id => !!THEMES[id],
    name: id => THEMES[id] && THEMES[id].name,
    avatar: id => svg60(THEMES[id].avatar()),
    flank: id => THEMES[id].flank().map(svg60),
    // Corner piece for the podium / page (CSS mirrors it for the right-hand one via .flip).
    pageCorner: (id, flip, size) => `<svg class="lb-season-web${flip ? ' flip' : ''}" viewBox="0 0 46 46" width="${size || 44}" height="${size || 44}">${THEMES[id].corner(1)}</svg>`,
    drift: (id, cls) => `<svg class="lb-season-bat ${cls}" viewBox="-10 -10 20 20" width="26" height="26">${THEMES[id].drift(.3)}</svg>`,
    hangerSvg: id => `<svg viewBox="-12 -6 24 40" width="26" height="42" style="display:block;overflow:visible"><line x1="0" y1="-6" x2="0" y2="9" stroke="#d8c9a8" stroke-width="1"/>${at(0, 17, 1, THEMES[id].hang())}</svg>`,
    // For generating the CSS custom properties (see styles.css): corner as a standalone SVG + bulb colours.
    cssCorner: id => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46">${THEMES[id].corner(-1)}</svg>`,
    lights: id => THEMES[id].lights,
    // Placement helpers in the mall's coordinate space (same interface as the other kits, plus extras).
    kit: id => {
      const T = THEMES[id];
      return {
        anim, lights: T.lights, bar: T.bar, tint: T.tint,
        corner: sx => T.corner(sx),
        hanger: (x, y) => `<g transform="translate(${x} ${y})">${anim('<animateTransform attributeName="transform" type="rotate" additive="sum" values="-6;6;-6" dur="3.4s" repeatCount="indefinite"/>')}${at(0, 13, .85, T.hang())}</g>`,
        drifter: (x, y, s, dur, delay) => `<g transform="translate(${x} ${y}) scale(${s})"><g>${anim(`<animateTransform attributeName="transform" type="translate" values="0 -8;8 6;-4 20;6 34" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>`)}${T.drift(delay)}</g></g>`,
        mascot: (x, y, s) => at(x, y, s || 1, T.mascot()),
        prop: (x, y, s, i) => (i % 2 ? at(x, y, s * 1.1, T.base(i)) : at(x, y, s * .8, T.big(i))),
        table: (x, y, s, i) => at(x, y, s, T.table(i)),
        big: (x, y, s, i) => at(x, y, s, T.big(i)),
        scatter: (x, y, s, i) => at(x, y, s, T.scatter(i), i * 37),
        base: (x, y, s, i) => at(x, y, s, T.base(i)),
        door: (x, y, s) => (T.door ? at(x, y, s, T.door()) : ''),
      };
    },
  };
})();
