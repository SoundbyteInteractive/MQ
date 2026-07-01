const GainsShop = (() => {

// ── SUPPLEMENTS ──
const ITEMS = [
  { id: 'protein',    name: 'Protein Shake',  cost: 50,  buff: '+25% muscle XP',       duration: 24, type: 'shelf', color: '#5d4037', label: 'PROTEIN', labelColor: '#3e2723' },
  { id: 'creatine',   name: 'Creatine',       cost: 80,  buff: '+40% muscle growth',    duration: 24, type: 'fridge', color: '#1e88e5', label: 'CREAT',   labelColor: '#1565c0' },
  { id: 'preworkout', name: 'Pre-Workout',    cost: 60,  buff: '+30% overall XP',       duration: 24, type: 'fridge', color: '#e53935', label: 'PRE',     labelColor: '#c62828' },
  { id: 'bcaa',       name: 'BCAAs',          cost: 40,  buff: 'Rest day → 150 XP',     duration: 24, type: 'shelf', color: '#ffca28', label: 'BCAA',    labelColor: '#f57f17' },
  { id: 'energybar',  name: 'Energy Bar',     cost: 25,  buff: '+1 fight attempt',      duration: 0,  type: 'shelf', color: '#66bb6a', label: 'E-BAR',   labelColor: '#2e7d32' },
  { id: 'multivitamin',name:'Multivitamin',   cost: 100, buff: 'Streak protection',     duration: 48, type: 'shelf', color: '#ffa726', label: 'MULTI',   labelColor: '#e65100' },
  { id: 'fatburner',  name: 'Fat Burner',     cost: 70,  buff: '2x gold earned',        duration: 24, type: 'fridge', color: '#7cb342', label: 'BURN',    labelColor: '#558b2f' },
  { id: 'massgainer', name: 'Mass Gainer',    cost: 120, buff: '+50% compound XP',      duration: 24, type: 'fridge', color: '#8e24aa', label: 'MASS',    labelColor: '#6a1b9a' },
];

const SOLD_OUT = [
  { name: '???', type: 'shelf',  color: '#444', label: '???', labelColor: '#333' },
  { name: '???', type: 'shelf',  color: '#444', label: '???', labelColor: '#333' },
  { name: '???', type: 'fridge', color: '#444', label: '???', labelColor: '#333' },
  { name: '???', type: 'fridge', color: '#444', label: '???', labelColor: '#333' },
];

// ── CLOTHING (FORGED™ Apparel) ──
const CLOTHING = [
  { id: 'forged_tank',     name: 'Performance Tank',   brand: true, cost: 180, type: 'torso', desc: 'Moisture-wicking training tank with FORGED™ back logo', color: '#1a1a2e', accent: '#7c4dff' },
  { id: 'forged_joggers',  name: 'Tapered Joggers',    brand: true, cost: 240, type: 'legs',  desc: 'Slim-fit jogger pants — built to flex', color: '#0d1117', accent: '#9e7cff' },
  { id: 'lifting_gloves',  name: 'Lifting Gloves',     brand: false, cost: 80, type: 'wrist', desc: 'Open-palm leather grip gloves', color: '#3a2a1a', accent: '#c8965e' },
  { id: 'compression_set', name: 'Compression Set',    brand: false, cost: 150, type: 'legs', desc: 'Full-length compression tights for leg day', color: '#0d1a2e', accent: '#4488ff' },
  { id: 'do_rag',          name: 'Do-Rag',             brand: false, cost: 60,  type: 'head', desc: 'Keep sweat out, keep the drip in', color: '#111', accent: '#aaa' },
  { id: 'forged_bag',      name: 'Pro Duffel Bag',     brand: true, cost: 300, type: 'accessory', desc: 'The only bag you need — 40L gym carry', color: '#1a1a2e', accent: '#7c4dff' },
  { id: 'forged_shaker',   name: 'FORGED™ Shaker',    brand: true, cost: 120, type: 'accessory', desc: 'Insulated 32oz shaker cup', color: '#7c4dff', accent: '#fff' },
  { id: 'gym_towel',       name: 'Microfibre Towel',   brand: false, cost: 45,  type: 'accessory', desc: 'Ultra-absorbent, anti-odour', color: '#1b5e20', accent: '#4caf50' },
  { id: 'flip_flops',      name: 'Locker Room Slides', brand: false, cost: 35,  type: 'feet',      desc: 'Essential post-workout footwear', color: '#0288d1', accent: '#b3e5fc' },
  { id: 'borat_suit',      name: 'The Mankini',        brand: false, cost: 999, type: 'body',      desc: 'Very nice. Great success. 🍇', color: '#00c853', accent: '#fff' },
];

// ── HAIRSTYLES (Chop Shop Barber) ──
const HAIRSTYLES = [
  { id: 'default',       name: 'Short Crop',     cost: 0,   cat: 'M', desc: 'Classic starter cut — no frills' },
  { id: 'buzz',          name: 'Buzz Cut',        cost: 50,  cat: 'M', desc: 'Military-clean, zero maintenance' },
  { id: 'crew',          name: 'Crew Cut',        cost: 75,  cat: 'M', desc: 'Preppy and athletic' },
  { id: 'slick_back',    name: 'Slick Back',      cost: 100, cat: 'M', desc: 'Old-school cool, all combed back' },
  { id: 'undercut',      name: 'Undercut',        cost: 120, cat: 'M', desc: 'Disconnected shaved sides, flow on top' },
  { id: 'pompadour',     name: 'Pompadour',       cost: 150, cat: 'M', desc: 'High volume sweep — big energy' },
  { id: 'mohawk',        name: 'Mohawk',          cost: 200, cat: 'M', desc: 'Shaved sides, strip of glory down the center' },
  { id: 'taper_fade',    name: 'Taper Fade',      cost: 100, cat: 'M', desc: 'Clean skin fade up to length on top' },
  { id: 'long_straight', name: 'Long Straight',   cost: 150, cat: 'W', desc: 'Sleek, center-parted flow past shoulders' },
  { id: 'beach_waves',   name: 'Beach Waves',     cost: 120, cat: 'W', desc: 'Loose wavy shoulder-length style' },
  { id: 'high_pony',     name: 'High Ponytail',   cost: 80,  cat: 'W', desc: 'All pulled up for maximum performance' },
  { id: 'bob',           name: 'Bob Cut',         cost: 100, cat: 'W', desc: 'Sharp, blunt chin-length classic' },
  { id: 'pixie',         name: 'Pixie Cut',       cost: 90,  cat: 'W', desc: 'Short, soft, and elfin — low fuss' },
  { id: 'braided_crown', name: 'Braided Crown',   cost: 180, cat: 'W', desc: 'Braids wrapped like a warrior halo' },
  { id: 'space_buns',    name: 'Space Buns',      cost: 60,  cat: 'W', desc: 'Two buns, maximum chaos energy' },
  { id: 'shaved',        name: 'Shaved Head',     cost: 0,   cat: 'U', desc: 'Nothing to hide. Pure intimidation.' },
  { id: 'afro',          name: 'Afro',            cost: 150, cat: 'U', desc: 'Natural, full, and powerful' },
  { id: 'cornrows',      name: 'Cornrows',        cost: 160, cat: 'U', desc: 'Tight braided rows, all business' },
  { id: 'locs',          name: 'Dreadlocks',      cost: 200, cat: 'U', desc: 'Rope-locked and legendary' },
  { id: 'man_bun',       name: 'Top Knot',        cost: 80,  cat: 'U', desc: 'Bun sitting high on the crown' },
  { id: 'curly_fro',     name: 'Curly Fro',       cost: 130, cat: 'U', desc: 'Loose bouncy curls all over' },
  { id: 'emo_sweep',     name: 'Emo Sweep',       cost: 110, cat: 'U', desc: 'Side-swept fringe — brooding and athletic' },
  { id: 'flat_top',     name: 'Flat-Top',        cost: 140, cat: 'U', desc: 'High-top fade with a sharp flat crown' },
];

let _barberIdx = 0;

// ── SPORTING GOODS (Iron Depot) ──
const EQUIPMENT = [
  { id: 'pull_up_bar',   name: 'Pull-Up Bar',        cost: 150, bonus: '+10% Back & +5% Biceps XP',         icon: '🏗',  color: '#4a3a2a', cat: 'Upper' },
  { id: 'dip_bar',       name: 'Dip / Pull-Up Station', cost: 200, bonus: '+10% Triceps & +5% Chest XP',    icon: '🏋',  color: '#2a4a2a', cat: 'Upper' },
  { id: 'assault_bike',  name: 'Assault Air Bike',     cost: 480, bonus: '+20% Cardio & +8% Shoulders XP',  icon: '🚴',  color: '#b71c1c', cat: 'Cardio' },
  { id: 'dumbbells',     name: 'Adjustable Dumbbells',cost:300, bonus: '+10% Arms & +5% Shoulders XP',       icon: '🏋',  color: '#3a2a4a', cat: 'Upper' },
  { id: 'flat_bench',    name: 'Flat Bench Press',    cost: 350, bonus: '+10% Chest & +5% Triceps XP',       icon: '🛋',  color: '#4a2a3a', cat: 'Upper' },
  { id: 'squat_rack',    name: 'Squat Rack',          cost: 500, bonus: '+10% Quads & Glutes XP',            icon: '🏗',  color: '#2a3a4a', cat: 'Lower' },
  { id: 'kettlebell',    name: 'Kettlebell Set',      cost: 200, bonus: '+10% Abs & +5% Glutes XP',          icon: '⚫',  color: '#4a4a2a', cat: 'Core' },
  { id: 'treadmill',     name: 'Treadmill',           cost: 600, bonus: '+15% Cardio XP',                    icon: '🏃',  color: '#4a2a2a', cat: 'Cardio' },
  { id: 'cable_machine', name: 'Cable Machine',       cost: 800, bonus: '+5% Full-Body XP on all muscles',   icon: '⚙',  color: '#3a4a2a', cat: 'Full Body' },
  { id: 'foam_roller',   name: 'Foam Roller',         cost: 80,  bonus: 'Passive streak protection',         icon: '🌀',  color: '#2a4a3a', cat: 'Recovery' },
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getState() {
  try { return JSON.parse(localStorage.getItem('musclequest_save') || '{}'); } catch(e) { return {}; }
}
function saveState(s) {
  localStorage.setItem('musclequest_save', JSON.stringify(s));
  const user = localStorage.getItem('musclequest_current_user');
  const pin = localStorage.getItem('musclequest_current_pin');
  if (user) localStorage.setItem(`musclequest_${user}`, JSON.stringify({ ...s, _pin: pin }));
}
function getActiveBuffs() {
  const s = getState();
  const now = Date.now();
  return (s.activeBuffs || []).filter(b => b.expiresAt > now || b.expiresAt === 0);
}
function isBuffActive(id) { return getActiveBuffs().some(b => b.id === id); }
function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast gold';
  el.textContent = msg;
  document.getElementById('toast-container')?.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
function formatTimeLeft(ms) {
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function syncGold() {
  const s = getState();
  if (document.getElementById('player-gold')) document.getElementById('player-gold').textContent = (s.gold || 0).toLocaleString();
  try { if (typeof MQ !== 'undefined') MQ.syncStateFromStorage(); } catch(e) {}
}

// ── PURCHASE FUNCTIONS ──
function buyItem(id) {
  const item = ITEMS.find(i => i.id === id);
  if (!item) return;
  const s = getState();
  if ((s.gold || 0) < item.cost) { showToast('Not enough gold!'); return; }
  if (item.duration > 0 && isBuffActive(id)) { showToast('Already active!'); return; }
  s.gold -= item.cost;
  if (!s.activeBuffs) s.activeBuffs = [];
  if (item.id === 'energybar') {
    localStorage.removeItem('musclequest_fight');
    showToast('Fight attempt restored!');
  } else {
    s.activeBuffs.push({ id: item.id, expiresAt: Date.now() + item.duration * 3600000 });
    showToast(`${item.name} activated!`);
  }
  s.activeBuffs = s.activeBuffs.filter(b => b.expiresAt > Date.now() || b.expiresAt === 0);
  saveState(s);
  syncGold();
  try { if (typeof playSFX === 'function') playSFX('submit'); } catch(e) {}
  openBodega();
}

function buyClothing(id) {
  const item = CLOTHING.find(i => i.id === id);
  if (!item) return;
  const s = getState();
  if (!s.purchasedCosmetics) s.purchasedCosmetics = [];
  if (s.purchasedCosmetics.includes(id)) { showToast('Already owned!'); return; }
  if ((s.gold || 0) < item.cost) { showToast('Not enough gold!'); return; }
  s.gold -= item.cost;
  s.purchasedCosmetics.push(id);
  saveState(s);
  syncGold();
  showToast(`${item.brand ? 'FORGED™ ' : ''}${item.name} purchased!`);
  try { if (typeof playSFX === 'function') playSFX('submit'); } catch(e) {}
  openClothing();
}

function buyEquipment(id) {
  const item = EQUIPMENT.find(i => i.id === id);
  if (!item) return;
  const s = getState();
  if (!s.equipment) s.equipment = {};
  if (s.equipment[id]) { showToast('Already owned!'); return; }
  if ((s.gold || 0) < item.cost) { showToast('Not enough gold!'); return; }
  s.gold -= item.cost;
  s.equipment[id] = true;
  saveState(s);
  syncGold();
  showToast(`${item.name} added to your gym!`);
  try { if (typeof playSFX === 'function') playSFX('submit'); } catch(e) {}
  openSporting();
}

function petCat() {
  const today = todayStr();
  if (localStorage.getItem('musclequest_cat_pet') === today) {
    showToast('Cat is napping... come back tomorrow!'); return;
  }
  const coins = Math.floor(Math.random() * 6) + 5;
  const s = getState(); s.gold = (s.gold || 0) + coins;
  saveState(s); localStorage.setItem('musclequest_cat_pet', today);
  showToast(`+${coins} gold! The cat approves!`);
  syncGold(); openBodega();
}

// ── SVG HELPERS (Bodega) ──
function renderBottle(item, soldOut) {
  if (soldOut) return `<svg width="36" height="30" viewBox="0 0 36 30"><rect x="8" y="2" width="20" height="24" rx="3" fill="#333" opacity="0.5"/><rect x="10" y="6" width="16" height="8" rx="1" fill="#222" opacity="0.5"/><text x="18" y="12" text-anchor="middle" font-size="4" fill="#555" font-weight="bold" font-family="Courier New">???</text><rect x="12" y="0" width="12" height="4" rx="2" fill="#222" opacity="0.5"/></svg>`;
  return `<svg width="36" height="30" viewBox="0 0 36 30"><rect x="8" y="2" width="20" height="24" rx="3" fill="${item.color}"/><rect x="10" y="6" width="16" height="8" rx="1" fill="#fff" opacity="0.9"/><text x="18" y="12" text-anchor="middle" font-size="${item.label.length > 4 ? 4 : 5}" fill="${item.labelColor}" font-weight="bold" font-family="Courier New">${item.label}</text><rect x="12" y="0" width="12" height="4" rx="2" fill="${item.labelColor}"/></svg>`;
}
function renderBox(item, soldOut) {
  if (soldOut) return `<svg width="48" height="28" viewBox="0 0 48 28"><rect x="2" y="2" width="44" height="22" rx="4" fill="#333" opacity="0.5"/><rect x="6" y="5" width="36" height="14" rx="2" fill="#222" opacity="0.5"/><text x="24" y="15" text-anchor="middle" font-size="5" fill="#555" font-weight="bold" font-family="Courier New">SOLD OUT</text></svg>`;
  return `<svg width="48" height="28" viewBox="0 0 48 28"><rect x="2" y="2" width="44" height="22" rx="4" fill="${item.color}"/><rect x="6" y="5" width="36" height="14" rx="2" fill="#fff" opacity="0.85"/><text x="24" y="15" text-anchor="middle" font-size="5" fill="${item.labelColor}" font-weight="bold" font-family="Courier New">${item.label}</text></svg>`;
}
function renderCat() {
  return `<svg width="40" height="35" viewBox="0 0 40 35"><ellipse cx="20" cy="25" rx="14" ry="9" fill="#8B7355"/><path d="M34 24 Q42 18 38 12" stroke="#8B7355" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="10" cy="16" rx="9" ry="8" fill="#8B7355"/><polygon points="4,10 2,2 9,8" fill="#8B7355"/><polygon points="14,8 16,1 10,6" fill="#8B7355"/><polygon points="5,9 3,4 8,8" fill="#D4A574"/><polygon points="13,7 15,3 10,7" fill="#D4A574"/><ellipse cx="7" cy="15" rx="2" ry="2.5" fill="#4CAF50"/><ellipse cx="13" cy="15" rx="2" ry="2.5" fill="#4CAF50"/><ellipse cx="7" cy="15" rx="1" ry="2" fill="#111"/><ellipse cx="13" cy="15" rx="1" ry="2" fill="#111"/><circle cx="7.5" cy="14" r="0.6" fill="#fff"/><circle cx="13.5" cy="14" r="0.6" fill="#fff"/><polygon points="9,18 10,17 11,18" fill="#D4A574"/><line x1="0" y1="17" x2="6" y2="17" stroke="#aaa" stroke-width="0.4"/><line x1="0" y1="19" x2="6" y2="18" stroke="#aaa" stroke-width="0.4"/><line x1="14" y1="17" x2="20" y2="17" stroke="#aaa" stroke-width="0.4"/><line x1="14" y1="18" x2="20" y2="19" stroke="#aaa" stroke-width="0.4"/><path d="M6 10 Q10 8 14 10" stroke="#6B5B3E" stroke-width="0.8" fill="none"/><path d="M5 12 Q10 10 15 12" stroke="#6B5B3E" stroke-width="0.6" fill="none"/><ellipse cx="12" cy="32" rx="4" ry="3" fill="#8B7355"/><ellipse cx="20" cy="33" rx="3" ry="2" fill="#8B7355"/></svg>`;
}

// ── HANGER SVGs (for boutique rack scene) ──
function renderHanger(item, owned) {
  const col = owned ? item.color + 'cc' : item.color;
  const acc = item.accent;
  const check = owned ? `<text x="30" y="65" text-anchor="middle" font-size="8" fill="#4caf50" font-weight="bold">✓</text>` : '';
  const wire = `<path d="M30 3 Q30 0 33 0 Q37 0 37 3 Q37 6 33 6" stroke="#888" stroke-width="1.5" fill="none"/>
    <line x1="30" y1="6" x2="30" y2="13" stroke="#888" stroke-width="1.5"/>
    <path d="M5 22 L30 13 L55 22" stroke="#888" stroke-width="2" fill="none" stroke-linecap="round"/>`;

  if (item.id === 'forged_tank') return `<svg width="60" height="68" viewBox="0 0 60 68">${wire}
    <path d="M11 23 L7 34 L16 36 L16 60 L44 60 L44 36 L53 34 L49 23 L38 30 Q30 34 22 30 Z" fill="${col}" stroke="${acc}66" stroke-width="1"/>
    <path d="M22 30 Q30 26 38 30" fill="none" stroke="${acc}99" stroke-width="1"/>
    <text x="30" y="49" text-anchor="middle" font-size="4.5" fill="${acc}" font-weight="bold" font-family="Cinzel,serif">FORGED</text>
    ${check}</svg>`;

  if (item.id === 'forged_joggers') return `<svg width="60" height="68" viewBox="0 0 60 68">${wire}
    <rect x="13" y="22" width="34" height="16" rx="2" fill="${col}" stroke="${acc}66" stroke-width="1"/>
    <path d="M13 38 L10 62 L26 62 L30 46 L34 62 L50 62 L47 38 Z" fill="${col}" stroke="${acc}55" stroke-width="1"/>
    <line x1="30" y1="38" x2="30" y2="46" stroke="${acc}44" stroke-width="1"/>
    <text x="30" y="33" text-anchor="middle" font-size="4" fill="${acc}" font-weight="bold" font-family="Cinzel,serif">FORGED</text>
    ${check}</svg>`;

  if (item.id === 'do_rag') return `<svg width="60" height="68" viewBox="0 0 60 68">
    <circle cx="30" cy="10" r="5" fill="#555" stroke="#666" stroke-width="1"/>
    <path d="M14 23 Q30 15 46 23 Q44 40 30 44 Q16 40 14 23 Z" fill="${col}" stroke="${acc}55" stroke-width="1"/>
    <path d="M38 38 Q46 46 44 60" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M22 38 Q14 46 16 60" stroke="${col}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M18 24 Q30 20 42 24" stroke="${acc}44" stroke-width="1" fill="none"/>
    ${check}</svg>`;

  if (item.id === 'lifting_gloves') return `<svg width="60" height="68" viewBox="0 0 60 68">
    <circle cx="16" cy="5" r="4" fill="#555"/><circle cx="44" cy="5" r="4" fill="#555"/>
    <line x1="16" y1="5" x2="16" y2="16" stroke="#777" stroke-width="1.5"/>
    <line x1="44" y1="5" x2="44" y2="16" stroke="#777" stroke-width="1.5"/>
    <path d="M4 20 L6 54 Q8 60 16 60 Q24 60 26 54 L28 20 Z" fill="${col}" stroke="${acc}55" stroke-width="1"/>
    <path d="M4 20 L8 13 M8 13 L13 9 M13 9 L18 7" stroke="${col}" stroke-linecap="round" stroke-width="6 5 4" fill="none"/>
    <line x1="4" y1="20" x2="8" y2="13" stroke="${col}" stroke-width="6" stroke-linecap="round"/>
    <line x1="8" y1="13" x2="13" y2="9" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
    <line x1="13" y1="9" x2="17" y2="7" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
    <path d="M56 20 L54 54 Q52 60 44 60 Q36 60 34 54 L32 20 Z" fill="${col}" stroke="${acc}55" stroke-width="1"/>
    <line x1="56" y1="20" x2="52" y2="13" stroke="${col}" stroke-width="6" stroke-linecap="round"/>
    <line x1="52" y1="13" x2="47" y2="9" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
    <line x1="47" y1="9" x2="43" y2="7" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
    ${check}</svg>`;

  if (item.id === 'compression_set') return `<svg width="60" height="68" viewBox="0 0 60 68">${wire}
    <path d="M16 22 L15 40 L11 64 L26 64 L30 44 L34 64 L49 64 L45 40 L44 22 Z" fill="${col}" stroke="${acc}55" stroke-width="1"/>
    <line x1="14" y1="32" x2="25" y2="32" stroke="${acc}44" stroke-width="1"/>
    <line x1="35" y1="32" x2="46" y2="32" stroke="${acc}44" stroke-width="1"/>
    <line x1="13" y1="42" x2="23" y2="42" stroke="${acc}44" stroke-width="1"/>
    <line x1="37" y1="42" x2="47" y2="42" stroke="${acc}44" stroke-width="1"/>
    ${check}</svg>`;

  if (item.id === 'forged_bag') return `<svg width="68" height="60" viewBox="0 0 68 60">
    <path d="M8 20 Q8 12 34 12 Q60 12 60 20 L58 48 Q58 54 34 54 Q10 54 10 48 Z" fill="${col}" stroke="${acc}55" stroke-width="1.5"/>
    <path d="M22 12 Q22 5 34 5 Q46 5 46 12" stroke="${acc}88" stroke-width="2" fill="none"/>
    <rect x="18" y="24" width="32" height="16" rx="3" fill="none" stroke="${acc}55" stroke-width="1"/>
    <text x="34" y="36" text-anchor="middle" font-size="4.5" fill="${acc}" font-weight="bold" font-family="Cinzel,serif">FORGED</text>
    ${owned ? `<text x="34" y="52" text-anchor="middle" font-size="7" fill="#4caf50" font-weight="bold">✓</text>` : ''}</svg>`;

  if (item.id === 'forged_shaker') return `<svg width="44" height="62" viewBox="0 0 44 62">
    <rect x="10" y="14" width="24" height="42" rx="6" fill="${col}" stroke="${acc}55" stroke-width="1.5"/>
    <rect x="14" y="10" width="16" height="6" rx="3" fill="${acc}88"/>
    <rect x="12" y="26" width="20" height="12" rx="2" fill="#ffffff11"/>
    <text x="22" y="37" text-anchor="middle" font-size="4.5" fill="${acc}" font-weight="bold" font-family="Cinzel,serif">FORGED</text>
    ${owned ? `<text x="22" y="56" text-anchor="middle" font-size="8" fill="#4caf50" font-weight="bold">✓</text>` : ''}</svg>`;

  if (item.id === 'flip_flops') return `<svg width="68" height="52" viewBox="0 0 68 52">
    <!-- Left slide -->
    <ellipse cx="17" cy="36" rx="14" ry="8" fill="${col}" stroke="${acc}55" stroke-width="1.5"/>
    <ellipse cx="17" cy="34" rx="14" ry="7" fill="${col}"/>
    <path d="M10 28 Q14 20 17 18 Q20 20 24 28" stroke="${acc}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <line x1="17" y1="18" x2="17" y2="28" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
    <!-- Right slide -->
    <ellipse cx="51" cy="36" rx="14" ry="8" fill="${col}" stroke="${acc}55" stroke-width="1.5"/>
    <ellipse cx="51" cy="34" rx="14" ry="7" fill="${col}"/>
    <path d="M44 28 Q48 20 51 18 Q54 20 58 28" stroke="${acc}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <line x1="51" y1="18" x2="51" y2="28" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
    ${owned ? `<text x="34" y="50" text-anchor="middle" font-size="7" fill="#4caf50" font-weight="bold">✓</text>` : ''}</svg>`;

  if (item.id === 'borat_suit') return `<svg width="60" height="68" viewBox="0 0 60 68">
    <!-- Hanger for the mankini -->
    ${wire}
    <!-- The legendary mankini straps -->
    <path d="M22 24 Q18 32 14 42 Q12 50 16 58 Q20 64 30 64 Q40 64 44 58 Q48 50 46 42 Q42 32 38 24" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
    <!-- Neck strap -->
    <path d="M22 24 Q30 18 38 24" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Bottom piece -->
    <path d="M14 52 Q22 56 30 54 Q38 56 46 52" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <!-- Grapes emoji hint -->
    <text x="30" y="45" text-anchor="middle" font-size="11">🍇</text>
    ${check}</svg>`;

  // gym_towel (folded on shelf)
  return `<svg width="56" height="46" viewBox="0 0 56 46">
    <rect x="4" y="6" width="48" height="28" rx="5" fill="${col}" stroke="${acc}55" stroke-width="1.5"/>
    <line x1="4" y1="16" x2="52" y2="16" stroke="${acc}44" stroke-width="1"/>
    <line x1="4" y1="25" x2="52" y2="25" stroke="${acc}44" stroke-width="1"/>
    <rect x="20" y="34" width="16" height="8" rx="3" fill="${col}" stroke="${acc}44" stroke-width="1"/>
    ${owned ? `<text x="28" y="44" text-anchor="middle" font-size="7" fill="#4caf50" font-weight="bold">✓</text>` : ''}</svg>`;
}

// ── EQUIPMENT SVGs (for Iron Depot scene) ──
function renderDepotItem(item, owned) {
  const dim = owned ? ' opacity="0.7"' : '';
  const check = owned ? `<text x="50%" y="92%" text-anchor="middle" font-size="9" fill="#4caf50" font-weight="bold">✓</text>` : '';
  const col = item.color;

  if (item.id === 'pull_up_bar') return `<svg width="110" height="65" viewBox="0 0 110 65"${dim}>
    <rect x="2" y="16" width="12" height="36" rx="3" fill="#4a3a2a"/>
    <rect x="96" y="16" width="12" height="36" rx="3" fill="#4a3a2a"/>
    <rect x="12" y="24" width="86" height="10" rx="5" fill="${col}"/>
    ${[25,38,51,64,77].map(x=>`<line x1="${x}" y1="26" x2="${x}" y2="32" stroke="#ffffff44" stroke-width="2.5"/>`).join('')}
    <rect x="18" y="36" width="8" height="16" rx="2" fill="#3a2a1a"/>
    <rect x="84" y="36" width="8" height="16" rx="2" fill="#3a2a1a"/>
    ${check}</svg>`;

  if (item.id === 'dumbbells') return `<svg width="110" height="65" viewBox="0 0 110 65"${dim}>
    <rect x="2" y="20" width="106" height="40" rx="4" fill="#2a2a3a"/>
    ${[0,1,2,3,4,5].map(i=>`<rect x="${8+i*16}" y="14" width="12" height="44" rx="3" fill="${col}" stroke="${col}" stroke-width="0.5"/>`).join('')}
    ${[0,1,2,3,4,5].map(i=>`<rect x="${6+i*16}" y="24" width="16" height="4" rx="2" fill="#ffffff22"/>`).join('')}
    <rect x="6" y="28" width="100" height="16" rx="3" fill="#3a3a4a"/>
    ${check}</svg>`;

  if (item.id === 'flat_bench') return `<svg width="110" height="65" viewBox="0 0 110 65"${dim}>
    <rect x="8" y="14" width="94" height="16" rx="5" fill="${col}"/>
    <rect x="8" y="14" width="94" height="6" rx="5" fill="#ffffff22"/>
    <rect x="14" y="30" width="8" height="28" rx="3" fill="#2a2030"/>
    <rect x="88" y="30" width="8" height="28" rx="3" fill="#2a2030"/>
    <rect x="10" y="55" width="16" height="5" rx="2" fill="#1a1a28"/>
    <rect x="84" y="55" width="16" height="5" rx="2" fill="#1a1a28"/>
    ${check}</svg>`;

  if (item.id === 'squat_rack') return `<svg width="110" height="80" viewBox="0 0 110 80"${dim}>
    <rect x="8" y="4" width="10" height="68" rx="3" fill="${col}"/>
    <rect x="92" y="4" width="10" height="68" rx="3" fill="${col}"/>
    <rect x="8" y="4" width="94" height="8" rx="3" fill="${col}"/>
    <rect x="8" y="66" width="94" height="6" rx="3" fill="${col}"/>
    <rect x="22" y="26" width="14" height="8" rx="2" fill="#4a3a2a" transform="rotate(-15 29 30)"/>
    <rect x="74" y="26" width="14" height="8" rx="2" fill="#4a3a2a" transform="rotate(15 81 30)"/>
    <rect x="22" y="36" width="66" height="8" rx="4" fill="#8a7a6a"/>
    ${[28,44,60,76].map(x=>`<line x1="${x}" y1="37" x2="${x}" y2="43" stroke="#ffffff33" stroke-width="3"/>`).join('')}
    ${check}</svg>`;

  if (item.id === 'treadmill') return `<svg width="110" height="70" viewBox="0 0 110 70"${dim}>
    <path d="M10 56 L20 14 L100 14 L100 56 Z" fill="#2a2020" rx="4"/>
    <path d="M12 54 L22 16 L98 16 L98 54 Z" fill="${col}" rx="3"/>
    <rect x="20" y="8" width="72" height="10" rx="3" fill="#1a1a28"/>
    <rect x="30" y="10" width="52" height="6" rx="2" fill="#333366"/>
    <line x1="22" y1="54" x2="98" y2="54" stroke="#ffffff22" stroke-width="1"/>
    <rect x="8" y="54" width="94" height="10" rx="3" fill="#3a2a2a"/>
    <line x1="40" y1="14" x2="40" y2="54" stroke="#ffffff11" stroke-width="4"/>
    <line x1="70" y1="14" x2="70" y2="54" stroke="#ffffff11" stroke-width="4"/>
    ${check}</svg>`;

  if (item.id === 'cable_machine') return `<svg width="80" height="100" viewBox="0 0 80 100"${dim}>
    <rect x="12" y="2" width="56" height="90" rx="6" fill="${col}"/>
    <rect x="18" y="8" width="44" height="30" rx="4" fill="#1a2a1a"/>
    <circle cx="40" cy="23" r="10" fill="${col}" stroke="#ffffff22" stroke-width="2"/>
    <circle cx="40" cy="23" r="5" fill="#1a2a1a"/>
    <rect x="24" y="44" width="32" height="20" rx="3" fill="#2a3a2a"/>
    <rect x="30" y="48" width="20" height="12" rx="2" fill="#1a2a1a"/>
    <line x1="40" y1="33" x2="40" y2="88" stroke="#ffffff55" stroke-width="1.5"/>
    <rect x="33" y="84" width="14" height="6" rx="2" fill="#3a3a2a"/>
    ${check}</svg>`;

  if (item.id === 'kettlebell') return `<svg width="65" height="80" viewBox="0 0 65 80"${dim}>
    <path d="M20 30 Q16 22 20 14 Q24 6 32 6 Q40 6 44 14 Q48 22 44 30 Z" fill="#2a2a2a" stroke="${col}" stroke-width="1.5"/>
    <ellipse cx="32" cy="56" rx="22" ry="20" fill="${col}"/>
    <ellipse cx="32" cy="48" rx="22" ry="14" fill="${col}" stroke="#ffffff11" stroke-width="1"/>
    <ellipse cx="32" cy="56" rx="10" ry="8" fill="#ffffff11"/>
    ${check}</svg>`;

  if (item.id === 'foam_roller') return `<svg width="100" height="50" viewBox="0 0 100 50"${dim}>
    <ellipse cx="14" cy="25" rx="12" ry="22" fill="${col}" stroke="#ffffff22" stroke-width="1"/>
    <rect x="14" y="3" width="72" height="44" fill="${col}"/>
    <ellipse cx="86" cy="25" rx="12" ry="22" fill="${col}" stroke="#ffffff22" stroke-width="1"/>
    ${[30,46,62,78].map(x=>`<line x1="${x}" y1="3" x2="${x}" y2="47" stroke="#ffffff22" stroke-width="3"/>`).join('')}
    ${check}</svg>`;

  if (item.id === 'assault_bike') return `<svg width="110" height="90" viewBox="0 0 110 90"${dim}>
    <!-- Frame -->
    <line x1="55" y1="20" x2="30" y2="58" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
    <line x1="55" y1="20" x2="80" y2="58" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
    <line x1="30" y1="58" x2="80" y2="58" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
    <line x1="55" y1="20" x2="55" y2="8" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
    <!-- Handlebars -->
    <line x1="46" y1="8" x2="64" y2="8" stroke="${col}" stroke-width="5" stroke-linecap="round"/>
    <line x1="44" y1="6" x2="44" y2="13" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
    <line x1="66" y1="6" x2="66" y2="13" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
    <!-- Seat post + seat -->
    <line x1="44" y1="26" x2="44" y2="14" stroke="#555" stroke-width="3" stroke-linecap="round"/>
    <rect x="37" y="11" width="14" height="4" rx="2" fill="#333"/>
    <!-- Rear wheel -->
    <circle cx="28" cy="68" r="18" fill="none" stroke="${col}" stroke-width="3"/>
    <circle cx="28" cy="68" r="10" fill="none" stroke="${col}88" stroke-width="1.5"/>
    <circle cx="28" cy="68" r="3" fill="${col}"/>
    ${[0,45,90,135].map(a=>`<line x1="28" y1="68" x2="${28+10*Math.cos(a*Math.PI/180)}" y2="${68+10*Math.sin(a*Math.PI/180)}" stroke="${col}66" stroke-width="1"/>`).join('')}
    <!-- Front wheel -->
    <circle cx="82" cy="68" r="18" fill="none" stroke="${col}" stroke-width="3"/>
    <circle cx="82" cy="68" r="10" fill="none" stroke="${col}88" stroke-width="1.5"/>
    <circle cx="82" cy="68" r="3" fill="${col}"/>
    ${[0,45,90,135].map(a=>`<line x1="82" y1="68" x2="${82+10*Math.cos(a*Math.PI/180)}" y2="${68+10*Math.sin(a*Math.PI/180)}" stroke="${col}66" stroke-width="1"/>`).join('')}
    <!-- Fan/flywheel (the "air" part) -->
    <circle cx="55" cy="42" r="12" fill="none" stroke="${col}55" stroke-width="1"/>
    ${[0,30,60,90,120,150].map(a=>`<line x1="55" y1="42" x2="${55+11*Math.cos(a*Math.PI/180)}" y2="${42+11*Math.sin(a*Math.PI/180)}" stroke="${col}88" stroke-width="2" stroke-linecap="round"/>`).join('')}
    <circle cx="55" cy="42" r="4" fill="${col}"/>
    <!-- Pedals -->
    <line x1="55" y1="42" x2="48" y2="52" stroke="#888" stroke-width="2"/>
    <rect x="42" y="50" width="12" height="4" rx="2" fill="#666"/>
    <line x1="55" y1="42" x2="62" y2="32" stroke="#888" stroke-width="2"/>
    <rect x="56" y="29" width="12" height="4" rx="2" fill="#666"/>
    ${check}
  </svg>`;

  return `<svg width="80" height="65" viewBox="0 0 80 65"${dim}><rect x="10" y="15" width="60" height="35" rx="8" fill="${col}"/>${check}</svg>`;
}

// ── CLOTHING ICONS (for mall selector thumbnail only) ──
function renderClothingIcon(item) {
  if (item.id === 'forged_tank') return `<svg viewBox="0 0 60 60" width="60" height="60"><path d="M15 8 L10 20 L18 22 L18 52 L42 52 L42 22 L50 20 L45 8 L35 14 Q30 18 25 14 Z" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><path d="M25 14 Q30 20 35 14" fill="none" stroke="${item.accent}" stroke-width="1"/><text x="30" y="38" text-anchor="middle" font-size="5" fill="${item.accent}" font-weight="bold" font-family="Cinzel,serif">FORGED</text><text x="30" y="44" text-anchor="middle" font-size="3.5" fill="${item.accent}66" font-family="sans-serif">™</text></svg>`;
  if (item.id === 'forged_joggers') return `<svg viewBox="0 0 60 60" width="60" height="60"><path d="M15 8 L14 30 L12 52 L28 52 L30 32 L32 52 L48 52 L46 30 L45 8 Z" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><line x1="30" y1="8" x2="30" y2="32" stroke="${item.accent}44" stroke-width="1"/><text x="30" y="22" text-anchor="middle" font-size="5" fill="${item.accent}" font-weight="bold" font-family="Cinzel,serif">FORGED</text></svg>`;
  if (item.id === 'lifting_gloves') return `<svg viewBox="0 0 60 60" width="60" height="60"><rect x="10" y="20" width="18" height="26" rx="4" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><rect x="30" y="20" width="18" height="26" rx="4" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><rect x="12" y="14" width="6" height="10" rx="2" fill="${item.accent}88"/><rect x="20" y="12" width="6" height="12" rx="2" fill="${item.accent}88"/><rect x="32" y="14" width="6" height="10" rx="2" fill="${item.accent}88"/><rect x="40" y="12" width="6" height="12" rx="2" fill="${item.accent}88"/></svg>`;
  if (item.id === 'compression_set') return `<svg viewBox="0 0 60 60" width="60" height="60"><path d="M18 10 L15 32 L12 58 L26 58 L30 34 L34 58 L48 58 L45 32 L42 10 Z" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><line x1="14" y1="25" x2="26" y2="25" stroke="${item.accent}55" stroke-width="1"/><line x1="13" y1="35" x2="25" y2="35" stroke="${item.accent}55" stroke-width="1"/><line x1="34" y1="25" x2="46" y2="25" stroke="${item.accent}55" stroke-width="1"/><line x1="35" y1="35" x2="47" y2="35" stroke="${item.accent}55" stroke-width="1"/></svg>`;
  if (item.id === 'do_rag') return `<svg viewBox="0 0 60 60" width="60" height="60"><ellipse cx="30" cy="24" rx="18" ry="14" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><path d="M38 34 Q44 40 42 52" stroke="${item.color}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M22 34 Q16 40 18 52" stroke="${item.color}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M18 22 Q30 16 42 22" stroke="${item.accent}55" stroke-width="1" fill="none"/></svg>`;
  if (item.id === 'forged_bag') return `<svg viewBox="0 0 60 60" width="60" height="60"><rect x="8" y="20" width="44" height="32" rx="6" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><path d="M20 20 Q20 12 30 12 Q40 12 40 20" stroke="${item.accent}" stroke-width="1.5" fill="none"/><rect x="18" y="28" width="24" height="16" rx="3" fill="none" stroke="${item.accent}66" stroke-width="1"/><text x="30" y="40" text-anchor="middle" font-size="5" fill="${item.accent}" font-weight="bold" font-family="Cinzel,serif">FORGED</text></svg>`;
  if (item.id === 'forged_shaker') return `<svg viewBox="0 0 60 60" width="60" height="60"><rect x="18" y="12" width="24" height="40" rx="6" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><rect x="22" y="8" width="16" height="6" rx="3" fill="${item.accent}88"/><rect x="20" y="22" width="20" height="16" rx="2" fill="#ffffff11"/><text x="30" y="34" text-anchor="middle" font-size="5" fill="${item.accent}" font-weight="bold" font-family="Cinzel,serif">FORGED</text></svg>`;
  // generic towel
  return `<svg viewBox="0 0 60 60" width="60" height="60"><rect x="10" y="18" width="40" height="24" rx="4" fill="${item.color}" stroke="${item.accent}" stroke-width="1.5"/><line x1="10" y1="26" x2="50" y2="26" stroke="${item.accent}55" stroke-width="1"/><line x1="10" y1="34" x2="50" y2="34" stroke="${item.accent}55" stroke-width="1"/></svg>`;
}

// ── SCREENS ──

function renderMallSelector() {
  const s = getState();
  const gold = s.gold || 0;
  return `
<div class="mall-wrap">
  <div class="mall-header">
    <div class="mall-title">🏬 IronLore Mall</div>
    <div class="mall-gold"><i class="ti ti-coin" style="color:#ffd700"></i> ${gold.toLocaleString()}</div>
  </div>
  <div class="mall-stores">
    <div class="mall-store-card" onclick="GainsShop.openBodega()">
      <div class="mall-store-icon">🏪</div>
      <div class="mall-store-name">Gains Bodega</div>
      <div class="mall-store-desc">Supplements, buffs &amp; performance boosters</div>
      <div class="mall-store-tag">Consumables</div>
    </div>
    <div class="mall-store-card" onclick="GainsShop.openClothing()">
      <div class="mall-store-icon forged-glow">👕</div>
      <div class="mall-store-name">FORGED™ Apparel</div>
      <div class="mall-store-desc">Premium gym clothing &amp; accessories</div>
      <div class="mall-store-tag forged-tag">FORGED™ Brand</div>
    </div>
    <div class="mall-store-card" onclick="GainsShop.openSporting()">
      <div class="mall-store-icon">🏋</div>
      <div class="mall-store-name">Iron Depot</div>
      <div class="mall-store-desc">Equipment that gives permanent XP bonuses</div>
      <div class="mall-store-tag">Gym Equipment</div>
    </div>
    <div class="mall-store-card" onclick="GainsShop.openBarber()">
      <div class="mall-store-icon">✂️</div>
      <div class="mall-store-name">Chop Shop</div>
      <div class="mall-store-desc">20+ hairstyles — change your look any time</div>
      <div class="mall-store-tag barber-tag">Hair &amp; Style</div>
    </div>
  </div>
</div>`;
}

function openBodega() {
  const container = document.getElementById('store-container');
  if (!container) return;
  const s = getState();
  const gold = s.gold || 0;
  const activeBuffs = getActiveBuffs();
  const now = Date.now();
  const shelfItems = ITEMS.filter(i => i.type === 'shelf');
  const fridgeItems = ITEMS.filter(i => i.type === 'fridge');
  const soldOutShelves = SOLD_OUT.filter(i => i.type === 'shelf');
  const soldOutFridge = SOLD_OUT.filter(i => i.type === 'fridge');

  container.innerHTML = `
<div class="store-scene">
  <div class="store-back-row"><button class="comp-back-btn" onclick="GainsShop.render()">← Mall</button></div>
  <div class="store-hdr">
    <span class="store-gold"><i class="ti ti-coin" style="font-size:14px;vertical-align:-1px"></i> ${gold.toLocaleString()}</span>
  </div>
  <div class="store-room">
    <div class="store-wall"><div class="store-shelf s1"></div><div class="store-shelf s2"></div><div class="store-shelf s3"></div></div>
    <div class="store-neon">GAINS SHOP</div>
    <div class="shelf-row row1">
      <div class="store-item shelf-spacer"></div>
      ${shelfItems.slice(0, 3).map(item => {
        const active = isBuffActive(item.id);
        return `<div class="store-item ${active ? 'item-active' : ''}" onclick="GainsShop.buyItem('${item.id}')">
          ${renderBox(item)}
          <span class="item-lbl">${item.name}</span>
          <span class="item-buff">${item.buff}</span>
          <span class="item-cost">${item.cost}g</span>
          <div class="store-tip"><span class="tip-name">${item.name}</span><span class="tip-buff">${item.buff}</span><span class="tip-dur">${item.duration ? item.duration + 'h' : 'Instant'} | ${item.cost}g</span>${active ? '<span class="tip-on">ACTIVE</span>' : ''}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="shelf-row row2">
      <div class="store-item shelf-spacer"></div>
      ${shelfItems.slice(3).map(item => {
        const active = isBuffActive(item.id);
        return `<div class="store-item ${active ? 'item-active' : ''}" onclick="GainsShop.buyItem('${item.id}')">
          ${renderBox(item)}
          <span class="item-lbl">${item.name}</span>
          <span class="item-buff">${item.buff}</span>
          <span class="item-cost">${item.cost}g</span>
          <div class="store-tip"><span class="tip-name">${item.name}</span><span class="tip-buff">${item.buff}</span><span class="tip-dur">${item.duration ? item.duration + 'h' : 'Instant'} | ${item.cost}g</span>${active ? '<span class="tip-on">ACTIVE</span>' : ''}</div>
        </div>`;
      }).join('')}
      ${soldOutShelves.map(() => `<div class="store-item sold-out">${renderBox(null, true)}<span class="item-lbl sold-lbl">Sold Out</span></div>`).join('')}
    </div>
    <div class="store-fridge">
      <div class="fridge-body">
        <div class="fridge-glass">
          <div class="fridge-grid">
            ${fridgeItems.map(item => {
              const active = isBuffActive(item.id);
              return `<div class="store-item fridge-item ${active ? 'item-active' : ''}" onclick="GainsShop.buyItem('${item.id}')">
                ${renderBottle(item)}
                <span class="item-cost">${item.cost}g</span>
                <div class="store-tip"><span class="tip-name">${item.name}</span><span class="tip-buff">${item.buff}</span><span class="tip-dur">${item.duration}h | ${item.cost}g</span>${active ? '<span class="tip-on">ACTIVE</span>' : ''}</div>
              </div>`;
            }).join('')}
            ${soldOutFridge.map(() => `<div class="store-item fridge-item sold-out">${renderBottle(null, true)}</div>`).join('')}
          </div>
        </div>
        <div class="fridge-handle"></div>
        <div class="fridge-lbl">COLD DRINKS</div>
      </div>
    </div>
    <div class="store-counter">
      <div class="counter-surface"></div>
      <div class="store-register"><div class="reg-screen"></div><div class="reg-keys">${'<div class="reg-key"></div>'.repeat(12)}</div></div>
      <div class="store-cat ${localStorage.getItem('musclequest_cat_pet') === todayStr() ? 'cat-petted' : ''}" onclick="GainsShop.petCat()" title="${localStorage.getItem('musclequest_cat_pet') === todayStr() ? 'Napping... come back tomorrow!' : 'Pet the cat for gold!'}">
        ${renderCat()}
        <span class="cat-hint">${localStorage.getItem('musclequest_cat_pet') === todayStr() ? '💤' : '🐾'}</span>
      </div>
    </div>
    <div class="store-floor"></div>
  </div>
  ${activeBuffs.length > 0 ? `<div class="store-buffs"><div class="buffs-title">Active Buffs</div>${activeBuffs.map(b => {
    const item = ITEMS.find(i => i.id === b.id);
    if (!item) return '';
    return `<div class="buff-entry"><div class="buff-pip"></div><span class="buff-name">${item.name}</span><span class="buff-time">${formatTimeLeft(b.expiresAt - now)}</span></div>`;
  }).join('')}</div>` : ''}
</div>`;
}

function openClothing() {
  const container = document.getElementById('store-container');
  if (!container) return;
  const s = getState();
  const gold = s.gold || 0;
  const purchased = s.purchasedCosmetics || [];

  function hangItem(item) {
    const owned = purchased.includes(item.id);
    const canBuy = !owned && gold >= item.cost;
    return `<div class="store-item boutique-hanger${owned?' item-active':''}" onclick="${owned?'':canBuy?`GainsShop.buyClothing('${item.id}')`:''}" style="opacity:${!owned&&!canBuy?'0.55':'1'}">
      ${renderHanger(item, owned)}
      <div class="store-tip">
        <span class="tip-name">${item.name}</span>
        <span class="tip-buff">${item.desc}</span>
        <span class="tip-dur">${item.type} · <i class="ti ti-coin"></i>${item.cost}g</span>
        ${owned?'<span class="tip-on">✓ OWNED</span>':canBuy?`<button class="tip-buy" onclick="GainsShop.buyClothing('${item.id}')">Buy ${item.cost}g</button>`:'<span class="tip-dur" style="color:#f44">Need more gold</span>'}
      </div>
    </div>`;
  }
  function shelfItem(item) {
    const owned = purchased.includes(item.id);
    const canBuy = !owned && gold >= item.cost;
    return `<div class="store-item boutique-shelf-item${owned?' item-active':''}" onclick="${owned?'':canBuy?`GainsShop.buyClothing('${item.id}')`:''}" style="opacity:${!owned&&!canBuy?'0.55':'1'}">
      ${renderHanger(item, owned)}
      <div class="store-tip">
        <span class="tip-name">${item.name}</span>
        <span class="tip-buff">${item.desc}</span>
        <span class="tip-dur">${item.type} · <i class="ti ti-coin"></i>${item.cost}g</span>
        ${owned?'<span class="tip-on">✓ OWNED</span>':canBuy?`<button class="tip-buy" onclick="GainsShop.buyClothing('${item.id}')">Buy ${item.cost}g</button>`:'<span class="tip-dur" style="color:#f44">Need more gold</span>'}
      </div>
    </div>`;
  }

  const tops    = CLOTHING.filter(i => ['forged_tank','forged_joggers','do_rag','borat_suit'].includes(i.id));
  const perf    = CLOTHING.filter(i => ['lifting_gloves','compression_set','flip_flops'].includes(i.id));
  const accs    = CLOTHING.filter(i => ['forged_bag','forged_shaker','gym_towel'].includes(i.id));

  container.innerHTML = `
<div class="boutique-scene">
  <div class="boutique-topbar">
    <button class="comp-back-btn" onclick="GainsShop.render()">← Mall</button>
    <span class="boutique-gold"><i class="ti ti-coin"></i> ${gold.toLocaleString()}</span>
  </div>
  <div class="boutique-room">
    <div class="boutique-wall">
      <div class="boutique-neon">FORGED<sup>™</sup></div>
      <div class="boutique-mirror"></div>
      <div class="boutique-mirror boutique-mirror-r"></div>
    </div>
    <div class="boutique-section-lbl">— Tops &amp; Bottoms —</div>
    <div class="boutique-rod-row">
      <div class="boutique-rod-bar"></div>
      <div class="boutique-rod-items">${tops.map(hangItem).join('')}</div>
    </div>
    <div class="boutique-section-lbl">— Performance Wear —</div>
    <div class="boutique-rod-row">
      <div class="boutique-rod-bar"></div>
      <div class="boutique-rod-items">${perf.map(hangItem).join('')}</div>
    </div>
    <div class="boutique-section-lbl">— Accessories —</div>
    <div class="boutique-acc-shelf">
      <div class="boutique-shelf-plank"></div>
      <div class="boutique-shelf-items">${accs.map(shelfItem).join('')}</div>
    </div>
    <div class="boutique-counter"></div>
    <div class="boutique-floor"></div>
  </div>
  <p class="boutique-hint">Purchased items unlock in Settings → Cosmetics</p>
</div>`;
}

function openSporting() {
  const container = document.getElementById('store-container');
  if (!container) return;
  const s = getState();
  const gold = s.gold || 0;
  const equipment = s.equipment || {};

  function wItem(item, extraClass) {
    const owned = !!equipment[item.id];
    const canBuy = !owned && gold >= item.cost;
    const dimStyle = !owned && !canBuy ? 'opacity:0.45' : '';
    return `<div class="store-item wh-item${owned?' wh-owned':''}${extraClass?' '+extraClass:''}"
        onclick="${owned?'':canBuy?`GainsShop.buyEquipment('${item.id}')`:''}"
        style="position:relative;${dimStyle}">
      ${renderDepotItem(item, owned)}
      <div class="wh-item-lbl">${item.name}</div>
      <div class="wh-price-tag${owned?' wh-price-owned':''}">${owned?'✓':item.cost+'g'}</div>
      <div class="store-tip wh-tip">
        <span class="tip-name">${item.name}</span>
        <span class="tip-buff">${item.bonus}</span>
        <span class="tip-dur">${item.cat} · <i class="ti ti-coin"></i>${item.cost}g</span>
        ${owned?'<span class="tip-on">✓ INSTALLED IN YOUR GYM</span>':canBuy?`<button class="tip-buy" onclick="GainsShop.buyEquipment('${item.id}')">Install for ${item.cost}g</button>`:'<span class="tip-dur" style="color:#f66">Need more gold</span>'}
      </div>
    </div>`;
  }

  const spotlightLeft   = EQUIPMENT.filter(i => ['dumbbells','dip_bar'].includes(i.id));
  const spotlightCenter = EQUIPMENT.filter(i => ['assault_bike'].includes(i.id));
  const spotlightRight  = EQUIPMENT.filter(i => ['cable_machine','treadmill'].includes(i.id));
  const floorLeft       = EQUIPMENT.filter(i => ['pull_up_bar','flat_bench'].includes(i.id));
  const floorRight      = EQUIPMENT.filter(i => ['squat_rack','kettlebell','foam_roller'].includes(i.id));

  container.innerHTML = `
<div class="wh-scene">
  <div class="boutique-topbar wh-topbar">
    <button class="comp-back-btn" onclick="GainsShop.render()">← Mall</button>
    <span class="boutique-gold"><i class="ti ti-coin"></i> ${gold.toLocaleString()}</span>
  </div>

  <!-- Concrete wall with neon + spotlights -->
  <div class="wh-wall">
    <div class="wh-concrete-lines">
      <div class="wh-neon">IRON&nbsp;DEPOT</div>
      <div class="wh-neon-sub">PREMIUM GYM EQUIPMENT</div>
    </div>

    <!-- Three spotlight zones on the wall -->
    <div class="wh-spotlight-row">
      <div class="wh-spotlight wh-spot-left">
        <div class="wh-spotlight-cone"></div>
        <div class="wh-spotlight-items">
          ${spotlightLeft.map(i => wItem(i,'wh-wall-item')).join('')}
        </div>
      </div>

      <div class="wh-spotlight wh-spot-center">
        <div class="wh-spotlight-cone wh-cone-hero"></div>
        <div class="wh-hero-badge">FEATURED</div>
        <div class="wh-spotlight-items">
          ${spotlightCenter.map(i => wItem(i,'wh-hero-item')).join('')}
        </div>
      </div>

      <div class="wh-spotlight wh-spot-right">
        <div class="wh-spotlight-cone"></div>
        <div class="wh-spotlight-items">
          ${spotlightRight.map(i => wItem(i,'wh-wall-item')).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- Rubber floor divider -->
  <div class="wh-floor-divider">
    <span class="wh-divider-txt">— FLOOR —</span>
  </div>

  <!-- Floor equipment -->
  <div class="wh-floor-area">
    <div class="wh-floor-col">
      ${floorLeft.map(i => wItem(i,'wh-floor-item')).join('')}
    </div>
    <div class="wh-floor-col">
      ${floorRight.map(i => wItem(i,'wh-floor-item')).join('')}
    </div>
  </div>

  <div class="wh-floor-strip"></div>
</div>`;
}

function buyHairstyle(id) {
  const style = HAIRSTYLES.find(h => h.id === id);
  if (!style) return;
  const s = getState();
  if (!s.purchasedHair) s.purchasedHair = [];
  const alreadyOwned = style.cost === 0 || s.purchasedHair.includes(id);
  if (!alreadyOwned) {
    if ((s.gold || 0) < style.cost) { showToast('Not enough gold!'); return; }
    s.gold -= style.cost;
    s.purchasedHair.push(id);
  }
  s.hair = id;
  saveState(s);
  syncGold();
  showToast(`${style.name} equipped!`);
  try { if (typeof playSFX === 'function') playSFX('submit'); } catch(e) {}
  openBarber();
}

function cycleBarber(dir) {
  _barberIdx = (_barberIdx + dir + HAIRSTYLES.length) % HAIRSTYLES.length;
  refreshBarberPreview();
}

function refreshBarberPreview() {
  const style = HAIRSTYLES[_barberIdx];
  const s = getState();
  const gender = s.gender || 'male';
  const cosmetics = s.equippedCosmetics || [];
  const owned = style.cost === 0 || (s.purchasedHair || []).includes(style.id);
  const isEquipped = s.hair === style.id;
  const canBuy = !owned && (s.gold || 0) >= style.cost;
  const catColors = { M: '#4488ff', W: '#e91e63', U: '#9c27b0' };
  const catLabel = { M: "Men's", W: "Women's", U: 'Unisex' };

  const previewEl = document.getElementById('barber-preview');
  if (previewEl && typeof MQ !== 'undefined') {
    previewEl.innerHTML = MQ.renderMiniAvatarSVG(gender, cosmetics, 0, s.name || 'You', style.id);
  }

  const infoEl = document.getElementById('barber-style-info');
  if (infoEl) {
    infoEl.innerHTML = `
      <div class="barber-style-name">${style.name}</div>
      <div class="barber-style-meta">
        <span class="barber-cat" style="background:${catColors[style.cat]}22;color:${catColors[style.cat]}">${catLabel[style.cat]}</span>
        <span class="barber-desc">${style.desc}</span>
      </div>
      <div class="barber-counter">${_barberIdx + 1} / ${HAIRSTYLES.length}</div>`;
  }

  document.querySelectorAll('.barber-dot').forEach((d,i) => d.classList.toggle('barber-dot-active', i === _barberIdx));

  const btnEl = document.getElementById('barber-action-btn');
  if (btnEl) {
    if (isEquipped) {
      btnEl.textContent = '✓ Current Style';
      btnEl.disabled = true;
      btnEl.className = 'barber-btn barber-btn-owned';
    } else if (owned) {
      btnEl.textContent = 'Wear This Cut';
      btnEl.disabled = false;
      btnEl.className = 'barber-btn barber-btn-wear';
      btnEl.onclick = () => buyHairstyle(style.id);
    } else if (canBuy) {
      btnEl.textContent = `Cut It! — ${style.cost}g`;
      btnEl.disabled = false;
      btnEl.className = 'barber-btn barber-btn-buy';
      btnEl.onclick = () => buyHairstyle(style.id);
    } else {
      btnEl.textContent = `${style.cost}g — Need More Gold`;
      btnEl.disabled = true;
      btnEl.className = 'barber-btn barber-btn-broke';
    }
  }
}

function openBarber() {
  const container = document.getElementById('store-container');
  if (!container) return;
  const s = getState();
  const gold = s.gold || 0;
  const currentHair = s.hair || (s.gender === 'female' ? 'space_buns' : 'default');
  _barberIdx = Math.max(0, HAIRSTYLES.findIndex(h => h.id === currentHair));

  container.innerHTML = `
<div class="barber-scene">
  <div class="boutique-topbar barber-topbar">
    <button class="comp-back-btn" onclick="GainsShop.render()">← Mall</button>
    <span class="boutique-gold"><i class="ti ti-coin"></i> ${gold.toLocaleString()}</span>
  </div>

  <!-- Room -->
  <div class="barber-room">
    <!-- Back wall with mirror and tools -->
    <div class="barber-wall">
      <div class="barber-mirror">
        <div class="barber-mirror-frame">
          <div class="barber-mirror-glass"></div>
          <!-- Tool ledge under mirror -->
          <div class="barber-tool-ledge">
            <div class="barber-tool barber-scissors" title="Scissors"></div>
            <div class="barber-tool barber-comb" title="Comb"></div>
            <div class="barber-tool barber-spray" title="Spray Bottle"></div>
            <div class="barber-tool barber-razor" title="Razor"></div>
            <div class="barber-tool barber-clipper" title="Clippers"></div>
          </div>
        </div>
      </div>
      <!-- Barber pole on wall -->
      <div class="barber-pole-wrap">
        <div class="barber-pole-top"></div>
        <div class="barber-pole-body">
          <div class="barber-pole-stripe"></div>
        </div>
        <div class="barber-pole-base"></div>
      </div>
      <div class="barber-wall-sign">CHOP SHOP</div>
    </div>

    <!-- Chair + character in center -->
    <div class="barber-chair-zone">
      <div class="barber-avatar-wrap">
        <div class="barber-cape"></div>
        <div id="barber-preview" class="barber-avatar-preview"></div>
      </div>
      <!-- The chair -->
      <div class="barber-chair">
        <div class="barber-chair-back"></div>
        <div class="barber-chair-seat"></div>
        <div class="barber-chair-arm barber-arm-l"></div>
        <div class="barber-chair-arm barber-arm-r"></div>
        <div class="barber-chair-post"></div>
        <div class="barber-chair-base"></div>
        <div class="barber-footrest"></div>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <div class="barber-controls">
    <button class="barber-nav-btn" onclick="GainsShop.cycleBarber(-1)">&#8249;</button>
    <div class="barber-center-info">
      <div id="barber-style-info" class="barber-style-info"></div>
      <button id="barber-action-btn" class="barber-btn barber-btn-buy"></button>
    </div>
    <button class="barber-nav-btn" onclick="GainsShop.cycleBarber(1)">&#8250;</button>
  </div>

  <!-- Style dots -->
  <div class="barber-dots">
    ${HAIRSTYLES.map((h,i) => `<span class="barber-dot${i===_barberIdx?' barber-dot-active':''}" onclick="GainsShop._jumpBarber(${i})"></span>`).join('')}
  </div>

  <p class="boutique-hint">Free styles: Short Crop &amp; Shaved Head</p>
</div>`;

  refreshBarberPreview();
}

function _jumpBarber(idx) {
  _barberIdx = idx;
  refreshBarberPreview();
  document.querySelectorAll('.barber-dot').forEach((d,i) => d.classList.toggle('barber-dot-active', i===_barberIdx));
}

function render() {
  const container = document.getElementById('store-container');
  if (!container) return;
  container.innerHTML = renderMallSelector();
}

return { render, openBodega, openClothing, openSporting, openBarber, buyItem, buyClothing, buyEquipment, buyHairstyle, cycleBarber, _jumpBarber, getActiveBuffs, isBuffActive, petCat };

})();
