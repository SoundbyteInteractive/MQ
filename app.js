const MQ = (() => {

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc",
  authDomain: "musclequest-c5052.firebaseapp.com",
  projectId: "musclequest-c5052",
  storageBucket: "musclequest-c5052.firebasestorage.app",
  messagingSenderId: "102275749534",
  appId: "1:102275749534:web:fd325c22997c478022cd8f"
};

let db = null;
let currentUser = null;

function initFirebase() {
  try {
    if (window._firebaseReady && typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function' && FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY') {
      firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore();
      return true;
    }
  } catch (e) { console.warn('Firebase init skipped:', e.message); }
  db = null;
  return false;
}

// ─── Cosmetics System ───
const COSMETICS = [
  { id: 'headband_red',    name: 'Red Headband',   icon: '<i class="ti ti-ribbon-health" style="color:#e53935"></i>', type: 'head',  unlock: 'first_workout',  desc: 'Complete first workout' },
  { id: 'headband_blue',   name: 'Blue Headband',  icon: '<i class="ti ti-ribbon-health" style="color:#1e88e5"></i>', type: 'head',  unlock: 'streak_3',       desc: '3 day streak' },
  { id: 'headband_gold',   name: 'Gold Headband',  icon: '<i class="ti ti-ribbon-health" style="color:#ffd700"></i>', type: 'head',  unlock: 'streak_30',      desc: '30 day streak' },
  { id: 'wrist_wraps',     name: 'Wrist Wraps',    icon: '<i class="ti ti-bandage"></i>',          type: 'wrist', unlock: 'ten_workouts',   desc: 'Complete 10 workouts' },
  { id: 'wrist_wraps_red', name: 'Red Wraps',      icon: '<i class="ti ti-bandage" style="color:#e53935"></i>', type: 'wrist', unlock: 'muscle_10',      desc: 'Any muscle to Lv.10' },
  { id: 'tank_top',        name: 'Tank Top',       icon: '<i class="ti ti-shirt"></i>',            type: 'torso', unlock: 'level_5',        desc: 'Reach level 5' },
  { id: 'stringer',        name: 'Stringer',       icon: '<i class="ti ti-shirt-sport"></i>',      type: 'torso', unlock: 'level_10',       desc: 'Reach level 10' },
  { id: 'knee_sleeves',    name: 'Knee Sleeves',   icon: '<i class="ti ti-shoe"></i>',             type: 'legs',  unlock: 'all_muscles',    desc: 'Train all 10 muscles' },
  { id: 'lifting_belt',    name: 'Lifting Belt',   icon: '<i class="ti ti-belt"></i>',             type: 'waist', unlock: 'fifty_workouts', desc: 'Complete 50 workouts' },
  { id: 'crown',           name: 'Champion Crown', icon: '<i class="ti ti-crown" style="color:#ffd700"></i>', type: 'head',  unlock: 'level_25',       desc: 'Reach level 25' },
  { id: 'gold_chain',      name: 'Gold Chain',     icon: '<i class="ti ti-link" style="color:#ffd700"></i>', type: 'neck',  unlock: 'gold_1000',      desc: 'Earn 1000 gold' },
  { id: 'sweatbands',      name: 'Sweatbands',     icon: '<i class="ti ti-droplet" style="color:#42a5f5"></i>', type: 'wrist', unlock: 'streak_7',       desc: '7 day streak' },
];

// ─── Data Definitions ───
const MUSCLES = {
  chest:      { name: 'Chest',      color: '#f44336', group: 'push' },
  biceps:     { name: 'Biceps',     color: '#ff9800', group: 'pull' },
  triceps:    { name: 'Triceps',    color: '#ff5722', group: 'push' },
  shoulders:  { name: 'Shoulders',  color: '#9c27b0', group: 'push' },
  back:       { name: 'Back',       color: '#4caf50', group: 'pull' },
  abs:        { name: 'Abs',        color: '#ffd700', group: 'core' },
  glutes:     { name: 'Glutes',     color: '#e91e63', group: 'legs' },
  quads:      { name: 'Quads',      color: '#4488ff', group: 'legs' },
  hamstrings: { name: 'Hamstrings', color: '#2196f3', group: 'legs' },
  calves:     { name: 'Calves',     color: '#00bcd4', group: 'legs' },
  cardio:     { name: 'Cardio',     color: '#ff6e40', group: 'cardio' },
  rest:       { name: 'Rest Day',   color: '#78909c', group: 'recovery' },
};

const EXERCISES = {
  chest:      ['Bench Press','Incline Press','Chest Fly','Push-ups','Cable Crossover','Dips (Chest)','Other'],
  biceps:     ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Concentration Curl','Other'],
  triceps:    ['Tricep Pushdown','Skull Crushers','Overhead Extension','Dips (Triceps)','Close-Grip Bench','Other'],
  shoulders:  ['Overhead Press','Lateral Raise','Front Raise','Face Pull','Arnold Press','Shrugs','Other'],
  back:       ['Deadlift','Pull-ups','Barbell Row','Lat Pulldown','Cable Row','T-Bar Row','Other'],
  abs:        ['Crunches','Planks','Leg Raises','Russian Twists','Ab Rollout','Cable Crunch','Other'],
  glutes:     ['Hip Thrust','Glute Bridge','Romanian Deadlift','Cable Kickback','Bulgarian Split Squat','Other'],
  quads:      ['Squat','Leg Press','Lunges','Leg Extension','Front Squat','Goblet Squat','Other'],
  hamstrings: ['Leg Curl','Stiff-Leg Deadlift','Nordic Curl','Good Mornings','Glute-Ham Raise','Other'],
  calves:     ['Calf Raise (Standing)','Calf Raise (Seated)','Donkey Calf Raise','Jump Rope','Other'],
  cardio:     ['Walking','Running','Jogging','Cycling','Stairmaster','Elliptical','Rowing Machine','Swimming','Jump Rope','HIIT','Yoga','Pilates','Dance','Hiking','Boxing','Kickboxing','Skating','Cross-Country Skiing','Other'],
  rest:       ['Rest & Recovery'],
};

const EXERCISE_MUSCLES = {
  'Bench Press': { chest: 1.0, triceps: 0.4, shoulders: 0.3 },
  'Incline Press': { chest: 0.8, shoulders: 0.5, triceps: 0.3 },
  'Chest Fly': { chest: 1.0 },
  'Push-ups': { chest: 0.8, triceps: 0.4, shoulders: 0.3, abs: 0.2 },
  'Cable Crossover': { chest: 1.0 },
  'Dips (Chest)': { chest: 0.9, triceps: 0.5 },
  'Barbell Curl': { biceps: 1.0 },
  'Dumbbell Curl': { biceps: 1.0 },
  'Hammer Curl': { biceps: 0.9 },
  'Preacher Curl': { biceps: 1.0 },
  'Concentration Curl': { biceps: 1.0 },
  'Tricep Pushdown': { triceps: 1.0 },
  'Skull Crushers': { triceps: 1.0 },
  'Overhead Extension': { triceps: 1.0 },
  'Dips (Triceps)': { triceps: 0.9, chest: 0.3 },
  'Close-Grip Bench': { triceps: 0.8, chest: 0.4 },
  'Overhead Press': { shoulders: 1.0, triceps: 0.4 },
  'Lateral Raise': { shoulders: 1.0 },
  'Front Raise': { shoulders: 0.9 },
  'Face Pull': { shoulders: 0.7, back: 0.4 },
  'Arnold Press': { shoulders: 1.0, triceps: 0.3 },
  'Shrugs': { shoulders: 0.6, back: 0.4 },
  'Deadlift': { back: 1.0, hamstrings: 0.7, glutes: 0.6, quads: 0.3 },
  'Pull-ups': { back: 1.0, biceps: 0.5 },
  'Barbell Row': { back: 1.0, biceps: 0.4 },
  'Lat Pulldown': { back: 1.0, biceps: 0.3 },
  'Cable Row': { back: 0.9, biceps: 0.3 },
  'T-Bar Row': { back: 1.0, biceps: 0.3 },
  'Crunches': { abs: 1.0 },
  'Planks': { abs: 1.0, shoulders: 0.2 },
  'Leg Raises': { abs: 1.0 },
  'Russian Twists': { abs: 0.9 },
  'Ab Rollout': { abs: 1.0 },
  'Cable Crunch': { abs: 1.0 },
  'Hip Thrust': { glutes: 1.0, hamstrings: 0.3 },
  'Glute Bridge': { glutes: 1.0 },
  'Romanian Deadlift': { glutes: 0.7, hamstrings: 0.8 },
  'Cable Kickback': { glutes: 1.0 },
  'Bulgarian Split Squat': { glutes: 0.7, quads: 0.7 },
  'Squat': { quads: 1.0, glutes: 0.6, hamstrings: 0.3, abs: 0.2 },
  'Leg Press': { quads: 1.0, glutes: 0.4 },
  'Lunges': { quads: 0.8, glutes: 0.6 },
  'Leg Extension': { quads: 1.0 },
  'Front Squat': { quads: 1.0, abs: 0.3 },
  'Goblet Squat': { quads: 0.9, glutes: 0.4 },
  'Leg Curl': { hamstrings: 1.0 },
  'Stiff-Leg Deadlift': { hamstrings: 1.0, glutes: 0.5 },
  'Nordic Curl': { hamstrings: 1.0 },
  'Good Mornings': { hamstrings: 0.8, back: 0.4 },
  'Glute-Ham Raise': { hamstrings: 1.0, glutes: 0.5 },
  'Calf Raise (Standing)': { calves: 1.0 },
  'Calf Raise (Seated)': { calves: 1.0 },
  'Donkey Calf Raise': { calves: 1.0 },
  'Jump Rope': { calves: 0.7, quads: 0.3 },
  'Walking': { quads: 0.3, calves: 0.3, glutes: 0.2 },
  'Running': { quads: 0.5, calves: 0.5, hamstrings: 0.3, glutes: 0.3 },
  'Jogging': { quads: 0.4, calves: 0.4, hamstrings: 0.2, glutes: 0.2 },
  'Cycling': { quads: 0.6, calves: 0.3, hamstrings: 0.3 },
  'Stairmaster': { quads: 0.5, glutes: 0.5, calves: 0.3 },
  'Elliptical': { quads: 0.3, glutes: 0.3, shoulders: 0.2, calves: 0.2 },
  'Rowing Machine': { back: 0.5, biceps: 0.3, shoulders: 0.3, quads: 0.2 },
  'Swimming': { shoulders: 0.4, back: 0.4, chest: 0.3, abs: 0.2 },
  'HIIT': { quads: 0.4, abs: 0.3, shoulders: 0.2, calves: 0.2 },
  'Yoga': { abs: 0.3, shoulders: 0.2, glutes: 0.2, hamstrings: 0.2 },
  'Pilates': { abs: 0.5, glutes: 0.3, shoulders: 0.2 },
  'Dance': { quads: 0.3, calves: 0.3, abs: 0.2, glutes: 0.2 },
  'Hiking': { quads: 0.4, calves: 0.4, glutes: 0.3, hamstrings: 0.2 },
  'Boxing': { shoulders: 0.5, biceps: 0.3, triceps: 0.3, abs: 0.3 },
  'Kickboxing': { shoulders: 0.4, quads: 0.4, abs: 0.3, calves: 0.2 },
  'Skating': { quads: 0.4, glutes: 0.4, calves: 0.3 },
  'Cross-Country Skiing': { quads: 0.4, shoulders: 0.3, back: 0.3, abs: 0.2 },
  'Rest & Recovery': {},
};

const ACHIEVEMENTS = [
  { id: 'first_workout',  icon: '<i class="ti ti-barbell"></i>',        name: 'First Rep',       desc: 'Complete your first workout', check: s => s.totalWorkouts >= 1 },
  { id: 'ten_workouts',   icon: '<i class="ti ti-flame"></i>',          name: 'Warming Up',      desc: 'Complete 10 workouts', check: s => s.totalWorkouts >= 10 },
  { id: 'fifty_workouts', icon: '<i class="ti ti-bolt"></i>',           name: 'Unstoppable',     desc: 'Complete 50 workouts', check: s => s.totalWorkouts >= 50 },
  { id: 'streak_3',       icon: '<i class="ti ti-calendar-check"></i>', name: 'Consistent',      desc: '3 day streak', check: s => s.streak >= 3 },
  { id: 'streak_7',       icon: '<i class="ti ti-calendar-star"></i>',  name: 'Week Warrior',    desc: '7 day streak', check: s => s.streak >= 7 },
  { id: 'streak_30',      icon: '<i class="ti ti-crown"></i>',          name: 'Iron Discipline', desc: '30 day streak', check: s => s.streak >= 30 },
  { id: 'level_5',        icon: '<i class="ti ti-star"></i>',           name: 'Rising Hero',     desc: 'Reach level 5', check: s => s.level >= 5 },
  { id: 'level_10',       icon: '<i class="ti ti-award"></i>',          name: 'Champion',        desc: 'Reach level 10', check: s => s.level >= 10 },
  { id: 'level_25',       icon: '<i class="ti ti-diamond"></i>',        name: 'Legend',           desc: 'Reach level 25', check: s => s.level >= 25 },
  { id: 'all_muscles',    icon: '<i class="ti ti-topology-ring-3"></i>',name: 'Well Rounded',   desc: 'Train all 10 muscle groups', check: s => Object.keys(MUSCLES).every(m => (s.muscles[m]?.xp || 0) > 0) },
  { id: 'gold_1000',      icon: '<i class="ti ti-coin"></i>',           name: 'Treasure Hoard',  desc: 'Earn 1000 gold', check: s => s.totalGold >= 1000 },
  { id: 'muscle_10',      icon: '<i class="ti ti-arm"></i>',            name: 'Specialist',      desc: 'Get any muscle to level 10', check: s => Object.values(s.muscles).some(m => m.level >= 10) },
];

const RAID_BOSSES = [
  { name: 'Goblin Swarm',   img: 'boss.png',  hp: 15000 },
  { name: 'Stone Golem',    img: 'boss1.png', hp: 20000 },
  { name: 'The Ogre',       img: 'boss2.png', hp: 25000 },
  { name: 'Dragon Whelp',   img: 'boss3.png', hp: 35000 },
  { name: 'Shadow Knight',  img: 'boss4.png', hp: 50000 },
];

const DAILY_QUESTS = [
  { id: 'train_3_groups', text: 'Train 3 Muscle Groups', target: 3, reward: 50, type: 'groups' },
  { id: 'log_5_sets',     text: 'Log 5 Sets Total',     target: 5, reward: 30, type: 'sets' },
  { id: 'earn_100xp',     text: 'Earn 100 XP',          target: 100, reward: 40, type: 'xp' },
];

// ─── XP Formulas (tuned for long-term progression) ───
function xpForMuscleLevel(level) { return Math.floor(120 * Math.pow(1.22, level - 1)); }
function xpForPlayerLevel(level) { return Math.floor(200 * Math.pow(1.3, level - 1)); }

function calcWorkoutXP(sets, duration) {
  let base = 0;
  for (const s of sets) {
    if (s.weight > 0 && s.reps > 0) {
      base += Math.floor((s.weight * s.reps) / 120);
    }
  }
  if (sets.length > 0) base += sets.length;
  if (duration > 0) base += Math.floor(duration * 0.8);
  return Math.max(base, 3);
}

function calcOverallLevel(muscles) {
  let totalWeightedXP = 0;
  for (const key of Object.keys(MUSCLES)) {
    if (key === 'rest' || key === 'cardio') continue;
    const m = muscles[key] || { level: 1, xp: 0 };
    let cumXP = 0;
    for (let i = 1; i < m.level; i++) cumXP += xpForMuscleLevel(i);
    cumXP += m.xp;
    totalWeightedXP += cumXP;
  }
  let level = 1;
  let xpNeeded = xpForPlayerLevel(1);
  let xpAccum = 0;
  while (totalWeightedXP - xpAccum >= xpNeeded) {
    xpAccum += xpNeeded;
    level++;
    xpNeeded = xpForPlayerLevel(level);
  }
  return { level, xp: totalWeightedXP - xpAccum, xpNeeded };
}

// ─── State ───
function defaultState() {
  const muscles = {};
  for (const key of Object.keys(MUSCLES)) muscles[key] = { level: 1, xp: 0, scale: 1.0 };
  return {
    name: 'Hero',
    gender: 'male',
    muscles,
    gold: 0,
    totalGold: 0,
    streak: 0,
    lastWorkoutDate: null,
    totalWorkouts: 0,
    achievements: [],
    equippedCosmetics: [],
    activeBuffs: [],
    workoutLog: [],
    dailyProgress: { date: null, groups: [], sets: 0, xp: 0, workouts: 0 },
    raidDamage: 0,
    raidBossIndex: 0,
    raidWeekStart: null,
  };
}

let state = defaultState();

function save() {
  localStorage.setItem('musclequest_save', JSON.stringify(state));
  if (db && currentUser) {
    db.collection('users').doc(currentUser).set(state, { merge: true }).catch(() => {});
  }
}

function load() {
  const raw = localStorage.getItem('musclequest_save');
  if (raw) {
    const s = JSON.parse(raw);
    state = { ...defaultState(), ...s };
    for (const key of Object.keys(MUSCLES)) {
      if (!state.muscles[key]) state.muscles[key] = { level: 1, xp: 0, scale: 1.0 };
    }
    if (!state.equippedCosmetics) state.equippedCosmetics = [];
    if (!state.gender) state.gender = 'male';
  }
}

async function login() {
  const username = document.getElementById('login-username').value.trim().toLowerCase();
  const pin = document.getElementById('login-pin').value.trim();
  const hint = document.getElementById('login-hint');

  if (!username || username.length < 2) { hint.textContent = 'Username must be at least 2 characters'; hint.className = 'login-hint error'; return; }
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) { hint.textContent = 'PIN must be exactly 4 digits'; hint.className = 'login-hint error'; return; }

  let usedFirebase = false;
  if (db) {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000));
      const doc = await Promise.race([db.collection('users').doc(username).get(), timeoutPromise]);
      usedFirebase = true;
      if (doc.exists) {
        const data = doc.data();
        if (data._pin !== pin) { hint.textContent = 'Wrong PIN for this username'; hint.className = 'login-hint error'; return; }
        state = { ...defaultState(), ...data };
        delete state._pin;
        for (const key of Object.keys(MUSCLES)) {
          if (!state.muscles[key]) state.muscles[key] = { level: 1, xp: 0, scale: 1.0 };
        }
        if (!state.equippedCosmetics) state.equippedCosmetics = [];
        hint.textContent = 'Welcome back, ' + state.name + '!';
        hint.className = 'login-hint success';
      } else {
        state = defaultState();
        state.name = username;
        state._pin = pin;
        await db.collection('users').doc(username).set({ ...state, _pin: pin });
        delete state._pin;
        hint.textContent = 'Account created!';
        hint.className = 'login-hint success';
      }
    } catch (e) {
      usedFirebase = false;
    }
  }
  if (!usedFirebase) {
    const savedKey = `musclequest_${username}`;
    const raw = localStorage.getItem(savedKey);
    if (raw) {
      const data = JSON.parse(raw);
      if (data._pin && data._pin !== pin) { hint.textContent = 'Wrong PIN for this username'; hint.className = 'login-hint error'; return; }
      state = { ...defaultState(), ...data };
      delete state._pin;
      for (const key of Object.keys(MUSCLES)) {
        if (!state.muscles[key]) state.muscles[key] = { level: 1, xp: 0, scale: 1.0 };
      }
      if (!state.equippedCosmetics) state.equippedCosmetics = [];
      hint.textContent = 'Welcome back!';
      hint.className = 'login-hint success';
    } else {
      state = defaultState();
      state.name = username;
      localStorage.setItem(savedKey, JSON.stringify({ ...state, _pin: pin }));
      hint.textContent = 'Account created locally!';
      hint.className = 'login-hint success';
    }
  }

  currentUser = username;
  localStorage.setItem('musclequest_current_user', username);
  localStorage.setItem('musclequest_current_pin', pin);
  localStorage.setItem('musclequest_save', JSON.stringify(state));

  setTimeout(() => {
    document.getElementById('login-screen').classList.add('hidden');
    addExerciseRow();
    renderDashboard();
  }, 600);
}

function logout() {
  currentUser = null;
  localStorage.removeItem('musclequest_current_user');
  localStorage.removeItem('musclequest_current_pin');
  localStorage.removeItem('musclequest_save');
  state = defaultState();
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-pin').value = '';
  document.getElementById('login-hint').textContent = '';
  showTab('dashboard');
}

async function autoLogin() {
  const user = localStorage.getItem('musclequest_current_user');
  const pin = localStorage.getItem('musclequest_current_pin');
  if (user && pin) {
    document.getElementById('login-username').value = user;
    document.getElementById('login-pin').value = pin;
    try {
      await login();
    } catch (e) {
      load();
      currentUser = user;
      document.getElementById('login-screen').classList.add('hidden');
      addExerciseRow();
      renderDashboard();
    }
  }
}

function saveWithPin() {
  const pin = localStorage.getItem('musclequest_current_pin');
  const overall = calcOverallLevel(state.muscles);
  const leaderboardData = {
    _leaderboardXP: overall.level * 1000 + overall.xp,
    _leaderboardLevel: overall.level,
    _leaderboardName: state.name,
    _lastActive: todayStr(),
  };
  localStorage.setItem('musclequest_save', JSON.stringify(state));
  if (currentUser && !db) {
    localStorage.setItem(`musclequest_${currentUser}`, JSON.stringify({ ...state, ...leaderboardData, _pin: pin }));
  }
  if (db && currentUser) {
    db.collection('users').doc(currentUser).set({ ...state, ...leaderboardData, _pin: pin }, { merge: true }).catch(() => {});
  }
}

// ─── Date Helpers ───
function todayStr() { return new Date().toISOString().slice(0, 10); }
function formatDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

// ─── Streak Logic ───
function updateStreak() {
  const today = todayStr();
  if (state.lastWorkoutDate === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  if (state.lastWorkoutDate === yesterdayStr) {
    state.streak++;
  } else if (state.lastWorkoutDate !== today) {
    const hasProtection = (state.activeBuffs || []).some(b => b.id === 'multivitamin' && b.expiresAt > Date.now());
    if (!hasProtection) state.streak = 1;
    else state.streak++;
  }
  state.lastWorkoutDate = today;
  playSFX('streak');
}

// ─── Daily Progress ───
function ensureDaily() {
  const today = todayStr();
  if (state.dailyProgress.date !== today) {
    state.dailyProgress = { date: today, groups: [], sets: 0, xp: 0, workouts: 0 };
  }
}

// ─── Raid Boss ───
function getRaidBoss() {
  const ws = getWeekStart();
  if (state.raidWeekStart !== ws) {
    state.raidWeekStart = ws;
    state.raidDamage = 0;
    state.raidBossIndex = (state.raidBossIndex + 1) % RAID_BOSSES.length;
  }
  return RAID_BOSSES[state.raidBossIndex];
}

// ─── Multi-Exercise Entry Management ───
let exerciseRowId = 0;

function addExerciseRow() {
  const container = document.getElementById('exercise-entries');
  const id = exerciseRowId++;
  const div = document.createElement('div');
  div.className = 'exercise-entry';
  div.dataset.entryId = id;
  const count = container.children.length + 1;
  div.innerHTML = `
    <div class="entry-header">
      <span class="entry-number">Exercise ${count}</span>
      <button class="btn-remove-entry" onclick="MQ.removeExerciseRow(${id})" title="Remove">&times;</button>
    </div>
    <div class="entry-form">
      <div class="form-row">
        <select class="entry-muscle" onchange="MQ.onEntryMuscleChange(${id})">
          <option value="">Select Muscle Group</option>
          ${Object.entries(MUSCLES).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <select class="entry-exercise">
          <option value="">Select Exercise...</option>
        </select>
      </div>
      <div class="sets-header">
        <label>Sets</label>
        <div class="set-stepper">
          <button class="stepper-btn" onclick="MQ.changeSetCount(${id}, -1)">−</button>
          <span class="set-count-display">3</span>
          <button class="stepper-btn" onclick="MQ.changeSetCount(${id}, 1)">+</button>
        </div>
      </div>
      <div class="set-rows">
        <div class="set-row-header">
          <span class="set-label-col"></span>
          <span class="set-val-col">Weight</span>
          <span class="set-val-col">Reps</span>
        </div>
        <div class="set-row" data-set="1">
          <span class="set-label">1</span>
          <input type="number" class="set-weight" placeholder="lbs" min="0">
          <input type="number" class="set-reps" value="12" min="1">
        </div>
        <div class="set-row" data-set="2">
          <span class="set-label">2</span>
          <input type="number" class="set-weight" placeholder="lbs" min="0">
          <input type="number" class="set-reps" value="10" min="1">
        </div>
        <div class="set-row" data-set="3">
          <span class="set-label">3</span>
          <input type="number" class="set-weight" placeholder="lbs" min="0">
          <input type="number" class="set-reps" value="8" min="1">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Duration (min, optional)</label>
          <input type="number" class="entry-duration" placeholder="minutes" min="0">
        </div>
      </div>
    </div>`;
  container.appendChild(div);
  renumberEntries();
}

function removeExerciseRow(id) {
  const el = document.querySelector(`.exercise-entry[data-entry-id="${id}"]`);
  if (el) el.remove();
  renumberEntries();
  if (document.getElementById('exercise-entries').children.length === 0) addExerciseRow();
}

function renumberEntries() {
  document.querySelectorAll('.exercise-entry').forEach((el, i) => {
    el.querySelector('.entry-number').textContent = `Exercise ${i + 1}`;
  });
}

function onEntryMuscleChange(id) {
  const entry = document.querySelector(`.exercise-entry[data-entry-id="${id}"]`);
  const key = entry.querySelector('.entry-muscle').value;
  const exSel = entry.querySelector('.entry-exercise');
  exSel.innerHTML = '<option value="">Select Exercise...</option>';
  if (key && EXERCISES[key]) {
    for (const ex of EXERCISES[key]) {
      exSel.innerHTML += `<option value="${ex}">${ex}</option>`;
    }
  }
  const setsSection = entry.querySelector('.sets-header');
  const setsRows = entry.querySelector('.set-rows');
  const durationGroup = entry.querySelector('.form-row:last-child');
  if (key === 'rest') {
    if (setsSection) setsSection.style.display = 'none';
    if (setsRows) setsRows.style.display = 'none';
    if (durationGroup) durationGroup.style.display = 'none';
    exSel.value = 'Rest & Recovery';
  } else if (key === 'cardio') {
    if (setsSection) setsSection.style.display = 'none';
    if (setsRows) setsRows.style.display = 'none';
    if (durationGroup) durationGroup.style.display = '';
  } else {
    if (setsSection) setsSection.style.display = '';
    if (setsRows) setsRows.style.display = '';
    if (durationGroup) durationGroup.style.display = '';
  }
}

function changeSetCount(entryId, delta) {
  const entry = document.querySelector(`.exercise-entry[data-entry-id="${entryId}"]`);
  if (!entry) return;
  const container = entry.querySelector('.set-rows');
  const rows = container.querySelectorAll('.set-row');
  const current = rows.length;
  const next = Math.max(1, Math.min(10, current + delta));
  if (next === current) return;

  if (next > current) {
    for (let i = current + 1; i <= next; i++) {
      const row = document.createElement('div');
      row.className = 'set-row';
      row.dataset.set = i;
      row.innerHTML = `
        <span class="set-label">${i}</span>
        <input type="number" class="set-weight" placeholder="lbs" min="0">
        <input type="number" class="set-reps" value="8" min="1">`;
      container.appendChild(row);
    }
  } else {
    for (let i = current; i > next; i--) {
      container.lastElementChild.remove();
    }
  }
  entry.querySelector('.set-count-display').textContent = next;
}

// ─── Submit Workout ───
function submitWorkout() {
  const entries = document.querySelectorAll('.exercise-entry');
  if (!entries.length) { toast('Add an exercise first!'); return; }

  const parsed = [];
  for (const entry of entries) {
    const muscleKey = entry.querySelector('.entry-muscle').value;
    const exercise = entry.querySelector('.entry-exercise').value;
    const duration = parseFloat(entry.querySelector('.entry-duration').value) || 0;

    const setRows = entry.querySelectorAll('.set-row');
    const sets = [];
    for (const row of setRows) {
      const weight = parseFloat(row.querySelector('.set-weight').value) || 0;
      const reps = parseInt(row.querySelector('.set-reps').value) || 0;
      sets.push({ weight, reps });
    }

    if (!muscleKey || !exercise) { toast('Fill in all exercises or remove empty ones!'); return; }
    if (muscleKey === 'rest') {
      parsed.push({ muscleKey, exercise, sets: [], duration: 0, isRest: true });
      continue;
    }
    if (muscleKey === 'cardio') {
      if (duration <= 0) { toast('Enter duration for cardio exercises!'); return; }
      parsed.push({ muscleKey, exercise, sets: [], duration, isCardio: true });
      continue;
    }
    const hasVolume = sets.some(s => s.weight > 0 && s.reps > 0);
    if (!hasVolume && duration <= 0) { toast('Enter weight/reps or duration for each exercise!'); return; }
    parsed.push({ muscleKey, exercise, sets, duration });
  }

  let grandTotalXP = 0;
  let grandTotalGold = 0;

  const now = Date.now();
  if (!state.activeBuffs) state.activeBuffs = [];
  state.activeBuffs = state.activeBuffs.filter(b => b.expiresAt > now);
  const hasBuff = id => state.activeBuffs.some(b => b.id === id);

  for (const p of parsed) {
    let totalXP = 0;
    let numSets = p.sets.length;
    let goldEarned = 0;

    if (p.isRest) {
      totalXP = hasBuff('bcaa') ? 150 : 100;
      const restXPPer = Math.floor(totalXP / 10);
      for (const mk of Object.keys(MUSCLES)) {
        if (mk === 'rest' || mk === 'cardio') continue;
        awardMuscleXP(mk, restXPPer);
      }
      goldEarned = 10;
      numSets = 0;
    } else if (p.isCardio) {
      const cardioBase = Math.floor(p.duration * 0.8);
      totalXP = Math.max(cardioBase, 3);
      const targets = EXERCISE_MUSCLES[p.exercise] || {};
      if (Object.keys(targets).length > 0) {
        for (const [mk, mult] of Object.entries(targets)) {
          const xp = Math.floor(totalXP * mult);
          awardMuscleXP(mk, xp);
        }
      }
      goldEarned = Math.floor(totalXP * 0.3);
      numSets = 0;
    } else {
      const baseXP = calcWorkoutXP(p.sets, p.duration);
      const targets = EXERCISE_MUSCLES[p.exercise] || { [p.muscleKey]: 1.0 };

      for (const [mk, mult] of Object.entries(targets)) {
        const xp = Math.floor(baseXP * mult);
        totalXP += xp;
        awardMuscleXP(mk, xp);
      }
      goldEarned = Math.floor(totalXP * 0.3) + numSets * 2;
    }

    if (hasBuff('preworkout') && !p.isRest) totalXP = Math.floor(totalXP * 1.3);
    if (hasBuff('protein') && !p.isRest && !p.isCardio) totalXP = Math.floor(totalXP * 1.25);
    if (hasBuff('massgainer') && !p.isRest && !p.isCardio) {
      const isCompound = Object.keys(EXERCISE_MUSCLES[p.exercise] || {}).length > 1;
      if (isCompound) totalXP = Math.floor(totalXP * 1.5);
    }
    if (hasBuff('fatburner')) goldEarned = goldEarned * 2;

    state.gold += goldEarned;
    state.totalGold += goldEarned;
    state.totalWorkouts++;

    updateStreak();
    ensureDaily();
    if (!state.dailyProgress.groups.includes(p.muscleKey)) state.dailyProgress.groups.push(p.muscleKey);
    state.dailyProgress.sets += numSets;
    state.dailyProgress.xp += totalXP;
    state.dailyProgress.workouts++;

    const raidDmg = Math.floor(totalXP * 1.5);
    state.raidDamage += raidDmg;

    state.workoutLog.push({
      date: todayStr(),
      exercise: p.exercise, muscle: p.muscleKey,
      sets: p.sets, duration: p.duration,
      xp: totalXP, gold: goldEarned,
    });

    grandTotalXP += totalXP;
    grandTotalGold += goldEarned;
  }

  getRaidBoss();
  saveWithPin();

  playSFX('submit');
  toast(`+${grandTotalXP} XP`, 'xp');
  toast(`+${grandTotalGold} Gold`, 'gold');

  checkAchievements();

  document.getElementById('exercise-entries').innerHTML = '';
  addExerciseRow();
  renderDashboard();
}

function awardMuscleXP(key, xp) {
  const m = state.muscles[key];
  m.xp += xp;
  let needed = xpForMuscleLevel(m.level);
  while (m.xp >= needed) {
    m.xp -= needed;
    m.level++;
    m.scale = muscleScale(m.level);
    needed = xpForMuscleLevel(m.level);
    playSFX('levelup');
    showLevelUp(`${MUSCLES[key].name} leveled up to Lv. ${m.level}!`, `+5 Bonus Gold`);
    state.gold += 5;
    state.totalGold += 5;
  }
}

// ─── Achievements ───
function checkAchievements() {
  const stats = { ...state, level: calcOverallLevel(state.muscles).level };
  for (const a of ACHIEVEMENTS) {
    if (!state.achievements.includes(a.id) && a.check(stats)) {
      state.achievements.push(a.id);
      showAchievement(a);
      state.gold += 25;
      state.totalGold += 25;
      saveWithPin();
    }
  }
}

let previousTab = 'dashboard';
let currentTab = 'dashboard';

function toggleSettings() {
  if (currentTab === 'settings') {
    showTab(previousTab);
  } else {
    showTab('settings');
  }
}

let avatarView = 'front';
function toggleAvatarView() {
  avatarView = avatarView === 'front' ? 'back' : 'front';
  renderAvatar();
  const btn = document.getElementById('avatar-toggle-btn');
  if (btn) btn.textContent = avatarView === 'front' ? '↻' : '↺';
}

// ─── UI ───
function showTab(tab) {
  if (currentTab !== tab) previousTab = currentTab;
  currentTab = tab;
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  const tabEl = document.getElementById(`tab-${tab}`);
  if (tabEl) tabEl.classList.add('active');
  const navBtn = document.querySelector(`[data-tab="${tab}"]`);
  if (navBtn) navBtn.classList.add('active');

  if (tab === 'dashboard') renderDashboard();
  else if (tab === 'workouts') showHistoryTab('personal');
  else if (tab === 'quests') renderQuestsTab();
  else if (tab === 'store') {
    if (typeof GainsShop !== 'undefined') GainsShop.render();
  }
  else if (tab === 'fight') {
    if (typeof PunchOut !== 'undefined') PunchOut.init();
  }
  else if (tab === 'leaderboards') {
    renderLeaderboard('weekly');
    const statusEl = document.getElementById('firebase-status');
    if (statusEl) statusEl.textContent = db ? 'Live leaderboard' : 'Offline mode — showing mock data';
  }
  else if (tab === 'settings') {
    document.getElementById('player-name-input').value = state.name;
    document.getElementById('gender-select').value = state.gender || 'male';
    document.getElementById('settings-username').textContent = currentUser || '—';
    renderCosmeticsList();
  }
}

function renderDashboard() {
  document.getElementById('current-date').textContent = formatDate();

  const overall = calcOverallLevel(state.muscles);
  document.getElementById('player-level').textContent = overall.level;
  document.getElementById('player-gold').textContent = state.gold.toLocaleString();
  document.getElementById('player-xp-bar').style.width = `${(overall.xp / overall.xpNeeded) * 100}%`;
  document.getElementById('player-xp-text').textContent = `${overall.xp} / ${overall.xpNeeded} XP`;
  document.getElementById('streak-count').textContent = state.streak;

  renderMuscleStats();
  renderAvatar();
  renderPoseSelector();
  renderTodayLog();
  renderDailyQuest();
  renderRaidProgress();
  renderAchievementsPreview();
  populateMuscleGroupSelect();
}

function renderMuscleStats() {
  const grid = document.getElementById('muscle-stats-grid');
  grid.innerHTML = '';
  for (const [key, info] of Object.entries(MUSCLES)) {
    if (key === 'rest' || key === 'cardio') continue;
    const m = state.muscles[key];
    const needed = xpForMuscleLevel(m.level);
    const pct = (m.xp / needed) * 100;
    grid.innerHTML += `
      <div class="muscle-stat">
        <span class="stat-name">${info.name}</span>
        <span class="stat-level">Lv.${m.level}</span>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:${pct}%;background:${info.color}"></div></div>
      </div>`;
  }
}

function muscleScale(level) {
  return 1.0 + 0.85 * (1 - Math.exp(-0.06 * (level - 1)));
}

const POSES = [
  { level: 1,  name: 'Relaxed',              lArm: 0,    rArm: 0,    lFore: 0,    rFore: 0   },
  { level: 1,  name: 'Front Double Bicep',    lArm: 130,  rArm: -130, lFore: 90,   rFore: -90 },
  { level: 1,  name: 'Side Chest',            lArm: -30,  rArm: -70,  lFore: -90,  rFore: -30 },
  { level: 5,  name: 'Frank Zane Vacuum',     lArm: -60,  rArm: 60,   lFore: -110, rFore: 110 },
  { level: 8,  name: 'Most Muscular',         lArm: 130,  rArm: -130, lFore: 90,   rFore: -90 },
  { level: 12, name: 'Side Tricep',           lArm: 15,   rArm: -20,  lFore: 30,   rFore: -90 },
  { level: 16, name: 'Rear Lat Spread',       lArm: -65,  rArm: 65,   lFore: -15,  rFore: 15  },
  { level: 20, name: 'Victory Pose',          lArm: -110, rArm: 110,  lFore: -20,  rFore: 20  },
];

let selectedPoseIndex = null;

function getCurrentPose(level) {
  if (selectedPoseIndex !== null) {
    const pose = POSES[selectedPoseIndex];
    if (pose && level >= pose.level) return pose;
  }
  let pose = POSES[0];
  for (const p of POSES) {
    if (level >= p.level) pose = p;
  }
  return pose;
}

function selectPose(index) {
  const overall = calcOverallLevel(state.muscles);
  if (POSES[index].level > overall.level) return;
  selectedPoseIndex = (selectedPoseIndex === index) ? null : index;
  renderAvatar();
  renderPoseSelector();
}

function renderPoseSelector() {
  const container = document.getElementById('pose-selector');
  if (!container) return;
  const overall = calcOverallLevel(state.muscles);
  const defaultPose = (() => { let p = POSES[0]; for (const pp of POSES) { if (overall.level >= pp.level) p = pp; } return p; })();

  container.innerHTML = POSES.map((p, i) => {
    const unlocked = overall.level >= p.level;
    const isActive = selectedPoseIndex === i || (selectedPoseIndex === null && p === defaultPose);
    return `<button class="pose-btn ${isActive ? 'active' : ''} ${unlocked ? '' : 'locked'}"
      onclick="${unlocked ? `MQ.selectPose(${i})` : ''}"
      title="${unlocked ? p.name : 'Unlocks at Lv.' + p.level}">${unlocked ? p.name : 'Lv.' + p.level}</button>`;
  }).join('');
}

function renderAvatar() {
  const c = document.getElementById('avatar-container');
  const m = state.muscles;
  const s = k => muscleScale(m[k].level);
  const front = avatarView === 'front';
  const female = state.gender === 'female';

  const torsoW = 56 * (front ? s('chest') : s('back'));
  const torsoX = 100 - torsoW / 2;

  const shoulderR = 16 * s('shoulders');
  const shoulderRY = 14 * s('shoulders');
  const shoulderLX = 100 - torsoW / 2 - shoulderR * 0.5;
  const shoulderRX = 100 + torsoW / 2 + shoulderR * 0.5;

  const armMainW = 24 * (front ? s('biceps') : s('triceps'));
  const armSecW = 18 * (front ? s('triceps') : s('biceps'));
  const armLX = shoulderLX - armMainW * 0.4;
  const armRX = shoulderRX - armMainW * 0.6;
  const armSecLX = armLX + (armMainW - armSecW) / 2;
  const armSecRX = armRX + (armMainW - armSecW) / 2;

  const forearmW = 18;
  const forearmLX = armLX + (armMainW - forearmW) / 2;
  const forearmRX = armRX + (armMainW - forearmW) / 2;
  const handLX = forearmLX + forearmW / 2;
  const handRX = forearmRX + forearmW / 2;

  const legMainW = 28 * (front ? s('quads') : s('hamstrings'));
  const legSecW = 22 * (front ? s('hamstrings') : s('quads'));
  const legGap = 8;
  const legLX = 100 - legGap / 2 - legMainW;
  const legRX = 100 + legGap / 2;
  const legSecLX = legLX + (legMainW - legSecW) / 2;
  const legSecRX = legRX + (legMainW - legSecW) / 2;

  const calfW = 24 * s('calves');
  const calfLX = legLX + (legMainW - calfW) / 2;
  const calfRX = legRX + (legMainW - calfW) / 2;

  const gluteRX = 22 * s('glutes');
  const gluteRY = 12 * s('glutes');

  const absW = 36 * s('abs');
  const absX = 100 - absW / 2;

  const shortsW = Math.max(60, legMainW * 2 + legGap + 4);
  const shortsX = 100 - shortsW / 2;

  const backW = 56 * s('back');
  const backX = 100 - backW / 2;
  const chestW = 56 * s('chest');
  const chestX = 100 - chestW / 2;

  let bodyHTML;

  if (front) {
    bodyHTML = `
    <!-- Legs / Quads (front) -->
    <g class="body-part" data-muscle="quads">
      <rect x="${legLX}" y="210" width="${legMainW}" height="60" rx="10" fill="url(#skin)"/>
      <rect x="${legRX}" y="210" width="${legMainW}" height="60" rx="10" fill="url(#skin)"/>
    </g>
    <!-- Hamstrings (shadow) -->
    <g class="body-part" data-muscle="hamstrings" opacity="0.3">
      <rect x="${legSecLX}" y="230" width="${legSecW}" height="35" rx="8" fill="#8B6914"/>
      <rect x="${legSecRX}" y="230" width="${legSecW}" height="35" rx="8" fill="#8B6914"/>
    </g>
    <!-- Calves -->
    <g class="body-part" data-muscle="calves">
      <rect x="${calfLX}" y="268" width="${calfW}" height="40" rx="9" fill="url(#skinDark)"/>
      <rect x="${calfRX}" y="268" width="${calfW}" height="40" rx="9" fill="url(#skinDark)"/>
    </g>
    <!-- Glutes (shadow) -->
    <g class="body-part" data-muscle="glutes" opacity="0.25">
      <ellipse cx="100" cy="210" rx="${gluteRX}" ry="${gluteRY}" fill="#c8965e"/>
    </g>
    <!-- Back (shadow) -->
    <g class="body-part" data-muscle="back">
      <rect x="${backX}" y="110" width="${backW}" height="95" rx="16" fill="url(#skinDark)" opacity="0.5"/>
    </g>
    <!-- Chest (front) -->
    <g class="body-part" data-muscle="chest">
      <rect x="${chestX}" y="108" width="${chestW}" height="50" rx="18" fill="url(#skin)"/>
      ${female ? `
      <rect x="${chestX + 3}" y="118" width="${chestW - 6}" height="28" rx="10" fill="#2a2a3e"/>
      <path d="M${chestX + 8} 118 L${100 - 3} 122 L${100 + 3} 122 L${chestX + chestW - 8} 118" stroke="#3a3a5e" stroke-width="0.8" fill="none"/>
      <line x1="100" y1="122" x2="100" y2="118" stroke="#3a3a5e" stroke-width="0.8"/>
      ` : `<path d="M${100-12} 125 Q100 132 ${100+12} 125" stroke="#c8965e" stroke-width="1" fill="none" opacity="0.6"/>`}
    </g>
    <!-- Abs -->
    <g class="body-part" data-muscle="abs">
      <rect x="${absX}" y="155" width="${absW}" height="50" rx="10" fill="url(#skinDark)" opacity="0.7"/>
      ${[0,12,24,36].map(dy => `<line x1="100" y1="${158+dy}" x2="100" y2="${164+dy}" stroke="#c8965e" stroke-width="0.8" opacity="0.5"/>`).join('')}
      ${[6,18,30].map(dy => `<line x1="${absX+6}" y1="${161+dy}" x2="${absX+absW-6}" y2="${161+dy}" stroke="#c8965e" stroke-width="0.6" opacity="0.4"/>`).join('')}
    </g>
    <!-- Shoulders -->
    <g class="body-part" data-muscle="shoulders">
      <ellipse cx="${shoulderLX}" cy="115" rx="${shoulderR}" ry="${shoulderRY}" fill="url(#skin)"/>
      <ellipse cx="${shoulderRX}" cy="115" rx="${shoulderR}" ry="${shoulderRY}" fill="url(#skin)"/>
    </g>
    `;
  } else {
    bodyHTML = `
    <!-- Hamstrings (back, primary) -->
    <g class="body-part" data-muscle="hamstrings">
      <rect x="${legLX}" y="210" width="${legMainW}" height="60" rx="10" fill="url(#skin)"/>
      <rect x="${legRX}" y="210" width="${legMainW}" height="60" rx="10" fill="url(#skin)"/>
    </g>
    <!-- Quads (shadow) -->
    <g class="body-part" data-muscle="quads" opacity="0.3">
      <rect x="${legSecLX}" y="220" width="${legSecW}" height="40" rx="8" fill="#c8965e"/>
      <rect x="${legSecRX}" y="220" width="${legSecW}" height="40" rx="8" fill="#c8965e"/>
    </g>
    <!-- Calves -->
    <g class="body-part" data-muscle="calves">
      <rect x="${calfLX}" y="268" width="${calfW}" height="40" rx="9" fill="url(#skinDark)"/>
      <rect x="${calfRX}" y="268" width="${calfW}" height="40" rx="9" fill="url(#skinDark)"/>
    </g>
    <!-- Glutes (back, primary) -->
    <g class="body-part" data-muscle="glutes">
      <ellipse cx="100" cy="210" rx="${gluteRX}" ry="${gluteRY}" fill="url(#skinDark)"/>
      <line x1="100" y1="${210 - gluteRY + 2}" x2="100" y2="${210 + gluteRY - 2}" stroke="#c8965e" stroke-width="0.8" opacity="0.4"/>
    </g>
    <!-- Chest (shadow) -->
    <g class="body-part" data-muscle="chest" opacity="0.3">
      <rect x="${chestX}" y="112" width="${chestW}" height="45" rx="16" fill="#c8965e"/>
    </g>
    <!-- Back (back, primary) -->
    <g class="body-part" data-muscle="back">
      <rect x="${backX}" y="108" width="${backW}" height="95" rx="16" fill="url(#skin)"/>
      <!-- Spine -->
      <line x1="100" y1="115" x2="100" y2="195" stroke="#c8965e" stroke-width="1" opacity="0.5"/>
      <!-- Lats -->
      <path d="M${backX+8} 130 Q${backX+4} 160 ${backX+10} 190" stroke="#c8965e" stroke-width="0.8" fill="none" opacity="0.4"/>
      <path d="M${backX+backW-8} 130 Q${backX+backW-4} 160 ${backX+backW-10} 190" stroke="#c8965e" stroke-width="0.8" fill="none" opacity="0.4"/>
      <!-- Shoulder blade hints -->
      <ellipse cx="${100-14}" cy="140" rx="10" ry="14" fill="url(#skinDark)" opacity="0.3"/>
      <ellipse cx="${100+14}" cy="140" rx="10" ry="14" fill="url(#skinDark)" opacity="0.3"/>
      ${female ? `<line x1="${backX + 10}" y1="122" x2="${backX + backW - 10}" y2="122" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="122" x2="100" y2="132" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>` : ''}
    </g>
    <!-- Lower back / no abs visible -->
    <g class="body-part" data-muscle="abs" opacity="0.15">
      <rect x="${absX}" y="160" width="${absW}" height="40" rx="8" fill="#c8965e"/>
    </g>
    <!-- Shoulders -->
    <g class="body-part" data-muscle="shoulders">
      <ellipse cx="${shoulderLX}" cy="115" rx="${shoulderR}" ry="${shoulderRY}" fill="url(#skin)"/>
      <ellipse cx="${shoulderRX}" cy="115" rx="${shoulderR}" ry="${shoulderRY}" fill="url(#skin)"/>
      <!-- Rear delt detail -->
      <ellipse cx="${shoulderLX+2}" cy="118" rx="${shoulderR*0.5}" ry="${shoulderRY*0.4}" fill="url(#skinDark)" opacity="0.3"/>
      <ellipse cx="${shoulderRX-2}" cy="118" rx="${shoulderR*0.5}" ry="${shoulderRY*0.4}" fill="url(#skinDark)" opacity="0.3"/>
    </g>
    `;
  }

  const hairColor = '#4a3728';
  const hairDark = '#3d2e1f';
  const longHairFront = female ? `
      <path d="M74 72 Q72 95 68 120 Q66 130 70 128 Q76 110 78 95" fill="${hairColor}"/>
      <path d="M126 72 Q128 95 132 120 Q134 130 130 128 Q124 110 122 95" fill="${hairColor}"/>` : '';
  const longHairBack = female ? `
      <path d="M74 72 Q70 100 66 135 Q64 148 70 145 Q76 125 78 100" fill="${hairDark}"/>
      <path d="M126 72 Q130 100 134 135 Q136 148 130 145 Q124 125 122 100" fill="${hairDark}"/>
      <ellipse cx="100" cy="120" rx="24" ry="35" fill="${hairDark}" opacity="0.6"/>` : '';

  const headHTML = front ? `
    <!-- Head (front) -->
    <g class="head-group" style="transform-origin: 100px 95px;">
      ${longHairFront}
      <ellipse cx="100" cy="80" rx="24" ry="28" fill="url(#skin)"/>
      <path d="M76 72 Q80 50 100 48 Q120 50 124 72 Q122 58 100 55 Q78 58 76 72Z" fill="${hairColor}"/>
      ${female ? `<path d="M76 72 Q74 82 76 90" stroke="${hairColor}" stroke-width="5" fill="none"/>
      <path d="M124 72 Q126 82 124 90" stroke="${hairColor}" stroke-width="5" fill="none"/>` : ''}
      <ellipse cx="91" cy="78" rx="3" ry="3.5" fill="#2c1810"/>
      <ellipse cx="109" cy="78" rx="3" ry="3.5" fill="#2c1810"/>
      <circle class="eye-highlight eye-left" cx="92" cy="77" r="1.2" fill="#fff"/>
      <circle class="eye-highlight eye-right" cx="110" cy="77" r="1.2" fill="#fff"/>
      ${female ? `<ellipse cx="91" cy="77" rx="1.5" ry="2" fill="#2c1810" opacity="0.15"/>
      <ellipse cx="109" cy="77" rx="1.5" ry="2" fill="#2c1810" opacity="0.15"/>` : ''}
      <path d="M94 90 Q100 94 106 90" stroke="#c8965e" stroke-width="1.2" fill="none"/>
      ${renderHeadCosmeticsSVG(true)}
    </g>` : `
    <!-- Head (back) -->
    <g class="head-group" style="transform-origin: 100px 95px;">
      ${longHairBack}
      <ellipse cx="100" cy="80" rx="24" ry="28" fill="url(#skin)"/>
      <ellipse cx="100" cy="75" rx="23" ry="26" fill="${hairColor}"/>
      <path d="M76 72 Q80 50 100 48 Q120 50 124 72 Q122 58 100 55 Q78 58 76 72Z" fill="${hairDark}"/>
      ${female ? '' : `<ellipse cx="76" cy="82" rx="4" ry="6" fill="url(#skinDark)"/>
      <ellipse cx="124" cy="82" rx="4" ry="6" fill="url(#skinDark)"/>`}
      <rect x="90" y="98" width="20" height="12" rx="4" fill="url(#skinDark)"/>
      <line x1="100" y1="99" x2="100" y2="108" stroke="#c8965e" stroke-width="0.6" opacity="0.3"/>
      ${renderHeadCosmeticsSVG(false)}
    </g>`;

  const overall = calcOverallLevel(state.muscles);
  const pose = getCurrentPose(overall.level);

  const lShoulderCX = shoulderLX;
  const rShoulderCX = shoulderRX;
  const shY = 118;

  const lElbowX = armLX + armMainW / 2;
  const rElbowX = armRX + armMainW / 2;
  const elbowY = 170;

  c.innerHTML = `<svg viewBox="0 0 200 320" class="avatar-svg" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="skin" cx="50%" cy="30%"><stop offset="0%" stop-color="#f4c794"/><stop offset="100%" stop-color="#d4a06a"/></radialGradient>
      <radialGradient id="skinDark" cx="50%" cy="30%"><stop offset="0%" stop-color="#e8b980"/><stop offset="100%" stop-color="#c8965e"/></radialGradient>
    </defs>
    ${bodyHTML}
    <!-- Left arm group (posed) -->
    <g transform="rotate(${pose.lArm}, ${lShoulderCX}, ${shY})">
      ${front ? `
      <g class="body-part" data-muscle="biceps">
        <rect x="${armLX}" y="125" width="${armMainW}" height="45" rx="10" fill="url(#skin)"/>
      </g>
      <g class="body-part" data-muscle="triceps" opacity="0.35">
        <rect x="${armSecLX}" y="130" width="${armSecW}" height="38" rx="8" fill="#c8965e"/>
      </g>` : `
      <g class="body-part" data-muscle="triceps">
        <rect x="${armLX}" y="125" width="${armMainW}" height="45" rx="10" fill="url(#skin)"/>
      </g>
      <g class="body-part" data-muscle="biceps" opacity="0.35">
        <rect x="${armSecLX}" y="130" width="${armSecW}" height="38" rx="8" fill="#c8965e"/>
      </g>`}
      <g transform="rotate(${pose.lFore}, ${lElbowX}, ${elbowY})">
        <rect x="${forearmLX}" y="170" width="${forearmW}" height="38" rx="7" fill="url(#skinDark)"/>
        ${renderWristCosmeticSVG(forearmLX, forearmW)}
        <circle cx="${handLX}" cy="212" r="7" fill="url(#skinDark)"/>
      </g>
    </g>
    <!-- Right arm group (posed) -->
    <g transform="rotate(${pose.rArm}, ${rShoulderCX}, ${shY})">
      ${front ? `
      <g class="body-part" data-muscle="biceps">
        <rect x="${armRX}" y="125" width="${armMainW}" height="45" rx="10" fill="url(#skin)"/>
      </g>
      <g class="body-part" data-muscle="triceps" opacity="0.35">
        <rect x="${armSecRX}" y="130" width="${armSecW}" height="38" rx="8" fill="#c8965e"/>
      </g>` : `
      <g class="body-part" data-muscle="triceps">
        <rect x="${armRX}" y="125" width="${armMainW}" height="45" rx="10" fill="url(#skin)"/>
      </g>
      <g class="body-part" data-muscle="biceps" opacity="0.35">
        <rect x="${armSecRX}" y="130" width="${armSecW}" height="38" rx="8" fill="#c8965e"/>
      </g>`}
      <g transform="rotate(${pose.rFore}, ${rElbowX}, ${elbowY})">
        <rect x="${forearmRX}" y="170" width="${forearmW}" height="38" rx="7" fill="url(#skinDark)"/>
        ${renderWristCosmeticSVG(forearmRX, forearmW)}
        <circle cx="${handRX}" cy="212" r="7" fill="url(#skinDark)"/>
      </g>
    </g>
    <!-- Shorts -->
    <rect x="${shortsX}" y="200" width="${shortsW}" height="22" rx="6" fill="#1a1a2e"/>
    <line x1="100" y1="200" x2="100" y2="222" stroke="#2a2a4e" stroke-width="1"/>
    <!-- Neck -->
    <rect x="93" y="105" width="14" height="10" rx="4" fill="url(#skinDark)"/>
    ${headHTML}
    ${renderBodyCosmeticsSVG(front, forearmLX, forearmRX, forearmW, shortsX, shortsW, torsoX, torsoW)}
    ${pose.name !== 'Relaxed' ? `<text x="100" y="312" text-anchor="middle" font-size="9" fill="#9e7cff" font-family="Inter, sans-serif" opacity="0.7">${pose.name}</text>` : ''}
  </svg>`;
}

function renderHeadCosmeticsSVG(front) {
  if (!state.equippedCosmetics?.length) return '';
  const equipped = state.equippedCosmetics;
  let svg = '';

  if (front) {
    if (equipped.includes('headband_red')) {
      svg += `<rect x="78" y="64" width="44" height="6" rx="3" fill="#e53935"/>`;
    }
    if (equipped.includes('headband_blue')) {
      svg += `<rect x="78" y="64" width="44" height="6" rx="3" fill="#1e88e5"/>`;
    }
    if (equipped.includes('headband_gold')) {
      svg += `<rect x="78" y="64" width="44" height="6" rx="3" fill="#ffd700"/>`;
    }
    if (equipped.includes('crown')) {
      svg += `<polygon points="85,60 90,48 95,56 100,44 105,56 110,48 115,60" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>`;
    }
    if (equipped.includes('gold_chain')) {
      svg += `<path d="M90 105 Q100 115 110 105" stroke="#ffd700" stroke-width="1.5" fill="none"/>`;
      svg += `<circle cx="100" cy="114" r="3" fill="#ffd700"/>`;
    }
  } else {
    if (equipped.includes('headband_red')) {
      svg += `<rect x="80" y="64" width="40" height="6" rx="3" fill="#e53935"/>`;
    }
    if (equipped.includes('headband_blue')) {
      svg += `<rect x="80" y="64" width="40" height="6" rx="3" fill="#1e88e5"/>`;
    }
    if (equipped.includes('headband_gold')) {
      svg += `<rect x="80" y="64" width="40" height="6" rx="3" fill="#ffd700"/>`;
    }
    if (equipped.includes('crown')) {
      svg += `<polygon points="85,60 90,48 95,56 100,44 105,56 110,48 115,60" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>`;
    }
  }

  return svg;
}

function renderWristCosmeticSVG(fx, fw) {
  if (!state.equippedCosmetics?.length) return '';
  const equipped = state.equippedCosmetics;
  let svg = '';
  if (equipped.includes('wrist_wraps')) {
    svg += `<rect x="${fx}" y="168" width="${fw}" height="8" rx="3" fill="#e0e0e0"/>`;
  }
  if (equipped.includes('wrist_wraps_red')) {
    svg += `<rect x="${fx}" y="168" width="${fw}" height="8" rx="3" fill="#e53935"/>`;
  }
  if (equipped.includes('sweatbands')) {
    svg += `<rect x="${fx}" y="168" width="${fw}" height="8" rx="3" fill="#42a5f5"/>`;
    svg += `<line x1="${fx+2}" y1="172" x2="${fx+fw-2}" y2="172" stroke="#1e88e5" stroke-width="0.8"/>`;
  }
  return svg;
}

function renderBodyCosmeticsSVG(front, fLX, fRX, fW, shortsX, shortsW, torsoX, torsoW) {
  if (!state.equippedCosmetics?.length) return '';
  const equipped = state.equippedCosmetics;
  let svg = '';

  if (equipped.includes('tank_top') && front) {
    svg += `<rect x="${torsoX+2}" y="110" width="${torsoW-4}" height="48" rx="8" fill="#333366" opacity="0.85"/>`;
    svg += `<rect x="${torsoX+10}" y="108" width="${torsoW-20}" height="4" rx="2" fill="#333366"/>`;
  }
  if (equipped.includes('stringer') && front) {
    svg += `<path d="M${torsoX+8} 110 L${100-6} 108 L${100-6} 156 L${torsoX+4} 156 Z" fill="#1a1a3e" opacity="0.8"/>`;
    svg += `<path d="M${torsoX+torsoW-8} 110 L${100+6} 108 L${100+6} 156 L${torsoX+torsoW-4} 156 Z" fill="#1a1a3e" opacity="0.8"/>`;
  }

  if (equipped.includes('lifting_belt')) {
    svg += `<rect x="${shortsX-1}" y="197" width="${shortsW+2}" height="8" rx="2" fill="#5d4037" stroke="#3e2723" stroke-width="0.5"/>`;
    svg += `<rect x="97" y="198" width="6" height="6" rx="1" fill="#ffd700" opacity="0.8"/>`;
  }

  if (equipped.includes('knee_sleeves')) {
    const klx = shortsX + 4;
    const krx = shortsX + shortsW - 4 - 16;
    svg += `<rect x="${klx}" y="220" width="16" height="16" rx="4" fill="#333" opacity="0.7"/>`;
    svg += `<rect x="${krx}" y="220" width="16" height="16" rx="4" fill="#333" opacity="0.7"/>`;
  }

  return svg;
}

function formatSets(e) {
  if (Array.isArray(e.sets)) {
    return e.sets.map((s, i) => `${s.weight}×${s.reps}`).join(', ');
  }
  if (e.weight > 0) return `${e.weight}lbs × ${e.reps} × ${e.sets}`;
  return '';
}

function renderTodayLog() {
  const container = document.getElementById('today-log');
  const today = todayStr();
  const todayEntries = state.workoutLog.filter(e => e.date === today);
  if (!todayEntries.length) { container.innerHTML = ''; return; }
  container.innerHTML = todayEntries.map(e => `
    <div class="log-entry">
      <div>
        <div class="log-exercise">${e.exercise}</div>
        <div class="log-details">${formatSets(e)}${e.duration > 0 ? ` ${e.duration}min` : ''}</div>
      </div>
      <div class="log-xp">+${e.xp} XP</div>
    </div>`).join('');
}

function renderDailyQuest() {
  ensureDaily();
  const dp = state.dailyProgress;
  const q = DAILY_QUESTS[0];
  const prog = dp.groups.length;
  const done = prog >= q.target;
  document.getElementById('daily-quest-progress').textContent = `${prog}/${q.target}`;
  document.getElementById('daily-quest-check').innerHTML = done ? '<i class="ti ti-square-check"></i>' : '<i class="ti ti-square"></i>';

  const today = todayStr();
  document.getElementById('workout-count').textContent = state.workoutLog.filter(e => e.date === today).length;
}

async function renderRaidProgress() {
  const boss = getRaidBoss();
  let totalDamage = state.raidDamage;

  if (db) {
    try {
      const ws = getWeekStart();
      const snapshot = await db.collection('users').where('raidWeekStart', '==', ws).get();
      let groupDmg = 0;
      snapshot.forEach(doc => { groupDmg += doc.data().raidDamage || 0; });
      if (groupDmg > 0) totalDamage = groupDmg;
    } catch (e) {}
  }

  const pct = Math.min(100, (totalDamage / boss.hp) * 100);
  document.getElementById('raid-boss-name').textContent = `Defeat ${boss.name}`;
  document.getElementById('raid-percent').textContent = `${Math.floor(pct)}%`;
  document.getElementById('raid-bar-fill').style.width = `${pct}%`;
  document.getElementById('raid-damage').textContent = `${totalDamage.toLocaleString()} / ${boss.hp.toLocaleString()}`;
}

function renderAchievementsPreview() {
  const container = document.getElementById('achievements-preview');
  container.innerHTML = ACHIEVEMENTS.slice(0, 6).map(a => {
    const unlocked = state.achievements.includes(a.id);
    return `<div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}">
      <span class="badge-icon">${a.icon}</span>
      <span>${a.name}</span>
    </div>`;
  }).join('');
}

function populateMuscleGroupSelect() {}
function onMuscleGroupChange() {}

// ─── Workout History ───
function showHistoryTab(tab) {
  document.querySelectorAll('.ht-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.ht-tab[onclick*="${tab}"]`)?.classList.add('active');
  document.getElementById('history-personal').style.display = tab === 'personal' ? 'block' : 'none';
  document.getElementById('history-friends').style.display = tab === 'friends' ? 'block' : 'none';
  document.getElementById('history-prs').style.display = tab === 'prs' ? 'block' : 'none';
  if (tab === 'personal') renderWorkoutHistory();
  else if (tab === 'friends') renderFriendsFeed();
  else if (tab === 'prs') renderPRs();
}

function renderWorkoutHistory() {
  const container = document.getElementById('workout-history');
  const byDate = {};
  for (const e of [...state.workoutLog].reverse()) {
    if (!byDate[e.date]) byDate[e.date] = [];
    byDate[e.date].push(e);
  }
  if (!Object.keys(byDate).length) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No workouts logged yet.</p>';
    return;
  }
  container.innerHTML = Object.entries(byDate).map(([date, entries]) => `
    <div class="history-day card">
      <div class="history-date">${formatDate(date + 'T12:00:00')}</div>
      ${entries.map(e => `<div class="history-entry">
        <span>${e.exercise} — ${formatSets(e)}${e.duration > 0 ? ` ${e.duration}min` : ''}</span>
        <span style="color:var(--xp-green)">+${e.xp} XP</span>
      </div>`).join('')}
    </div>`).join('');
}

// ─── Personal Records ───
function renderPRs() {
  const container = document.getElementById('pr-list');
  if (!state.workoutLog.length) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No workouts logged yet. Hit the gym!</p>';
    return;
  }

  const prs = {};
  for (const entry of state.workoutLog) {
    if (entry.muscle === 'rest') continue;
    const key = entry.exercise;
    if (!prs[key]) prs[key] = { muscle: entry.muscle, maxWeight: 0, maxReps: 0, maxDuration: 0, date: '' };

    if (Array.isArray(entry.sets)) {
      for (const s of entry.sets) {
        if (s.weight > prs[key].maxWeight) {
          prs[key].maxWeight = s.weight;
          prs[key].maxReps = s.reps;
          prs[key].date = entry.date;
        } else if (s.weight === prs[key].maxWeight && s.reps > prs[key].maxReps) {
          prs[key].maxReps = s.reps;
          prs[key].date = entry.date;
        }
      }
    } else if (entry.weight > 0) {
      if (entry.weight > prs[key].maxWeight) {
        prs[key].maxWeight = entry.weight;
        prs[key].maxReps = entry.reps;
        prs[key].date = entry.date;
      }
    }

    if (entry.duration > 0 && entry.duration > prs[key].maxDuration) {
      prs[key].maxDuration = entry.duration;
      if (!prs[key].maxWeight) prs[key].date = entry.date;
    }
  }

  const byMuscle = {};
  for (const [exercise, data] of Object.entries(prs)) {
    const mk = data.muscle;
    const groupName = MUSCLES[mk]?.name || mk;
    if (!byMuscle[groupName]) byMuscle[groupName] = { color: MUSCLES[mk]?.color || '#888', exercises: [] };
    byMuscle[groupName].exercises.push({ exercise, ...data });
  }

  container.innerHTML = Object.entries(byMuscle).map(([group, { color, exercises }]) => `
    <div class="pr-group card">
      <div class="pr-group-header">
        <span class="pr-group-dot" style="background:${color}"></span>
        <span class="pr-group-name">${group}</span>
      </div>
      ${exercises.map(e => {
        const isCardio = e.muscle === 'cardio';
        const val = isCardio
          ? (e.maxDuration > 0 ? `${e.maxDuration} min` : '—')
          : (e.maxWeight > 0 ? `${e.maxWeight} lbs × ${e.maxReps}` : (e.maxDuration > 0 ? `${e.maxDuration} min` : '—'));
        return `<div class="pr-entry">
          <span class="pr-exercise">${e.exercise}</span>
          <span class="pr-value">${val}</span>
        </div>`;
      }).join('')}
    </div>`).join('');
}

// ─── Friends Feed (Firebase-powered) ───
async function renderFriendsFeed() {
  const container = document.getElementById('friends-feed');

  if (!db) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">Connect Firebase to see friend activity.</p>';
    return;
  }

  try {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:16px">Loading...</p>';
    const snapshot = await db.collection('users')
      .orderBy('_lastActive', 'desc')
      .limit(20)
      .get();

    const activities = [];
    snapshot.forEach(doc => {
      if (doc.id === currentUser) return;
      const d = doc.data();
      if (!d.workoutLog || !d.workoutLog.length) return;
      const recent = d.workoutLog.filter(e => {
        const daysAgo = (Date.now() - new Date(e.date).getTime()) / 86400000;
        return daysAgo < 7;
      });
      recent.forEach(e => {
        activities.push({
          name: d._leaderboardName || doc.id,
          initials: (d._leaderboardName || doc.id).slice(0, 2).toUpperCase(),
          date: e.date,
          muscle: e.muscle,
          xp: e.xp,
        });
      });
    });

    if (!activities.length) {
      container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No friend activity this week.</p>';
      return;
    }

    const byDate = {};
    activities.forEach(a => {
      if (!byDate[a.date]) byDate[a.date] = [];
      byDate[a.date].push(a);
    });

    const colors = ['#f44336','#9c27b0','#4caf50','#ff9800','#2196f3','#e91e63','#00bcd4','#ff5722'];
    container.innerHTML = Object.entries(byDate).sort((a,b) => b[0].localeCompare(a[0])).map(([date, acts]) => `
      <div class="friend-day">
        <div class="friend-date">${formatDate(date + 'T12:00:00')}</div>
        ${acts.map((a, i) => `
          <div class="friend-activity">
            <div class="friend-avatar" style="background:${colors[i % colors.length]}22;color:${colors[i % colors.length]}">${a.initials}</div>
            <div class="friend-activity-info">
              <div class="friend-name">${a.name}</div>
              <div class="friend-summary">Trained ${MUSCLES[a.muscle]?.name || a.muscle}</div>
            </div>
            <div class="friend-xp">+${a.xp} XP</div>
          </div>`).join('')}
      </div>`).join('');
  } catch (e) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">Could not load friend activity.</p>';
  }
}

// ─── Quests Tab ───
async function renderQuestsTab() {
  ensureDaily();
  const dp = state.dailyProgress;
  const qList = document.getElementById('daily-quests-list');
  qList.innerHTML = DAILY_QUESTS.map(q => {
    let prog = 0;
    if (q.type === 'groups') prog = dp.groups.length;
    else if (q.type === 'sets') prog = dp.sets;
    else if (q.type === 'xp') prog = dp.xp;
    const done = prog >= q.target;
    return `<div class="quest-list-item ${done ? 'completed' : ''}">
      <div class="quest-info">
        <h4>${done ? '<i class="ti ti-square-check"></i>' : '<i class="ti ti-square"></i>'} ${q.text}</h4>
        <p>${prog}/${q.target}</p>
      </div>
      <div class="quest-reward"><i class="ti ti-coin"></i> ${q.reward}</div>
    </div>`;
  }).join('');

  const boss = getRaidBoss();
  let raidTotalDmg = state.raidDamage;
  if (db) {
    try {
      const ws = getWeekStart();
      const snapshot = await db.collection('users').where('raidWeekStart', '==', ws).get();
      let groupDmg = 0;
      snapshot.forEach(doc => { groupDmg += doc.data().raidDamage || 0; });
      if (groupDmg > 0) raidTotalDmg = groupDmg;
    } catch (e) {}
  }
  const raidPct = Math.min(100, (raidTotalDmg / boss.hp) * 100);
  document.getElementById('raid-detail').innerHTML = `
    <div class="raid-boss-sprite"><img src="${boss.img}" alt="${boss.name}" onerror="this.style.display='none'"></div>
    <h3>${boss.name}</h3>
    <div class="raid-bar" style="max-width:280px;margin:8px auto">
      <div class="raid-bar-fill" style="width:${raidPct}%"></div>
    </div>
    <p class="raid-boss-hp">${raidTotalDmg.toLocaleString()} / ${boss.hp.toLocaleString()} HP</p>
    <p class="muted">Party raid — everyone's workouts deal damage! Resets weekly.</p>
    ${raidPct >= 100 ? '<p style="color:var(--gold);font-weight:700;margin-top:8px"><i class="ti ti-trophy"></i> BOSS DEFEATED! +100 Gold</p>' : ''}`;

  const aGrid = document.getElementById('achievements-list');
  aGrid.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = state.achievements.includes(a.id);
    return `<div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}">
      <span class="badge-icon">${a.icon}</span>
      <span>${a.name}</span>
    </div>`;
  }).join('');
}

// ─── Leaderboard ───
async function renderLeaderboard(type) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.lb-tab[onclick*="${type}"]`)?.classList.add('active');

  const container = document.getElementById('leaderboard-list');

  if (type === 'fight') {
    await renderFightLeaderboard(container);
    return;
  }

  const overall = calcOverallLevel(state.muscles);
  const myXP = overall.level * 1000 + overall.xp;

  let players = null;

  if (db) {
    try {
      container.innerHTML = '<p class="muted" style="text-align:center;padding:16px">Loading...</p>';

      let query;
      if (type === 'weekly') {
        const weekStart = getWeekStart();
        query = db.collection('users')
          .where('_lastActive', '>=', weekStart)
          .orderBy('_lastActive')
          .orderBy('_leaderboardXP', 'desc')
          .limit(20);
      } else {
        query = db.collection('users')
          .orderBy('_leaderboardXP', 'desc')
          .limit(20);
      }

      const snapshot = await query.get();
      players = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        players.push({
          name: d._leaderboardName || doc.id,
          xp: d._leaderboardXP || 0,
          level: d._leaderboardLevel || 1,
          you: doc.id === currentUser,
        });
      });

      if (type === 'weekly') {
        players.sort((a, b) => b.xp - a.xp);
      }

      const hasMe = players.some(p => p.you);
      if (!hasMe) {
        players.push({ name: state.name, xp: myXP, level: overall.level, you: true });
        players.sort((a, b) => b.xp - a.xp);
      }
    } catch (e) {
      players = null;
    }
  }

  if (!players) {
    players = [
      { name: state.name, xp: myXP, you: true },
    ];
  }

  container.innerHTML = players.map((p, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="lb-entry ${p.you ? 'you' : ''}">
      <span class="lb-rank ${rankClass}">#${i + 1}</span>
      <span class="lb-name">${p.name}${p.you ? ' (You)' : ''}</span>
      <span class="lb-xp">${p.xp.toLocaleString()} XP</span>
    </div>`;
  }).join('');
}

async function renderFightLeaderboard(container) {
  let fighters = null;

  const myFight = JSON.parse(localStorage.getItem('musclequest_fight') || '{}');
  const myKOs = myFight.totalKOs || 0;
  const myHighest = myFight.highestBoss || 0;
  const myStreak = myFight.streak || 0;

  if (db) {
    try {
      container.innerHTML = '<p class="muted" style="text-align:center;padding:16px">Loading...</p>';
      const snapshot = await db.collection('users')
        .orderBy('_fightKOs', 'desc')
        .limit(20)
        .get();
      fighters = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if ((d._fightKOs || 0) === 0) return;
        fighters.push({
          name: d._leaderboardName || doc.id,
          kos: d._fightKOs || 0,
          highest: d._fightHighest || 0,
          streak: d._fightStreak || 0,
          you: doc.id === currentUser,
        });
      });
      const hasMe = fighters.some(f => f.you);
      if (!hasMe) {
        fighters.push({ name: state.name, kos: myKOs, highest: myHighest, streak: myStreak, you: true });
      }
      fighters.sort((a, b) => b.kos - a.kos || b.highest - a.highest);
    } catch (e) {
      fighters = null;
    }
  }

  if (!fighters) {
    fighters = [
      { name: state.name, kos: myKOs, highest: myHighest, streak: myStreak, you: true },
    ];
  }

  if (fighters.length === 0 || (fighters.length === 1 && fighters[0].kos === 0)) {
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No fights recorded yet. Hit the ring!</p>';
    return;
  }

  container.innerHTML = fighters.map((f, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="lb-entry ${f.you ? 'you' : ''}">
      <span class="lb-rank ${rankClass}">#${i + 1}</span>
      <span class="lb-name">${f.name}${f.you ? ' (You)' : ''}</span>
      <span class="lb-xp" style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;line-height:1.2">
        <span>${f.kos} KOs</span>
        <span style="font-size:10px;color:var(--text-muted)">Best: Lv.${f.highest} | Streak: ${f.streak}</span>
      </span>
    </div>`;
  }).join('');
}

function showLeaderboard(type) { renderLeaderboard(type); }

// ─── Modals ───
function showLevelUp(text, rewards) {
  document.getElementById('level-up-text').textContent = text;
  document.getElementById('level-up-rewards').textContent = rewards || '';
  document.getElementById('level-up-modal').classList.remove('hidden');
}
function closeLevelUp() { document.getElementById('level-up-modal').classList.add('hidden'); }

function showAchievement(a) {
  document.getElementById('achievement-icon').innerHTML = a.icon;
  document.getElementById('achievement-text').textContent = `${a.name} — ${a.desc}`;
  setTimeout(() => document.getElementById('achievement-modal').classList.remove('hidden'), 500);
}
function closeAchievement() { document.getElementById('achievement-modal').classList.add('hidden'); }

function toast(msg, type) {
  const el = document.createElement('div');
  el.className = `toast ${type || ''}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

// ─── SFX (Web Audio API) ───
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSFX(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    if (type === 'submit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    if (type === 'levelup') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.1, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.15);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.15);
      });
    }

    if (type === 'streak') {
      [392, 523, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.2);
      });
    }
  } catch (e) {}
}

// ─── Settings ───
function updateName() {
  state.name = document.getElementById('player-name-input').value || 'Hero';
  saveWithPin();
}

function updateGender() {
  state.gender = document.getElementById('gender-select').value;
  saveWithPin();
  renderAvatar();
}

function resetProgress() {
  if (confirm('Are you sure? This will delete all progress!')) {
    const gender = state.gender;
    state = defaultState();
    state.gender = gender;
    state.name = currentUser || 'Hero';
    saveWithPin();
    renderDashboard();
    toast('Progress reset');
  }
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'musclequest_save.json';
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      state = { ...defaultState(), ...JSON.parse(e.target.result) };
      saveWithPin();
      renderDashboard();
      toast('Data imported!');
    } catch { toast('Invalid file!'); }
  };
  reader.readAsText(file);
}

// ─── Cosmetics ───
function getUnlockedCosmetics() {
  return COSMETICS.filter(c => state.achievements.includes(c.unlock));
}

function toggleCosmetic(id) {
  const cosmetic = COSMETICS.find(c => c.id === id);
  if (!cosmetic || !state.achievements.includes(cosmetic.unlock)) return;

  if (!state.equippedCosmetics) state.equippedCosmetics = [];

  const equipped = state.equippedCosmetics.includes(id);
  if (equipped) {
    state.equippedCosmetics = state.equippedCosmetics.filter(c => c !== id);
  } else {
    state.equippedCosmetics = state.equippedCosmetics.filter(c => {
      const other = COSMETICS.find(co => co.id === c);
      return other && other.type !== cosmetic.type;
    });
    state.equippedCosmetics.push(id);
  }
  saveWithPin();
  renderCosmeticsList();
  renderAvatar();
}

function renderCosmeticsList() {
  const container = document.getElementById('cosmetics-list');
  if (!container) return;
  container.innerHTML = COSMETICS.map(c => {
    const unlocked = state.achievements.includes(c.unlock);
    const equipped = state.equippedCosmetics?.includes(c.id);
    return `<div class="cosmetic-item ${unlocked ? (equipped ? 'equipped' : '') : 'locked'}"
      onclick="${unlocked ? `MQ.toggleCosmetic('${c.id}')` : ''}">
      <span class="cosmetic-icon">${c.icon}</span>
      <span class="cosmetic-name">${c.name}</span>
      <span class="cosmetic-req">${unlocked ? (equipped ? 'Equipped' : 'Tap to equip') : c.desc}</span>
    </div>`;
  }).join('');
}

// ─── Eye & Head Tracking ───
document.addEventListener('mousemove', (e) => {
  const container = document.getElementById('avatar-container');
  if (!container) return;
  const svg = container.querySelector('.avatar-svg');
  if (!svg) return;
  const rect = container.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width;
  const relY = (e.clientY - rect.top) / rect.height;

  const eyeMax = 1.8;
  const eyeDx = (relX - 0.5) * 2 * eyeMax;
  const eyeDy = Math.max(-eyeMax, Math.min(eyeMax, (relY - 0.25) * 2 * eyeMax));

  const leftEye = svg.querySelector('.eye-left');
  const rightEye = svg.querySelector('.eye-right');
  if (leftEye) { leftEye.setAttribute('cx', 92 + eyeDx); leftEye.setAttribute('cy', 77 + eyeDy); }
  if (rightEye) { rightEye.setAttribute('cx', 110 + eyeDx); rightEye.setAttribute('cy', 77 + eyeDy); }

  const headGroup = svg.querySelector('.head-group');
  if (headGroup) {
    const headDx = Math.max(-2.5, Math.min(2.5, (relX - 0.5) * 5));
    const headDy = Math.max(-1.5, Math.min(1.5, (relY - 0.25) * 3));
    const headTilt = Math.max(-3, Math.min(3, (relX - 0.5) * 6));
    headGroup.setAttribute('transform', `translate(${headDx}, ${headDy}) rotate(${headTilt}, 100, 95)`);
  }
});

document.addEventListener('touchmove', (e) => {
  if (!e.touches.length) return;
  const touch = e.touches[0];
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY }));
});

// ─── Init ───
initFirebase();

const hasUser = localStorage.getItem('musclequest_current_user');
if (hasUser) {
  autoLogin();
} else {
  document.getElementById('login-screen').classList.remove('hidden');
}

return {
  showTab, submitWorkout, onMuscleGroupChange, showLeaderboard, toggleAvatarView,
  closeLevelUp, closeAchievement, updateName, updateGender, resetProgress,
  exportData, importData, addExerciseRow, removeExerciseRow,
  onEntryMuscleChange, showHistoryTab, changeSetCount,
  login, logout, toggleCosmetic, selectPose, toggleSettings,
};

})();
