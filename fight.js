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

function todayStr() { return new Date().toISOString().slice(0, 10); }

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

// ─── INIT ───
function init() {
  const container = document.getElementById('fight-container');
  if (!container) return;

  loadFightStats();
  dailyBossLevel = getDailyBossLevel();

  if (canvas) {
    if (animFrame) cancelAnimationFrame(animFrame);
  }

  container.innerHTML = `<canvas id="fight-canvas" width="${W}" height="${H}" style="width:100%;max-width:${W}px;display:block;margin:0 auto;border-radius:12px;background:#1a1a2e;touch-action:none;"></canvas>`;
  canvas = document.getElementById('fight-canvas');
  ctx = canvas.getContext('2d');

  canvas.removeEventListener('click', handleCanvasClick);
  canvas.addEventListener('click', handleCanvasClick);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    handleCanvasClick({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });

  document.removeEventListener('keydown', handleKey);
  document.addEventListener('keydown', handleKey);

  player = createPlayer();
  boss = createBoss(dailyBossLevel);
  shakeTimer = 0; shakeX = 0; shakeY = 0;
  gameState = 'idle';
  lastTime = performance.now();
  animFrame = requestAnimationFrame(gameLoop);
}

function destroy() {
  if (animFrame) cancelAnimationFrame(animFrame);
  document.removeEventListener('keydown', handleKey);
}

return { init, destroy };

})();
