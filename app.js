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
let healthSync = null; // today's Apple Health data from iOS Shortcut

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
  { id: 'medal_bronze',    name: 'Bronze Medal',   icon: '<i class="ti ti-medal" style="color:#cd7f32"></i>', type: 'neck',  unlock: 'bb_contender',   desc: 'Win 1 bodybuilding show' },
  { id: 'medal_silver',    name: 'Silver Medal',   icon: '<i class="ti ti-medal" style="color:#c0c0c0"></i>', type: 'neck',  unlock: 'bb_regular',     desc: 'Win 5 bodybuilding shows' },
  { id: 'medal_gold',      name: 'Gold Medal',     icon: '<i class="ti ti-medal" style="color:#ffd700"></i>', type: 'neck',  unlock: 'bb_champion',    desc: 'Win 10 bodybuilding shows' },
  { id: 'laurel_wreath',   name: 'Laurel Wreath',  icon: '🏅', type: 'head',  unlock: 'rank1_weekly',  desc: '#1 on the weekly board' },
  { id: 'iron_crown',      name: 'Iron Crown',     icon: '👑', type: 'head',  unlock: 'rank1_monthly', desc: '#1 on the monthly board' },
  { id: 'legend_chain',    name: 'Legend Chain',   icon: '⛓️', type: 'neck',  unlock: 'rank1_yearly',  desc: '#1 on the yearly board' },
  // Purchasable clothing (from FORGED™ Apparel)
  { id: 'forged_tank',     name: 'FORGED™ Tank',       icon: '👕', type: 'torso', price: 180, desc: 'Performance training tank' },
  { id: 'forged_joggers',  name: 'FORGED™ Joggers',    icon: '👖', type: 'legs',  price: 240, desc: 'Tapered jogger pants' },
  { id: 'lifting_gloves',  name: 'Lifting Gloves',     icon: '🧤', type: 'wrist', price: 80,  desc: 'Pro grip gloves' },
  { id: 'compression_set', name: 'Compression Set',    icon: '🩱', type: 'legs',  price: 150, desc: 'Full leg compression' },
  { id: 'do_rag',          name: 'Do-Rag',             icon: '🧣', type: 'head',  price: 60,  desc: 'Keep it clean in the gym' },
  { id: 'flip_flops',     name: 'Locker Room Slides', icon: '🩴', type: 'feet',  price: 35,  desc: 'Essential post-workout gear' },
  { id: 'borat_suit',     name: 'The Mankini',        icon: '🍇', type: 'body',  price: 999, desc: 'Very nice. Great success.' },
];

// ─── Skin Tones ───
const SKIN_TONES = [
  { name:'Fair',   s1:'#fce4c4', s2:'#e8c890', s3:'#d4a870', s4:'#c09060' },
  { name:'Medium', s1:'#f4c794', s2:'#d4a06a', s3:'#e8b980', s4:'#c8965e' }, // default
  { name:'Tan',    s1:'#d4956a', s2:'#a8703a', s3:'#c0804a', s4:'#985828' },
  { name:'Deep',   s1:'#9b6b45', s2:'#6b3e22', s3:'#8b5a30', s4:'#4b2810' },
];

const HAIR_COLORS = [
  { name:'Brown',  c1:'#4a3728', c2:'#3d2e1f' },
  { name:'Black',  c1:'#1a1a1a', c2:'#0d0d0d' },
  { name:'Blonde', c1:'#c8a84b', c2:'#a07830' },
  { name:'Grey',   c1:'#9a9a9a', c2:'#6e6e6e' },
  { name:'Red',    c1:'#8b2500', c2:'#5a1500' },
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
  { id: 'bb_showtime',   icon: '🎪',                                    name: 'Showtime',        desc: 'Enter your first bodybuilding show', check: s => (s._bbComps || 0) >= 1 },
  { id: 'bb_contender',  icon: '🥉',                                    name: 'Contender',       desc: 'Win your first bodybuilding show', check: s => (s._bbWins || 0) >= 1 },
  { id: 'bb_regular',    icon: '🥈',                                    name: 'Regular Competitor', desc: 'Win 5 bodybuilding shows', check: s => (s._bbWins || 0) >= 5 },
  { id: 'bb_champion',   icon: '🥇',                                    name: 'Champion Bodybuilder', desc: 'Win 10 bodybuilding shows', check: s => (s._bbWins || 0) >= 10 },
  { id: 'bb_flawless',   icon: '✨',                                    name: 'Perfect Routine', desc: 'Win a bodybuilding show with zero strikes', check: s => (s._bbFlawless || 0) >= 1 },
  { id: 'rank1_weekly',  icon: '🏅',                                    name: 'Weekly Champion', desc: 'Reach #1 on the weekly leaderboard', check: s => (s._rank1Weekly || 0) >= 1 },
  { id: 'rank1_monthly', icon: '🏆',                                    name: 'Monthly King',    desc: 'Reach #1 on the monthly leaderboard', check: s => (s._rank1Monthly || 0) >= 1 },
  { id: 'rank1_yearly',  icon: '👑',                                    name: 'Legend of the Year', desc: 'Reach #1 on the yearly leaderboard', check: s => (s._rank1Yearly || 0) >= 1 },
];

// Progressive weekly challenge ladder — permanent progression, each defeat unlocks the next
const WEEKLY_CHALLENGES = [
  { id: 'whelp',    name: 'Dragon Whelp',     hp: 7000,   reward: 50,   icon: '🐉', color: '#4caf50', desc: 'A young dragon. Deal 7,000 XP to defeat it.' },
  { id: 'drake',    name: 'Fire Drake',        hp: 9000,   reward: 75,   icon: '🔥', color: '#ff9800', desc: 'Emboldened by fire. Deal 9,000 XP.' },
  { id: 'wyvern',   name: 'Cave Wyvern',       hp: 12000,  reward: 100,  icon: '🦎', color: '#2196f3', desc: 'A territorial beast. Deal 12,000 XP.' },
  { id: 'king',     name: 'Dragon King',       hp: 16000,  reward: 150,  icon: '👑', color: '#9c27b0', desc: 'Ruler of the skies. Deal 16,000 XP.' },
  { id: 'ancient',  name: 'Ancient Dragon',    hp: 20000,  reward: 200,  icon: '💎', color: '#00bcd4', desc: 'Older than memory. Deal 20,000 XP.' },
  { id: 'elder',    name: 'Elder Wyrm',        hp: 26000,  reward: 300,  icon: '⚡', color: '#ffd700', desc: 'A living catastrophe. Deal 26,000 XP.' },
  { id: 'godslayer', name: 'Godslayer',        hp: 32000,  reward: 500,  icon: '🌟', color: '#ff4444', desc: 'The final challenge. Deal 32,000 XP.' },
];

// Monthly group raid bosses — party activity, huge HP pools
const MONTHLY_BOSSES = [
  { name: 'Goblin War Chief',   hp: 50000,  reward: 200,  icon: '👺' },
  { name: 'Stone Titan',        hp: 80000,  reward: 350,  icon: '🗿' },
  { name: 'The Iron Ogre',      hp: 120000, reward: 500,  icon: '👹' },
  { name: 'Shadow Colossus',    hp: 180000, reward: 750,  icon: '🌑' },
  { name: 'Ancient Terror',     hp: 250000, reward: 1000, icon: '💀' },
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
    purchasedCosmetics: [],
    hair: '',
    equipment: {},
    activeBuffs: [],
    workoutLog: [],
    dailyProgress: { date: null, groups: [], sets: 0, xp: 0, workouts: 0 },
    weeklyChallengeLevel: 0,
    weeklyChallengeDamage: 0,
    weeklyStart: null,
    monthlyDamage: 0,
    monthlyBossIndex: 0,
    monthlyStart: null,
    weeklyXP: 0, weeklyXPStart: null,
    monthlyXP: 0, monthlyXPStart: null,
    yearlyXP: 0, yearlyXPStart: null,
    skinTone: 1,
    hairColor: 0,
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
  if (!user || !pin) return;

  // Always load localStorage immediately — fast, always has latest data
  load();
  currentUser = user;
  document.getElementById('login-screen').classList.add('hidden');
  addExerciseRow();
  renderDashboard();

  // Background Firebase sync — merge if remote has more progress (cross-device)
  if (!db) return;
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(), 5000));
    const doc = await Promise.race([db.collection('users').doc(user).get(), timeoutPromise]);
    if (!doc.exists) { saveWithPin(); return; }
    const data = doc.data();
    if (data._pin && data._pin !== pin) { logout(); return; }
    const remoteState = { ...defaultState(), ...data };
    delete remoteState._pin;
    for (const key of Object.keys(MUSCLES)) {
      if (!remoteState.muscles[key]) remoteState.muscles[key] = { level: 1, xp: 0, scale: 1.0 };
    }
    if (!remoteState.equippedCosmetics) remoteState.equippedCosmetics = [];
    if (!remoteState.activeBuffs) remoteState.activeBuffs = [];
    // Use whichever has more total workouts (remote wins for cross-device, local wins otherwise)
    if ((remoteState.totalWorkouts || 0) > (state.totalWorkouts || 0)) {
      state = remoteState;
      localStorage.setItem('musclequest_save', JSON.stringify(state));
      renderDashboard();
    } else {
      saveWithPin(); // push local ahead to Firebase
    }
  } catch(e) { /* offline — localStorage already loaded */ }
}

function syncStateFromStorage() {
  const raw = localStorage.getItem('musclequest_save');
  if (raw) { try { state = { ...defaultState(), ...JSON.parse(raw) }; } catch(e) {} }
  saveWithPin();
}

function saveWithPin() {
  const pin = localStorage.getItem('musclequest_current_pin');
  const overall = calcOverallLevel(state.muscles);
  const leaderboardData = {
    _leaderboardXP: overall.level * 1000 + overall.xp,
    _leaderboardLevel: overall.level,
    _leaderboardName: state.name,
    _lastActive: todayStr(),
    _gender: state.gender || 'male',
    _cosmetics: state.equippedCosmetics || [],
    _hair: state.hair || '',
    _skinTone: state.skinTone ?? 1,
    _hairColor: state.hairColor ?? 0,
    _weeklyXP: state.weeklyXP || 0,
    _weeklyXPStart: state.weeklyXPStart || '',
    _monthlyXP: state.monthlyXP || 0,
    _monthlyXPStart: state.monthlyXPStart || '',
    _yearlyXP: state.yearlyXP || 0,
    _yearlyXPStart: state.yearlyXPStart || '',
  };
  localStorage.setItem('musclequest_save', JSON.stringify(state));
  if (currentUser && !db) {
    localStorage.setItem(`musclequest_${currentUser}`, JSON.stringify({ ...state, ...leaderboardData, _pin: pin }));
  }
  if (db && currentUser) {
    db.collection('users').doc(currentUser).set({ ...state, ...leaderboardData, _pin: pin }, { merge: true }).catch(() => {});
  }
}

// ─── Apple Health Sync ───
async function refreshHealthSync() {
  const btn = document.querySelector('[onclick="MQ.refreshHealthSync()"]');
  if (btn) { btn.style.animation = 'spin 0.6s linear'; setTimeout(() => btn.style.animation = '', 600); }
  await loadHealthSync();
  toast('Health data refreshed', 'info');
}

async function loadHealthSync() {
  if (!db || !currentUser) return;
  try {
    const doc = await db.collection('healthSync').doc(currentUser).get({ source: 'server' });
    if (doc.exists) {
      healthSync = doc.data();
      renderHealthPanel();
    }
  } catch(e) { console.warn('healthSync read error:', e); }
}

async function checkHealthWriteTest() {
  const url = `https://firestore.googleapis.com/v1/projects/musclequest-c5052/databases/(default)/documents/healthSync/${currentUser}?key=AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (res.ok && json.fields) {
      toast('✅ Data found in Firestore — reloading', 'success');
      await loadHealthSync();
    } else if (res.status === 404) {
      toast('❌ No data in Firestore yet — Shortcut write may be blocked', 'error');
    } else {
      toast(`⚠️ Firestore returned ${res.status}`, 'error');
    }
  } catch(e) {
    toast('❌ Could not reach Firestore', 'error');
  }
}

function renderHealthPanel() {
  const el = document.getElementById('health-panel');
  if (!el) return;

  if (!healthSync) {
    el.innerHTML = `<div class="health-empty">
      <i class="ti ti-heartbeat-off" style="font-size:28px;color:var(--text-muted)"></i>
      <p style="color:var(--text-muted);font-size:12px;margin-top:6px">No health data yet.<br>Set up the iOS Shortcut in <strong>Settings → Health Sync</strong>.</p>
    </div>`;
    return;
  }

  const today = todayStr();
  const fresh = healthSync.date === today;
  const steps = Math.round(healthSync.steps || 0);
  const protein = Math.round(healthSync.protein || 0);
  const activeCal = Math.round(healthSync.activeCalories || 0);
  const sleep = parseFloat(healthSync.sleepHours || 0).toFixed(1);
  const exMins = Math.round(healthSync.exerciseMinutes || 0);

  const row = (icon, label, val, goal, unit) => {
    const hit = parseFloat(val) >= goal;
    return `<div class="health-row">
      <span class="health-ico"><i class="ti ti-${icon}"></i></span>
      <span class="health-lbl">${label}</span>
      <span class="health-val ${hit ? 'health-hit' : ''}">${val}${unit}</span>
      <span class="health-goal-lbl">${hit ? '✓' : `/${goal}${unit}`}</span>
    </div>`;
  };

  el.innerHTML = `<div class="health-card ${fresh ? '' : 'health-stale'}">
    <div class="health-header">
      <span><i class="ti ti-apple"></i> Apple Health</span>
      <span class="health-date">${fresh ? 'Today' : 'Last: ' + healthSync.date}</span>
    </div>
    ${row('shoe', 'Steps', steps.toLocaleString(), '8,000', '')}
    ${row('meat', 'Protein', protein, 100, 'g')}
    ${row('flame', 'Active Cal', activeCal, 300, '')}
    ${row('run', 'Exercise', exMins, 30, 'min')}
    ${row('moon', 'Sleep', sleep, 7, 'h')}
    ${fresh ? `<div class="health-bonuses">
      ${steps >= 8000 ? '<span class="hbonus">👟 +10g</span>' : ''}
      ${protein >= 100 ? '<span class="hbonus">🥩 +15% XP</span>' : ''}
      ${activeCal >= 300 ? '<span class="hbonus">🔥 +10% Cardio</span>' : ''}
      ${exMins >= 30 ? '<span class="hbonus">🏃 +15g</span>' : ''}
      ${parseFloat(sleep) >= 7 ? '<span class="hbonus">🌙 Rest +100 XP</span>' : ''}
    </div>` : '<p class="health-stale-note">Sync today for bonuses</p>'}
  </div>`;
}

function getHealthSyncSetupHTML() {
  const lastSync = healthSync ? `<p style="color:var(--text-muted);font-size:12px;text-align:center;margin:8px 0 0">Last logged: <strong>${healthSync.date}</strong> ${healthSync.date === todayStr() ? '✓ Today' : ''}</p>` : '';
  return `<div class="health-setup">
    <p style="color:var(--text-muted);font-size:13px;margin:0 0 14px">Log today's stats to earn daily bonuses. Check your Health app or fitness tracker for these numbers.</p>
    <div class="health-form">
      <div class="health-field">
        <label class="health-field-label">👟 Steps</label>
        <input type="number" id="hs-steps" class="health-input" inputmode="numeric" value="${healthSync?.steps || 0}"/>
      </div>
      <div class="health-field">
        <label class="health-field-label">🥩 Protein (g)</label>
        <input type="number" id="hs-protein" class="health-input" inputmode="numeric" value="${healthSync?.protein || 0}"/>
      </div>
      <div class="health-field">
        <label class="health-field-label">🔥 Active Calories</label>
        <input type="number" id="hs-cal" class="health-input" inputmode="numeric" value="${healthSync?.activeCalories || 0}"/>
      </div>
      <div class="health-field">
        <label class="health-field-label">🌙 Sleep (hours)</label>
        <input type="number" id="hs-sleep" class="health-input" inputmode="decimal" step="0.1" value="${healthSync?.sleepHours || 0}"/>
      </div>
      <div class="health-field">
        <label class="health-field-label">🏃 Exercise (mins)</label>
        <input type="number" id="hs-exmins" class="health-input" inputmode="numeric" value="${healthSync?.exerciseMinutes || 0}"/>
      </div>
    </div>
    <button class="btn-primary" style="width:100%;margin-top:14px" onclick="MQ.submitHealthForm()">Submit Today's Stats</button>
    ${lastSync}
    <div class="health-bonuses-info" style="margin-top:14px">
      <strong>Daily bonuses:</strong>
      <div>👟 8,000+ steps → +10 gold</div>
      <div>🥩 100g+ protein → +15% muscle XP</div>
      <div>🔥 300+ active cal → +10% cardio XP</div>
      <div>🏃 30+ exercise min → +15 gold</div>
      <div>🌙 7h+ sleep → Rest days give +100 XP</div>
    </div>
    <button class="btn-secondary" style="width:100%;margin-top:16px;font-size:13px" onclick="MQ.toggleShortcutGuide()">
      ⚡ Automate with iPhone Shortcuts
    </button>
    <div id="shortcut-guide" style="display:none;margin-top:12px">
      <p style="color:var(--text-muted);font-size:12px;margin:0 0 10px">Build a Shortcut that syncs automatically every day — no manual entry needed.</p>
      <div class="health-setup-steps">
        <div class="setup-step"><span class="step-num">1</span><span>Open the <strong>Shortcuts</strong> app → tap <strong>+</strong> → <strong>Add Action</strong></span></div>
        <div class="setup-step"><span class="step-num">2</span><span>Search <strong>"Find Health Samples"</strong> — add it 4 times, once each for:<br><em>Step Count, Active Energy Burned, Dietary Protein, Sleep Analysis</em></span></div>
        <div class="setup-step"><span class="step-num">3</span><span>After each one, add <strong>"Calculate Statistics"</strong> → set to <strong>Sum</strong>. Tap the output label to rename them: <em>myStepsSum, myActiveCal, myProtein, mySleepRaw</em></span></div>
        <div class="setup-step"><span class="step-num">4</span><span>Add <strong>"Calculate"</strong> → type: <code>mySleepRaw ÷ 3600</code> (use the magic pill for mySleepRaw) → rename output <em>mySleepHours</em></span></div>
        <div class="setup-step"><span class="step-num">5</span><span>Add <strong>"Format Date"</strong> → Current Date → Format: Custom → <code>YYYY-MM-DD</code> → rename <em>myDate</em></span></div>
        <div class="setup-step"><span class="step-num">6</span><span>Add a <strong>"Text"</strong> action. Tap the field, then tap the <strong>&gt;</strong> arrow above the keyboard to insert magic pills. Build this structure — type the plain text parts, insert pills for the values (tap to copy template):</span></div>
      </div>
      <div class="setup-url-box" onclick="MQ.copyHealthJSON()">
        <code class="setup-url" style="font-size:10px">{"fields":{"date":{"stringValue":"myDate"},"steps":{"doubleValue":myStepsSum},"protein":{"doubleValue":myProtein},"activeCalories":{"doubleValue":myActiveCal},"sleepHours":{"doubleValue":mySleepHours},"exerciseMinutes":{"doubleValue":0}}}</code>
        <span class="setup-copy"><i class="ti ti-copy"></i></span>
      </div>
      <div class="health-setup-steps" style="margin-top:10px">
        <div class="setup-step"><span class="step-num">7</span><span>Add <strong>"Get Contents of URL"</strong>:<br>
          • URL: your personal link below (tap to copy)<br>
          • Method: <strong>PATCH</strong><br>
          • Headers: Key <code>Content-Type</code> → Value <code>application/json</code><br>
          • Request Body: <strong>File</strong> → insert the Text pill from step 6
        </span></div>
      </div>
      <div class="setup-url-box" onclick="navigator.clipboard.writeText('${`https://firestore.googleapis.com/v1/projects/musclequest-c5052/databases/(default)/documents/healthSync/${currentUser}?key=AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc`}');MQ.toast('Copied!')">
        <code class="setup-url">${`https://firestore.googleapis.com/v1/projects/musclequest-c5052/databases/(default)/documents/healthSync/${currentUser || 'YOUR_USERNAME'}?key=AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc`}</code>
        <span class="setup-copy"><i class="ti ti-copy"></i></span>
      </div>
      <div class="health-setup-steps" style="margin-top:10px">
        <div class="setup-step"><span class="step-num">8</span><span>Tap <strong>Done</strong>, name it <strong>"MuscleQuest Sync"</strong>. Run it once manually to grant Health permissions. Then set up an <strong>Automation</strong> to run it daily.</span></div>
      </div>
      <button class="btn-secondary" style="width:100%;margin-top:12px;font-size:13px" onclick="MQ.checkHealthWriteTest()">🔍 Test — Did My Shortcut Write?</button>
    </div>
  </div>`;
}

// ─── Date Helpers ───
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(d) {
  return new Date(d || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
function getWeekStart() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function getYearStart() {
  return `${new Date().getFullYear()}`;
}
function xpFromLogSince(dateStr) {
  return (state.workoutLog || []).filter(e => e.date >= dateStr).reduce((sum, e) => sum + (e.xp || 0), 0);
}
function checkPeriodXPReset() {
  const ws = getWeekStart(), ms = getMonthStart(), ys = getYearStart();
  // Always recompute from log — Firebase sync can overwrite cached values
  const fromLog = xpFromLogSince(ws);
  state.weeklyXP  = state.weeklyXPStart === ws ? Math.max(state.weeklyXP || 0, fromLog) : fromLog;
  state.weeklyXPStart = ws;
  if (state.monthlyXPStart !== ms) { state.monthlyXP = xpFromLogSince(ms + '-01'); state.monthlyXPStart = ms; }
  else state.monthlyXP = Math.max(state.monthlyXP || 0, xpFromLogSince(ms + '-01'));
  if (state.yearlyXPStart !== ys) { state.yearlyXP = xpFromLogSince(ys + '-01-01'); state.yearlyXPStart = ys; }
  else state.yearlyXP = Math.max(state.yearlyXP || 0, xpFromLogSince(ys + '-01-01'));
}

// ─── Streak Logic ───
function updateStreak() {
  const today = todayStr();
  if (state.lastWorkoutDate === today) return;
  const yd = new Date();
  yd.setDate(yd.getDate() - 1);
  const yesterdayStr = `${yd.getFullYear()}-${String(yd.getMonth()+1).padStart(2,'0')}-${String(yd.getDate()).padStart(2,'0')}`;
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

// ─── Weekly Challenge (permanent ladder) ───
function getWeeklyChallenge() {
  const ws = getWeekStart();
  if (state.weeklyStart && state.weeklyStart !== ws) {
    // New week started — check if previous challenge was beaten
    const prev = WEEKLY_CHALLENGES[state.weeklyChallengeLevel || 0];
    if ((state.weeklyChallengeDamage || 0) >= prev.hp) {
      const nextLevel = Math.min((state.weeklyChallengeLevel || 0) + 1, WEEKLY_CHALLENGES.length - 1);
      if (nextLevel > (state.weeklyChallengeLevel || 0)) {
        state.weeklyChallengeLevel = nextLevel;
        state.gold += prev.reward;
        state.totalGold += prev.reward;
        toast(`${prev.icon} ${prev.name} defeated! +${prev.reward}g`, 'gold');
      }
    }
    state.weeklyChallengeDamage = 0;
  }
  if (!state.weeklyStart || state.weeklyStart !== ws) state.weeklyStart = ws;
  return WEEKLY_CHALLENGES[state.weeklyChallengeLevel || 0];
}

// ─── Monthly Raid (group boss, resets each month) ───
function getMonthlyBoss() {
  const ms = getMonthStart();
  if (state.monthlyStart && state.monthlyStart !== ms) {
    state.monthlyBossIndex = ((state.monthlyBossIndex || 0) + 1) % MONTHLY_BOSSES.length;
    state.monthlyDamage = 0;
  }
  if (!state.monthlyStart || state.monthlyStart !== ms) state.monthlyStart = ms;
  return MONTHLY_BOSSES[state.monthlyBossIndex || 0];
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

    // ─── Apple Health bonuses (today's sync only) ───
    if (healthSync && healthSync.date === todayStr()) {
      const hs = healthSync;
      if ((hs.protein || 0) >= 100 && !p.isRest && !p.isCardio) totalXP = Math.floor(totalXP * 1.15);
      if ((hs.activeCalories || 0) >= 300 && p.isCardio) totalXP = Math.floor(totalXP * 1.1);
      if ((hs.sleepHours || 0) >= 7 && p.isRest) totalXP += 100;
      if ((hs.steps || 0) >= 8000) goldEarned += 10;
      if ((hs.exerciseMinutes || 0) >= 30) goldEarned += 15;
    }

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
    getWeeklyChallenge();
    state.weeklyChallengeDamage = (state.weeklyChallengeDamage || 0) + raidDmg;
    getMonthlyBoss();
    state.monthlyDamage = (state.monthlyDamage || 0) + raidDmg;

    state.workoutLog.push({
      date: todayStr(),
      exercise: p.exercise, muscle: p.muscleKey,
      sets: p.sets, duration: p.duration,
      xp: totalXP, gold: goldEarned,
    });

    grandTotalXP += totalXP;
    grandTotalGold += goldEarned;
  }

  checkPeriodXPReset();
  state.weeklyXP  = (state.weeklyXP  || 0) + grandTotalXP;
  state.monthlyXP = (state.monthlyXP || 0) + grandTotalXP;
  state.yearlyXP  = (state.yearlyXP  || 0) + grandTotalXP;

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
  const bonus = getEquipmentXPBonus(key);
  if (bonus > 0) xp = Math.floor(xp * (1 + bonus));
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
    renderSkinToneSwatches();
    const hSetup = document.getElementById('health-sync-setup');
    if (hSetup) hSetup.innerHTML = getHealthSyncSetupHTML();
  }
}

function renderDashboard() {
  // One-time strip: remove rank achievements that couldn't be legitimately earned yet
  const RANK_IDS = ['rank1_weekly', 'rank1_monthly', 'rank1_yearly'];
  if (RANK_IDS.some(id => state.achievements.includes(id))) {
    state.achievements = state.achievements.filter(id => !RANK_IDS.includes(id));
    state._rank1Weekly = 0; state._rank1Monthly = 0; state._rank1Yearly = 0;
    saveWithPin();
  }

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
  renderHealthPanel();
  loadHealthSync();
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
  const skn = SKIN_TONES[state.skinTone ?? 1];
  const skinAccent = skn.s4;

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
      <ellipse cx="100" cy="210" rx="${gluteRX}" ry="${gluteRY}" fill="${skinAccent}"/>
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
      ` : `<path d="M${100-12} 125 Q100 132 ${100+12} 125" stroke="${skinAccent}" stroke-width="1" fill="none" opacity="0.6"/>`}
    </g>
    <!-- Abs -->
    <g class="body-part" data-muscle="abs">
      <rect x="${absX}" y="155" width="${absW}" height="50" rx="10" fill="url(#skinDark)" opacity="0.7"/>
      ${[0,12,24,36].map(dy => `<line x1="100" y1="${158+dy}" x2="100" y2="${164+dy}" stroke="${skinAccent}" stroke-width="0.8" opacity="0.5"/>`).join('')}
      ${[6,18,30].map(dy => `<line x1="${absX+6}" y1="${161+dy}" x2="${absX+absW-6}" y2="${161+dy}" stroke="${skinAccent}" stroke-width="0.6" opacity="0.4"/>`).join('')}
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
      <rect x="${legSecLX}" y="220" width="${legSecW}" height="40" rx="8" fill="${skinAccent}"/>
      <rect x="${legSecRX}" y="220" width="${legSecW}" height="40" rx="8" fill="${skinAccent}"/>
    </g>
    <!-- Calves -->
    <g class="body-part" data-muscle="calves">
      <rect x="${calfLX}" y="268" width="${calfW}" height="40" rx="9" fill="url(#skinDark)"/>
      <rect x="${calfRX}" y="268" width="${calfW}" height="40" rx="9" fill="url(#skinDark)"/>
    </g>
    <!-- Glutes (back, primary) -->
    <g class="body-part" data-muscle="glutes">
      <ellipse cx="100" cy="210" rx="${gluteRX}" ry="${gluteRY}" fill="url(#skinDark)"/>
      <line x1="100" y1="${210 - gluteRY + 2}" x2="100" y2="${210 + gluteRY - 2}" stroke="${skinAccent}" stroke-width="0.8" opacity="0.4"/>
    </g>
    <!-- Chest (shadow) -->
    <g class="body-part" data-muscle="chest" opacity="0.3">
      <rect x="${chestX}" y="112" width="${chestW}" height="45" rx="16" fill="${skinAccent}"/>
    </g>
    <!-- Back (back, primary) -->
    <g class="body-part" data-muscle="back">
      <rect x="${backX}" y="108" width="${backW}" height="95" rx="16" fill="url(#skin)"/>
      <!-- Spine -->
      <line x1="100" y1="115" x2="100" y2="195" stroke="${skinAccent}" stroke-width="1" opacity="0.5"/>
      <!-- Lats -->
      <path d="M${backX+8} 130 Q${backX+4} 160 ${backX+10} 190" stroke="${skinAccent}" stroke-width="0.8" fill="none" opacity="0.4"/>
      <path d="M${backX+backW-8} 130 Q${backX+backW-4} 160 ${backX+backW-10} 190" stroke="${skinAccent}" stroke-width="0.8" fill="none" opacity="0.4"/>
      <!-- Shoulder blade hints -->
      <ellipse cx="${100-14}" cy="140" rx="10" ry="14" fill="url(#skinDark)" opacity="0.3"/>
      <ellipse cx="${100+14}" cy="140" rx="10" ry="14" fill="url(#skinDark)" opacity="0.3"/>
      ${female ? `<line x1="${backX + 10}" y1="122" x2="${backX + backW - 10}" y2="122" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="122" x2="100" y2="132" stroke="#2a2a3e" stroke-width="3" stroke-linecap="round"/>` : ''}
    </g>
    <!-- Lower back / no abs visible -->
    <g class="body-part" data-muscle="abs" opacity="0.15">
      <rect x="${absX}" y="160" width="${absW}" height="40" rx="8" fill="${skinAccent}"/>
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

  const hclr = HAIR_COLORS[state.hairColor ?? 0];
  const hairColor = hclr.c1;
  const hairDark = hclr.c2;
  const resolvedHairId = state.hair || (female ? 'space_buns' : 'default');
  const fh = getFullHairSVG(resolvedHairId, hairColor, hairDark);

  const headHTML = front ? `
    <!-- Head (front) -->
    <g class="head-group" style="transform-origin: 100px 95px;">
      ${fh.fb}
      <ellipse cx="100" cy="80" rx="24" ry="28" fill="url(#skin)"/>
      ${fh.ft}
      <ellipse cx="91" cy="78" rx="3" ry="3.5" fill="#2c1810"/>
      <ellipse cx="109" cy="78" rx="3" ry="3.5" fill="#2c1810"/>
      <circle class="eye-highlight eye-left" cx="92" cy="77" r="1.2" fill="#fff"/>
      <circle class="eye-highlight eye-right" cx="110" cy="77" r="1.2" fill="#fff"/>
      ${female ? `<ellipse cx="91" cy="77" rx="1.5" ry="2" fill="#2c1810" opacity="0.15"/>
      <ellipse cx="109" cy="77" rx="1.5" ry="2" fill="#2c1810" opacity="0.15"/>` : ''}
      <path d="M94 90 Q100 94 106 90" stroke="${skinAccent}" stroke-width="1.2" fill="none"/>
      ${renderHeadCosmeticsSVG(true)}
    </g>` : `
    <!-- Head (back) -->
    <g class="head-group" style="transform-origin: 100px 95px;">
      ${fh.bb}
      <ellipse cx="100" cy="80" rx="24" ry="28" fill="url(#skin)"/>
      ${fh.bt}
      ${resolvedHairId === 'default' || resolvedHairId === 'buzz' || resolvedHairId === 'crew' || resolvedHairId === 'slick_back' || resolvedHairId === 'taper_fade' || resolvedHairId === 'undercut' || resolvedHairId === 'pompadour' || resolvedHairId === 'mohawk' ? `
      <ellipse cx="76" cy="82" rx="4" ry="6" fill="url(#skinDark)"/>
      <ellipse cx="124" cy="82" rx="4" ry="6" fill="url(#skinDark)"/>` : ''}
      <rect x="90" y="98" width="20" height="12" rx="4" fill="url(#skinDark)"/>
      <line x1="100" y1="99" x2="100" y2="108" stroke="${skinAccent}" stroke-width="0.6" opacity="0.3"/>
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
      <radialGradient id="skin" cx="50%" cy="30%"><stop offset="0%" stop-color="${skn.s1}"/><stop offset="100%" stop-color="${skn.s2}"/></radialGradient>
      <radialGradient id="skinDark" cx="50%" cy="30%"><stop offset="0%" stop-color="${skn.s3}"/><stop offset="100%" stop-color="${skn.s4}"/></radialGradient>
    </defs>
    ${bodyHTML}
    <!-- Left arm group (posed) -->
    <g transform="rotate(${pose.lArm}, ${lShoulderCX}, ${shY})">
      ${front ? `
      <g class="body-part" data-muscle="biceps">
        <rect x="${armLX}" y="125" width="${armMainW}" height="45" rx="10" fill="url(#skin)"/>
      </g>
      <g class="body-part" data-muscle="triceps" opacity="0.35">
        <rect x="${armSecLX}" y="130" width="${armSecW}" height="38" rx="8" fill="${skinAccent}"/>
      </g>` : `
      <g class="body-part" data-muscle="triceps">
        <rect x="${armLX}" y="125" width="${armMainW}" height="45" rx="10" fill="url(#skin)"/>
      </g>
      <g class="body-part" data-muscle="biceps" opacity="0.35">
        <rect x="${armSecLX}" y="130" width="${armSecW}" height="38" rx="8" fill="${skinAccent}"/>
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
        <rect x="${armSecRX}" y="130" width="${armSecW}" height="38" rx="8" fill="${skinAccent}"/>
      </g>` : `
      <g class="body-part" data-muscle="triceps">
        <rect x="${armRX}" y="125" width="${armMainW}" height="45" rx="10" fill="url(#skin)"/>
      </g>
      <g class="body-part" data-muscle="biceps" opacity="0.35">
        <rect x="${armSecRX}" y="130" width="${armSecW}" height="38" rx="8" fill="${skinAccent}"/>
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
    ${renderBodyCosmeticsSVG(front, forearmLX, forearmRX, forearmW, shortsX, shortsW, torsoX, torsoW, calfLX, calfRX, calfW)}
    ${pose.name !== 'Relaxed' ? `<text x="100" y="312" text-anchor="middle" font-size="9" fill="#9e7cff" font-family="Inter, sans-serif" opacity="0.7">${pose.name}</text>` : ''}
  </svg>`;
}

function renderHeadCosmeticsSVG(front) {
  if (!state.equippedCosmetics?.length) return '';
  const equipped = state.equippedCosmetics;
  let svg = '';

  if (front) {
    if (equipped.includes('do_rag')) {
      svg += `<path d="M77 82 Q76 52 100 50 Q124 52 123 82 Q116 64 100 62 Q84 64 77 82Z" fill="#111" opacity="0.93"/>`;
    }
    if (equipped.includes('headband_red')) {
      svg += `<rect x="78" y="64" width="44" height="6" rx="3" fill="#e53935"/>`;
    }
    if (equipped.includes('headband_blue')) {
      svg += `<rect x="78" y="64" width="44" height="6" rx="3" fill="#1e88e5"/>`;
    }
    if (equipped.includes('headband_gold')) {
      svg += `<rect x="78" y="64" width="44" height="6" rx="3" fill="#ffd700"/>`;
    }
    if (equipped.includes('laurel_wreath')) {
      svg += `<ellipse cx="100" cy="59" rx="26" ry="8" fill="none" stroke="#5a8a1a" stroke-width="4" opacity="0.9"/>`;
      svg += `<ellipse cx="100" cy="59" rx="26" ry="8" fill="none" stroke="#7bc82e" stroke-width="2"/>`;
      svg += `<circle cx="100" cy="52" r="3" fill="#ffd700"/>`;
    }
    if (equipped.includes('iron_crown')) {
      svg += `<polygon points="80,66 85,50 92,60 100,44 108,60 115,50 120,66" fill="#9e7cff" stroke="#6a3dcc" stroke-width="1"/>`;
      svg += `<circle cx="100" cy="46" r="3" fill="#ffd700"/>`;
      svg += `<circle cx="86" cy="52" r="2" fill="#ffd700"/>`;
      svg += `<circle cx="114" cy="52" r="2" fill="#ffd700"/>`;
    }
    if (equipped.includes('crown')) {
      svg += `<polygon points="85,60 90,48 95,56 100,44 105,56 110,48 115,60" fill="#ffd700" stroke="#b8860b" stroke-width="1"/>`;
    }
    if (equipped.includes('gold_chain') || equipped.includes('legend_chain')) {
      const cc = equipped.includes('legend_chain') ? '#c0c0ff' : '#ffd700';
      svg += `<path d="M90 105 Q100 115 110 105" stroke="${cc}" stroke-width="1.5" fill="none"/>`;
      svg += `<circle cx="100" cy="114" r="3" fill="${cc}"/>`;
    }
  } else {
    if (equipped.includes('do_rag')) {
      svg += `<path d="M77 82 Q76 52 100 50 Q124 52 123 82 Q116 64 100 62 Q84 64 77 82Z" fill="#111" opacity="0.93"/>`;
      svg += `<ellipse cx="100" cy="90" rx="7" ry="4" fill="#222"/>`;
      svg += `<path d="M94 88 Q100 95 106 88" stroke="#444" stroke-width="2" fill="none"/>`;
    }
    if (equipped.includes('headband_red')) {
      svg += `<rect x="80" y="64" width="40" height="6" rx="3" fill="#e53935"/>`;
    }
    if (equipped.includes('headband_blue')) {
      svg += `<rect x="80" y="64" width="40" height="6" rx="3" fill="#1e88e5"/>`;
    }
    if (equipped.includes('headband_gold')) {
      svg += `<rect x="80" y="64" width="40" height="6" rx="3" fill="#ffd700"/>`;
    }
    if (equipped.includes('laurel_wreath')) {
      svg += `<ellipse cx="100" cy="59" rx="26" ry="8" fill="none" stroke="#5a8a1a" stroke-width="4" opacity="0.9"/>`;
      svg += `<ellipse cx="100" cy="59" rx="26" ry="8" fill="none" stroke="#7bc82e" stroke-width="2"/>`;
    }
    if (equipped.includes('iron_crown')) {
      svg += `<polygon points="80,66 85,50 92,60 100,44 108,60 115,50 120,66" fill="#9e7cff" stroke="#6a3dcc" stroke-width="1"/>`;
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
  if (equipped.includes('lifting_gloves')) {
    svg += `<rect x="${fx}" y="170" width="${fw}" height="12" rx="4" fill="#6d4c2a"/>`;
    svg += `<rect x="${fx+1}" y="175" width="${fw-2}" height="5" rx="2" fill="#4a3018" opacity="0.55"/>`;
  }
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

function renderBodyCosmeticsSVG(front, fLX, fRX, fW, shortsX, shortsW, torsoX, torsoW, calfLX, calfRX, calfW) {
  if (!state.equippedCosmetics?.length) return '';
  const equipped = state.equippedCosmetics;
  let svg = '';

  // ── Borat suit (full body — render under other torso items) ──
  if (equipped.includes('borat_suit') && front) {
    svg += `<line x1="96" y1="120" x2="82" y2="108" stroke="#00c853" stroke-width="6" stroke-linecap="round"/>`;
    svg += `<line x1="104" y1="120" x2="118" y2="108" stroke="#00c853" stroke-width="6" stroke-linecap="round"/>`;
    svg += `<path d="M96 120 L90 168 L87 198 L100 198 L113 198 L110 168 L104 120Z" fill="#00c853" opacity="0.92"/>`;
  }

  // ── Tops ──
  if (equipped.includes('tank_top') && front) {
    svg += `<rect x="${torsoX+2}" y="110" width="${torsoW-4}" height="48" rx="8" fill="#333366" opacity="0.85"/>`;
    svg += `<rect x="${torsoX+10}" y="108" width="${torsoW-20}" height="4" rx="2" fill="#333366"/>`;
  }
  if (equipped.includes('stringer') && front) {
    svg += `<path d="M${torsoX+8} 110 L${100-6} 108 L${100-6} 156 L${torsoX+4} 156 Z" fill="#1a1a3e" opacity="0.8"/>`;
    svg += `<path d="M${torsoX+torsoW-8} 110 L${100+6} 108 L${100+6} 156 L${torsoX+torsoW-4} 156 Z" fill="#1a1a3e" opacity="0.8"/>`;
  }
  if (equipped.includes('forged_tank') && front) {
    svg += `<rect x="${torsoX+2}" y="110" width="${torsoW-4}" height="48" rx="8" fill="#1a1a2e" opacity="0.92"/>`;
    svg += `<rect x="${torsoX+10}" y="108" width="${torsoW-20}" height="4" rx="2" fill="#1a1a2e"/>`;
    svg += `<line x1="${torsoX+4}" y1="155" x2="${torsoX+torsoW-4}" y2="155" stroke="#7c4dff" stroke-width="1.5" opacity="0.85"/>`;
  }

  // ── Bottoms ──
  if (equipped.includes('forged_joggers')) {
    svg += `<rect x="${shortsX}" y="195" width="${shortsW}" height="115" rx="8" fill="#0d1117" opacity="0.9"/>`;
    svg += `<line x1="${shortsX+5}" y1="200" x2="${shortsX+5}" y2="308" stroke="#9e7cff" stroke-width="1.5" opacity="0.7"/>`;
    svg += `<line x1="${shortsX+shortsW-5}" y1="200" x2="${shortsX+shortsW-5}" y2="308" stroke="#9e7cff" stroke-width="1.5" opacity="0.7"/>`;
  }
  if (equipped.includes('compression_set')) {
    svg += `<rect x="${shortsX}" y="195" width="${shortsW}" height="115" rx="8" fill="#0d1a2e" opacity="0.8"/>`;
    svg += `<line x1="${shortsX+8}" y1="200" x2="${shortsX+8}" y2="308" stroke="#4488ff" stroke-width="1" opacity="0.4"/>`;
    svg += `<line x1="${shortsX+shortsW-8}" y1="200" x2="${shortsX+shortsW-8}" y2="308" stroke="#4488ff" stroke-width="1" opacity="0.4"/>`;
  }

  // ── Belt / knees ──
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

  // ── Feet ──
  if (equipped.includes('flip_flops') && calfLX != null) {
    const lCX = calfLX + (calfW || 18) / 2;
    const rCX = calfRX + (calfW || 18) / 2;
    const rx = Math.max((calfW || 18) / 2 + 4, 12);
    svg += `<ellipse cx="${lCX}" cy="310" rx="${rx}" ry="4" fill="#0288d1"/>`;
    svg += `<ellipse cx="${rCX}" cy="310" rx="${rx}" ry="4" fill="#0288d1"/>`;
    svg += `<line x1="${lCX}" y1="306" x2="${lCX}" y2="310" stroke="#b3e5fc" stroke-width="2" stroke-linecap="round"/>`;
    svg += `<line x1="${rCX}" y1="306" x2="${rCX}" y2="310" stroke="#b3e5fc" stroke-width="2" stroke-linecap="round"/>`;
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

function renderRaidProgress() {
  const challenge = getWeeklyChallenge();
  const dmg = state.weeklyChallengeDamage || 0;
  const pct = Math.min(100, (dmg / challenge.hp) * 100);
  const beaten = pct >= 100;
  document.getElementById('raid-boss-name').textContent = `${challenge.icon} ${challenge.name}`;
  document.getElementById('raid-percent').textContent = beaten ? '✓ DEFEATED' : `${Math.floor(pct)}%`;
  document.getElementById('raid-bar-fill').style.width = `${pct}%`;
  document.getElementById('raid-damage').textContent = `${dmg.toLocaleString()} / ${challenge.hp.toLocaleString()}`;
}

function renderAchievementsPreview() {
  const container = document.getElementById('achievements-preview');
  container.innerHTML = ACHIEVEMENTS.slice(0, 6).map(a => {
    const unlocked = state.achievements.includes(a.id);
    return `<div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
      <span class="badge-icon">${a.icon}</span>
      <span>${a.name}</span>
      <span class="badge-req">${unlocked ? 'Unlocked' : a.desc}</span>
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
function getEquipmentXPBonus(muscleKey) {
  const eq = state.equipment || {};
  const BONUSES = {
    pull_up_bar:   { back: 0.10, biceps: 0.05 },
    dip_bar:       { triceps: 0.10, chest: 0.05 },
    assault_bike:  { cardio: 0.20, shoulders: 0.08 },
    dumbbells:     { biceps: 0.10, triceps: 0.10, shoulders: 0.05 },
    flat_bench:    { chest: 0.10, triceps: 0.05 },
    squat_rack:    { quads: 0.10, glutes: 0.10, hamstrings: 0.05 },
    treadmill:     { cardio: 0.15 },
    cable_machine: { chest: 0.05, back: 0.05, shoulders: 0.05, triceps: 0.05 },
    kettlebell:    { abs: 0.10, glutes: 0.05 },
  };
  let bonus = 0;
  for (const [eqId, bonusMap] of Object.entries(BONUSES)) {
    if (eq[eqId] && bonusMap[muscleKey]) bonus += bonusMap[muscleKey];
  }
  return bonus;
}

function renderHomeGym() {
  const el = document.getElementById('home-gym-section');
  if (!el) return;
  const eq = state.equipment || {};
  const ach = state.achievements || [];
  const bbRaw = JSON.parse(localStorage.getItem('musclequest_bbcomp') || '{}');
  const bbWins = bbRaw.totalWins || 0;
  const ownedCount = Object.keys(eq).length;

  const medals = [
    { label: 'Bronze', won: bbWins >= 1,  icon: '🥉', need: 1  },
    { label: 'Silver', won: bbWins >= 5,  icon: '🥈', need: 5  },
    { label: 'Gold',   won: bbWins >= 10, icon: '🥇', need: 10 },
  ];

  // Mini SVG helpers for the room
  function gymItem(id, ownedEq) {
    const o = ownedEq;
    const op = o ? '1' : '0.28';
    if (id === 'pull_up_bar') return `<svg width="90" height="44" viewBox="0 0 90 44" opacity="${op}">
      <rect x="2" y="12" width="10" height="28" rx="2" fill="#5a3a2a"/>
      <rect x="78" y="12" width="10" height="28" rx="2" fill="#5a3a2a"/>
      <rect x="10" y="18" width="70" height="8" rx="4" fill="${o?'#8d6e63':'#555'}"/>
      ${o?[20,32,44,56,68].map(x=>`<line x1="${x}" y1="20" x2="${x}" y2="25" stroke="#fff4" stroke-width="2"/>`).join(''):''}
    </svg>`;
    if (id === 'dip_bar') return `<svg width="80" height="50" viewBox="0 0 80 50" opacity="${op}">
      <rect x="6" y="10" width="8" height="36" rx="2" fill="${o?'#66bb6a':'#555'}"/>
      <rect x="66" y="10" width="8" height="36" rx="2" fill="${o?'#66bb6a':'#555'}"/>
      <rect x="6" y="10" width="68" height="6" rx="2" fill="${o?'#66bb6a':'#555'}"/>
      <rect x="6" y="40" width="68" height="6" rx="2" fill="${o?'#4caf50':'#444'}"/>
      <rect x="24" y="22" width="32" height="6" rx="3" fill="${o?'#8d6e63':'#555'}"/>
    </svg>`;
    if (id === 'flat_bench') return `<svg width="90" height="52" viewBox="0 0 90 52" opacity="${op}">
      <rect x="6" y="10" width="78" height="14" rx="5" fill="${o?'#5c4033':'#444'}"/>
      <rect x="6" y="10" width="78" height="5" rx="5" fill="${o?'#ffffff22':'#ffffff11'}"/>
      <rect x="12" y="24" width="7" height="22" rx="3" fill="${o?'#2a2030':'#333'}"/>
      <rect x="71" y="24" width="7" height="22" rx="3" fill="${o?'#2a2030':'#333'}"/>
    </svg>`;
    if (id === 'squat_rack') return `<svg width="80" height="80" viewBox="0 0 80 80" opacity="${op}">
      <rect x="4" y="2" width="9" height="72" rx="3" fill="${o?'#66bb6a':'#555'}"/>
      <rect x="67" y="2" width="9" height="72" rx="3" fill="${o?'#66bb6a':'#555'}"/>
      <rect x="4" y="2" width="72" height="8" rx="2" fill="${o?'#66bb6a':'#555'}"/>
      <rect x="4" y="67" width="72" height="6" rx="2" fill="${o?'#4caf50':'#444'}"/>
      <rect x="18" y="30" width="44" height="7" rx="3" fill="${o?'#8d6e63':'#555'}"/>
      ${o?[26,38,50,62].map(x=>`<line x1="${x}" y1="31" x2="${x}" y2="36" stroke="#fff4" stroke-width="2.5"/>`).join(''):''}
    </svg>`;
    if (id === 'cable_machine') return `<svg width="56" height="90" viewBox="0 0 56 90" opacity="${op}">
      <rect x="8" y="2" width="40" height="82" rx="5" fill="${o?'#2e7d32':'#444'}"/>
      <rect x="14" y="8" width="28" height="24" rx="3" fill="${o?'#1a4a1a':'#333'}"/>
      <circle cx="28" cy="20" r="8" fill="none" stroke="${o?'#66bb6a':'#666'}" stroke-width="2"/>
      <circle cx="28" cy="20" r="3" fill="${o?'#1a4a1a':'#333'}"/>
      <rect x="16" y="38" width="24" height="18" rx="2" fill="${o?'#1b5e20':'#333'}"/>
    </svg>`;
    if (id === 'treadmill') return `<svg width="100" height="60" viewBox="0 0 100 60" opacity="${op}">
      <path d="M8 50 L18 12 L92 12 L92 50 Z" fill="${o?'#1a3a1a':'#333'}" rx="3"/>
      <path d="M10 48 L20 14 L90 14 L90 48 Z" fill="${o?'#2e7d32':'#444'}"/>
      <rect x="18" y="5" width="64" height="10" rx="2" fill="${o?'#1b5e20':'#333'}"/>
      <line x1="35" y1="12" x2="35" y2="48" stroke="${o?'#ffffff11':'#00000033'}" stroke-width="5"/>
      <line x1="65" y1="12" x2="65" y2="48" stroke="${o?'#ffffff11':'#00000033'}" stroke-width="5"/>
    </svg>`;
    if (id === 'dumbbells') return `<svg width="100" height="52" viewBox="0 0 100 52" opacity="${op}">
      <rect x="2" y="18" width="96" height="34" rx="3" fill="${o?'#263238':'#333'}"/>
      ${[0,1,2,3,4,5].map(i=>`<rect x="${7+i*15}" y="${12+i*1}" width="10" height="${36-i*2}" rx="3" fill="${o?['#455a64','#546e7a','#607d8b','#78909c','#90a4ae','#b0bec5'][i]:'#444'}"/>`).join('')}
    </svg>`;
    if (id === 'kettlebell') return `<svg width="52" height="66" viewBox="0 0 52 66" opacity="${op}">
      <path d="M16 26 Q12 18 16 10 Q20 2 26 2 Q32 2 36 10 Q40 18 36 26 Z" fill="${o?'#263238':'#444'}" stroke="${o?'#66bb6a':'#666'}" stroke-width="1.5"/>
      <ellipse cx="26" cy="48" rx="20" ry="16" fill="${o?'#37474f':'#444'}"/>
      <ellipse cx="26" cy="40" rx="20" ry="12" fill="${o?'#37474f':'#444'}" stroke="${o?'#ffffff11':'none'}" stroke-width="1"/>
    </svg>`;
    if (id === 'foam_roller') return `<svg width="86" height="38" viewBox="0 0 86 38" opacity="${op}">
      <ellipse cx="12" cy="19" rx="10" ry="17" fill="${o?'#7c4dff':'#555'}"/>
      <rect x="12" y="2" width="62" height="34" fill="${o?'#7c4dff':'#555'}"/>
      <ellipse cx="74" cy="19" rx="10" ry="17" fill="${o?'#7c4dff':'#555'}"/>
      ${o?[24,36,48,60].map(x=>`<line x1="${x}" y1="2" x2="${x}" y2="36" stroke="#fff3" stroke-width="3"/>`).join(''):''}
    </svg>`;
    if (id === 'assault_bike') return `<svg width="88" height="72" viewBox="0 0 88 72" opacity="${op}">
      <line x1="44" y1="16" x2="24" y2="46" stroke="${o?'#b71c1c':'#555'}" stroke-width="3" stroke-linecap="round"/>
      <line x1="44" y1="16" x2="64" y2="46" stroke="${o?'#b71c1c':'#555'}" stroke-width="3" stroke-linecap="round"/>
      <line x1="24" y1="46" x2="64" y2="46" stroke="${o?'#b71c1c':'#555'}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="44" y1="16" x2="44" y2="6" stroke="${o?'#b71c1c':'#555'}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="37" y1="6" x2="51" y2="6" stroke="${o?'#b71c1c':'#555'}" stroke-width="4" stroke-linecap="round"/>
      <line x1="35" y1="4" x2="35" y2="10" stroke="${o?'#b71c1c':'#555'}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="53" y1="4" x2="53" y2="10" stroke="${o?'#b71c1c':'#555'}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="22" cy="54" rx="14" ry="14" fill="none" stroke="${o?'#b71c1c':'#555'}" stroke-width="2.5"/>
      <circle cx="22" cy="54" rx="5" fill="none" stroke="${o?'#b71c1c88':'#555'}" stroke-width="1.5"/>
      <circle cx="22" cy="54" r="2.5" fill="${o?'#b71c1c':'#555'}"/>
      <circle cx="66" cy="54" r="14" fill="none" stroke="${o?'#b71c1c':'#555'}" stroke-width="2.5"/>
      <circle cx="66" cy="54" r="5" fill="none" stroke="${o?'#b71c1c88':'#555'}" stroke-width="1.5"/>
      <circle cx="66" cy="54" r="2.5" fill="${o?'#b71c1c':'#555'}"/>
      <circle cx="44" cy="33" r="9" fill="none" stroke="${o?'#b71c1c55':'#444'}" stroke-width="1"/>
      ${o?[0,30,60,90,120,150].map(a=>`<line x1="44" y1="33" x2="${44+8*Math.cos(a*Math.PI/180).toFixed(2)}" y2="${33+8*Math.sin(a*Math.PI/180).toFixed(2)}" stroke="#b71c1c99" stroke-width="1.5" stroke-linecap="round"/>`).join(''):''}
      <circle cx="44" cy="33" r="3" fill="${o?'#e53935':'#555'}"/>
    </svg>`;
    return '';
  }

  function eqTip(id, label, bonus, owned) {
    return `<div class="store-tip">
      <span class="tip-name">${label}</span>
      <span class="tip-buff">${bonus}</span>
      ${owned
        ? '<span class="tip-on">✓ Installed</span>'
        : `<button class="tip-buy" onclick="MQ.showTab('store');setTimeout(()=>GainsShop.openSporting(),300)">Buy at Iron Depot</button>`}
    </div>`;
  }

  const EQ_INFO = {
    pull_up_bar:   { label: 'Pull-Up Bar',    bonus: '+10% back XP, +5% biceps XP'   },
    dip_bar:       { label: 'Dip/Pull-Up Station', bonus: '+10% triceps XP, +5% chest XP' },
    flat_bench:    { label: 'Flat Bench',     bonus: '+10% chest XP, +5% triceps XP' },
    squat_rack:    { label: 'Squat Rack',     bonus: '+10% quads XP, +10% glutes XP' },
    cable_machine: { label: 'Cable Machine',  bonus: '+5% chest, back, shoulders, triceps XP' },
    treadmill:     { label: 'Treadmill',      bonus: '+15% cardio XP'                },
    dumbbells:     { label: 'Dumbbells',      bonus: '+10% biceps XP, +10% triceps XP' },
    kettlebell:    { label: 'Kettlebell',     bonus: '+10% abs XP, +5% glutes XP'    },
    foam_roller:   { label: 'Foam Roller',    bonus: '+5% recovery & cardio XP'      },
    assault_bike:  { label: 'Assault Air Bike', bonus: '+20% cardio XP, +8% shoulders XP' },
  };

  // Player avatar in the scene
  const gender = state.gender || 'male';
  const cosmetics = state.equippedCosmetics || [];
  const avatarSVG = renderMiniAvatarSVG(gender, cosmetics, 0, state.name || 'You', state.hair || (gender === 'female' ? 'space_buns' : 'default'), state.skinTone ?? 1, state.hairColor ?? 0);
  const ownedLabel = `${ownedCount}/8 pieces`;
  const earnedAchs = ach.slice(0, 5).map(id => {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    return a ? `<span title="${a.name}" style="font-size:16px">${a.icon}</span>` : '';
  }).join('');

  el.innerHTML = `
<div class="hg-scene">
  <!-- Back wall -->
  <div class="hg-back-wall">
    <div class="hg-gym-name">MY GYM</div>
    <!-- Trophy shelf -->
    <div class="hg-trophy-zone">
      <div class="hg-shelf-plank"></div>
      <div class="hg-shelf-items">
        ${medals.map(m => `<div class="hg-medal ${m.won ? 'hg-medal-won' : 'hg-medal-locked'}" title="${m.won ? m.label+' Medal ✓' : 'Win '+m.need+' BB shows to earn'}">
          <span style="font-size:${m.won?'20':'14'}px">${m.won ? m.icon : '🔒'}</span>
          <span class="hg-medal-lbl">${m.label}</span>
        </div>`).join('')}
        ${earnedAchs ? `<div class="hg-ach-row">${earnedAchs}</div>` : ''}
      </div>
    </div>
    <!-- Wall-mounted equipment -->
    <div class="hg-wall-gear">
      <div class="store-item hg-gear-item${eq.pull_up_bar?' hg-owned':''}" style="position:relative">
        ${gymItem('pull_up_bar', !!eq.pull_up_bar)}
        <div class="hg-gear-lbl">Pull-Up Bar</div>
        ${eqTip('pull_up_bar', EQ_INFO.pull_up_bar.label, EQ_INFO.pull_up_bar.bonus, !!eq.pull_up_bar)}
      </div>
      <div class="store-item hg-gear-item${eq.dip_bar?' hg-owned':''}" style="position:relative">
        ${gymItem('dip_bar', !!eq.dip_bar)}
        <div class="hg-gear-lbl">Dip Station</div>
        ${eqTip('dip_bar', EQ_INFO.dip_bar.label, EQ_INFO.dip_bar.bonus, !!eq.dip_bar)}
      </div>
    </div>
  </div>

  <!-- Middle row: side gear + character + side gear -->
  <div class="hg-middle-row">
    <div class="hg-side-gear hg-left">
      <div class="store-item hg-gear-item${eq.flat_bench?' hg-owned':''}" style="position:relative">
        ${gymItem('flat_bench', !!eq.flat_bench)}
        <div class="hg-gear-lbl">Flat Bench</div>
        ${eqTip('flat_bench', EQ_INFO.flat_bench.label, EQ_INFO.flat_bench.bonus, !!eq.flat_bench)}
      </div>
      <div class="store-item hg-gear-item${eq.squat_rack?' hg-owned':''}" style="position:relative">
        ${gymItem('squat_rack', !!eq.squat_rack)}
        <div class="hg-gear-lbl">Squat Rack</div>
        ${eqTip('squat_rack', EQ_INFO.squat_rack.label, EQ_INFO.squat_rack.bonus, !!eq.squat_rack)}
      </div>
    </div>

    <div class="hg-character-wrap">
      <div class="hg-character-svg">${avatarSVG}</div>
      <div class="hg-char-name">${state.name || 'You'}</div>
      <div class="hg-char-meta">${ownedLabel}</div>
    </div>

    <div class="hg-side-gear hg-right">
      <div class="store-item hg-gear-item${eq.cable_machine?' hg-owned':''}" style="position:relative">
        ${gymItem('cable_machine', !!eq.cable_machine)}
        <div class="hg-gear-lbl">Cable Machine</div>
        ${eqTip('cable_machine', EQ_INFO.cable_machine.label, EQ_INFO.cable_machine.bonus, !!eq.cable_machine)}
      </div>
      <div class="store-item hg-gear-item${eq.treadmill?' hg-owned':''}" style="position:relative">
        ${gymItem('treadmill', !!eq.treadmill)}
        <div class="hg-gear-lbl">Treadmill</div>
        ${eqTip('treadmill', EQ_INFO.treadmill.label, EQ_INFO.treadmill.bonus, !!eq.treadmill)}
      </div>
    </div>
  </div>

  <!-- Floor row: small equipment -->
  <div class="hg-floor-row">
    <div class="store-item hg-gear-item hg-floor-item${eq.dumbbells?' hg-owned':''}" style="position:relative">
      ${gymItem('dumbbells', !!eq.dumbbells)}
      <div class="hg-gear-lbl">Dumbbells</div>
      ${eqTip('dumbbells', EQ_INFO.dumbbells.label, EQ_INFO.dumbbells.bonus, !!eq.dumbbells)}
    </div>
    <div class="store-item hg-gear-item hg-floor-item${eq.kettlebell?' hg-owned':''}" style="position:relative">
      ${gymItem('kettlebell', !!eq.kettlebell)}
      <div class="hg-gear-lbl">Kettlebell</div>
      ${eqTip('kettlebell', EQ_INFO.kettlebell.label, EQ_INFO.kettlebell.bonus, !!eq.kettlebell)}
    </div>
    <div class="store-item hg-gear-item hg-floor-item${eq.foam_roller?' hg-owned':''}" style="position:relative">
      ${gymItem('foam_roller', !!eq.foam_roller)}
      <div class="hg-gear-lbl">Foam Roller</div>
      ${eqTip('foam_roller', EQ_INFO.foam_roller.label, EQ_INFO.foam_roller.bonus, !!eq.foam_roller)}
    </div>
    <div class="store-item hg-gear-item hg-floor-item${eq.assault_bike?' hg-owned':''}" style="position:relative">
      ${gymItem('assault_bike', !!eq.assault_bike)}
      <div class="hg-gear-lbl">Air Bike</div>
      ${eqTip('assault_bike', EQ_INFO.assault_bike.label, EQ_INFO.assault_bike.bonus, !!eq.assault_bike)}
    </div>
  </div>

  <div class="hg-floor-strip"></div>
</div>`;
}

async function renderQuestsTab() {
  renderHomeGym();
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

  // ── Weekly Challenge ──
  const challenge = getWeeklyChallenge();
  const chDmg = state.weeklyChallengeDamage || 0;
  const chPct = Math.min(100, (chDmg / challenge.hp) * 100);
  const chBeaten = chPct >= 100;
  const level = state.weeklyChallengeLevel || 0;
  const nextChallenge = level + 1 < WEEKLY_CHALLENGES.length ? WEEKLY_CHALLENGES[level + 1] : null;
  document.getElementById('raid-detail').innerHTML = `
    <div class="challenge-chain">
      ${WEEKLY_CHALLENGES.map((c, i) => `<span class="chain-pip ${i < level ? 'chain-done' : i === level ? 'chain-active' : 'chain-locked'}" title="${c.name}">${i < level ? '✓' : c.icon}</span>`).join('<span class="chain-line"></span>')}
    </div>
    <div class="challenge-boss-name">${challenge.icon} ${challenge.name}</div>
    <p class="muted" style="font-size:11px;margin:4px 0 8px">${challenge.desc}</p>
    <div class="raid-bar" style="max-width:280px;margin:8px auto">
      <div class="raid-bar-fill" style="width:${chPct}%;background:${challenge.color}"></div>
    </div>
    <p class="raid-boss-hp">${chDmg.toLocaleString()} / ${challenge.hp.toLocaleString()} XP dealt</p>
    ${chBeaten
      ? `<p class="challenge-win">🏆 DEFEATED! ${nextChallenge ? `Next up: ${nextChallenge.icon} ${nextChallenge.name}` : 'You beat them all!'}</p>`
      : `<p class="muted" style="font-size:11px">Defeat it this week to unlock the next challenger. Resets Monday.</p>`}
    ${level > 0 ? `<p style="font-size:10px;color:var(--text-muted);margin-top:4px">Level ${level + 1} of ${WEEKLY_CHALLENGES.length} — Reward: +${challenge.reward}g on defeat</p>` : ''}`;

  // ── Monthly Raid ──
  const mboss = getMonthlyBoss();
  let mDmg = state.monthlyDamage || 0;
  if (db) {
    try {
      const ms = getMonthStart();
      const snap = await db.collection('users').where('monthlyStart', '==', ms).get();
      let total = 0;
      snap.forEach(doc => { total += doc.data().monthlyDamage || 0; });
      if (total > 0) mDmg = total;
    } catch(e) {}
  }
  const mPct = Math.min(100, (mDmg / mboss.hp) * 100);
  document.getElementById('monthly-raid-detail').innerHTML = `
    <div class="challenge-boss-name">${mboss.icon} ${mboss.name}</div>
    <p class="muted" style="font-size:11px;margin:4px 0 8px">Group raid — everyone's XP deals damage. Resets monthly.</p>
    <div class="raid-bar" style="max-width:280px;margin:8px auto">
      <div class="raid-bar-fill" style="width:${mPct}%"></div>
    </div>
    <p class="raid-boss-hp">${mDmg.toLocaleString()} / ${mboss.hp.toLocaleString()} HP</p>
    ${mPct >= 100 ? `<p class="challenge-win">🏆 RAID BOSS DEFEATED! +${mboss.reward}g</p>` : ''}`;

  const aGrid = document.getElementById('achievements-list');
  aGrid.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = state.achievements.includes(a.id);
    return `<div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
      <span class="badge-icon">${a.icon}</span>
      <span>${a.name}</span>
      <span class="badge-req">${unlocked ? 'Unlocked' : a.desc}</span>
    </div>`;
  }).join('');
}

// ─── Leaderboard ───
function getFullHairSVG(id, hc, hd) {
  // Full avatar: head cx=100,cy=80,rx=24,ry=28. Top=52, left=76, right=124.
  // fb=frontBack(before head), ft=frontTop(after head), bb=backBack, bt=backTop
  const cap = (y=80)=>`<path d="M76 ${y} Q74 52 100 50 Q126 52 124 ${y} Q120 58 100 56 Q80 58 76 ${y}Z" fill="${hc}"/>`;
  const fullCap = `<ellipse cx="100" cy="72" rx="23" ry="26" fill="${hc}"/>${cap(76).replace(hc,hd)}`;
  const H = {
    default:      { fb:'', ft:cap(76), bb:'', bt:fullCap },
    buzz:         { fb:'', ft:`<path d="M76 78 Q76 54 100 52 Q124 54 124 78 Q120 66 100 64 Q80 66 76 78Z" fill="${hc}"/>`, bb:'', bt:fullCap },
    crew:         { fb:'', ft:`<path d="M76 80 Q74 50 100 48 Q126 50 124 80 Q120 58 100 56 Q80 58 76 80Z" fill="${hc}"/>`, bb:'', bt:fullCap },
    slick_back:   { fb:'', ft:`${cap(80)}<path d="M78 60 Q100 56 122 60" stroke="${hd}" stroke-width="1.5" fill="none"/>
      <path d="M78 66 Q100 62 122 66" stroke="${hd}" stroke-width="1.5" fill="none"/>
      <path d="M78 72 Q100 68 122 72" stroke="${hd}" stroke-width="1.5" fill="none"/>`, bb:'', bt:fullCap },
    undercut:     { fb:'', ft:`<path d="M84 78 Q82 54 100 52 Q118 54 116 78 Q112 60 100 58 Q88 60 84 78Z" fill="${hc}"/>`, bb:'', bt:fullCap },
    pompadour:    { fb:'', ft:`${cap(80)}<path d="M80 60 Q84 40 100 36 Q116 40 120 60 Q112 48 100 46 Q88 48 80 60Z" fill="${hc}"/>`,
                   bb:'', bt:`${fullCap}<path d="M80 58 Q84 40 100 36 Q116 40 120 58 Q112 46 100 44 Q88 46 80 58Z" fill="${hd}"/>` },
    mohawk:       { fb:'', ft:`<path d="M92 78 Q90 54 100 44 Q110 54 108 78Z" fill="${hc}"/>`, bb:'', bt:`${fullCap}<path d="M92 74 Q90 52 100 42 Q110 52 108 74Z" fill="${hd}"/>` },
    taper_fade:   { fb:'', ft:`<path d="M82 80 Q80 52 100 50 Q120 52 118 80 Q114 60 100 58 Q86 60 82 80Z" fill="${hc}"/>
      <path d="M76 80 Q76 70 82 66" stroke="${hc}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M124 80 Q124 70 118 66" stroke="${hc}" stroke-width="5" fill="none" stroke-linecap="round"/>`, bb:'', bt:fullCap },
    long_straight:{ fb:`<rect x="68" y="72" width="12" height="80" rx="6" fill="${hc}"/><rect x="120" y="72" width="12" height="80" rx="6" fill="${hc}"/>`,
      ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/><line x1="100" y1="52" x2="100" y2="68" stroke="${hd}" stroke-width="1.5"/>`,
      bb:`<rect x="68" y="72" width="12" height="80" rx="6" fill="${hd}"/><rect x="120" y="72" width="12" height="80" rx="6" fill="${hd}"/>`,
      bt:`<ellipse cx="100" cy="72" rx="23" ry="26" fill="${hc}"/>${cap(76).replace(hc,hd)}` },
    beach_waves:  { fb:`<path d="M69 72 Q59 96 61 122 Q59 148 64 168" stroke="${hc}" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M131 72 Q141 96 139 122 Q141 148 136 168" stroke="${hc}" stroke-width="12" fill="none" stroke-linecap="round"/>`,
      ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/>`, bb:'', bt:fullCap },
    high_pony:    { fb:'', ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/>
      <circle cx="100" cy="50" r="7" fill="${hd}"/>
      <line x1="100" y1="44" x2="88" y2="34" stroke="${hc}" stroke-width="10" stroke-linecap="round"/>
      <line x1="100" y1="44" x2="112" y2="34" stroke="${hc}" stroke-width="10" stroke-linecap="round"/>`,
      bb:'', bt:`<ellipse cx="100" cy="72" rx="23" ry="26" fill="${hc}"/>
      <circle cx="100" cy="50" r="7" fill="${hd}"/>
      <line x1="100" y1="44" x2="88" y2="34" stroke="${hc}" stroke-width="10" stroke-linecap="round"/>
      <line x1="100" y1="44" x2="112" y2="34" stroke="${hc}" stroke-width="10" stroke-linecap="round"/>` },
    bob:          { fb:`<rect x="68" y="72" width="12" height="44" rx="6" fill="${hc}"/><rect x="120" y="72" width="12" height="44" rx="6" fill="${hc}"/>
      <rect x="72" y="110" width="56" height="6" rx="3" fill="${hc}"/>`,
      ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/>`, bb:'', bt:fullCap },
    pixie:        { fb:'', ft:`${cap(80)}
      <path d="M88 56 Q100 46 112 56" stroke="${hc}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M76 64 Q70 52 74 48" stroke="${hc}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M124 64 Q130 52 126 48" stroke="${hc}" stroke-width="4" fill="none" stroke-linecap="round"/>`, bb:'', bt:fullCap },
    braided_crown:{ fb:'', ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/>
      <ellipse cx="100" cy="64" rx="25" ry="17" fill="none" stroke="${hd}" stroke-width="7" stroke-dasharray="6 3"/>`,
      bb:'', bt:`<ellipse cx="100" cy="72" rx="23" ry="26" fill="${hc}"/>
      <ellipse cx="100" cy="64" rx="25" ry="17" fill="none" stroke="${hd}" stroke-width="5" stroke-dasharray="6 3"/>` },
    space_buns:   { fb:`<path d="M76 72 Q65 96 66 122" stroke="${hc}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M124 72 Q135 96 134 122" stroke="${hc}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      ft:`<ellipse cx="100" cy="63" rx="25" ry="17" fill="${hc}"/>
      <path d="M78 60 Q100 54 122 60" stroke="${hd}" stroke-width="1" fill="none"/>
      <circle cx="74" cy="55" r="13" fill="${hc}"/>
      <path d="M60 50 Q74 46 88 50" stroke="${hd}" stroke-width="2" fill="none"/>
      <path d="M60 55 Q74 51 88 55" stroke="${hd}" stroke-width="1.2" fill="none"/>
      <path d="M60 60 Q53 74 57 88" stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <circle cx="126" cy="55" r="13" fill="${hc}"/>
      <path d="M112 50 Q126 46 140 50" stroke="${hd}" stroke-width="2" fill="none"/>
      <path d="M112 55 Q126 51 140 55" stroke="${hd}" stroke-width="1.2" fill="none"/>
      <path d="M140 60 Q147 74 143 88" stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M100 64 Q86 72 76 82 Q78 90 84 90 Q92 78 100 74Z" fill="${hc}"/>
      <path d="M100 64 Q114 72 124 82 Q122 90 116 90 Q108 78 100 74Z" fill="${hc}"/>`,
      bb:`<path d="M76 72 Q65 96 66 122" stroke="${hc}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M124 72 Q135 96 134 122" stroke="${hc}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      bt:`<ellipse cx="100" cy="75" rx="23" ry="26" fill="${hc}"/>
      <path d="M76 72 Q80 50 100 48 Q120 50 124 72 Q122 58 100 55 Q78 58 76 72Z" fill="${hd}"/>
      <circle cx="74" cy="55" r="13" fill="${hc}"/>
      <circle cx="126" cy="55" r="13" fill="${hc}"/>
      <path d="M60 50 Q74 46 88 50" stroke="${hd}" stroke-width="2" fill="none"/>
      <path d="M60 55 Q74 51 88 55" stroke="${hd}" stroke-width="1.2" fill="none"/>
      <path d="M112 50 Q126 46 140 50" stroke="${hd}" stroke-width="2" fill="none"/>
      <path d="M112 55 Q126 51 140 55" stroke="${hd}" stroke-width="1.2" fill="none"/>` },
    shaved:       { fb:'', ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}" opacity="0.12"/>`, bb:'', bt:`<ellipse cx="100" cy="72" rx="23" ry="26" fill="${hc}" opacity="0.1"/>` },
    afro:         { fb:`<ellipse cx="100" cy="50" rx="38" ry="28" fill="${hc}"/>`, ft:`<ellipse cx="100" cy="50" rx="38" ry="28" fill="${hc}"/>`,
                   bb:`<ellipse cx="100" cy="50" rx="38" ry="28" fill="${hc}"/>`, bt:`<ellipse cx="100" cy="50" rx="38" ry="28" fill="${hc}"/>` },
    cornrows:     { fb:'', ft:`${cap(80)}<line x1="78" y1="62" x2="122" y2="62" stroke="${hd}" stroke-width="3.5"/>
      <line x1="78" y1="68" x2="122" y2="68" stroke="${hd}" stroke-width="3.5"/>
      <line x1="78" y1="74" x2="122" y2="74" stroke="${hd}" stroke-width="3.5"/>`,
      bb:'', bt:`${fullCap}<line x1="78" y1="62" x2="122" y2="62" stroke="${hd}" stroke-width="3"/><line x1="78" y1="68" x2="122" y2="68" stroke="${hd}" stroke-width="3"/>` },
    locs:         { fb:`<line x1="80" y1="80" x2="74" y2="148" stroke="${hc}" stroke-width="9" stroke-linecap="round"/>
      <line x1="92" y1="76" x2="88" y2="154" stroke="${hc}" stroke-width="9" stroke-linecap="round"/>
      <line x1="108" y1="76" x2="112" y2="154" stroke="${hc}" stroke-width="9" stroke-linecap="round"/>
      <line x1="120" y1="80" x2="126" y2="148" stroke="${hc}" stroke-width="9" stroke-linecap="round"/>`,
      ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/>`,
      bb:`<line x1="80" y1="80" x2="74" y2="148" stroke="${hd}" stroke-width="9" stroke-linecap="round"/>
      <line x1="92" y1="76" x2="88" y2="154" stroke="${hd}" stroke-width="9" stroke-linecap="round"/>
      <line x1="108" y1="76" x2="112" y2="154" stroke="${hd}" stroke-width="9" stroke-linecap="round"/>
      <line x1="120" y1="80" x2="126" y2="148" stroke="${hd}" stroke-width="9" stroke-linecap="round"/>`,
      bt:`<ellipse cx="100" cy="72" rx="23" ry="26" fill="${hc}"/>${cap(76).replace(hc,hd)}` },
    man_bun:      { fb:'', ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/><circle cx="100" cy="46" r="11" fill="${hc}" stroke="${hd}" stroke-width="1.5"/>`,
                   bb:'', bt:`<ellipse cx="100" cy="72" rx="23" ry="26" fill="${hc}"/><circle cx="100" cy="46" r="11" fill="${hc}" stroke="${hd}" stroke-width="1.5"/>` },
    curly_fro:    { fb:'', ft:`<ellipse cx="100" cy="58" rx="30" ry="28" fill="${hc}"/>
      <ellipse cx="72" cy="64" rx="10" ry="10" fill="${hc}"/><ellipse cx="128" cy="64" rx="10" ry="10" fill="${hc}"/>
      <ellipse cx="82" cy="44" rx="9" ry="9" fill="${hc}"/><ellipse cx="118" cy="44" rx="9" ry="9" fill="${hc}"/>
      <ellipse cx="100" cy="38" rx="9" ry="9" fill="${hc}"/>`,
      bb:'', bt:`<ellipse cx="100" cy="58" rx="30" ry="28" fill="${hc}"/>
      <ellipse cx="72" cy="64" rx="10" ry="10" fill="${hc}"/><ellipse cx="128" cy="64" rx="10" ry="10" fill="${hc}"/>
      <ellipse cx="82" cy="44" rx="9" ry="9" fill="${hc}"/><ellipse cx="118" cy="44" rx="9" ry="9" fill="${hc}"/>` },
    emo_sweep:    { fb:'', ft:`<ellipse cx="100" cy="64" rx="25" ry="17" fill="${hc}"/>
      <path d="M100 58 Q84 68 72 86 Q70 96 76 96 Q84 82 96 72Z" fill="${hc}"/>
      <path d="M100 58 Q92 68 80 84" stroke="${hd}" stroke-width="1.2" fill="none"/>`,
      bb:'', bt:fullCap },
    flat_top:     { fb:'', ft:`<rect x="76" y="44" width="48" height="18" rx="2" fill="${hc}"/>
      <path d="M76 62 Q76 52 82 52 L118 52 Q124 52 124 62Z" fill="${hc}"/>
      <line x1="76" y1="44" x2="124" y2="44" stroke="${hd}" stroke-width="2.5"/>`,
      bb:'', bt:`<rect x="76" y="44" width="48" height="18" rx="2" fill="${hc}"/>
      <path d="M76 62 Q76 52 82 52 L118 52 Q124 52 124 62Z" fill="${hc}"/>
      <line x1="76" y1="44" x2="124" y2="44" stroke="${hd}" stroke-width="2.5"/>` },
  };
  return H[id] || H['default'];
}

function getHairSVG(id, hc, hd) {
  const s = {
    default:      { back:'', top:`<path d="M37 18 Q36 6 50 5 Q64 6 63 18 Q60 11 50 10 Q40 11 37 18Z" fill="${hc}"/>`, bangs:'' },
    buzz:         { back:'', top:`<path d="M37 19 Q37 8 50 8 Q63 8 63 19 Q59 13 50 13 Q41 13 37 19Z" fill="${hc}"/>`, bangs:'' },
    crew:         { back:'', top:`<path d="M37 20 Q36 5 50 4 Q64 5 63 20 Q59 9 50 8 Q41 9 37 20Z" fill="${hc}"/>`, bangs:'' },
    slick_back:   { back:'', top:`<path d="M37 20 Q36 6 50 5 Q64 6 63 20 Q58 10 50 9 Q42 10 37 20Z" fill="${hc}"/>
      <path d="M38 10 Q50 8 62 10" stroke="${hd}" stroke-width="0.7" fill="none"/>
      <path d="M38 13 Q50 11 62 13" stroke="${hd}" stroke-width="0.7" fill="none"/>
      <path d="M38 16 Q50 14 62 16" stroke="${hd}" stroke-width="0.7" fill="none"/>`, bangs:'' },
    undercut:     { back:'', top:`<path d="M43 19 Q42 7 50 5 Q58 7 57 19 Q55 11 50 10 Q45 11 43 19Z" fill="${hc}"/>`, bangs:'' },
    pompadour:    { back:'', top:`<path d="M37 20 Q36 8 50 8 Q64 8 63 20 Q59 14 50 13 Q41 14 37 20Z" fill="${hc}"/>
      <path d="M40 10 Q43 1 50 0 Q57 1 60 10 Q55 5 50 4 Q45 5 40 10Z" fill="${hc}"/>`, bangs:'' },
    mohawk:       { back:'', top:`<path d="M46 19 Q45 7 50 2 Q55 7 54 19Z" fill="${hc}"/>`, bangs:'' },
    taper_fade:   { back:'', top:`<path d="M41 20 Q40 7 50 5 Q60 7 59 20 Q57 12 50 11 Q43 12 41 20Z" fill="${hc}"/>
      <path d="M37 20 Q37 16 41 14" stroke="${hc}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M63 20 Q63 16 59 14" stroke="${hc}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`, bangs:'' },
    long_straight:{ back:`<rect x="34" y="18" width="6" height="40" rx="3" fill="${hc}"/>
      <rect x="60" y="18" width="6" height="40" rx="3" fill="${hc}"/>`,
      top:`<ellipse cx="50" cy="13" rx="14" ry="9" fill="${hc}"/>
      <line x1="50" y1="6" x2="50" y2="18" stroke="${hd}" stroke-width="0.8"/>`, bangs:'' },
    beach_waves:  { back:`<path d="M35 18 Q30 28 31 40 Q30 50 33 58" stroke="${hc}" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M65 18 Q70 28 69 40 Q70 50 67 58" stroke="${hc}" stroke-width="6" fill="none" stroke-linecap="round"/>`,
      top:`<ellipse cx="50" cy="13" rx="14" ry="9" fill="${hc}"/>`, bangs:'' },
    high_pony:    { back:'', top:`<ellipse cx="50" cy="14" rx="13" ry="8" fill="${hc}"/>
      <circle cx="50" cy="6" r="3.5" fill="${hd}"/>
      <line x1="50" y1="3" x2="44" y2="0" stroke="${hc}" stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="3" x2="56" y2="0" stroke="${hc}" stroke-width="5" stroke-linecap="round"/>`, bangs:'' },
    bob:          { back:`<rect x="34" y="18" width="6" height="18" rx="3" fill="${hc}"/>
      <rect x="60" y="18" width="6" height="18" rx="3" fill="${hc}"/>
      <rect x="36" y="33" width="28" height="3" rx="1.5" fill="${hc}"/>`,
      top:`<ellipse cx="50" cy="13" rx="14" ry="9" fill="${hc}"/>`, bangs:'' },
    pixie:        { back:'', top:`<path d="M37 21 Q36 8 50 6 Q64 8 63 21 Q60 13 50 12 Q40 13 37 21Z" fill="${hc}"/>
      <path d="M44 8 Q50 4 56 8" stroke="${hc}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M38 14 Q35 10 37 8" stroke="${hc}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M62 14 Q65 10 63 8" stroke="${hc}" stroke-width="2" fill="none" stroke-linecap="round"/>`, bangs:'' },
    braided_crown:{ back:'', top:`<ellipse cx="50" cy="13" rx="14" ry="9" fill="${hc}"/>
      <ellipse cx="50" cy="13" rx="14" ry="9" fill="none" stroke="${hd}" stroke-width="3.5" stroke-dasharray="3 1.5"/>`, bangs:'' },
    space_buns:   { back:`<path d="M36 18 Q31 30 32 42" stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M64 18 Q69 30 68 42" stroke="${hc}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      top:`<ellipse cx="50" cy="13" rx="14" ry="9" fill="${hc}"/>
      <circle cx="36" cy="8" r="7" fill="${hc}"/>
      <path d="M29 5 Q36 3 43 5" stroke="${hd}" stroke-width="1.2" fill="none"/>
      <path d="M29 8 Q36 6 43 8" stroke="${hd}" stroke-width="0.7" fill="none"/>
      <circle cx="64" cy="8" r="7" fill="${hc}"/>
      <path d="M57 5 Q64 3 71 5" stroke="${hd}" stroke-width="1.2" fill="none"/>
      <path d="M57 8 Q64 6 71 8" stroke="${hd}" stroke-width="0.7" fill="none"/>`,
      bangs:`<path d="M50 14 Q43 18 38 23 Q39 27 42 27 Q46 22 50 20Z" fill="${hc}"/>
      <path d="M50 14 Q57 18 62 23 Q61 27 58 27 Q54 22 50 20Z" fill="${hc}"/>` },
    shaved:       { back:'', top:`<ellipse cx="50" cy="13" rx="13" ry="8" fill="${hc}" opacity="0.12"/>`, bangs:'' },
    afro:         { back:`<ellipse cx="50" cy="10" rx="19" ry="13" fill="${hc}"/>`,
      top:`<ellipse cx="50" cy="10" rx="19" ry="13" fill="${hc}"/>`, bangs:'' },
    cornrows:     { back:'', top:`<path d="M37 20 Q36 7 50 6 Q64 7 63 20 Q59 13 50 12 Q41 13 37 20Z" fill="${hc}"/>
      <line x1="39" y1="10" x2="61" y2="10" stroke="${hd}" stroke-width="1.8"/>
      <line x1="39" y1="13" x2="61" y2="13" stroke="${hd}" stroke-width="1.8"/>
      <line x1="38" y1="16" x2="62" y2="16" stroke="${hd}" stroke-width="1.8"/>`, bangs:'' },
    locs:         { back:`<line x1="40" y1="22" x2="37" y2="58" stroke="${hc}" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="46" y1="20" x2="44" y2="60" stroke="${hc}" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="54" y1="20" x2="56" y2="60" stroke="${hc}" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="60" y1="22" x2="63" y2="58" stroke="${hc}" stroke-width="4.5" stroke-linecap="round"/>`,
      top:`<ellipse cx="50" cy="13" rx="14" ry="9" fill="${hc}"/>`, bangs:'' },
    man_bun:      { back:'', top:`<ellipse cx="50" cy="14" rx="13" ry="8" fill="${hc}"/>
      <circle cx="50" cy="5" r="5.5" fill="${hc}" stroke="${hd}" stroke-width="0.8"/>`, bangs:'' },
    curly_fro:    { back:'', top:`<ellipse cx="50" cy="12" rx="16" ry="13" fill="${hc}"/>
      <ellipse cx="36" cy="13" rx="4.5" ry="4.5" fill="${hc}"/>
      <ellipse cx="64" cy="13" rx="4.5" ry="4.5" fill="${hc}"/>
      <ellipse cx="42" cy="5" rx="4" ry="4" fill="${hc}"/>
      <ellipse cx="58" cy="5" rx="4" ry="4" fill="${hc}"/>
      <ellipse cx="50" cy="2" rx="4" ry="4" fill="${hc}"/>`, bangs:'' },
    emo_sweep:    { back:'', top:`<ellipse cx="50" cy="13" rx="14" ry="9" fill="${hc}"/>`,
      bangs:`<path d="M50 10 Q42 15 36 25 Q35 30 38 30 Q42 22 48 16Z" fill="${hc}"/>
      <path d="M50 10 Q46 15 40 26" stroke="${hd}" stroke-width="0.6" fill="none"/>` },
    flat_top:     { back:'', top:`<rect x="37" y="6" width="26" height="9" rx="1" fill="${hc}"/>
      <path d="M37 15 Q37 11 40 11 L60 11 Q63 11 63 15Z" fill="${hc}"/>
      <line x1="37" y1="6" x2="63" y2="6" stroke="${hd}" stroke-width="1.3"/>`, bangs:'' },
  };
  return s[id] || s['default'];
}

function renderMiniAvatarSVG(gender, cosmetics, idx, playerName, hairStyle, skinToneIdx, hairColorIdx) {
  const female = gender === 'female';
  const mhclr = HAIR_COLORS[hairColorIdx ?? 0];
  const hc = mhclr.c1, hd = mhclr.c2;
  const eq = cosmetics || [];
  const mskn = SKIN_TONES[skinToneIdx ?? 1];
  const skin = mskn.s1, skinD = mskn.s4;

  // Pick a stable pose per player using name chars as seed
  const seed = playerName ? Array.from(playerName).reduce((a, c) => a + c.charCodeAt(0), 0) : idx;
  const MINI_POSES = [
    // 0: Double Bicep Flex
    { lU:[40,40,20,25], lF:[20,25,12,15], rU:[60,40,80,25], rF:[80,25,88,15] },
    // 1: Relaxed / arms at sides
    { lU:[40,40,34,58], lF:[34,58,32,70], rU:[60,40,66,58], rF:[66,58,68,70] },
    // 2: Victory — arms raised high
    { lU:[40,40,22,20], lF:[22,20,16,8],  rU:[60,40,78,20], rF:[78,20,84,8]  },
    // 3: Most Muscular / crab — arms wide and low
    { lU:[40,40,18,44], lF:[18,44,10,56], rU:[60,40,82,44], rF:[82,44,90,56] },
  ];
  const pose = MINI_POSES[seed % 4];
  const lwx = pose.lF[2] - 3, lwy = pose.lF[3] - 1;
  const rwx = pose.rF[2] - 3, rwy = pose.rF[3] - 1;

  let headCosmetic = '';
  if (eq.includes('do_rag')) {
    headCosmetic = `<path d="M38 24 Q38 9 50 8 Q62 9 62 24 Q58 13 50 12 Q42 13 38 24Z" fill="#111" opacity="0.93"/>`;
  } else if (eq.includes('iron_crown')) {
    headCosmetic = `<polygon points="39,18 41,11 45,15 50,8 55,15 59,11 61,18" fill="#9e7cff" stroke="#6a3dcc" stroke-width="0.5"/>`;
    headCosmetic += `<circle cx="50" cy="9" r="1.5" fill="#ffd700"/>`;
  } else if (eq.includes('laurel_wreath')) {
    headCosmetic = `<ellipse cx="50" cy="13" rx="14" ry="4" fill="none" stroke="#5a8a1a" stroke-width="2.5" opacity="0.9"/>`;
    headCosmetic += `<ellipse cx="50" cy="13" rx="14" ry="4" fill="none" stroke="#7bc82e" stroke-width="1.2"/>`;
    headCosmetic += `<circle cx="50" cy="9.5" r="1.5" fill="#ffd700"/>`;
  } else if (eq.includes('crown')) {
    headCosmetic = `<polygon points="40,10 43,4 47,8 50,2 53,8 57,4 60,10" fill="#ffd700" stroke="#b8860b" stroke-width="0.5"/>`;
  } else if (eq.includes('headband_gold')) {
    headCosmetic = `<rect x="38" y="17" width="24" height="3" rx="1.5" fill="#ffd700"/>`;
  } else if (eq.includes('headband_red')) {
    headCosmetic = `<rect x="38" y="17" width="24" height="3" rx="1.5" fill="#e53935"/>`;
  } else if (eq.includes('headband_blue')) {
    headCosmetic = `<rect x="38" y="17" width="24" height="3" rx="1.5" fill="#1e88e5"/>`;
  }

  let bodyCosmetic = '';
  if (eq.includes('borat_suit')) {
    bodyCosmetic += `<line x1="47" y1="38" x2="41" y2="34" stroke="#00c853" stroke-width="3" stroke-linecap="round"/>`;
    bodyCosmetic += `<line x1="53" y1="38" x2="59" y2="34" stroke="#00c853" stroke-width="3" stroke-linecap="round"/>`;
    bodyCosmetic += `<path d="M47 38 L44 57 L42 61 L50 61 L58 61 L56 57 L53 38Z" fill="#00c853" opacity="0.92"/>`;
  }
  if (eq.includes('tank_top') || eq.includes('stringer')) {
    bodyCosmetic += `<rect x="41" y="37" width="18" height="22" rx="3" fill="#2a2a3e" opacity="0.85"/>`;
    if (female) bodyCosmetic += `<rect x="43" y="38" width="14" height="11" rx="3" fill="#3a3a5e" opacity="0.6"/>`;
  }
  if (eq.includes('forged_tank')) {
    bodyCosmetic += `<rect x="41" y="37" width="18" height="22" rx="3" fill="#1a1a2e" opacity="0.92"/>`;
    bodyCosmetic += `<line x1="42" y1="58" x2="58" y2="58" stroke="#7c4dff" stroke-width="1"/>`;
  }
  if (eq.includes('forged_joggers')) {
    bodyCosmetic += `<rect x="37" y="60" width="26" height="42" rx="4" fill="#0d1117" opacity="0.9"/>`;
    bodyCosmetic += `<line x1="38" y1="62" x2="38" y2="100" stroke="#9e7cff" stroke-width="1" opacity="0.7"/>`;
    bodyCosmetic += `<line x1="62" y1="62" x2="62" y2="100" stroke="#9e7cff" stroke-width="1" opacity="0.7"/>`;
  }
  if (eq.includes('compression_set')) {
    bodyCosmetic += `<rect x="37" y="60" width="26" height="42" rx="4" fill="#0d1a2e" opacity="0.78"/>`;
  }
  if (eq.includes('lifting_belt')) bodyCosmetic += `<rect x="40" y="54" width="20" height="4" rx="1" fill="#8B6914"/>`;
  if (eq.includes('gold_chain')) {
    bodyCosmetic += `<path d="M46 37 Q50 43 54 37" stroke="#ffd700" stroke-width="1" fill="none"/>`;
    bodyCosmetic += `<circle cx="50" cy="42" r="2" fill="#ffd700"/>`;
  }

  const wristColor = eq.includes('wrist_wraps_red') ? '#e53935' : (eq.includes('wrist_wraps') || eq.includes('sweatbands')) ? '#ccc' : null;
  const gloveColor = eq.includes('lifting_gloves') ? '#6d4c2a' : null;
  const wristSVG = (wristColor || gloveColor) ? `<rect x="${lwx}" y="${lwy}" width="6" height="3" rx="1" fill="${wristColor || gloveColor}"/>
    <rect x="${rwx}" y="${rwy}" width="6" height="3" rx="1" fill="${wristColor || gloveColor}"/>` : '';
  const kneeSVG = eq.includes('knee_sleeves') ? `<rect x="39" y="79" width="9" height="5" rx="2" fill="#333"/>
    <rect x="52" y="79" width="9" height="5" rx="2" fill="#333"/>` : '';
  const feetSVG = eq.includes('flip_flops') ? `<ellipse cx="44" cy="104" rx="7" ry="2.5" fill="#0288d1"/>
    <ellipse cx="56" cy="104" rx="7" ry="2.5" fill="#0288d1"/>
    <line x1="44" y1="101" x2="44" y2="104" stroke="#b3e5fc" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="56" y1="101" x2="56" y2="104" stroke="#b3e5fc" stroke-width="1.5" stroke-linecap="round"/>` : '';

  const resolvedHair = hairStyle || (female ? 'space_buns' : 'default');
  const hair = getHairSVG(resolvedHair, hc, hd);
  const sideHairSVG = hair.back;
  const femaleTopHairSVG = hair.top;
  const bangsSVG = hair.bangs;

  return `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" class="mini-avatar">
    ${sideHairSVG}
    <!-- Arms: posed -->
    <line x1="${pose.lU[0]}" y1="${pose.lU[1]}" x2="${pose.lU[2]}" y2="${pose.lU[3]}" stroke-width="10" stroke="${skin}" stroke-linecap="round"/>
    <line x1="${pose.lF[0]}" y1="${pose.lF[1]}" x2="${pose.lF[2]}" y2="${pose.lF[3]}" stroke-width="8" stroke="${skinD}" stroke-linecap="round"/>
    <line x1="${pose.rU[0]}" y1="${pose.rU[1]}" x2="${pose.rU[2]}" y2="${pose.rU[3]}" stroke-width="10" stroke="${skin}" stroke-linecap="round"/>
    <line x1="${pose.rF[0]}" y1="${pose.rF[1]}" x2="${pose.rF[2]}" y2="${pose.rF[3]}" stroke-width="8" stroke="${skinD}" stroke-linecap="round"/>
    ${wristSVG}
    <!-- Torso -->
    <rect x="40" y="36" width="20" height="26" rx="6" fill="${skin}"/>
    ${female ? `<rect x="41" y="38" width="18" height="12" rx="4" fill="#2a2a3e" opacity="0.7"/>` : ''}
    ${bodyCosmetic}
    <!-- Shorts -->
    <rect x="38" y="60" width="24" height="10" rx="3" fill="#1a1a2e"/>
    <line x1="50" y1="60" x2="50" y2="70" stroke="#2a2a4e" stroke-width="0.8"/>
    <!-- Legs -->
    <rect x="39" y="69" width="10" height="20" rx="4" fill="${skin}"/>
    <rect x="51" y="69" width="10" height="20" rx="4" fill="${skin}"/>
    ${kneeSVG}
    <rect x="40" y="87" width="8" height="14" rx="3" fill="${skinD}"/>
    <rect x="52" y="87" width="8" height="14" rx="3" fill="${skinD}"/>
    ${feetSVG}
    <!-- Neck -->
    <rect x="47" y="30" width="6" height="8" rx="3" fill="${skinD}"/>
    <!-- Head -->
    <ellipse cx="50" cy="22" rx="13" ry="14" fill="${skin}"/>
    ${femaleTopHairSVG}
    ${bangsSVG}
    <ellipse cx="45" cy="${female ? 24 : 21}" rx="2" ry="2.2" fill="#2c1810"/>
    <ellipse cx="55" cy="${female ? 24 : 21}" rx="2" ry="2.2" fill="#2c1810"/>
    <circle cx="45.8" cy="${female ? 23.2 : 20.2}" r="0.8" fill="#fff"/>
    <circle cx="55.8" cy="${female ? 23.2 : 20.2}" r="0.8" fill="#fff"/>
    <path d="M47 ${female ? 30 : 28} Q50 ${female ? 33 : 31} 53 ${female ? 30 : 28}" stroke="${skinD}" stroke-width="0.9" fill="none"/>
    ${headCosmetic}
  </svg>`;
}

async function renderLeaderboard(type) {
  document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.lb-tab[onclick*="${type}"]`)?.classList.add('active');

  const container = document.getElementById('leaderboard-list');
  const podium = document.getElementById('lb-podium');
  if (podium) podium.innerHTML = '';

  if (type === 'competition') {
    renderCompetitionLeaderboard(container);
    return;
  }

  checkPeriodXPReset();
  saveWithPin();
  const overall = calcOverallLevel(state.muscles);
  const myXP = overall.level * 1000 + overall.xp;
  const myWeeklyXP  = state.weeklyXP  || 0;
  const myMonthlyXP = state.monthlyXP || 0;
  const myYearlyXP  = state.yearlyXP  || 0;

  const periodXPKey = type === 'weekly' ? '_weeklyXP' : type === 'monthly' ? '_monthlyXP' : '_yearlyXP';
  const periodStartKey = type === 'weekly' ? '_weeklyXPStart' : type === 'monthly' ? '_monthlyXPStart' : '_yearlyXPStart';
  const periodStart = type === 'weekly' ? getWeekStart() : type === 'monthly' ? getMonthStart() : getYearStart();
  const myPeriodXP  = type === 'weekly' ? myWeeklyXP : type === 'monthly' ? myMonthlyXP : myYearlyXP;

  let players = null;

  if (db) {
    try {
      container.innerHTML = '<p class="muted" style="text-align:center;padding:16px">Loading...</p>';
      const snapshot = await db.collection('users').orderBy('_leaderboardXP', 'desc').limit(100).get();
      players = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        const lastActive = d._lastActive || '';
        // Include users active this period OR who have a matching period start (new tracking)
        const hasNewTracking = d[periodStartKey] === periodStart;
        const wasActive = lastActive >= periodStart;
        if (!hasNewTracking && !wasActive && doc.id !== currentUser) return;
        // Use new period XP if available and current, else fall back to total XP
        const pxp = hasNewTracking ? (d[periodXPKey] || 0) : (d._leaderboardXP || 0);
        players.push({
          name: d._leaderboardName || doc.id,
          xp: pxp,
          level: d._leaderboardLevel || 1,
          you: doc.id === currentUser,
          gender: d._gender || 'male',
          cosmetics: d._cosmetics || [],
          hair: d._hair || '',
        });
      });
      players.sort((a, b) => b.xp - a.xp);

      const hasMe = players.some(p => p.you);
      if (!hasMe) players.push({ name: state.name, xp: myPeriodXP, level: overall.level, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair });
      players.sort((a, b) => b.xp - a.xp);
    } catch (e) { players = null; }
  }

  if (!players) {
    players = [{ name: state.name, xp: myPeriodXP, level: overall.level, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair }];
  }

  // Always use in-memory period XP for current user (Firebase may be stale until next sync)
  players = players.map(p => p.you ? { ...p, xp: myPeriodXP, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair } : p);
  players.sort((a, b) => b.xp - a.xp);

  checkRankAchievements(type, players);
  renderPodium(players.slice(0, 3));

  const label = type === 'weekly' ? 'Wk XP' : type === 'monthly' ? 'Mo XP' : 'Yr XP';
  container.innerHTML = players.map((p, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="lb-entry ${p.you ? 'you' : ''}">
      <span class="lb-rank ${rankClass}">#${i + 1}</span>
      <span class="lb-name">${p.name}${p.you ? ' (You)' : ''}</span>
      <span class="lb-xp">${p.xp.toLocaleString()} ${label}</span>
    </div>`;
  }).join('');
}

function renderCompetitionLeaderboard(container) {
  const podium = document.getElementById('lb-podium');
  if (podium) podium.innerHTML = '';
  container.innerHTML = `
    <div class="comp-subtabs">
      <button class="comp-stab active" onclick="MQ._compTab('fight',this)">⚔️ Fight</button>
      <button class="comp-stab" onclick="MQ._compTab('show',this)">💪 Show</button>
    </div>
    <div id="comp-sub-content"></div>`;
  _compTab('fight', container.querySelector('.comp-stab'));
}

async function _compTab(sub, btn) {
  document.querySelectorAll('.comp-stab').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const sub_container = document.getElementById('comp-sub-content');
  if (!sub_container) return;
  if (sub === 'fight') await renderFightLeaderboard(sub_container);
  if (sub === 'show')  await renderBBLeaderboard(sub_container);
}

function renderPodium(top3, sublabelKey) {
  const podium = document.getElementById('lb-podium');
  if (!podium) return;
  if (!top3.length) { podium.innerHTML = ''; return; }
  podium.innerHTML = `<div class="lb-podium">
    ${[1, 0, 2].map(pos => {
      const p = top3[pos];
      if (!p) return `<div class="podium-slot empty"></div>`;
      const platH = pos === 0 ? 68 : pos === 1 ? 48 : 32;
      const medal = pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉';
      const rank = pos === 0 ? 1 : pos === 1 ? 2 : 3;
      const sub = sublabelKey ? (p[sublabelKey] ?? '') : (p.level ? `Lv.${p.level}` : '');
      return `<div class="podium-slot rank-${rank}${p.you ? ' podium-you' : ''}">
        <div class="podium-avatar">${renderMiniAvatarSVG(p.gender || 'male', p.cosmetics || [], pos, p.name || '', p.hair || (p.gender === 'female' ? 'space_buns' : 'default'), p._skinTone ?? 1, p._hairColor ?? 0)}</div>
        <div class="podium-name">${p.name.length > 8 ? p.name.slice(0,8)+'…' : p.name}</div>
        <div class="podium-medal">${medal}</div>
        <div class="podium-platform" style="height:${platH}px">
          <span class="podium-rank">#${rank}</span>
          <span class="podium-lv">${sub}</span>
        </div>
      </div>`;
    }).join('')}
  </div>`;
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
          gender: d._gender || 'male',
          cosmetics: d._cosmetics || [],
        });
      });
      const hasMe = fighters.some(f => f.you);
      if (!hasMe) {
        fighters.push({ name: state.name, kos: myKOs, highest: myHighest, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair });
      }
      fighters.sort((a, b) => b.kos - a.kos || b.highest - a.highest);
    } catch (e) {
      fighters = null;
    }
  }

  if (!fighters) {
    fighters = [
      { name: state.name, kos: myKOs, highest: myHighest, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair },
    ];
  }

  fighters = fighters.map(f => f.you ? { ...f, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair } : f);

  if (fighters.length === 0 || (fighters.length === 1 && fighters[0].kos === 0)) {
    document.getElementById('lb-podium').innerHTML = '';
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No fights recorded yet. Hit the ring!</p>';
    return;
  }

  fighters.forEach(f => { f.kosLabel = `${f.kos} KOs`; });
  renderPodium(fighters.slice(0, 3), 'kosLabel');

  container.innerHTML = fighters.map((f, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="lb-entry ${f.you ? 'you' : ''}">
      <span class="lb-rank ${rankClass}">#${i + 1}</span>
      <span class="lb-name">${f.name}${f.you ? ' (You)' : ''}</span>
      <span class="lb-xp" style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;line-height:1.2">
        <span>${f.kos} KOs</span>
        <span style="font-size:10px;color:var(--text-muted)">Best: Lv.${f.highest} · Streak: ${f.streak}</span>
      </span>
    </div>`;
  }).join('');
}

async function renderBBLeaderboard(container) {
  let players = null;

  const myBB = JSON.parse(localStorage.getItem('musclequest_bbcomp') || '{}');
  const myWins = myBB.totalWins || 0;
  const myComps = myBB.totalComps || 0;
  const myStreak = myBB.bbStreak || 0;

  if (db) {
    try {
      container.innerHTML = '<p class="muted" style="text-align:center;padding:16px">Loading...</p>';
      const snapshot = await db.collection('users')
        .orderBy('_bbWins', 'desc')
        .limit(20)
        .get();
      players = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if ((d._bbWins || 0) === 0) return;
        players.push({
          name: d._leaderboardName || doc.id,
          wins: d._bbWins || 0,
          comps: d._bbComps || 0,
          streak: d._bbStreak || 0,
          you: doc.id === currentUser,
          gender: d._gender || 'male',
          cosmetics: d._cosmetics || [],
        });
      });
      const hasMe = players.some(p => p.you);
      if (!hasMe) {
        players.push({ name: state.name, wins: myWins, comps: myComps, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair });
      }
      players.sort((a, b) => b.wins - a.wins || b.streak - a.streak);
    } catch (e) {
      players = null;
    }
  }

  if (!players) {
    players = [
      { name: state.name, wins: myWins, comps: myComps, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair },
    ];
  }

  players = players.map(p => p.you ? { ...p, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair } : p);

  if (players.length === 0 || (players.length === 1 && players[0].wins === 0)) {
    document.getElementById('lb-podium').innerHTML = '';
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No shows recorded yet. Hit the stage!</p>';
    return;
  }

  players.forEach(p => { p.winsLabel = `${p.wins} Win${p.wins !== 1 ? 's' : ''}`; });
  renderPodium(players.slice(0, 3), 'winsLabel');

  container.innerHTML = players.map((p, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    return `<div class="lb-entry ${p.you ? 'you' : ''}">
      <span class="lb-rank ${rankClass}">#${i + 1}</span>
      <span class="lb-name">${p.name}${p.you ? ' (You)' : ''}</span>
      <span class="lb-xp" style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;line-height:1.2">
        <span>💪 ${p.wins} Win${p.wins !== 1 ? 's' : ''}</span>
        <span style="font-size:10px;color:var(--text-muted)">Shows: ${p.comps} · Streak: ${p.streak}</span>
      </span>
    </div>`;
  }).join('');
}

function showLeaderboard(type) { renderLeaderboard(type); }

function checkRankAchievements(type, players) {
  const me = players.find(p => p.you);
  if (!me) return;
  const rank = players.indexOf(me);
  if (rank !== 0) return;
  let field = null;
  if (type === 'weekly')  field = '_rank1Weekly';
  if (type === 'monthly') field = '_rank1Monthly';
  if (type === 'yearly')  field = '_rank1Yearly';
  if (!field) return;
  if (!state[field]) {
    state[field] = 1;
    checkAchievements();
    saveWithPin();
  }
}

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

function renderSkinToneSwatches() {
  const el = document.getElementById('skin-tone-swatches');
  if (!el) return;
  const cur = state.skinTone ?? 1;
  el.innerHTML = SKIN_TONES.map((t, i) => `
    <button onclick="MQ.setSkinTone(${i})" title="${t.name}" style="
      width:32px;height:32px;border-radius:50%;background:${t.s2};border:3px solid ${i === cur ? '#9e7cff' : 'transparent'};
      cursor:pointer;outline:none;transition:border-color .15s">
    </button>`).join('');
}

async function submitHealthForm() {
  if (!currentUser) { toast('Log in first'); return; }
  const steps    = parseFloat(document.getElementById('hs-steps')?.value) || 0;
  const protein  = parseFloat(document.getElementById('hs-protein')?.value) || 0;
  const cal      = parseFloat(document.getElementById('hs-cal')?.value) || 0;
  const sleep    = parseFloat(document.getElementById('hs-sleep')?.value) || 0;
  const exmins   = parseFloat(document.getElementById('hs-exmins')?.value) || 0;
  const url = `https://firestore.googleapis.com/v1/projects/musclequest-c5052/databases/(default)/documents/healthSync/${currentUser}?key=AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc`;
  const body = JSON.stringify({ fields: {
    date:            { stringValue: todayStr() },
    steps:           { doubleValue: steps },
    protein:         { doubleValue: protein },
    activeCalories:  { doubleValue: cal },
    sleepHours:      { doubleValue: sleep },
    exerciseMinutes: { doubleValue: exmins },
  }});
  try {
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await loadHealthSync();
    const el = document.getElementById('health-sync-setup');
    if (el) el.innerHTML = getHealthSyncSetupHTML();
    toast('Health stats saved! ✅');
  } catch(e) {
    toast('Save failed: ' + e.message);
  }
}

function toggleShortcutGuide() {
  const el = document.getElementById('shortcut-guide');
  if (!el) return;
  const open = el.style.display === 'none';
  el.style.display = open ? 'block' : 'none';
  const btn = el.previousElementSibling;
  if (btn) btn.textContent = open ? '⚡ Hide Shortcut Guide' : '⚡ Automate with iPhone Shortcuts';
}

async function refreshHealthSync() {
  toast('Refreshing…');
  await loadHealthSync();
  const el = document.getElementById('health-sync-setup');
  if (el) el.innerHTML = getHealthSyncSetupHTML();
  toast(healthSync ? 'Health data loaded! ✅' : 'No data found yet');
}


function copyHealthJSON() {
  const json = '{"fields":{"date":{"stringValue":"myDate"},"steps":{"doubleValue":mySteps},"protein":{"doubleValue":myProtein},"activeCalories":{"doubleValue":myActiveCal},"sleepHours":{"doubleValue":mySleepHours},"exerciseMinutes":{"doubleValue":0}}}';
  navigator.clipboard.writeText(json).then(() => toast('Copied!'));
}

function setSkinTone(idx) {
  state.skinTone = idx;
  saveWithPin();
  renderAvatar();
  renderSkinToneSwatches();
}

function setHairColor(idx) {
  state.hairColor = idx;
  saveWithPin();
  renderAvatar();
  if (typeof GainsShop !== 'undefined') GainsShop.refreshBarberPreview();
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
  const purchased = state.purchasedCosmetics || [];
  return COSMETICS.filter(c => state.achievements.includes(c.unlock) || purchased.includes(c.id));
}

function toggleCosmetic(id) {
  const cosmetic = COSMETICS.find(c => c.id === id);
  const purchased = state.purchasedCosmetics || [];
  if (!cosmetic || (!state.achievements.includes(cosmetic.unlock) && !purchased.includes(id))) return;

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
  const purchased = state.purchasedCosmetics || [];
  container.innerHTML = COSMETICS.map(c => {
    const unlocked = state.achievements.includes(c.unlock) || purchased.includes(c.id);
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
  showTab, submitWorkout, onMuscleGroupChange, showLeaderboard, _compTab, toggleAvatarView,
  closeLevelUp, closeAchievement, updateName, updateGender, resetProgress,
  exportData, importData, addExerciseRow, removeExerciseRow,
  onEntryMuscleChange, showHistoryTab, changeSetCount,
  login, logout, toggleCosmetic, selectPose, toggleSettings, toast, syncStateFromStorage, setSkinTone, setHairColor, copyHealthJSON, refreshHealthSync, submitHealthForm, toggleShortcutGuide, checkHealthWriteTest,
  renderMiniAvatarSVG, getHairSVG,
};

})();
