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

// ─── COMPETITION SELECTOR ───

function renderSelector() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
  const container = document.getElementById('fight-container');
  if (!container) return;
  const todayWon = fightStats.lastFightDate === todayStr() && fightStats.lastResult === 'win';
  const bbDone = bbStats.lastDate === todayStr();
  const bbWon = bbDone && bbStats.lastResult === 'win';
  container.innerHTML = `<div class="comp-select">
    <h2 class="comp-select-title">Competition</h2>
    <div class="comp-cards">
      <div class="comp-card${todayWon ? ' comp-done' : ''}" onclick="PunchOut.startBoxing()">
        <div class="comp-icon">🥊</div>
        <div class="comp-name">Daily Boss Fight</div>
        <div class="comp-desc">KO today's boss in the ring</div>
        <div class="comp-meta">Streak: ${fightStats.streak} · KOs: ${fightStats.totalKOs}</div>
        <div class="comp-status${todayWon ? ' cst-won' : ''}">${todayWon ? '✓ Done Today' : 'Ready'}</div>
      </div>
      <div class="comp-card${bbDone ? ' comp-done' : ''}" onclick="PunchOut.startBodybuilding()">
        <div class="comp-icon">💪</div>
        <div class="comp-name">Bodybuilding Show</div>
        <div class="comp-desc">Hit every pose before the judges</div>
        <div class="comp-meta">Wins: ${bbStats.totalWins} · Shows: ${bbStats.totalComps}</div>
        <div class="comp-status${bbDone ? (bbWon ? ' cst-won' : ' cst-lost') : ''}">${bbDone ? (bbWon ? '🏆 Won Today' : '✗ Failed Today') : 'Ready'}</div>
      </div>
    </div>
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
  renderSelector();
}

// ─── INIT ───

function init() {
  const container = document.getElementById('fight-container');
  if (!container) return;
  loadFightStats();
  bbLoadStats();
  dailyBossLevel = getDailyBossLevel();
  renderSelector();
}

function destroy() {
  if (animFrame) cancelAnimationFrame(animFrame);
  if (bbAnimFrame) cancelAnimationFrame(bbAnimFrame);
  document.removeEventListener('keydown', handleKey);
  document.removeEventListener('keydown', bbHandleKey);
}

return { init, destroy, startBoxing, startBodybuilding, backToSelector };

})();
