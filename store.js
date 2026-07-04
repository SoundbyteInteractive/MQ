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

// ── TATTOOS (Iron Canvas) ──
const TATTOOS = [
  // ── Flash 1: ARM (indices 0-4) ──
  { id: 'eagle',       name: 'American Eagle',    cost: 200, placement: 'arm',   desc: 'Classic flash — spread wings on the upper arm',       color: '#4488ff',
    svg: `<path d="M30 48 L37 43 L44 48 L37 46Z" fill="#4488ff"/><path d="M34 44 L37 40 L40 44" fill="#4488ff" opacity="0.8"/><circle cx="37" cy="40" r="1.5" fill="#ffd700"/>` },
  { id: 'skull',       name: 'Iron Skull',         cost: 180, placement: 'arm',   desc: 'No-BS old-school skull. No roses, just menace',       color: '#aaaaaa',
    svg: `<ellipse cx="37" cy="48" rx="5" ry="5.5" fill="#ccc"/><rect x="34" y="52" width="6" height="3" rx="1" fill="#999"/><circle cx="35" cy="47" r="1.2" fill="#222"/><circle cx="39" cy="47" r="1.2" fill="#222"/><path d="M35 51 L37 50 L39 51" stroke="#555" stroke-width="0.6" fill="none"/>` },
  { id: 'rose',        name: 'Black Rose',         cost: 160, placement: 'arm',   desc: 'Traditional black-work rose — timeless and clean',    color: '#cc3366',
    svg: `<circle cx="37" cy="48" r="4" fill="#cc3366" opacity="0.85"/><circle cx="37" cy="48" r="2.5" fill="#aa1144"/><path d="M37 52 L36 57 L38 57Z" fill="#228822"/><path d="M34 53 L32 55 L35 55Z" fill="#228822"/>` },
  { id: 'anchor',      name: 'Old Anchor',         cost: 140, placement: 'arm',   desc: 'Sailor Jerry energy. Grounded and heavy',             color: '#336699',
    svg: `<line x1="37" y1="43" x2="37" y2="56" stroke="#336699" stroke-width="2"/><line x1="33" y1="44" x2="41" y2="44" stroke="#336699" stroke-width="1.5"/><path d="M33 53 Q37 58 41 53" stroke="#336699" stroke-width="1.5" fill="none"/><circle cx="37" cy="43" r="1.5" fill="#336699"/>` },
  { id: 'flames',      name: 'Flash Flames',       cost: 130, placement: 'arm',   desc: 'Traditional flame lick up the forearm',               color: '#ff6600',
    svg: `<path d="M33 62 Q32 56 35 52 Q34 56 36 53 Q36 57 38 53 Q38 56 37 52 Q40 55 39 62Z" fill="#ff6600"/><path d="M34 62 Q33 57 35 54 Q35 58 37 54 Q37 57 38 62Z" fill="#ffcc00" opacity="0.8"/>` },
  // ── Flash 2: CHEST (indices 5-9) ──
  { id: 'lion',        name: 'Lion Head',          cost: 250, placement: 'chest', desc: 'Regal and fierce — center chest placement',           color: '#e8a030',
    svg: `<circle cx="50" cy="46" r="6" fill="#e8a030"/><ellipse cx="50" cy="46" rx="9" ry="8" fill="#c87020" opacity="0.35"/><circle cx="48" cy="44" r="1.1" fill="#222"/><circle cx="52" cy="44" r="1.1" fill="#222"/><path d="M48 48 Q50 50 52 48" stroke="#222" stroke-width="0.7" fill="none"/>` },
  { id: 'cross',       name: 'Iron Cross',         cost: 150, placement: 'chest', desc: 'Bold centered cross with hard black lines',           color: '#888888',
    svg: `<rect x="48" y="38" width="4" height="16" rx="1" fill="#555"/><rect x="43" y="44" width="14" height="4" rx="1" fill="#555"/>` },
  { id: 'banner',      name: 'IRON Banner',        cost: 175, placement: 'chest', desc: 'Scroll banner across the chest',                      color: '#cc9944',
    svg: `<path d="M41 46 Q50 42 59 46 Q50 50 41 46Z" fill="#cc9944"/><path d="M41 46 L43 51 L50 48 L57 51 L59 46" fill="#aa7722" opacity="0.5"/><text x="50" y="47" text-anchor="middle" font-size="4" fill="#fff" font-weight="bold">IRON</text>` },
  { id: 'barbell_tat', name: 'Barbell & Plates',   cost: 140, placement: 'chest', desc: 'Full barbell with plates — sternum placement',        color: '#c8a84b',
    svg: `<rect x="39" y="49" width="22" height="2.5" rx="0.5" fill="#888"/><rect x="38" y="45" width="3" height="10" rx="1" fill="#c8a84b"/><rect x="59" y="45" width="3" height="10" rx="1" fill="#c8a84b"/><rect x="41" y="46" width="2" height="8" rx="0.5" fill="#aaa"/><rect x="57" y="46" width="2" height="8" rx="0.5" fill="#aaa"/>` },
  { id: 'panther',     name: 'Black Panther',      cost: 280, placement: 'chest', desc: 'Prowling panther across the upper chest',             color: '#444444',
    svg: `<path d="M41 43 Q39 47 41 51 Q44 53 47 51 Q50 53 53 51 Q56 53 59 51 Q61 47 59 43" stroke="#333" stroke-width="1.5" fill="#111" opacity="0.75"/><circle cx="43" cy="44" r="1.1" fill="#ffcc00"/><circle cx="57" cy="44" r="1.1" fill="#ffcc00"/><path d="M47 49 Q50 51 53 49" stroke="#555" stroke-width="0.8" fill="none"/>` },
  // ── Flash 3: FACE (indices 10-14) ──
  { id: 'stars',       name: 'Cheek Stars',        cost: 110, placement: 'face',  desc: 'Scattered stars under the left eye — subtle flex',    color: '#ffd700',
    svg: `<text x="40" y="27" font-size="5.5" fill="#ffd700">★</text><text x="44" y="23" font-size="3.5" fill="#ffd700">★</text><text x="43" y="30" font-size="3" fill="#ffd700">★</text>` },
  { id: 'dragon',      name: 'Face Dragon',        cost: 300, placement: 'face',  desc: 'Serpentine dragon from jaw to cheek — the statement', color: '#44cc44',
    svg: `<path d="M43 32 Q41 28 42 24 Q44 21 46 23 Q47 26 45 29 Q44 32 44 35" stroke="#44cc44" stroke-width="1.5" fill="none" stroke-linecap="round"/><circle cx="42" cy="24" r="1.5" fill="#44cc44"/><path d="M41 24 L39 22 M43 22 L42 20" stroke="#44cc44" stroke-width="0.8"/>` },
  { id: 'heart',       name: 'Cheek Heart',        cost: 100, placement: 'face',  desc: 'Classic cheek heart — right side',                    color: '#dd2244',
    svg: `<path d="M57 26 L54 22 Q54 19 56 20 Q57 20 57 21 Q57 20 58 20 Q60 19 60 22Z" fill="#dd2244"/><path d="M57 26 L55 23 Q55 20 56 21 Q57 21.5 57 22 Q57 21.5 58 21 Q59 20 59 23Z" fill="#ff4466" opacity="0.6"/>` },
  { id: 'lightning',   name: 'Cheek Bolt',         cost: 90,  placement: 'face',  desc: 'Electric lightning bolt on the right cheek',          color: '#ffee00',
    svg: `<path d="M57 19 L54 24 L56 24 L55 29 L58 23 L56 23Z" fill="#ffee00" stroke="#cc9900" stroke-width="0.4"/>` },
  { id: 'dumbbell',    name: 'Forehead Dumbbell',  cost: 120, placement: 'face',  desc: 'Micro dumbbell — forehead centerpiece',               color: '#c8a84b',
    svg: `<rect x="45" y="13" width="10" height="2" rx="0.5" fill="#c8a84b"/><rect x="44" y="11" width="2" height="6" rx="0.8" fill="#aaa"/><rect x="54" y="11" width="2" height="6" rx="0.8" fill="#aaa"/>` },
];

window._TATTOOS = TATTOOS;
let _tattooIdx = 0;

function buyTattoo(id) {
  const tat = TATTOOS.find(t => t.id === id);
  if (!tat) return;
  const s = getState();
  if (!s.purchasedTattoos) s.purchasedTattoos = [];
  const owned = s.purchasedTattoos.includes(id);
  if (!owned) {
    if ((s.gold || 0) < tat.cost) { showToast('Not enough gold!'); return; }
    s.gold -= tat.cost;
    s.purchasedTattoos.push(id);
  }
  s.tattoo = id;
  saveState(s);
  syncGold();
  showToast(`${tat.name} inked! 🖊`);
  try { if (typeof playSFX === 'function') playSFX('submit'); } catch(e) {}
  try { MQ.syncStateFromStorage(); } catch(e) {}
  openTattooShop();
}

function cycleTattoo(dir) {
  _tattooIdx = (_tattooIdx + dir + TATTOOS.length) % TATTOOS.length;
  refreshTattooPreview();
}

function _jumpTattoo(idx) {
  _tattooIdx = idx;
  refreshTattooPreview();
  document.querySelectorAll('.tat-dot').forEach((d,i) => {
    const on = i === _tattooIdx;
    d.classList.toggle('tat-dot-active', on);
    d.classList.toggle('barber-dot-active', on);
    d.style.background = on ? TATTOOS[i].color : '';
  });
}

function refreshTattooPreview() {
  const tat = TATTOOS[_tattooIdx];
  const s = getState();
  const owned = s.purchasedTattoos?.includes(tat.id);
  const isEquipped = s.tattoo === tat.id;
  const canBuy = !owned && (s.gold || 0) >= tat.cost;

  const previewEl = document.getElementById('tattoo-preview');
  if (previewEl && typeof MQ !== 'undefined') {
    const gender = s.gender || 'male';
    const cosmetics = s.equippedCosmetics || [];
    const hair = s.hair || (gender === 'female' ? 'space_buns' : 'default');
    previewEl.innerHTML = MQ.renderMiniAvatarSVG(gender, cosmetics, 0, s.name || 'You', hair, s.skinTone ?? 1, s.hairColor ?? 0, tat.id, 1);
  }

  const infoEl = document.getElementById('tattoo-style-info');
  if (infoEl) {
    infoEl.innerHTML = `
      <div class="barber-style-name">${tat.name}</div>
      <div class="barber-style-meta">
        <span class="barber-cat" style="background:${tat.color}22;color:${tat.color}">${tat.placement === 'chest' ? 'Chest' : tat.placement === 'face' ? 'Face' : 'Arm'}</span>
        <span class="barber-desc">${tat.desc}</span>
      </div>
      <div class="barber-counter">${_tattooIdx + 1} / ${TATTOOS.length}</div>`;
  }

  document.querySelectorAll('.tat-dot').forEach((d,i) => {
    const on = i === _tattooIdx;
    d.classList.toggle('tat-dot-active', on);
    d.classList.toggle('barber-dot-active', on);
    d.style.background = on ? TATTOOS[i].color : '';
  });

  const btnEl = document.getElementById('tattoo-action-btn');
  if (btnEl) {
    if (isEquipped) {
      btnEl.textContent = '✓ Currently Inked';
      btnEl.disabled = true;
      btnEl.className = 'barber-btn barber-btn-owned';
    } else if (owned) {
      btnEl.textContent = 'Wear This Tattoo';
      btnEl.disabled = false;
      btnEl.className = 'barber-btn barber-btn-wear';
      btnEl.onclick = () => buyTattoo(tat.id);
    } else if (canBuy) {
      btnEl.textContent = `Ink It! — ${tat.cost}g`;
      btnEl.disabled = false;
      btnEl.className = 'barber-btn barber-btn-buy';
      btnEl.onclick = () => buyTattoo(tat.id);
    } else {
      btnEl.textContent = `${tat.cost}g — Need More Gold`;
      btnEl.disabled = true;
      btnEl.className = 'barber-btn barber-btn-broke';
    }
  }
}

function openTattooShop() {
  const container = document.getElementById('store-container');
  if (!container) return;
  const s = getState();
  const gold = s.gold || 0;
  const currentTat = s.tattoo || null;
  _tattooIdx = currentTat ? Math.max(0, TATTOOS.findIndex(t => t.id === currentTat)) : 0;

  container.innerHTML = `
<div class="barber-scene">
  <div class="boutique-topbar barber-topbar">
    <button class="comp-back-btn" onclick="GainsShop.render()">← Mall</button>
    <span class="boutique-gold"><i class="ti ti-coin"></i> ${gold.toLocaleString()}</span>
  </div>

  <!-- Room -->
  <div class="barber-room" style="background:linear-gradient(180deg,#120e16 0%,#1a1020 100%)">
    <!-- Back wall with flash sheets -->
    <div class="barber-wall" style="background:#0e0b12;border-bottom:3px solid #2a1840;padding-bottom:6px">

      <!-- Shop name -->
      <div style="text-align:center;font-family:'Cinzel',serif;font-size:11px;font-weight:700;letter-spacing:3px;color:#c060ff;text-shadow:0 0 8px #8020c0;padding-top:6px">IRON CANVAS</div>

      <!-- 3 large paper flash art sheets pinned to wall -->
      <div style="display:flex;gap:8px;padding:10px 8px 4px;justify-content:center;align-items:flex-start">
        ${[0,1,2].map(si => {
          const group = TATTOOS.slice(si*5, si*5+5);
          return `<div onclick="GainsShop._jumpTattoo(${si*5})" title="Flash Sheet ${si+1} — tap to browse" style="position:relative;cursor:pointer;flex-shrink:0">
            <!-- Push pin -->
            <div style="position:absolute;top:-5px;left:50%;transform:translateX(-50%);z-index:2">
              <div style="width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff6666,#cc0000);box-shadow:0 1px 3px rgba(0,0,0,0.6)"></div>
              <div style="width:2px;height:5px;background:#aa0000;margin:0 auto"></div>
            </div>
            <!-- Paper sheet -->
            <div style="background:#f2ead8;border-radius:1px;padding:6px 5px 5px;width:82px;box-shadow:2px 3px 8px rgba(0,0,0,0.6),inset 0 0 0 1px rgba(0,0,0,0.08);margin-top:4px">
              <!-- Sheet label -->
              <div style="text-align:center;font-size:6px;color:#5a4a30;font-family:Georgia,serif;letter-spacing:1px;margin-bottom:4px;border-bottom:1px solid #c8b898;padding-bottom:2px">FLASH ${si+1}</div>
              <!-- 2x2 grid of tattoos -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-bottom:2px">
                ${group.slice(0,4).map(t => `<svg viewBox="0 0 64 64" width="34" height="34" xmlns="http://www.w3.org/2000/svg" style="display:block">${t.svg}</svg>`).join('')}
              </div>
              <!-- 5th tattoo centered at bottom -->
              ${group[4] ? `<div style="display:flex;justify-content:center"><svg viewBox="0 0 64 64" width="34" height="34" xmlns="http://www.w3.org/2000/svg">${group[4].svg}</svg></div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>

    </div>

    <!-- Tattoo chair zone (reclined) -->
    <div class="barber-chair-zone">
      <div class="barber-avatar-wrap">
        <div id="tattoo-preview" class="barber-avatar-preview"></div>
      </div>
      <!-- Reclined tattoo table -->
      <div style="position:relative;margin-top:4px">
        <div style="width:120px;height:14px;background:#2a1840;border-radius:4px;margin:0 auto;border:1px solid #4a2860"></div>
        <div style="width:12px;height:24px;background:#1e1230;margin:0 auto;border-radius:0 0 3px 3px;border:1px solid #3a1850;border-top:none"></div>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <div class="barber-controls" style="background:#0e0b12;border-top:1px solid #2a1840">
    <button class="barber-nav-btn" style="color:#c060ff;border-color:#4a2080" onclick="GainsShop.cycleTattoo(-1)">&#8249;</button>
    <div class="barber-center-info">
      <div id="tattoo-style-info" class="barber-style-info"></div>
      <button id="tattoo-action-btn" class="barber-btn barber-btn-buy"></button>
    </div>
    <button class="barber-nav-btn" style="color:#c060ff;border-color:#4a2080" onclick="GainsShop.cycleTattoo(1)">&#8250;</button>
  </div>

  <!-- Dots -->
  <div class="barber-dots" style="background:#0e0b12;border-top:1px solid #1e1230">
    ${TATTOOS.map((t,i) => `<span class="tat-dot barber-dot${i===_tattooIdx?' tat-dot-active barber-dot-active':''}" style="${i===_tattooIdx?`background:${t.color}`:'background:#2a1840'}" onclick="GainsShop._jumpTattoo(${i})"></span>`).join('')}
  </div>

  <p class="boutique-hint" style="background:#0e0b12;color:#6a3080">One tattoo shown at a time · re-ink anytime you own it</p>
</div>`;

  refreshTattooPreview();
}

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

// ── FOOD COURT SPAWN ──
function getFoodCourtSpawn() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
  if (seed % 4 !== 0) return null; // 25% daily chance
  const pool = ITEMS.filter(i => i.duration > 0);
  const item = pool[(seed * 7 + 13) % pool.length];
  const s = getState();
  return { item, claimed: s.foodCourtClaimed === todayStr() };
}

function claimFoodCourtSpawn() {
  const spawn = getFoodCourtSpawn();
  if (!spawn || spawn.claimed) { showToast('Nothing here today!'); return; }
  const s = getState();
  if (!s.activeBuffs) s.activeBuffs = [];
  const halfDur = Math.max(1, Math.floor(spawn.item.duration / 2));
  if (isBuffActive(spawn.item.id)) {
    showToast('That buff is already active!');
  } else {
    s.activeBuffs.push({ id: spawn.item.id, expiresAt: Date.now() + halfDur * 3600000 });
    s.activeBuffs = s.activeBuffs.filter(b => b.expiresAt > Date.now());
    showToast(`🍱 Half-eaten ${spawn.item.name} — ${halfDur}h boost!`);
    try { if (typeof playSFX === 'function') playSFX('submit'); } catch(e) {}
  }
  s.foodCourtClaimed = todayStr();
  saveState(s);
  syncGold();
  render();
}

// ── PURCHASE FUNCTIONS ──
const _confirmTimers = {};
function confirmBuy(el, fn, id) {
  const key = fn + ':' + id;
  if (el.dataset.confirming === '1') {
    // Second click — execute purchase
    clearTimeout(_confirmTimers[key]);
    delete _confirmTimers[key];
    el.dataset.confirming = '';
    GainsShop[fn](id);
    return;
  }
  // First click — arm confirm state
  el.dataset.confirming = '1';
  const isBtn = el.tagName === 'BUTTON';
  let origContent, origStyle;
  if (isBtn) {
    origContent = el.innerHTML;
    origStyle = { bg: el.style.background, border: el.style.borderColor, color: el.style.color };
    el.innerHTML = '✓ Confirm';
    el.style.background = '#1a3a1a';
    el.style.borderColor = '#4caf50';
    el.style.color = '#4caf50';
  } else {
    // store-item div — update the cost label
    const costEl = el.querySelector('.item-cost');
    if (costEl) { origContent = costEl.textContent; costEl.textContent = 'Confirm?'; costEl.style.color = '#4caf50'; }
    el.style.outline = '2px solid #4caf50';
  }
  _confirmTimers[key] = setTimeout(() => {
    delete _confirmTimers[key];
    el.dataset.confirming = '';
    if (isBtn) {
      el.innerHTML = origContent;
      if (origStyle) { el.style.background = origStyle.bg; el.style.borderColor = origStyle.border; el.style.color = origStyle.color; }
    } else {
      const costEl = el.querySelector('.item-cost');
      if (costEl) { costEl.textContent = origContent; costEl.style.color = ''; }
      el.style.outline = '';
    }
  }, 3000);
}

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
  const spawn = getFoodCourtSpawn();
  return `
<div class="mall-wrap">
  <div class="mall-header">
    <div class="mall-title">🏬 IronLore Mall</div>
    <div class="mall-gold"><i class="ti ti-coin" style="color:#ffd700"></i> ${gold.toLocaleString()}</div>
  </div>
  <div class="mall-scene-wrap">
    <svg viewBox="0 0 526 520" xmlns="http://www.w3.org/2000/svg" class="mall-scene-svg">

      <!-- CEILING -->
      <rect x="0" y="0" width="526" height="48" fill="#c0ad90"/>
      <rect x="0" y="0" width="526" height="4" fill="#a89070"/>
      <rect x="6" y="7" width="52" height="16" rx="3" fill="#fdf8e0" opacity=".9"/>
      <ellipse cx="32" cy="47" rx="36" ry="14" fill="#fdf8e0" opacity=".07"/>
      <rect x="80" y="7" width="52" height="16" rx="3" fill="#fdf8e0" opacity=".9"/>
      <ellipse cx="106" cy="47" rx="36" ry="14" fill="#fdf8e0" opacity=".07"/>
      <rect x="164" y="7" width="52" height="16" rx="3" fill="#fdf8e0" opacity=".9"/>
      <ellipse cx="190" cy="47" rx="36" ry="14" fill="#fdf8e0" opacity=".07"/>
      <rect x="248" y="7" width="52" height="16" rx="3" fill="#fdf8e0" opacity=".9"/>
      <ellipse cx="274" cy="47" rx="36" ry="14" fill="#fdf8e0" opacity=".07"/>
      <rect x="322" y="7" width="52" height="16" rx="3" fill="#fdf8e0" opacity=".9"/>
      <ellipse cx="348" cy="47" rx="36" ry="14" fill="#fdf8e0" opacity=".07"/>
      <rect x="396" y="7" width="52" height="16" rx="3" fill="#fdf8e0" opacity=".6"/>
      <ellipse cx="422" cy="47" rx="36" ry="14" fill="#fdf8e0" opacity=".05"/>
      <rect x="464" y="7" width="52" height="16" rx="3" fill="#fdf8e0" opacity=".6"/>
      <ellipse cx="490" cy="47" rx="36" ry="14" fill="#fdf8e0" opacity=".05"/>
      <rect x="199" y="29" width="128" height="19" rx="3" fill="#5c3000"/>
      <rect x="201" y="31" width="124" height="15" rx="2" fill="#6e3800"/>
      <text x="263" y="43" text-anchor="middle" font-size="7.5" fill="#ffd700" font-family="serif" font-weight="700" letter-spacing="1.8">✦ IRONLORE MALL ✦</text>

      <!-- BACK WALL -->
      <rect x="0" y="48" width="526" height="166" fill="#b0a080"/>
      <rect x="0" y="48" width="526" height="5" fill="#9a8a70"/>

      <!-- FLOOR (extended to full height) -->
      <rect x="0" y="214" width="526" height="306" fill="#cec8b6"/>
      <!-- Floor tile horizontal lines -->
      <line x1="0" y1="231" x2="526" y2="231" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="248" x2="526" y2="248" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="265" x2="526" y2="265" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="282" x2="526" y2="282" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="299" x2="526" y2="299" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="316" x2="526" y2="316" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="333" x2="526" y2="333" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="350" x2="526" y2="350" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="367" x2="526" y2="367" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="384" x2="526" y2="384" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="401" x2="526" y2="401" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="418" x2="526" y2="418" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="435" x2="526" y2="435" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="452" x2="526" y2="452" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="469" x2="526" y2="469" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="486" x2="526" y2="486" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="0" y1="503" x2="526" y2="503" stroke="#b6b0a0" stroke-width=".8"/>
      <!-- Floor tile vertical lines -->
      <line x1="38"  y1="214" x2="38"  y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="76"  y1="214" x2="76"  y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="114" y1="214" x2="114" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="152" y1="214" x2="152" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="190" y1="214" x2="190" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="228" y1="214" x2="228" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="266" y1="214" x2="266" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="304" y1="214" x2="304" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="342" y1="214" x2="342" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="380" y1="214" x2="380" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="418" y1="214" x2="418" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="456" y1="214" x2="456" y2="520" stroke="#b6b0a0" stroke-width=".8"/>
      <line x1="494" y1="214" x2="494" y2="520" stroke="#b6b0a0" stroke-width=".8"/>

      <!-- 1. GAINS BODEGA  x=1-74 -->
      <g class="mall-zone" onclick="GainsShop.openBodega()">
        <rect x="1" y="48" width="74" height="166" fill="transparent"/>
        <rect x="1" y="53" width="73" height="161" fill="#142808"/>
        <rect x="1" y="53" width="73" height="26" fill="#1e6010"/>
        <line x1="14" y1="53" x2="14" y2="79" stroke="#ffffff18" stroke-width="7"/>
        <line x1="29" y1="53" x2="29" y2="79" stroke="#ffffff18" stroke-width="7"/>
        <line x1="44" y1="53" x2="44" y2="79" stroke="#ffffff18" stroke-width="7"/>
        <line x1="59" y1="53" x2="59" y2="79" stroke="#ffffff18" stroke-width="7"/>
        <rect x="1" y="53" width="73" height="2" fill="#2a8a18"/>
        <rect x="1" y="77" width="73" height="2" fill="#2a8a18"/>
        <text x="37.5" y="63" text-anchor="middle" font-size="6.5" fill="#fff" font-family="sans-serif" font-weight="700">GAINS</text>
        <text x="37.5" y="74" text-anchor="middle" font-size="5.5" fill="#b8ffb0" font-family="sans-serif" letter-spacing=".5">BODEGA</text>
        <rect x="7" y="86" width="61" height="84" rx="3" fill="#091a04" stroke="#2e6a1a" stroke-width="1.5"/>
        <rect x="9" y="88" width="57" height="80" rx="2" fill="#0c2007"/>
        <rect x="10" y="124" width="57" height="2.5" fill="#2e6a1a"/>
        <rect x="13" y="103" width="9" height="22" rx="3" fill="#e03030"/>
        <ellipse cx="17.5" cy="103" rx="5.5" ry="2.5" fill="#c02020"/>
        <rect x="13" y="101" width="9" height="4" rx="1" fill="#c82828"/>
        <rect x="25" y="99" width="10" height="26" rx="3" fill="#3060d0"/>
        <ellipse cx="30" cy="99" rx="6" ry="2.5" fill="#2040b0"/>
        <rect x="25" y="97" width="10" height="4" rx="1" fill="#2848c0"/>
        <rect x="38" y="106" width="9" height="19" rx="3" fill="#28a828"/>
        <ellipse cx="42.5" cy="106" rx="5.5" ry="2.5" fill="#189018"/>
        <rect x="38" y="104" width="9" height="4" rx="1" fill="#209020"/>
        <rect x="50" y="101" width="10" height="24" rx="3" fill="#d08820"/>
        <ellipse cx="55" cy="101" rx="6" ry="2.5" fill="#b07010"/>
        <rect x="50" y="99" width="10" height="4" rx="1" fill="#c07818"/>
        <rect x="12" y="90" width="20" height="10" rx="2" fill="#18aa18"/>
        <text x="22" y="98" text-anchor="middle" font-size="5" fill="#fff" font-family="sans-serif" font-weight="700">OPEN</text>
        <text x="52" y="101" font-size="11" fill="#66ff66" opacity=".65">$</text>
        <rect x="18" y="175" width="38" height="39" rx="2" fill="#193808"/>
        <rect x="20" y="177" width="34" height="35" rx="1" fill="#0e2004"/>
        <circle cx="41" cy="195" r="2.5" fill="#ffd700"/>
        <line x1="37" y1="177" x2="37" y2="214" stroke="#253e14" stroke-width=".8"/>
        <g class="ml-label">
          <rect x="1" y="197" width="73" height="16" rx="0" fill="#000000cc"/>
          <text x="37.5" y="208" text-anchor="middle" font-size="7.5" fill="#7fff70" font-family="sans-serif" font-weight="700">Gains Bodega</text>
        </g>
      </g>

      <!-- 2. FORGED™ APPAREL  x=76-149 -->
      <g class="mall-zone" onclick="GainsShop.openClothing()">
        <rect x="76" y="48" width="74" height="166" fill="transparent"/>
        <rect x="76" y="53" width="73" height="161" fill="#080808"/>
        <rect x="76" y="53" width="73" height="26" fill="#0e0e0e"/>
        <rect x="76" y="53" width="73" height="2" fill="#cc9900"/>
        <rect x="76" y="77" width="73" height="2" fill="#cc9900"/>
        <line x1="76" y1="53" x2="76" y2="79" stroke="#cc9900" stroke-width="1.5"/>
        <line x1="148" y1="53" x2="148" y2="79" stroke="#cc9900" stroke-width="1.5"/>
        <text x="112.5" y="64" text-anchor="middle" font-size="8.5" fill="#ffd700" font-family="serif" font-weight="700">FORGED™</text>
        <text x="112.5" y="74" text-anchor="middle" font-size="4.5" fill="#cc9900" font-family="sans-serif" letter-spacing="2.5">APPAREL</text>
        <rect x="82" y="86" width="61" height="84" rx="2" fill="#0c0c0c" stroke="#cc9900" stroke-width="1.2"/>
        <rect x="84" y="88" width="57" height="80" rx="1" fill="#080808"/>
        <ellipse cx="112.5" cy="100" rx="7" ry="7.5" fill="#1e1e1e"/>
        <rect x="105" y="107" width="15" height="26" rx="3" fill="#111"/>
        <path d="M105 112 L112.5 115 L120 112" stroke="#cc9900" stroke-width="1.2" fill="none"/>
        <text x="112.5" y="123" text-anchor="middle" font-size="4" fill="#cc9900" font-family="sans-serif" font-weight="700">F™</text>
        <rect x="99" y="109" width="6" height="18" rx="3" fill="#1e1e1e"/>
        <rect x="119" y="109" width="6" height="18" rx="3" fill="#1e1e1e"/>
        <line x1="112.5" y1="133" x2="112.5" y2="151" stroke="#1e1e1e" stroke-width="2.5"/>
        <rect x="106" y="149" width="13" height="2" rx="1" fill="#1e1e1e"/>
        <ellipse cx="112.5" cy="90" rx="22" ry="6" fill="#cc9900" opacity=".06"/>
        <rect x="84" y="90" width="16" height="9" rx="1.5" fill="#ffd700"/>
        <text x="92" y="97" text-anchor="middle" font-size="5" fill="#000" font-family="sans-serif" font-weight="700">NEW</text>
        <rect x="91" y="175" width="43" height="39" rx="2" fill="#0e0e0e" stroke="#cc9900" stroke-width="1"/>
        <rect x="93" y="177" width="18" height="35" rx="1" fill="#060606"/>
        <rect x="113" y="177" width="19" height="35" rx="1" fill="#060606"/>
        <circle cx="110" cy="195" r="2" fill="#cc9900"/>
        <circle cx="116" cy="195" r="2" fill="#cc9900"/>
        <line x1="111" y1="177" x2="111" y2="214" stroke="#1a1a1a" stroke-width=".8"/>
        <g class="ml-label">
          <rect x="76" y="197" width="73" height="16" rx="0" fill="#000000cc"/>
          <text x="112.5" y="208" text-anchor="middle" font-size="7.5" fill="#ffd700" font-family="sans-serif" font-weight="700">FORGED™ Apparel</text>
        </g>
      </g>

      <!-- 4. IRON DEPOT  shifted left (was x=230, now visual x=153) -->
      <g class="mall-zone" onclick="GainsShop.openSporting()" transform="translate(-77,0)">
        <rect x="230" y="48" width="74" height="166" fill="transparent"/>
        <rect x="230" y="53" width="73" height="161" fill="#180606"/>
        <rect x="230" y="53" width="73" height="26" fill="#7a1818"/>
        <rect x="230" y="53" width="73" height="2" fill="#aa2222"/>
        <rect x="230" y="77" width="73" height="2" fill="#660e0e"/>
        <circle cx="236" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="244" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="252" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="260" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="268" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="276" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="284" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="292" cy="65" r="1.8" fill="#9a2a2a"/>
        <circle cx="300" cy="65" r="1.8" fill="#9a2a2a"/>
        <text x="266.5" y="63" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="700">IRON</text>
        <text x="266.5" y="73.5" text-anchor="middle" font-size="7" fill="#ffcc00" font-family="sans-serif" font-weight="700">DEPOT</text>
        <rect x="236" y="86" width="61" height="84" rx="2" fill="#0c0202" stroke="#6a1010" stroke-width="1.5"/>
        <rect x="238" y="88" width="57" height="80" rx="1" fill="#080202"/>
        <line x1="240" y1="122" x2="295" y2="122" stroke="#777" stroke-width="5" stroke-linecap="round"/>
        <rect x="241" y="108" width="7" height="28" rx="2" fill="#cc1010"/>
        <rect x="249" y="112" width="5" height="20" rx="2" fill="#aa0c0c"/>
        <rect x="283" y="108" width="7" height="28" rx="2" fill="#cc1010"/>
        <rect x="277" y="112" width="5" height="20" rx="2" fill="#aa0c0c"/>
        <ellipse cx="260" cy="143" rx="9" ry="5.5" fill="#444"/>
        <rect x="256" y="132" width="8" height="12" rx="4" fill="#383838"/>
        <path d="M254 135 Q260 129 266 135" stroke="#444" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="275" y="131" width="22" height="13" rx="2" fill="#ffcc00"/>
        <text x="286" y="141" text-anchor="middle" font-size="5.5" fill="#000" font-family="sans-serif" font-weight="700">SALE</text>
        <rect x="244" y="175" width="45" height="39" rx="2" fill="#200808"/>
        <rect x="246" y="177" width="41" height="35" rx="1" fill="#150404"/>
        <circle cx="265" cy="195" r="2.5" fill="#888"/>
        <line x1="266" y1="177" x2="266" y2="214" stroke="#280a0a" stroke-width=".8"/>
        <g class="ml-label">
          <rect x="230" y="197" width="73" height="16" rx="0" fill="#000000cc"/>
          <text x="266.5" y="208" text-anchor="middle" font-size="7.5" fill="#ff7070" font-family="sans-serif" font-weight="700">Iron Depot</text>
        </g>
      </g>

      <!-- 5. CHOP SHOP  shifted left (was x=305, now visual x=228) -->
      <g class="mall-zone" onclick="GainsShop.openBarber()" transform="translate(-77,0)">
        <rect x="305" y="48" width="74" height="166" fill="transparent"/>
        <rect x="305" y="53" width="73" height="161" fill="#0a0a1c"/>
        <rect x="305" y="53" width="73" height="26" fill="#f0f0f0"/>
        <rect x="305" y="53" width="12" height="26" fill="#c01818"/>
        <rect x="324" y="53" width="12" height="26" fill="#c01818"/>
        <rect x="343" y="53" width="12" height="26" fill="#c01818"/>
        <rect x="362" y="53" width="16" height="26" fill="#c01818"/>
        <rect x="305" y="53" width="7" height="26" fill="#1818b0"/>
        <rect x="330" y="53" width="7" height="26" fill="#1818b0"/>
        <rect x="355" y="53" width="7" height="26" fill="#1818b0"/>
        <rect x="305" y="68" width="73" height="13" fill="#0a0a1ccc"/>
        <text x="341.5" y="78" text-anchor="middle" font-size="7" fill="#fff" font-family="sans-serif" font-weight="700">CHOP SHOP</text>
        <rect x="311" y="86" width="61" height="84" rx="2" fill="#060614" stroke="#2a2a6a" stroke-width="1.5"/>
        <rect x="313" y="88" width="57" height="80" rx="1" fill="#050510"/>
        <rect x="329" y="92" width="12" height="58" rx="6" fill="#e8e8e8"/>
        <path d="M329 97 Q335 100 341 97 Q335 94 329 97Z" fill="#c81818"/>
        <path d="M329 105 Q335 108 341 105 Q335 102 329 105Z" fill="#c81818"/>
        <path d="M329 113 Q335 116 341 113 Q335 110 329 113Z" fill="#c81818"/>
        <path d="M329 121 Q335 124 341 121 Q335 118 329 121Z" fill="#c81818"/>
        <path d="M329 129 Q335 132 341 129 Q335 126 329 129Z" fill="#c81818"/>
        <path d="M329 137 Q335 140 341 137 Q335 134 329 137Z" fill="#c81818"/>
        <path d="M329 101 Q335 104 341 101 Q335 98 329 101Z" fill="#1818b0" opacity=".6"/>
        <path d="M329 117 Q335 120 341 117 Q335 114 329 117Z" fill="#1818b0" opacity=".6"/>
        <path d="M329 133 Q335 136 341 133 Q335 130 329 133Z" fill="#1818b0" opacity=".6"/>
        <ellipse cx="335" cy="92" rx="7" ry="3" fill="#ccc"/>
        <ellipse cx="335" cy="150" rx="7" ry="3" fill="#ccc"/>
        <line x1="350" y1="99" x2="367" y2="117" stroke="#aaa" stroke-width="2"/>
        <line x1="367" y1="99" x2="350" y2="117" stroke="#aaa" stroke-width="2"/>
        <circle cx="358.5" cy="108" r="3.5" fill="#777" stroke="#aaa" stroke-width=".8"/>
        <text x="358" y="140" text-anchor="middle" font-size="11" fill="#ff88cc" opacity=".75">✂</text>
        <rect x="319" y="175" width="45" height="39" rx="2" fill="#10102a"/>
        <rect x="321" y="177" width="41" height="35" rx="1" fill="#080818"/>
        <circle cx="340" cy="195" r="2.5" fill="#6868cc"/>
        <line x1="341" y1="177" x2="341" y2="214" stroke="#18183a" stroke-width=".8"/>
        <g class="ml-label">
          <rect x="305" y="197" width="73" height="16" rx="0" fill="#000000cc"/>
          <text x="341.5" y="208" text-anchor="middle" font-size="7.5" fill="#cc88ff" font-family="sans-serif" font-weight="700">Chop Shop</text>
        </g>
      </g>

      <!-- 6. PAW & PROWL — Pet Store  shifted left (visual x=303) -->
      <g class="mall-zone" onclick="GainsShop.openPetStore()" transform="translate(-77,0)">
        <rect x="380" y="48" width="72" height="166" fill="transparent"/>
        <!-- Warm cream storefront wall -->
        <rect x="380" y="53" width="72" height="161" fill="#f0e4cc"/>
        <!-- Awning base — teal stripes (classic pet shop look) -->
        <rect x="380" y="53" width="72" height="28" fill="#2a7a58"/>
        <!-- Awning cream stripes -->
        <rect x="384" y="53" width="8" height="28" fill="#f0e4cc" opacity=".85"/>
        <rect x="398" y="53" width="8" height="28" fill="#f0e4cc" opacity=".85"/>
        <rect x="412" y="53" width="8" height="28" fill="#f0e4cc" opacity=".85"/>
        <rect x="426" y="53" width="8" height="28" fill="#f0e4cc" opacity=".85"/>
        <rect x="440" y="53" width="12" height="28" fill="#f0e4cc" opacity=".85"/>
        <!-- Awning shadow underline -->
        <rect x="380" y="79" width="72" height="3" fill="#1a5a3a"/>
        <!-- Scallop fringe on awning -->
        <path d="M380 82 Q383.6 88 387.2 82 Q390.8 88 394.4 82 Q398 88 401.6 82 Q405.2 88 408.8 82 Q412.4 88 416 82 Q419.6 88 423.2 82 Q426.8 88 430.4 82 Q434 88 437.6 82 Q441.2 88 444.8 82 Q448.4 88 452 82" fill="#2a7a58" stroke="#1a5a3a" stroke-width=".8"/>
        <!-- Store name sign — wood-look board -->
        <rect x="382" y="62" width="68" height="14" rx="2" fill="#6a3a10"/>
        <rect x="383" y="63" width="66" height="12" rx="1" fill="#7a4818"/>
        <text x="416" y="72" text-anchor="middle" font-size="6" fill="#f5d080" font-family="sans-serif" font-weight="700" letter-spacing=".5">🐾 PAW &amp; PROWL</text>
        <!-- Large display window -->
        <rect x="382" y="88" width="68" height="68" rx="3" fill="#d4ede0" stroke="#2a7a58" stroke-width="2"/>
        <!-- Window interior warm background -->
        <rect x="384" y="90" width="64" height="64" rx="2" fill="#e8f4ec"/>
        <!-- Window cross divider -->
        <line x1="416" y1="90" x2="416" y2="154" stroke="#2a7a58" stroke-width="1.5"/>
        <line x1="384" y1="122" x2="448" y2="122" stroke="#2a7a58" stroke-width="1.5"/>
        <!-- Top-left pane: dog in cage -->
        <rect x="387" y="93" width="26" height="26" rx="2" fill="#c8e4cc" stroke="#4a8a60" stroke-width=".8"/>
        <line x1="392" y1="93" x2="392" y2="119" stroke="#4a8a60" stroke-width=".7"/>
        <line x1="397" y1="93" x2="397" y2="119" stroke="#4a8a60" stroke-width=".7"/>
        <line x1="402" y1="93" x2="402" y2="119" stroke="#4a8a60" stroke-width=".7"/>
        <line x1="407" y1="93" x2="407" y2="119" stroke="#4a8a60" stroke-width=".7"/>
        <!-- Dog silhouette top-left -->
        <ellipse cx="400" cy="112" rx="7" ry="4.5" fill="#c0882a"/>
        <ellipse cx="395" cy="108" rx="4.5" ry="4" fill="#c0882a"/>
        <path d="M391 106 Q392 102 395 104" stroke="#c0882a" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Top-right pane: cat -->
        <rect x="419" y="93" width="26" height="26" rx="2" fill="#c8e4cc" stroke="#4a8a60" stroke-width=".8"/>
        <!-- Cat sitting silhouette -->
        <ellipse cx="432" cy="114" rx="6" ry="4" fill="#d4b060"/>
        <ellipse cx="432" cy="108" rx="4" ry="4" fill="#d4b060"/>
        <path d="M428 106 Q429 102 431 104" stroke="#d4b060" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M431 102 Q433 99 435 101" stroke="#d4b060" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Bottom-left pane: bird on perch -->
        <rect x="387" y="125" width="26" height="26" rx="2" fill="#c8e4cc" stroke="#4a8a60" stroke-width=".8"/>
        <line x1="387" y1="143" x2="413" y2="143" stroke="#6a5030" stroke-width="2"/>
        <ellipse cx="400" cy="137" rx="5" ry="4.5" fill="#28a040"/>
        <ellipse cx="400" cy="132" rx="3.5" ry="3" fill="#1a8030"/>
        <rect x="399" y="129" width="3" height="3" rx="1" fill="#ffd020"/>
        <!-- Bottom-right pane: fish tank -->
        <rect x="419" y="125" width="26" height="26" rx="2" fill="#0a2848" stroke="#2a5888" stroke-width=".8"/>
        <rect x="420" y="126" width="24" height="24" rx="1" fill="#0d3060" opacity=".9"/>
        <path d="M422 138 Q428 133 434 138 Q428 143 422 138Z" fill="#ff6820"/>
        <circle cx="427" cy="131" r="1.2" fill="none" stroke="#88ccff" stroke-width=".8" opacity=".7"/>
        <circle cx="433" cy="129" r="1" fill="none" stroke="#88ccff" stroke-width=".8" opacity=".5"/>
        <!-- Warm interior glow below window -->
        <rect x="384" y="154" width="64" height="4" fill="#2a7a58" opacity=".3"/>
        <!-- Door — wooden with paw print -->
        <rect x="393" y="162" width="46" height="51" rx="3" fill="#7a4818" stroke="#5a3410" stroke-width="1.5"/>
        <rect x="395" y="164" width="42" height="47" rx="2" fill="#8a5220"/>
        <!-- Door panels -->
        <rect x="397" y="166" width="38" height="18" rx="1" fill="#7a4818" stroke="#6a3a10" stroke-width=".6"/>
        <rect x="397" y="187" width="38" height="20" rx="1" fill="#7a4818" stroke="#6a3a10" stroke-width=".6"/>
        <!-- Paw print on door center panel -->
        <circle cx="416" cy="196" r="4" fill="#5a3010" opacity=".7"/>
        <circle cx="411" cy="192" r="2" fill="#5a3010" opacity=".7"/>
        <circle cx="416" cy="191" r="2" fill="#5a3010" opacity=".7"/>
        <circle cx="421" cy="192" r="2" fill="#5a3010" opacity=".7"/>
        <!-- Door knob -->
        <circle cx="430" cy="198" r="3" fill="#c0a030"/>
        <circle cx="430" cy="198" r="1.8" fill="#e0c050"/>
        <!-- Paw print on wall beside door -->
        <circle cx="387" cy="185" r="3" fill="#2a7a58" opacity=".5"/>
        <circle cx="384" cy="181" r="1.5" fill="#2a7a58" opacity=".5"/>
        <circle cx="387" cy="180" r="1.5" fill="#2a7a58" opacity=".5"/>
        <circle cx="390" cy="181" r="1.5" fill="#2a7a58" opacity=".5"/>
        <!-- ml-label -->
        <g class="ml-label">
          <rect x="380" y="197" width="72" height="16" rx="0" fill="#000000cc"/>
          <text x="416" y="208" text-anchor="middle" font-size="6.5" fill="#88ffcc" font-family="sans-serif" font-weight="700">Paw &amp; Prowl 🐾</text>
        </g>
      </g>

      <!-- 7. IRON CANVAS — Tattoo Shop -->
      <g class="mall-zone" onclick="GainsShop.openTattooShop()">
        <rect x="378" y="48" width="73" height="166" fill="transparent"/>
        <!-- Dark grungy wall -->
        <rect x="378" y="53" width="73" height="161" fill="#120e10"/>
        <!-- Awning — deep purple/black -->
        <rect x="378" y="53" width="73" height="26" fill="#1e1020"/>
        <rect x="378" y="53" width="73" height="2" fill="#6a2080"/>
        <rect x="378" y="77" width="73" height="2" fill="#3a1050"/>
        <text x="414" y="63" text-anchor="middle" font-size="6" fill="#c060e0" font-family="sans-serif" font-weight="700" letter-spacing=".5">IRON</text>
        <text x="414" y="74" text-anchor="middle" font-size="5.5" fill="#9040c0" font-family="sans-serif" letter-spacing=".5">CANVAS</text>
        <!-- Window — flash portfolio prints -->
        <rect x="383" y="86" width="63" height="84" rx="3" fill="#0c0810" stroke="#3a1850" stroke-width="1.5"/>
        <!-- Tattoo flash art sheets on wall -->
        <rect x="386" y="90" width="18" height="22" rx="1" fill="#1a1420" stroke="#5a2880" stroke-width=".8"/>
        <text x="395" y="104" text-anchor="middle" font-size="8" fill="#c060e0" opacity=".7">☠</text>
        <rect x="407" y="90" width="18" height="22" rx="1" fill="#1a1420" stroke="#5a2880" stroke-width=".8"/>
        <text x="416" y="104" text-anchor="middle" font-size="8" fill="#e04040" opacity=".7">♥</text>
        <rect x="428" y="90" width="16" height="22" rx="1" fill="#1a1420" stroke="#5a2880" stroke-width=".8"/>
        <text x="436" y="104" text-anchor="middle" font-size="7" fill="#40a0e0" opacity=".7">⚡</text>
        <rect x="386" y="116" width="18" height="22" rx="1" fill="#1a1420" stroke="#5a2880" stroke-width=".8"/>
        <text x="395" y="130" text-anchor="middle" font-size="7" fill="#e0a000" opacity=".7">★</text>
        <rect x="407" y="116" width="18" height="22" rx="1" fill="#1a1420" stroke="#5a2880" stroke-width=".8"/>
        <text x="416" y="130" text-anchor="middle" font-size="6" fill="#60e060" opacity=".7">🐉</text>
        <rect x="428" y="116" width="16" height="22" rx="1" fill="#1a1420" stroke="#5a2880" stroke-width=".8"/>
        <text x="436" y="130" text-anchor="middle" font-size="7" fill="#e06080" opacity=".7">✿</text>
        <!-- Neon sign in window -->
        <rect x="384" y="143" width="58" height="14" rx="3" fill="#0a0010" stroke="#8020c0" stroke-width=".8"/>
        <text x="413" y="153" text-anchor="middle" font-size="6" fill="#c060ff" font-family="sans-serif" font-weight="700" letter-spacing="1">TATTOO</text>
        <!-- Door -->
        <rect x="390" y="162" width="38" height="52" rx="2" fill="#100c18" stroke="#3a1850" stroke-width="1"/>
        <rect x="393" y="165" width="32" height="44" rx="1" fill="#0a0810"/>
        <circle cx="422" cy="188" r="3" fill="#6a2880"/>
        <!-- ml-label -->
        <g class="ml-label">
          <rect x="378" y="197" width="73" height="16" rx="0" fill="#000000cc"/>
          <text x="414" y="208" text-anchor="middle" font-size="6.5" fill="#c060e0" font-family="sans-serif" font-weight="700">Iron Canvas</text>
        </g>
      </g>

      <!-- 8. EXIT DOOR — Back Alley  x=451-525 -->
      <g class="mall-zone" onclick="GainsShop.openBackAlley()">
        <rect x="451" y="48" width="75" height="166" fill="transparent"/>
        <!-- Concrete wall fill -->
        <rect x="451" y="53" width="75" height="161" fill="#2a2420"/>
        <!-- Brick texture -->
        ${[55,63,71,79,87,95,103,111,119,127,135,143,151,159,167,175,183,191].map((y,i) =>
          `<rect x="${451+(i%2)*16}" y="${y}" width="30" height="7" rx="1" fill="#251e18"/>
           <rect x="${451+(i%2)*16+32}" y="${y}" width="27" height="7" rx="1" fill="#231c16"/>
           <rect x="${451+(i%2)*16+61}" y="${y}" width="14" height="7" rx="1" fill="#251e18"/>`
        ).join('')}
        <!-- EXIT sign -->
        <rect x="461" y="58" width="54" height="14" rx="2" fill="#001600" stroke="#00aa22" stroke-width="1"/>
        <text x="488" y="69" text-anchor="middle" font-size="7" fill="#00ff55" font-family="sans-serif" font-weight="700" letter-spacing="2">EXIT</text>
        <!-- Door frame -->
        <rect x="458" y="110" width="60" height="104" rx="2" fill="#1a1208" stroke="#5a4020" stroke-width="2"/>
        <!-- Door panel -->
        <rect x="461" y="113" width="54" height="98" rx="1" fill="#3a2a10"/>
        <!-- Door wood panels -->
        <rect x="464" y="116" width="48" height="32" rx="1" fill="#2e2008" stroke="#4a3418" stroke-width=".8"/>
        <rect x="464" y="152" width="48" height="32" rx="1" fill="#2e2008" stroke="#4a3418" stroke-width=".8"/>
        <rect x="464" y="188" width="48" height="20" rx="1" fill="#2e2008" stroke="#4a3418" stroke-width=".8"/>
        <!-- Door knob -->
        <circle cx="505" cy="167" r="4" fill="#8a6830"/>
        <circle cx="505" cy="167" r="2.5" fill="#c8a050"/>
        <!-- Hinges -->
        <rect x="462" y="120" width="4" height="8" rx="1" fill="#6a5030"/>
        <rect x="462" y="188" width="4" height="8" rx="1" fill="#6a5030"/>
        <!-- ml-label -->
        <g class="ml-label">
          <rect x="451" y="197" width="75" height="16" rx="0" fill="#000000cc"/>
          <text x="488" y="208" text-anchor="middle" font-size="7" fill="#00ff88" font-family="sans-serif" font-weight="700">Back Alley →</text>
        </g>
      </g>

      <!-- ═══════════════════════════════════════════════════════════ -->
      <!-- LOWER MALL CONCOURSE (y=300–520)                          -->
      <!-- ═══════════════════════════════════════════════════════════ -->

      <!-- Concourse separator line -->
      <rect x="0" y="300" width="526" height="3" fill="#a89878"/>

      <!-- ── ESCALATORS (halved: x=5–95, y=304–410) ── -->
      <!-- Housing surround -->
      <rect x="5" y="304" width="90" height="106" rx="5" fill="#18160f" stroke="#6a5a3a" stroke-width="1.5"/>
      <!-- Top landing plate -->
      <rect x="7" y="304" width="86" height="24" rx="4" fill="#c8c2b0"/>
      <rect x="7" y="304" width="86" height="24" rx="4" fill="#d4ceba" opacity=".9"/>
      <text x="50" y="320" text-anchor="middle" font-size="7" fill="#5a4a2a" font-weight="700" font-family="sans-serif">▼ LEVEL ▲</text>
      <!-- Center divider rail -->
      <rect x="48" y="328" width="4" height="78" fill="#8a7a58" rx="1"/>
      <!-- LEFT escalator band (going DOWN) -->
      <polygon points="9,328 48,328 48,406 9,406" fill="#201e16"/>
      ${[0,1,2,3,4,5,6,7,8].map(i => {
        const y = 328 + i * 8.7;
        return `<line x1="9" y1="${y.toFixed(1)}" x2="48" y2="${y.toFixed(1)}" stroke="#ffd700" stroke-width=".9" opacity=".75"/>
        <rect x="9" y="${y.toFixed(1)}" width="39" height="8.7" fill="#2a2618" opacity="${i%2===0?'.9':'.7'}"/>`;
      }).join('')}
      <!-- DOWN arrow overlay -->
      <text x="28" y="372" text-anchor="middle" font-size="16" fill="#ffd700" opacity=".18" font-weight="700">↓</text>
      <!-- RIGHT escalator band (going UP) -->
      <polygon points="52,328 91,328 91,406 52,406" fill="#201e16"/>
      ${[0,1,2,3,4,5,6,7,8].map(i => {
        const y = 406 - i * 8.7;
        return `<line x1="52" y1="${y.toFixed(1)}" x2="91" y2="${y.toFixed(1)}" stroke="#ffd700" stroke-width=".9" opacity=".75"/>
        <rect x="52" y="${(y-8.7).toFixed(1)}" width="39" height="8.7" fill="#2a2618" opacity="${i%2===0?'.9':'.7'}"/>`;
      }).join('')}
      <!-- UP arrow overlay -->
      <text x="72" y="372" text-anchor="middle" font-size="16" fill="#ffd700" opacity=".18" font-weight="700">↑</text>
      <!-- Bottom fade -->
      <rect x="9" y="388" width="82" height="18" rx="2" fill="#000" opacity=".55"/>
      <!-- Yellow safety strips -->
      <rect x="9"  y="328" width="39" height="3" fill="#ffd700" rx="1"/>
      <rect x="52" y="328" width="39" height="3" fill="#ffd700" rx="1"/>
      <!-- Handrail caps -->
      <rect x="6"  y="325" width="4" height="85" rx="2" fill="#9a8a68"/>
      <rect x="91" y="325" width="4" height="85" rx="2" fill="#9a8a68"/>

      <!-- ── IRON TEMPLE GYM SIGN — beside escalator, same height ── -->
      <g onclick="GainsShop.enterGym()" style="cursor:pointer">
        <!-- Stakes rooted to floor -->
        <rect x="122" y="358" width="4" height="162" rx="2" fill="#6a4a1a"/>
        <rect x="155" y="358" width="4" height="162" rx="2" fill="#6a4a1a"/>
        <rect x="125" y="358" width="2" height="162" rx="1" fill="#3a2a08" opacity=".5"/>
        <rect x="158" y="358" width="2" height="162" rx="1" fill="#3a2a08" opacity=".5"/>
        <!-- Sign board — vertically centred with escalator block -->
        <rect x="106" y="318" width="70" height="52" rx="3" fill="#b30000" stroke="#7a0000" stroke-width="1.5"/>
        <rect x="109" y="321" width="64" height="46" rx="2" fill="none" stroke="#ff5555" stroke-width=".8" opacity=".5"/>
        <!-- Sign text -->
        <text x="141" y="334" text-anchor="middle" font-size="6.5" fill="#ffffff" font-family="sans-serif" font-weight="700" letter-spacing="1">IRON TEMPLE</text>
        <line x1="110" y1="338" x2="170" y2="338" stroke="#ff4444" stroke-width=".8" opacity=".6"/>
        <text x="141" y="352" text-anchor="middle" font-size="12" fill="#ffd700" font-family="sans-serif" font-weight="900" letter-spacing="1">GYM</text>
        <text x="141" y="363" text-anchor="middle" font-size="6.5" fill="#ffcc44" font-family="sans-serif" font-weight="700">↓ LOWER LEVEL</text>
        <!-- Bracket connectors from sign to stakes -->
        <rect x="120" y="370" width="8" height="3" rx="1" fill="#8a6020"/>
        <rect x="153" y="370" width="8" height="3" rx="1" fill="#8a6020"/>
      </g>
      <!-- Click zone for escalator -->
      <rect x="9" y="328" width="83" height="78" fill="transparent" onclick="GainsShop.enterGym()" style="cursor:pointer"/>

      <!-- ── FOOD COURT (center, x=195–360) ── -->
      <!-- Section label -->
      <rect x="197" y="303" width="162" height="14" rx="3" fill="#a08040" opacity=".7"/>
      <text x="278" y="313" text-anchor="middle" font-size="7.5" fill="#fff8e0" font-weight="700" font-family="sans-serif" letter-spacing="1.5">FOOD COURT</text>
      ${spawn && !spawn.claimed ? `<circle cx="351" cy="306" r="5" fill="#ff4444"/><text x="351" y="309" text-anchor="middle" font-size="6" fill="#fff" font-weight="700" font-family="sans-serif">!</text>` : ''}
      <!-- Slightly warmer floor tone for food court -->
      <rect x="197" y="317" width="162" height="198" fill="#d4c8a8" opacity=".35"/>

      <!-- Table 1 (top-left) -->
      <circle cx="238" cy="356" r="22" fill="#8a6840"/>
      <circle cx="238" cy="356" r="19" fill="#b08850"/>
      <circle cx="238" cy="356" r="8"  fill="#c09860" opacity=".6"/>
      <!-- Tray on table 1 -->
      <rect x="231" y="349" width="14" height="10" rx="2" fill="#c8a060" opacity=".8"/>
      <circle cx="234" cy="353" r="3" fill="#e05020"/>
      <rect x="238" y="350" width="6" height="8" rx="1" fill="#d4b060"/>
      <!-- Chairs around table 1 -->
      <rect x="228" y="330" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="228" y="370" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="210" y="349" width="12" height="14" rx="4" fill="#6a4820"/>
      <rect x="254" y="349" width="12" height="14" rx="4" fill="#6a4820"/>

      <!-- Table 2 (top-right) -->
      <circle cx="318" cy="356" r="22" fill="#8a6840"/>
      <circle cx="318" cy="356" r="19" fill="#b08850"/>
      <circle cx="318" cy="356" r="8"  fill="#c09860" opacity=".6"/>
      <!-- Food on table 2 -->
      <circle cx="314" cy="352" r="4" fill="#e04020"/>
      <circle cx="322" cy="355" r="3" fill="#f0c040"/>
      <rect x="310" y="358" width="10" height="6" rx="1" fill="#c8a060"/>
      <!-- Chairs around table 2 -->
      <rect x="308" y="330" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="308" y="370" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="290" y="349" width="12" height="14" rx="4" fill="#6a4820"/>
      <rect x="334" y="349" width="12" height="14" rx="4" fill="#6a4820"/>

      <!-- Table 3 (bottom-left) -->
      <circle cx="238" cy="442" r="22" fill="#8a6840"/>
      <circle cx="238" cy="442" r="19" fill="#b08850"/>
      <circle cx="238" cy="442" r="8"  fill="#c09860" opacity=".6"/>
      <!-- Scattered cups on table 3 -->
      <circle cx="232" cy="438" r="3.5" fill="#d0e8f0"/>
      <circle cx="244" cy="444" r="3" fill="#d0e8f0"/>
      <rect x="235" y="435" width="8" height="12" rx="2" fill="#b09050"/>
      <!-- Chairs around table 3 -->
      <rect x="228" y="416" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="228" y="456" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="210" y="435" width="12" height="14" rx="4" fill="#6a4820"/>
      <rect x="254" y="435" width="12" height="14" rx="4" fill="#6a4820"/>

      <!-- Table 4 (bottom-right) -->
      <circle cx="318" cy="442" r="22" fill="#8a6840"/>
      <circle cx="318" cy="442" r="19" fill="#b08850"/>
      <circle cx="318" cy="442" r="8"  fill="#c09860" opacity=".6"/>
      <!-- Chairs around table 4 -->
      <rect x="308" y="416" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="308" y="456" width="20" height="12" rx="4" fill="#6a4820"/>
      <rect x="290" y="435" width="12" height="14" rx="4" fill="#6a4820"/>
      <rect x="334" y="435" width="12" height="14" rx="4" fill="#6a4820"/>
      ${spawn && !spawn.claimed ? `
      <!-- Half-eaten spawn item on Table 4 -->
      <g onclick="GainsShop.claimFoodCourtSpawn()" style="cursor:pointer">
        <circle cx="318" cy="438" r="11" fill="${spawn.item.color}" opacity=".22"/>
        <circle cx="318" cy="438" r="11" fill="none" stroke="${spawn.item.color}" stroke-width="1" opacity=".6">
          <animate attributeName="r" values="10;13;10" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".6;0;.6" dur="2s" repeatCount="indefinite"/>
        </circle>
        <rect x="313" y="429" width="10" height="16" rx="3" fill="${spawn.item.color}"/>
        <rect x="313" y="429" width="10" height="8" rx="2" fill="${spawn.item.color}88"/>
        <rect x="315" y="427" width="6" height="3" rx="1" fill="${spawn.item.color}bb"/>
        <text x="318" y="443" text-anchor="middle" font-size="4.5" fill="#fff" font-weight="700" font-family="sans-serif">½</text>
        <text x="318" y="452" text-anchor="middle" font-size="4" fill="${spawn.item.color}" font-weight="700" font-family="sans-serif">${spawn.item.label}</text>
      </g>` : spawn && spawn.claimed ? `
      <!-- Claimed item remnant (empty wrapper) -->
      <rect x="313" y="433" width="10" height="12" rx="2" fill="#4a3a2a" opacity=".5"/>
      <text x="318" y="451" text-anchor="middle" font-size="4" fill="#666" font-family="sans-serif">empty</text>` : ''}

      <!-- ── RIGHT SIDE: PLANTS, BENCH, TRASH (x=365–521) ── -->

      <!-- Mall Directory Kiosk (x=348, y=292) — 2× scale -->
      <rect x="348" y="292" width="80" height="95" rx="5" fill="#2a2018" stroke="#8a7040" stroke-width="2"/>
      <rect x="350" y="294" width="76" height="87" rx="4" fill="#1a1610"/>
      <rect x="352" y="296" width="72" height="52" rx="3" fill="#1a3028"/>
      <text x="388" y="316" text-anchor="middle" font-size="11" fill="#4aff88" font-family="monospace" font-weight="700">YOU</text>
      <text x="388" y="330" text-anchor="middle" font-size="10" fill="#4aff88" font-family="monospace">ARE</text>
      <text x="388" y="344" text-anchor="middle" font-size="10" fill="#ff4a4a" font-family="monospace">HERE ★</text>
      <text x="354" y="362" font-size="9" fill="#aaa080" font-family="sans-serif">↑ Gains Bodega</text>
      <text x="354" y="374" font-size="9" fill="#aaa080" font-family="sans-serif">↑ Iron Depot</text>
      <text x="354" y="381" font-size="9" fill="#aaa080" font-family="sans-serif">↑ Iron Canvas</text>
      <!-- Kiosk stand -->
      <rect x="383" y="387" width="10" height="22" rx="2" fill="#4a3a20"/>
      <rect x="371" y="407" width="34" height="6" rx="2" fill="#3a2a14"/>

      <!-- Large Ficus / Mall Tree (x=430, y=310) -->
      <!-- Planter pot -->
      <rect x="418" y="440" width="56" height="38" rx="5" fill="#5a4020"/>
      <rect x="420" y="442" width="52" height="34" rx="4" fill="#6a5028"/>
      <rect x="422" y="442" width="48" height="6"  rx="3" fill="#7a6030"/>
      <!-- Soil -->
      <ellipse cx="446" cy="445" rx="24" ry="6" fill="#3a2810"/>
      <!-- Trunk -->
      <rect x="441" y="340" width="10" height="106" rx="4" fill="#5a3818"/>
      <!-- Main branches -->
      <line x1="446" y1="380" x2="418" y2="340" stroke="#5a3818" stroke-width="5" stroke-linecap="round"/>
      <line x1="446" y1="370" x2="474" y2="335" stroke="#5a3818" stroke-width="4" stroke-linecap="round"/>
      <line x1="446" y1="360" x2="422" y2="315" stroke="#5a3818" stroke-width="3" stroke-linecap="round"/>
      <!-- Foliage clusters -->
      <circle cx="418" cy="332" r="22" fill="#2a5818"/>
      <circle cx="440" cy="318" r="20" fill="#306420"/>
      <circle cx="462" cy="327" r="18" fill="#286018"/>
      <circle cx="428" cy="310" r="16" fill="#348228"/>
      <circle cx="452" cy="312" r="15" fill="#2a6020"/>
      <circle cx="416" cy="315" r="13" fill="#306820"/>
      <!-- Highlight spots on leaves -->
      <circle cx="435" cy="312" r="6" fill="#40882a" opacity=".6"/>
      <circle cx="458" cy="322" r="5" fill="#388024" opacity=".5"/>
      <circle cx="420" cy="326" r="4" fill="#389024" opacity=".5"/>

      <!-- Smaller Potted Plant (x=365, y=420) -->
      <rect x="367" y="456" width="36" height="28" rx="4" fill="#4a3018"/>
      <rect x="369" y="458" width="32" height="24" rx="3" fill="#5a3820"/>
      <ellipse cx="385" cy="460" rx="16" ry="5" fill="#2a1a08"/>
      <!-- Plant stems -->
      <line x1="385" y1="458" x2="372" y2="435" stroke="#3a6818" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="385" y1="455" x2="392" y2="432" stroke="#3a6818" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="385" y1="453" x2="380" y2="425" stroke="#3a6818" stroke-width="2" stroke-linecap="round"/>
      <!-- Leaves -->
      <ellipse cx="369" cy="430" rx="10" ry="6" fill="#4a8820" transform="rotate(-30 369 430)"/>
      <ellipse cx="393" cy="427" rx="10" ry="6" fill="#408018" transform="rotate(25 393 427)"/>
      <ellipse cx="379" cy="421" rx="8"  ry="5" fill="#508a28" transform="rotate(-10 379 421)"/>

      <!-- Mall Bench (x=430, y=475) -->
      <!-- Bench back -->
      <rect x="420" y="474" width="90" height="8" rx="3" fill="#7a5828"/>
      <!-- Bench seat slats -->
      <rect x="420" y="483" width="90" height="5" rx="2" fill="#8a6832"/>
      <rect x="420" y="489" width="90" height="5" rx="2" fill="#8a6832"/>
      <rect x="420" y="495" width="90" height="5" rx="2" fill="#8a6832"/>
      <!-- Bench legs -->
      <rect x="427" y="499" width="6" height="14" rx="2" fill="#6a4a20"/>
      <rect x="497" y="499" width="6" height="14" rx="2" fill="#6a4a20"/>
      <rect x="459" y="499" width="6" height="14" rx="2" fill="#6a4a20"/>
      <!-- Person sitting on bench (simple silhouette) -->
      <circle cx="445" cy="474" r="7" fill="#b08878"/>
      <rect x="438" y="481" width="14" height="12" rx="3" fill="#3a5a8a"/>
      <rect x="436" y="483" width="4" height="9" rx="2" fill="#b08878"/>
      <rect x="452" y="483" width="4" height="9" rx="2" fill="#b08878"/>

      <!-- RICH PIANA — sitting on bench in food court, clickable for catchphrases -->
      ${(() => {
        const phrases = [
          "Whatever it takes!",
          "5%… that's all we are.",
          "I'm not doing this for girls. I'm doing this for ME.",
          "Bigger, better, stronger!",
          "It ain't normal, and it ain't supposed to be.",
          "You wanna be a massive dude? You gotta EAT.",
          "Train insane or remain the same.",
          "Big as possible, as fast as possible.",
        ];
        const daySeed = todayStr().split('').reduce((a,c) => a + c.charCodeAt(0), 0);
        const phrase = phrases[daySeed % phrases.length];
        return `<g onclick="this.querySelector('.rp-bubble').style.display=this.querySelector('.rp-bubble').style.display==='none'?'block':'none'" style="cursor:pointer">
          <!-- Seated body — tiny legs, massive upper body on bench -->
          <!-- Legs (seated, foreshortened) -->
          <rect x="455" y="490" width="14" height="16" rx="4" fill="#1a1820"/>
          <rect x="472" y="490" width="14" height="16" rx="4" fill="#1a1820"/>
          <!-- Shoes -->
          <ellipse cx="462" cy="506" rx="10" ry="5" fill="#f0f0f0"/>
          <ellipse cx="479" cy="506" rx="10" ry="5" fill="#f0f0f0"/>
          <rect x="453" y="503" width="18" height="4" rx="2" fill="#f8f8f8"/>
          <rect x="470" y="503" width="18" height="4" rx="2" fill="#f8f8f8"/>
          <rect x="453" y="505" width="18" height="2" rx="1" fill="#cc2200"/>
          <rect x="470" y="505" width="18" height="2" rx="1" fill="#cc2200"/>
          <!-- Fitted tank -->
          <rect x="452" y="468" width="37" height="26" rx="5" fill="#0e0c0e"/>
          <!-- Tank straps -->
          <rect x="456" y="462" width="8" height="10" rx="3" fill="#0e0c0e"/>
          <rect x="477" y="462" width="8" height="10" rx="3" fill="#0e0c0e"/>
          <!-- 5% on chest -->
          <text x="470" y="482" text-anchor="middle" font-size="7" fill="#cc2200" font-family="sans-serif" font-weight="900">5%</text>
          <!-- Massive shoulders -->
          <ellipse cx="444" cy="468" rx="18" ry="15" fill="#c8906a"/>
          <ellipse cx="497" cy="468" rx="18" ry="15" fill="#c8906a"/>
          <!-- Shoulder highlights -->
          <ellipse cx="440" cy="462" rx="7" ry="5" fill="#d8a07a" opacity=".4"/>
          <ellipse cx="501" cy="462" rx="7" ry="5" fill="#d8a07a" opacity=".4"/>
          <!-- Tribal tattoos on delts -->
          <path d="M430 462 Q436 455 442 461 Q437 469 432 471 Z" fill="#1e1008" opacity=".75"/>
          <path d="M428 472 Q434 465 440 470 Q436 479 430 479 Z" fill="#1e1008" opacity=".65"/>
          <path d="M435 453 Q441 447 446 455 Q441 462 436 462 Z" fill="#1e1008" opacity=".6"/>
          <path d="M508 462 Q502 455 496 461 Q501 469 506 471 Z" fill="#1e1008" opacity=".75"/>
          <path d="M510 472 Q504 465 498 470 Q502 479 508 479 Z" fill="#1e1008" opacity=".65"/>
          <path d="M503 453 Q497 447 492 455 Q497 462 502 462 Z" fill="#1e1008" opacity=".6"/>
          <!-- Neck -->
          <rect x="461" y="448" width="18" height="18" rx="7" fill="#c8906a"/>
          <!-- Head -->
          <ellipse cx="470" cy="436" rx="22" ry="20" fill="#d09870"/>
          <!-- Short hair under hat -->
          <path d="M448 438 Q450 420 470 415 Q490 420 492 438" fill="#1a1008"/>
          <!-- Ears -->
          <ellipse cx="448" cy="437" rx="5" ry="6" fill="#c88860"/>
          <ellipse cx="492" cy="437" rx="5" ry="6" fill="#c88860"/>
          <!-- Flat brim hat -->
          <rect x="446" y="417" width="48" height="5" rx="2" fill="#0a0808"/>
          <rect x="446" y="419" width="48" height="3" rx="1" fill="#aa1800"/>
          <rect x="452" y="400" width="36" height="19" rx="3" fill="#0e0c0c"/>
          <line x1="470" y1="402" x2="470" y2="418" stroke="#1e1a1a" stroke-width="1.5"/>
          <rect x="458" y="406" width="24" height="10" rx="2" fill="#cc2200" opacity=".9"/>
          <text x="470" y="414" text-anchor="middle" font-size="6" fill="#fff" font-family="sans-serif" font-weight="900">5%</text>
          <!-- Eyes -->
          <ellipse cx="462" cy="432" rx="6" ry="6" fill="#fff"/>
          <ellipse cx="478" cy="432" rx="6" ry="6" fill="#fff"/>
          <ellipse cx="463" cy="433" rx="3.5" ry="4" fill="#3a2010"/>
          <ellipse cx="479" cy="433" rx="3.5" ry="4" fill="#3a2010"/>
          <ellipse cx="464" cy="432" rx="1.5" ry="2" fill="#0a0806"/>
          <ellipse cx="480" cy="432" rx="1.5" ry="2" fill="#0a0806"/>
          <!-- Eyebrows -->
          <path d="M456 425 Q462 421 468 424" stroke="#5a3818" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M472 424 Q478 421 484 425" stroke="#5a3818" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- Nose -->
          <ellipse cx="470" cy="440" rx="3.5" ry="3" fill="#b87858"/>
          <!-- Smirk -->
          <path d="M462 447 Q470 452 478 447" stroke="#a06848" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- Arms resting -->
          <ellipse cx="444" cy="486" rx="14" ry="9" fill="#c8906a"/>
          <ellipse cx="497" cy="486" rx="14" ry="9" fill="#c8906a"/>
          <!-- Speech bubble (hidden by default, toggle on click) -->
          ${(() => {
            const words = ('"' + phrase + '"').split(' ');
            const lines = []; let cur = '';
            for (const w of words) {
              if ((cur + ' ' + w).trim().length > 22) { if (cur) lines.push(cur.trim()); cur = w; }
              else cur = (cur + ' ' + w).trim();
            }
            if (cur) lines.push(cur.trim());
            const bW = 210, bH = lines.length * 16 + 30, bX = 360, bY = 315;
            const cx = bX + bW / 2;
            const totalH = bH + 22;
            return `<g class="rp-bubble" style="display:none">
              <rect x="${bX}" y="${bY}" width="${bW}" height="${totalH}" rx="10" fill="#1e1c18" stroke="#ffd700" stroke-width="2"/>
              <polygon points="${cx-8},${bY+totalH} ${cx},${bY+totalH+18} ${cx+8},${bY+totalH}" fill="#1e1c18"/>
              <text x="${cx}" y="${bY+14}" text-anchor="middle" font-size="8" fill="#c8a050" font-family="sans-serif" font-weight="700" letter-spacing="1">✨ QUOTE OF THE DAY</text>
              <line x1="${bX+10}" y1="${bY+18}" x2="${bX+bW-10}" y2="${bY+18}" stroke="#3a3020" stroke-width="1"/>
              ${lines.map((l,i) => `<text x="${cx}" y="${bY+32+i*16}" text-anchor="middle" font-size="11" fill="#ffd700" font-family="sans-serif" font-style="italic" font-weight="700">${l}</text>`).join('')}
              <text x="${cx}" y="${bY+totalH-8}" text-anchor="middle" font-size="9" fill="#c8a050" font-family="sans-serif" font-style="italic">— Rich Piana</text>
            </g>`;
          })()}
        </g>`;
      })()}

      <!-- Trash Can (bottom-left corner) -->
      <rect x="18" y="462" width="22" height="36" rx="3" fill="#2a2820"/>
      <rect x="19" y="464" width="20" height="32" rx="2" fill="#343230"/>
      <!-- Lid -->
      <rect x="16" y="457" width="26" height="7" rx="3" fill="#1e1c18"/>
      <rect x="18" y="458" width="22" height="5" rx="2" fill="#2a2824"/>
      <!-- Recycle symbol -->
      <text x="29" y="486" text-anchor="middle" font-size="10" fill="#5a6a4a" opacity=".7">♻</text>
      <!-- Small bag sticking out top -->
      <path d="M25 459 Q29 452 33 459" stroke="#8a8070" stroke-width="2" fill="none" stroke-linecap="round"/>

      <!-- Dropped Cup on floor (small litter detail) -->
      <ellipse cx="206" cy="410" rx="4" ry="2" fill="#d0e8f0" opacity=".6"/>
      <rect x="203" y="404" width="6" height="8" rx="1" fill="#d0e8f0" opacity=".5" transform="rotate(25 206 408)"/>

      <!-- Wet Floor Sign near food court -->
      <polygon points="278,478 284,508 272,508" fill="#f0c000"/>
      <rect x="277" y="478" width="2" height="3" fill="#d0a800"/>
      <text x="278" y="504" text-anchor="middle" font-size="4" fill="#6a5000" font-weight="700" transform="rotate(0)">!</text>

    </svg>
    <p class="mall-tap-hint">Tap a store to enter</p>
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
        return `<div class="store-item ${active ? 'item-active' : ''}" onclick="GainsShop.confirmBuy(this,'buyItem','${item.id}')">
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
        return `<div class="store-item ${active ? 'item-active' : ''}" onclick="GainsShop.confirmBuy(this,'buyItem','${item.id}')">
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
              return `<div class="store-item fridge-item ${active ? 'item-active' : ''}" onclick="GainsShop.confirmBuy(this,'buyItem','${item.id}')">
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
    return `<div class="store-item boutique-hanger${owned?' item-active':''}" style="opacity:${!owned&&!canBuy?'0.55':'1'}">
      ${renderHanger(item, owned)}
      <div class="store-tip">
        <span class="tip-name">${item.name}</span>
        <span class="tip-buff">${item.desc}</span>
        <span class="tip-dur">${item.type} · <i class="ti ti-coin"></i>${item.cost}g</span>
        ${owned?'<span class="tip-on">✓ OWNED</span>':canBuy?`<button class="tip-buy" onclick="GainsShop.confirmBuy(this,'buyClothing','${item.id}')">Buy ${item.cost}g</button>`:'<span class="tip-dur" style="color:#f44">Need more gold</span>'}
      </div>
    </div>`;
  }
  function shelfItem(item) {
    const owned = purchased.includes(item.id);
    const canBuy = !owned && gold >= item.cost;
    return `<div class="store-item boutique-shelf-item${owned?' item-active':''}" style="opacity:${!owned&&!canBuy?'0.55':'1'}">
      ${renderHanger(item, owned)}
      <div class="store-tip">
        <span class="tip-name">${item.name}</span>
        <span class="tip-buff">${item.desc}</span>
        <span class="tip-dur">${item.type} · <i class="ti ti-coin"></i>${item.cost}g</span>
        ${owned?'<span class="tip-on">✓ OWNED</span>':canBuy?`<button class="tip-buy" onclick="GainsShop.confirmBuy(this,'buyClothing','${item.id}')">Buy ${item.cost}g</button>`:'<span class="tip-dur" style="color:#f44">Need more gold</span>'}
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
        style="position:relative;${dimStyle}">
      ${renderDepotItem(item, owned)}
      <div class="wh-item-lbl">${item.name}</div>
      <div class="wh-price-tag${owned?' wh-price-owned':''}">${owned?'✓':item.cost+'g'}</div>
      <div class="store-tip wh-tip">
        <span class="tip-name">${item.name}</span>
        <span class="tip-buff">${item.bonus}</span>
        <span class="tip-dur">${item.cat} · <i class="ti ti-coin"></i>${item.cost}g</span>
        ${owned?'<span class="tip-on">✓ INSTALLED IN YOUR GYM</span>':canBuy?`<button class="tip-buy" onclick="GainsShop.confirmBuy(this,'buyEquipment','${item.id}')">Install for ${item.cost}g</button>`:'<span class="tip-dur" style="color:#f66">Need more gold</span>'}
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
    previewEl.innerHTML = MQ.renderMiniAvatarSVG(gender, cosmetics, 0, s.name || 'You', style.id, s.skinTone ?? 1, s.hairColor ?? 0);
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

  <!-- Hair Color Swatches -->
  <div class="barber-hair-colors">
    <span class="barber-hair-label">Hair Color</span>
    <div class="barber-hair-swatches" id="hair-color-swatches">
      ${(typeof HAIR_COLORS !== 'undefined' ? HAIR_COLORS : [
        {name:'Brown',c1:'#4a3728'},{name:'Black',c1:'#1a1a1a'},
        {name:'Blonde',c1:'#c8a84b'},{name:'Grey',c1:'#9a9a9a'},{name:'Red',c1:'#8b2500'}
      ]).map((hc, i) => {
        const s = getState();
        const active = (s.hairColor ?? 0) === i;
        return `<button class="hair-swatch${active ? ' hair-swatch-active' : ''}" style="background:${hc.c1}" title="${hc.name}" onclick="MQ.setHairColor(${i});document.querySelectorAll('.hair-swatch').forEach((el,j)=>el.classList.toggle('hair-swatch-active',j===${i}))"></button>`;
      }).join('')}
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

// ── PERSONAL TRAINER ──
const TRAINERS = [
  {
    id: 'mentzer', name: 'Mike Mentzer', years: '1951–2001', title: 'The HIT Prophet',
    icon: '💀', gym_action: 'doing one perfect rep',
    color: '#ff4444', glow: '#ff444444',
    style: 'High Intensity Training (HIT)',
    tagline: '"One set to absolute failure is all you need."',
    principles: [
      'Train to <strong>absolute muscular failure</strong> — if you can do another rep, you\'re not done',
      '<strong>One working set per exercise</strong>, maximum intensity, no junk volume',
      'Rest <strong>5–7 days</strong> between sessions — growth happens during recovery, not in the gym',
      'Progression is everything: add weight or reps every single session',
      'Overtraining is the #1 enemy — less is more when intensity is maxed',
    ],
    split: [
      { day: 'Day 1 — Chest & Back', exercises: ['Incline DB Press × 1 set to failure', 'Dips × 1 set to failure', 'Pulldowns × 1 set to failure', 'Barbell Rows × 1 set to failure'] },
      { day: 'Day 2 — Rest 2–3 days', exercises: ['Complete recovery — no cardio, no activity'] },
      { day: 'Day 3 — Legs', exercises: ['Leg Press × 1 set to failure', 'Squats × 1 set to failure', 'Leg Curl × 1 set to failure', 'Calf Raises × 1 set to failure'] },
      { day: 'Day 4 — Rest 2–3 days', exercises: ['Growth occurs during this window'] },
      { day: 'Day 5 — Shoulders & Arms', exercises: ['Lateral Raises × 1 set', 'Overhead Press × 1 set', 'Barbell Curls × 1 set', 'Tricep Pushdowns × 1 set'] },
    ],
    splitDays: [
      { label: 'Chest & Back',    muscles: ['chest','back'] },
      { label: 'Rest',            muscles: [] },
      { label: 'Rest',            muscles: [] },
      { label: 'Legs',            muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Rest',            muscles: [] },
      { label: 'Rest',            muscles: [] },
      { label: 'Shoulders & Arms', muscles: ['shoulders','biceps','triceps'] },
    ],
    outcome: 'Maximum muscle density with minimum time. Built for people who train hard and recover fully.',
  },
  {
    id: 'arnold', name: 'Arnold Schwarzenegger', years: '1947–present', title: 'The Austrian Oak',
    icon: '🏆', gym_action: 'doing cable crossovers',
    color: '#ffd700', glow: '#ffd70044',
    style: 'High Volume Golden Era',
    tagline: '"The last three or four reps is what makes the muscle grow."',
    principles: [
      '<strong>High volume</strong>: 20–30 sets per muscle group per week builds mass and shape',
      'Train each muscle <strong>twice per week</strong> — frequency drives hypertrophy',
      'The <strong>mind-muscle connection</strong> is real — visualize the muscle working every rep',
      'Use <strong>supersets and giant sets</strong> to increase intensity and pump',
      'Pump is critical — chasing the pump signals growth and keeps the muscle engorged with nutrients',
    ],
    split: [
      { day: 'Monday & Thursday — Chest & Back', exercises: ['Bench Press 5×10', 'Incline DB Press 5×10', 'Pullovers 5×10', 'Wide-Grip Pullups 6×failure', 'T-Bar Rows 5×10', 'Seated Cable Rows 6×10'] },
      { day: 'Tuesday & Friday — Shoulders & Arms', exercises: ['BB Overhead Press 6×10', 'Lateral Raises 6×10', 'Barbell Curl 6×10', 'Incline DB Curl 6×10', 'Skull Crushers 6×10', 'Tricep Pushdowns 6×10'] },
      { day: 'Wednesday & Saturday — Legs', exercises: ['Squats 6×10', 'Leg Press 6×10', 'Leg Extensions 6×15', 'Leg Curls 6×10', 'Standing Calf Raises 10×10'] },
      { day: 'Sunday — Rest', exercises: ['Active recovery, posing practice'] },
    ],
    splitDays: [
      { label: 'Chest & Back',    muscles: ['chest','back'] },
      { label: 'Shoulders & Arms', muscles: ['shoulders','biceps','triceps'] },
      { label: 'Legs',            muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Chest & Back',    muscles: ['chest','back'] },
      { label: 'Shoulders & Arms', muscles: ['shoulders','biceps','triceps'] },
      { label: 'Legs',            muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Rest',            muscles: [] },
    ],
    outcome: 'Maximum size and aesthetics. The classic physique approach — built for stage and for life.',
  },
  {
    id: 'ronnie', name: 'Ronnie Coleman', years: '1964–present', title: '8× Mr. Olympia',
    icon: '👑', gym_action: 'squatting 800 lbs',
    color: '#9e7cff', glow: '#9e7cff44',
    style: 'Power Bodybuilding',
    tagline: '"Everybody wants to be a bodybuilder but nobody wants to lift no heavy-ass weights."',
    principles: [
      '<strong>Powerlifting + bodybuilding</strong> combined — heavy compound lifts build the foundation',
      'Train with <strong>near-maximal weights</strong> in moderate rep ranges (8–12)',
      '<strong>Volume is king</strong>: 4–5 exercises per muscle, 4 sets each, never skip a muscle',
      'Consistency over 20+ years builds the ultimate physique — there are no shortcuts',
      'Eat massive — Coleman consumed 5,000–6,000 calories daily to fuel his size',
    ],
    split: [
      { day: 'Monday — Back', exercises: ['BB Rows 4×12 (heavy)', 'Deadlifts 4×10', 'T-Bar Rows 4×12', 'Pulldowns 4×12', 'Seated Cable Rows 4×12'] },
      { day: 'Tuesday — Chest & Triceps', exercises: ['Flat BB Bench 4×12 (heavy)', 'Incline BB Bench 4×10', 'DB Flyes 4×12', 'Dips 4×failure', 'Pushdowns 4×15'] },
      { day: 'Wednesday — Legs', exercises: ['Squats 4×10 (very heavy)', 'Leg Press 4×20', 'Leg Extensions 4×20', 'Leg Curls 4×12', 'Standing Calves 4×20'] },
      { day: 'Thursday — Shoulders & Biceps', exercises: ['BB Press 4×12', 'Lateral Raises 4×15', 'Rear Delt Flyes 4×15', 'BB Curls 4×12', 'Hammer Curls 4×12'] },
      { day: 'Friday — Repeat cycle', exercises: ['Same split, heavier weights'] },
    ],
    splitDays: [
      { label: 'Back',               muscles: ['back'] },
      { label: 'Chest & Triceps',    muscles: ['chest','triceps'] },
      { label: 'Legs',               muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Shoulders & Biceps', muscles: ['shoulders','biceps'] },
      { label: 'Back',               muscles: ['back'] },
      { label: 'Chest & Triceps',    muscles: ['chest','triceps'] },
      { label: 'Rest',               muscles: [] },
    ],
    outcome: 'The biggest physique in bodybuilding history. Power + volume = unmatched mass.',
  },
  {
    id: 'cbum', name: 'Chris Bumstead', years: '1994–present', title: '5× Classic Physique Champion',
    icon: '✨', gym_action: 'doing incline curls',
    color: '#00cfff', glow: '#00cfff44',
    style: 'Modern Classic Physique',
    tagline: '"Train smart. Look aesthetic. Live balanced."',
    principles: [
      '<strong>Classic proportions over raw mass</strong> — V-taper, small waist, full chest and shoulders',
      'Progressive overload within <strong>moderate volume</strong> (15–20 sets per muscle weekly)',
      'Prioritize <strong>shoulder width and lat spread</strong> — the X-frame is everything in Classic',
      '<strong>Lagging muscle priority</strong>: train your weakest body part first and most frequently',
      'Recovery and sleep are training — CBum treats rest as seriously as his sessions',
    ],
    split: [
      { day: 'Monday — Back', exercises: ['Weighted Pull-Ups 4×8', 'BB Rows 4×10', 'Single-Arm DB Rows 4×12', 'Cable Pulldowns 3×12', 'Face Pulls 3×15'] },
      { day: 'Tuesday — Chest & Biceps', exercises: ['Incline BB Press 4×10', 'Flat DB Press 4×10', 'Cable Crossovers 3×15', 'Incline DB Curls 4×10', 'Hammer Curls 3×12'] },
      { day: 'Wednesday — Legs', exercises: ['Squats 4×10', 'Leg Press 4×12', 'Romanian Deadlifts 4×10', 'Leg Curls 4×12', 'Leg Extensions 3×15'] },
      { day: 'Thursday — Shoulders & Triceps', exercises: ['DB Shoulder Press 4×10', 'Lateral Raises 5×15', 'Cable Lateral Raises 3×20', 'Skull Crushers 4×10', 'Rope Pushdowns 3×15'] },
      { day: 'Friday — Arms & Weak Points', exercises: ['Preacher Curls 4×10', 'Cable Curls 4×12', 'Overhead Tricep Extension 4×10', 'Dips 3×12', 'Any lagging muscle work'] },
    ],
    splitDays: [
      { label: 'Back',               muscles: ['back'] },
      { label: 'Chest & Biceps',     muscles: ['chest','biceps'] },
      { label: 'Legs',               muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Shoulders & Tri',    muscles: ['shoulders','triceps'] },
      { label: 'Arms',               muscles: ['biceps','triceps'] },
      { label: 'Rest',               muscles: [] },
      { label: 'Rest',               muscles: [] },
    ],
    outcome: 'The ideal aesthetic physique. Proportional, symmetrical, and built to last.',
  },
  {
    id: 'dorian', name: 'Dorian Yates', years: '1962–present', title: 'The Shadow',
    icon: '🦅', gym_action: 'doing heavy cable rows',
    color: '#888888', glow: '#88888844',
    style: 'Blood & Guts — Modified HIT',
    tagline: '"Champions aren\'t built in gyms. They are built from something they have deep inside."',
    principles: [
      '<strong>One working set</strong> after warm-ups — taken to absolute failure then two forced reps',
      '<strong>4 days per week</strong> maximum — the other 3 days are non-negotiable recovery',
      'Heavy weights, strict form, <strong>full range of motion</strong> — ego lifting builds nothing',
      'The <strong>warm-up sets build skill</strong>, the working set builds muscle — never confuse the two',
      'Track everything: weight, reps, rest periods — what gets measured gets improved',
    ],
    split: [
      { day: 'Monday — Chest & Biceps', exercises: ['Incline Smith Press × 1 working set', 'Hammer Strength Chest Press × 1 set', 'Cable Crossovers × 1 set', 'BB Curl × 1 set', 'Incline DB Curl × 1 set'] },
      { day: 'Tuesday — Legs', exercises: ['Leg Extensions × 1 set (warm-up)', 'Squats × 1 working set', 'Leg Press × 1 set', 'Leg Curls × 1 set', 'Stiff-Leg Deadlift × 1 set'] },
      { day: 'Thursday — Shoulders & Triceps', exercises: ['Rear Delt Machine × 1 set', 'DB Side Laterals × 1 set', 'Smith Press × 1 set', 'Pushdowns × 1 set', 'EZ-Bar Skullcrushers × 1 set'] },
      { day: 'Friday — Back', exercises: ['Pulldowns × 1 set', 'Hammer Strength Rows × 1 set', 'BB Rows (underhand) × 1 set', 'Deadlifts × 1 working set'] },
    ],
    splitDays: [
      { label: 'Chest & Biceps',     muscles: ['chest','biceps'] },
      { label: 'Legs',               muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Rest',               muscles: [] },
      { label: 'Shoulders & Tri',    muscles: ['shoulders','triceps'] },
      { label: 'Back',               muscles: ['back'] },
      { label: 'Rest',               muscles: [] },
      { label: 'Rest',               muscles: [] },
    ],
    outcome: 'Dense, grainy, freaky muscle. The most efficient path to professional-level mass.',
  },
  {
    id: 'louie', name: 'Louie Simmons', years: '1947–2022', title: 'The Powerlifting Genius',
    icon: '⚡', gym_action: 'coaching a box squat',
    color: '#ff8800', glow: '#ff880044',
    style: 'Westside Conjugate Method',
    tagline: '"Special exercises make special athletes."',
    principles: [
      '<strong>Conjugate periodization</strong>: train max effort and dynamic effort in the same week, year-round',
      '<strong>Max Effort Day</strong>: work up to a true 1–3 rep max on a main lift variation — rotate every 2–3 weeks',
      '<strong>Dynamic Effort Day</strong>: 8–12 sets × 2–3 reps at 50–70% with <em>maximal speed</em> — trains rate of force development',
      '<strong>Special exercises</strong> (GHD, reverse hypers, band pull-aparts) fix weak points and keep the CNS fresh',
      'Accommodating resistance (bands & chains) overloads the full range of motion — physics applied to strength',
    ],
    split: [
      { day: 'Monday — Max Effort Lower', exercises: ['Main: work to 1–3RM (rotate: box squat, safety bar squat, deadlift variation)', 'Accessory: GHD Sit-Ups 4×15', 'Accessory: Reverse Hypers 4×15', 'Accessory: Weighted Back Extensions 4×10'] },
      { day: 'Wednesday — Max Effort Upper', exercises: ['Main: work to 1–3RM (rotate: floor press, board press, close-grip bench)', 'Accessory: DB Rows 5×10', 'Accessory: Face Pulls 4×20', 'Accessory: Tricep Work 4×15'] },
      { day: 'Friday — Dynamic Effort Lower', exercises: ['Box Squats: 12×2 @ 50–60% + bands/chains', 'Deadlifts: 8×1 @ 60–70% alternating stances', 'GHD / Reverse Hypers / Belt Squats'] },
      { day: 'Saturday — Dynamic Effort Upper', exercises: ['Bench Press: 9×3 @ 50–60% + bands/chains (max speed)', 'Rows: 5×10', 'Shoulder Health work: face pulls, band pull-aparts 100 reps'] },
    ],
    splitDays: [
      { label: 'Max Effort Lower',   muscles: ['quads','hamstrings','glutes'] },
      { label: 'Rest',               muscles: [] },
      { label: 'Max Effort Upper',   muscles: ['chest','back','shoulders','triceps'] },
      { label: 'Rest',               muscles: [] },
      { label: 'Dynamic Lower',      muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Dynamic Upper',      muscles: ['chest','back','shoulders','biceps','triceps'] },
      { label: 'Rest',               muscles: [] },
    ],
    outcome: 'Elite strength that never plateaus. The system that built more world-record holders than any other program.',
  },
  {
    id: 'whitechocolate', name: 'Whitechocolate', years: '2020–present', title: 'The Playground Legend',
    icon: '⭐', gym_action: 'hitting a T-pose on the gym floor',
    color: '#3a8fff', glow: '#3a8fff44',
    style: 'Street Athletics',
    tagline: '"Show up, show out, show everyone what\'s possible."',
    principles: [
      '<strong>Train like an athlete</strong>: explosiveness, mobility, and strength work together — build a body that performs, not just poses',
      '<strong>Master bodyweight first</strong>: pull-ups, dips, push-up variations, and pistol squats before you chase heavy barbell numbers',
      '<strong>The playground is your gym</strong>: train anywhere, anytime — no excuses, no equipment required',
      '<strong>Consistency beats intensity</strong>: showing up 5 days a week at 70% effort beats hitting it hard twice and burning out',
      '<strong>Have fun with it</strong>: if you dread going in, change what you\'re doing — your best gains come when you love the process',
    ],
    split: [
      { day: 'Monday — Upper Power', exercises: ['Bench Press 4×5', 'Pull-Ups 4×8', 'Military Press 3×6', 'Barbell Row 4×5', 'Dips 3×10'] },
      { day: 'Tuesday — Lower Power', exercises: ['Squat 4×5', 'Romanian Deadlift 3×8', 'Bulgarian Split Squat 3×8 each', 'Calf Raises 4×15', 'Core Finisher'] },
      { day: 'Wednesday — Active Recovery', exercises: ['30 min Zone-2 Cardio (run/bike)', 'Mobility Flow 20 min', 'Band Pull-Aparts 3×20', 'Hanging Stretches'] },
      { day: 'Thursday — Upper Hypertrophy', exercises: ['Incline DB Press 4×10', 'Cable Rows 4×12', 'Lateral Raises 4×15', 'Hammer Curls 3×12', 'Tricep Pushdowns 3×15'] },
      { day: 'Friday — Lower Hypertrophy', exercises: ['Leg Press 4×12', 'Walking Lunges 3×12 each', 'Leg Curl 4×12', 'Leg Extension 3×15', 'Seated Calf 4×20'] },
      { day: 'Saturday — Full Body Athletics', exercises: ['Box Jumps 4×5', 'Farmer Carries 3×40m', 'Ring Push-Ups 3×12', 'Kettlebell Swings 4×15', 'Sprint Intervals 6×50m'] },
      { day: 'Sunday — Rest', exercises: ['Full Rest — eat, sleep, recover'] },
    ],
    splitDays: [
      { label: 'Upper Power',         muscles: ['chest','back','shoulders','triceps','biceps'] },
      { label: 'Lower Power',         muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Active Recovery',     muscles: [] },
      { label: 'Upper Hypertrophy',   muscles: ['chest','back','shoulders','biceps','triceps'] },
      { label: 'Lower Hypertrophy',   muscles: ['quads','hamstrings','glutes','calves'] },
      { label: 'Full Body Athletics', muscles: ['chest','back','quads','hamstrings','shoulders','calves'] },
      { label: 'Rest',                muscles: [] },
    ],
    outcome: 'An athletic physique that actually works — strong, mobile, explosive, and built to last on any court, field, or platform.',
  },
];

let _activeTrainer = null;

function openTrainer() {
  const container = document.getElementById('store-container');
  if (!container) return;
  _activeTrainer = null;
  container.innerHTML = renderTrainerLobby();
}

function renderTrainerLobby() {
  return `<div class="trainer-lobby">
    <div class="store-back-bar">
      <button class="store-back-btn" onclick="GainsShop.render()">← Mall</button>
      <span class="store-back-title">Personal Trainer</span>
    </div>
    <div class="trainer-header">
      <h2 class="trainer-headline">Train Like a Legend</h2>
      <p class="trainer-subhead">Tap a legend to unlock their program.</p>
    </div>

    <div class="trainer-scene-wrap">
      <svg viewBox="0 0 380 300" xmlns="http://www.w3.org/2000/svg" class="trainer-gym-svg">

        <!-- ═══ BACKGROUND WALL ═══ -->
        <rect width="380" height="300" fill="#1a0e04"/>
        <rect width="380" height="125" fill="#150a02"/>

        <!-- Ceiling strip lights -->
        <rect x="0" y="0" width="380" height="4" fill="#2a1a08"/>
        <rect x="44" y="1" width="30" height="4" rx="2" fill="#ffdd88" opacity=".38"/>
        <ellipse cx="59" cy="6" rx="32" ry="6" fill="#ffdd88" opacity=".07"/>
        <rect x="173" y="1" width="30" height="4" rx="2" fill="#ffdd88" opacity=".38"/>
        <ellipse cx="188" cy="6" rx="32" ry="6" fill="#ffdd88" opacity=".07"/>
        <rect x="304" y="1" width="30" height="4" rx="2" fill="#ffdd88" opacity=".38"/>
        <ellipse cx="319" cy="6" rx="32" ry="6" fill="#ffdd88" opacity=".07"/>

        <!-- HIT poster far-left -->
        <rect x="3" y="9" width="44" height="66" rx="2" fill="#0a0300" stroke="#2a0800" stroke-width="1"/>
        <rect x="5" y="11" width="40" height="44" rx="1" fill="#110400"/>
        <text x="25" y="28" text-anchor="middle" font-size="6.5" fill="#ff4444" font-weight="700" font-family="sans-serif">H.I.T.</text>
        <text x="25" y="37" text-anchor="middle" font-size="4.5" fill="#882222" font-family="sans-serif">ONE SET.</text>
        <text x="25" y="45" text-anchor="middle" font-size="4.5" fill="#882222" font-family="sans-serif">ALL OUT.</text>
        <text x="25" y="52" text-anchor="middle" font-size="4" fill="#551111" font-family="sans-serif">NO EXCUSES.</text>
        <rect x="3" y="9" width="44" height="66" rx="2" fill="none" stroke="#ff444420" stroke-width="3"/>

        <!-- Volume poster far-right -->
        <rect x="333" y="9" width="44" height="66" rx="2" fill="#0d0500" stroke="#3a1a00" stroke-width="1"/>
        <text x="355" y="31" text-anchor="middle" font-size="5.5" fill="#ffd700" font-weight="700" font-family="sans-serif">VOLUME</text>
        <text x="355" y="40" text-anchor="middle" font-size="4.5" fill="#aa8820" font-family="sans-serif">IS THE</text>
        <text x="355" y="49" text-anchor="middle" font-size="4.5" fill="#aa8820" font-family="sans-serif">ANSWER</text>

        <!-- Center banner -->
        <rect x="124" y="10" width="132" height="20" rx="3" fill="#1a0800"/>
        <rect x="125" y="11" width="130" height="18" rx="2" fill="none" stroke="#6a3a00" stroke-width="1"/>
        <text x="190" y="24" text-anchor="middle" font-size="7.5" fill="#c87020" letter-spacing="3" font-weight="700" font-family="sans-serif">THE IRON TEMPLE</text>

        <!-- Back center mirror -->
        <rect x="116" y="34" width="148" height="80" rx="3" fill="#c8d8e8" opacity=".1" stroke="#4a3a2a" stroke-width="2"/>
        <rect x="120" y="37" width="14" height="72" rx="3" fill="#fff" opacity=".04"/>

        <!-- Clock on wall -->
        <circle cx="358" cy="74" r="10" fill="#111" stroke="#3a2a1a" stroke-width="1.5"/>
        <circle cx="358" cy="74" r="1.5" fill="#666"/>
        <line x1="358" y1="74" x2="358" y2="67" stroke="#666" stroke-width="1"/>
        <line x1="358" y1="74" x2="364" y2="74" stroke="#444" stroke-width="1"/>

        <!-- ═══ FLOOR ═══ -->
        <rect x="0" y="220" width="380" height="80" fill="#251400"/>
        <line x1="0" y1="220" x2="380" y2="220" stroke="#3a2000" stroke-width="2"/>
        <line x1="0" y1="242" x2="380" y2="242" stroke="#1e1000" stroke-width=".8"/>
        <line x1="0" y1="261" x2="380" y2="261" stroke="#1e1000" stroke-width=".6"/>
        <line x1="0" y1="277" x2="380" y2="277" stroke="#1e1000" stroke-width=".5"/>
        <line x1="48" y1="220" x2="48" y2="300" stroke="#1e1000" stroke-width=".5"/>
        <line x1="96" y1="220" x2="96" y2="300" stroke="#1e1000" stroke-width=".5"/>
        <line x1="144" y1="220" x2="144" y2="300" stroke="#1e1000" stroke-width=".5"/>
        <line x1="192" y1="220" x2="192" y2="300" stroke="#1e1000" stroke-width=".5"/>
        <line x1="240" y1="220" x2="240" y2="300" stroke="#1e1000" stroke-width=".5"/>
        <line x1="288" y1="220" x2="288" y2="300" stroke="#1e1000" stroke-width=".5"/>
        <line x1="336" y1="220" x2="336" y2="300" stroke="#1e1000" stroke-width=".5"/>

        <!-- ═══ UNUSED EQUIPMENT ═══ -->
        <!-- Empty flat bench center -->
        <rect x="182" y="212" width="66" height="9" rx="3" fill="#1a0a00" stroke="#3a1a00" stroke-width="1.2"/>
        <rect x="191" y="221" width="5" height="17" rx="2" fill="#110800"/>
        <rect x="238" y="221" width="5" height="17" rx="2" fill="#110800"/>
        <ellipse cx="178" cy="222" rx="8" ry="3" fill="#ffffff06"/>

        <!-- Foam roller -->
        <ellipse cx="234" cy="225" rx="14" ry="5" fill="#2d2d2d" stroke="#383838" stroke-width="1"/>
        <ellipse cx="234" cy="223" rx="5" ry="5" fill="#252525"/>

        <!-- Kettlebells floor left -->
        <circle cx="56" cy="218" r="7" fill="#222" stroke="#2a2a2a" stroke-width="1"/>
        <rect x="53" y="210" width="6" height="4" rx="2" fill="none" stroke="#333" stroke-width="1.8"/>
        <circle cx="72" cy="219" r="5" fill="#1a1a1a"/>
        <rect x="69.5" y="213" width="5" height="3" rx="2" fill="none" stroke="#252525" stroke-width="1.5"/>

        <!-- Stray dumbbells -->
        <ellipse cx="162" cy="218" rx="8" ry="3.5" fill="#252525"/>
        <rect x="157" y="215" width="9" height="6" fill="#2d2d2d" rx="1"/>
        <ellipse cx="174" cy="218" rx="8" ry="3.5" fill="#252525"/>

        <!-- Weight plates leaning on right wall -->
        <ellipse cx="344" cy="136" rx="11" ry="13" fill="none" stroke="#550000" stroke-width="7"/>
        <ellipse cx="344" cy="136" rx="3" ry="3" fill="#3a3a3a"/>
        <ellipse cx="357" cy="139" rx="9" ry="11" fill="none" stroke="#333" stroke-width="5.5"/>
        <ellipse cx="369" cy="142" rx="7" ry="9" fill="none" stroke="#3a3a3a" stroke-width="4.5"/>

        <!-- Dumbbell rack background -->
        <rect x="78" y="112" width="58" height="32" rx="2" fill="#191919" stroke="#222" stroke-width="1"/>
        <rect x="80" y="114" width="54" height="7" rx="1" fill="#212121"/>
        <rect x="80" y="124" width="54" height="7" rx="1" fill="#212121"/>
        <rect x="80" y="134" width="54" height="7" rx="1" fill="#212121"/>
        <ellipse cx="88" cy="117" rx="5" ry="2.5" fill="#333"/>
        <rect x="86" y="114" width="4" height="5" fill="#3a3a3a" rx="1"/>
        <ellipse cx="96" cy="117" rx="5" ry="2.5" fill="#333"/>
        <ellipse cx="108" cy="117" rx="6" ry="3" fill="#2a2a2a"/>
        <rect x="106" y="114" width="5" height="6" fill="#323232" rx="1"/>
        <ellipse cx="118" cy="117" rx="6" ry="3" fill="#2a2a2a"/>
        <ellipse cx="88" cy="127" rx="5" ry="2.5" fill="#2a2a2a"/>
        <rect x="86" y="124" width="5" height="5" fill="#323232" rx="1"/>
        <ellipse cx="97" cy="127" rx="5" ry="2.5" fill="#2a2a2a"/>

        <!-- Water fountain -->
        <rect x="360" y="128" width="17" height="28" rx="3" fill="#1a2a3a" stroke="#2a3a4a" stroke-width="1"/>
        <rect x="362" y="130" width="13" height="10" rx="2" fill="#0d1a28"/>
        <ellipse cx="368" cy="143" rx="7" ry="3.5" fill="#0d1a28" stroke="#2a3a4a" stroke-width="1"/>
        <path d="M365 136 Q370 132 371 137" stroke="#4af" stroke-width="1.5" fill="none" opacity=".7"/>

        <!-- Resistance bands on squat rack -->
        <path d="M278 154 Q270 172 278 190" stroke="#ffd700" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M278 154 Q286 172 278 190" stroke="#ffd700" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <!-- Warm left-zone glow for CBum -->
        <rect x="0" y="65" width="80" height="160" fill="#ffaa44" opacity=".014"/>

        <!-- Dorian cable post -->
        <rect x="0" y="75" width="10" height="150" fill="#111" rx="2"/>
        <rect x="2" y="112" width="7" height="10" rx="2" fill="#1e1e1e"/>

        <!-- Arnold cable posts — centered, wires calculated to hand positions -->
        <rect x="120" y="60" width="6" height="162" fill="#2a1a0a" rx="3"/>
        <circle cx="123" cy="90" r="4" fill="#3a3a3a"/>
        <rect x="254" y="60" width="6" height="162" fill="#2a1a0a" rx="3"/>
        <circle cx="257" cy="90" r="4" fill="#3a3a3a"/>
        <!-- Wires go to Arnold's grip points: translate(168,104)scale(0.8), local(-28,66)→world(146,157) and local(83,66)→world(234,157) -->
        <line x1="123" y1="90" x2="146" y2="157" stroke="#777" stroke-width="1.8"/>
        <line x1="257" y1="90" x2="234" y2="157" stroke="#777" stroke-width="1.8"/>

        <!-- Squat rack — j-hooks at y=100 so Ronnie at translate(272,72) grips at local y=34=world y=106 -->
        <rect x="278" y="64" width="5" height="158" fill="#3a3a4a" rx="2"/>
        <rect x="316" y="64" width="5" height="158" fill="#3a3a4a" rx="2"/>
        <rect x="278" y="64" width="43" height="5" fill="#4a4a5a" rx="2"/>
        <rect x="281" y="100" width="8" height="5" fill="#666" rx="1"/>
        <rect x="313" y="100" width="8" height="5" fill="#666" rx="1"/>
        <rect x="270" y="98" width="61" height="8" rx="3" fill="#888"/>
        <ellipse cx="273" cy="102" rx="7" ry="18" fill="#880000" stroke="#aa0000" stroke-width="1.2"/>
        <ellipse cx="328" cy="102" rx="7" ry="18" fill="#880000" stroke="#aa0000" stroke-width="1.2"/>
        <ellipse cx="267" cy="102" rx="5" ry="12" fill="#660000"/>
        <ellipse cx="334" cy="102" rx="5" ry="12" fill="#660000"/>

        <!-- CBUM zone — LEFT FOREGROUND, front double bicep, closer to camera -->
        <g class="trainer-zone" onclick="GainsShop.openTrainerProfile('cbum')">
          <rect x="22" y="108" width="76" height="138" fill="transparent"/>
          <g transform="translate(37, 131) scale(0.91)">
            <!-- BACK MULLET drawn first so it appears behind head -->
            <ellipse cx="30" cy="38" rx="9" ry="13" fill="#8a6828"/>
            <!-- LEGS -->
            <rect x="14" y="96" width="10" height="28" rx="4" fill="#c8a06a"/>
            <rect x="26" y="96" width="10" height="28" rx="4" fill="#c8a06a"/>
            <!-- SHORTS -->
            <rect x="12" y="86" width="26" height="14" rx="4" fill="#0d4a7a"/>
            <!-- MASSIVE LATS flaring wide -->
            <ellipse cx="5" cy="64" rx="19" ry="33" fill="#c8a06a"/>
            <ellipse cx="45" cy="64" rx="19" ry="33" fill="#c8a06a"/>
            <!-- Torso -->
            <rect x="11" y="46" width="28" height="44" rx="7" fill="#c8a06a"/>
            <!-- MASSIVE PECS -->
            <ellipse cx="18" cy="57" rx="13" ry="12" fill="#d4a870"/>
            <ellipse cx="32" cy="57" rx="13" ry="12" fill="#d4a870"/>
            <line x1="25" y1="48" x2="25" y2="84" stroke="#a07838" stroke-width="1.5"/>
            <path d="M12 68 Q25 76 38 68" stroke="#a07838" stroke-width="1.5" fill="none"/>
            <!-- Tank top -->
            <path d="M13 50 L16 88 L34 88 L37 50 Q30 43 25 41 Q20 43 13 50Z" fill="#0d4a7a"/>
            <!-- HUGE DELTOIDS -->
            <ellipse cx="3" cy="53" rx="16" ry="15" fill="#c8a06a"/>
            <ellipse cx="47" cy="53" rx="16" ry="15" fill="#c8a06a"/>
            <!-- HEAD -->
            <ellipse cx="25" cy="25" rx="13" ry="13" fill="#c8a06a"/>
            <!-- MODERN MULLET on top -->
            <rect x="12" y="20" width="4" height="14" rx="2" fill="#5a4018" opacity=".7"/>
            <rect x="34" y="20" width="4" height="14" rx="2" fill="#5a4018" opacity=".7"/>
            <path d="M12 20 Q14 11 25 10 Q36 11 38 20" fill="#9a7830"/>
            <path d="M14 19 Q18 12 25 11 Q32 12 36 19" fill="#b89040"/>
            <circle cx="19" cy="25" r="2.2" fill="#1a0a00"/>
            <circle cx="31" cy="25" r="2.2" fill="#1a0a00"/>
            <circle cx="19.8" cy="24" r=".9" fill="#fff"/>
            <circle cx="31.8" cy="24" r=".9" fill="#fff"/>
            <path d="M17 32 Q25 36 33 32" stroke="#a07848" stroke-width="1.2" fill="none"/>
          </g>
          <g class="tz-label">
            <rect x="17" y="240" width="86" height="16" rx="4" fill="#000000dd"/>
            <text x="60" y="252" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="600">Chris Bumstead</text>
          </g>
        </g>

        <!-- MENTZER zone — BACKGROUND, dumbbell rack area, small scale -->
        <g class="trainer-zone" onclick="GainsShop.openTrainerProfile('mentzer')">
          <rect x="26" y="90" width="36" height="70" fill="transparent"/>
          <g transform="translate(32, 98) scale(0.43)">
            <rect x="8" y="96" width="10" height="34" rx="4" fill="#c8965e"/>
            <rect x="22" y="96" width="10" height="34" rx="4" fill="#c8965e"/>
            <rect x="6" y="86" width="28" height="15" rx="4" fill="#111"/>
            <path d="M4 44 L8 88 L32 88 L36 44 Q30 34 20 32 Q10 34 4 44Z" fill="#c8965e"/>
            <path d="M6 46 L10 86 L30 86 L34 46 Q28 38 20 36 Q12 38 6 46Z" fill="#111"/>
            <!-- Arms crossed -->
            <path d="M34 56 Q28 60 16 62 Q10 62 8 60" stroke="#c8965e" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M6 58 Q12 62 24 60 Q32 60 36 58" stroke="#c8965e" stroke-width="6" fill="none" stroke-linecap="round"/>
            <!-- Cigarette arm raised -->
            <line x1="34" y1="54" x2="38" y2="24" stroke="#c8965e" stroke-width="5" stroke-linecap="round" opacity=".65"/>
            <rect x="36" y="21" width="11" height="2.5" rx="1.2" fill="#f0f0d8"/>
            <rect x="46.5" y="20.5" width="3.5" height="3.5" rx="1" fill="#ff7700" opacity=".9"/>
            <rect x="13" y="30" width="14" height="12" rx="4" fill="#c8965e"/>
            <ellipse cx="20" cy="20" rx="13" ry="14" fill="#c8965e"/>
            <path d="M7 16 Q8 7 20 6 Q32 7 33 16" fill="#1a0a00"/>
            <rect x="7" y="12" width="26" height="9" rx="5" fill="#1a0a00"/>
            <path d="M14 25 Q20 27 26 25" stroke="#0d0500" stroke-width="2.2" fill="none" stroke-linecap="round"/>
            <circle cx="14" cy="18" r="2" fill="#1a0a00"/>
            <circle cx="26" cy="18" r="2" fill="#1a0a00"/>
            <!-- Glasses -->
            <rect x="10" y="15" width="8" height="5.5" rx="1.5" fill="none" stroke="#444" stroke-width="1.1"/>
            <rect x="21" y="15" width="8" height="5.5" rx="1.5" fill="none" stroke="#444" stroke-width="1.1"/>
            <line x1="18" y1="17.5" x2="21" y2="17.5" stroke="#444" stroke-width=".9"/>
            <line x1="10" y1="17.5" x2="8" y2="16" stroke="#444" stroke-width=".9"/>
            <line x1="29" y1="17.5" x2="31" y2="16" stroke="#444" stroke-width=".9"/>
          </g>
          <g class="tz-label">
            <rect x="18" y="90" width="84" height="16" rx="4" fill="#000000dd"/>
            <text x="60" y="102" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="600">Mike Mentzer</text>
          </g>
        </g>

        <!-- DORIAN zone — SHADOW on the back wall, Arnold-level mass -->
        <g class="trainer-zone" onclick="GainsShop.openTrainerProfile('dorian')">
          <rect x="82" y="30" width="88" height="140" fill="transparent"/>
          <g transform="translate(88, 28) scale(0.72)" opacity="0.42">
            <!-- Shadow silhouette: all #080808, massive Arnold proportions -->
            <!-- HUGE LEGS -->
            <ellipse cx="14" cy="130" rx="22" ry="42" fill="#080808"/>
            <ellipse cx="56" cy="130" rx="22" ry="42" fill="#080808"/>
            <!-- MASSIVE LATS — extra wide like Arnold -->
            <ellipse cx="-8" cy="72" rx="32" ry="46" fill="#080808"/>
            <ellipse cx="78" cy="72" rx="32" ry="46" fill="#080808"/>
            <!-- Core torso -->
            <rect x="8" y="46" width="54" height="80" rx="12" fill="#080808"/>
            <!-- WIDE TRAPS merging into neck -->
            <ellipse cx="10" cy="38" rx="26" ry="22" fill="#080808"/>
            <ellipse cx="60" cy="38" rx="26" ry="22" fill="#080808"/>
            <!-- MASSIVE DELTOIDS -->
            <ellipse cx="-16" cy="52" rx="28" ry="28" fill="#080808"/>
            <ellipse cx="86" cy="52" rx="28" ry="28" fill="#080808"/>
            <!-- HUGE UPPER ARMS — double bicep shadow -->
            <line x1="-16" y1="56" x2="-30" y2="28" stroke="#080808" stroke-width="22" stroke-linecap="round"/>
            <ellipse cx="-24" cy="40" rx="16" ry="16" fill="#080808"/>
            <line x1="86" y1="56" x2="100" y2="28" stroke="#080808" stroke-width="22" stroke-linecap="round"/>
            <ellipse cx="94" cy="40" rx="16" ry="16" fill="#080808"/>
            <!-- THICK NECK -->
            <rect x="24" y="22" width="22" height="28" rx="10" fill="#080808"/>
            <!-- HEAD — large and round -->
            <ellipse cx="35" cy="12" rx="22" ry="22" fill="#080808"/>
          </g>
          <g class="tz-label">
            <rect x="96" y="32" width="72" height="16" rx="4" fill="#000000dd"/>
            <text x="132" y="44" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="600">Dorian Yates</text>
          </g>
        </g>

        <!-- RONNIE zone — BACK RIGHT WALL, behind Arnold in Z-order, shadow-like presence -->
        <g class="trainer-zone" onclick="GainsShop.openTrainerProfile('ronnie')">
          <rect x="232" y="26" width="82" height="140" fill="transparent"/>
          <g transform="translate(240, 22) scale(0.62)" opacity="0.52">
            <!-- Massive squatting legs -->
            <ellipse cx="7" cy="120" rx="18" ry="34" fill="#9b6b45"/>
            <ellipse cx="51" cy="120" rx="18" ry="34" fill="#9b6b45"/>
            <!-- Bulging calves -->
            <ellipse cx="6" cy="146" rx="13" ry="22" fill="#8a5a35"/>
            <ellipse cx="52" cy="146" rx="13" ry="22" fill="#8a5a35"/>
            <!-- Wide shorts -->
            <rect x="-8" y="90" width="74" height="18" rx="8" fill="#1a1a3a"/>
            <!-- MASSIVE LATS flaring wide — no shirt -->
            <ellipse cx="-10" cy="60" rx="26" ry="38" fill="#9b6b45"/>
            <ellipse cx="68" cy="60" rx="26" ry="38" fill="#9b6b45"/>
            <!-- Core torso -->
            <rect x="8" y="36" width="42" height="58" rx="10" fill="#9b6b45"/>
            <!-- HUGE ROUND PECS — very full, no shirt -->
            <ellipse cx="15" cy="50" rx="18" ry="17" fill="#b07848"/>
            <ellipse cx="43" cy="50" rx="18" ry="17" fill="#b07848"/>
            <!-- Pec shadow crease -->
            <path d="M10 64 Q29 76 48 64" stroke="#7a4020" stroke-width="3" fill="none"/>
            <line x1="29" y1="36" x2="29" y2="90" stroke="#7a4020" stroke-width="2.5"/>
            <!-- Abs (visible — no shirt) -->
            <line x1="19" y1="72" x2="39" y2="72" stroke="#7a4020" stroke-width="1.3" opacity=".6"/>
            <line x1="19" y1="80" x2="39" y2="80" stroke="#7a4020" stroke-width="1.3" opacity=".6"/>
            <!-- MASSIVE ROUND TRAPS exploding up -->
            <ellipse cx="7" cy="26" rx="24" ry="20" fill="#9b6b45"/>
            <ellipse cx="51" cy="26" rx="24" ry="20" fill="#9b6b45"/>
            <!-- MASSIVE ROUND DELTOIDS -->
            <ellipse cx="-14" cy="38" rx="26" ry="26" fill="#9b6b45"/>
            <ellipse cx="72" cy="38" rx="26" ry="26" fill="#9b6b45"/>
            <!-- Delt highlight -->
            <ellipse cx="-16" cy="31" rx="11" ry="11" fill="#c8a070" opacity=".38"/>
            <ellipse cx="74" cy="31" rx="11" ry="11" fill="#c8a070" opacity=".38"/>
            <!-- HUGE BICEPS with peaked muscle -->
            <line x1="-14" y1="42" x2="4" y2="34" stroke="#9b6b45" stroke-width="22" stroke-linecap="round"/>
            <ellipse cx="-8" cy="40" rx="14" ry="14" fill="#c8a070"/>
            <line x1="72" y1="42" x2="54" y2="34" stroke="#9b6b45" stroke-width="22" stroke-linecap="round"/>
            <ellipse cx="66" cy="40" rx="14" ry="14" fill="#c8a070"/>
            <!-- Forearms -->
            <line x1="4" y1="34" x2="12" y2="34" stroke="#9b6b45" stroke-width="16" stroke-linecap="round"/>
            <line x1="54" y1="34" x2="46" y2="34" stroke="#9b6b45" stroke-width="16" stroke-linecap="round"/>
            <!-- Thick neck blending into traps -->
            <rect x="18" y="16" width="22" height="26" rx="9" fill="#9b6b45"/>
            <!-- BALD HEAD — big and shiny -->
            <ellipse cx="29" cy="8" rx="22" ry="22" fill="#9b6b45"/>
            <ellipse cx="21" cy="1" rx="11" ry="6" fill="rgba(255,255,255,0.17)"/>
            <!-- SIGNATURE HUGE GRIN -->
            <path d="M13 15 Q29 30 45 15" stroke="#7a4a20" stroke-width="4" fill="none" stroke-linecap="round"/>
            <path d="M15 16 Q29 29 43 16" fill="#fff" opacity=".56"/>
            <circle cx="19" cy="7" r="3.2" fill="#0a0500"/>
            <circle cx="39" cy="7" r="3.2" fill="#0a0500"/>
            <circle cx="20" cy="6" r="1.4" fill="#fff"/>
            <circle cx="40" cy="6" r="1.4" fill="#fff"/>
          </g>
          <g class="tz-label">
            <rect x="234" y="28" width="82" height="16" rx="4" fill="#000000dd"/>
            <text x="275" y="40" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="600">Ronnie Coleman</text>
          </g>
        </g>

        <!-- ARNOLD zone — CENTERED on machine, wires touch his hands -->
        <g class="trainer-zone" onclick="GainsShop.openTrainerProfile('arnold')">
          <rect x="138" y="90" width="104" height="138" fill="transparent"/>
          <!-- translate(168,104)scale(0.8): body center at 168+27*0.8=189.6≈190=midpoint of posts ✓ -->
          <g transform="translate(168, 104) scale(0.80)">
            <rect x="12" y="110" width="13" height="40" rx="5" fill="#c8965e"/>
            <rect x="30" y="110" width="13" height="40" rx="5" fill="#c8965e"/>
            <rect x="10" y="100" width="35" height="16" rx="5" fill="#c8a030"/>
            <line x1="27" y1="100" x2="27" y2="116" stroke="#a07820" stroke-width="1"/>
            <path d="M4 54 L12 102 L43 102 L51 54 Q44 42 27 40 Q10 42 4 54Z" fill="#c8965e"/>
            <path d="M10 64 Q27 76 44 64" stroke="#b07848" stroke-width="1.5" fill="none"/>
            <line x1="27" y1="62" x2="27" y2="100" stroke="#b07848" stroke-width="1" opacity=".4"/>
            <ellipse cx="4" cy="58" rx="10" ry="10" fill="#c8965e"/>
            <ellipse cx="51" cy="58" rx="10" ry="10" fill="#c8965e"/>
            <!-- Left arm — grip at local(-28,66)=world(145.6,156.8) where left cable terminates -->
            <line x1="4" y1="62" x2="-22" y2="70" stroke="#c8965e" stroke-width="10" stroke-linecap="round"/>
            <line x1="-22" y1="70" x2="-28" y2="66" stroke="#c8965e" stroke-width="7" stroke-linecap="round"/>
            <!-- Right arm — grip at local(83,66)=world(234.4,156.8) where right cable terminates -->
            <line x1="51" y1="62" x2="77" y2="70" stroke="#c8965e" stroke-width="10" stroke-linecap="round"/>
            <line x1="77" y1="70" x2="83" y2="66" stroke="#c8965e" stroke-width="7" stroke-linecap="round"/>
            <rect x="19" y="42" width="17" height="16" rx="5" fill="#c8965e"/>
            <ellipse cx="27" cy="32" rx="15" ry="16" fill="#c8965e"/>
            <path d="M12 27 Q13 16 27 15 Q41 16 42 27" fill="#4a3020"/>
            <rect x="12" y="23" width="30" height="9" rx="5" fill="#4a3020"/>
            <path d="M17 39 Q27 47 37 39" stroke="#8a5030" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M19 40 Q27 46 35 40" fill="#fff" opacity=".55"/>
            <circle cx="20" cy="30" r="2.5" fill="#2a1810"/>
            <circle cx="34" cy="30" r="2.5" fill="#2a1810"/>
            <circle cx="20.8" cy="29" r="1" fill="#fff"/>
            <circle cx="34.8" cy="29" r="1" fill="#fff"/>
            <path d="M16 26 Q20 24 24 26" stroke="#3a2010" stroke-width="1.2" fill="none"/>
            <path d="M30 26 Q34 24 38 26" stroke="#3a2010" stroke-width="1.2" fill="none"/>
          </g>
          <g class="tz-label">
            <rect x="134" y="92" width="112" height="16" rx="4" fill="#000000dd"/>
            <text x="190" y="104" text-anchor="middle" font-size="7.5" fill="#fff" font-family="sans-serif" font-weight="600">Arnold Schwarzenegger</text>
          </g>
        </g>

        <!-- LOUIE zone — LOWER + BIGGER, closer to camera -->
        <g class="trainer-zone" onclick="GainsShop.openTrainerProfile('louie')">
          <rect x="316" y="178" width="64" height="68" fill="transparent"/>
          <g transform="translate(322, 186) scale(1.12)">
            <rect x="6" y="54" width="10" height="20" rx="4" fill="#b07848"/>
            <rect x="20" y="54" width="10" height="20" rx="4" fill="#b07848"/>
            <path d="M4 26 L7 56 L29 56 L32 26 Q26 18 18 16 Q10 18 4 26Z" fill="#b07848"/>
            <path d="M6 28 L9 54 L27 54 L30 28 Q24 22 18 20 Q12 22 6 28Z" fill="#880000"/>
            <!-- CROSSED AXES tattoo on chest -->
            <line x1="13" y1="30" x2="23" y2="50" stroke="#1a0808" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="13" y1="50" x2="23" y2="30" stroke="#1a0808" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M10 29 Q9 26 12 27 L14 31Z" fill="#1a0808"/>
            <path d="M26 51 Q27 54 24 53 L22 49Z" fill="#1a0808"/>
            <path d="M26 29 Q27 26 24 27 L22 31Z" fill="#1a0808"/>
            <path d="M10 51 Q9 54 12 53 L14 49Z" fill="#1a0808"/>
            <!-- Pointing at Ronnie -->
            <line x1="5" y1="34" x2="-12" y2="28" stroke="#b07848" stroke-width="7" stroke-linecap="round"/>
            <line x1="-12" y1="28" x2="-19" y2="26" stroke="#b07848" stroke-width="5" stroke-linecap="round"/>
            <!-- Clipboard -->
            <line x1="31" y1="36" x2="37" y2="42" stroke="#b07848" stroke-width="6" stroke-linecap="round"/>
            <rect x="35" y="39" width="10" height="14" rx="1" fill="#f4e8c0"/>
            <line x1="37" y1="43" x2="43" y2="43" stroke="#aaa" stroke-width=".8"/>
            <line x1="37" y1="46" x2="43" y2="46" stroke="#aaa" stroke-width=".8"/>
            <line x1="37" y1="49" x2="41" y2="49" stroke="#aaa" stroke-width=".8"/>
            <rect x="13" y="8" width="10" height="10" rx="4" fill="#c8a880"/>
            <ellipse cx="18" cy="4" rx="11" ry="10" fill="#c8a880"/>
            <!-- BALD — shiny dome highlight, no hair, no glasses -->
            <ellipse cx="13" cy="-1" rx="7" ry="4" fill="rgba(255,255,255,0.14)"/>
            <circle cx="13.5" cy="5.5" r="1.2" fill="#1a0a00"/>
            <circle cx="22.5" cy="5.5" r="1.2" fill="#1a0a00"/>
            <!-- Goatee — no smile -->
            <path d="M15 12 Q18 15 21 12 Q20 17 18 18 Q16 17 15 12Z" fill="#1a0a00" opacity=".78"/>
          </g>
          <g class="tz-label">
            <rect x="310" y="180" width="80" height="16" rx="4" fill="#000000dd"/>
            <text x="350" y="192" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="600">Louie Simmons</text>
          </g>
        </g>

        <!-- WHITECHOCOLATE zone — RIGHT SIDE squat rack area, T-pose, afro, blue star tank -->
        <g class="trainer-zone" onclick="GainsShop.openTrainerProfile('whitechocolate')">
          <rect x="252" y="68" width="100" height="160" fill="transparent"/>
          <g transform="translate(262, 88) scale(0.78)">
            <!-- Afro — big round dark puff above head -->
            <ellipse cx="28" cy="8" rx="20" ry="19" fill="#111111"/>
            <ellipse cx="28" cy="11" rx="16" ry="16" fill="#1a1a1a"/>
            <!-- Head -->
            <ellipse cx="28" cy="22" rx="12" ry="13" fill="#b07840"/>
            <!-- Eyes + smile -->
            <circle cx="23" cy="20" r="2" fill="#1a0a00"/>
            <circle cx="33" cy="20" r="2" fill="#1a0a00"/>
            <circle cx="23.8" cy="19.2" r=".8" fill="#fff"/>
            <circle cx="33.8" cy="19.2" r=".8" fill="#fff"/>
            <path d="M22 27 Q28 32 34 27" stroke="#8a5020" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <!-- Neck -->
            <rect x="24" y="34" width="8" height="8" rx="3" fill="#8a5a28"/>
            <!-- Torso — blue tank top -->
            <path d="M14 42 L16 96 L40 96 L42 42 Q36 35 28 33 Q20 35 14 42Z" fill="#1a4aaa"/>
            <!-- Tank top shoulder straps visible above chest -->
            <rect x="16" y="42" width="5" height="8" rx="2" fill="#1a4aaa"/>
            <rect x="35" y="42" width="5" height="8" rx="2" fill="#1a4aaa"/>
            <!-- Star on tank -->
            <polygon points="28,52 30,58 36,58 31,62 33,68 28,64 23,68 25,62 20,58 26,58" fill="#ffe040" opacity="0.9"/>
            <!-- SIDE CHEST pose facing left — near (left) arm flexed bicep, far (right) arm tucked -->
            <!-- Near left arm — upper arm angles down-left from shoulder -->
            <line x1="14" y1="46" x2="-8" y2="62" stroke="#b07840" stroke-width="11" stroke-linecap="round"/>
            <!-- Near left forearm — curls sharply upward to show bicep peak -->
            <line x1="-8" y1="62" x2="-2" y2="42" stroke="#b07840" stroke-width="9" stroke-linecap="round"/>
            <!-- Fist at top of near arm -->
            <ellipse cx="-1" cy="39" rx="6" ry="5" fill="#8a5a28"/>
            <!-- Far right arm — upper arm forward and slightly down -->
            <line x1="42" y1="46" x2="60" y2="56" stroke="#b07840" stroke-width="11" stroke-linecap="round"/>
            <!-- Far right forearm — tucked down toward waist -->
            <line x1="60" y1="56" x2="50" y2="70" stroke="#8a5a28" stroke-width="9" stroke-linecap="round"/>
            <!-- Shorts — dark maroon -->
            <rect x="13" y="94" width="30" height="18" rx="5" fill="#3a1010"/>
            <line x1="28" y1="94" x2="28" y2="112" stroke="#2a0808" stroke-width="1.2"/>
            <!-- Legs -->
            <rect x="15" y="110" width="11" height="34" rx="4" fill="#b07840"/>
            <rect x="30" y="110" width="11" height="34" rx="4" fill="#b07840"/>
            <!-- Calves -->
            <rect x="16" y="140" width="9" height="20" rx="3" fill="#8a5a28"/>
            <rect x="31" y="140" width="9" height="20" rx="3" fill="#8a5a28"/>
            <!-- Slides/sandals -->
            <rect x="12" y="158" width="15" height="4" rx="2" fill="#555"/>
            <rect x="13" y="154" width="4" height="6" rx="1" fill="#444"/>
            <rect x="29" y="158" width="15" height="4" rx="2" fill="#555"/>
            <rect x="36" y="154" width="4" height="6" rx="1" fill="#444"/>
          </g>
          <g class="tz-label">
            <rect x="252" y="218" width="94" height="16" rx="4" fill="#000000dd"/>
            <text x="299" y="230" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="600">Whitechocolate</text>
          </g>
        </g>

        <!-- HOME WORKOUT MAGAZINE — open on gym floor between CBum and Arnold -->
        <g class="trainer-zone" onclick="GainsShop.openHomeMag()" style="cursor:pointer">
          <title>Home Workouts</title>
          <!-- Open book lying flat, two pages face-up, slight angle -->
          <!-- Left page -->
          <rect x="128" y="234" width="28" height="19" rx="1" fill="#f5f0e8" transform="rotate(-8 142 243)"/>
          <!-- Left page lines -->
          <line x1="131" y1="238" x2="151" y2="237" stroke="#ccc" stroke-width=".8" transform="rotate(-8 142 243)"/>
          <line x1="131" y1="241" x2="151" y2="240" stroke="#ccc" stroke-width=".8" transform="rotate(-8 142 243)"/>
          <line x1="131" y1="244" x2="151" y2="243" stroke="#ccc" stroke-width=".8" transform="rotate(-8 142 243)"/>
          <!-- Left page green cover strip -->
          <rect x="128" y="234" width="28" height="5" rx="1" fill="#3a9a60" transform="rotate(-8 142 243)" opacity=".9"/>
          <text x="142" y="239" text-anchor="middle" font-size="3.5" fill="#fff" font-family="sans-serif" font-weight="700" transform="rotate(-8 142 243)">HOME</text>
          <!-- Right page -->
          <rect x="155" y="232" width="28" height="19" rx="1" fill="#eef5f0" transform="rotate(-8 169 241)"/>
          <!-- Right page lines -->
          <line x1="158" y1="236" x2="178" y2="235" stroke="#ccc" stroke-width=".8" transform="rotate(-8 169 241)"/>
          <line x1="158" y1="239" x2="178" y2="238" stroke="#ccc" stroke-width=".8" transform="rotate(-8 169 241)"/>
          <line x1="158" y1="242" x2="178" y2="241" stroke="#ccc" stroke-width=".8" transform="rotate(-8 169 241)"/>
          <!-- Right page small image thumbnail -->
          <rect x="158" y="233" width="8" height="6" rx="1" fill="#7ec8a0" transform="rotate(-8 169 241)"/>
          <!-- Spine (center fold shadow) -->
          <line x1="155" y1="230" x2="155" y2="253" stroke="#aaa" stroke-width="2" transform="rotate(-8 155 241)"/>
          <!-- Hover label -->
          <g class="tz-label">
            <rect x="115" y="254" width="80" height="13" rx="3" fill="#000000cc"/>
            <text x="155" y="264" text-anchor="middle" font-size="7" fill="#88ffaa" font-family="sans-serif" font-weight="600">Home Workouts 📖</text>
          </g>
        </g>

        <!-- Water fountain person (not interactive) -->
        <g transform="translate(356, 158) scale(0.46)">
          <rect x="6" y="50" width="8" height="22" rx="3" fill="#9b6b45"/>
          <rect x="6" y="34" width="8" height="18" rx="4" fill="#1a1a2e"/>
          <line x1="6" y1="40" x2="-2" y2="38" stroke="#9b6b45" stroke-width="5" stroke-linecap="round"/>
          <line x1="-2" y1="38" x2="-4" y2="32" stroke="#9b6b45" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="10" cy="26" rx="8" ry="8" fill="#9b6b45"/>
          <path d="M2 22 Q3 14 10 13 Q17 14 18 22" fill="#2a1a00"/>
        </g>

      </svg>

      <div class="trainer-tap-hint">Tap a legend to unlock their program</div>
    </div>
  </div>`;
}

function _trainerPixelSVG(id) {
  const C = {
    dorian:         { sk:'#b07848', skd:'#8a5c30', ha:'#1a1008', sh:'#555555', sp:'#333',    eyes:'#111', feat:'intense' },
    arnold:         { sk:'#c8965e', skd:'#a87540', ha:'#111111', sh:'#1a44bb', sp:'#0a2299', eyes:'#1a3a1a', feat:'smile' },
    ronnie:         { sk:'#7a5030', skd:'#5a3820', ha:'#111111', sh:'#cc1111', sp:'#771111', eyes:'#111', feat:'grin' },
    cbum:           { sk:'#c09050', skd:'#a07030', ha:'#8a6428', sh:'#14144a', sp:'#0a0a2a', eyes:'#1a2a6a', feat:'shades' },
    mentzer:        { sk:'#c8965e', skd:'#aa7640', ha:'#111111', sh:'#111111', sp:'#222222', eyes:'#111', feat:'stache' },
    louie:          { sk:'#c8a06a', skd:'#a88050', ha:'#aaaaaa', sh:'#cc5500', sp:'#884400', eyes:'#222', feat:'belt' },
    whitechocolate: { sk:'#b07840', skd:'#8a5a28', ha:'#111111', sh:'#1a4aaa', sp:'#3a1010', eyes:'#111', feat:'smile' },
  };
  const c = C[id] || C.dorian;
  const { sk, skd, ha, sh, sp } = c;
  const Z = 5; // px per pixel
  const r = (x, y, w, h, col) => `<rect x="${x*Z}" y="${y*Z}" width="${w*Z}" height="${h*Z}" fill="${col}"/>`;

  let s = '';
  // Hair
  if (id==='louie') { s+=r(3,0,9,1,ha)+r(2,1,11,2,ha); }
  else if (id==='cbum') { s+=r(4,0,7,1,ha)+r(3,1,9,2,ha)+r(2,2,11,1,ha); }
  else if (id==='whitechocolate') {
    // Big round afro — extends beyond head width on all sides
    s+=r(4,0,7,1,ha)+r(2,1,11,1,ha)+r(1,2,13,2,ha)+r(0,3,15,3,ha)+r(1,5,13,1,ha);
  }
  else { s+=r(5,0,5,1,ha)+r(3,1,9,1,ha)+r(3,2,9,1,ha); }
  // Head
  s+=r(3,2,9,6,sk);
  // Ears
  s+=r(2,4,1,2,skd)+r(12,4,1,2,skd);
  // Eyes
  if (c.feat==='shades') {
    s+=r(3,4,4,2,'#111')+r(8,4,4,2,'#111')+r(7,4,1,1,'#333');
  } else {
    s+=r(4,4,2,1,c.eyes)+r(9,4,2,1,c.eyes);
    s+=r(4,3,3,1,ha)+r(8,3,4,1,ha); // brows
  }
  // Nose
  s+=r(7,5,1,1,skd);
  // Mouth / feature
  if (c.feat==='smile'||c.feat==='grin') {
    s+=r(5,7,1,1,'#cc6644')+r(9,7,1,1,'#cc6644')+r(6,7,3,1,skd);
  } else if (c.feat==='stache') {
    s+=r(5,6,5,2,ha);
  } else if (c.feat==='intense') {
    s+=r(6,7,3,1,'#222');
  } else {
    s+=r(6,7,3,1,skd);
  }
  if (c.feat==='belt') { s+=r(3,2,9,1,ha); } // grey hair top
  // Neck
  s+=r(6,8,3,2,skd);
  // Massive shoulders — full width
  s+=r(0,9,15,2,sh);
  // Chest / torso — V-taper
  s+=r(1,11,13,3,sh);
  s+=r(2,14,11,2,sh);
  s+=r(3,16,9,1,sh);
  // Chest definition line (darker)
  s+=r(3,12,4,1,sk+'88'||'#00000022')+r(8,12,4,1,sk+'88'||'#00000022');
  // Star on Whitechocolate's tank top
  if (id==='whitechocolate') {
    s+=r(7,12,1,1,'#fff')+r(6,13,3,1,'#fff')+r(7,14,1,1,'#fff'); // pixel star shape
  }
  // Left arm (bicep + forearm)
  s+=r(0,11,1,4,sk)+r(0,15,1,3,skd);
  // Right arm
  s+=r(14,11,1,4,sk)+r(14,15,1,3,skd);
  // Shorts
  s+=r(3,17,9,4,sp);
  if (c.feat==='belt') { s+=r(3,17,9,1,'#cc6600'); }
  // Legs — thighs
  s+=r(3,21,4,6,sk)+r(8,21,4,6,sk);
  // Calves
  s+=r(3,27,3,4,skd)+r(9,27,3,4,skd);
  // Shoes
  s+=r(2,31,4,1,'#111')+r(9,31,4,1,'#111');

  return `<svg viewBox="0 0 ${15*Z} ${32*Z}" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated;image-rendering:crisp-edges">${s}</svg>`;
}

const _WATCH_LINKS = {
  dorian: [
    { icon:'🎬', label:'Blood & Guts — The Documentary', sub:'Dorian\'s raw training captured on film in the early \'90s', url:'https://www.youtube.com/results?search_query=Dorian+Yates+Blood+and+Guts+training+documentary' },
    { icon:'💪', label:'HIT: One Set to Failure Explained', sub:'The science and discipline behind high-intensity training', url:'https://www.youtube.com/results?search_query=Dorian+Yates+HIT+high+intensity+training+one+set' },
    { icon:'🏆', label:'The Shadow — 6× Olympia Highlights', sub:'Every championship win and the conditioning that won it', url:'https://www.youtube.com/results?search_query=Dorian+Yates+Mr+Olympia+shadow+champion+highlights' },
  ],
  arnold: [
    { icon:'🎬', label:'Pumping Iron (1977)', sub:'The documentary that launched bodybuilding into mainstream culture', url:'https://www.youtube.com/results?search_query=Pumping+Iron+1977+Arnold+documentary' },
    { icon:'💪', label:'Arnold\'s Blueprint Training Program', sub:'The exact split and principles from the Golden Era', url:'https://www.youtube.com/results?search_query=Arnold+Schwarzenegger+blueprint+training+chest+back' },
    { icon:'🏆', label:'Gold\'s Gym Venice — The Golden Era', sub:'Training with the legends at the birthplace of bodybuilding', url:'https://www.youtube.com/results?search_query=Arnold+Schwarzenegger+Gold+s+Gym+Venice+Beach+golden+era' },
  ],
  ronnie: [
    { icon:'🎬', label:'Ronnie Coleman: The King', sub:'Full-length documentary on the greatest bodybuilder ever', url:'https://www.youtube.com/results?search_query=Ronnie+Coleman+The+King+documentary+full' },
    { icon:'💪', label:'"Lightweight Baby!" — Iconic Sessions', sub:'The most famous training footage ever recorded', url:'https://www.youtube.com/results?search_query=Ronnie+Coleman+lightweight+baby+training+session' },
    { icon:'🏆', label:'The Cost of Redemption', sub:'Ronnie\'s battle back after injury — raw and real', url:'https://www.youtube.com/results?search_query=Ronnie+Coleman+Cost+of+Redemption+documentary' },
  ],
  cbum: [
    { icon:'🎬', label:'Road to Olympia — Full Series', sub:'Every prep documented on his own channel', url:'https://www.youtube.com/@ChrisBumstead' },
    { icon:'💪', label:'Classic Physique Full Workouts', sub:'Chest, back, arms — exactly how a 5× champ trains', url:'https://www.youtube.com/results?search_query=Chris+Bumstead+full+workout+classic+physique+training' },
    { icon:'🏆', label:'5× Mr. Olympia Classic Highlights', sub:'All five championship runs back-to-back', url:'https://www.youtube.com/results?search_query=Chris+Bumstead+5x+Mr+Olympia+Classic+Physique+champion' },
  ],
  mentzer: [
    { icon:'🎬', label:'Heavy Duty: The Philosophy', sub:'Mentzer explains maximum intensity in his own words', url:'https://www.youtube.com/results?search_query=Mike+Mentzer+Heavy+Duty+training+philosophy+lecture' },
    { icon:'💪', label:'One Set to Failure — In Practice', sub:'What brutal HIT actually looks like in the gym', url:'https://www.youtube.com/results?search_query=Mike+Mentzer+one+set+to+failure+training+HIT' },
    { icon:'🏆', label:'1980 Olympia — Perfect Score', sub:'The controversial championship that defined his legacy', url:'https://www.youtube.com/results?search_query=Mike+Mentzer+1980+Mr+Olympia+perfect+score+controversy' },
  ],
  louie: [
    { icon:'🎬', label:'Inside Westside Barbell', sub:'The most secretive and successful powerlifting gym on earth', url:'https://www.youtube.com/results?search_query=Westside+Barbell+documentary+Louie+Simmons+inside' },
    { icon:'💪', label:'Conjugate Method Breakdown', sub:'Max effort + dynamic effort — the full Westside system', url:'https://www.youtube.com/results?search_query=Louie+Simmons+conjugate+method+explained+max+effort+dynamic' },
    { icon:'🏆', label:'Bands & Chains — Accommodating Resistance', sub:'The training innovation that rewrote powerlifting', url:'https://www.youtube.com/results?search_query=Louie+Simmons+bands+chains+accommodating+resistance+training' },
  ],
  whitechocolate: [
    { icon:'🎬', label:'Street Workout Mastery', sub:'Calisthenics and playground training at its peak', url:'https://www.youtube.com/results?search_query=street+workout+calisthenics+mastery+bar+training' },
    { icon:'💪', label:'Athletic Hypertrophy Training', sub:'Build muscle that performs as good as it looks', url:'https://www.youtube.com/results?search_query=athletic+hypertrophy+training+functional+muscle' },
    { icon:'🏆', label:'Explosive Speed & Strength', sub:'Box jumps, sprints, kettlebells — train like an athlete', url:'https://www.youtube.com/results?search_query=explosive+athletic+training+speed+strength+power' },
  ],
};

function openTrainerProfile(id) {
  const t = TRAINERS.find(x => x.id === id);
  if (!t) return;
  _activeTrainer = id;
  const container = document.getElementById('store-container');
  if (!container) return;

  const tc = t.color, tg = t.glow;
  const tcDim = tc + '33';

  const pixSVG = _trainerPixelSVG(t.id);
  const _PLW = [5,3,7,4,6,3,5];
  const pixLines = (n, col) => _PLW.slice(0,n).map((w,i) =>
    `<div style="height:4px;width:${w*10}px;background:${col};opacity:${0.4+i*0.07};margin-bottom:4px;border-radius:1px"></div>`
  ).join('');

  // Page 1: Cover — pixel art magazine style
  const page1 = `
  <div class="mag-page" style="background:${tc}22;position:relative;overflow:hidden">
    <!-- Grid bg -->
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);background-size:8px 8px;pointer-events:none"></div>
    <!-- Solid dark overlay for readability -->
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0a0c18ee 0%,#0d1020cc 60%,#0a0c18ee 100%);pointer-events:none"></div>

    <div style="position:relative;padding:14px 16px 0">
      <!-- Top header bar -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:2px solid ${tc};padding-bottom:8px">
        <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:${tc};letter-spacing:1px">IRONLORE</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:rgba(255,255,255,0.4)">VOL.${TRAINERS.indexOf(t)+1}</div>
      </div>

      <!-- Main title -->
      <div style="font-family:'Press Start 2P',monospace;font-size:16px;color:#fff;line-height:1.5;text-shadow:3px 3px 0 ${tc},5px 5px 0 ${tc}44;margin-bottom:4px">${t.name.split(' ')[0].toUpperCase()}</div>
      <div style="font-family:'Press Start 2P',monospace;font-size:10px;color:#fff;line-height:1.5;text-shadow:2px 2px 0 ${tc};margin-bottom:2px">${(t.name.split(' ')[1]||'').toUpperCase()}</div>
      <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:${tc};margin-bottom:14px">${t.title.toUpperCase()}</div>

      <!-- Character + side decorations -->
      <div style="display:flex;align-items:flex-end;justify-content:space-between;min-height:160px">
        <!-- Left decorations -->
        <div style="display:flex;flex-direction:column;gap:2px;padding-bottom:8px;min-width:48px">
          <div style="font-family:'Press Start 2P',monospace;font-size:6px;color:${tc};margin-bottom:6px">${t.split.length} DAYS</div>
          ${pixLines(7, tc)}
          <div style="margin-top:6px">
            ${[4,4,4,4].map(() => `<div style="width:4px;height:4px;background:${tc};display:inline-block;margin:1px;opacity:0.8"></div>`).join('')}
          </div>
        </div>

        <!-- Pixel character centered -->
        <div style="flex:1;display:flex;justify-content:center;align-items:flex-end">
          <div style="width:90px;height:160px;image-rendering:pixelated">${pixSVG}</div>
        </div>

        <!-- Right decorations -->
        <div style="display:flex;flex-direction:column;gap:2px;padding-bottom:8px;align-items:flex-end;min-width:48px">
          <div style="font-family:'Press Start 2P',monospace;font-size:6px;color:#ffd700;margin-bottom:6px">${t.split.reduce((a,d)=>a+d.exercises.length,0)} SETS</div>
          ${pixLines(7, 'rgba(255,255,255,0.5)')}
          <div style="margin-top:6px;font-family:'Press Start 2P',monospace;font-size:8px;color:#ffd700">▶</div>
        </div>
      </div>

      <!-- Divider line -->
      <div style="height:2px;background:linear-gradient(90deg,transparent,${tc},transparent);margin:8px 0"></div>

      <!-- Quote -->
      <div style="font-size:11px;font-style:italic;color:rgba(255,255,255,0.8);line-height:1.6;margin-bottom:10px;padding:0 4px">${t.tagline}</div>

      <!-- Style tag + swipe -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:16px">
        <div style="font-family:'Press Start 2P',monospace;font-size:6px;color:${tc};border:1px solid ${tc};padding:5px 8px;line-height:1.6">${t.style.toUpperCase()}</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:6px;color:rgba(255,255,255,0.25)">SWIPE ▶</div>
      </div>
    </div>
  </div>`;

  const pxTitle = (emoji, label) =>
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <span style="font-size:16px">${emoji}</span>
      <span style="font-family:'Press Start 2P',monospace;font-size:9px;color:${tc};line-height:1.4">${label.toUpperCase()}</span>
      <div style="flex:1;height:1px;background:${tc};opacity:0.25"></div>
    </div>`;

  // Page 2: The Split
  const page2 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 80px">
    ${pxTitle('📋','The Split')}
    ${t.split.map((day, i) => `
      <div class="mag-day-card" style="background:${i%2===0?'#13152a':'#0f1120'};border:1px solid ${tc}33">
        <div class="mag-day-label" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:7px;line-height:1.8">${day.day}</div>
        <ul class="mag-day-exercises">
          ${day.exercises.map(e => `<li>${e}</li>`).join('')}
        </ul>
      </div>`).join('')}
    <button class="mag-adopt-btn" onclick="MQ.adoptLegendSplit('${t.id}')"
      style="background:${tc};color:#fff;box-shadow:0 4px 20px ${tc}66;font-family:'Press Start 2P',monospace;font-size:8px">
      + ADOPT SPLIT
    </button>
  </div>`;

  // Page 3: Philosophy
  const page3 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 80px">
    ${pxTitle('🧠','Philosophy')}
    <div style="background:${tc}18;border-left:3px solid ${tc};border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:20px;font-family:'Press Start 2P',monospace;font-size:7px;color:${tc};line-height:2">${t.style.toUpperCase()}</div>
    ${t.principles.map((p, i) => `
      <div class="mag-principle-row">
        <div class="mag-principle-num" style="color:${tc}66;font-family:'Press Start 2P',monospace;font-size:14px">${String(i+1).padStart(2,'0')}</div>
        <div class="mag-principle-text">${p}</div>
      </div>`).join('')}
  </div>`;

  // Page 4: Best For + stats
  const days = t.split.length;
  const sets = t.split.reduce((sum, d) => sum + d.exercises.length, 0);
  const page4 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 80px">
    ${pxTitle('🏆','Best For')}
    <div class="mag-stat-row">
      <div class="mag-stat-box" style="border:1px solid ${tc}33">
        <div class="mag-stat-val" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:18px">${days}</div>
        <div class="mag-stat-lbl">Training Days</div>
      </div>
      <div class="mag-stat-box" style="border:1px solid ${tc}33">
        <div class="mag-stat-val" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:18px">${sets}</div>
        <div class="mag-stat-lbl">Working Sets</div>
      </div>
    </div>
    <div class="mag-outcome-box" style="background:linear-gradient(135deg,${tc}22,${tc}08);border:1px solid ${tc}44">
      <div class="mag-outcome-label" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:7px">Best For</div>
      <div class="mag-outcome-text">${t.outcome}</div>
    </div>
    <div style="background:#13152a;border-radius:10px;padding:14px;margin-bottom:12px">
      <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:rgba(255,255,255,0.35);line-height:2;margin-bottom:8px">Who thrives on this</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.8);line-height:1.7">
        Intermediate to advanced athletes who want the most efficient route to size and strength.
      </div>
    </div>
    <div style="font-size:10px;color:rgba(255,255,255,0.25);line-height:1.6;text-align:center;padding-top:8px">
      IronLore presents this for educational purposes only.
    </div>
  </div>`;

  // Page 5: Watch & Learn
  const watchLinks = _WATCH_LINKS[t.id] || [
    { icon:'▶️', label:`Search "${t.name}" on YouTube`, sub:'Training videos · Interviews · Documentary footage', url:`https://www.youtube.com/results?search_query=${encodeURIComponent(t.name+' workout training')}` },
  ];
  const page5 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 80px">
    ${pxTitle('🎬','Watch & Learn')}
    <div style="font-size:12px;color:rgba(255,255,255,0.45);margin-bottom:16px;line-height:1.5">
      Study how ${t.name.split(' ')[0]} actually trained. These are the closest thing to being in the gym with a legend.
    </div>
    ${watchLinks.map(w => `
    <a class="mag-watch-card" href="${w.url}" target="_blank" rel="noopener">
      <div class="mag-watch-icon">${w.icon}</div>
      <div>
        <div class="mag-watch-label">${w.label}</div>
        <div class="mag-watch-sub">${w.sub}</div>
      </div>
    </a>`).join('')}
    <div style="margin-top:20px;padding:16px;background:#13152a;border-radius:10px;border:1px solid ${tc}33">
      <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:${tc};line-height:2;margin-bottom:6px">The ${(t.name.split(' ')[1]||t.name.split(' ')[0]).toUpperCase()} Quote</div>
      <div style="font-style:italic;font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6">${t.tagline}</div>
    </div>
  </div>`;

  const pages = [page1, page2, page3, page4, page5];
  const dots = pages.map((_, i) => `<span class="mag-dot${i===0?' mag-dot-active':''}" onclick="GainsShop._magGoTo(${i})" style="${i===0?'background:'+tc:''}"></span>`).join('');

  container.innerHTML = `
  <div class="mag-wrap">
    <div class="mag-back-bar">
      <button class="store-back-btn" onclick="GainsShop.openTrainer()">← Trainers</button>
      <span style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;color:${tc}">${t.name}</span>
    </div>
    <div class="mag-dots" id="mag-dots">${dots}</div>
    <div class="mag-pages" id="mag-pages" onscroll="GainsShop._magScroll(this,'${tc}')">
      ${pages.join('')}
    </div>
  </div>`;
}

function _magScroll(el, tc) {
  const idx = Math.round(el.scrollLeft / el.clientWidth);
  const dotEls = document.querySelectorAll('.mag-dot');
  dotEls.forEach((d, i) => {
    d.classList.toggle('mag-dot-active', i === idx);
    d.style.background = i === idx ? tc : '';
  });
}

function _magGoTo(idx) {
  const pages = document.getElementById('mag-pages');
  if (!pages) return;
  pages.scrollTo({ left: idx * pages.clientWidth, behavior: 'smooth' });
}

function render() {
  const container = document.getElementById('store-container');
  if (!container) return;
  container.innerHTML = renderMallSelector();
}

function enterGym() {
  openTrainer();
}

const VIALS = [
  { id:'vial_bronze',  name:'Bronze Vial',  desc:'1.5× XP for 1 week',  mult:1.5, cost:300,  color:'#cd7f32', glow:'#e8a050' },
  { id:'vial_silver',  name:'Silver Vial',  desc:'2× XP for 1 week',    mult:2,   cost:600,  color:'#b0b8c0', glow:'#d8e0e8' },
  { id:'vial_gold',    name:'Gold Vial',    desc:'3× XP for 1 week',    mult:3,   cost:1200, color:'#ffd700', glow:'#ffe860' },
  { id:'vial_mystery', name:'??? Vial',     desc:'Unknown effect…',      mult:5,   cost:2500, color:'#9b30ff', glow:'#cc80ff' },
];

function openBlackMarket() {
  const state = getState();
  const gold = state.gold || 0;
  const now = Date.now();
  // Prefer state.activeVial (persists with account); fall back to legacy localStorage key
  const savedVial = state.activeVial || JSON.parse(localStorage.getItem('iq_active_vial') || 'null');
  const activeVial = savedVial && (savedVial.expiresAt || savedVial.expires) > now ? savedVial : null;
  const remaining = activeVial ? Math.max(0, Math.ceil(((activeVial.expiresAt || activeVial.expires) - now) / 3600000)) : 0;

  const container = document.getElementById('store-container');
  if (!container) return;
  container.innerHTML = `
<div class="mall-wrap">
  <div class="mall-header">
    <div class="mall-title" style="color:#9b30ff">💊 Black Market</div>
    <button class="comp-back-btn" onclick="GainsShop.openBackAlley()" style="margin-left:auto">← Alley</button>
  </div>
  <div style="padding:0 16px 8px;color:#888;font-size:12px;text-align:center;font-style:italic">
    "Whatever it takes." — R.P.
  </div>
  ${activeVial ? `<div style="margin:0 16px 12px;padding:10px 14px;background:#1a1020;border:1px solid #6a20b0;border-radius:8px;font-size:12px;color:#cc80ff;text-align:center">
    ⚗️ <b>${activeVial.name}</b> active — ${remaining}h remaining (${activeVial.mult}× XP)
  </div>` : ''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 16px 24px">
    ${VIALS.map(v => {
      const canAfford = gold >= v.cost;
      const isActive = activeVial && activeVial.id === v.id;
      return `<div style="background:#0e0c12;border:1.5px solid ${v.color}44;border-radius:10px;padding:14px 10px;text-align:center;opacity:${canAfford?'1':'.5'}">
        <!-- Vial SVG -->
        <svg viewBox="0 0 60 100" width="52" height="88" style="display:block;margin:0 auto 8px">
          <defs>
            <radialGradient id="vg_${v.id}" cx="35%" cy="30%">
              <stop offset="0%" stop-color="${v.glow}" stop-opacity=".9"/>
              <stop offset="100%" stop-color="${v.color}" stop-opacity=".6"/>
            </radialGradient>
          </defs>
          <!-- Stopper -->
          <rect x="22" y="8" width="16" height="10" rx="3" fill="#555"/>
          <rect x="24" y="5" width="12" height="6" rx="2" fill="#666"/>
          <!-- Vial body -->
          <rect x="18" y="18" width="24" height="62" rx="12" fill="url(#vg_${v.id})"/>
          <rect x="18" y="18" width="24" height="62" rx="12" fill="none" stroke="${v.color}" stroke-width="1.5"/>
          <!-- Liquid shimmer -->
          <ellipse cx="27" cy="34" rx="6" ry="4" fill="${v.glow}" opacity=".4"/>
          <!-- Bubbles -->
          <circle cx="26" cy="55" r="2.5" fill="${v.glow}" opacity=".3"/>
          <circle cx="33" cy="65" r="1.5" fill="${v.glow}" opacity=".25"/>
          <circle cx="28" cy="72" r="1" fill="${v.glow}" opacity=".2"/>
          <!-- Label -->
          <rect x="20" y="46" width="20" height="18" rx="2" fill="#ffffff18"/>
          <text x="30" y="57" text-anchor="middle" font-size="5" fill="${v.color}" font-weight="700" font-family="sans-serif">${v.mult}×</text>
          <text x="30" y="63" text-anchor="middle" font-size="3.5" fill="#ccc" font-family="sans-serif">XP</text>
        </svg>
        <div style="font-size:12px;font-weight:700;color:${v.color};margin-bottom:3px">${v.name}</div>
        <div style="font-size:10px;color:#aaa;margin-bottom:8px">${v.desc}</div>
        ${isActive
          ? `<div style="font-size:10px;color:#9b30ff;font-weight:700">⚗️ Active</div>`
          : `<button onclick="GainsShop.confirmBuy(this,'buyVial','${v.id}')" style="width:100%;padding:6px 0;background:${canAfford?v.color+'22':'#222'};border:1px solid ${canAfford?v.color:'#444'};border-radius:6px;color:${canAfford?v.color:'#666'};font-size:11px;font-weight:700;cursor:${canAfford?'pointer':'not-allowed'}">
            🪙 ${v.cost.toLocaleString()}
          </button>`
        }
      </div>`;
    }).join('')}
  </div>
  <div style="padding:0 16px 16px;color:#555;font-size:10px;text-align:center">
    Buffs stack additively with existing bonuses. One active at a time.
  </div>
</div>`;
}

function buyVial(id) {
  const v = VIALS.find(x => x.id === id);
  if (!v) return;
  const s = getState();
  if ((s.gold || 0) < v.cost) { showToast('Not enough gold! 💸'); return; }
  s.gold -= v.cost;
  const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
  // Save into main game state so it persists with the account
  s.activeVial = { id: v.id, name: v.name, mult: v.mult, expiresAt };
  saveState(s);
  // Also mirror to standalone key for backward compat / display reads
  localStorage.setItem('iq_active_vial', JSON.stringify({ id: v.id, name: v.name, mult: v.mult, expires: expiresAt }));
  try { MQ.syncStateFromStorage(); } catch(e) {}
  showToast(`💊 ${v.name} activated! ${v.mult}× XP for 1 week`);
  openBlackMarket();
}

function claimDumpster() {
  const s = getState();
  if (s.dumpsterClaimed === todayStr()) {
    showToast('Already dug through this... come back tomorrow.'); return;
  }
  s.dumpsterClaimed = todayStr();
  const roll = Math.random();
  if (roll < 0.45) {
    saveState(s);
    showToast('🗑️ Nothing in there but old receipts...');
    openBackAlley(); return;
  }
  const drops = [
    { name: 'Protein Bar',    emoji: '🍫', bonus: 10, duration: 2, color: '#8B5a30' },
    { name: 'Energy Gel',     emoji: '🟢', bonus: 8,  duration: 1, color: '#2a8a40' },
    { name: 'Creatine Scoop', emoji: '🥄', bonus: 15, duration: 3, color: '#4a70c0' },
  ];
  const drop = roll < 0.7 ? drops[0] : roll < 0.88 ? drops[1] : drops[2];
  if (!s.activeBuffs) s.activeBuffs = [];
  s.activeBuffs = s.activeBuffs.filter(b => b.expiresAt > Date.now());
  s.activeBuffs.push({
    id: 'dumpster_' + drop.name.toLowerCase().replace(/\s/g,'_'),
    name: `Half-eaten ${drop.name}`,
    emoji: drop.emoji,
    bonus: drop.bonus,
    duration: drop.duration,
    expiresAt: Date.now() + drop.duration * 3600 * 1000,
    color: drop.color,
  });
  saveState(s);
  try { MQ.syncStateFromStorage(); } catch(e) {}
  showToast(`${drop.emoji} Found a half-eaten ${drop.name}! +${drop.bonus} XP bonus for ${drop.duration}h`);
  openBackAlley();
}

function openBackAlley() {
  const container = document.getElementById('store-container');
  if (!container) return;
  container.innerHTML = renderBackAlley();
}

function renderBackAlley() {
  return `
<div class="mall-wrap">
  <div class="mall-header">
    <div class="mall-title">🌃 Back Alley</div>
    <button class="comp-back-btn" onclick="GainsShop.render()" style="margin-left:auto">← Mall</button>
  </div>
  <div class="mall-scene-wrap">
    <svg viewBox="0 0 526 480" xmlns="http://www.w3.org/2000/svg" class="mall-scene-svg">

      <!-- Night sky -->
      <rect x="0" y="0" width="526" height="480" fill="#06080a"/>

      <!-- Far back wall (end of alley) -->
      <rect x="130" y="0" width="266" height="280" fill="#0e0c0a"/>
      ${[0,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270].map((y,i) =>
        `<rect x="${130+(i%2)*20}" y="${y}" width="40" height="9" rx="1" fill="#131008"/>
         <rect x="${130+(i%2)*20+42}" y="${y}" width="36" height="9" rx="1" fill="#111008"/>
         <rect x="${130+(i%2)*20+80}" y="${y}" width="40" height="9" rx="1" fill="#131008"/>
         <rect x="${130+(i%2)*20+122}" y="${y}" width="36" height="9" rx="1" fill="#111008"/>
         <rect x="${130+(i%2)*20+160}" y="${y}" width="40" height="9" rx="1" fill="#131008"/>
         <rect x="${130+(i%2)*20+202}" y="${y}" width="30" height="9" rx="1" fill="#111008"/>`
      ).join('')}
      <!-- Graffiti on back wall -->
      <text x="200" y="120" font-size="22" fill="#2a1a2a" font-family="sans-serif" font-weight="700" transform="rotate(-8 200 120)" opacity=".6">5%</text>
      <text x="280" y="180" font-size="14" fill="#1a2a18" font-family="sans-serif" font-weight="700" opacity=".5">WHATEVER</text>
      <text x="270" y="196" font-size="10" fill="#1a2a18" font-family="sans-serif" font-weight="700" opacity=".4">IT TAKES</text>

      <!-- LEFT BRICK WALL -->
      <rect x="0" y="0" width="140" height="480" fill="#0e0c08"/>
      ${[0,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470].map((y,i) =>
        `<rect x="${(i%2)*18}" y="${y}" width="36" height="9" rx="1" fill="#171310"/>
         <rect x="${(i%2)*18+38}" y="${y}" width="38" height="9" rx="1" fill="#151210"/>
         <rect x="${(i%2)*18+78}" y="${y}" width="34" height="9" rx="1" fill="#171310"/>
         <rect x="${(i%2)*18+114}" y="${y}" width="26" height="9" rx="1" fill="#151210"/>`
      ).join('')}
      <!-- Shadow/depth on left wall edge toward alley -->
      <rect x="130" y="0" width="10" height="480" fill="#000" opacity=".5"/>

      <!-- RIGHT BRICK WALL -->
      <rect x="386" y="0" width="140" height="480" fill="#0e0c08"/>
      ${[0,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470].map((y,i) =>
        `<rect x="${386+(i%2)*18}" y="${y}" width="36" height="9" rx="1" fill="#171310"/>
         <rect x="${386+(i%2)*18+38}" y="${y}" width="32" height="9" rx="1" fill="#151210"/>
         <rect x="${386+(i%2)*18+72}" y="${y}" width="36" height="9" rx="1" fill="#171310"/>
         <rect x="${386+(i%2)*18+110}" y="${y}" width="30" height="9" rx="1" fill="#151210"/>`
      ).join('')}
      <!-- Shadow on right wall edge toward alley -->
      <rect x="386" y="0" width="10" height="480" fill="#000" opacity=".5"/>

      <!-- ALLEY FLOOR (perspective) -->
      <polygon points="130,280 396,280 526,480 0,480" fill="#0c0a08"/>
      <!-- Floor cracks and grime lines -->
      <line x1="200" y1="300" x2="180" y2="480" stroke="#0a0806" stroke-width="1.5"/>
      <line x1="300" y1="290" x2="320" y2="480" stroke="#0a0806" stroke-width="1.5"/>
      <line x1="263" y1="280" x2="263" y2="480" stroke="#0a0806" stroke-width="1"/>
      <!-- Puddle reflection (center) -->
      <ellipse cx="263" cy="390" rx="55" ry="18" fill="#0e1218" opacity=".7"/>
      <ellipse cx="263" cy="390" rx="40" ry="12" fill="#101620" opacity=".5"/>

      <!-- STREET LAMP (left side, x≈165) — flickering animation -->
      <style>
        @keyframes flicker {
          0%   { opacity: 1; }
          4%   { opacity: .2; }
          6%   { opacity: 1; }
          62%  { opacity: 1; }
          64%  { opacity: 0; }
          66%  { opacity: 1; }
          68%  { opacity: .4; }
          70%  { opacity: 1; }
          92%  { opacity: 1; }
          94%  { opacity: .1; }
          96%  { opacity: .8; }
          98%  { opacity: .3; }
          100% { opacity: 1; }
        }
        .lamp-flicker { animation: flicker 4.3s ease-in-out infinite; }
      </style>
      <!-- Pole (always on, doesn't flicker) -->
      <rect x="163" y="60" width="6" height="260" rx="3" fill="#1e1c18"/>
      <rect x="164" y="61" width="2" height="258" rx="1" fill="#2a2820" opacity=".6"/>
      <!-- Arm extending right -->
      <rect x="163" y="60" width="50" height="6" rx="3" fill="#1e1c18"/>
      <!-- Lamp head housing (always visible) -->
      <rect x="208" y="48" width="28" height="18" rx="5" fill="#2a2820"/>
      <!-- Everything that flickers -->
      <g class="lamp-flicker">
        <rect x="210" y="50" width="24" height="12" rx="3" fill="#ffe080"/>
        <ellipse cx="222" cy="50" rx="13" ry="4" fill="#fff8c0" opacity=".9"/>
        <!-- Light cone -->
        <polygon points="210,66 234,66 270,200 174,200" fill="#ffd060" opacity=".06"/>
        <polygon points="212,66 232,66 255,160 189,160" fill="#ffd060" opacity=".06"/>
        <polygon points="214,66 230,66 242,120 202,120" fill="#ffd060" opacity=".07"/>
        <!-- Glow halo -->
        <ellipse cx="222" cy="56" rx="22" ry="14" fill="#ffd060" opacity=".12"/>
        <!-- Puddle reflection flickers too -->
        <ellipse cx="185" cy="400" rx="8" ry="3" fill="#ffd060" opacity=".2"/>
      </g>

      <!-- INDUSTRIAL DUMPSTER — left wall side, clickable daily food drop -->
      ${(() => {
        const s = getState();
        const claimed = s.dumpsterClaimed === todayStr();
        return `<g onclick="GainsShop.claimDumpster()" style="cursor:pointer" title="${claimed ? 'Already searched today...' : 'Search the dumpster'}">
          <!-- Main body -->
          <rect x="136" y="300" width="80" height="55" rx="3" fill="${claimed ? '#141810' : '#1a2418'}"/>
          <rect x="138" y="302" width="76" height="51" rx="2" fill="${claimed ? '#181e16' : '#1e2a1c'}"/>
          <!-- Dumpster lid (slightly open) -->
          <rect x="134" y="292" width="84" height="12" rx="2" fill="#222e20" transform="rotate(5 176 298)"/>
          <rect x="134" y="292" width="84" height="4" rx="2" fill="#2a3a28" transform="rotate(5 176 298)"/>
          <!-- Dumpster details / ribs -->
          <rect x="140" y="308" width="72" height="4" rx="1" fill="#162012"/>
          <rect x="140" y="316" width="72" height="4" rx="1" fill="#162012"/>
          <rect x="140" y="324" width="72" height="4" rx="1" fill="#162012"/>
          <!-- Rust streaks -->
          <line x1="152" y1="302" x2="148" y2="355" stroke="#3a2010" stroke-width="1.5" opacity=".6"/>
          <line x1="182" y1="302" x2="180" y2="355" stroke="#3a2010" stroke-width="1" opacity=".5"/>
          <!-- Wheels -->
          <rect x="142" y="352" width="10" height="7" rx="2" fill="#141410"/>
          <rect x="200" y="352" width="10" height="7" rx="2" fill="#141410"/>
          <!-- Trash sticking out -->
          <path d="M152 292 Q157 278 160 290" stroke="#2a3a20" stroke-width="3" fill="none" stroke-linecap="round" transform="rotate(5 156 285)"/>
          <path d="M174 290 Q178 276 182 288" stroke="#3a2a18" stroke-width="2.5" fill="none" stroke-linecap="round" transform="rotate(5 178 283)"/>
          <ellipse cx="196" cy="285" rx="5" ry="3" fill="#1a2010" transform="rotate(5 196 285)"/>
          <!-- Glow pulse when unclaimed -->
          ${!claimed ? `<ellipse cx="176" cy="325" rx="42" ry="30" fill="#40ff40" opacity=".04"><animate attributeName="opacity" values=".04;.10;.04" dur="2.5s" repeatCount="indefinite"/></ellipse>
          <text x="176" y="376" text-anchor="middle" font-size="8" fill="#5a8a50" font-family="sans-serif" opacity=".8">search?</text>` : `<text x="176" y="376" text-anchor="middle" font-size="8" fill="#3a4a38" font-family="sans-serif" opacity=".7">searched</text>`}
        </g>`;
      })()}

      <!-- BURGLAR — peeking from right wall, ski mask, trench coat, slimmer build -->
      <rect x="382" y="200" width="18" height="280" fill="#020200" opacity=".9"/>
      <g onclick="GainsShop.openBlackMarket()" style="cursor:pointer" title="Psst...">

        <!-- Legs — dark trousers -->
        <rect x="366" y="420" width="18" height="50" rx="5" fill="#141218"/>
        <rect x="390" y="420" width="18" height="50" rx="5" fill="#141218"/>
        <!-- Dark boots -->
        <ellipse cx="375" cy="470" rx="14" ry="6" fill="#0a0808"/>
        <ellipse cx="399" cy="470" rx="14" ry="6" fill="#0a0808"/>
        <rect x="362" y="465" width="26" height="6" rx="3" fill="#0e0c0a"/>
        <rect x="387" y="465" width="26" height="6" rx="3" fill="#0e0c0a"/>

        <!-- TRENCH COAT — long dark coat -->
        <rect x="348" y="320" width="86" height="105" rx="6" fill="#1a1612"/>
        <!-- Coat lapels -->
        <polygon points="391,320 370,338 377,395 391,390" fill="#120e0a"/>
        <polygon points="391,320 412,338 405,395 391,390" fill="#120e0a"/>
        <!-- Coat collar up (mysterious) -->
        <polygon points="372,318 391,340 410,318 406,308 391,328 376,308" fill="#0e0a08"/>
        <!-- Belt -->
        <rect x="350" y="390" width="82" height="6" rx="3" fill="#0a0808"/>
        <rect x="383" y="388" width="12" height="10" rx="2" fill="#3a3020"/>

        <!-- Shoulders — slimmer than Rich Piana, still broad -->
        <ellipse cx="336" cy="322" rx="28" ry="24" fill="#1a1612"/>
        <ellipse cx="446" cy="322" rx="28" ry="24" fill="#1a1612"/>

        <!-- Neck — covered by mask -->
        <rect x="376" y="272" width="30" height="50" rx="10" fill="#1a1a1a"/>

        <!-- HEAD — ski mask (full face coverage) -->
        <!-- Mask base (dark grey/black knit) -->
        <ellipse cx="391" cy="248" rx="36" ry="34" fill="#1a1a1a"/>
        <!-- Mask texture lines (knit pattern) -->
        <line x1="360" y1="230" x2="422" y2="230" stroke="#242424" stroke-width="1.5"/>
        <line x1="358" y1="240" x2="424" y2="240" stroke="#242424" stroke-width="1.5"/>
        <line x1="358" y1="250" x2="424" y2="250" stroke="#242424" stroke-width="1.5"/>
        <line x1="360" y1="260" x2="422" y2="260" stroke="#242424" stroke-width="1.5"/>
        <line x1="364" y1="270" x2="418" y2="270" stroke="#242424" stroke-width="1.5"/>
        <!-- Eye holes in mask -->
        <ellipse cx="378" cy="244" rx="10" ry="9" fill="#0a0808"/>
        <ellipse cx="404" cy="244" rx="10" ry="9" fill="#0a0808"/>
        <!-- Eyes (shifty, glowing in the dark) -->
        <ellipse cx="378" cy="244" rx="7" ry="7" fill="#fff"/>
        <ellipse cx="404" cy="244" rx="7" ry="7" fill="#fff"/>
        <ellipse cx="380" cy="245" rx="4.5" ry="5" fill="#1a3a10"/>
        <ellipse cx="406" cy="245" rx="4.5" ry="5" fill="#1a3a10"/>
        <ellipse cx="381" cy="244" rx="2" ry="2.5" fill="#0a0806"/>
        <ellipse cx="407" cy="244" rx="2" ry="2.5" fill="#0a0806"/>
        <ellipse cx="379" cy="242" rx="1" ry="1" fill="#fff" opacity=".9"/>
        <ellipse cx="405" cy="242" rx="1" ry="1" fill="#fff" opacity=".9"/>
        <!-- Mouth hole (smirking slit) -->
        <ellipse cx="391" cy="268" rx="10" ry="5" fill="#0a0808"/>
        <path d="M382 268 Q391 274 400 268" stroke="#6a3010" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Mask rolled up at forehead -->
        <rect x="358" y="213" width="66" height="10" rx="5" fill="#222222"/>
        <rect x="358" y="213" width="66" height="5" rx="3" fill="#2a2a2a"/>

        <!-- Left arm reaching out (slimmer) -->
        <ellipse cx="315" cy="358" rx="20" ry="16" fill="#1a1612"/>
        <ellipse cx="284" cy="372" rx="16" ry="13" fill="#141210"/>
        <!-- Gloved hand -->
        <ellipse cx="265" cy="378" rx="15" ry="9" fill="#0a0808"/>
        <line x1="256" y1="372" x2="251" y2="364" stroke="#0e0c0a" stroke-width="5" stroke-linecap="round"/>
        <line x1="262" y1="369" x2="258" y2="360" stroke="#0e0c0a" stroke-width="5" stroke-linecap="round"/>
        <line x1="268" y1="368" x2="266" y2="359" stroke="#0e0c0a" stroke-width="5" stroke-linecap="round"/>
        <line x1="274" y1="370" x2="273" y2="361" stroke="#0e0c0a" stroke-width="5" stroke-linecap="round"/>

        <!-- "Psst..." speech bubble -->
        <ellipse cx="306" cy="196" rx="40" ry="20" fill="#1e1c18" stroke="#3a3628" stroke-width="1.5"/>
        <polygon points="318,214 311,230 326,218" fill="#1e1c18"/>
        <text x="306" y="201" text-anchor="middle" font-size="11" fill="#ffd700" font-family="sans-serif" font-style="italic" font-weight="700">Psst...</text>
        <text x="306" y="212" text-anchor="middle" font-size="7" fill="#aaa" font-family="sans-serif">tap me 👀</text>

        <!-- Clip right wall so he's peeking -->
        <rect x="420" y="180" width="110" height="300" fill="#0e0c08"/>
      </g>

      <!-- Atmosphere: distant alley light spill from back -->
      <ellipse cx="263" cy="282" rx="60" ry="12" fill="#1a1408" opacity=".6"/>

      <!-- Dripping water from pipe (left wall) -->
      <rect x="136" y="140" width="5" height="40" rx="2" fill="#1c2428"/>
      <ellipse cx="138" cy="182" rx="4" ry="6" fill="#1a2830" opacity=".8"/>
      <ellipse cx="139" cy="210" rx="3" ry="4" fill="#1a2830" opacity=".6"/>
      <ellipse cx="138" cy="230" rx="2" ry="3" fill="#1a2830" opacity=".4"/>

    </svg>
    <p class="mall-tap-hint">⚠️ Black Market — high risk, high reward</p>
  </div>
</div>`;
}

// ─── HOME WORKOUT MAGAZINE ──────────────────────────────────────────────────

function openHomeMag() {
  const container = document.getElementById('store-container');
  if (!container) return;

  const tc = '#3a9a60', tg = '#3a9a6044';

  const pxTitle = (emoji, label) =>
    `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <span style="font-size:16px">${emoji}</span>
      <span style="font-family:'Press Start 2P',monospace;font-size:9px;color:${tc};line-height:1.4">${label.toUpperCase()}</span>
      <div style="flex:1;height:1px;background:${tc};opacity:0.25"></div>
    </div>`;

  // Page 1: Cover
  const page1 = `
  <div class="mag-page" style="background:#0a1a10;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px);background-size:8px 8px;pointer-events:none"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#050f0aee 0%,#0a1a10cc 60%,#050f0aee 100%);pointer-events:none"></div>
    <div style="position:relative;padding:14px 16px 0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;border-bottom:2px solid ${tc};padding-bottom:8px">
        <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:${tc};letter-spacing:1px">IRONLORE</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:rgba(255,255,255,0.4)">HOME SERIES</div>
      </div>
      <div style="font-family:'Press Start 2P',monospace;font-size:18px;color:#fff;line-height:1.4;text-shadow:3px 3px 0 ${tc},5px 5px 0 ${tc}44;margin-bottom:6px">NO<br>WEIGHTS.</div>
      <div style="font-family:'Press Start 2P',monospace;font-size:14px;color:${tc};line-height:1.4;margin-bottom:4px">NO PROBLEM.</div>
      <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:rgba(255,255,255,0.5);margin-bottom:16px">YOUR BODY IS THE GYM</div>
      <div style="display:flex;align-items:flex-start;justify-content:space-between;min-height:140px">
        <div style="display:flex;flex-direction:column;gap:6px;min-width:90px">
          ${['💪 PUSH','🔄 PULL','🦵 LEGS','🔥 CARDIO','🧘 CORE'].map(t =>
            `<div style="font-family:'Press Start 2P',monospace;font-size:5px;color:rgba(255,255,255,0.55);border-left:2px solid ${tc};padding-left:6px;line-height:2">${t}</div>`
          ).join('')}
        </div>
        <div style="font-size:64px;line-height:1">🏠</div>
      </div>
      <div style="height:2px;background:linear-gradient(90deg,transparent,${tc},transparent);margin:10px 0"></div>
      <div style="font-size:11px;font-style:italic;color:rgba(255,255,255,0.8);line-height:1.6;margin-bottom:10px">"The best gym is the one you actually show up to."</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:16px">
        <div style="font-family:'Press Start 2P',monospace;font-size:6px;color:${tc};border:1px solid ${tc};padding:5px 8px">AT HOME</div>
        <div style="font-family:'Press Start 2P',monospace;font-size:6px;color:rgba(255,255,255,0.25)">SWIPE ▶</div>
      </div>
    </div>
  </div>`;

  // Page 2: AthleanX Home Split
  const homeSplit = [
    { day:'MON — PUSH', exercises:['Push-ups 4×15','Pike Push-ups 3×10','Diamond Push-ups 3×12','Dips (chair) 3×12','Lateral Raises (bands) 3×15'] },
    { day:'TUE — PULL', exercises:['Inverted Rows (table) 4×10','Door-frame Curls 3×12','Towel Rows 3×12','Superman Hold 3×30s','Band Pull-aparts 3×15'] },
    { day:'WED — LEGS', exercises:['Bodyweight Squats 4×20','Bulgarian Split Squat 3×10 ea','Glute Bridge 3×15','Wall Sit 3×45s','Calf Raises 3×25'] },
    { day:'THU — ACTIVE RECOVERY', exercises:['Mobility flow 20 min','Foam roller / stretching','Light walk 20–30 min'] },
    { day:'FRI — PUSH + CORE', exercises:['Wide Push-ups 4×15','Decline Push-ups 3×12','Plank 3×45s','Hollow Body Hold 3×30s','Ab Wheel (or sliding) 3×10'] },
    { day:'SAT — FULL BODY HIIT', exercises:['Burpees 4×10','Jump Squats 3×15','Mountain Climbers 3×30s','Push-up Jacks 3×12','Sprint in place 4×20s'] },
    { day:'SUN — REST', exercises:['Rest & recover','Hydrate well','Optional: 20 min walk'] },
  ];
  const page2 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 16px">
    ${pxTitle('📋','Home Split')}
    <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:14px;line-height:1.6">AthleanX-style bodyweight programming — no equipment needed.</div>
    ${homeSplit.map((day, i) => `
      <div class="mag-day-card" style="background:${i%2===0?'#0e1a12':'#0a1410'};border:1px solid ${tc}33">
        <div class="mag-day-label" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:6px;line-height:1.8">${day.day}</div>
        <ul class="mag-day-exercises">
          ${day.exercises.map(e => `<li>${e}</li>`).join('')}
        </ul>
      </div>`).join('')}
    <button class="mag-adopt-btn" onclick="MQ.adoptHomeSplit()"
      style="background:${tc};color:#fff;box-shadow:0 4px 20px ${tc}66;font-family:'Press Start 2P',monospace;font-size:8px;margin-top:14px">
      + ADOPT SPLIT
    </button>
  </div>`;

  // Page 3: Philosophy
  const page3 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 80px">
    ${pxTitle('🧠','The Principles')}
    <div style="background:${tc}18;border-left:3px solid ${tc};border-radius:0 8px 8px 0;padding:12px 14px;margin-bottom:20px;font-family:'Press Start 2P',monospace;font-size:7px;color:${tc};line-height:2">ATHLEANX APPROACH</div>
    ${[
      'Train the movement, not just the muscle — every bodyweight rep has a purpose.',
      'Progressive overload still applies — harder variations, more reps, shorter rest.',
      'Consistency at home beats sporadic gym sessions every time.',
      'Core is always on — brace on every push, pull, and squat.',
      'Recovery is training — the body grows when you rest, not just when you work.',
    ].map((p, i) => `
      <div class="mag-principle-row">
        <div class="mag-principle-num" style="color:${tc}66;font-family:'Press Start 2P',monospace;font-size:14px">${String(i+1).padStart(2,'0')}</div>
        <div class="mag-principle-text">${p}</div>
      </div>`).join('')}
  </div>`;

  // Page 4: Stats
  const page4 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 80px">
    ${pxTitle('🏆','Best For')}
    <div class="mag-stat-row">
      <div class="mag-stat-box" style="border:1px solid ${tc}33">
        <div class="mag-stat-val" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:18px">7</div>
        <div class="mag-stat-lbl">Day Structure</div>
      </div>
      <div class="mag-stat-box" style="border:1px solid ${tc}33">
        <div class="mag-stat-val" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:18px">0</div>
        <div class="mag-stat-lbl">Equipment</div>
      </div>
    </div>
    <div class="mag-stat-row">
      <div class="mag-stat-box" style="border:1px solid ${tc}33">
        <div class="mag-stat-val" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:14px">ALL</div>
        <div class="mag-stat-lbl">Fitness Levels</div>
      </div>
      <div class="mag-stat-box" style="border:1px solid ${tc}33">
        <div class="mag-stat-val" style="color:${tc};font-family:'Press Start 2P',monospace;font-size:14px">30+</div>
        <div class="mag-stat-lbl">Min / Session</div>
      </div>
    </div>
    <div style="margin-top:20px;padding:14px;background:#0a1a10;border-radius:10px;border:1px solid ${tc}33">
      <div style="font-size:11px;color:rgba(255,255,255,0.7);line-height:1.7">
        <strong style="color:${tc}">Who this is for:</strong> Anyone without gym access, travelers, beginners building a foundation, or athletes maintaining conditioning between sessions.
      </div>
    </div>
    <div style="margin-top:16px;padding:12px;background:#0a1a10;border-radius:10px;border:1px solid ${tc}22">
      <div style="font-size:10px;color:rgba(255,255,255,0.5);line-height:1.8">
        <strong style="color:rgba(255,255,255,0.7)">Quick tip:</strong> Elevate feet on a chair for harder push variations. Use a backpack filled with books for weighted bodyweight moves.
      </div>
    </div>
  </div>`;

  // Page 5: Watch & Learn
  const watchLinks = [
    { icon:'🎬', label:'No Equipment Home Workout', sub:'AthleanX full body — zero gear needed', url:'https://www.youtube.com/results?search_query=AthleanX+no+equipment+home+workout' },
    { icon:'💪', label:'The Push-Pull-Legs Home Program', sub:'AthleanX complete PPL for home training', url:'https://www.youtube.com/results?search_query=AthleanX+push+pull+legs+home+workout' },
    { icon:'🔥', label:'Best Home Cardio (No Jumping)', sub:'AthleanX cardio without disturbing neighbors', url:'https://www.youtube.com/results?search_query=AthleanX+home+cardio+no+jumping' },
  ];
  const page5 = `
  <div class="mag-page" style="background:#0d0f1a;padding:20px 16px 80px">
    ${pxTitle('▶','Watch & Learn')}
    <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:18px;line-height:1.6">Curated AthleanX videos for no-equipment training.</div>
    ${watchLinks.map((lk,i) => `
      <a href="${lk.url}" target="_blank" rel="noopener" style="display:block;text-decoration:none;background:${i%2===0?'#0e1a12':'#0a1410'};border:1px solid ${tc}33;border-radius:10px;padding:14px;margin-bottom:12px">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <span style="font-size:22px;flex-shrink:0">${lk.icon}</span>
          <div>
            <div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:4px;line-height:1.4">${lk.label}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.5);line-height:1.5">${lk.sub}</div>
            <div style="font-size:9px;color:${tc};margin-top:6px">youtube.com ↗</div>
          </div>
        </div>
      </a>`).join('')}
  </div>`;

  const pages = [page1, page2, page3, page4, page5];
  const dots = pages.map((_,i) =>
    `<div class="mag-dot${i===0?' mag-dot-active':''}" onclick="GainsShop._magGoTo(${i})" style="background:${i===0?tc:'rgba(255,255,255,0.2)'}"></div>`
  ).join('');

  container.innerHTML = `
  <div class="trainer-lobby" style="max-width:480px;margin:0 auto">
    <div class="store-back-bar">
      <button class="store-back-btn" onclick="GainsShop.enterGym()">← Gym</button>
      <span class="store-back-title">Home Workouts</span>
    </div>
    <div class="mag-reader" id="mag-reader">
      <div class="mag-pages" id="mag-pages" onscroll="GainsShop._magScroll()">
        ${pages.join('')}
      </div>
      <div class="mag-dots">${dots}</div>
    </div>
  </div>`;
}

// ─── PET STORE ───────────────────────────────────────────────────────────────

const PETS = [
  { id:'dog_golden',  name:'Golden Retriever',  emoji:'🐕', price:800,  desc:'Loyal, energetic, always happy to see you.',    color:'#c8902a' },
  { id:'dog_bulldog', name:'Bulldog',            emoji:'🐶', price:600,  desc:'Chill vibes only. Naps like a champion.',        color:'#a07840' },
  { id:'cat_persian', name:'Persian Cat',        emoji:'🐱', price:700,  desc:'Fluffy, regal, and will judge your form.',       color:'#d4b090' },
  { id:'cat_tabby',   name:'Tabby Cat',          emoji:'😸', price:450,  desc:'Scrappy, curious, zoomies at 3am guaranteed.',   color:'#806040' },
  { id:'bird_parrot', name:'Parrot',             emoji:'🦜', price:900,  desc:'Will learn your PR screams and repeat them.',    color:'#28a040' },
  { id:'hamster',     name:'Hamster',            emoji:'🐹', price:200,  desc:'Runs on a wheel. Relatable.',                    color:'#d4a060' },
  { id:'bunny',       name:'Bunny',              emoji:'🐰', price:350,  desc:'Soft, fast, hops when you do squats.',           color:'#e0d0c0' },
  { id:'raccoon',     name:'Raccoon',            emoji:'🦝', price:1200, desc:'Chaotic good. Will steal your pre-workout.',     color:'#707070' },
  { id:'fish',        name:'Betta Fish',         emoji:'🐠', price:150,  desc:'Low maintenance, high aesthetics.',              color:'#2060d0' },
];

const PET_FOOD = { id:'animal_chow', name:'Animal Chow 🍖', price:80, desc:'Universal pet food. Keeps any pet happy for 24 hours.' };

function openPetStore() {
  const container = document.getElementById('store-container');
  if (!container) return;
  _renderPetStore(container);
}

// ─── Pet pixel-art sprite definitions ──────────────────────────────────────
const SPRITE_DEFS = {
  hamster:     { W:9, H:8,  pal:{b:'#d4a060',d:'#a06828',e:'#2a1400',n:'#ff9090',a:'#f0a0a0'}, rows:['...aba...','..bbbbb..','..bbbbb..','bbebebbbb','bbbbnbbbb','.bbbbbbb.','..bbbbb..','...bbb...'] },
  bunny:       { W:8, H:9,  pal:{b:'#e8ddd0',d:'#c0b090',e:'#3a2020',n:'#ffaaaa'},              rows:['.bb..bb.','.bb..bb.','.bbbbbb.','bbbbbbbb','.bebebb.','..bbnb..','.bbbbbb.','bbbbbbbb','..bbbb..'] },
  bird_parrot: { W:9, H:9,  pal:{b:'#28a040',d:'#1a7030',e:'#1a0a00',y:'#f0c820',r:'#e03020'}, rows:['.bbbbbbb.','bbbbbbbbb','bbyeybbbb','.byyy....','bbrbbbbbb','bbrrrrbbb','bbbrrrrbb','.bbbbbbb.','..bbbbb..'] },
  cat_persian: { W:9, H:9,  pal:{b:'#d4b090',d:'#b89060',e:'#4a3020',n:'#e08080'},              rows:['b.bbbbb.b','bbbbbbbbb','bbbbbbbbb','.bebebbb.','.bbbnbb..','.bbbbbbb.','bbbbbbbbb','.bbbbbbb.','..bb.bb..'] },
  cat_tabby:   { W:9, H:9,  pal:{b:'#9a7848',d:'#6a5028',e:'#3a2010',n:'#d07060'},              rows:['d.ddddd.d','ddddddddd','bbbbbbbbb','.dededed.','.dddnddd.','.ddddddd.','bbbbbbbbb','.ddddddd.','..dd.dd..'] },
  raccoon:     { W:9, H:9,  pal:{b:'#888888',d:'#2a2a2a',e:'#111111',w:'#d8d8d8',m:'#404040'}, rows:['b.bbbbb.b','bbbbbbbbb','mmmbbmmmm','mmememmmm','.bbwwwbb.','.bbbbbbb.','bbbbbbbbb','.bbbbbbb.','..bb.bb..'] },
  dog_golden:  { W:9, H:9,  pal:{b:'#c8902a',d:'#a06818',e:'#2a1400',n:'#1a0a00'},              rows:['.dd...dd.','.bbbbbbb.','bbbbbbbbb','.bebebbb.','.bbbnbbb.','..bbbbb..','.bbbbbbb.','bbbbbbbbb','.bb...bb.'] },
  dog_bulldog: { W:9, H:9,  pal:{b:'#a07840',d:'#7a5828',e:'#3a2010',j:'#c89860',n:'#c88850'}, rows:['dd.....dd','ddddddddd','bbbbbbbbb','.bebebbb.','bbjjjjjbb','..bbbbb..','.bbbbbbb.','bbbbbbbbb','.bb...bb.'] },
};

// Returns SVG <g> elements for embedding inside a parent SVG (cage display)
function _petBodySVG(pid, cx, cageTopY, cageW, cageH) {
  const spec = SPRITE_DEFS[pid];
  if (!spec) return '';
  const Z = cageH > 80 ? 4 : 3;
  const spriteW = spec.W * Z, spriteH = spec.H * Z;
  const sx = cx - spriteW / 2;
  const sy = cageTopY + Math.round(cageH * 0.07);
  let out = '<g shape-rendering="crispEdges">';
  for (let r = 0; r < spec.rows.length; r++) {
    const row = spec.rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') continue;
      const col = spec.pal[ch];
      if (!col) continue;
      out += '<rect x="' + Math.round(sx + c*Z) + '" y="' + Math.round(sy + r*Z) + '" width="' + Z + '" height="' + Z + '" fill="' + col + '"/>';
    }
  }
  out += '</g>';
  return out;
}

// Returns a standalone <svg> tag suitable for an img or div
function _petIcon(pid, size) {
  const spec = SPRITE_DEFS[pid];
  if (!spec) return '';
  const Z = 3;
  const W = spec.W * Z, H = spec.H * Z;
  const s2 = size || 54;
  let inner = '';
  for (let r = 0; r < spec.rows.length; r++) {
    const row = spec.rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') continue;
      const col = spec.pal[ch];
      if (!col) continue;
      inner += '<rect x="' + (c*Z) + '" y="' + (r*Z) + '" width="' + Z + '" height="' + Z + '" fill="' + col + '"/>';
    }
  }
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + s2 + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">' + inner + '</svg>';
}

// ─── Pet Store interior renderer ────────────────────────────────────────────
function _renderPetStore(container) {
  const s = getState();
  const gold = s.gold || 0;
  const owned = s.pets || {};
  const fedAt = s.petFedAt || {};
  const food = s.petFoodCount || 0;
  const now = Date.now();

  // Wire cage for back wall shelves
  const cg = (pid, x, y, w, h) => {
    const p = PETS.find(q => q.id === pid);
    const isOwned = !!owned[pid];
    const isFed = isOwned && fedAt[pid] && (now - fedAt[pid] < 864e5);
    const stroke = isOwned ? p.color : '#4a7a50';
    const nb = Math.max(2, Math.floor((w - 8) / 13));
    let bars = '';
    for (let i = 0; i <= nb; i++) {
      const bx = x + 4 + Math.round(i * (w - 8) / nb);
      bars += '<line x1="' + bx + '" y1="' + (y+2) + '" x2="' + bx + '" y2="' + (y+h-2) + '" stroke="#3a7a3a" stroke-width="1.1"/>';
    }
    return '<g class="pet-cage-btn" onclick="GainsShop._clickPetCage(\'' + pid + '\')" style="cursor:pointer">'
      + (isOwned ? '<rect x="' + (x-2) + '" y="' + (y-2) + '" width="' + (w+4) + '" height="' + (h+4) + '" rx="5" fill="' + p.color + '" opacity=".14"/>' : '')
      + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="#0c1a0c" stroke="' + stroke + '" stroke-width="' + (isOwned ? 2.2 : 1.3) + '"/>'
      + bars
      + '<line x1="' + x + '" y1="' + (y + Math.round(h*0.54)) + '" x2="' + (x+w) + '" y2="' + (y + Math.round(h*0.54)) + '" stroke="#3a7a3a" stroke-width=".8" opacity=".32"/>'
      + _petBodySVG(pid, x + w/2, y, w, h)
      + (isFed ? '<text x="' + (x+w-3) + '" y="' + (y+3) + '" text-anchor="end" font-size="11" dominant-baseline="hanging">❤️</text>' : '')
      + (isOwned ? '<rect x="' + (x+2) + '" y="' + (y+2) + '" width="' + (w-4) + '" height="3" rx="1" fill="' + p.color + '" opacity=".5"/>' : '')
      + '<text x="' + (x + w/2) + '" y="' + (y+h+11) + '" text-anchor="middle" font-size="6" fill="#88cc88" font-family="sans-serif">' + p.name + '</text>'
      + '</g>';
  };

  // Aquarium for betta fish
  const tank = (x, y, w, h) => {
    const isOwned = !!owned['fish'];
    const isFed = isOwned && fedAt['fish'] && (now - fedAt['fish'] < 864e5);
    const stroke = isOwned ? '#0088ff' : '#1a4a8a';
    const fx = x + Math.round(w*0.28), fy = y + Math.round(h*0.6);
    const ftx = x + Math.round(w*0.66), fty = y + Math.round(h*0.6);
    return '<g class="pet-cage-btn" onclick="GainsShop._clickPetCage(\'fish\')" style="cursor:pointer">'
      + (isOwned ? '<rect x="' + (x-2) + '" y="' + (y-2) + '" width="' + (w+4) + '" height="' + (h+4) + '" rx="7" fill="#0088ff" opacity=".1"/>' : '')
      + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5" fill="#041828" stroke="' + stroke + '" stroke-width="' + (isOwned ? 2.2 : 1.5) + '"/>'
      + '<rect x="' + (x+3) + '" y="' + (y+3) + '" width="' + (w-6) + '" height="' + (h-6) + '" rx="4" fill="#062040"/>'
      + '<rect x="' + (x+3) + '" y="' + (y+3) + '" width="' + (w-6) + '" height="12" rx="3" fill="#1a4a7a"/>'
      + '<path d="M' + (x+10) + ' ' + (y+Math.round(h*0.58)) + 'Q' + (x+Math.round(w*0.4)) + ' ' + (y+Math.round(h*0.42)) + ' ' + (x+Math.round(w*0.62)) + ' ' + (y+Math.round(h*0.58)) + 'Q' + (x+Math.round(w*0.82)) + ' ' + (y+Math.round(h*0.72)) + ' ' + (x+w-10) + ' ' + (y+Math.round(h*0.58)) + '" stroke="#4af" stroke-width="1.5" fill="none" opacity=".5"/>'
      + '<path d="M' + fx + ' ' + fy + 'Q' + (x+Math.round(w*0.5)) + ' ' + (y+Math.round(h*0.48)) + ' ' + ftx + ' ' + fy + 'Q' + (x+Math.round(w*0.5)) + ' ' + (y+Math.round(h*0.72)) + ' ' + fx + ' ' + fy + 'Z" fill="#ff6820"/>'
      + '<path d="M' + (fx-4) + ' ' + (fy-6) + 'L' + (fx-11) + ' ' + (fy-12) + 'L' + (fx-11) + ' ' + (fy+4) + 'Z" fill="#ff6820"/>'
      + '<circle cx="' + (x+Math.round(w*0.62)) + '" cy="' + (y+Math.round(h*0.3)) + '" r="2.5" fill="none" stroke="#88ccff" stroke-width=".9" opacity=".6"/>'
      + '<circle cx="' + (x+Math.round(w*0.75)) + '" cy="' + (y+Math.round(h*0.18)) + '" r="1.8" fill="none" stroke="#88ccff" stroke-width=".9" opacity=".4"/>'
      + (isFed ? '<text x="' + (x+w-3) + '" y="' + (y+3) + '" text-anchor="end" font-size="11" dominant-baseline="hanging">❤️</text>' : '')
      + '<text x="' + (x+w/2) + '" y="' + (y+h+11) + '" text-anchor="middle" font-size="6" fill="#88ccff" font-family="sans-serif">Betta Fish</text>'
      + '</g>';
  };

  // Food cabinet
  const foodCab = (x, y, w, h) => {
    const midY = y + 18 + Math.round((h - 26) / 2);
    return '<g onclick="GainsShop._buyPetFood()" style="cursor:pointer">'
      + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="4" fill="#3a2808" stroke="#6a4818" stroke-width="1.5"/>'
      + '<rect x="' + (x+4) + '" y="' + (y+18) + '" width="' + (w-8) + '" height="' + (h-26) + '" rx="2" fill="#4a3210" stroke="#6a4818" stroke-width="1"/>'
      + '<line x1="' + (x+4) + '" y1="' + midY + '" x2="' + (x+w-4) + '" y2="' + midY + '" stroke="#6a4818" stroke-width="1"/>'
      + '<rect x="' + (x+7) + '" y="' + (y+21) + '" width="11" height="16" rx="2" fill="#c05020"/>'
      + '<rect x="' + (x+20) + '" y="' + (y+23) + '" width="9" height="14" rx="2" fill="#d08020"/>'
      + '<rect x="' + (x+7) + '" y="' + (midY+4) + '" width="11" height="16" rx="2" fill="#c05020"/>'
      + '<rect x="' + (x+20) + '" y="' + (midY+6) + '" width="9" height="14" rx="2" fill="#d08020"/>'
      + '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="16" rx="4" fill="#5a3a10"/>'
      + '<text x="' + (x+w/2) + '" y="' + (y+12) + '" text-anchor="middle" font-size="7" fill="#f0d080" font-family="sans-serif" font-weight="700" dominant-baseline="auto">🍖 CHOW</text>'
      + '<circle cx="' + (x+w/2) + '" cy="' + (midY + Math.round((h-26)/4) + 8) + '" r="3.5" fill="#c0a030"/>'
      + (food > 0 ? '<circle cx="' + (x+w-6) + '" cy="' + (y+6) + '" r="9" fill="#ff6020"/><text x="' + (x+w-6) + '" y="' + (y+11) + '" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="700" dominant-baseline="auto">' + food + '</text>' : '')
      + '<text x="' + (x+w/2) + '" y="' + (y+h+11) + '" text-anchor="middle" font-size="6" fill="#f0c060" font-family="sans-serif">Animal Chow</text>'
      + '</g>';
  };

  const FLY = 168;

  const svgInterior = '<svg viewBox="0 0 380 312" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">'
    // ─ ROOM SHELL ─
    + '<rect x="0" y="0" width="380" height="14" fill="#1e1008"/>'
    // ceiling light strips
    + '<rect x="55" y="2" width="80" height="5" rx="2" fill="#ffe8a0" opacity=".32"/>'
    + '<rect x="245" y="2" width="80" height="5" rx="2" fill="#ffe8a0" opacity=".32"/>'
    + '<ellipse cx="95" cy="12" rx="65" ry="7" fill="#ffe8a0" opacity=".05"/>'
    + '<ellipse cx="285" cy="12" rx="65" ry="7" fill="#ffe8a0" opacity=".05"/>'
    // back wall
    + '<rect x="0" y="14" width="380" height="154" fill="#e8dccc"/>'
    // side shadow hints
    + '<rect x="0" y="14" width="16" height="154" fill="#00000015"/>'
    + '<rect x="364" y="14" width="16" height="154" fill="#00000015"/>'
    // floor
    + '<rect x="0" y="168" width="380" height="144" fill="#c8aa78"/>'
    + '<line x1="0" y1="168" x2="380" y2="168" stroke="#a08858" stroke-width="2"/>'
    + '<line x1="0" y1="194" x2="380" y2="194" stroke="#b89860" stroke-width=".6"/>'
    + '<line x1="0" y1="220" x2="380" y2="220" stroke="#b89860" stroke-width=".6"/>'
    + '<line x1="0" y1="246" x2="380" y2="246" stroke="#b89860" stroke-width=".6"/>'
    + '<line x1="0" y1="272" x2="380" y2="272" stroke="#b89860" stroke-width=".6"/>'
    + '<line x1="76" y1="168" x2="76" y2="312" stroke="#b89860" stroke-width=".6"/>'
    + '<line x1="152" y1="168" x2="152" y2="312" stroke="#b89860" stroke-width=".6"/>'
    + '<line x1="228" y1="168" x2="228" y2="312" stroke="#b89860" stroke-width=".6"/>'
    + '<line x1="304" y1="168" x2="304" y2="312" stroke="#b89860" stroke-width=".6"/>'
    // floor paw prints
    + '<circle cx="186" cy="242" r="5" fill="#a09070" opacity=".38"/>'
    + '<circle cx="180" cy="234" r="2.5" fill="#a09070" opacity=".38"/>'
    + '<circle cx="186" cy="231" r="2.5" fill="#a09070" opacity=".38"/>'
    + '<circle cx="192" cy="234" r="2.5" fill="#a09070" opacity=".38"/>'
    + '<circle cx="214" cy="274" r="5" fill="#a09070" opacity=".28"/>'
    + '<circle cx="208" cy="266" r="2.5" fill="#a09070" opacity=".28"/>'
    + '<circle cx="214" cy="263" r="2.5" fill="#a09070" opacity=".28"/>'
    + '<circle cx="220" cy="266" r="2.5" fill="#a09070" opacity=".28"/>'
    // ─ BACK WALL SHELVING ─
    + '<rect x="6" y="14" width="368" height="7" rx="2" fill="#7a5028"/>'
    + '<rect x="6" y="14" width="368" height="3" rx="1" fill="#9a6838"/>'
    + '<rect x="6" y="78" width="368" height="7" rx="2" fill="#7a5028"/>'
    + '<rect x="6" y="78" width="368" height="3" rx="1" fill="#9a6838"/>'
    + '<rect x="6" y="140" width="368" height="7" rx="2" fill="#7a5028"/>'
    + '<rect x="6" y="140" width="368" height="3" rx="1" fill="#9a6838"/>'
    + '<rect x="6" y="14" width="5" height="154" fill="#6a4020"/>'
    + '<rect x="131" y="14" width="5" height="154" fill="#6a4020"/>'
    + '<rect x="249" y="14" width="5" height="154" fill="#6a4020"/>'
    + '<rect x="369" y="14" width="5" height="154" fill="#6a4020"/>'
    // ─ TIER 1 top shelf: hamster · bird_parrot · bunny ─
    + cg('hamster',     12,  21, 113, 55)
    + cg('bird_parrot', 138, 21, 107, 55)
    + cg('bunny',       256, 21, 116, 55)
    // ─ TIER 2 mid shelf: cat_persian · cat_tabby · raccoon ─
    + cg('cat_persian', 12,  85, 113, 52)
    + cg('cat_tabby',   138, 85, 107, 52)
    + cg('raccoon',     256, 85, 116, 52)
    // ─ FLOOR: dog cages · food cabinet · fish tank ─
    + cg('dog_golden',  10,  FLY,    86, 94)
    + cg('dog_bulldog', 102, FLY,    86, 94)
    + foodCab(194, FLY,    74, 94)
    + tank(274, FLY - 4, 98, 98)
    + '</svg>';

  container.innerHTML = `
  <div style="max-width:480px;margin:0 auto;padding-bottom:40px">
    <div class="store-back-bar">
      <button class="store-back-btn" onclick="GainsShop.render()">← Mall</button>
      <span class="store-back-title">Paw &amp; Prowl 🐾</span>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 4px 10px">
      <div style="font-size:12px;color:#ffd700"><i class="ti ti-coin"></i> ${gold.toLocaleString()}</div>
      <div style="font-size:11px;color:#88cc88">🍖 Animal Chow × ${food}</div>
    </div>
    <div style="border-radius:14px;overflow:hidden;border:2px solid #4a3a1a">${svgInterior}</div>
    <div id="pet-detail-panel" style="margin-top:14px">
      <div style="text-align:center;font-size:11px;color:rgba(255,255,255,0.4);padding:12px">Tap a cage to adopt or feed a pet</div>
    </div>
  </div>`;
}

function _clickPetCage(petId) {
  const s = getState();
  const owned = s.pets || {};
  const fedAt = s.petFedAt || {};
  const gold = s.gold || 0;
  const food = s.petFoodCount || 0;
  const now = Date.now();
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return;
  const isOwned = !!owned[petId];
  const isFed = isOwned && fedAt[petId] && (now - fedAt[petId] < 864e5);
  const hoursLeft = isFed ? Math.ceil((864e5 - (now - fedAt[petId])) / 3600000) : 0;
  const panel = document.getElementById('pet-detail-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div style="background:#0d1a0e;border:1px solid ${isOwned ? pet.color + '55' : '#2a4028'};border-radius:14px;padding:16px;animation:fadeIn .15s ease">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="font-size:40px;line-height:1">${pet.emoji}</div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:3px">${pet.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,0.55);line-height:1.5">${pet.desc}</div>
          ${isFed ? `<div style="font-size:10px;color:#ff9999;margin-top:5px">❤️ Happy for ${hoursLeft}h more</div>` : ''}
        </div>
      </div>
      ${isOwned
        ? `<div style="display:flex;gap:10px">
            <div style="flex:1;padding:10px;background:#0a1a0a;border-radius:8px;text-align:center;font-size:11px;color:#88cc88">✓ Adopted</div>
            <button onclick="GainsShop._feedPet('${petId}')" style="flex:2;padding:10px;background:${food > 0 ? pet.color : '#2a2a2a'};color:${food > 0 ? '#fff' : '#555'};border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:${food > 0 ? 'pointer' : 'default'}">${food > 0 ? 'Feed ' + pet.emoji + ' 🍖' : 'Need Animal Chow first'}</button>
          </div>`
        : `<button onclick="GainsShop._buyPet('${petId}')" style="width:100%;padding:12px;background:${gold >= pet.price ? pet.color : '#2a2a2a'};color:${gold >= pet.price ? '#fff' : '#555'};border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:${gold >= pet.price ? 'pointer' : 'default'}">
            ${gold >= pet.price ? 'Adopt ' + pet.emoji + ' · 🪙 ' + pet.price.toLocaleString() : '🔒 Need ' + pet.price.toLocaleString() + ' gold'}
          </button>`
      }
    </div>`;
}

function _buyPet(petId) {
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return;
  const s = getState();
  if ((s.gold || 0) < pet.price) { showToast('Not enough gold!'); return; }
  if (s.pets && s.pets[petId]) { showToast('Already adopted!'); return; }
  s.gold = (s.gold || 0) - pet.price;
  s.pets = s.pets || {};
  s.pets[petId] = true;
  saveState(s);
  showToast(pet.emoji + ' ' + pet.name + ' adopted! Welcome home!');
  const container = document.getElementById('store-container');
  if (container) { _renderPetStore(container); _clickPetCage(petId); }
}

function _buyPetFood() {
  const s = getState();
  if ((s.gold || 0) < PET_FOOD.price) { showToast('Not enough gold!'); return; }
  s.gold = (s.gold || 0) - PET_FOOD.price;
  s.petFoodCount = (s.petFoodCount || 0) + 1;
  saveState(s);
  showToast('🍖 Animal Chow ×1 purchased!');
  const container = document.getElementById('store-container');
  if (container) _renderPetStore(container);
}

function _feedPet(petId) {
  const s = getState();
  if ((s.petFoodCount || 0) <= 0) { showToast('No food! Tap the chow cabinet.'); return; }
  const pet = PETS.find(p => p.id === petId);
  s.petFoodCount = (s.petFoodCount || 1) - 1;
  s.petFedAt = s.petFedAt || {};
  s.petFedAt[petId] = Date.now();
  saveState(s);
  showToast((pet ? pet.emoji + ' ' + pet.name : 'Pet') + ' is happy! ❤️');
  const container = document.getElementById('store-container');
  if (container) { _renderPetStore(container); _clickPetCage(petId); }
}

function getTrainerSplitDays(id) {
  const t = TRAINERS.find(x => x.id === id);
  if (!t || !t.splitDays) return [];
  const days = [...t.splitDays];
  days._name = t.name.split(' ')[0];
  return days;
}

return { render, openBodega, openClothing, openSporting, openBarber, openTrainer, openTrainerProfile, buyItem, buyClothing, buyEquipment, buyHairstyle, cycleBarber, _jumpBarber, refreshBarberPreview, getActiveBuffs, isBuffActive, petCat, claimFoodCourtSpawn, enterGym, openBackAlley, openBlackMarket, buyVial, claimDumpster, confirmBuy, openTattooShop, buyTattoo, cycleTattoo, _jumpTattoo, refreshTattooPreview, getTrainerSplitDays, _magScroll, _magGoTo, openHomeMag, openPetStore, _buyPet, _buyPetFood, _feedPet, _clickPetCage, _petBodySVG, _petIcon };

})();
