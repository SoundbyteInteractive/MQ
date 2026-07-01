const GainsShop = (() => {

const ITEMS = [
  { id: 'protein',    name: 'Protein Shake',  cost: 50,  buff: '+25% muscle XP',       duration: 24, type: 'shelf', color: '#5d4037', label: 'PROTEIN', labelColor: '#3e2723' },
  { id: 'creatine',   name: 'Creatine',       cost: 80,  buff: '+40% muscle growth',    duration: 24, type: 'fridge', color: '#1e88e5', label: 'CREAT',   labelColor: '#1565c0' },
  { id: 'preworkout',  name: 'Pre-Workout',    cost: 60,  buff: '+30% overall XP',       duration: 24, type: 'fridge', color: '#e53935', label: 'PRE',     labelColor: '#c62828' },
  { id: 'bcaa',        name: 'BCAAs',          cost: 40,  buff: 'Rest day → 150 XP',     duration: 24, type: 'shelf', color: '#ffca28', label: 'BCAA',    labelColor: '#f57f17' },
  { id: 'energybar',   name: 'Energy Bar',     cost: 25,  buff: '+1 fight attempt',      duration: 0,  type: 'shelf', color: '#66bb6a', label: 'E-BAR',   labelColor: '#2e7d32' },
  { id: 'multivitamin',name: 'Multivitamin',   cost: 100, buff: 'Streak protection',     duration: 48, type: 'shelf', color: '#ffa726', label: 'MULTI',   labelColor: '#e65100' },
  { id: 'fatburner',   name: 'Fat Burner',     cost: 70,  buff: '2x gold earned',        duration: 24, type: 'fridge', color: '#7cb342', label: 'BURN',    labelColor: '#558b2f' },
  { id: 'massgainer',  name: 'Mass Gainer',    cost: 120, buff: '+50% compound XP',      duration: 24, type: 'fridge', color: '#8e24aa', label: 'MASS',    labelColor: '#6a1b9a' },
];

const SOLD_OUT = [
  { name: '???', type: 'shelf',  color: '#444', label: '???', labelColor: '#333' },
  { name: '???', type: 'shelf',  color: '#444', label: '???', labelColor: '#333' },
  { name: '???', type: 'fridge', color: '#444', label: '???', labelColor: '#333' },
  { name: '???', type: 'fridge', color: '#444', label: '???', labelColor: '#333' },
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

function isBuffActive(id) {
  return getActiveBuffs().some(b => b.id === id);
}

function buyItem(id) {
  const item = ITEMS.find(i => i.id === id);
  if (!item) return;

  const s = getState();
  if ((s.gold || 0) < item.cost) {
    showToast('Not enough gold!');
    return;
  }

  if (item.duration > 0 && isBuffActive(id)) {
    showToast('Already active!');
    return;
  }

  s.gold -= item.cost;
  if (!s.activeBuffs) s.activeBuffs = [];

  if (item.id === 'energybar') {
    localStorage.removeItem('musclequest_fight');
    showToast('Fight attempt restored!');
  } else {
    const expiresAt = Date.now() + item.duration * 3600000;
    s.activeBuffs.push({ id: item.id, expiresAt });
    showToast(`${item.name} activated!`);
  }

  s.activeBuffs = s.activeBuffs.filter(b => b.expiresAt > Date.now() || b.expiresAt === 0);
  saveState(s);
  try { if (typeof MQ !== 'undefined') MQ.syncStateFromStorage(); } catch(e) {}
  try { if (typeof playSFX === 'function') playSFX('submit'); } catch(e) {}
  render();
  if (document.getElementById('player-gold')) {
    document.getElementById('player-gold').textContent = s.gold.toLocaleString();
  }
}

function petCat() {
  const today = todayStr();
  const lastPet = localStorage.getItem('musclequest_cat_pet');
  if (lastPet === today) {
    showToast('Cat is napping... come back tomorrow!');
    return;
  }
  const coins = Math.floor(Math.random() * 6) + 5;
  const s = getState();
  s.gold = (s.gold || 0) + coins;
  saveState(s);
  localStorage.setItem('musclequest_cat_pet', today);
  showToast(`+${coins} gold! The cat approves!`);
  render();
  if (document.getElementById('player-gold')) {
    document.getElementById('player-gold').textContent = s.gold.toLocaleString();
  }
}

function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast gold';
  el.textContent = msg;
  document.getElementById('toast-container')?.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function formatTimeLeft(ms) {
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function renderBottle(item, soldOut) {
  if (soldOut) {
    return `<svg width="36" height="30" viewBox="0 0 36 30">
      <rect x="8" y="2" width="20" height="24" rx="3" fill="#333" opacity="0.5"/>
      <rect x="10" y="6" width="16" height="8" rx="1" fill="#222" opacity="0.5"/>
      <text x="18" y="12" text-anchor="middle" font-size="4" fill="#555" font-weight="bold" font-family="Courier New">???</text>
      <rect x="12" y="0" width="12" height="4" rx="2" fill="#222" opacity="0.5"/>
    </svg>`;
  }
  return `<svg width="36" height="30" viewBox="0 0 36 30">
    <rect x="8" y="2" width="20" height="24" rx="3" fill="${item.color}"/>
    <rect x="10" y="6" width="16" height="8" rx="1" fill="#fff" opacity="0.9"/>
    <text x="18" y="12" text-anchor="middle" font-size="${item.label.length > 4 ? 4 : 5}" fill="${item.labelColor}" font-weight="bold" font-family="Courier New">${item.label}</text>
    <rect x="12" y="0" width="12" height="4" rx="2" fill="${item.labelColor}"/>
  </svg>`;
}

function renderBox(item, soldOut) {
  if (soldOut) {
    return `<svg width="48" height="28" viewBox="0 0 48 28">
      <rect x="2" y="2" width="44" height="22" rx="4" fill="#333" opacity="0.5"/>
      <rect x="6" y="5" width="36" height="14" rx="2" fill="#222" opacity="0.5"/>
      <text x="24" y="15" text-anchor="middle" font-size="5" fill="#555" font-weight="bold" font-family="Courier New">SOLD OUT</text>
    </svg>`;
  }
  return `<svg width="48" height="28" viewBox="0 0 48 28">
    <rect x="2" y="2" width="44" height="22" rx="4" fill="${item.color}"/>
    <rect x="6" y="5" width="36" height="14" rx="2" fill="#fff" opacity="0.85"/>
    <text x="24" y="15" text-anchor="middle" font-size="5" fill="${item.labelColor}" font-weight="bold" font-family="Courier New">${item.label}</text>
  </svg>`;
}

function renderCat() {
  return `<svg width="40" height="35" viewBox="0 0 40 35">
    <!-- body -->
    <ellipse cx="20" cy="25" rx="14" ry="9" fill="#8B7355"/>
    <!-- tail -->
    <path d="M34 24 Q42 18 38 12" stroke="#8B7355" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- head -->
    <ellipse cx="10" cy="16" rx="9" ry="8" fill="#8B7355"/>
    <!-- ears -->
    <polygon points="4,10 2,2 9,8" fill="#8B7355"/>
    <polygon points="14,8 16,1 10,6" fill="#8B7355"/>
    <polygon points="5,9 3,4 8,8" fill="#D4A574"/>
    <polygon points="13,7 15,3 10,7" fill="#D4A574"/>
    <!-- eyes -->
    <ellipse cx="7" cy="15" rx="2" ry="2.5" fill="#4CAF50"/>
    <ellipse cx="13" cy="15" rx="2" ry="2.5" fill="#4CAF50"/>
    <ellipse cx="7" cy="15" rx="1" ry="2" fill="#111"/>
    <ellipse cx="13" cy="15" rx="1" ry="2" fill="#111"/>
    <circle cx="7.5" cy="14" r="0.6" fill="#fff"/>
    <circle cx="13.5" cy="14" r="0.6" fill="#fff"/>
    <!-- nose -->
    <polygon points="9,18 10,17 11,18" fill="#D4A574"/>
    <!-- whiskers -->
    <line x1="0" y1="17" x2="6" y2="17" stroke="#aaa" stroke-width="0.4"/>
    <line x1="0" y1="19" x2="6" y2="18" stroke="#aaa" stroke-width="0.4"/>
    <line x1="14" y1="17" x2="20" y2="17" stroke="#aaa" stroke-width="0.4"/>
    <line x1="14" y1="18" x2="20" y2="19" stroke="#aaa" stroke-width="0.4"/>
    <!-- stripes -->
    <path d="M6 10 Q10 8 14 10" stroke="#6B5B3E" stroke-width="0.8" fill="none"/>
    <path d="M5 12 Q10 10 15 12" stroke="#6B5B3E" stroke-width="0.6" fill="none"/>
    <!-- front paws -->
    <ellipse cx="12" cy="32" rx="4" ry="3" fill="#8B7355"/>
    <ellipse cx="20" cy="33" rx="3" ry="2" fill="#8B7355"/>
  </svg>`;
}

function render() {
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
  <div class="store-hdr">
    <span class="store-gold"><i class="ti ti-coin" style="font-size:14px;vertical-align:-1px"></i> ${gold.toLocaleString()}</span>
  </div>
  <div class="store-room">
    <div class="store-wall">
      <div class="store-shelf s1"></div>
      <div class="store-shelf s2"></div>
      <div class="store-shelf s3"></div>
    </div>
    <div class="store-neon">GAINS SHOP</div>

    <!-- Shelf row 1 -->
    <div class="shelf-row row1">
      <div class="store-item shelf-spacer"></div>
      ${shelfItems.slice(0, 3).map(item => {
        const active = isBuffActive(item.id);
        return `<div class="store-item ${active ? 'item-active' : ''}" onclick="GainsShop.buyItem('${item.id}')">
          ${renderBox(item)}
          <span class="item-lbl">${item.name}</span>
          <span class="item-buff">${item.buff}</span>
          <span class="item-cost">${item.cost}g</span>
          <div class="store-tip">
            <span class="tip-name">${item.name}</span>
            <span class="tip-buff">${item.buff}</span>
            <span class="tip-dur">${item.duration ? item.duration + 'h' : 'Instant'} | ${item.cost}g</span>
            ${active ? '<span class="tip-on">ACTIVE</span>' : ''}
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Shelf row 2 -->
    <div class="shelf-row row2">
      <div class="store-item shelf-spacer"></div>
      ${shelfItems.slice(3).map(item => {
        const active = isBuffActive(item.id);
        return `<div class="store-item ${active ? 'item-active' : ''}" onclick="GainsShop.buyItem('${item.id}')">
          ${renderBox(item)}
          <span class="item-lbl">${item.name}</span>
          <span class="item-buff">${item.buff}</span>
          <span class="item-cost">${item.cost}g</span>
          <div class="store-tip">
            <span class="tip-name">${item.name}</span>
            <span class="tip-buff">${item.buff}</span>
            <span class="tip-dur">${item.duration ? item.duration + 'h' : 'Instant'} | ${item.cost}g</span>
            ${active ? '<span class="tip-on">ACTIVE</span>' : ''}
          </div>
        </div>`;
      }).join('')}
      ${soldOutShelves.map(() => `<div class="store-item sold-out">${renderBox(null, true)}<span class="item-lbl sold-lbl">Sold Out</span></div>`).join('')}
    </div>

    <!-- Fridge -->
    <div class="store-fridge">
      <div class="fridge-body">
        <div class="fridge-glass">
          <div class="fridge-grid">
            ${fridgeItems.map(item => {
              const active = isBuffActive(item.id);
              return `<div class="store-item fridge-item ${active ? 'item-active' : ''}" onclick="GainsShop.buyItem('${item.id}')">
                ${renderBottle(item)}
                <span class="item-cost">${item.cost}g</span>
                <div class="store-tip">
                  <span class="tip-name">${item.name}</span>
                  <span class="tip-buff">${item.buff}</span>
                  <span class="tip-dur">${item.duration}h | ${item.cost}g</span>
                  ${active ? '<span class="tip-on">ACTIVE</span>' : ''}
                </div>
              </div>`;
            }).join('')}
            ${soldOutFridge.map(() => `<div class="store-item fridge-item sold-out">${renderBottle(null, true)}</div>`).join('')}
          </div>
        </div>
        <div class="fridge-handle"></div>
        <div class="fridge-lbl">COLD DRINKS</div>
      </div>
    </div>

    <!-- Counter -->
    <div class="store-counter">
      <div class="counter-surface"></div>
      <div class="store-register">
        <div class="reg-screen"></div>
        <div class="reg-keys">${'<div class="reg-key"></div>'.repeat(12)}</div>
      </div>
      <div class="store-cat ${localStorage.getItem('musclequest_cat_pet') === todayStr() ? 'cat-petted' : ''}" onclick="GainsShop.petCat()" title="${localStorage.getItem('musclequest_cat_pet') === todayStr() ? 'Napping... come back tomorrow!' : 'Pet the cat for gold!'}">
        ${renderCat()}
        <span class="cat-hint">${localStorage.getItem('musclequest_cat_pet') === todayStr() ? '💤' : '🐾'}</span>
      </div>
    </div>

    <div class="store-floor"></div>
  </div>

  ${activeBuffs.length > 0 ? `
  <div class="store-buffs">
    <div class="buffs-title">Active Buffs</div>
    ${activeBuffs.map(b => {
      const item = ITEMS.find(i => i.id === b.id);
      if (!item) return '';
      const left = b.expiresAt - now;
      return `<div class="buff-entry">
        <div class="buff-pip"></div>
        <span class="buff-name">${item.name}</span>
        <span class="buff-time">${formatTimeLeft(left)}</span>
      </div>`;
    }).join('')}
  </div>` : ''}
</div>`;
}

return { render, buyItem, getActiveBuffs, isBuffActive, petCat };

})();
