const PunchOut = (() => {

const W = 480, H = 640;
let canvas, ctx, animFrame;
let gameState = 'idle';
let lastTime = 0;

const BOSS_NAMES = ['Glass Joe', 'Von Kaiser', 'Piston Honda', 'Soda Popinski', 'Mr. Sandman'];

let player, boss, dailyBossLevel, shakeTimer, shakeX, shakeY;
let fightStats = { totalKOs: 0, highestBoss: 0, streak: 0, lastFightDate: null, lastResult: null };

function getDailyBossLevel() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return (seed % 5) + 1;
}

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

function loadFightStats() {
  try {
    const raw = localStorage.getItem('musclequest_fight');
    if (raw) fightStats = { ...fightStats, ...JSON.parse(raw) };
  } catch (e) {}
}

function saveFightStats() {
  localStorage.setItem('musclequest_fight', JSON.stringify(fightStats));
  try {
    const save = JSON.parse(localStorage.getItem('musclequest_save') || '{}');
    save._fightKOs = fightStats.totalKOs;
    save._fightHighest = fightStats.highestBoss;
    save._fightStreak = fightStats.streak;
    localStorage.setItem('musclequest_save', JSON.stringify(save));
    const user = localStorage.getItem('musclequest_current_user');
    const pin = localStorage.getItem('musclequest_current_pin');
    if (user) {
      localStorage.setItem(`musclequest_${user}`, JSON.stringify({ ...save, _pin: pin }));
    }
    if (typeof firebase !== 'undefined' && firebase.firestore && user) {
      try {
        firebase.firestore().collection('users').doc(user).set({
          _fightKOs: fightStats.totalKOs,
          _fightHighest: fightStats.highestBoss,
          _fightStreak: fightStats.streak,
        }, { merge: true });
      } catch(e) {}
    }
  } catch(e) {}
}

function getPlayerData() {
  try {
    const save = JSON.parse(localStorage.getItem('musclequest_save') || '{}');
    return {
      gender: save.gender || 'male',
      muscles: save.muscles || {},
      level: 1,
      equippedCosmetics: save.equippedCosmetics || [],
    };
  } catch (e) {
    return { gender: 'male', muscles: {}, level: 1, equippedCosmetics: [] };
  }
}

function muscleScale(level) {
  return 1.0 + 0.85 * (1 - Math.exp(-0.06 * (level - 1)));
}

function createPlayer() {
  const data = getPlayerData();
  const overall = calcPlayerLevel(data.muscles);
  const baseDmg = 8 + overall * 2;
  return {
    hp: 100, maxHp: 100,
    damage: baseDmg,
    x: W / 2, y: H - 80,
    offsetX: 0, offsetY: 0,
    action: 'idle', actionTimer: 0,
    hitFlash: 0,
    blockActive: false,
    stamina: 100, maxStamina: 100,
    staminaCost: Math.max(10, 25 - overall),
    staminaRegen: 15 + overall * 2,
    data,
    level: overall,
  };
}

function calcPlayerLevel(muscles) {
  let total = 0;
  for (const k of Object.keys(muscles)) {
    if (k === 'rest' || k === 'cardio') continue;
    total += (muscles[k]?.level || 1);
  }
  return Math.max(1, Math.floor(total / 10));
}

function createBoss(level) {
  const mult = 1 + (level - 1) * 0.35;
  return {
    name: BOSS_NAMES[level - 1] || 'Champion',
    level,
    hp: Math.floor(80 * mult), maxHp: Math.floor(80 * mult),
    damage: Math.floor(12 * mult),
    x: W / 2, y: 160,
    offsetX: 0, offsetY: 0,
    action: 'idle', actionTimer: 0,
    telegraphTimer: 0, telegraphType: null,
    attackCooldown: 2.0,
    cooldownTimer: 1.5,
    telegraphDuration: Math.max(0.4, 1.2 - level * 0.15),
    attackSpeed: 0.2 + level * 0.05,
    comboChance: Math.min(0.5, level * 0.1),
    hitFlash: 0,
    stunTimer: 0,
    pendingCombo: false,
  };
}

// ─── DRAWING ───

function drawRing(ctx) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#252540';
  ctx.beginPath();
  ctx.moveTo(40, H - 200);
  ctx.lineTo(W - 40, H - 200);
  ctx.lineTo(W + 60, H);
  ctx.lineTo(-60, H);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#3a3a5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, H - 200);
  ctx.lineTo(W - 40, H - 200);
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    const ropeY = 80 + i * 50;
    const leftX = 30 + i * 5;
    const rightX = W - 30 - i * 5;
    ctx.strokeStyle = i === 1 ? '#666' : '#444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(leftX, ropeY);
    ctx.quadraticCurveTo(W / 2, ropeY + 10, rightX, ropeY);
    ctx.stroke();
  }

  ctx.fillStyle = '#3a3a5e';
  ctx.fillRect(25, 60, 6, H - 260);
  ctx.fillRect(W - 31, 60, 6, H - 260);
}

// ─── PLAYER DRAWING (replace this function with custom sprite) ───
function drawPlayer(ctx, player) {
  ctx.save();
  const px = player.x + player.offsetX;
  const py = player.y + player.offsetY;
  const sc = 2.2;

  if (player.hitFlash > 0) {
    ctx.globalAlpha = 0.5 + Math.sin(player.hitFlash * 20) * 0.3;
  }

  const d = player.data;
  const s = k => muscleScale(d.muscles[k]?.level || 1);
  const female = d.gender === 'female';

  const torsoW = 56 * s('chest') * sc / 2;
  const shoulderR = 16 * s('shoulders') * sc / 2;
  const armW = 24 * s('biceps') * sc / 2;

  ctx.translate(px, py);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(-torsoW * 0.6, 30 * sc / 2, torsoW * 1.2, 30 * sc / 2);

  ctx.fillStyle = '#d4a06a';
  roundRect(ctx, -torsoW / 2, -40 * sc / 2, torsoW, 55 * sc / 2, 10);
  ctx.fill();

  if (female) {
    ctx.fillStyle = '#2a2a3e';
    roundRect(ctx, -torsoW / 2 + 3, -30 * sc / 2, torsoW - 6, 25 * sc / 2, 6);
    ctx.fill();
  }

  ctx.fillStyle = '#e8b980';
  roundRect(ctx, -torsoW / 2 - 2, -10 * sc / 2, torsoW + 4, 45 * sc / 2, 8);
  ctx.fill();

  ctx.fillStyle = '#d4a06a';
  const shLX = -torsoW / 2 - shoulderR * 0.8;
  const shRX = torsoW / 2 - shoulderR * 0.2;
  ellipse(ctx, shLX + shoulderR / 2, -35 * sc / 2, shoulderR, shoulderR * 0.85);
  ellipse(ctx, shRX + shoulderR / 2, -35 * sc / 2, shoulderR, shoulderR * 0.85);

  let lArmExtend = 0, rArmExtend = 0;
  if (player.action === 'punchL') lArmExtend = Math.sin(player.actionTimer * Math.PI / 0.2) * 60;
  if (player.action === 'punchR') rArmExtend = Math.sin(player.actionTimer * Math.PI / 0.2) * 60;

  ctx.fillStyle = '#d4a06a';
  roundRect(ctx, shLX - armW * 0.3, -30 * sc / 2 - lArmExtend, armW, 50 * sc / 2 + lArmExtend, 8);
  ctx.fill();
  roundRect(ctx, shRX, -30 * sc / 2 - rArmExtend, armW, 50 * sc / 2 + rArmExtend, 8);
  ctx.fill();

  ctx.fillStyle = '#c8965e';
  ellipse(ctx, shLX + armW * 0.2, -32 * sc / 2 - lArmExtend, armW * 0.6, armW * 0.6);
  ellipse(ctx, shRX + armW * 0.8, -32 * sc / 2 - rArmExtend, armW * 0.6, armW * 0.6);

  ctx.fillStyle = '#f4c794';
  ellipse(ctx, 0, -75 * sc / 2, 22 * sc / 2, 26 * sc / 2);

  ctx.fillStyle = '#4a3728';
  ctx.beginPath();
  const hr = 22 * sc / 2;
  ctx.ellipse(0, -82 * sc / 2, hr, hr * 0.7, 0, Math.PI, 0);
  ctx.fill();

  if (female) {
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.moveTo(-hr, -70 * sc / 2);
    ctx.quadraticCurveTo(-hr - 4, -40 * sc / 2, -hr + 2, -20 * sc / 2);
    ctx.lineTo(-hr + 6, -20 * sc / 2);
    ctx.quadraticCurveTo(-hr, -40 * sc / 2, -hr + 4, -70 * sc / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hr, -70 * sc / 2);
    ctx.quadraticCurveTo(hr + 4, -40 * sc / 2, hr - 2, -20 * sc / 2);
    ctx.lineTo(hr - 6, -20 * sc / 2);
    ctx.quadraticCurveTo(hr, -40 * sc / 2, hr - 4, -70 * sc / 2);
    ctx.fill();
  }

  ctx.fillStyle = '#2c1810';
  ellipse(ctx, -8 * sc / 2, -72 * sc / 2, 3 * sc / 2, 3.5 * sc / 2);
  ellipse(ctx, 8 * sc / 2, -72 * sc / 2, 3 * sc / 2, 3.5 * sc / 2);

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-7 * sc / 2, -73 * sc / 2, 1.2 * sc / 2, 0, Math.PI * 2);
  ctx.arc(9 * sc / 2, -73 * sc / 2, 1.2 * sc / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#c8965e';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-5 * sc / 2, -62 * sc / 2);
  ctx.quadraticCurveTo(0, -58 * sc / 2, 5 * sc / 2, -62 * sc / 2);
  ctx.stroke();

  ctx.restore();
}

// ─── BOSS DRAWING (replace this function with custom sprite) ───
function drawBoss(ctx, boss) {
  ctx.save();
  const bx = boss.x + boss.offsetX;
  const by = boss.y + boss.offsetY;

  if (boss.hitFlash > 0) {
    ctx.globalAlpha = 0.5 + Math.sin(boss.hitFlash * 20) * 0.3;
  }

  if (boss.telegraphTimer > 0 && boss.action === 'telegraph') {
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 20;
  }

  const sc = 0.8 + boss.level * 0.1;
  ctx.translate(bx, by);
  ctx.scale(sc, sc);

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(-25, 40, 50, 25);

  const bodyColor = boss.hitFlash > 0 ? '#ff4444' : '#8b4513';
  const skinColor = boss.hitFlash > 0 ? '#ff6666' : '#c8965e';

  ctx.fillStyle = bodyColor;
  roundRect(ctx, -30, -30, 60, 70, 10);
  ctx.fill();

  ctx.fillStyle = skinColor;
  ellipse(ctx, -40, -20, 18, 35);
  ellipse(ctx, 40, -20, 18, 35);

  let lExtend = 0, rExtend = 0;
  if (boss.action === 'attackL') lExtend = 80;
  if (boss.action === 'attackR') rExtend = 80;

  if (lExtend > 0) {
    ctx.fillStyle = skinColor;
    roundRect(ctx, -50, -15, 20, lExtend, 8);
    ctx.fill();
    ellipse(ctx, -40, -15 + lExtend, 12, 12);
  }
  if (rExtend > 0) {
    ctx.fillStyle = skinColor;
    roundRect(ctx, 30, -15, 20, rExtend, 8);
    ctx.fill();
    ellipse(ctx, 40, -15 + rExtend, 12, 12);
  }

  ctx.fillStyle = skinColor;
  ellipse(ctx, 0, -55, 25, 28);

  ctx.fillStyle = '#1a1a2e';
  ellipse(ctx, 0, -62, 26, 18);

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-9, -52, 4, 0, Math.PI * 2);
  ctx.arc(9, -52, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-9, -52, 2.5, 0, Math.PI * 2);
  ctx.arc(9, -52, 2.5, 0, Math.PI * 2);
  ctx.fill();

  if (boss.telegraphType === 'left') {
    ctx.translate(-8, 0);
  } else if (boss.telegraphType === 'right') {
    ctx.translate(8, 0);
  } else if (boss.telegraphType === 'upper') {
    ctx.translate(0, -10);
  }

  ctx.strokeStyle = boss.hp < boss.maxHp * 0.3 ? '#ff4444' : '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -40);
  ctx.lineTo(8, -40);
  ctx.stroke();

  ctx.restore();
}

// ─── HUD ───
function drawHUD(ctx) {
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(20, 20, (player.hp / player.maxHp) * 180, 14);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, 180, 14);
  ctx.fillStyle = '#fff';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('YOU', 22, 16);

  const staminaPct = player.stamina / player.maxStamina;
  const staminaColor = staminaPct > 0.3 ? '#ffaa00' : '#ff4444';
  ctx.fillStyle = staminaColor;
  ctx.fillRect(20, 38, staminaPct * 180, 8);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 38, 180, 8);
  ctx.fillStyle = '#aaa';
  ctx.font = '9px Inter, sans-serif';
  ctx.fillText('STAMINA', 22, 56);

  const bx = W - 200;
  ctx.fillStyle = '#f44336';
  ctx.fillRect(bx, 20, (boss.hp / boss.maxHp) * 180, 14);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(bx, 20, 180, 14);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.fillText(`${boss.name} Lv.${boss.level}`, W - 22, 16);
  ctx.textAlign = 'left';
}

function drawControls(ctx) {
  const btnY = H - 55;
  const btns = [
    { label: '◄', x: 50, action: 'dodgeL' },
    { label: 'BLK', x: 130, action: 'block' },
    { label: '►', x: 210, action: 'dodgeR' },
    { label: 'L', x: 310, action: 'punchL' },
    { label: 'R', x: 390, action: 'punchR' },
  ];
  btns.forEach(b => {
    ctx.fillStyle = '#333366';
    roundRect(ctx, b.x - 30, btnY - 18, 60, 36, 8);
    ctx.fill();
    ctx.fillStyle = '#aaa';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, b.x, btnY + 5);
  });
  ctx.textAlign = 'left';
}

function drawResult(ctx, text, sub) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 36px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, W / 2, H / 2 - 20);
  ctx.fillStyle = '#aaa';
  ctx.font = '16px Inter, sans-serif';
  ctx.fillText(sub, W / 2, H / 2 + 20);
  ctx.textAlign = 'left';
}

function drawPreFight(ctx) {
  drawRing(ctx);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Cinzel, serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAILY BOSS FIGHT', W / 2, H / 2 - 80);

  ctx.font = '18px Inter, sans-serif';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`${BOSS_NAMES[dailyBossLevel - 1] || 'Champion'} — Lv.${dailyBossLevel}`, W / 2, H / 2 - 40);

  ctx.fillStyle = '#aaa';
  ctx.font = '14px Inter, sans-serif';
  ctx.fillText(`KO Streak: ${fightStats.streak}  |  Total KOs: ${fightStats.totalKOs}`, W / 2, H / 2);
  ctx.fillText(`Highest Boss: Lv.${fightStats.highestBoss}`, W / 2, H / 2 + 25);

  if (fightStats.lastFightDate === todayStr() && fightStats.lastResult === 'win') {
    ctx.fillStyle = '#4caf50';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('VICTORY! Come back tomorrow.', W / 2, H / 2 + 70);
  } else {
    ctx.fillStyle = '#7c4dff';
    roundRect(ctx, W / 2 - 80, H / 2 + 55, 160, 44, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('FIGHT!', W / 2, H / 2 + 82);
  }
  ctx.textAlign = 'left';
}

// ─── GAME LOGIC ───
function playerAction(action) {
  if (gameState !== 'fighting' || player.action !== 'idle') return;

  if (action === 'block') {
    player.action = 'block';
    player.actionTimer = 0.5;
    player.blockActive = true;
    player.offsetY = 15;
    return;
  }

  if (action === 'dodgeL') {
    player.action = 'dodgeL';
    player.actionTimer = 0.3;
    player.offsetX = -60;
    return;
  }
  if (action === 'dodgeR') {
    player.action = 'dodgeR';
    player.actionTimer = 0.3;
    player.offsetX = 60;
    return;
  }

  if (action === 'punchL' || action === 'punchR') {
    if (player.stamina < player.staminaCost) return;
    player.stamina -= player.staminaCost;
    player.action = action;
    player.actionTimer = 0.2;

    if (boss.stunTimer > 0 || boss.action === 'idle' || boss.action === 'telegraph') {
      const dmg = player.damage + Math.floor(Math.random() * 5);
      boss.hp = Math.max(0, boss.hp - dmg);
      boss.hitFlash = 0.3;
      boss.stunTimer = Math.max(boss.stunTimer, 0.3);
      playFightSFX('hitBoss');
    }
    return;
  }
}

function updatePlayer(dt) {
  if (player.actionTimer > 0) {
    player.actionTimer -= dt;
    if (player.actionTimer <= 0) {
      player.action = 'idle';
      player.actionTimer = 0;
      player.offsetX = 0;
      player.offsetY = 0;
      player.blockActive = false;
    }
  }
  if (player.hitFlash > 0) player.hitFlash -= dt;
  player.stamina = Math.min(player.maxStamina, player.stamina + player.staminaRegen * dt);
}

function updateBoss(dt) {
  if (boss.hitFlash > 0) boss.hitFlash -= dt;
  if (boss.stunTimer > 0) { boss.stunTimer -= dt; return; }

  if (boss.action === 'idle') {
    boss.cooldownTimer -= dt;
    boss.offsetX = 0;
    boss.offsetY = 0;
    if (boss.cooldownTimer <= 0) {
      boss.action = 'telegraph';
      const types = ['left', 'right', 'upper'];
      boss.telegraphType = types[Math.floor(Math.random() * types.length)];
      boss.telegraphTimer = boss.telegraphDuration;
    }
  }

  if (boss.action === 'telegraph') {
    boss.telegraphTimer -= dt;
    if (boss.telegraphType === 'left') boss.offsetX = -8;
    else if (boss.telegraphType === 'right') boss.offsetX = 8;
    else boss.offsetY = -10;

    if (boss.telegraphTimer <= 0) {
      boss.action = boss.telegraphType === 'left' ? 'attackL' : boss.telegraphType === 'right' ? 'attackR' : 'attackU';
      boss.actionTimer = 0.3;
      boss.offsetY = 40;
    }
  }

  if (boss.action === 'attackL' || boss.action === 'attackR' || boss.action === 'attackU') {
    boss.actionTimer -= dt;
    if (boss.actionTimer <= 0.15 && boss.actionTimer + dt > 0.15) {
      let dodged = false;
      if (player.blockActive) dodged = true;
      if (boss.action === 'attackL' && player.action === 'dodgeR') dodged = true;
      if (boss.action === 'attackR' && player.action === 'dodgeL') dodged = true;
      if (boss.action === 'attackU' && (player.action === 'dodgeL' || player.action === 'dodgeR')) dodged = true;

      if (!dodged) {
        const dmg = boss.damage + Math.floor(Math.random() * 4);
        player.hp = Math.max(0, player.hp - (player.blockActive ? Math.floor(dmg * 0.3) : dmg));
        player.hitFlash = 0.4;
        shakeTimer = 0.2;
        playFightSFX('hitPlayer');
      }
    }
    if (boss.actionTimer <= 0) {
      if (!boss.pendingCombo && Math.random() < boss.comboChance) {
        boss.pendingCombo = true;
        boss.action = 'telegraph';
        const types = ['left', 'right', 'upper'];
        boss.telegraphType = types[Math.floor(Math.random() * types.length)];
        boss.telegraphTimer = boss.telegraphDuration * 0.6;
      } else {
        boss.action = 'idle';
        boss.pendingCombo = false;
        boss.cooldownTimer = 1.5 - boss.level * 0.15 + Math.random() * 0.5;
        boss.offsetX = 0;
        boss.offsetY = 0;
      }
    }
  }
}

function update(dt) {
  if (gameState !== 'fighting') return;

  updatePlayer(dt);
  updateBoss(dt);

  if (shakeTimer > 0) {
    shakeTimer -= dt;
    shakeX = (Math.random() - 0.5) * 8;
    shakeY = (Math.random() - 0.5) * 8;
  } else {
    shakeX = 0;
    shakeY = 0;
  }

  if (boss.hp <= 0) {
    gameState = 'win';
    fightStats.totalKOs++;
    fightStats.streak++;
    if (dailyBossLevel > fightStats.highestBoss) fightStats.highestBoss = dailyBossLevel;
    fightStats.lastFightDate = todayStr();
    fightStats.lastResult = 'win';
    saveFightStats();
    try { if (typeof playSFX === 'function') playSFX('levelup'); } catch(e) {}
    try { if (typeof MQ !== 'undefined' && MQ.addGold) MQ.addGold(15); } catch(e) {}
  }

  if (player.hp <= 0) {
    gameState = 'lose';
    fightStats.streak = 0;
    fightStats.lastFightDate = todayStr();
    fightStats.lastResult = 'lose';
    saveFightStats();
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(shakeX || 0, shakeY || 0);

  if (gameState === 'idle') {
    drawPreFight(ctx);
  } else {
    drawRing(ctx);
    drawBoss(ctx, boss);
    drawPlayer(ctx, player);
    drawHUD(ctx);
    drawControls(ctx);

    if (gameState === 'win') drawResult(ctx, 'K.O.!', `${boss.name} defeated! Streak: ${fightStats.streak}`);
    if (gameState === 'lose') drawResult(ctx, 'TKO...', 'You were knocked out. Try tomorrow.');
  }

  ctx.restore();
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  update(dt);
  render();
  animFrame = requestAnimationFrame(gameLoop);
}

// ─── INPUT ───
function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;

  if (gameState === 'idle' && !(fightStats.lastFightDate === todayStr() && fightStats.lastResult === 'win')) {
    if (cx > W / 2 - 80 && cx < W / 2 + 80 && cy > H / 2 + 55 && cy < H / 2 + 99) {
      startFight();
      return;
    }
  }

  if (gameState === 'win' || gameState === 'lose') {
    gameState = 'idle';
    return;
  }

  if (gameState !== 'fighting') return;

  const btnY = H - 55;
  const btns = [
    { x: 50, action: 'dodgeL' },
    { x: 130, action: 'block' },
    { x: 210, action: 'dodgeR' },
    { x: 310, action: 'punchL' },
    { x: 390, action: 'punchR' },
  ];
  for (const b of btns) {
    if (cx > b.x - 30 && cx < b.x + 30 && cy > btnY - 18 && cy < btnY + 18) {
      playerAction(b.action);
      return;
    }
  }
}

function handleKey(e) {
  if (gameState !== 'fighting') return;
  const map = { 'a': 'dodgeL', 'd': 'dodgeR', 's': 'block', 'ArrowLeft': 'dodgeL', 'ArrowRight': 'dodgeR', 'ArrowDown': 'block', 'j': 'punchL', 'k': 'punchR', 'z': 'punchL', 'x': 'punchR' };
  if (map[e.key]) { playerAction(map[e.key]); e.preventDefault(); }
}

function startFight() {
  player = createPlayer();
  boss = createBoss(dailyBossLevel);
  shakeTimer = 0; shakeX = 0; shakeY = 0;
  gameState = 'fighting';
}

// ─── HELPERS ───
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function ellipse(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── FIGHT SFX ───
function playFightSFX(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'hitBoss') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    if (type === 'hitPlayer') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);

      const noise = ctx.createOscillator();
      const ng = ctx.createGain();
      noise.connect(ng);
      ng.connect(ctx.destination);
      noise.type = 'square';
      noise.frequency.setValueAtTime(90, now);
      ng.gain.setValueAtTime(0.06, now);
      ng.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      noise.start(now);
      noise.stop(now + 0.12);
    }
  } catch (e) {}
}

// ─── BODYBUILDING COMPETITION ───

let bbState = 'idle';
let bbCanvas, bbCtx, bbAnimFrame, bbLastTime;
let bbStrikes = 0, bbProgress = 0, bbRequired = 10, bbGoldReward = 10;
let bbCue = null;
let bbBetweenTimer = 0;
let bbPoseTimer = 0;
let bbCurrentPose = null;
let bbCountdownTimer = 0;
let bbNPC1 = null, bbNPC2 = null;
let bbPlayerData2 = null;
let bbPlayerLevel = 1;
let bbFlashColor = null, bbFlashTimer = 0;
let bbStats = { totalWins: 0, totalComps: 0, lastDate: null, lastResult: null, flawlessWins: 0, bbStreak: 0 };
let bbBtnRects = [];

function bbLoadStats() {
  try {
    const raw = localStorage.getItem('musclequest_bbcomp');
    if (raw) bbStats = { ...bbStats, ...JSON.parse(raw) };
  } catch(e) {}
}

function bbSaveStats() {
  localStorage.setItem('musclequest_bbcomp', JSON.stringify(bbStats));
  try {
    const save = JSON.parse(localStorage.getItem('musclequest_save') || '{}');
    save._bbWins = bbStats.totalWins;
    save._bbComps = bbStats.totalComps;
    save._bbFlawless = bbStats.flawlessWins;
    save._bbStreak = bbStats.bbStreak || 0;
    localStorage.setItem('musclequest_save', JSON.stringify(save));
    const user = localStorage.getItem('musclequest_current_user');
    const pin = localStorage.getItem('musclequest_current_pin');
    if (user) localStorage.setItem(`musclequest_${user}`, JSON.stringify({ ...save, _pin: pin }));
    if (typeof firebase !== 'undefined' && firebase.firestore && user) {
      try {
        firebase.firestore().collection('users').doc(user).set(
          { _bbWins: bbStats.totalWins, _bbComps: bbStats.totalComps, _bbStreak: bbStats.bbStreak || 0 }, { merge: true }
        );
      } catch(e) {}
    }
    if (typeof MQ !== 'undefined' && MQ.syncStateFromStorage) MQ.syncStateFromStorage();
  } catch(e) {}
}

function bbGetConfig() {
  const lv = bbPlayerLevel;
  const required = lv <= 10 ? 10 : lv <= 20 ? 20 : 30;
  const goldReward = Math.min(50, Math.max(10, 10 + Math.floor(lv * 1.5)));
  const cueWindow = lv <= 10 ? 1.8 : lv <= 20 ? 1.3 : 1.0;
  const betweenTime = lv <= 10 ? 0.9 : 0.7;
  return { required, goldReward, cueWindow, betweenTime };
}

function seededRand(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff; };
}

function bbGenerateDailyNPCs() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const rand = seededRand(seed);
  const skins = ['#e8b47a','#c8965e','#a07848','#5c3a1e','#f4c794'];
  const hairCols = ['#4a3728','#111111','#7a3a1a','#c0980a','#883333'];
  const names = ['IronMike','GainsBro','SwoleSis','LiftLord','GrindQueen','MuscleMax','FlexFiona','RepKing','SteelSam','BronzeVal'];
  const allCosmetics = ['headband_gold','headband_red','headband_blue','lifting_belt','gold_chain'];
  return [0,1].map(() => ({
    gender: rand() > 0.5 ? 'female' : 'male',
    skin: skins[Math.floor(rand() * skins.length)],
    hairColor: hairCols[Math.floor(rand() * hairCols.length)],
    cosmetics: allCosmetics.filter(() => rand() > 0.65),
    name: names[Math.floor(rand() * names.length)],
  }));
}

const BB_CUES = {
  up:    { arrow: '↑', label: 'VICTORY',       color: '#7c4dff' },
  down:  { arrow: '↓', label: 'MOST MUSCULAR', color: '#ff6d00' },
  left:  { arrow: '←', label: 'SIDE CHEST',    color: '#00b0ff' },
  right: { arrow: '→', label: 'DOUBLE BICEP',  color: '#e040fb' },
};

const BB_ARM_POSES = {
  null:  { l: [[-22,-68],[-26,-44],[-28,-20]], r: [[22,-68],[26,-44],[28,-20]] },
  up:    { l: [[-22,-68],[-28,-96],[-22,-120]], r: [[22,-68],[28,-96],[22,-120]] },
  down:  { l: [[-22,-68],[-50,-60],[-56,-38]], r: [[22,-68],[50,-60],[56,-38]] },
  left:  { l: [[-22,-68],[-40,-54],[-22,-38]], r: [[22,-68],[26,-44],[28,-20]] },
  right: { l: [[-22,-68],[-32,-92],[-24,-114]], r: [[22,-68],[32,-92],[24,-114]] },
};

function bbRR(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.arcTo(x+w, y, x+w, y+r, r);
  ctx.lineTo(x+w, y+h-r);
  ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h);
  ctx.arcTo(x, y+h, x, y+h-r, r);
  ctx.lineTo(x, y+r);
  ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath();
}

function bbArmSeg(ctx, x1, y1, x2, y2, w, col) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function bbDrawCompetitor(ctx, cx, baseY, compData, poseDir, isPlayer) {
  const skin = compData.skin || '#e8b47a';
  const skinD = '#8a5030';
  const hair = compData.hairColor || '#4a3728';
  const female = compData.gender === 'female';
  const pose = BB_ARM_POSES[poseDir] || BB_ARM_POSES['null'];
  const eq = compData.cosmetics || [];

  ctx.save();
  ctx.translate(cx, baseY);

  if (isPlayer) { ctx.shadowColor = '#9e7cff'; ctx.shadowBlur = 18; }

  // Arms (behind torso)
  const [ls, le, lw] = pose.l;
  const [rs, re, rw] = pose.r;
  bbArmSeg(ctx, ls[0], ls[1], le[0], le[1], 13, skin);
  bbArmSeg(ctx, le[0], le[1], lw[0], lw[1], 10, skinD);
  bbArmSeg(ctx, rs[0], rs[1], re[0], re[1], 13, skin);
  bbArmSeg(ctx, re[0], re[1], rw[0], rw[1], 10, skinD);

  // Shorts
  ctx.fillStyle = '#1a1a2e';
  bbRR(ctx, -20, -36, 40, 22, 5); ctx.fill();

  // Legs
  ctx.fillStyle = skin;
  bbRR(ctx, -19, -15, 14, 24, 5); ctx.fill();
  bbRR(ctx, 5, -15, 14, 24, 5); ctx.fill();
  ctx.fillStyle = '#111';
  bbRR(ctx, -20, 7, 15, 6, 3); ctx.fill();
  bbRR(ctx, 5, 7, 15, 6, 3); ctx.fill();

  ctx.shadowBlur = 0;

  // Torso
  ctx.fillStyle = skin;
  bbRR(ctx, -19, -72, 38, 40, 8); ctx.fill();
  if (female) { ctx.fillStyle = '#2a2a3e'; bbRR(ctx, -17, -68, 34, 20, 6); ctx.fill(); }

  // Belt
  if (eq.includes('lifting_belt')) {
    ctx.fillStyle = '#8B6914';
    bbRR(ctx, -19, -38, 38, 6, 2); ctx.fill();
  }
  // Gold chain
  if (eq.includes('gold_chain')) {
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -54, 11, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(0, -43, 3, 0, Math.PI * 2); ctx.fill();
  }

  // Neck
  ctx.fillStyle = skinD; bbRR(ctx, -5, -82, 10, 14, 4); ctx.fill();

  // Head
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -97, 17, 19, 0, 0, Math.PI*2); ctx.fill();

  // Hair cap
  ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(0, -105, 17, 13, 0, Math.PI, 0); ctx.fill();
  if (female) {
    // Space buns
    ctx.beginPath(); ctx.arc(-16, -112, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(16, -112, 8, 0, Math.PI*2); ctx.fill();
  }

  // Eyes
  ctx.fillStyle = '#2c1810';
  ctx.beginPath(); ctx.ellipse(-6, -95, 2.5, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, -95, 2.5, 3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-5, -96, 1, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -96, 1, 0, Math.PI*2); ctx.fill();

  // Mouth
  ctx.strokeStyle = skinD; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-5, -88); ctx.quadraticCurveTo(0, -84, 5, -88); ctx.stroke();

  // Head cosmetics
  if (eq.includes('crown')) {
    ctx.fillStyle = '#ffd700';
    const cp = [[-10,-120],[-7,-128],[-4,-123],[0,-130],[4,-123],[7,-128],[10,-120]];
    ctx.beginPath(); cp.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath(); ctx.fill();
  } else if (eq.includes('headband_gold') || eq.includes('headband_red') || eq.includes('headband_blue')) {
    ctx.fillStyle = eq.includes('headband_gold') ? '#ffd700' : eq.includes('headband_red') ? '#e53935' : '#1e88e5';
    bbRR(ctx, -17, -106, 34, 5, 2.5); ctx.fill();
  }

  // Medal
  if (eq.includes('medal_gold') || eq.includes('medal_silver') || eq.includes('medal_bronze')) {
    const mc = eq.includes('medal_gold') ? '#ffd700' : eq.includes('medal_silver') ? '#c0c0c0' : '#cd7f32';
    ctx.fillStyle = mc; ctx.beginPath(); ctx.arc(0, -60, 6, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 5px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('★', 0, -58);
  }

  // Label
  ctx.textAlign = 'center'; ctx.shadowBlur = 0;
  if (isPlayer) {
    ctx.fillStyle = '#9e7cff'; ctx.font = 'bold 9px Inter,sans-serif'; ctx.fillText('YOU', 0, 22);
  } else {
    ctx.fillStyle = '#888'; ctx.font = '8px Inter,sans-serif'; ctx.fillText(compData.name || 'NPC', 0, 22);
  }

  ctx.restore();
}

function bbDrawJudge(ctx, cx, baseY) {
  // Compact: head + shoulders only, ~80px tall
  ctx.save(); ctx.translate(cx, baseY);
  // Shoulders / jacket
  ctx.fillStyle = '#1a1a2e';
  bbRR(ctx, -24, -26, 48, 28, 5); ctx.fill();
  ctx.fillStyle = '#252545';
  bbRR(ctx, -19, -22, 38, 24, 4); ctx.fill();
  // Lapels
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(-9,-10); ctx.lineTo(0,-6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,-20); ctx.lineTo(9,-10); ctx.lineTo(0,-6); ctx.closePath(); ctx.fill();
  // Clipboard
  ctx.fillStyle = '#d4c4a4'; bbRR(ctx, -10, -18, 20, 20, 2); ctx.fill();
  ctx.fillStyle = '#8a7a5a';
  for (let i=0;i<3;i++) { ctx.fillRect(-7, -13+i*6, 14, 1.5); }
  // Neck
  ctx.fillStyle = '#c8965e'; bbRR(ctx, -5, -38, 10, 14, 3); ctx.fill();
  // Head from behind
  ctx.fillStyle = '#c8965e'; ctx.beginPath(); ctx.ellipse(0, -54, 16, 18, 0, 0, Math.PI*2); ctx.fill();
  // Hair (back of head)
  ctx.fillStyle = '#2c1810'; ctx.beginPath(); ctx.ellipse(0, -62, 16, 12, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
}

function bbDrawBackground(ctx) {
  // Dark theater
  ctx.fillStyle = '#0a0814'; ctx.fillRect(0, 0, W, H);

  // Stage spotlights
  [W*0.25, W*0.5, W*0.75].forEach(sx => {
    const g = ctx.createRadialGradient(sx, 0, 0, sx, 80, 200);
    g.addColorStop(0, 'rgba(255,240,160,0.22)');
    g.addColorStop(1, 'rgba(255,240,160,0)');
    ctx.fillStyle = g; ctx.fillRect(sx-200, 0, 400, 310);
  });

  // Stage platform
  ctx.fillStyle = '#2a1a3e'; ctx.fillRect(0, 295, W, 55);
  ctx.fillStyle = '#3a2a4e'; ctx.fillRect(0, 295, W, 8);
  ctx.fillStyle = 'rgba(255,215,0,0.12)'; ctx.fillRect(0, 295, W, 3);

  // Left curtain
  ctx.fillStyle = '#6a0020';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(52,0); ctx.lineTo(34,360); ctx.lineTo(0,360); ctx.fill();
  ctx.strokeStyle = '#5a0018'; ctx.lineWidth = 1;
  for (let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(10+i*14,0); ctx.lineTo(6+i*12,360); ctx.stroke(); }

  // Right curtain
  ctx.fillStyle = '#6a0020';
  ctx.beginPath(); ctx.moveTo(W,0); ctx.lineTo(W-52,0); ctx.lineTo(W-34,360); ctx.lineTo(W,360); ctx.fill();
  ctx.strokeStyle = '#5a0018';
  for (let i=0;i<3;i++){ ctx.beginPath(); ctx.moveTo(W-10-i*14,0); ctx.lineTo(W-6-i*12,360); ctx.stroke(); }

  // Banner
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; bbRR(ctx, 65, 8, W-130, 40, 8); ctx.fill();
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 16px Cinzel,serif'; ctx.textAlign = 'center';
  ctx.fillText('🏆 IRONLORE CLASSIC', W/2, 34); ctx.textAlign = 'left';

  // Audience section
  ctx.fillStyle = '#0d0a18'; ctx.fillRect(0, 350, W, H-350);

  // Judge table
  ctx.fillStyle = '#3a2a10'; ctx.fillRect(10, 552, W-20, 16);
  ctx.fillStyle = '#4a3a18'; ctx.fillRect(10, 552, W-20, 4);
}

function bbDrawQTE(ctx) {
  if (!bbCue) return;
  const ci = BB_CUES[bbCue.dir];
  const prog = bbCue.timer / bbCue.maxTimer;
  const tc = prog > 0.6 ? '#4caf50' : prog > 0.3 ? '#ffaa00' : '#f44336';
  const qy = 348;

  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  bbRR(ctx, W/2-110, qy, 220, 66, 12); ctx.fill();
  ctx.strokeStyle = ci.color; ctx.lineWidth = 2; ctx.stroke();

  ctx.fillStyle = ci.color; ctx.font = 'bold 38px Inter,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(ci.arrow, W/2, qy + 38);
  ctx.fillStyle = '#ccc'; ctx.font = 'bold 9px Inter,sans-serif';
  ctx.fillText(ci.label, W/2, qy + 52);

  const bw = 180;
  const bx = W/2 - bw/2;
  ctx.fillStyle = '#333'; bbRR(ctx, bx, qy+57, bw, 7, 3.5); ctx.fill();
  ctx.fillStyle = tc; bbRR(ctx, bx, qy+57, bw*prog, 7, 3.5); ctx.fill();
  ctx.textAlign = 'left';
}

function bbDrawHUD(ctx) {
  ctx.font = 'bold 11px Inter,sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = '#888'; ctx.fillText('STRIKES', 12, 22);
  for (let i=0;i<3;i++) {
    ctx.fillStyle = i < bbStrikes ? '#f44336' : '#3a3a4a';
    ctx.font = 'bold 18px Inter,sans-serif';
    ctx.fillText('✕', 12 + i*24, 44);
  }
  ctx.textAlign = 'right';
  ctx.fillStyle = '#888'; ctx.font = 'bold 11px Inter,sans-serif'; ctx.fillText('POSES', W-12, 22);
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 22px Cinzel,serif';
  ctx.fillText(`${bbProgress}/${bbRequired}`, W-12, 48);
  if (bbFlashTimer > 0) {
    const a = 0.38 * (bbFlashTimer / 0.4);
    ctx.fillStyle = bbFlashColor === 'green' ? `rgba(76,175,80,${a})` : `rgba(244,67,54,${a})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.textAlign = 'left';
}

function bbDrawControls(ctx) {
  // Horizontal row of 4 buttons at the bottom
  const bw = 50, bh = 44, gap = 10;
  const totalW = 4 * bw + 3 * gap;
  const startX = (W - totalW) / 2;
  const by = H - bh - 8;
  const dirs = ['left','up','down','right'];
  const arrows = { up:'↑', down:'↓', left:'←', right:'→' };
  bbBtnRects = dirs.map((dir, i) => ({ dir, x: startX + i*(bw+gap), y: by, w: bw, h: bh }));
  bbBtnRects.forEach(b => {
    const ci = BB_CUES[b.dir];
    const active = bbCue && bbCue.dir === b.dir;
    ctx.fillStyle = active ? ci.color + '55' : '#1a1a2e';
    bbRR(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.strokeStyle = active ? ci.color : '#3a3a5a'; ctx.lineWidth = active ? 2.5 : 1; ctx.stroke();
    ctx.fillStyle = active ? ci.color : '#666';
    ctx.font = `bold ${active ? 26 : 22}px Inter,sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(arrows[b.dir], b.x + b.w/2, b.y + b.h/2 + 9);
    // Pose label below arrow
    ctx.fillStyle = active ? ci.color + 'cc' : '#444';
    ctx.font = '7px Inter,sans-serif';
    ctx.fillText(BB_CUES[b.dir].label.split(' ')[0], b.x + b.w/2, b.y + b.h - 5);
  });
  ctx.textAlign = 'left';
}

function bbDrawPreComp(ctx) {
  bbDrawBackground(ctx);
  bbDrawCompetitor(ctx, W*0.25, 295, bbNPC1 || {gender:'male',skin:'#e8b47a',hairColor:'#4a3728',cosmetics:[],name:'IronMike'}, null, false);
  bbDrawCompetitor(ctx, W*0.5,  295, bbPlayerData2 || {gender:'male',skin:'#e8b47a',hairColor:'#4a3728',cosmetics:[]}, null, true);
  bbDrawCompetitor(ctx, W*0.75, 295, bbNPC2 || {gender:'female',skin:'#c8965e',hairColor:'#111',cosmetics:[],name:'FlexFiona'}, null, false);
  bbDrawJudge(ctx, W*0.2, 578);
  bbDrawJudge(ctx, W*0.5, 578);
  bbDrawJudge(ctx, W*0.8, 578);

  const done = bbStats.lastDate === todayStr();
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  bbRR(ctx, W/2-155, H/2-115, 310, done ? 120 : 155, 14); ctx.fill();
  ctx.strokeStyle = '#9e7cff'; ctx.lineWidth = 1.5; ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 19px Cinzel,serif';
  ctx.fillText('BODYBUILDING SHOW', W/2, H/2 - 78);
  ctx.fillStyle = '#bbb'; ctx.font = '12px Inter,sans-serif';
  ctx.fillText(`${bbRequired} poses. 3 strikes = eliminated.`, W/2, H/2 - 52);
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 13px Inter,sans-serif';
  ctx.fillText(`Prize: ${bbGoldReward} gold`, W/2, H/2 - 32);

  if (done) {
    const won = bbStats.lastResult === 'win';
    ctx.fillStyle = won ? '#4caf50' : '#f44336';
    ctx.font = 'bold 14px Inter,sans-serif';
    ctx.fillText(won ? '🏆 Won today! Come back tomorrow.' : '✗ Failed today. Come back tomorrow.', W/2, H/2 + 2);
  } else {
    ctx.fillStyle = '#9e7cff'; bbRR(ctx, W/2-75, H/2+8, 150, 42, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Inter,sans-serif'; ctx.fillText('COMPETE!', W/2, H/2 + 36);
  }
  ctx.textAlign = 'left';
}

function bbDrawCountdown(ctx) {
  bbDrawBackground(ctx);
  bbDrawCompetitor(ctx, W*0.25, 295, bbNPC1, null, false);
  bbDrawCompetitor(ctx, W*0.5,  295, bbPlayerData2, null, true);
  bbDrawCompetitor(ctx, W*0.75, 295, bbNPC2, null, false);
  bbDrawJudge(ctx, W*0.2, 578);
  bbDrawJudge(ctx, W*0.5, 578);
  bbDrawJudge(ctx, W*0.8, 578);
  const num = Math.ceil(bbCountdownTimer);
  ctx.fillStyle = '#ffd700'; ctx.font = `bold 90px Cinzel,serif`; ctx.textAlign = 'center';
  ctx.fillText(num > 0 ? String(num) : 'GO!', W/2, H*0.52 + 35);
  ctx.textAlign = 'left';
}

function bbDrawPlaying(ctx) {
  bbDrawBackground(ctx);
  const pose = bbPoseTimer > 0 ? bbCurrentPose : null;
  bbDrawCompetitor(ctx, W*0.25, 295, bbNPC1, pose, false);
  bbDrawCompetitor(ctx, W*0.5,  295, bbPlayerData2, pose, true);
  bbDrawCompetitor(ctx, W*0.75, 295, bbNPC2, pose, false);
  bbDrawJudge(ctx, W*0.2, 578);
  bbDrawJudge(ctx, W*0.5, 578);
  bbDrawJudge(ctx, W*0.8, 578);
  bbDrawHUD(ctx);
  if (bbCue) bbDrawQTE(ctx);
  bbDrawControls(ctx);
}

function bbDrawResult(ctx, won) {
  bbDrawBackground(ctx);
  const fp = won ? 'up' : null;
  bbDrawCompetitor(ctx, W*0.25, 295, bbNPC1, fp, false);
  bbDrawCompetitor(ctx, W*0.5,  295, bbPlayerData2, fp, true);
  bbDrawCompetitor(ctx, W*0.75, 295, bbNPC2, fp, false);
  bbDrawJudge(ctx, W*0.2, 578);
  bbDrawJudge(ctx, W*0.5, 578);
  bbDrawJudge(ctx, W*0.8, 578);
  ctx.fillStyle = 'rgba(0,0,0,0.78)'; ctx.fillRect(0, H*0.38, W, 120);
  ctx.textAlign = 'center';
  if (won) {
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 36px Cinzel,serif'; ctx.fillText('WINNER!', W/2, H*0.38+50);
    ctx.fillStyle = '#4caf50'; ctx.font = '18px Inter,sans-serif'; ctx.fillText(`+${bbGoldReward} gold earned!`, W/2, H*0.38+80);
  } else {
    ctx.fillStyle = '#f44336'; ctx.font = 'bold 32px Cinzel,serif'; ctx.fillText('ELIMINATED!', W/2, H*0.38+50);
    ctx.fillStyle = '#aaa'; ctx.font = '15px Inter,sans-serif'; ctx.fillText('Try again tomorrow.', W/2, H*0.38+80);
  }
  ctx.fillStyle = '#666'; ctx.font = '12px Inter,sans-serif'; ctx.fillText('Tap to continue', W/2, H*0.38+108);
  ctx.textAlign = 'left';
}

function bbRender() {
  if (!bbCtx) return;
  bbCtx.clearRect(0, 0, W, H);
  bbCtx.save();
  if (bbState === 'idle')      bbDrawPreComp(bbCtx);
  else if (bbState === 'countdown') bbDrawCountdown(bbCtx);
  else if (bbState === 'playing')   bbDrawPlaying(bbCtx);
  else if (bbState === 'win')       bbDrawResult(bbCtx, true);
  else if (bbState === 'lose')      bbDrawResult(bbCtx, false);
  bbCtx.restore();
}

function bbSpawnCue() {
  const dirs = ['up','down','left','right'];
  const dir = dirs[Math.floor(Math.random() * 4)];
  const { cueWindow } = bbGetConfig();
  bbCue = { dir, timer: cueWindow, maxTimer: cueWindow };
  bbBetweenTimer = 0;
}

function bbHandleInput(dir) {
  if (bbState !== 'playing' || !bbCue) return;
  if (dir === bbCue.dir) {
    bbProgress++;
    bbCurrentPose = dir;
    bbPoseTimer = 0.55;
    bbFlashColor = 'green';
    bbFlashTimer = 0.4;
    bbCue = null;
    const { betweenTime, required, goldReward } = bbGetConfig();
    bbBetweenTimer = betweenTime * 0.7;
    if (bbProgress >= bbRequired) {
      bbState = 'win';
      bbStats.totalWins++;
      bbStats.totalComps++;
      if (bbStrikes === 0) bbStats.flawlessWins++;
      // Streak: increment if won yesterday, else reset to 1
      const yd = new Date(); yd.setDate(yd.getDate() - 1);
      const ydStr = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
      bbStats.bbStreak = (bbStats.lastDate === ydStr && bbStats.lastResult === 'win') ? (bbStats.bbStreak || 0) + 1 : 1;
      bbStats.lastDate = todayStr();
      bbStats.lastResult = 'win';
      bbSaveStats();
      try {
        const save = JSON.parse(localStorage.getItem('musclequest_save') || '{}');
        save.gold = (save.gold || 0) + bbGoldReward;
        localStorage.setItem('musclequest_save', JSON.stringify(save));
        const user = localStorage.getItem('musclequest_current_user');
        const pin = localStorage.getItem('musclequest_current_pin');
        if (user) localStorage.setItem(`musclequest_${user}`, JSON.stringify({ ...save, _pin: pin }));
        if (typeof MQ !== 'undefined' && MQ.syncStateFromStorage) MQ.syncStateFromStorage();
      } catch(e) {}
    }
  } else {
    bbStrikes++;
    bbFlashColor = 'red';
    bbFlashTimer = 0.4;
    bbCue = null;
    bbBetweenTimer = bbGetConfig().betweenTime;
    if (bbStrikes >= 3) {
      bbState = 'lose';
      bbStats.totalComps++;
      bbStats.lastDate = todayStr();
      bbStats.lastResult = 'lose';
      bbSaveStats();
    }
  }
}

function bbUpdate(dt) {
  if (bbState === 'countdown') {
    bbCountdownTimer -= dt;
    if (bbCountdownTimer <= 0) {
      bbState = 'playing';
      bbBetweenTimer = 0.5;
    }
    return;
  }
  if (bbState !== 'playing') return;
  if (bbFlashTimer > 0) bbFlashTimer -= dt;
  if (bbPoseTimer > 0) bbPoseTimer -= dt;
  if (bbCue) {
    bbCue.timer -= dt;
    if (bbCue.timer <= 0) {
      bbStrikes++;
      bbFlashColor = 'red';
      bbFlashTimer = 0.4;
      bbCue = null;
      bbBetweenTimer = bbGetConfig().betweenTime;
      if (bbStrikes >= 3) {
        bbState = 'lose';
        bbStats.totalComps++;
        bbStats.lastDate = todayStr();
        bbStats.lastResult = 'lose';
        bbSaveStats();
      }
    }
  } else {
    bbBetweenTimer -= dt;
    if (bbBetweenTimer <= 0) bbSpawnCue();
  }
}

function bbGameLoop(ts) {
  const dt = Math.min((ts - bbLastTime) / 1000, 0.05);
  bbLastTime = ts;
  bbUpdate(dt);
  bbRender();
  bbAnimFrame = requestAnimationFrame(bbGameLoop);
}

function bbHandleCanvasClick(e) {
  const rect = bbCanvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;

  if (bbState === 'idle') {
    if (bbStats.lastDate === todayStr()) return;
    const bx = W/2-75, by = H/2+8;
    if (cx >= bx && cx <= bx+150 && cy >= by && cy <= by+42) {
      bbState = 'countdown';
      bbCountdownTimer = 3;
      bbProgress = 0; bbStrikes = 0; bbCue = null;
      bbBetweenTimer = 0; bbPoseTimer = 0; bbCurrentPose = null; bbFlashTimer = 0;
    }
    return;
  }
  if (bbState === 'win' || bbState === 'lose') { bbState = 'idle'; return; }
  if (bbState !== 'playing') return;
  for (const b of bbBtnRects) {
    if (cx >= b.x && cx <= b.x+b.w && cy >= b.y && cy <= b.y+b.h) {
      bbHandleInput(b.dir); return;
    }
  }
}

function bbHandleKey(e) {
  if (bbState !== 'playing') return;
  const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right' };
  if (map[e.key]) { bbHandleInput(map[e.key]); e.preventDefault(); }
}

// ─── SUMO TOURNAMENT ───

let sumoCanvas, sumoCtx, sumoAnimFrame, sumoLastTime;
let sumoState = 'idle';
let sumoPosition = 0; // -5 (player out) to +5 (opponent out)
let sumoCue = null;
let sumoClashTimer = 0;
let sumoClashResult = null;
let sumoOpponent = null;
let sumoBtnRects = [];
let sumoCountdownTimer = 0;
let sumoStats = { wins: 0, total: 0, streak: 0, lastDate: null, lastResult: null };
let sumoPlayerLevel = 1;

const SUMO_MOVES = {
  up:    { label: 'PUSH',   arrow: '↑', color: '#ff6040' },
  down:  { label: 'PULL',   arrow: '↓', color: '#4488ff' },
  left:  { label: 'LEAN L', arrow: '←', color: '#44cc44' },
  right: { label: 'LEAN R', arrow: '→', color: '#ddaa20' },
};

const SUMO_LEGENDS = [
  { id: 'mentzer', name: 'Mentzer', icon: '💀', color: '#ff4444', title: 'The HIT Prophet'        },
  { id: 'arnold',  name: 'Arnold',  icon: '🏆', color: '#ffd700', title: 'The Austrian Oak'       },
  { id: 'ronnie',  name: 'Ronnie',  icon: '👑', color: '#9e7cff', title: '8× Mr. Olympia'         },
  { id: 'cbum',    name: 'CBum',    icon: '✨', color: '#00cfff', title: 'Classic Physique Champ'  },
  { id: 'dorian',  name: 'Dorian',  icon: '🦅', color: '#888888', title: 'The Shadow'             },
  { id: 'louie',   name: 'Louie',   icon: '⚡', color: '#ff8800', title: 'Powerlifting Genius'    },
];

function sumoGetDailyOpponent() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth()+1)*100 + d.getDate();
  return SUMO_LEGENDS[seed % SUMO_LEGENDS.length];
}

function sumoLoadStats() {
  try { const r = localStorage.getItem('musclequest_sumo'); if (r) sumoStats = { ...sumoStats, ...JSON.parse(r) }; } catch(e) {}
}

function sumoSaveStats() {
  localStorage.setItem('musclequest_sumo', JSON.stringify(sumoStats));
  try {
    const save = JSON.parse(localStorage.getItem('musclequest_save') || '{}');
    save._sumoWins = sumoStats.wins || 0;
    save._sumoStreak = sumoStats.streak || 0;
    localStorage.setItem('musclequest_save', JSON.stringify(save));
    const user = localStorage.getItem('musclequest_current_user');
    const pin = localStorage.getItem('musclequest_current_pin');
    if (user) localStorage.setItem(`musclequest_${user}`, JSON.stringify({ ...save, _pin: pin }));
    if (typeof firebase !== 'undefined' && firebase.firestore && user) {
      firebase.firestore().collection('users').doc(user).set({ _sumoWins: save._sumoWins, _sumoStreak: save._sumoStreak }, { merge: true });
    }
    if (typeof MQ !== 'undefined' && MQ.syncStateFromStorage) MQ.syncStateFromStorage();
  } catch(e) {}
}

function sumoGetCueWindow() {
  return sumoPlayerLevel <= 10 ? 2.2 : sumoPlayerLevel <= 20 ? 1.7 : 1.3;
}

function sumoDrawBackground(ctx) {
  ctx.fillStyle = '#1a0c06'; ctx.fillRect(0, 0, W, H);
  const crowd = ctx.createLinearGradient(0, 0, 0, 155);
  crowd.addColorStop(0, '#180a04'); crowd.addColorStop(1, '#2a1208');
  ctx.fillStyle = crowd; ctx.fillRect(0, 0, W, 155);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 18; col++) {
      const cx = col * 29 + (row % 2) * 14 + 8;
      const cy = row * 34 + 18;
      const r = 8 + (col % 3);
      ctx.fillStyle = `hsl(${(col*37+row*51)%360},20%,${12+row*4}%)`;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.75)'; bbRR(ctx, 80, 8, W-160, 36, 8); ctx.fill();
  ctx.strokeStyle = '#c87030'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#e88840'; ctx.font = 'bold 15px Cinzel,serif'; ctx.textAlign = 'center';
  ctx.fillText('🏟  SUMO GRAND TOURNAMENT', W/2, 30); ctx.textAlign = 'left';
  const floor = ctx.createLinearGradient(0, 155, 0, H);
  floor.addColorStop(0, '#5a3018'); floor.addColorStop(1, '#3a1a08');
  ctx.fillStyle = floor; ctx.fillRect(0, 155, W, H-155);
  ctx.save(); ctx.translate(W/2, 370);
  ctx.fillStyle = '#c89040'; ctx.beginPath(); ctx.ellipse(0, 0, 165, 55, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#d4a060'; ctx.beginPath(); ctx.ellipse(0, 0, 155, 50, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#c49050'; ctx.beginPath(); ctx.ellipse(0, 0, 145, 44, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#6a3810'; ctx.fillRect(-18, -6, 8, 12); ctx.fillRect(10, -6, 8, 12);
  ctx.restore();
}

function sumoDrawHair(ctx, hairStyle, hairCol, gender) {
  const h = hairStyle || 'default';
  ctx.fillStyle = hairCol || '#1a1a1a';
  if (h === 'shaved') {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.ellipse(0, -168, 18, 7, 0, 0, Math.PI*2); ctx.fill();
    return;
  }
  if (h === 'afro' || h === 'curly_fro') {
    ctx.beginPath(); ctx.arc(0, -168, 32, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = hairCol + '66';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(a) * 14, -168 + Math.sin(a) * 13, 6, 0, Math.PI*2); ctx.fill();
    }
    return;
  }
  if (h === 'flat_top') {
    ctx.fillRect(-22, -196, 44, 28);
    ctx.beginPath(); ctx.ellipse(0, -196, 22, 8, 0, 0, Math.PI*2); ctx.fill();
    return;
  }
  if (h === 'mohawk') {
    ctx.fillRect(-5, -212, 10, 44);
    ctx.beginPath(); ctx.ellipse(0, -212, 5, 9, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -170, 8, 7, 0, Math.PI, 0); ctx.fill();
    return;
  }
  if (h === 'space_buns') {
    ctx.beginPath(); ctx.arc(-16, -184, 11, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(16, -184, 11, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -170, 20, 9, 0, Math.PI, 0); ctx.fill();
    return;
  }
  if (h === 'pixie' || h === 'bob') {
    ctx.beginPath(); ctx.ellipse(0, -170, 27, 12, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-24, -160, 8, 14, 0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(24, -160, 8, 14, -0.3, 0, Math.PI*2); ctx.fill();
    return;
  }
  if (h === 'emo_sweep') {
    ctx.beginPath(); ctx.ellipse(0, -170, 24, 11, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-16, -165, 16, 7, -0.5, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(3, -188, 6, 16);
    ctx.beginPath(); ctx.ellipse(5, -191, 7, 6, 0, 0, Math.PI*2); ctx.fill();
    return;
  }
  // Default: chonmage (topknot) — covers most styles
  ctx.beginPath(); ctx.ellipse(0, -170, 22, 12, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(-4, -188, 8, 16);
  const bunR = ['pompadour','braided_crown','locs','man_bun','long_straight','beach_waves'].includes(h) ? 11 : 8;
  ctx.beginPath(); ctx.ellipse(3, -196, bunR, Math.round(bunR * 0.75), -0.25, 0, Math.PI*2); ctx.fill();
  if (h === 'locs' || h === 'cornrows') {
    ctx.strokeStyle = hairCol; ctx.lineWidth = 3; ctx.lineCap = 'round';
    [[-20,-174,-24,-156],[-28,-165,-32,-148],[20,-174,24,-156]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
  }
  if (h === 'braided_crown') {
    ctx.strokeStyle = hairCol; ctx.lineWidth = 5;
    ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.ellipse(0, -170, 26, 13, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    ctx.setLineDash([]);
  }
}

function sumoDrawFighter(ctx, cx, baseY, isPlayer, opponent, facingRight, pd) {
  const skin  = isPlayer && pd ? pd.skin  : (opponent ? '#c4906a' : '#c4906a');
  const skinD = isPlayer && pd ? pd.skinD : (opponent ? '#946040' : '#946040');
  const mawashi = isPlayer ? '#2244aa' : (opponent ? opponent.color : '#8B0000');
  const hairCol = isPlayer && pd ? pd.hair : '#2a1a0a';
  const hairStyle = isPlayer && pd ? pd.hairStyle : 'default';
  const female = isPlayer && pd && pd.gender === 'female';
  ctx.save(); ctx.translate(cx, baseY);
  if (!facingRight) ctx.scale(-1, 1);
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0, 14, 44, 10, 0, 0, Math.PI*2); ctx.fill();
  // Legs / lower arms
  ctx.fillStyle = skin; bbRR(ctx, -28, -28, 24, 36, 8); ctx.fill(); bbRR(ctx, 4, -28, 24, 36, 8); ctx.fill();
  ctx.fillStyle = skinD; bbRR(ctx, -30, 4, 26, 10, 4); ctx.fill(); bbRR(ctx, 4, 4, 26, 10, 4); ctx.fill();
  // Mawashi (loincloth)
  ctx.fillStyle = mawashi; bbRR(ctx, -30, -40, 60, 18, 5); ctx.fill();
  ctx.fillStyle = mawashi + 'cc'; bbRR(ctx, -10, -42, 20, 22, 4); ctx.fill();
  // Body (massive belly)
  if (isPlayer) { ctx.shadowColor = '#9e7cff'; ctx.shadowBlur = 16; }
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -70, 42, 55, 0, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  // Arms
  ctx.fillStyle = skin; bbRR(ctx, -52, -92, 22, 52, 10); ctx.fill(); bbRR(ctx, -50, -42, 18, 20, 6); ctx.fill();
  bbRR(ctx, 30, -92, 22, 52, 10); ctx.fill(); bbRR(ctx, 32, -42, 18, 18, 6); ctx.fill();
  // Neck
  ctx.fillStyle = skinD; bbRR(ctx, -10, -132, 20, 18, 6); ctx.fill();
  // Head
  ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(0, -152, 30, 28, 0, 0, Math.PI*2); ctx.fill();
  // Hair
  sumoDrawHair(ctx, hairStyle, hairCol, female ? 'female' : 'male');
  // Eyes
  ctx.fillStyle = '#2c1810';
  ctx.beginPath(); ctx.ellipse(-9, -151, 3.5, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(9, -151, 3.5, 4, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-8, -152, 1.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -152, 1.5, 0, Math.PI*2); ctx.fill();
  // Female: eyelashes
  if (female) {
    ctx.strokeStyle = '#2c1810'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    [[-11,-154.5],[-9,-155.5],[-7,-155],[-6,-153.5],[7,-153.5],[9,-155],[11,-155.5],[13,-154.5]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.moveTo(x, y+1); ctx.lineTo(x, y-2.5); ctx.stroke();
    });
  }
  // Eyebrows
  ctx.strokeStyle = hairCol; ctx.lineWidth = 2; ctx.lineCap = 'round';
  if (!isPlayer || !opponent) {
    ctx.beginPath(); ctx.moveTo(-14,-158); ctx.lineTo(-5,-155); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14,-158); ctx.lineTo(5,-155); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-12,-157); ctx.lineTo(-5,-155); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12,-157); ctx.lineTo(5,-155); ctx.stroke();
  }
  // Mouth
  ctx.strokeStyle = skinD; ctx.lineWidth = 1.5;
  if (female) {
    ctx.beginPath(); ctx.moveTo(-6,-141); ctx.quadraticCurveTo(0,-138,6,-141); ctx.stroke();
  } else if (!isPlayer) {
    ctx.beginPath(); ctx.moveTo(-7,-141); ctx.quadraticCurveTo(0,-145,7,-141); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-6,-141); ctx.lineTo(6,-141); ctx.stroke();
  }
  // Nose
  ctx.fillStyle = skinD; ctx.beginPath(); ctx.ellipse(0,-145,3,2,0,0,Math.PI*2); ctx.fill();
  if (!facingRight) ctx.scale(-1, 1);
  const lc = isPlayer ? '#9e7cff' : (opponent ? opponent.color : '#ff8844');
  ctx.fillStyle = lc; ctx.font = 'bold 10px Inter,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(isPlayer ? (pd ? pd.name : 'YOU') : (opponent ? opponent.name : 'OPP'), 0, 28);
  if (!isPlayer && opponent) { ctx.fillStyle = lc + 'aa'; ctx.font = '8px Inter,sans-serif'; ctx.fillText(opponent.title, 0, 39); }
  ctx.restore();
}

function sumoDrawPositionMeter(ctx) {
  const bw = 260, bh = 18, bx = W/2 - bw/2, by = 490;
  ctx.fillStyle = '#1a0e06'; bbRR(ctx, bx-2, by-2, bw+4, bh+4, 5); ctx.fill();
  ctx.fillStyle = '#2244aa'; bbRR(ctx, bx, by, bw/2, bh, 4); ctx.fill();
  ctx.fillStyle = sumoOpponent ? sumoOpponent.color : '#8B0000'; bbRR(ctx, bx+bw/2, by, bw/2, bh, 4); ctx.fill();
  const knotX = bx + bw/2 + (sumoPosition / 10) * (bw/2 - 10);
  ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.arc(knotX, by + bh/2, 11, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#666'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#222'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('●', knotX, by + bh/2 + 3);
  ctx.fillStyle = '#6688cc'; ctx.font = 'bold 8px Inter,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('YOU', bx+5, by+13);
  ctx.fillStyle = sumoOpponent ? sumoOpponent.color : '#cc4444'; ctx.textAlign = 'right';
  ctx.fillText(sumoOpponent ? sumoOpponent.name : 'OPP', bx+bw-5, by+13); ctx.textAlign = 'left';
}

function sumoDrawQTE(ctx) {
  if (!sumoCue) return;
  const ci = SUMO_MOVES[sumoCue.dir];
  const prog = sumoCue.timer / sumoCue.maxTimer;
  const tc = prog > 0.6 ? '#4caf50' : prog > 0.3 ? '#ffaa00' : '#f44336';
  const qy = 432;
  ctx.fillStyle = 'rgba(0,0,0,0.9)'; bbRR(ctx, W/2-120, qy, 240, 54, 12); ctx.fill();
  ctx.strokeStyle = ci.color; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = ci.color; ctx.font = 'bold 34px Inter,sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(ci.arrow, W/2, qy + 36);
  ctx.fillStyle = '#ddd'; ctx.font = 'bold 9px Inter,sans-serif'; ctx.fillText(ci.label, W/2, qy + 49);
  const bw = 200, bx = W/2 - bw/2;
  ctx.fillStyle = '#333'; bbRR(ctx, bx, qy+55, bw, 6, 3); ctx.fill();
  ctx.fillStyle = tc; bbRR(ctx, bx, qy+55, bw*prog, 6, 3); ctx.fill();
  ctx.textAlign = 'left';
}

function sumoDrawControls(ctx) {
  const bw = 52, bh = 44, gap = 8;
  const totalW = 4*bw + 3*gap;
  const startX = (W - totalW)/2;
  const by = H - bh - 10;
  const dirs = ['left','up','down','right'];
  const arrows = { up:'↑', down:'↓', left:'←', right:'→' };
  sumoBtnRects = dirs.map((dir, i) => ({ dir, x: startX + i*(bw+gap), y: by, w: bw, h: bh }));
  sumoBtnRects.forEach(b => {
    const ci = SUMO_MOVES[b.dir];
    const active = sumoCue && sumoCue.dir === b.dir;
    ctx.fillStyle = active ? ci.color + '55' : '#1a0e06';
    bbRR(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.strokeStyle = active ? ci.color : '#4a2810'; ctx.lineWidth = active ? 2.5 : 1.5; ctx.stroke();
    ctx.fillStyle = active ? ci.color : '#664422';
    ctx.font = `bold ${active ? 26 : 22}px Inter,sans-serif`; ctx.textAlign = 'center';
    ctx.fillText(arrows[b.dir], b.x + b.w/2, b.y + b.h/2 + 9);
    ctx.fillStyle = active ? ci.color+'cc' : '#442810'; ctx.font = '7px Inter,sans-serif';
    ctx.fillText(ci.label, b.x + b.w/2, b.y + b.h - 5);
  });
  ctx.textAlign = 'left';
}

function sumoDrawHUD(ctx) {
  if (sumoOpponent) {
    ctx.fillStyle = sumoOpponent.color; ctx.font = 'bold 11px Inter,sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(`${sumoOpponent.icon} ${sumoOpponent.name}`, W-12, 170);
    ctx.fillStyle = '#888'; ctx.font = '9px Inter,sans-serif'; ctx.fillText(sumoOpponent.title, W-12, 182);
  }
  ctx.fillStyle = '#9e7cff'; ctx.font = 'bold 11px Inter,sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`Wins: ${sumoStats.wins}`, 12, 170);
  ctx.fillStyle = '#666'; ctx.font = '9px Inter,sans-serif'; ctx.fillText(`Streak: ${sumoStats.streak}`, 12, 182);
  ctx.textAlign = 'left';
  if (sumoClashTimer > 0 && sumoClashResult) {
    const a = 0.35 * (sumoClashTimer / 0.4);
    ctx.fillStyle = sumoClashResult === 'push' ? `rgba(76,175,80,${a})` : `rgba(244,67,54,${a})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function sumoDrawPreMatch(ctx) {
  const spd = awGetPlayerData();
  sumoDrawBackground(ctx);
  sumoDrawFighter(ctx, W*0.32, 375, true, null, true, spd);
  sumoDrawFighter(ctx, W*0.68, 375, false, sumoOpponent, false);
  sumoDrawPositionMeter(ctx);
  sumoDrawHUD(ctx);
  const done = sumoStats.lastDate === todayStr();
  ctx.fillStyle = 'rgba(0,0,0,0.85)'; bbRR(ctx, W/2-155, H/2-110, 310, done ? 120 : 155, 14); ctx.fill();
  ctx.strokeStyle = '#c87030'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e88840'; ctx.font = 'bold 18px Cinzel,serif'; ctx.fillText('SUMO GRAND TOURNAMENT', W/2, H/2-72);
  ctx.fillStyle = '#bbb'; ctx.font = '11px Inter,sans-serif';
  ctx.fillText('Push opponent out of the ring.', W/2, H/2-48);
  ctx.fillText('10 net pushes to win · 10 fails = out!', W/2, H/2-30);
  if (done) {
    const won = sumoStats.lastResult === 'win';
    ctx.fillStyle = won ? '#4caf50' : '#f44336'; ctx.font = 'bold 13px Inter,sans-serif';
    ctx.fillText(won ? '🏆 Victory today! Come back tomorrow.' : '✗ Defeated today. Come back tomorrow.', W/2, H/2+4);
  } else {
    ctx.fillStyle = '#c87030'; bbRR(ctx, W/2-75, H/2+18, 150, 42, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Inter,sans-serif'; ctx.fillText('FIGHT!', W/2, H/2+46);
  }
  ctx.textAlign = 'left';
}

function sumoDrawCountdown(ctx) {
  const spd = awGetPlayerData();
  sumoDrawBackground(ctx);
  sumoDrawFighter(ctx, W*0.32, 375, true, null, true, spd);
  sumoDrawFighter(ctx, W*0.68, 375, false, sumoOpponent, false);
  sumoDrawPositionMeter(ctx);
  sumoDrawHUD(ctx);
  const n = Math.ceil(sumoCountdownTimer);
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; bbRR(ctx, W/2-60, H/2-62, 120, 104, 20); ctx.fill();
  ctx.fillStyle = '#e88840'; ctx.font = 'bold 72px Cinzel,serif'; ctx.textAlign = 'center';
  ctx.fillText(n, W/2, H/2+24); ctx.textAlign = 'left';
}

function sumoDrawPlaying(ctx) {
  const spd = awGetPlayerData();
  sumoDrawBackground(ctx);
  const posOff = sumoPosition * 10;
  let playerX = W*0.32 + posOff, opponentX = W*0.68 + posOff;
  if (sumoClashTimer > 0) {
    const lean = Math.sin((1 - sumoClashTimer/0.5) * Math.PI) * 28;
    playerX += lean; opponentX -= lean;
  }
  sumoDrawFighter(ctx, playerX, 375, true, null, true, spd);
  sumoDrawFighter(ctx, opponentX, 375, false, sumoOpponent, false);
  sumoDrawPositionMeter(ctx);
  sumoDrawQTE(ctx);
  sumoDrawControls(ctx);
  sumoDrawHUD(ctx);
}

function sumoDrawResult(ctx, won) {
  const spd = awGetPlayerData();
  sumoDrawBackground(ctx);
  sumoDrawFighter(ctx, W*0.32 + sumoPosition*10, 375, true, null, true, spd);
  sumoDrawFighter(ctx, W*0.68 + sumoPosition*10, 375, false, sumoOpponent, false);
  sumoDrawPositionMeter(ctx);
  sumoDrawHUD(ctx);
  ctx.fillStyle = 'rgba(0,0,0,0.85)'; bbRR(ctx, W/2-150, H/2-80, 300, 140, 14); ctx.fill();
  ctx.strokeStyle = won ? '#4caf50' : '#f44336'; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#4caf50' : '#f44336'; ctx.font = 'bold 28px Cinzel,serif';
  ctx.fillText(won ? '🏆 VICTORY!' : '💥 DEFEATED!', W/2, H/2-36);
  ctx.fillStyle = '#ccc'; ctx.font = '13px Inter,sans-serif';
  ctx.fillText(won ? 'The crowd erupts!' : 'Better luck tomorrow!', W/2, H/2-10);
  ctx.fillStyle = '#888'; ctx.font = '10px Inter,sans-serif'; ctx.fillText('Tap to continue', W/2, H/2+50);
  ctx.textAlign = 'left';
}

function sumoHandleInput(dir) {
  if (sumoState !== 'playing' || !sumoCue) return;
  const correct = dir === sumoCue.dir;
  sumoCue = null;
  sumoClashTimer = 0.5;
  sumoClashResult = correct ? 'push' : 'pushed';
  if (correct) sumoPosition++; else sumoPosition--;
  if (sumoPosition >= 10) {
    sumoState = 'win';
    sumoStats.wins++; sumoStats.total++;
    const yd = new Date(); yd.setDate(yd.getDate()-1);
    const ydStr = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
    sumoStats.streak = (sumoStats.lastDate === ydStr && sumoStats.lastResult === 'win') ? (sumoStats.streak||0)+1 : 1;
    sumoStats.lastDate = todayStr(); sumoStats.lastResult = 'win';
    sumoSaveStats();
    try { if (typeof MQ !== 'undefined' && MQ.addGold) MQ.addGold(15); } catch(e) {}
  } else if (sumoPosition <= -10) {
    sumoState = 'lose';
    sumoStats.total++; sumoStats.streak = 0;
    sumoStats.lastDate = todayStr(); sumoStats.lastResult = 'lose';
    sumoSaveStats();
  }
}

function sumoUpdate(dt) {
  if (sumoState === 'countdown') {
    sumoCountdownTimer -= dt;
    if (sumoCountdownTimer <= 0) { sumoState = 'playing'; sumoPosition = 0; sumoCue = null; }
    return;
  }
  if (sumoState !== 'playing') return;
  if (sumoClashTimer > 0) { sumoClashTimer -= dt; if (sumoClashTimer <= 0) { sumoClashTimer = 0; sumoClashResult = null; } return; }
  if (!sumoCue) {
    const dirs = ['up','down','left','right'];
    const mt = sumoGetCueWindow();
    sumoCue = { dir: dirs[Math.floor(Math.random()*4)], timer: mt, maxTimer: mt };
  } else {
    sumoCue.timer -= dt;
    if (sumoCue.timer <= 0) {
      sumoCue = null; sumoPosition--; sumoClashTimer = 0.4; sumoClashResult = 'pushed';
      if (sumoPosition <= -10) {
        sumoState = 'lose'; sumoStats.total++; sumoStats.streak = 0;
        sumoStats.lastDate = todayStr(); sumoStats.lastResult = 'lose'; sumoSaveStats();
      }
    }
  }
}

function sumoRender() {
  if (!sumoCtx) return;
  sumoCtx.clearRect(0, 0, W, H);
  if (sumoState === 'idle') sumoDrawPreMatch(sumoCtx);
  else if (sumoState === 'countdown') sumoDrawCountdown(sumoCtx);
  else if (sumoState === 'playing') sumoDrawPlaying(sumoCtx);
  else if (sumoState === 'win' || sumoState === 'lose') sumoDrawResult(sumoCtx, sumoState === 'win');
}

function sumoGameLoop(ts) {
  if (!sumoAnimFrame) return;
  const dt = Math.min((ts - sumoLastTime) / 1000, 0.05);
  sumoLastTime = ts;
  sumoUpdate(dt);
  sumoRender();
  sumoAnimFrame = requestAnimationFrame(sumoGameLoop);
}

function sumoHandleCanvasClick(e) {
  const rect = sumoCanvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top) * scaleY;
  if (sumoState === 'idle') {
    if (sumoStats.lastDate === todayStr()) return;
    if (cx >= W/2-75 && cx <= W/2+75 && cy >= H/2+18 && cy <= H/2+60) {
      sumoState = 'countdown'; sumoCountdownTimer = 3; sumoPosition = 0; sumoCue = null; sumoClashTimer = 0;
    }
    return;
  }
  if (sumoState === 'win' || sumoState === 'lose') { sumoState = 'idle'; return; }
  if (sumoState !== 'playing') return;
  for (const b of sumoBtnRects) {
    if (cx >= b.x && cx <= b.x+b.w && cy >= b.y && cy <= b.y+b.h) { sumoHandleInput(b.dir); return; }
  }
}

function sumoHandleKey(e) {
  if (sumoState !== 'playing') return;
  const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right' };
  if (map[e.key]) { sumoHandleInput(map[e.key]); e.preventDefault(); }
}

function startSumo() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  if (sumoAnimFrame) cancelAnimationFrame(sumoAnimFrame);
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  document.removeEventListener('keydown', sumoHandleKey);
  const container = document.getElementById('fight-container');
  if (!container) return;
  sumoOpponent = sumoGetDailyOpponent();
  sumoPlayerLevel = calcPlayerLevel((getPlayerData().muscles));
  sumoState = 'idle'; sumoPosition = 0; sumoCue = null; sumoClashTimer = 0; sumoClashResult = null; sumoBtnRects = [];
  container.innerHTML = `
    <div class="comp-back-row"><button class="comp-back-btn" onclick="PunchOut.backToSelector()">← Back</button></div>
    <canvas id="sumo-canvas" width="${W}" height="${H}" style="width:100%;max-width:${W}px;display:block;margin:0 auto;border-radius:12px;background:#1a0c06;touch-action:none;"></canvas>`;
  sumoCanvas = document.getElementById('sumo-canvas');
  sumoCtx = sumoCanvas.getContext('2d');
  sumoCanvas.removeEventListener('click', sumoHandleCanvasClick);
  sumoCanvas.addEventListener('click', sumoHandleCanvasClick);
  sumoCanvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; sumoHandleCanvasClick({ clientX: t.clientX, clientY: t.clientY }); }, { passive: false });
  document.addEventListener('keydown', sumoHandleKey);
  sumoLastTime = performance.now();
  sumoAnimFrame = requestAnimationFrame(sumoGameLoop);
}

// ─── ARM WRESTLING ───

let awCanvas, awCtx, awAnimFrame, awLastTime;
let awState = 'idle'; // idle | countdown | playing | roundResult | win | lose
let awPosition = 0; // -10 (player loses) to +10 (player wins)
let awCurrentKey = 'up';
let awRoundTimer = 0;
const AW_ROUND_DURATION = 3.0;
let awPlayerCount = 0;
let awOpponentCount = 0;
let awOpponentTick = 0; // visual tick tracking opponent's count during round
let awRoundResultTimer = 0;
let awRoundResult = null;
let awOpponent = null;
let awCountdownTimer = 0;
let awStats = { wins: 0, total: 0, streak: 0, lastDate: null, lastResult: null };
let awBtnRects = [];
let awRoundIndex = 0;
let awFlashTimer = 0;
let awFlashColor = null;

const AW_LEGENDS = [
  { id: 'mentzer', name: 'Mentzer', icon: '💀', color: '#ff4444', title: 'The HIT Prophet',        level: 5  },
  { id: 'cbum',    name: 'CBum',    icon: '✨', color: '#00cfff', title: 'Classic Physique Champ', level: 6  },
  { id: 'dorian',  name: 'Dorian',  icon: '🦅', color: '#888888', title: 'The Shadow',             level: 7  },
  { id: 'arnold',  name: 'Arnold',  icon: '🏆', color: '#ffd700', title: 'The Austrian Oak',       level: 8  },
  { id: 'ronnie',  name: 'Ronnie',  icon: '👑', color: '#9e7cff', title: '8× Mr. Olympia',         level: 9  },
  { id: 'louie',   name: 'Louie',   icon: '⚡', color: '#ff8800', title: 'Powerlifting Genius',    level: 10 },
];

const AW_KEYS = {
  up:    { arrow: '↑', color: '#ff6040' },
  down:  { arrow: '↓', color: '#4488ff' },
  left:  { arrow: '←', color: '#44cc44' },
  right: { arrow: '→', color: '#ddaa20' },
};

function awGetDailyOpponent() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth()+1)*100 + d.getDate();
  return AW_LEGENDS[(seed + 3) % AW_LEGENDS.length]; // +3 offset so different from sumo
}

function awLoadStats() {
  try { const r = localStorage.getItem('musclequest_aw'); if (r) awStats = { ...awStats, ...JSON.parse(r) }; } catch(e) {}
}

function awSaveStats() {
  localStorage.setItem('musclequest_aw', JSON.stringify(awStats));
  try {
    const save = JSON.parse(localStorage.getItem('musclequest_save') || '{}');
    save._awWins = awStats.wins || 0;
    save._awStreak = awStats.streak || 0;
    localStorage.setItem('musclequest_save', JSON.stringify(save));
    const user = localStorage.getItem('musclequest_current_user');
    const pin = localStorage.getItem('musclequest_current_pin');
    if (user) localStorage.setItem(`musclequest_${user}`, JSON.stringify({ ...save, _pin: pin }));
    if (typeof firebase !== 'undefined' && firebase.firestore && user) {
      firebase.firestore().collection('users').doc(user).set({ _awWins: save._awWins, _awStreak: save._awStreak }, { merge: true });
    }
    if (typeof MQ !== 'undefined' && MQ.syncStateFromStorage) MQ.syncStateFromStorage();
  } catch(e) {}
}

function awNewRound() {
  const keys = ['up','down','left','right'];
  awCurrentKey = keys[Math.floor(Math.random() * 4)];
  awRoundTimer = AW_ROUND_DURATION;
  awPlayerCount = 0;
  awOpponentTick = 0;
  const level = awOpponent ? awOpponent.level : 6;
  awOpponentCount = level + Math.floor(Math.random() * 3); // level to level+2
  awRoundIndex++;
}

function awGetPlayerData() {
  try {
    const s = JSON.parse(localStorage.getItem('musclequest_save') || '{}');
    const skins  = ['#f2c49e','#e8a87c','#c8875a','#a0663c','#7a4428'];
    const skinsD = ['#c89870','#c07050','#a06038','#804428','#5a3018'];
    const hairCols = ['#4a3728','#111111','#7a3a1a','#c0980a','#883333'];
    return {
      skin: skins[Math.min(s.skinTone ?? 1, 4)],
      skinD: skinsD[Math.min(s.skinTone ?? 1, 4)],
      hair: hairCols[s.hairColor ?? 0],
      hairStyle: s.hair || (s.gender === 'female' ? 'space_buns' : 'default'),
      cosmetics: s.equippedCosmetics || [],
      gender: s.gender || 'male',
      name: s.name || 'You',
    };
  } catch(e) { return { skin:'#e8a87c', skinD:'#c07050', hair:'#4a3728', hairStyle:'default', cosmetics:[], gender:'male', name:'You' }; }
}

function awTaperedArm(ctx, x1, y1, x2, y2, w1, w2, col) {
  const dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy);
  const nx=-dy/len, ny=dx/len;
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  ctx.beginPath();
  ctx.moveTo(x1+nx*w1/2, y1+ny*w1/2);
  ctx.bezierCurveTo(mx+nx*w1*0.38, my+ny*w1*0.38, mx+nx*w2*0.38, my+ny*w2*0.38, x2+nx*w2/2, y2+ny*w2/2);
  ctx.lineTo(x2-nx*w2/2, y2-ny*w2/2);
  ctx.bezierCurveTo(mx-nx*w2*0.38, my-ny*w2*0.38, mx-nx*w1*0.38, my-ny*w1*0.38, x1-nx*w1/2, y1-ny*w1/2);
  ctx.closePath(); ctx.fillStyle=col; ctx.fill();
  // muscle highlight stripe
  ctx.beginPath();
  ctx.moveTo(x1+nx*w1*0.15, y1+ny*w1*0.15);
  ctx.bezierCurveTo(mx+nx*w1*0.15, my+ny*w1*0.15, mx+nx*w2*0.1, my+ny*w2*0.1, x2+nx*w2*0.1, y2+ny*w2*0.1);
  ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=4; ctx.lineCap='round'; ctx.stroke();
}

function awDrawBackground(ctx) {
  ctx.fillStyle='#0c0804'; ctx.fillRect(0,0,W,H);
  const cg=ctx.createLinearGradient(0,0,0,110); cg.addColorStop(0,'#160a04'); cg.addColorStop(1,'#281208');
  ctx.fillStyle=cg; ctx.fillRect(0,0,W,110);
  for(let row=0;row<3;row++) for(let col=0;col<17;col++) {
    const hx=col*29+(row%2)*14+7, hy=row*34+15, hr=8+(col%3);
    ctx.fillStyle=`hsl(${(col*43+row*61)%360},16%,${11+row*3}%)`;
    ctx.beginPath(); ctx.arc(hx,hy,hr,0,Math.PI*2); ctx.fill();
  }
  const fl=ctx.createRadialGradient(W/2,350,40,W/2,350,280);
  fl.addColorStop(0,'rgba(180,100,30,0.16)'); fl.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=fl; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(0,0,0,0.84)'; bbRR(ctx,60,6,W-120,34,8); ctx.fill();
  ctx.strokeStyle='#7a4010'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#d07828'; ctx.font='bold 13px Cinzel,serif'; ctx.textAlign='center';
  ctx.fillText('💪  ARM WRESTLING CHAMPIONSHIP', W/2, 27); ctx.textAlign='left';
}

function awDrawTable(ctx) { /* merged into awDrawBodiesAndTable */ }

function awDrawBodiesAndTable(ctx, pd) {
  const oColor = awOpponent ? awOpponent.color : '#888';
  const TY = 355; // table top y
  const LX = 94, RX = W-94; // body center x positions

  // ── PLAYER BODY (left) ──
  // Shirt / torso silhouette
  ctx.fillStyle='#1c1c40';
  ctx.beginPath();
  ctx.moveTo(LX-44,TY); ctx.lineTo(LX-48,TY-95);
  ctx.quadraticCurveTo(LX-50,TY-118,LX-24,TY-138);
  ctx.lineTo(LX+24,TY-138); ctx.quadraticCurveTo(LX+50,TY-118,LX+48,TY-95);
  ctx.lineTo(LX+44,TY); ctx.closePath(); ctx.fill();
  // Shirt sheen
  ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.beginPath();
  ctx.moveTo(LX-12,TY-100); ctx.lineTo(LX-8,TY-136); ctx.lineTo(LX+4,TY-136); ctx.lineTo(LX,TY-100); ctx.closePath(); ctx.fill();
  // Collar v
  ctx.fillStyle='#141430'; ctx.beginPath();
  ctx.moveTo(LX-12,TY-136); ctx.lineTo(LX,TY-122); ctx.lineTo(LX+12,TY-136); ctx.closePath(); ctx.fill();
  // Shoulders (bare skin where shirt cuts off)
  ctx.fillStyle=pd.skin; bbRR(ctx,LX-54,TY-130,22,36,9); ctx.fill();
  bbRR(ctx,LX+32,TY-130,22,36,9); ctx.fill();
  // Neck
  ctx.fillStyle=pd.skinD; bbRR(ctx,LX-9,TY-156,18,22,5); ctx.fill();
  ctx.fillStyle=pd.skin; bbRR(ctx,LX-7,TY-154,14,18,4); ctx.fill();
  // Head
  ctx.fillStyle=pd.skin; ctx.beginPath(); ctx.ellipse(LX,TY-185,27,31,0,0,Math.PI*2); ctx.fill();
  // Hair
  ctx.fillStyle=pd.hair; ctx.beginPath(); ctx.ellipse(LX,TY-194,27,18,0,Math.PI,0); ctx.fill();
  if(pd.gender==='female') {
    ctx.beginPath(); ctx.arc(LX-19,TY-204,10,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(LX+19,TY-204,10,0,Math.PI*2); ctx.fill();
  }
  // Eyes (focused)
  ctx.fillStyle='#2c1810';
  ctx.beginPath(); ctx.ellipse(LX-8,TY-184,3,3.5,0.08,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(LX+8,TY-184,3,3.5,-0.08,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(LX-7,TY-185,1.2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(LX+9,TY-185,1.2,0,Math.PI*2); ctx.fill();
  // Clenched jaw
  ctx.strokeStyle=pd.skinD; ctx.lineWidth=1.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(LX-6,TY-170); ctx.lineTo(LX+6,TY-170); ctx.stroke();
  // Cosmetic: headband
  const hbcol = pd.cosmetics.includes('headband_gold')?'#ffd700':pd.cosmetics.includes('headband_red')?'#e53935':pd.cosmetics.includes('headband_blue')?'#1e88e5':null;
  if(hbcol) { ctx.fillStyle=hbcol; bbRR(ctx,LX-27,TY-204,54,6,3); ctx.fill(); }
  // Cosmetic: crown
  if(pd.cosmetics.includes('crown')) {
    ctx.fillStyle='#ffd700';
    [[LX-12,TY-212],[LX-9,TY-220],[LX-4,TY-216],[LX,TY-224],[LX+4,TY-216],[LX+9,TY-220],[LX+12,TY-212]].forEach(([x,y],i,a)=>{i?ctx.lineTo(x,y):ctx.beginPath(),ctx.moveTo(x,y);}); ctx.closePath(); ctx.fill();
  }
  // Cosmetic: gold chain
  if(pd.cosmetics.includes('gold_chain')||pd.cosmetics.includes('legend_chain')) {
    const cc=pd.cosmetics.includes('legend_chain')?'#c0c0ff':'#ffd700';
    ctx.strokeStyle=cc; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(LX,TY-148,13,0.2,Math.PI-0.2); ctx.stroke();
    ctx.fillStyle=cc; ctx.beginPath(); ctx.arc(LX,TY-135,3,0,Math.PI*2); ctx.fill();
  }
  // Label
  ctx.fillStyle='#9e7cff'; ctx.font='bold 10px Inter,sans-serif'; ctx.textAlign='center';
  ctx.fillText('YOU', LX, TY-228);

  // ── OPPONENT BODY (right) ──
  ctx.fillStyle='#0e0808';
  ctx.beginPath();
  ctx.moveTo(RX-44,TY); ctx.lineTo(RX-48,TY-95);
  ctx.quadraticCurveTo(RX-50,TY-118,RX-24,TY-138);
  ctx.lineTo(RX+24,TY-138); ctx.quadraticCurveTo(RX+50,TY-118,RX+48,TY-95);
  ctx.lineTo(RX+44,TY); ctx.closePath(); ctx.fill();
  ctx.fillStyle=oColor+'1a'; ctx.beginPath();
  ctx.moveTo(RX-44,TY); ctx.lineTo(RX-48,TY-95);
  ctx.quadraticCurveTo(RX-50,TY-118,RX-24,TY-138);
  ctx.lineTo(RX+24,TY-138); ctx.quadraticCurveTo(RX+50,TY-118,RX+48,TY-95);
  ctx.lineTo(RX+44,TY); ctx.closePath(); ctx.fill();
  // Shoulders (darker skin tone for contrast)
  ctx.fillStyle='#c08060'; bbRR(ctx,RX-54,TY-130,22,36,9); ctx.fill();
  bbRR(ctx,RX+32,TY-130,22,36,9); ctx.fill();
  ctx.fillStyle='#a06840'; bbRR(ctx,RX-9,TY-156,18,22,5); ctx.fill();
  ctx.beginPath(); ctx.ellipse(RX,TY-185,27,31,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2a1a0a'; ctx.beginPath(); ctx.ellipse(RX,TY-194,27,18,0,Math.PI,0); ctx.fill();
  // Opponent icon on chest
  ctx.fillStyle=oColor; ctx.font='bold 18px sans-serif'; ctx.textAlign='center';
  ctx.fillText(awOpponent?awOpponent.icon:'?', RX, TY-104);
  // Eyes (glaring)
  ctx.fillStyle='#2c1810';
  ctx.beginPath(); ctx.ellipse(RX-8,TY-184,3.5,3,-0.18,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(RX+8,TY-184,3.5,3,0.18,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(RX-7,TY-185,1.2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(RX+9,TY-185,1.2,0,Math.PI*2); ctx.fill();
  // Scowl
  ctx.strokeStyle='#7a5030'; ctx.lineWidth=1.8; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(RX-7,TY-170); ctx.quadraticCurveTo(RX,TY-175,RX+7,TY-170); ctx.stroke();
  ctx.strokeStyle='#2c1810'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(RX-12,TY-196); ctx.lineTo(RX-6,TY-191); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(RX+12,TY-196); ctx.lineTo(RX+6,TY-191); ctx.stroke();
  // Opponent label
  ctx.fillStyle=oColor; ctx.font='bold 10px Inter,sans-serif';
  ctx.fillText(awOpponent?awOpponent.name:'OPP', RX, TY-228);
  if(awOpponent) { ctx.fillStyle=oColor+'99'; ctx.font='8px Inter,sans-serif'; ctx.fillText(awOpponent.title, RX, TY-218); }
  ctx.textAlign='left';

  // ── TABLE ──
  ctx.fillStyle='rgba(0,0,0,0.45)'; bbRR(ctx,10,TY+6,W-20,50,8); ctx.fill(); // shadow
  const tg=ctx.createLinearGradient(0,TY,0,TY+48);
  tg.addColorStop(0,'#7a4c28'); tg.addColorStop(0.25,'#5a3418'); tg.addColorStop(1,'#3a1e08');
  ctx.fillStyle=tg; bbRR(ctx,12,TY,W-24,48,7); ctx.fill();
  ctx.fillStyle='rgba(255,200,120,0.07)'; bbRR(ctx,12,TY,W-24,8,4); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1;
  [10,20,32,42].forEach(dy=>{ctx.beginPath();ctx.moveTo(20,TY+dy);ctx.lineTo(W-20,TY+dy);ctx.stroke();});
  // Elbow pads
  const pg=ctx.createLinearGradient(0,TY+2,0,TY+38); pg.addColorStop(0,'#2a1a08'); pg.addColorStop(1,'#1a0e04');
  ctx.fillStyle=pg; bbRR(ctx,24,TY+5,102,34,9); ctx.fill();
  ctx.strokeStyle='rgba(255,140,40,0.08)'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle=pg; bbRR(ctx,W-126,TY+5,102,34,9); ctx.fill(); ctx.stroke();
  [12,24].forEach(dy=>{ ctx.strokeStyle='rgba(255,180,60,0.06)'; ctx.beginPath(); ctx.moveTo(28,TY+dy); ctx.lineTo(122,TY+dy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W-122,TY+dy); ctx.lineTo(W-28,TY+dy); ctx.stroke(); });
  // Legs
  ctx.fillStyle='#2a1408'; bbRR(ctx,34,TY+48,18,H-TY-48,4); ctx.fill(); bbRR(ctx,W-52,TY+48,18,H-TY-48,4); ctx.fill();
}

function awDrawArms(ctx, pd) {
  const oColor = awOpponent ? awOpponent.color : '#888';
  const TY = 355;
  // Elbows fixed on table
  const LEX=105, REX=W-105, EY=TY+24;

  // Pendulum: grip moves along arc above table center
  const angle=(awPosition/10)*(Math.PI*0.38);
  const GL=132; // arm length
  const GX=W/2+Math.sin(angle)*65;
  const GY=TY-Math.cos(Math.abs(angle*0.9))*GL;

  // ── OPPONENT FOREARM (behind) ──
  awTaperedArm(ctx,REX,EY,GX,GY,42,32,oColor+'bb');
  // Opponent upper arm (elbow→shoulder)
  awTaperedArm(ctx,REX,EY,W-94,TY-132,40,52,'#c08060');

  // ── PLAYER FOREARM ──
  awTaperedArm(ctx,LEX,EY,GX,GY,44,34,pd.skin);
  // Player upper arm
  awTaperedArm(ctx,LEX,EY,94,TY-132,42,54,pd.skin);
  // Skin shading stripe on forearm
  const dx0=GX-LEX,dy0=GY-EY,ln0=Math.sqrt(dx0*dx0+dy0*dy0),nx0=-dy0/ln0,ny0=dx0/ln0;
  ctx.beginPath();
  ctx.moveTo(LEX+nx0*10,EY+ny0*10);
  ctx.bezierCurveTo((LEX+GX)/2+nx0*10,(EY+GY)/2+ny0*10,(LEX+GX)/2+nx0*6,(EY+GY)/2+ny0*6,GX+nx0*6,GY+ny0*6);
  ctx.strokeStyle=pd.skinD+'55'; ctx.lineWidth=5; ctx.lineCap='round'; ctx.stroke();

  // ── COSMETIC WRISTBAND on player arm ──
  const wbColor = pd.cosmetics.includes('headband_gold')?'#ffd700':
                  pd.cosmetics.includes('headband_red')?'#e53935':
                  pd.cosmetics.includes('headband_blue')?'#1e88e5':
                  (pd.cosmetics.includes('gold_chain')||pd.cosmetics.includes('legend_chain'))?'#ffd700':null;
  if(wbColor) {
    const t=0.15;
    const wx=GX+(LEX-GX)*t, wy=GY+(EY-GY)*t;
    const dxw=LEX-GX,dyw=EY-GY,lnw=Math.sqrt(dxw*dxw+dyw*dyw),nxw=-dyw/lnw,nyw=dxw/lnw;
    ctx.fillStyle=wbColor;
    [0,6].forEach(off=>{
      ctx.beginPath();
      ctx.moveTo(wx+nxw*22+dxw/lnw*off,wy+nyw*22+dyw/lnw*off);
      ctx.lineTo(wx+nxw*22+dxw/lnw*(off+4),wy+nyw*22+dyw/lnw*(off+4));
      ctx.lineTo(wx-nxw*22+dxw/lnw*(off+4),wy-nyw*22+dyw/lnw*(off+4));
      ctx.lineTo(wx-nxw*22+dxw/lnw*off,wy-nyw*22+dyw/lnw*off);
      ctx.closePath(); ctx.fill();
    });
  }
  if(pd.cosmetics.includes('lifting_belt')) {
    const t2=0.22;
    const wx2=GX+(LEX-GX)*t2, wy2=GY+(EY-GY)*t2;
    const dx2=LEX-GX,dy2=EY-GY,ln2=Math.sqrt(dx2*dx2+dy2*dy2),nx2=-dy2/ln2,ny2=dx2/ln2;
    ctx.fillStyle='#8B6914'; ctx.globalAlpha=0.8;
    for(let i=0;i<3;i++){
      const off=i*5;
      ctx.beginPath();
      ctx.moveTo(wx2+nx2*24+dx2/ln2*off,wy2+ny2*24+dy2/ln2*off);
      ctx.lineTo(wx2+nx2*24+dx2/ln2*(off+3.5),wy2+ny2*24+dy2/ln2*(off+3.5));
      ctx.lineTo(wx2-nx2*24+dx2/ln2*(off+3.5),wy2-ny2*24+dy2/ln2*(off+3.5));
      ctx.lineTo(wx2-nx2*24+dx2/ln2*off,wy2-ny2*24+dy2/ln2*off);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  // ── CLASPED HANDS at grip ──
  ctx.fillStyle='rgba(0,0,0,0.32)'; ctx.beginPath(); ctx.ellipse(GX+4,GY+8,32,18,angle*0.25,0,Math.PI*2); ctx.fill(); // shadow
  // Opponent hand
  ctx.fillStyle=oColor+'cc'; ctx.beginPath(); ctx.ellipse(GX+5,GY,28,22,angle*0.25,0,Math.PI*2); ctx.fill();
  // Player hand
  const hg=ctx.createRadialGradient(GX-5,GY-8,4,GX-5,GY-8,30);
  hg.addColorStop(0,pd.skin); hg.addColorStop(1,pd.skinD);
  ctx.fillStyle=hg; ctx.beginPath(); ctx.ellipse(GX-4,GY,30,24,angle*0.25,0,Math.PI*2); ctx.fill();
  // Knuckles
  const koff=Math.sin(angle)*5;
  ctx.fillStyle=pd.skin;
  [-12,-4,4,12].forEach(kx=>{ ctx.beginPath(); ctx.arc(GX+kx+koff,GY-12,5,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle='rgba(255,255,255,0.09)';
  [-12,-4,4,12].forEach(kx=>{ ctx.beginPath(); ctx.arc(GX+kx+koff,GY-15,3,0,Math.PI); ctx.fill(); });

  // Round timer arc
  if(awState==='playing') {
    const prog=awRoundTimer/AW_ROUND_DURATION;
    const tc=prog>0.6?'#4caf50':prog>0.3?'#ffaa00':'#f44336';
    ctx.beginPath(); ctx.arc(GX,GY,46,-Math.PI/2,-Math.PI/2+prog*Math.PI*2);
    ctx.strokeStyle=tc+'cc'; ctx.lineWidth=5; ctx.stroke();
    ctx.beginPath(); ctx.arc(GX,GY,46,-Math.PI/2,-Math.PI/2+prog*Math.PI*2);
    ctx.strokeStyle=tc+'44'; ctx.lineWidth=10; ctx.stroke();
  }

  // Tension sparks at high values
  if(Math.abs(awPosition)>=7) {
    const sc=awPosition>0?'#9e7cff':(awOpponent?awOpponent.color:'#f44336');
    ctx.strokeStyle=sc; ctx.lineWidth=1.5;
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2; const r1=48+Math.random()*6, r2=r1+10+Math.random()*14;
      ctx.beginPath(); ctx.moveTo(GX+Math.cos(a)*r1,GY+Math.sin(a)*r1*0.65);
      ctx.lineTo(GX+Math.cos(a)*r2,GY+Math.sin(a)*r2*0.65); ctx.stroke();
    }
  }
}

function awDrawKeyPrompt(ctx) {
  if (awState !== 'playing') return;
  const ki = AW_KEYS[awCurrentKey];
  const prog = awRoundTimer / AW_ROUND_DURATION;
  const tc = prog > 0.6 ? '#4caf50' : prog > 0.3 ? '#ffaa00' : '#f44336';
  const qy = 430;
  ctx.fillStyle='rgba(0,0,0,0.9)'; bbRR(ctx,W/2-110,qy,220,64,14); ctx.fill();
  ctx.strokeStyle=ki.color; ctx.lineWidth=2.5; ctx.stroke();
  ctx.fillStyle=ki.color; ctx.font='bold 42px Inter,sans-serif'; ctx.textAlign='center';
  ctx.fillText(ki.arrow, W/2, qy+44);
  ctx.fillStyle='#bbb'; ctx.font='bold 9px Inter,sans-serif'; ctx.fillText('MASH IT!', W/2, qy+58);
  const bw=180, bx=W/2-bw/2;
  ctx.fillStyle='#222'; bbRR(ctx,bx,qy+64,bw,5,2); ctx.fill();
  ctx.fillStyle=tc; bbRR(ctx,bx,qy+64,bw*prog,5,2); ctx.fill();
  ctx.textAlign='left';
}

function awDrawCounts(ctx) {
  if (awState !== 'playing' && awState !== 'roundResult') return;
  const opp = awState==='roundResult' ? awOpponentCount : Math.min(Math.floor(awOpponentTick), awOpponentCount);
  const oColor = awOpponent ? awOpponent.color : '#888';
  const showFinal = awState==='roundResult';
  const pWon = showFinal && awPlayerCount > awOpponentCount;
  const oWon = showFinal && awOpponentCount > awPlayerCount;
  const qy = 430;

  // Player count left
  ctx.fillStyle = showFinal?(pWon?'#4caf50':'#f44336'):'#9e7cff';
  ctx.font='bold 46px Cinzel,serif'; ctx.textAlign='left';
  ctx.fillText(awPlayerCount, 28, qy-10);
  ctx.fillStyle='#555'; ctx.font='9px Inter,sans-serif'; ctx.fillText('YOU', 28, qy+4);

  // Opponent count right
  ctx.fillStyle = showFinal?(oWon?'#4caf50':'#f44336'):oColor;
  ctx.font='bold 46px Cinzel,serif'; ctx.textAlign='right';
  ctx.fillText(opp, W-28, qy-10);
  ctx.fillStyle='#555'; ctx.font='9px Inter,sans-serif'; ctx.fillText(awOpponent?awOpponent.name:'OPP', W-28, qy+4);

  if(showFinal) {
    const msg=pWon?'ROUND WON! +1':oWon?'ROUND LOST! -1':'TIE';
    ctx.fillStyle=pWon?'#4caf50':oWon?'#f44336':'#aaa';
    ctx.font='bold 13px Cinzel,serif'; ctx.textAlign='center'; ctx.fillText(msg, W/2, qy+4);
  }
  ctx.textAlign='left';
}

function awDrawPositionMeter(ctx) {
  const bw=260, bh=16, bx=W/2-bw/2, by=508;
  ctx.fillStyle='#100a04'; bbRR(ctx,bx-2,by-2,bw+4,bh+4,5); ctx.fill();
  ctx.fillStyle='#1e3478'; bbRR(ctx,bx,by,bw/2,bh,4); ctx.fill();
  ctx.fillStyle=awOpponent?awOpponent.color+'cc':'#8B0000'; bbRR(ctx,bx+bw/2,by,bw/2,bh,4); ctx.fill();
  const kx=bx+bw/2+(awPosition/10)*(bw/2-10);
  ctx.fillStyle='#f0f0f0'; ctx.beginPath(); ctx.arc(kx,by+bh/2,10,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#444'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#9e7cff'; ctx.font='bold 8px Inter,sans-serif'; ctx.textAlign='left'; ctx.fillText('YOU',bx+5,by+12);
  ctx.fillStyle=awOpponent?awOpponent.color:'#cc4444'; ctx.textAlign='right';
  ctx.fillText(awOpponent?awOpponent.name:'OPP',bx+bw-5,by+12); ctx.textAlign='left';
  // Round counter
  ctx.fillStyle='#444'; ctx.font='8px Inter,sans-serif'; ctx.textAlign='center';
  ctx.fillText(`${Math.max(0,awPosition+10)} / 20 rounds`, W/2, by-4); ctx.textAlign='left';
}

function awDrawControls(ctx) {
  const bw=58, bh=52, gap=7;
  const totalW=4*bw+3*gap, startX=(W-totalW)/2, by=H-bh-8;
  const dirs=['left','up','down','right'];
  awBtnRects=dirs.map((dir,i)=>({dir,x:startX+i*(bw+gap),y:by,w:bw,h:bh}));
  awBtnRects.forEach(b=>{
    const ki=AW_KEYS[b.dir], active=b.dir===awCurrentKey;
    // Outer glow for active
    if(active) { ctx.fillStyle=ki.color+'22'; bbRR(ctx,b.x-4,b.y-4,b.w+8,b.h+8,14); ctx.fill(); }
    ctx.fillStyle=active?ki.color+'44':'#100a04'; bbRR(ctx,b.x,b.y,b.w,b.h,11); ctx.fill();
    ctx.strokeStyle=active?ki.color:'#3a1a08'; ctx.lineWidth=active?2.5:1.5; ctx.stroke();
    ctx.fillStyle=active?ki.color:'#5a3018';
    ctx.font=`bold ${active?32:26}px Inter,sans-serif`; ctx.textAlign='center';
    ctx.fillText(ki.arrow,b.x+b.w/2,b.y+b.h/2+12);
  });
  ctx.textAlign='left';
}

function awDrawHUD(ctx) {
  ctx.fillStyle='#9e7cff'; ctx.font='bold 10px Inter,sans-serif'; ctx.textAlign='left';
  ctx.fillText(`Wins: ${awStats.wins}`, 14, 120);
  ctx.fillStyle='#555'; ctx.font='9px Inter,sans-serif'; ctx.fillText(`Streak: ${awStats.streak}`, 14, 132);
  if(awOpponent&&awState==='playing'){
    ctx.fillStyle=awOpponent.color; ctx.font='bold 10px Inter,sans-serif'; ctx.textAlign='right';
    ctx.fillText(`Target: ${awOpponentCount} presses`, W-14, 120);
    ctx.fillStyle='#555'; ctx.font='9px Inter,sans-serif'; ctx.fillText('this round', W-14, 132);
  }
  ctx.textAlign='left';
  if(awFlashTimer>0){
    const a=0.38*(awFlashTimer/0.35);
    ctx.fillStyle=awFlashColor==='green'?`rgba(76,175,80,${a})`:`rgba(244,67,54,${a})`;
    ctx.fillRect(0,0,W,H);
  }
}

function awDrawPreMatch(ctx) {
  const pd = awGetPlayerData();
  awDrawBackground(ctx);
  awDrawBodiesAndTable(ctx, pd);
  awDrawArms(ctx, pd);
  awDrawPositionMeter(ctx);
  awDrawHUD(ctx);
  const done = awStats.lastDate === todayStr();
  ctx.fillStyle = 'rgba(0,0,0,0.86)'; bbRR(ctx, W/2-155, H/2-115, 310, done ? 120 : 158, 14); ctx.fill();
  ctx.strokeStyle = '#8a5018'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c87030'; ctx.font = 'bold 17px Cinzel,serif'; ctx.fillText('ARM WRESTLING CHAMPIONSHIP', W/2, H/2-76);
  ctx.fillStyle = '#bbb'; ctx.font = '11px Inter,sans-serif';
  ctx.fillText('Mash the key more times than your opponent!', W/2, H/2-50);
  ctx.fillText('Key changes every 3 seconds.', W/2, H/2-32);
  ctx.fillText('10 round wins = victory. 10 losses = defeat.', W/2, H/2-14);
  if (done) {
    const won = awStats.lastResult === 'win';
    ctx.fillStyle = won ? '#4caf50' : '#f44336'; ctx.font = 'bold 13px Inter,sans-serif';
    ctx.fillText(won ? '🏆 Won today! Come back tomorrow.' : '✗ Lost today. Come back tomorrow.', W/2, H/2+8);
  } else {
    ctx.fillStyle = '#8a5018'; bbRR(ctx, W/2-80, H/2+20, 160, 44, 10); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px Inter,sans-serif'; ctx.fillText('CHALLENGE!', W/2, H/2+48);
  }
  ctx.textAlign = 'left';
}

function awDrawCountdown(ctx) {
  const pd = awGetPlayerData();
  awDrawBackground(ctx); awDrawBodiesAndTable(ctx, pd); awDrawArms(ctx, pd); awDrawPositionMeter(ctx); awDrawHUD(ctx);
  const n = Math.ceil(awCountdownTimer);
  ctx.fillStyle = 'rgba(0,0,0,0.72)'; bbRR(ctx, W/2-60, H/2-65, 120, 106, 20); ctx.fill();
  ctx.fillStyle = '#c87030'; ctx.font = 'bold 72px Cinzel,serif'; ctx.textAlign = 'center';
  ctx.fillText(n, W/2, H/2+26); ctx.textAlign = 'left';
}

function awDrawPlaying(ctx) {
  const pd = awGetPlayerData();
  awDrawBackground(ctx); awDrawBodiesAndTable(ctx, pd); awDrawArms(ctx, pd);
  awDrawCounts(ctx); awDrawKeyPrompt(ctx); awDrawPositionMeter(ctx); awDrawControls(ctx); awDrawHUD(ctx);
}

function awDrawRoundResultState(ctx) {
  const pd = awGetPlayerData();
  awDrawBackground(ctx); awDrawBodiesAndTable(ctx, pd); awDrawArms(ctx, pd);
  awDrawCounts(ctx); awDrawPositionMeter(ctx); awDrawHUD(ctx);
}

function awDrawFinalResult(ctx, won) {
  const pd = awGetPlayerData();
  awDrawBackground(ctx); awDrawBodiesAndTable(ctx, pd); awDrawArms(ctx, pd); awDrawPositionMeter(ctx); awDrawHUD(ctx);
  ctx.fillStyle = 'rgba(0,0,0,0.86)'; bbRR(ctx, W/2-150, H/2-80, 300, 140, 14); ctx.fill();
  ctx.strokeStyle = won ? '#4caf50' : '#f44336'; ctx.lineWidth = 2; ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = won ? '#4caf50' : '#f44336'; ctx.font = 'bold 28px Cinzel,serif';
  ctx.fillText(won ? '💪 VICTORIOUS!' : '😤 DEFEATED!', W/2, H/2-34);
  ctx.fillStyle = '#ccc'; ctx.font = '13px Inter,sans-serif';
  ctx.fillText(won ? 'The table shakes with triumph!' : 'Better grip tomorrow.', W/2, H/2-8);
  ctx.fillStyle = '#888'; ctx.font = '10px Inter,sans-serif'; ctx.fillText('Tap to continue', W/2, H/2+52);
  ctx.textAlign = 'left';
}

// ─── AW Game Logic ───

function awHandleInput(dir) {
  if (awState !== 'playing') return;
  if (dir !== awCurrentKey) return; // wrong key — no penalty, just ignore
  awPlayerCount++;
  awFlashTimer = 0.08; awFlashColor = 'green';
}

function awEndRound() {
  awRoundResult = awPlayerCount > awOpponentCount ? 'win' : awPlayerCount < awOpponentCount ? 'lose' : 'tie';
  awFlashTimer = 0.35;
  awFlashColor = awRoundResult === 'win' ? 'green' : awRoundResult === 'lose' ? 'red' : null;
  if (awRoundResult === 'win') awPosition++;
  else if (awRoundResult === 'lose') awPosition--;
  awState = 'roundResult';
  awRoundResultTimer = 1.1;

  if (awPosition >= 10) {
    awState = 'win';
    awStats.wins++; awStats.total++;
    const yd = new Date(); yd.setDate(yd.getDate()-1);
    const ydStr = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
    awStats.streak = (awStats.lastDate === ydStr && awStats.lastResult === 'win') ? (awStats.streak||0)+1 : 1;
    awStats.lastDate = todayStr(); awStats.lastResult = 'win'; awSaveStats();
    try { if (typeof MQ !== 'undefined' && MQ.addGold) MQ.addGold(15); } catch(e) {}
  } else if (awPosition <= -10) {
    awState = 'lose';
    awStats.total++; awStats.streak = 0;
    awStats.lastDate = todayStr(); awStats.lastResult = 'lose'; awSaveStats();
  }
}

function awUpdate(dt) {
  if (awFlashTimer > 0) awFlashTimer -= dt;

  if (awState === 'countdown') {
    awCountdownTimer -= dt;
    if (awCountdownTimer <= 0) { awState = 'playing'; awPosition = 0; awRoundIndex = 0; awNewRound(); }
    return;
  }

  if (awState === 'roundResult') {
    awRoundResultTimer -= dt;
    if (awRoundResultTimer <= 0 && awState === 'roundResult') { awState = 'playing'; awNewRound(); }
    return;
  }

  if (awState !== 'playing') return;

  // Tick opponent progress visually
  awOpponentTick += (awOpponentCount / AW_ROUND_DURATION) * dt;

  awRoundTimer -= dt;
  if (awRoundTimer <= 0) awEndRound();
}

function awRender() {
  if (!awCtx) return;
  awCtx.clearRect(0, 0, W, H);
  if (awState === 'idle') awDrawPreMatch(awCtx);
  else if (awState === 'countdown') awDrawCountdown(awCtx);
  else if (awState === 'playing') awDrawPlaying(awCtx);
  else if (awState === 'roundResult') awDrawRoundResultState(awCtx);
  else if (awState === 'win' || awState === 'lose') awDrawFinalResult(awCtx, awState === 'win');
}

function awGameLoop(ts) {
  if (!awAnimFrame) return;
  const dt = Math.min((ts - awLastTime) / 1000, 0.05);
  awLastTime = ts;
  awUpdate(dt);
  awRender();
  awAnimFrame = requestAnimationFrame(awGameLoop);
}

function awHandleCanvasClick(e) {
  const rect = awCanvas.getBoundingClientRect();
  const scaleX = W / rect.width, scaleY = H / rect.height;
  const cx = (e.clientX - rect.left) * scaleX, cy = (e.clientY - rect.top) * scaleY;
  if (awState === 'idle') {
    if (awStats.lastDate === todayStr()) return;
    if (cx >= W/2-80 && cx <= W/2+80 && cy >= H/2+20 && cy <= H/2+64) {
      awState = 'countdown'; awCountdownTimer = 3; awPosition = 0;
    }
    return;
  }
  if (awState === 'win' || awState === 'lose') { awState = 'idle'; return; }
  if (awState !== 'playing') return;
  for (const b of awBtnRects) {
    if (cx >= b.x && cx <= b.x+b.w && cy >= b.y && cy <= b.y+b.h) { awHandleInput(b.dir); return; }
  }
}

function awHandleKey(e) {
  if (awState !== 'playing') return;
  const map = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', w:'up', s:'down', a:'left', d:'right' };
  if (map[e.key]) { awHandleInput(map[e.key]); e.preventDefault(); }
}

function startArmWrestling() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  if (sumoAnimFrame) { cancelAnimationFrame(sumoAnimFrame); sumoAnimFrame = null; }
  if (awAnimFrame) { cancelAnimationFrame(awAnimFrame); awAnimFrame = null; }
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  document.removeEventListener('keydown', sumoHandleKey);
  document.removeEventListener('keydown', awHandleKey);
  const container = document.getElementById('fight-container');
  if (!container) return;
  awOpponent = awGetDailyOpponent();
  awState = 'idle'; awPosition = 0; awRoundIndex = 0; awPlayerCount = 0; awBtnRects = []; awFlashTimer = 0;
  container.innerHTML = `
    <div class="comp-back-row"><button class="comp-back-btn" onclick="PunchOut.backToSelector()">← Back</button></div>
    <canvas id="aw-canvas" width="${W}" height="${H}" style="width:100%;max-width:${W}px;display:block;margin:0 auto;border-radius:12px;background:#100a04;touch-action:none;"></canvas>`;
  awCanvas = document.getElementById('aw-canvas');
  awCtx = awCanvas.getContext('2d');
  awCanvas.addEventListener('click', awHandleCanvasClick);
  awCanvas.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; awHandleCanvasClick({ clientX: t.clientX, clientY: t.clientY }); }, { passive: false });
  document.addEventListener('keydown', awHandleKey);
  awLastTime = performance.now();
  awAnimFrame = requestAnimationFrame(awGameLoop);
}

// ─── COMPETITION SELECTOR ───

function renderSelector() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  if (sumoAnimFrame) cancelAnimationFrame(sumoAnimFrame);
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  document.removeEventListener('keydown', sumoHandleKey);
  const container = document.getElementById('fight-container');
  if (!container) return;
  const todayWon = fightStats.lastFightDate === todayStr() && fightStats.lastResult === 'win';
  const bbDone = bbStats.lastDate === todayStr();
  const bbWon = bbDone && bbStats.lastResult === 'win';

  const sumoDone = sumoStats.lastDate === todayStr();
  const sumoWon  = sumoDone && sumoStats.lastResult === 'win';

  container.innerHTML = `
<style>
  .comp-lobby-wrap { padding: 0; }
  .comp-lobby-svg { width:100%; display:block; border-radius:12px; }
  .comp-lobby-zone { cursor:pointer; transition:filter .18s; }
  .comp-lobby-zone:hover { filter:brightness(1.22) drop-shadow(0 0 10px rgba(255,200,100,.28)); }
  .comp-lobby-cs { cursor:default; }
  .comp-lobby-hint { text-align:center; font-size:11px; color:var(--text-muted); margin:6px 0 2px; letter-spacing:.3px; }
</style>
<div class="comp-lobby-wrap">
<svg viewBox="0 0 526 520" xmlns="http://www.w3.org/2000/svg" class="comp-lobby-svg">

  <!-- ARENA CEILING -->
  <rect x="0" y="0" width="526" height="44" fill="#0e0c18"/>
  <line x1="0" y1="12" x2="526" y2="12" stroke="#1c1a2c" stroke-width="6"/>
  <rect x="44"  y="5" width="16" height="7" rx="2" fill="#2a2840"/>
  <rect x="147" y="5" width="16" height="7" rx="2" fill="#2a2840"/>
  <rect x="250" y="5" width="16" height="7" rx="2" fill="#2a2840"/>
  <rect x="354" y="5" width="16" height="7" rx="2" fill="#2a2840"/>
  <rect x="454" y="5" width="16" height="7" rx="2" fill="#2a2840"/>
  <polygon points="52,8 22,140 82,140"   fill="#fff8c0" opacity=".06"/>
  <polygon points="155,8 125,140 185,140" fill="#fff8c0" opacity=".06"/>
  <polygon points="258,8 228,140 288,140" fill="#fff8c0" opacity=".06"/>
  <polygon points="362,8 332,140 392,140" fill="#fff8c0" opacity=".06"/>
  <polygon points="462,8 432,140 492,140" fill="#fff8c0" opacity=".06"/>

  <!-- CROWD -->
  <rect x="0" y="44" width="526" height="96" fill="#12101e"/>
  <rect x="148" y="50" width="230" height="22" rx="3" fill="#28224a"/>
  <text x="263" y="65" text-anchor="middle" font-size="9" fill="#c8b8ff" font-family="serif" font-weight="700" letter-spacing="2">⚔  COMPETITION LOBBY  ⚔</text>
  <rect x="0" y="76" width="526" height="28" fill="#0e0c1c"/>
  ${[14,30,45,61,76,92,107,123,138,154,170,186,202,218,234,250,266,282,298,314,330,346,362,378,394,410,426,442,458,474,490,506,520].map((x,i)=>`<circle cx="${x}" cy="${76+8+(i%3)*2}" r="${6+(i%2)}" fill="#1${i%2?'8':'a'}1${i%3<2?'6':'8'}${i%2?'28':'30'}"/>`).join('')}
  <rect x="0" y="104" width="526" height="28" fill="#0d0b1a"/>
  ${[8,22,36,50,64,78,92,106,120,134,148,162,176,190,204,218,232,246,260,274,288,302,316,330,344,358,372,386,400,414,428,442,456,470,484,498,512].map((x,i)=>`<circle cx="${x}" cy="${112+(i%2)}" r="5" fill="#1${i%2?'6':'4'}1${i%3===0?'2':'4'}2a"/>`).join('')}

  <!-- ARENA FLOOR -->
  <rect x="0" y="132" width="526" height="388" fill="#1a1624"/>
  <!-- Grid dividers -->
  <line x1="263" y1="132" x2="263" y2="520" stroke="#28243c" stroke-width="1.5"/>
  <line x1="0"   y1="330" x2="526" y2="330" stroke="#28243c" stroke-width="1.5"/>

  <!-- ══════════════════════════════════════
       ZONE 1: BOXING — top-left (0-263, 140-330)
       ══════════════════════════════════════ -->
  <g class="comp-lobby-zone" onclick="PunchOut.startBoxing()">
    <rect x="0" y="140" width="263" height="190" fill="#1e0808"/>
    <rect x="0" y="140" width="263" height="22" fill="#2a0808"/>
    <text x="131" y="155" text-anchor="middle" font-size="10" fill="#ff8080" font-family="sans-serif" font-weight="700" letter-spacing="1.5">🥊  BOXING</text>
    <!-- Ring surface -->
    <rect x="22" y="164" width="220" height="100" rx="2" fill="#c8b89a"/>
    <rect x="22" y="164" width="220" height="100" rx="2" fill="none" stroke="#8a6840" stroke-width="2"/>
    <line x1="22" y1="214" x2="242" y2="214" stroke="#b0a080" stroke-width=".8"/>
    <line x1="132" y1="164" x2="132" y2="264" stroke="#b0a080" stroke-width=".8"/>
    <!-- Corner posts -->
    <rect x="20"  y="162" width="5" height="104" rx="1" fill="#cc2020"/>
    <rect x="238" y="162" width="5" height="104" rx="1" fill="#4040cc"/>
    <!-- Ropes red -->
    <line x1="25" y1="175" x2="238" y2="175" stroke="#cc2020" stroke-width="2.5"/>
    <line x1="25" y1="189" x2="238" y2="189" stroke="#cc2020" stroke-width="2.5"/>
    <line x1="25" y1="203" x2="238" y2="203" stroke="#cc2020" stroke-width="2.5"/>
    <!-- Ropes blue -->
    <line x1="25" y1="224" x2="238" y2="224" stroke="#4040cc" stroke-width="2.5"/>
    <line x1="25" y1="238" x2="238" y2="238" stroke="#4040cc" stroke-width="2.5"/>
    <line x1="25" y1="252" x2="238" y2="252" stroke="#4040cc" stroke-width="2.5"/>
    <!-- Fighter 1 red -->
    <circle cx="72"  cy="212" r="9" fill="#f0b878"/>
    <rect x="64"  y="220" width="16" height="22" rx="4" fill="#cc2020"/>
    <rect x="57"  y="222" width="9" height="14" rx="3" fill="#dd1010"/>
    <rect x="79"  y="222" width="9" height="14" rx="3" fill="#dd1010"/>
    <rect x="65"  y="241" width="6" height="14" rx="2" fill="#222"/>
    <rect x="73"  y="241" width="6" height="14" rx="2" fill="#222"/>
    <!-- Fighter 2 blue -->
    <circle cx="192" cy="212" r="9" fill="#f0c890"/>
    <rect x="184" y="220" width="16" height="22" rx="4" fill="#2020cc"/>
    <rect x="177" y="222" width="9" height="14" rx="3" fill="#1010dd"/>
    <rect x="199" y="222" width="9" height="14" rx="3" fill="#1010dd"/>
    <rect x="185" y="241" width="6" height="14" rx="2" fill="#222"/>
    <rect x="193" y="241" width="6" height="14" rx="2" fill="#222"/>
    <text x="132" y="218" text-anchor="middle" font-size="10" fill="#8a7850" font-weight="700">VS</text>
    <!-- Steps -->
    <rect x="122" y="264" width="22" height="5" rx="1" fill="#8a6840"/>
    <rect x="118" y="269" width="30" height="5" rx="1" fill="#7a5830"/>
    <!-- Stats -->
    <text x="132" y="290" text-anchor="middle" font-size="10" fill="#cc6666" font-weight="600">Streak: ${fightStats.streak}  ·  KOs: ${fightStats.totalKOs}</text>
    ${todayWon
      ? `<rect x="0" y="140" width="263" height="190" fill="#00aa44" opacity=".15"/>
         <rect x="22" y="305" width="220" height="20" rx="5" fill="#00aa44"/>
         <text x="132" y="319" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">✓ Done Today</text>`
      : `<text x="132" y="310" text-anchor="middle" font-size="10" fill="#aa5555">Tap to enter</text>`}
  </g>

  <!-- ══════════════════════════════════════
       ZONE 2: POSE OFF — top-right (263-526, 140-330)
       ══════════════════════════════════════ -->
  <g class="comp-lobby-zone" onclick="PunchOut.startBodybuilding()">
    <rect x="263" y="140" width="263" height="190" fill="#1a1400"/>
    <rect x="263" y="140" width="263" height="22" fill="#221a00"/>
    <text x="394" y="155" text-anchor="middle" font-size="10" fill="#ffd700" font-family="sans-serif" font-weight="700" letter-spacing="1.5">✨  POSE OFF</text>
    <!-- Curtain backdrop -->
    <rect x="275" y="162" width="238" height="80" fill="#2a1a00"/>
    <rect x="275" y="162" width="22" height="80" fill="#1a0e00"/>
    <rect x="491" y="162" width="22" height="80" fill="#1a0e00"/>
    <path d="M275 162 Q283 192 275 222 Q283 248 275 242" stroke="#3a2800" stroke-width="2" fill="none"/>
    <path d="M285 162 Q293 192 285 222 Q293 248 285 242" stroke="#3a2800" stroke-width="1.5" fill="none"/>
    <path d="M513 162 Q505 192 513 222 Q505 245 513 242" stroke="#3a2800" stroke-width="2" fill="none"/>
    <path d="M503 162 Q495 182 503 222 Q495 245 503 242" stroke="#3a2800" stroke-width="1.5" fill="none"/>
    <!-- Spotlights on stage -->
    <polygon points="330,162 295,242 365,242" fill="#ffd700" opacity=".05"/>
    <polygon points="394,162 359,242 429,242" fill="#ffd700" opacity=".05"/>
    <polygon points="458,162 423,242 493,242" fill="#ffd700" opacity=".05"/>
    <!-- Spotlight bulbs -->
    <circle cx="293" cy="164" r="5" fill="#ffe060" opacity=".5"/>
    <circle cx="394" cy="164" r="5" fill="#ffe060" opacity=".5"/>
    <circle cx="495" cy="164" r="5" fill="#ffe060" opacity=".5"/>
    <!-- Stage platform -->
    <rect x="275" y="242" width="238" height="20" rx="3" fill="#4a3810"/>
    <rect x="277" y="243" width="234" height="16" rx="2" fill="#5a4818"/>
    <!-- Hanger hook -->
    <circle cx="394" cy="170" r="3.5" fill="none" stroke="#ffd700" stroke-width="1.5"/>
    <line x1="394" y1="173" x2="394" y2="181" stroke="#ffd700" stroke-width="1.5"/>
    <line x1="354" y1="181" x2="434" y2="181" stroke="#ffd700" stroke-width="2"/>
    <line x1="354" y1="181" x2="368" y2="196" stroke="#ffd700" stroke-width="1.5"/>
    <line x1="434" y1="181" x2="420" y2="196" stroke="#ffd700" stroke-width="1.5"/>
    <!-- Posing suit top -->
    <path d="M362 196 Q378 188 394 196 Q410 188 426 196" stroke="#ff8844" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M362 196 Q371 208 381 204 Q387 208 394 204 Q401 208 407 204 Q417 208 426 196" fill="#ff8844" opacity=".78"/>
    <!-- Posing suit bottom -->
    <path d="M372 220 Q394 211 416 220 Q411 238 394 240 Q377 238 372 220Z" fill="#ff8844" opacity=".78"/>
    <line x1="372" y1="220" x2="367" y2="213" stroke="#ff8844" stroke-width="1.2"/>
    <line x1="416" y1="220" x2="421" y2="213" stroke="#ff8844" stroke-width="1.2"/>
    <!-- Trophy -->
    <path d="M460 230 Q467 221 474 230" fill="#ffd700"/>
    <rect x="460" y="230" width="14" height="8" rx="1" fill="#ffd700"/>
    <rect x="463" y="238" width="8" height="4" rx="1" fill="#e0b800"/>
    <rect x="460" y="242" width="14" height="3" rx="1" fill="#ffd700"/>
    <!-- Stats -->
    <text x="394" y="278" text-anchor="middle" font-size="10" fill="#aa9944" font-weight="600">Wins: ${bbStats.totalWins}  ·  Shows: ${bbStats.totalComps}</text>
    ${bbDone
      ? `<rect x="263" y="140" width="263" height="190" fill="${bbWon?'#aa8800':'#880000'}" opacity=".15"/>
         <rect x="285" y="292" width="220" height="20" rx="5" fill="${bbWon?'#aa8800':'#880000'}"/>
         <text x="394" y="306" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">${bbWon?'🏆 Won Today':'✗ Failed Today'}</text>`
      : `<text x="394" y="295" text-anchor="middle" font-size="10" fill="#887700">Tap to enter</text>`}
  </g>

  <!-- ══════════════════════════════════════
       ZONE 3: SUMO — bottom-left (0-263, 330-520)
       ══════════════════════════════════════ -->
  <g class="comp-lobby-zone" onclick="PunchOut.startSumo()">
    <rect x="0" y="330" width="263" height="190" fill="#1a1208"/>
    <rect x="0" y="330" width="263" height="22" fill="#1a1408"/>
    <text x="131" y="345" text-anchor="middle" font-size="10" fill="#c89040" font-family="sans-serif" font-weight="700" letter-spacing="1.5">🏟  SUMO</text>
    <!-- Dohyo (perspective ellipse ring) -->
    <ellipse cx="131" cy="440" rx="100" ry="40" fill="#c89040"/>
    <ellipse cx="131" cy="440" rx="94"  ry="36" fill="#d4a060"/>
    <ellipse cx="131" cy="440" rx="86"  ry="30" fill="#c49050" stroke="#8a5018" stroke-width="1.5"/>
    <!-- Shikiri lines -->
    <rect x="122" y="432" width="5" height="16" rx="1" fill="#6a3810"/>
    <rect x="136" y="432" width="5" height="16" rx="1" fill="#6a3810"/>
    <!-- Left sumo silhouette -->
    <circle cx="100" cy="428" r="13" fill="#3a2808" opacity=".75"/>
    <ellipse cx="100" cy="448" rx="18" ry="14" fill="#3a2808" opacity=".75"/>
    <ellipse cx="82"  cy="440" rx="8"  ry="5"  fill="#3a2808" opacity=".6"/>
    <!-- Right sumo silhouette -->
    <circle cx="162" cy="428" r="13" fill="#3a2808" opacity=".75"/>
    <ellipse cx="162" cy="448" rx="18" ry="14" fill="#3a2808" opacity=".75"/>
    <ellipse cx="180" cy="440" rx="8"  ry="5"  fill="#3a2808" opacity=".6"/>
    <!-- Salt bags -->
    <rect x="12"  y="466" width="18" height="14" rx="2" fill="#d0ccb8"/>
    <rect x="234" y="464" width="18" height="14" rx="2" fill="#d0ccb8"/>
    <ellipse cx="21"  cy="482" rx="9" ry="3" fill="#e0dcd0" opacity=".5"/>
    <ellipse cx="243" cy="480" rx="9" ry="3" fill="#e0dcd0" opacity=".5"/>
    <!-- Stats -->
    <text x="131" y="492" text-anchor="middle" font-size="10" fill="#998844" font-weight="600">Wins: ${sumoStats.wins}  ·  Streak: ${sumoStats.streak}</text>
    ${sumoDone
      ? `<rect x="0" y="330" width="263" height="190" fill="${sumoWon?'#664400':'#440000'}" opacity=".18"/>
         <rect x="22" y="502" width="220" height="20" rx="5" fill="${sumoWon?'#aa6600':'#880000'}"/>
         <text x="131" y="516" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">${sumoWon?'🏆 Won Today':'✗ Defeated Today'}</text>`
      : `<text x="131" y="508" text-anchor="middle" font-size="10" fill="#aa7722">Tap to enter</text>`}
  </g>

  <!-- ══════════════════════════════════════
       ZONE 4: ARM WRESTLING — bottom-right (263-526, 330-520)
       ══════════════════════════════════════ -->
  <g class="comp-lobby-zone" onclick="PunchOut.startArmWrestling()">
    <rect x="263" y="330" width="263" height="190" fill="#08100e"/>
    <rect x="263" y="330" width="263" height="22" fill="#0c1418"/>
    <text x="394" y="345" text-anchor="middle" font-size="10" fill="#6090b0" font-family="sans-serif" font-weight="700" letter-spacing="1.5">💪  ARM WRESTLING</text>
    <!-- Table -->
    <rect x="273" y="406" width="246" height="54" rx="4" fill="#4a3018"/>
    <rect x="275" y="408" width="242" height="50" rx="3" fill="#5a3820"/>
    <!-- Elbow pads -->
    <rect x="283" y="417" width="34" height="18" rx="4" fill="#3a2810"/>
    <rect x="475" y="417" width="34" height="18" rx="4" fill="#3a2810"/>
    <!-- Left arm -->
    <rect x="292" y="370" width="16" height="50" rx="6" fill="#e09870"/>
    <ellipse cx="300" cy="370" rx="10" ry="6" fill="#d08860"/>
    <!-- Right arm -->
    <rect x="484" y="370" width="16" height="50" rx="6" fill="#f0b880"/>
    <ellipse cx="492" cy="370" rx="10" ry="6" fill="#e0a870"/>
    <!-- Clasped hands center -->
    <rect x="370" y="412" width="52" height="22" rx="8" fill="#c88858"/>
    <ellipse cx="394" cy="423" rx="28" ry="11" fill="#c88858"/>
    <!-- Knuckle highlights -->
    <ellipse cx="382" cy="415" rx="6" ry="4" fill="#d4a070" opacity=".7"/>
    <ellipse cx="396" cy="413" rx="5" ry="4" fill="#d4a070" opacity=".7"/>
    <!-- Tension lines -->
    <line x1="369" y1="418" x2="350" y2="406" stroke="#ff8040" stroke-width="1.5" opacity=".55"/>
    <line x1="369" y1="426" x2="349" y2="426" stroke="#ff8040" stroke-width="1.5" opacity=".55"/>
    <line x1="421" y1="418" x2="440" y2="406" stroke="#ff8040" stroke-width="1.5" opacity=".55"/>
    <line x1="421" y1="426" x2="441" y2="426" stroke="#ff8040" stroke-width="1.5" opacity=".55"/>
    <!-- Table legs -->
    <rect x="282" y="460" width="10" height="40" rx="2" fill="#3a2010"/>
    <rect x="500" y="460" width="10" height="40" rx="2" fill="#3a2010"/>
    <!-- Stats -->
    <text x="394" y="492" text-anchor="middle" font-size="10" fill="#5a8090" font-weight="600">Wins: ${awStats.wins}  ·  Streak: ${awStats.streak}</text>
    ${awStats.lastDate === todayStr()
      ? `<rect x="263" y="330" width="263" height="190" fill="${awStats.lastResult==='win'?'#004444':'#440000'}" opacity=".18"/>
         <rect x="285" y="502" width="220" height="20" rx="5" fill="${awStats.lastResult==='win'?'#006688':'#880000'}"/>
         <text x="394" y="516" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">${awStats.lastResult==='win'?'💪 Won Today':'✗ Lost Today'}</text>`
      : `<text x="394" y="508" text-anchor="middle" font-size="10" fill="#4a7090">Tap to enter</text>`}
  </g>

</svg>
<p class="comp-lobby-hint">Tap a zone to compete</p>
</div>`;
}

function startBoxing() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  const container = document.getElementById('fight-container');
  if (!container) return;
  container.innerHTML = `
    <div class="comp-back-row"><button class="comp-back-btn" onclick="PunchOut.backToSelector()">← Back</button></div>
    <canvas id="fight-canvas" width="${W}" height="${H}" style="width:100%;max-width:${W}px;display:block;margin:0 auto;border-radius:12px;background:#1a1a2e;touch-action:none;"></canvas>`;
  canvas = document.getElementById('fight-canvas');
  ctx = canvas.getContext('2d');
  canvas.removeEventListener('click', handleCanvasClick);
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    handleCanvasClick({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });
  document.addEventListener('keydown', handleKey);
  player = createPlayer();
  boss = createBoss(dailyBossLevel);
  shakeTimer = 0; shakeX = 0; shakeY = 0;
  gameState = 'idle';
  lastTime = performance.now();
  animFrame = requestAnimationFrame(gameLoop);
}

function startBodybuilding() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  const container = document.getElementById('fight-container');
  if (!container) return;

  bbPlayerData2 = getPlayerData();
  const npcs = bbGenerateDailyNPCs();
  bbNPC1 = npcs[0]; bbNPC2 = npcs[1];
  bbPlayerLevel = calcPlayerLevel(bbPlayerData2.muscles);
  const cfg = bbGetConfig();
  bbRequired = cfg.required;
  bbGoldReward = cfg.goldReward;
  bbState = 'idle';
  bbProgress = 0; bbStrikes = 0; bbCue = null;
  bbBetweenTimer = 0; bbPoseTimer = 0; bbCurrentPose = null; bbFlashTimer = 0;
  bbBtnRects = [];

  container.innerHTML = `
    <div class="comp-back-row"><button class="comp-back-btn" onclick="PunchOut.backToSelector()">← Back</button></div>
    <canvas id="bb-canvas" width="${W}" height="${H}" style="width:100%;max-width:${W}px;display:block;margin:0 auto;border-radius:12px;background:#0a0814;touch-action:none;"></canvas>`;

  bbCanvas = document.getElementById('bb-canvas');
  bbCtx = bbCanvas.getContext('2d');
  bbCanvas.removeEventListener('click', bbHandleCanvasClick);
  bbCanvas.addEventListener('click', bbHandleCanvasClick);
  bbCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    bbHandleCanvasClick({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });
  document.addEventListener('keydown', bbHandleKey);

  bbLastTime = performance.now();
  bbAnimFrame = requestAnimationFrame(bbGameLoop);
}

function backToSelector() {
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  document.removeEventListener('keydown', sumoHandleKey);
  document.removeEventListener('keydown', awHandleKey);
  if (sumoAnimFrame) { cancelAnimationFrame(sumoAnimFrame); sumoAnimFrame = null; }
  if (awAnimFrame) { cancelAnimationFrame(awAnimFrame); awAnimFrame = null; }
  renderSelector();
}

// ─── INIT ───

function init() {
  const container = document.getElementById('fight-container');
  if (!container) return;
  loadFightStats();
  bbLoadStats();
  sumoLoadStats();
  awLoadStats();
  dailyBossLevel = getDailyBossLevel();
  renderSelector();
}

function destroy() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  if (sumoAnimFrame) { cancelAnimationFrame(sumoAnimFrame); sumoAnimFrame = null; }
  if (awAnimFrame) { cancelAnimationFrame(awAnimFrame); awAnimFrame = null; }
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  document.removeEventListener('keydown', sumoHandleKey);
  document.removeEventListener('keydown', awHandleKey);
}

return { init, destroy, startBoxing, startBodybuilding, startSumo, startArmWrestling, backToSelector };

})();
