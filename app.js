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
  back:       ['Deadlift','Pull-ups','Barbell Row','Lat Pulldown','Cable Row','T-Bar Row','Back Extension','Hyperextension','Other'],
  abs:        ['Crunches','Planks','Leg Raises','Russian Twists','Ab Rollout','Cable Crunch','Other'],
  glutes:     ['Hip Thrust','Glute Bridge','Romanian Deadlift','Cable Kickback','Bulgarian Split Squat','Hip Abductor','Hip Adductor','Other'],
  quads:      ['Squat','Leg Press','Lunges','Leg Extension','Front Squat','Goblet Squat','Other'],
  hamstrings: ['Leg Curl','Stiff-Leg Deadlift','Nordic Curl','Good Mornings','Glute-Ham Raise','Other'],
  calves:     ['Calf Raise (Standing)','Calf Raise (Seated)','Donkey Calf Raise','Jump Rope','Other'],
  cardio:     ['Walking','Running','Jogging','Cycling','Stairmaster','Elliptical','Rowing Machine','Swimming','Jump Rope','HIIT','Yoga','Pilates','Dance','Hiking','Boxing','Kickboxing','Tennis','Pickleball','Skating','Cross-Country Skiing','Other'],
  rest:       ['Rest & Recovery'],
};

const DAY_PRESETS = [
  { label: 'Rest',                    muscles: [] },
  { label: 'Chest',                   muscles: ['chest'] },
  { label: 'Back',                    muscles: ['back'] },
  { label: 'Push',                    muscles: ['chest','shoulders','triceps'] },
  { label: 'Pull',                    muscles: ['back','biceps'] },
  { label: 'Legs',                    muscles: ['quads','hamstrings','glutes','calves'] },
  { label: 'Quads & Glutes',          muscles: ['quads','glutes'] },
  { label: 'Hamstrings & Calves',     muscles: ['hamstrings','calves'] },
  { label: 'Shoulders & Arms',        muscles: ['shoulders','biceps','triceps'] },
  { label: 'Chest & Back',            muscles: ['chest','back'] },
  { label: 'Chest & Biceps',          muscles: ['chest','biceps'] },
  { label: 'Chest & Triceps',         muscles: ['chest','triceps'] },
  { label: 'Back & Biceps',           muscles: ['back','biceps'] },
  { label: 'Shoulders & Tri',         muscles: ['shoulders','triceps'] },
  { label: 'Arms',                    muscles: ['biceps','triceps'] },
  { label: 'Shoulders',               muscles: ['shoulders'] },
  { label: 'Abs',                     muscles: ['abs'] },
  { label: 'Abs & Cardio',            muscles: ['abs','cardio'] },
  { label: 'Cardio',                  muscles: ['cardio'] },
  { label: 'Upper Body',              muscles: ['chest','back','shoulders','biceps','triceps'] },
  { label: 'Lower Body',              muscles: ['quads','hamstrings','glutes','calves'] },
  { label: 'Full Body',               muscles: ['chest','back','shoulders','biceps','triceps','quads','hamstrings','glutes','calves','abs'] },
];

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

// Exercises scored on time (reps = seconds held) rather than weight × reps
const TIMED_EXERCISES = new Set([
  'Planks','Ab Rollout','Yoga','Pilates','L-Sit','Wall Sit','Dead Hang',
  'Hollow Hold','Superman Hold','Side Plank',
]);

function calcWorkoutXP(sets, duration) {
  // Women lift ~30% less for equivalent effort — normalise weight so XP is fair
  const genderMult = state.gender === 'female' ? (1 / 0.7) : 1;
  let base = 0;
  for (const s of sets) {
    if (TIMED_EXERCISES.has(s.exercise)) {
      // reps field = seconds held; award XP per 10s of hold
      if (s.reps > 0) base += Math.floor(s.reps / 10);
    } else if (s.weight > 0 && s.reps > 0) {
      base += Math.floor((s.weight * genderMult * s.reps) / 120);
    } else if (s.reps > 0) {
      // bodyweight movements with no weight (push-ups, pull-ups etc)
      base += Math.floor(s.reps / 5);
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
    _pendingRank1Weekly: null, _pendingRank1Monthly: null, _pendingRank1Yearly: null,
    skinTone: 1,
    hairColor: 0,
    goals: {
      currentWeight: null, goalWeight: null, heightCm: null, birthYear: null,
      weeklyGoal: 'maintain', activityLevel: 'moderate', startDate: null, exerciseGoal: 30,
    },
    customSplits: [],
    activeSplitId: null,
    splitDayIndices: {},
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
  // Expire stale vial so it doesn't linger in the account
  if (state.activeVial && state.activeVial.expiresAt <= Date.now()) delete state.activeVial;
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
    _pendingRank1Weekly: state._pendingRank1Weekly || null,
    _pendingRank1Monthly: state._pendingRank1Monthly || null,
    _pendingRank1Yearly: state._pendingRank1Yearly || null,
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
  if (!currentUser) return;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/musclequest-c5052/databases/(default)/documents/healthSync/${currentUser}?key=AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return;
    const json = await res.json();
    if (!json.fields) return;
    const f = json.fields;
    healthSync = {
      date:              f.date?.stringValue              ?? '',
      steps:             f.steps?.doubleValue             ?? f.steps?.integerValue             ?? 0,
      protein:           f.protein?.doubleValue           ?? f.protein?.integerValue           ?? 0,
      caloriesConsumed:  f.caloriesConsumed?.doubleValue  ?? f.caloriesConsumed?.integerValue  ?? 0,
      activeCalories:    f.activeCalories?.doubleValue    ?? f.activeCalories?.integerValue    ?? 0,
      sleepHours:        f.sleepHours?.doubleValue        ?? f.sleepHours?.integerValue        ?? 0,
      exerciseMinutes:   f.exerciseMinutes?.doubleValue   ?? f.exerciseMinutes?.integerValue   ?? 0,
    };
    renderHealthPanel();
  } catch(e) { console.warn('healthSync fetch error:', e); }
}

async function checkHealthWriteTest() {
  const url = `https://firestore.googleapis.com/v1/projects/musclequest-c5052/databases/(default)/documents/healthSync/${currentUser}?key=AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (res.ok && json.fields) {
      const f = json.fields;
      const steps = f.steps?.doubleValue ?? f.steps?.integerValue ?? '?';
      const protein = f.protein?.doubleValue ?? f.protein?.integerValue ?? '?';
      const date = f.date?.stringValue ?? '?';
      toast(`✅ Firestore has: ${steps} steps, ${protein}g protein, date: ${date}`, 'success');
      console.log('Firestore raw fields:', JSON.stringify(f));
      // Now force-load via SDK and log result
      try {
        const doc = await db.collection('healthSync').doc(currentUser).get({ source: 'server' });
        console.log('SDK doc.exists:', doc.exists, 'data:', JSON.stringify(doc.data()));
        if (doc.exists) {
          healthSync = doc.data();
          renderHealthPanel();
          const el = document.getElementById('health-panel');
          console.log('health-panel innerHTML length:', el?.innerHTML?.length, 'visible:', el?.offsetParent !== null);
        }
      } catch(e2) { console.error('SDK read error:', e2); }
    } else if (res.status === 404) {
      toast('❌ No document in Firestore — Shortcut write may be blocked', 'error');
    } else {
      toast(`⚠️ Firestore returned ${res.status}: ${JSON.stringify(json)}`, 'error');
    }
  } catch(e) {
    toast('❌ Could not reach Firestore: ' + e.message, 'error');
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

  const today = todayShortStr();
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
  const lastSync = healthSync ? `<p style="color:var(--text-muted);font-size:12px;text-align:center;margin:8px 0 0">Last logged: <strong>${healthSync.date}</strong> ${healthSync.date === todayShortStr() ? '✓ Today' : ''}</p>` : '';
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
        <label class="health-field-label">🍽️ Calories Eaten</label>
        <input type="number" id="hs-food-cal" class="health-input" inputmode="numeric" value="${healthSync?.caloriesConsumed || 0}"/>
      </div>
      <div class="health-field">
        <label class="health-field-label">🔥 Active Calories Burned</label>
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
        <div class="setup-step"><span class="step-num">2</span><span>Search <strong>"Find Health Samples"</strong> — add it <strong>6 times</strong>, once each for:<br><em>Step Count, Active Energy Burned, Apple Exercise Time, Dietary Protein, Dietary Energy, Sleep Analysis</em><br><span style="font-size:11px;color:var(--text-muted)">💡 LoseIt exports calories to <strong>Dietary Energy</strong> in Apple Health — make sure LoseIt → Settings → Health has "Calories" toggled on.</span></span></div>
        <div class="setup-step"><span class="step-num">3</span><span>After each one, add <strong>"Calculate Statistics"</strong> → set to <strong>Sum</strong>. Tap the output label to rename them: <em>myStepsSum, myActiveCal, myExerciseMins, myProtein, myCalorieIntake, mySleepRaw</em></span></div>
        <div class="setup-step"><span class="step-num">4</span><span>Add <strong>"Calculate"</strong> → type: <code>mySleepRaw ÷ 3600</code> (use the magic pill for mySleepRaw) → rename output <em>mySleepHours</em></span></div>
        <div class="setup-step"><span class="step-num">5</span><span>Add <strong>"Format Date"</strong> → Current Date → Format: Custom → <code>M/d/yy</code> → rename <em>myDate</em></span></div>
        <div class="setup-step"><span class="step-num">6</span><span>Add a <strong>"Text"</strong> action. Tap the field, then tap the <strong>&gt;</strong> arrow above the keyboard to insert magic pills. Build this structure — type the plain text parts, insert pills for the values (tap to copy template):</span></div>
      </div>
      <div class="setup-url-box" onclick="MQ.copyHealthJSON()">
        <code class="setup-url" style="font-size:10px">{"fields":{"date":{"stringValue":"myDate"},"steps":{"doubleValue":myStepsSum},"protein":{"doubleValue":myProtein},"caloriesConsumed":{"doubleValue":myCalorieIntake},"activeCalories":{"doubleValue":myActiveCal},"sleepHours":{"doubleValue":mySleepHours},"exerciseMinutes":{"doubleValue":myExerciseMins}}}</code>
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
function todayShortStr() {
  const d = new Date();
  return `${d.getMonth()+1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
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

  // When a period rolls over, finalize any pending rank-#1 achievements
  if (state.weeklyXPStart && state.weeklyXPStart !== ws) {
    if (state._pendingRank1Weekly === state.weeklyXPStart && !state._rank1Weekly) {
      state._rank1Weekly = 1; checkAchievements();
    }
    state._pendingRank1Weekly = null;
  }
  if (state.monthlyXPStart && state.monthlyXPStart !== ms) {
    if (state._pendingRank1Monthly === state.monthlyXPStart && !state._rank1Monthly) {
      state._rank1Monthly = 1; checkAchievements();
    }
    state._pendingRank1Monthly = null;
  }
  if (state.yearlyXPStart && state.yearlyXPStart !== ys) {
    if (state._pendingRank1Yearly === state.yearlyXPStart && !state._rank1Yearly) {
      state._rank1Yearly = 1; checkAchievements();
    }
    state._pendingRank1Yearly = null;
  }

  // Always recompute period XP from the workout log — single source of truth
  state.weeklyXP      = xpFromLogSince(ws);
  state.weeklyXPStart = ws;
  state.monthlyXP      = xpFromLogSince(ms + '-01');
  state.monthlyXPStart = ms;
  state.yearlyXP      = xpFromLogSince(ys + '-01-01');
  state.yearlyXPStart = ys;
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

  // Vial XP multiplier — stored in state.activeVial so it persists with the account
  const vial = state.activeVial && state.activeVial.expiresAt > now ? state.activeVial : null;
  const vialMult = vial ? vial.mult : 1;

  for (const p of parsed) {
    let totalXP = 0;
    let numSets = p.sets.length;
    let goldEarned = 0;

    if (p.isRest) {
      totalXP = Math.floor((hasBuff('bcaa') ? 150 : 45) * vialMult);
      const restXPPer = Math.floor(totalXP / 10);
      for (const mk of Object.keys(MUSCLES)) {
        if (mk === 'rest' || mk === 'cardio') continue;
        awardMuscleXP(mk, restXPPer);
      }
      goldEarned = 10;
      numSets = 0;
    } else if (p.isCardio) {
      const cardioBase = Math.floor(p.duration * 0.8 * vialMult);
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
      const baseXP = Math.floor(calcWorkoutXP(p.sets, p.duration) * vialMult);
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

  checkPeriodXPReset(); // recomputes all period XP from workoutLog (already includes this session)

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
    renderGoalsSection();
    renderSettingsSplits();
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
  renderNutritionChart();
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
  { level: 5,  name: 'Frank Zane Vacuum',     lArm: 105,  rArm: -105, lFore: 55,   rFore: -55 },
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

  // Tattoo — compute _activeTat before headHTML so face tat can go inside head group
  const _TAT_DEFS = window._TATTOOS || [];
  const _activeTat = _TAT_DEFS.find(t => t.id === state.tattoo);
  // Face tats: translate(0,36) scale(2,2) maps mini head coords (cx=50,cy=22) → main head (cx=100,cy=80)
  const _faceTatSVG = (_activeTat?.placement === 'face')
    ? `<g transform="translate(0,36) scale(2,2)" opacity="0.9">${_activeTat.svg}</g>` : '';

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
      ${_faceTatSVG}
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

  // Arm tattoo: inject inside arm group so it rotates with arm
  // Mini arm center (37,47) → scale(2,2) → (74,94) → translate(lElbowX-74,53) → (lElbowX,147)
  const _armTatSVG = (_activeTat?.placement === 'arm')
    ? `<g transform="translate(${lElbowX - 74},53) scale(2,2)" opacity="0.88">${_activeTat.svg}</g>` : '';
  // Chest/body tattoos: root overlay, translate(0,39) scale(2,2) maps mini chest (50,47) → main chest (100,133)
  const _chestTatSVG = (_activeTat && _activeTat.placement !== 'face' && _activeTat.placement !== 'arm')
    ? `<g transform="translate(0,39) scale(2,2)" opacity="0.88">${_activeTat.svg}</g>` : '';

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
      ${_armTatSVG}
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
    ${_chestTatSVG}
    ${pose.name !== 'Relaxed' ? `<text x="100" y="312" text-anchor="middle" font-size="9" fill="#9e7cff" font-family="Inter, sans-serif" opacity="0.7">${pose.name}</text>` : ''}
  </svg>`;
  renderPetCompanion();
}

function renderPetCompanion() {
  const wrapper = document.querySelector('.avatar-wrapper');
  if (!wrapper) return;
  let el = document.getElementById('pet-companion');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pet-companion';
    el.className = 'pet-companion-wrap';
    wrapper.appendChild(el);
  }
  const pets = state.pets || {};
  const ownedIds = Object.keys(pets).filter(k => pets[k]);
  if (!ownedIds.length) { el.innerHTML = ''; return; }
  // Show the first owned pet (cycle over time if multiple)
  const pid = ownedIds[Math.floor(Date.now() / 8000) % ownedIds.length];
  if (typeof GainsShop === 'undefined') return;
  const icon = GainsShop._petIcon(pid, 54);
  el.innerHTML = `<div class="pet-companion-bob">${icon}</div>`;
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

function populateMuscleGroupSelect() {
  const sel = document.getElementById('split-select');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = `<option value="">Choose split or muscle…</option>`;

  const splits = state.customSplits || [];
  if (splits.length) {
    const og = document.createElement('optgroup');
    og.label = 'My Splits';
    splits.forEach(sp => {
      const opt = document.createElement('option');
      opt.value = `split:${sp.id}`;
      opt.textContent = sp.name;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  }

  const og2 = document.createElement('optgroup');
  og2.label = 'Quick Pick — Muscle';
  ['chest','back','biceps','triceps','shoulders','quads','hamstrings','glutes','calves','abs','cardio'].forEach(key => {
    const opt = document.createElement('option');
    opt.value = `muscle:${key}`;
    opt.textContent = MUSCLES[key]?.name || key;
    og2.appendChild(opt);
  });
  sel.appendChild(og2);

  if (prev) sel.value = prev;
  if (state.activeSplitId && !prev) sel.value = `split:${state.activeSplitId}`;
}

function onMuscleGroupChange() {}

function onSplitGroupChange() { onSplitChange(); }

function onSplitChange() {
  const sel = document.getElementById('split-select');
  const chipsWrapper = document.getElementById('split-exercise-chips');
  const chipsList = document.getElementById('split-chips-list');
  const val = sel?.value || '';

  if (!val) { if (chipsWrapper) chipsWrapper.style.display = 'none'; return; }

  if (val.startsWith('split:')) {
    const splitId = val.slice(6);
    const split = (state.customSplits || []).find(s => s.id === splitId);
    if (!split) { if (chipsWrapper) chipsWrapper.style.display = 'none'; return; }
    state.activeSplitId = splitId;
    if (!state.splitDayIndices) state.splitDayIndices = {};
    if (state.splitDayIndices[splitId] == null) state.splitDayIndices[splitId] = 0;
    saveWithPin();
    _renderSplitDay(split, state.splitDayIndices[splitId]);
  } else {
    // Quick Pick — single muscle group
    const muscle = val.startsWith('muscle:') ? val.slice(7) : val;
    const exercises = (EXERCISES[muscle] || []).filter(e => e !== 'Other');
    const hintEl = chipsWrapper?.querySelector('p');
    if (hintEl) hintEl.textContent = 'Tap to quick-add to workout above:';
    // Hide the day nav if showing
    document.getElementById('split-day-nav')?.remove();
    chipsList.innerHTML = exercises.map(ex => `
      <button onclick="MQ.quickAddExercise('${muscle}','${ex.replace(/'/g,"\\'")}',this)"
        style="font-size:13px;padding:6px 12px;border-radius:20px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);cursor:pointer;transition:background 0.15s"
        onmouseover="this.style.background='rgba(124,77,255,0.18)'" onmouseout="this.style.background='var(--bg-card)'">
        ${ex}
      </button>`).join('');
    if (chipsWrapper) chipsWrapper.style.display = exercises.length ? 'block' : 'none';
  }
}

function _renderSplitDay(split, dayIdx) {
  const chipsWrapper = document.getElementById('split-exercise-chips');
  const chipsList = document.getElementById('split-chips-list');
  if (!chipsWrapper || !chipsList) return;

  const total = split.days.length;
  const day = split.days[dayIdx];
  const muscles = day.muscles || [];
  const isRest = muscles.length === 0;

  // Day navigator — replace or insert above hint
  let nav = document.getElementById('split-day-nav');
  if (!nav) {
    nav = document.createElement('div');
    nav.id = 'split-day-nav';
    chipsWrapper.insertBefore(nav, chipsWrapper.firstChild);
  }
  nav.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:8px';
  nav.innerHTML = `
    <button onclick="MQ.cycleSplitDay(-1)" style="background:none;border:1px solid var(--border);color:var(--text);border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer;line-height:1">‹</button>
    <span style="font-size:13px;font-weight:600;color:var(--text)">Day ${dayIdx + 1}/${total}: <span style="color:var(--accent-glow)">${day.label}</span></span>
    <button onclick="MQ.cycleSplitDay(1)" style="background:none;border:1px solid var(--border);color:var(--text);border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer;line-height:1">›</button>`;

  const hintEl = chipsWrapper.querySelector('p');
  if (hintEl) hintEl.style.display = isRest ? 'none' : 'block';

  if (isRest) {
    chipsList.innerHTML = `<div style="font-size:13px;color:var(--muted);padding:4px 0">Rest & recover 💤</div>`;
  } else {
    // Build exercise list — respect exercises whitelist if set
    const allExs = [];
    for (const m of muscles) {
      if (EXERCISES[m]) EXERCISES[m].filter(e => e !== 'Other').forEach(ex => allExs.push({ muscle: m, ex }));
    }
    const whitelist = day?.exercises?.length ? day.exercises : null;
    const filtered = whitelist ? allExs.filter(({ ex }) => whitelist.includes(ex)) : allExs;
    chipsList.innerHTML = filtered.map(({ muscle, ex }) => `
      <button onclick="MQ.quickAddExercise('${muscle}','${ex.replace(/'/g,"\\'")}',this)"
        style="font-size:13px;padding:6px 12px;border-radius:20px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);cursor:pointer;transition:background 0.15s"
        onmouseover="this.style.background='rgba(124,77,255,0.18)'" onmouseout="this.style.background='var(--bg-card)'">
        ${ex}
      </button>`).join('');
  }
  chipsWrapper.style.display = 'block';
}

function cycleSplitDay(dir) {
  const splitId = state.activeSplitId;
  if (!splitId) return;
  const split = (state.customSplits || []).find(s => s.id === splitId);
  if (!split) return;
  if (!state.splitDayIndices) state.splitDayIndices = {};
  const cur = state.splitDayIndices[splitId] ?? 0;
  state.splitDayIndices[splitId] = (cur + dir + split.days.length) % split.days.length;
  saveWithPin();
  _renderSplitDay(split, state.splitDayIndices[splitId]);
}

// ─── Split System ───
function adoptLegendSplit(trainerId) {
  if (!state.customSplits) state.customSplits = [];
  const existingId = `legend_${trainerId}`;
  if (state.customSplits.find(s => s.id === existingId)) {
    toast('Split already in your list!');
    return;
  }
  const splitDays = typeof GainsShop !== 'undefined' ? GainsShop.getTrainerSplitDays(trainerId) : [];
  if (!splitDays?.length) { toast('Split data unavailable'); return; }
  const trainerName = splitDays._name || trainerId;
  state.customSplits.push({ id: existingId, name: `${trainerName}'s Split`, source: 'legend', legendId: trainerId, days: splitDays });
  saveWithPin();
  populateMuscleGroupSelect();
  renderSettingsSplits();
  toast(`Split adopted! Select it from Today's Split.`);
}

function adoptHomeSplit() {
  if (!state.customSplits) state.customSplits = [];
  const existingId = 'home_workout';
  if (state.customSplits.find(s => s.id === existingId)) {
    toast('Split already adopted!');
    return;
  }
  const days = [
    { label: 'MON — PUSH',            muscles: ['chest','triceps','shoulders'] },
    { label: 'TUE — PULL',            muscles: ['back','biceps'] },
    { label: 'WED — LEGS',            muscles: ['quads','glutes','calves'] },
    { label: 'THU — ACTIVE RECOVERY', muscles: [] },
    { label: 'FRI — PUSH + CORE',     muscles: ['chest','triceps','abs'] },
    { label: 'SAT — FULL BODY HIIT',  muscles: ['cardio'] },
    { label: 'SUN — REST',            muscles: [] },
  ];
  state.customSplits.push({ id: existingId, name: 'AthleanX Home Split', source: 'home', days });
  saveWithPin();
  populateMuscleGroupSelect();
  renderSettingsSplits();
  toast('Home split adopted! Select it from Today\'s Split.');
}

function deleteSplit(splitId) {
  if (!state.customSplits) return;
  state.customSplits = state.customSplits.filter(s => s.id !== splitId);
  if (state.activeSplitId === splitId) state.activeSplitId = null;
  saveWithPin();
  populateMuscleGroupSelect();
  renderSettingsSplits();
  onSplitChange();
  toast('Split removed');
}

// ─── Split Builder ───
let _builderDays = [];

function openSplitBuilder(editId) {
  const edit = editId ? (state.customSplits || []).find(s => s.id === editId) : null;
  _builderDays = (edit?.days || [
    { label: 'Day 1', muscles: [], exercises: [] },
    { label: 'Day 2', muscles: [], exercises: [] },
    { label: 'Day 3', muscles: [], exercises: [] },
  ]).map((d, i) => ({ label: d.label || `Day ${i+1}`, muscles: [...(d.muscles||[])], exercises: [...(d.exercises||[])] }));

  document.getElementById('split-builder-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'split-builder-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.7)';
  modal.innerHTML = `
    <div id="split-builder-card" style="background:#1a1d2e;border-radius:18px 18px 0 0;width:100%;max-width:480px;padding:20px 20px 40px;max-height:88vh;overflow-y:auto;box-shadow:0 -6px 48px rgba(0,0,0,0.8)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0;font-size:16px;font-family:Cinzel,serif;color:#e8e8f0">${edit ? 'Edit Split' : 'Create Split'}</h3>
        <button onclick="document.getElementById('split-builder-modal').remove()" style="background:none;border:none;color:#8888aa;font-size:22px;cursor:pointer;line-height:1">×</button>
      </div>
      <div style="font-size:11px;color:#8888aa;font-weight:600;letter-spacing:.4px;margin-bottom:4px">SPLIT NAME</div>
      <input id="split-builder-name" value="${edit?.name || ''}" placeholder="e.g. My PPL Split"
        style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid #2a2d45;background:#0d0f1a;color:#e8e8f0;font-size:14px;box-sizing:border-box;margin-bottom:18px">
      <div id="builder-days-container"></div>
      <button onclick="MQ._sbAddDay()"
        style="width:100%;padding:10px;border-radius:8px;border:1px dashed #3a3d55;background:none;color:#8888aa;font-size:13px;cursor:pointer;margin-bottom:14px">
        + Add Day
      </button>
      <button onclick="MQ._saveSplitBuilder(${editId ? `'${editId}'` : 'null'})"
        style="width:100%;padding:13px;border-radius:10px;border:none;background:#7c4dff;color:white;font-size:15px;font-weight:600;cursor:pointer">
        Save Split
      </button>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  _sbRefreshDays();
}

function _sbGetAllExercises(muscles) {
  const seen = new Set();
  const result = [];
  for (const m of muscles) {
    if (EXERCISES[m]) EXERCISES[m].filter(e => e !== 'Other').forEach(ex => { if (!seen.has(ex)) { seen.add(ex); result.push({ muscle: m, ex }); } });
  }
  return result;
}

function _sbDayHTML(day, i) {
  const presetsHTML = DAY_PRESETS.map(p => {
    const match = p.label === day.label || (p.muscles.length && p.muscles.slice().sort().join() === day.muscles.slice().sort().join());
    return `<option value="${p.label}" ${match ? 'selected' : ''}>${p.label}</option>`;
  }).join('');

  const allExs = _sbGetAllExercises(day.muscles);
  const selExs = day.exercises || [];
  // Empty exercises = all selected
  const isSelected = ex => selExs.length === 0 || selExs.includes(ex);

  const chips = allExs.map(({ ex }) => {
    const on = isSelected(ex);
    return `<button type="button" onclick="MQ._sbToggleEx(${i},'${ex.replace(/'/g,"\\'")}')"
      style="font-size:12px;padding:5px 11px;border-radius:16px;cursor:pointer;margin:0;transition:all .12s;
      border:1px solid ${on ? '#7c4dff' : '#2a2d45'};
      background:${on ? 'rgba(124,77,255,0.22)' : '#0d0f1a'};
      color:${on ? '#b39dff' : '#666688'}">${ex}</button>`;
  }).join('');

  return `<div style="border:1px solid #2a2d45;border-radius:10px;padding:12px;margin-bottom:10px;background:#12111c">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:${allExs.length ? '10px' : '0'}">
      <span style="font-size:12px;font-weight:700;color:#8888aa;min-width:40px;flex-shrink:0">Day ${i+1}</span>
      <select onchange="MQ._sbChangePreset(${i},this.value)"
        style="flex:1;padding:7px 10px;border-radius:7px;border:1px solid #2a2d45;background:#0d0f1a;color:#e8e8f0;font-size:13px">
        ${presetsHTML}
      </select>
      <button type="button" onclick="MQ._sbRemoveDay(${i})"
        style="background:none;border:none;color:#f44336;font-size:20px;cursor:pointer;line-height:1;flex-shrink:0;opacity:0.65;padding:0 2px">×</button>
    </div>
    ${allExs.length ? `
      <div style="font-size:10px;color:#555577;margin-bottom:6px;letter-spacing:.3px">TAP TO INCLUDE IN SPLIT (all = use all)</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">${chips}</div>` : ''}
  </div>`;
}

function _sbRefreshDays() {
  const el = document.getElementById('builder-days-container');
  if (el) el.innerHTML = _builderDays.map((d, i) => _sbDayHTML(d, i)).join('');
}

function _sbAddDay() {
  _builderDays.push({ label: `Day ${_builderDays.length + 1}`, muscles: [], exercises: [] });
  _sbRefreshDays();
}

function _sbRemoveDay(i) {
  if (_builderDays.length <= 1) { toast('Need at least 1 day'); return; }
  _builderDays.splice(i, 1);
  _sbRefreshDays();
}

function _sbChangePreset(i, label) {
  const preset = DAY_PRESETS.find(p => p.label === label) || DAY_PRESETS[0];
  _builderDays[i] = { label: preset.label, muscles: [...preset.muscles], exercises: [] };
  _sbRefreshDays();
}

function _sbToggleEx(dayIdx, ex) {
  const day = _builderDays[dayIdx];
  if (!day) return;
  const allExs = _sbGetAllExercises(day.muscles).map(e => e.ex);
  let sel = day.exercises.length === 0 ? [...allExs] : [...day.exercises];
  const idx = sel.indexOf(ex);
  if (idx >= 0) sel.splice(idx, 1); else sel.push(ex);
  day.exercises = sel.length === allExs.length ? [] : sel; // back to "all" if everything selected
  _sbRefreshDays();
}

function _saveSplitBuilder(editId) {
  const nameEl = document.getElementById('split-builder-name');
  const name = nameEl?.value?.trim() || 'My Split';
  const days = _builderDays.map(d => ({ label: d.label, muscles: [...d.muscles], exercises: [...(d.exercises||[])] }));

  if (!state.customSplits) state.customSplits = [];
  if (editId) {
    const idx = state.customSplits.findIndex(s => s.id === editId);
    if (idx >= 0) state.customSplits[idx] = { ...state.customSplits[idx], name, days };
  } else {
    state.customSplits.push({ id: `custom_${Date.now()}`, name, source: 'custom', days });
  }
  saveWithPin();
  populateMuscleGroupSelect();
  renderSettingsSplits();
  document.getElementById('split-builder-modal')?.remove();
  toast(`Split "${name}" saved!`);
}

function shareSplit(splitId) {
  const split = (state.customSplits || []).find(s => s.id === splitId);
  if (!split) return;
  const code = btoa(unescape(encodeURIComponent(JSON.stringify({ name: split.name, days: split.days }))));
  navigator.clipboard?.writeText(code).then(() => toast('Split code copied! Paste it to a friend.')).catch(() => {
    // Fallback: show code in a prompt
    prompt('Share this split code with friends:', code);
  });
}

function importSplitCode(code) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!data.name || !Array.isArray(data.days)) throw new Error('Invalid');
    if (!state.customSplits) state.customSplits = [];
    state.customSplits.push({ id: `imported_${Date.now()}`, name: data.name, source: 'custom', days: data.days });
    saveWithPin();
    populateMuscleGroupSelect();
    renderSettingsSplits();
    toast(`Imported "${data.name}"!`);
  } catch { toast('Invalid split code — check and try again'); }
}

function renderSettingsSplits() {
  const el = document.getElementById('splits-list');
  if (!el) return;
  const splits = state.customSplits || [];
  const rows = splits.map(s => {
    const trainingDays = s.days.filter(d => d.muscles?.length).length;
    const src = s.source === 'legend' ? `${s.legendId}'s program` : 'Custom';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="flex:1;min-width:0">
        <div style="font-size:14px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}</div>
        <div style="font-size:12px;color:var(--muted)">${src} · ${trainingDays} training day${trainingDays !== 1 ? 's' : ''} · ${s.days.length} day cycle</div>
      </div>
      <div style="display:flex;gap:5px;flex-shrink:0">
        <button onclick="MQ.shareSplit('${s.id}')" title="Share" style="background:none;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:4px 9px;font-size:12px;cursor:pointer">↑ Share</button>
        ${s.source === 'custom' ? `<button onclick="MQ.openSplitBuilder('${s.id}')" style="background:none;border:1px solid var(--border);color:var(--muted);border-radius:6px;padding:4px 9px;font-size:12px;cursor:pointer">Edit</button>` : ''}
        <button onclick="MQ.deleteSplit('${s.id}')" style="background:none;border:1px solid rgba(244,67,54,0.4);color:#f44336;border-radius:6px;padding:4px 9px;font-size:12px;cursor:pointer">✕</button>
      </div>
    </div>`;
  }).join('');
  el.innerHTML = rows || `<p style="color:var(--muted);font-size:13px;margin:8px 0">No splits yet. Adopt one from a Trainer profile, or create your own below.</p>`;
  el.innerHTML += `
    <div style="display:flex;gap:8px;margin-top:12px">
      <button onclick="MQ.openSplitBuilder(null)" style="flex:1;padding:10px;border-radius:8px;border:1px dashed var(--border);background:none;color:var(--muted);font-size:13px;cursor:pointer">+ Create Custom Split</button>
      <button onclick="MQ._showImportCode()" style="flex:1;padding:10px;border-radius:8px;border:1px dashed var(--border);background:none;color:var(--muted);font-size:13px;cursor:pointer">↓ Import Code</button>
    </div>`;
}

function _showImportCode() {
  const code = prompt('Paste a split code from a friend:');
  if (code) importSplitCode(code);
}

function quickAddExercise(group, exercise, btn) {
  // Find an existing empty exercise row, or add a new one
  const entries = document.querySelectorAll('.exercise-entry');
  let targetId = null;
  for (const entry of entries) {
    const exSel = entry.querySelector('.entry-exercise');
    const muscleSel = entry.querySelector('.entry-muscle');
    if (exSel && (!exSel.value || exSel.value === '') && muscleSel) {
      targetId = entry.dataset.entryId;
      muscleSel.value = group;
      onEntryMuscleChange(parseInt(targetId));
      setTimeout(() => {
        const updatedEntry = document.querySelector(`.exercise-entry[data-entry-id="${targetId}"]`);
        if (updatedEntry) updatedEntry.querySelector('.entry-exercise').value = exercise;
      }, 10);
      break;
    }
  }
  if (targetId === null) {
    addExerciseRow();
    setTimeout(() => {
      const allEntries = document.querySelectorAll('.exercise-entry');
      const last = allEntries[allEntries.length - 1];
      if (!last) return;
      const newId = last.dataset.entryId;
      last.querySelector('.entry-muscle').value = group;
      onEntryMuscleChange(parseInt(newId));
      setTimeout(() => {
        const refreshed = document.querySelector(`.exercise-entry[data-entry-id="${newId}"]`);
        if (refreshed) refreshed.querySelector('.entry-exercise').value = exercise;
      }, 10);
    }, 20);
  }
  // Pulse the button green to confirm
  if (btn) {
    btn.style.background = 'var(--xp-green, #4caf50)';
    btn.style.color = '#fff';
    btn.style.borderColor = 'transparent';
    setTimeout(() => {
      btn.style.background = 'var(--card-bg)';
      btn.style.color = 'var(--text)';
      btn.style.borderColor = 'var(--border)';
    }, 800);
  }
  // Scroll to workout card
  document.querySelector('.workout-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─── Workout History ───
function showHistoryTab(tab) {
  document.querySelectorAll('.ht-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`.ht-tab[onclick*="${tab}"]`)?.classList.add('active');
  document.getElementById('history-personal').style.display = tab === 'personal' ? 'block' : 'none';
  document.getElementById('history-friends').style.display = tab === 'friends' ? 'block' : 'none';
  document.getElementById('history-prs').style.display = tab === 'prs' ? 'block' : 'none';
  document.getElementById('history-volume').style.display = tab === 'volume' ? 'block' : 'none';
  if (tab === 'personal') renderWorkoutHistory();
  else if (tab === 'friends') renderFriendsFeed();
  else if (tab === 'prs') renderPRs();
  else if (tab === 'volume') showVolume('weekly');
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
        return `<div class="pr-entry pr-entry-tap" onclick="MQ.showPRGraph('${e.exercise.replace(/'/g,"\\'")}','${e.muscle}')">
          <span class="pr-exercise">${e.exercise}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="pr-value">${val}</span>
            <span style="font-size:11px;color:var(--muted)">›</span>
          </div>
        </div>`;
      }).join('')}
    </div>`).join('');
}

function showPRGraph(exercise, muscle) {
  // Build per-date max weight history for this exercise
  const history = {};
  for (const entry of state.workoutLog) {
    if (entry.exercise !== exercise) continue;
    const d = entry.date || '';
    if (Array.isArray(entry.sets)) {
      for (const s of entry.sets) {
        if (s.weight > 0 && (!history[d] || s.weight > history[d].w)) {
          history[d] = { w: s.weight, r: s.reps };
        }
      }
    } else if (entry.weight > 0) {
      if (!history[d] || entry.weight > history[d].w) history[d] = { w: entry.weight, r: entry.reps };
    } else if (entry.duration > 0) {
      if (!history[d] || entry.duration > history[d].w) history[d] = { w: entry.duration, r: 0, isTime: true };
    }
  }

  const pts = Object.entries(history).sort(([a],[b]) => a.localeCompare(b));
  if (!pts.length) return;

  const isTime = pts[0][1].isTime;
  const unit = isTime ? 'min' : 'lbs';
  const latestVal = pts[pts.length - 1][1];
  const latestDate = pts[pts.length - 1][0];
  const color = MUSCLES[muscle]?.color || '#4a90e2';

  // SVG line chart
  const vals = pts.map(([,v]) => v.w);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const W = 280, H = 100, PAD = 18;
  const toX = i => PAD + (i / Math.max(pts.length - 1, 1)) * (W - PAD * 2);
  const toY = v => PAD + (1 - (v - minV) / range) * (H - PAD * 2);

  const points = pts.map(([,v], i) => `${toX(i).toFixed(1)},${toY(v.w).toFixed(1)}`).join(' ');
  const areaPoints = `${toX(0).toFixed(1)},${H} ${points} ${toX(pts.length-1).toFixed(1)},${H}`;

  // Label every pt if ≤6, else show first/mid/last
  const labelIdxs = pts.length <= 6
    ? pts.map((_,i) => i)
    : [0, Math.floor((pts.length-1)/2), pts.length-1];

  const dateLabels = labelIdxs.map(i => {
    const d = pts[i][0]; // YYYY-MM-DD
    const parts = d.split('-');
    const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+parts[1]-1] || '';
    return `<text x="${toX(i).toFixed(1)}" y="${H+10}" text-anchor="middle" font-size="8" fill="#888" font-family="sans-serif">${mo} ${+parts[2]}</text>`;
  }).join('');

  const dotLabels = pts.map(([,v], i) => {
    const x = toX(i).toFixed(1);
    const y = toY(v.w).toFixed(1);
    const labelY = (parseFloat(y) - 7).toFixed(1);
    const valStr = isTime ? `${v.w}m` : `${v.w}`;
    return `<circle cx="${x}" cy="${y}" r="3.5" fill="${color}" stroke="#12111a" stroke-width="1.2"/>
    <text x="${x}" y="${labelY}" text-anchor="middle" font-size="7.5" fill="${color}" font-family="sans-serif" font-weight="600">${valStr}</text>`;
  }).join('');

  const chartSVG = `<svg viewBox="0 0 ${W} ${H+20}" xmlns="http://www.w3.org/2000/svg" style="width:100%;overflow:visible">
    <defs><linearGradient id="prg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.25"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <polygon points="${areaPoints}" fill="url(#prg)"/>
    <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${dotLabels}
    ${dateLabels}
  </svg>`;

  // Format latest date
  const dp = latestDate.split('-');
  const latestFmt = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+dp[1]-1]} ${+dp[2]}`;
  const latestValStr = isTime ? `${latestVal.w} min` : `${latestVal.w} lbs`;

  const modal = document.createElement('div');
  modal.id = 'pr-graph-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.78);padding:20px';
  modal.innerHTML = `
    <div style="background:#1a1d2e;border-radius:18px;width:100%;max-width:400px;padding:22px 22px 28px;box-shadow:0 8px 48px rgba(0,0,0,0.85)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <div>
          <div style="font-size:22px;font-weight:700;color:var(--text)">${latestValStr} <span style="font-size:14px;font-weight:400;color:${color}">${latestFmt}</span></div>
          <div style="font-size:13px;color:var(--muted);margin-top:2px">${exercise}</div>
        </div>
        <button onclick="document.getElementById('pr-graph-modal').remove()" style="background:none;border:none;color:var(--muted);font-size:22px;cursor:pointer;padding:0;line-height:1">×</button>
      </div>
      <div style="margin:16px 0 8px">${chartSVG}</div>
      <div style="font-size:11px;color:var(--muted);text-align:center">${pts.length} session${pts.length !== 1 ? 's' : ''} logged · tap anywhere outside to close</div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

// ─── Volume Report ───
function showVolume(period) {
  document.querySelectorAll('.vol-btn').forEach(b => b.classList.remove('vol-btn-active'));
  document.querySelector(`.vol-btn[onclick*="${period}"]`)?.classList.add('vol-btn-active');
  document.getElementById('volume-report').innerHTML = renderVolumeReport(period);
}

function renderVolumeReport(period) {
  const days = period === 'yearly' ? 365 : period === 'monthly' ? 30 : 7;
  const sinceDate = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const muscleSets = {};

  for (const entry of state.workoutLog) {
    if ((entry.date || '') < sinceDate) continue;
    const m = entry.muscle;
    if (!m || m === 'rest' || m === 'cardio') continue;
    const sets = Array.isArray(entry.sets) ? entry.sets.length : 1;
    muscleSets[m] = (muscleSets[m] || 0) + sets;
  }

  const totalSets = Object.values(muscleSets).reduce((a, b) => a + b, 0);
  const sorted = Object.entries(muscleSets).sort((a, b) => b[1] - a[1]);

  return `
    <div style="display:flex;justify-content:center;margin:8px 0 16px">
      ${renderVolumeBody(muscleSets)}
    </div>
    <div style="font-size:13px;color:var(--muted);text-align:center;margin-bottom:14px">${totalSets} total sets · last ${days === 365 ? 'year' : days + ' days'}</div>
    <div style="display:flex;flex-direction:column;gap:7px">
      ${sorted.length ? sorted.map(([m, sets]) => {
        const pct = Math.min(100, (sets / 20) * 100);
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="width:10px;height:10px;border-radius:50%;background:${MUSCLES[m]?.color || '#888'};flex-shrink:0"></div>
          <div style="flex:1;font-size:13px;color:var(--text)">${MUSCLES[m]?.name || m}</div>
          <div style="font-size:12px;color:var(--muted);width:48px;text-align:right">${sets} set${sets !== 1 ? 's' : ''}</div>
          <div style="width:80px;height:6px;border-radius:3px;background:var(--border);overflow:hidden;flex-shrink:0">
            <div style="height:100%;border-radius:3px;background:${MUSCLES[m]?.color || '#888'};width:${pct}%"></div>
          </div>
        </div>`;
      }).join('') : '<p style="color:var(--muted);text-align:center;padding:20px">No workouts logged in this period.</p>'}
    </div>`;
}

function _buildBackAvatarSVG() {
  const female = (state.gender || 'male') === 'female';
  const mhclr = HAIR_COLORS[state.hairColor ?? 0];
  const hc = mhclr.c1, hd = mhclr.c2;
  const mskn = SKIN_TONES[state.skinTone ?? 1];
  const skin = mskn.s1, skinD = mskn.s4;
  const hair = state.hair || (female ? 'space_buns' : 'default');

  // Relaxed arms-at-sides pose (same coords as front pose 1)
  const lU = [40,40,34,58], lF = [34,58,32,70];
  const rU = [60,40,66,58], rF = [66,58,68,70];

  // Hair hanging down behind the head (rendered before head so head covers the top)
  let hairDown = '';
  if (hair === 'space_buns') {
    hairDown = `<circle cx="40" cy="13" r="7" fill="${hc}"/><circle cx="60" cy="13" r="7" fill="${hc}"/>`;
  } else if (['pigtails','double_bun','low_pigtails'].includes(hair)) {
    hairDown = `<path d="M38 24 Q28 46 30 66" stroke="${hc}" stroke-width="7" fill="none" stroke-linecap="round"/>
                <path d="M62 24 Q72 46 70 66" stroke="${hc}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  } else if (['long','wavy','box_braids','cornrows','afro_puffs'].includes(hair)) {
    hairDown = `<path d="M40 24 Q35 52 37 74" stroke="${hc}" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.9"/>
                <path d="M50 26 Q50 56 50 78" stroke="${hd}" stroke-width="11" fill="none" stroke-linecap="round" opacity="0.85"/>
                <path d="M60 24 Q65 52 63 74" stroke="${hc}" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.9"/>`;
  } else if (hair === 'afro') {
    hairDown = `<ellipse cx="50" cy="14" rx="18" ry="17" fill="${hc}"/>`;
  }

  // Hair crown visible on the back of the head (rendered after head)
  let hairCrown = '';
  if (hair === 'afro') {
    hairCrown = `<ellipse cx="50" cy="14" rx="18" ry="15" fill="${hc}" opacity="0.6"/>`;
  } else if (['buzz','crew','taper_fade','undercut','pompadour','mohawk','slick_back','high_top'].includes(hair)) {
    hairCrown = `<path d="M37 22 Q37 8 50 7 Q63 8 63 22" fill="${hc}"/>`;
  } else {
    // Default: standard back-of-head hair shape
    hairCrown = `<path d="M37 22 Q37 8 50 7 Q63 8 63 22" fill="${hc}"/>`;
  }

  // Bra straps visible on female back
  const torsoBack = female
    ? `<rect x="44" y="37" width="3" height="20" rx="1.5" fill="#2a2a3e" opacity="0.6"/>
       <rect x="53" y="37" width="3" height="20" rx="1.5" fill="#2a2a3e" opacity="0.6"/>
       <rect x="40" y="50" width="20" height="2" rx="1" fill="#2a2a3e" opacity="0.5"/>`
    : `<line x1="50" y1="37" x2="50" y2="60" stroke="${skinD}" stroke-width="0.8" opacity="0.3"/>`;

  // Shoes/feet from back (same as front)
  const shoesBack = `
    <rect x="39" y="100" width="10" height="5" rx="2" fill="${skinD}" opacity="0.8"/>
    <rect x="51" y="100" width="10" height="5" rx="2" fill="${skinD}" opacity="0.8"/>`;

  return `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" class="mini-avatar">
    ${hairDown}
    <!-- Arms back (tricep side visible) -->
    <line x1="${lU[0]}" y1="${lU[1]}" x2="${lU[2]}" y2="${lU[3]}" stroke-width="10" stroke="${skin}" stroke-linecap="round"/>
    <line x1="${lF[0]}" y1="${lF[1]}" x2="${lF[2]}" y2="${lF[3]}" stroke-width="8" stroke="${skinD}" stroke-linecap="round"/>
    <line x1="${rU[0]}" y1="${rU[1]}" x2="${rU[2]}" y2="${rU[3]}" stroke-width="10" stroke="${skin}" stroke-linecap="round"/>
    <line x1="${rF[0]}" y1="${rF[1]}" x2="${rF[2]}" y2="${rF[3]}" stroke-width="8" stroke="${skinD}" stroke-linecap="round"/>
    <!-- Back torso -->
    <rect x="40" y="36" width="20" height="26" rx="6" fill="${skin}"/>
    ${torsoBack}
    <!-- Shorts back -->
    <rect x="38" y="60" width="24" height="10" rx="3" fill="#1a1a2e"/>
    <line x1="50" y1="60" x2="50" y2="70" stroke="#2a2a4e" stroke-width="0.8"/>
    <!-- Legs back -->
    <rect x="39" y="69" width="10" height="20" rx="4" fill="${skin}"/>
    <rect x="51" y="69" width="10" height="20" rx="4" fill="${skin}"/>
    <!-- Calves back -->
    <rect x="40" y="87" width="8" height="14" rx="3" fill="${skinD}"/>
    <rect x="52" y="87" width="8" height="14" rx="3" fill="${skinD}"/>
    ${shoesBack}
    <!-- Neck back -->
    <rect x="47" y="30" width="6" height="8" rx="3" fill="${skinD}"/>
    <!-- Head back (no face) -->
    <ellipse cx="50" cy="22" rx="13" ry="14" fill="${skin}"/>
    ${hairCrown}
  </svg>`;
}

function renderVolumeBody(muscleSets) {
  const maxS = 20;
  const col = k => MUSCLES[k]?.color || '#888';
  const op = k => muscleSets[k] ? Math.min(0.82, 0.22 + (muscleSets[k] / maxS) * 0.60) : 0;

  // Overlays use same mini-avatar coordinate space: viewBox "0 0 100 110"
  const frontOverlay = [
    op('shoulders') > 0 && `<ellipse cx="29" cy="38" rx="8" ry="5" fill="${col('shoulders')}" opacity="${op('shoulders').toFixed(2)}"/>
    <ellipse cx="71" cy="38" rx="8" ry="5" fill="${col('shoulders')}" opacity="${op('shoulders').toFixed(2)}"/>`,
    op('chest') > 0 && `<rect x="39" y="36" width="22" height="14" rx="3" fill="${col('chest')}" opacity="${op('chest').toFixed(2)}"/>`,
    op('biceps') > 0 && `<ellipse cx="33" cy="49" rx="6" ry="10" fill="${col('biceps')}" opacity="${op('biceps').toFixed(2)}"/>
    <ellipse cx="67" cy="49" rx="6" ry="10" fill="${col('biceps')}" opacity="${op('biceps').toFixed(2)}"/>`,
    op('abs') > 0 && `<rect x="40" y="50" width="20" height="11" rx="2" fill="${col('abs')}" opacity="${op('abs').toFixed(2)}"/>`,
    op('quads') > 0 && `<rect x="38" y="68" width="12" height="20" rx="3" fill="${col('quads')}" opacity="${op('quads').toFixed(2)}"/>
    <rect x="50" y="68" width="12" height="20" rx="3" fill="${col('quads')}" opacity="${op('quads').toFixed(2)}"/>`,
    op('calves') > 0 && `<rect x="39" y="86" width="10" height="14" rx="2" fill="${col('calves')}" opacity="${op('calves').toFixed(2)}"/>
    <rect x="51" y="86" width="10" height="14" rx="2" fill="${col('calves')}" opacity="${op('calves').toFixed(2)}"/>`,
  ].filter(Boolean).join('');

  const backOverlay = [
    op('back') > 0 && `<rect x="38" y="36" width="24" height="22" rx="3" fill="${col('back')}" opacity="${op('back').toFixed(2)}"/>`,
    op('triceps') > 0 && `<ellipse cx="33" cy="49" rx="6" ry="10" fill="${col('triceps')}" opacity="${op('triceps').toFixed(2)}"/>
    <ellipse cx="67" cy="49" rx="6" ry="10" fill="${col('triceps')}" opacity="${op('triceps').toFixed(2)}"/>`,
    op('glutes') > 0 && `<rect x="37" y="59" width="26" height="12" rx="3" fill="${col('glutes')}" opacity="${op('glutes').toFixed(2)}"/>`,
    op('hamstrings') > 0 && `<rect x="38" y="68" width="12" height="20" rx="3" fill="${col('hamstrings')}" opacity="${op('hamstrings').toFixed(2)}"/>
    <rect x="50" y="68" width="12" height="20" rx="3" fill="${col('hamstrings')}" opacity="${op('hamstrings').toFixed(2)}"/>`,
    op('calves') > 0 && `<rect x="39" y="86" width="10" height="14" rx="2" fill="${col('calves')}" opacity="${op('calves').toFixed(2)}"/>
    <rect x="51" y="86" width="10" height="14" rx="2" fill="${col('calves')}" opacity="${op('calves').toFixed(2)}"/>`,
  ].filter(Boolean).join('');

  const inject = (svgStr, overlay) =>
    svgStr.replace('</svg>', `<g pointer-events="none">${overlay}</g></svg>`);

  const frontSVG = inject(renderMiniAvatarSVG(
    state.gender || 'male', state.equippedCosmetics || [], 0, state.name || '',
    state.hair || 'default', state.skinTone ?? 1, state.hairColor ?? 0, null, 1
  ), frontOverlay);

  const backSVG = inject(_buildBackAvatarSVG(), backOverlay);

  return `<div style="display:flex;gap:16px;justify-content:center;align-items:flex-start">
    <div style="text-align:center">
      <div style="font-size:9px;color:#888;letter-spacing:1px;margin-bottom:8px;font-weight:600">FRONT</div>
      <div style="width:min(270px, 42vw)">${frontSVG}</div>
    </div>
    <div style="text-align:center">
      <div style="font-size:9px;color:#888;letter-spacing:1px;margin-bottom:8px;font-weight:600">BACK</div>
      <div style="width:min(270px, 42vw)">${backSVG}</div>
    </div>
  </div>`;
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

  const medals = [
    { label: 'Bronze', won: bbWins >= 1,  icon: '🥉' },
    { label: 'Silver', won: bbWins >= 5,  icon: '🥈' },
    { label: 'Gold',   won: bbWins >= 10, icon: '🥇' },
  ];
  const earnedMedals = medals.filter(m => m.won);

  const EQ_INFO = {
    mirror:        { label: 'Gym Mirror',           bonus: 'Check your form — every gym has one 💪' },
    pull_up_bar:   { label: 'Pull-Up Bar',         bonus: '+10% back XP, +5% biceps XP'        },
    dip_bar:       { label: 'Dip/Pull-Up Station', bonus: '+10% triceps XP, +5% chest XP'      },
    flat_bench:    { label: 'Flat Bench',           bonus: '+10% chest XP, +5% triceps XP'      },
    squat_rack:    { label: 'Squat Rack',           bonus: '+10% quads XP, +10% glutes XP'      },
    cable_machine: { label: 'Cable Machine',        bonus: '+5% chest/back/shoulders/triceps XP' },
    treadmill:     { label: 'Treadmill',            bonus: '+15% cardio XP'                      },
    dumbbells:     { label: 'Dumbbells',            bonus: '+10% biceps XP, +10% triceps XP'    },
    kettlebell:    { label: 'Kettlebell',           bonus: '+10% abs XP, +5% glutes XP'         },
    foam_roller:   { label: 'Foam Roller',          bonus: '+5% recovery and cardio XP'          },
    assault_bike:  { label: 'Assault Air Bike',     bonus: '+20% cardio XP, +8% shoulders XP'   },
  };

  const gender = state.gender || 'male';
  const cosmetics = state.equippedCosmetics || [];
  const hair = state.hair || (gender === 'female' ? 'space_buns' : 'default');
  const avatarSVG = renderMiniAvatarSVG(gender, cosmetics, 0, state.name || 'You', hair, state.skinTone ?? 1, state.hairColor ?? 0);

  // Equipment positions: {left%, bottom%, size(px), flip(face left)}
  // SVG viewBox 0 0 440 440. bottom% = (440-feetY)/440*100
  // Back wall (feetY≈175): bottom≈60%, size≈30px
  // Mid row  (feetY≈290): bottom≈34%, size≈52px
  // Front row(feetY≈415): bottom≈6%,  size≈80px
  const GYM_POS = {
    mirror:        { left: 24,  bottom: 60, size: 28, flip: false },
    squat_rack:    { left: 28,  bottom: 57, size: 40, flip: false },
    pull_up_bar:   { left: 56,  bottom: 53, size: 42, flip: false },
    dip_bar:       { left: 79,  bottom: 55, size: 36, flip: true  },
    flat_bench:    { left: 24,  bottom: 37, size: 52, flip: true  },
    dumbbells:     { left: 47,  bottom: 32, size: 54, flip: false },
    cable_machine: { left: 76,  bottom: 33, size: 52, flip: true  },
    treadmill:     { left: 20,  bottom: 5,  size: 80, flip: false },
    assault_bike:  { left: 77,  bottom: 15, size: 50, flip: true  },
    kettlebell:    { left: 88,  bottom: 5,  size: 76, flip: false },
    foam_roller:   { left: 48,  bottom: 10, size: 64, flip: false },
  };
  const GYM_HOME = { left: 46.6, bottom: 5.5, size: 80, flip: false };

  window._gymEqInfo = EQ_INFO;
  window._gymPos = GYM_POS;
  window._gymHome = GYM_HOME;
  const _skn = SKIN_TONES[Math.min(state.skinTone ?? 1, SKIN_TONES.length - 1)];
  window._gymPD = { skin: _skn.s1, skinD: _skn.s4 };

  const GYM_ANIM = {
    mirror:        { cls:'gym-flex',   dur:'1.4s',  label:'Flexing in the mirror 💪'        },
    pull_up_bar:   { cls:'gym-pullup', dur:'.85s',  label:'Doing pull-ups...'               },
    dip_bar:       { cls:'gym-dip',    dur:'1.4s',  label:'Hanging leg raises...'           },
    squat_rack:    { cls:'gym-squat',  dur:'1.5s',  label:'Squatting heavy...'              },
    flat_bench:    { cls:'gym-bench',  dur:'1.6s',  label:'Bench pressing...'               },
    dumbbells:     { cls:'gym-curl',   dur:'.95s',  label:'Curling dumbbells...'            },
    cable_machine: { cls:'gym-cable',  dur:'1.1s',  label:'Cable rows...'                   },
    treadmill:     { cls:'gym-run',    dur:'.38s',  label:'Running on the treadmill...'     },
    assault_bike:  { cls:'gym-bike',   dur:'.5s',   label:'Crushing the assault bike...'   },
    kettlebell:    { cls:'gym-swing',  dur:'1.2s',  label:'Swinging the kettlebell...'      },
    foam_roller:   { cls:'gym-roll',   dur:'2s',    label:'Rolling out the soreness...'     },
  };
  window._gymAnim = GYM_ANIM;

  function getGymOverlaySVG(id) {
    const pd = window._gymPD || { skin: '#e8a87c', skinD: '#c07050' };
    const s = pd.skin, d = pd.skinD;
    const wrap = (content, anim) =>
      `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible">
        <style>
          .oa { animation: ${anim} }
        </style>
        ${content}
      </svg>`;

    if (id === 'pull_up_bar') return wrap(`
      <!-- Upper arms: shoulder(40,40)→elbow, shoulder(60,40)→elbow -->
      <line x1="40" y1="40" x2="35" y2="16" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <line x1="35" y1="16" x2="32" y2="3"  stroke="${d}" stroke-width="7" stroke-linecap="round"/>
      <line x1="60" y1="40" x2="65" y2="16" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <line x1="65" y1="16" x2="68" y2="3"  stroke="${d}" stroke-width="7" stroke-linecap="round"/>
      <!-- Pull-up bar across wrists -->
      <line x1="24" y1="3" x2="76" y2="3" stroke="#8d6e63" stroke-width="5" stroke-linecap="round"/>
    `, 'none');

    if (id === 'squat_rack') return wrap(`
      <!-- Barbell sitting on traps (y=36 = top of torso/shoulder) -->
      <line x1="8"  y1="36" x2="92" y2="36" stroke="#9e9e9e" stroke-width="4" stroke-linecap="round"/>
      <!-- Plates -->
      <rect x="4"  y="29" width="6" height="14" rx="2" fill="#555"/>
      <rect x="90" y="29" width="6" height="14" rx="2" fill="#555"/>
      <rect x="4"  y="31" width="4" height="10" rx="1" fill="#b71c1c" opacity=".85"/>
      <rect x="90" y="31" width="4" height="10" rx="1" fill="#b71c1c" opacity=".85"/>
      <!-- Arms draped over bar -->
      <line x1="40" y1="40" x2="22" y2="36" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <line x1="22" y1="36" x2="12" y2="36" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
      <line x1="60" y1="40" x2="78" y2="36" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <line x1="78" y1="36" x2="88" y2="36" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    `, 'none');

    if (id === 'flat_bench') return wrap(`
      <!-- Body is rotated 90deg CW; arms must reach RIGHT in SVG space to appear UP on screen -->
      <g class="oa" style="transform-origin:50px 40px">
        <!-- Left arm: shoulder(40,40)→elbow→wrist reaching right -->
        <line x1="40" y1="40" x2="80" y2="32" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
        <line x1="80" y1="32" x2="92" y2="29" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
        <!-- Right arm: shoulder(60,40)→elbow→wrist -->
        <line x1="60" y1="40" x2="80" y2="48" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
        <line x1="80" y1="48" x2="92" y2="51" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
        <!-- Barbell: vertical line in SVG = horizontal bar above body on screen -->
        <line x1="92" y1="20" x2="92" y2="60" stroke="#9e9e9e" stroke-width="3.5" stroke-linecap="round"/>
        <rect x="88" y="14" width="8" height="8" rx="2" fill="#555"/>
        <rect x="88" y="58" width="8" height="8" rx="2" fill="#555"/>
        <rect x="88" y="15" width="6" height="6" rx="1" fill="#b71c1c" opacity=".8"/>
        <rect x="88" y="59" width="6" height="6" rx="1" fill="#b71c1c" opacity=".8"/>
      </g>
    `, 'arm-bench-press 1.6s ease-in-out infinite');

    if (id === 'cable_machine') return wrap(`
      <!-- Cable machine: char faces left (scaleX flipped), so extend arms leftward in SVG space -->
      <g class="oa" style="transform-origin:50px 40px">
        <!-- Both arms extended toward cable (left = toward machine after flip) -->
        <line x1="40" y1="40" x2="18" y2="36" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
        <line x1="18" y1="36" x2="6"  y2="37" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
        <line x1="60" y1="40" x2="30" y2="44" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
        <line x1="30" y1="44" x2="18" y2="46" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
      </g>
    `, 'arm-cable-pull 1.1s ease-in-out infinite');

    if (id === 'kettlebell') return wrap(`
      <g class="oa" style="transform-origin:50px 50px">
        <!-- Both arms angled down together, meeting at hands -->
        <line x1="40" y1="40" x2="46" y2="56" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
        <line x1="60" y1="40" x2="54" y2="56" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
        <line x1="46" y1="56" x2="48" y2="65" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
        <line x1="54" y1="56" x2="52" y2="65" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
        <!-- Kettlebell handle + ball -->
        <path d="M43 71 Q41 66 43 61 Q46 57 50 57 Q54 57 57 61 Q59 66 57 71 Z" fill="#263238" stroke="#37474f" stroke-width="1"/>
        <ellipse cx="50" cy="79" rx="11" ry="8" fill="#37474f"/>
        <ellipse cx="50" cy="76" rx="11" ry="5" fill="#455a64"/>
      </g>
    `, 'arm-kettlebell-swing 1.2s ease-in-out infinite');

    if (id === 'dip_bar') return wrap(`
      <!-- Arms pressing down on Roman chair pads (pads are at sides, y≈42) -->
      <line x1="40" y1="40" x2="22" y2="43" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <line x1="22" y1="43" x2="12" y2="45" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
      <line x1="60" y1="40" x2="78" y2="43" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <line x1="78" y1="43" x2="88" y2="45" stroke="${d}" stroke-width="7" stroke-linecap="round"/>
    `, 'none');

    if (id === 'dumbbells') return `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible">
      <style>
        @keyframes curl-L { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-62deg)} }
        @keyframes curl-R { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(62deg)} }
        .cL { animation: curl-L .95s ease-in-out infinite; transform-origin: 34px 66px; }
        .cR { animation: curl-R .95s ease-in-out infinite; transform-origin: 66px 66px; }
      </style>
      <line x1="40" y1="40" x2="34" y2="66" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <g class="cL">
        <line x1="34" y1="66" x2="26" y2="90" stroke="${s}" stroke-width="8" stroke-linecap="round"/>
        <line x1="26" y1="90" x2="20" y2="92" stroke="${d}" stroke-width="6" stroke-linecap="round"/>
        <rect x="12" y="87" width="10" height="10" rx="3" fill="#263238"/>
        <rect x="18" y="85" width="5"  height="14" rx="1" fill="#455a64"/>
      </g>
      <line x1="60" y1="40" x2="66" y2="66" stroke="${s}" stroke-width="9" stroke-linecap="round"/>
      <g class="cR">
        <line x1="66" y1="66" x2="74" y2="90" stroke="${s}" stroke-width="8" stroke-linecap="round"/>
        <line x1="74" y1="90" x2="80" y2="92" stroke="${d}" stroke-width="6" stroke-linecap="round"/>
        <rect x="78" y="87" width="10" height="10" rx="3" fill="#263238"/>
        <rect x="77" y="85" width="5"  height="14" rx="1" fill="#455a64"/>
      </g>
    </svg>`;

    return null;
  }

  window.gymTap = function(id) {
    const info = window._gymEqInfo[id];
    if (!info) return;

    const char  = document.getElementById('gym-char');
    const inner = char && char.querySelector('.gym-inner');
    const pos   = window._gymPos[id];
    const anim  = window._gymAnim[id];
    const panel = document.getElementById('gw-info');
    if (!char || !pos || !inner) return;

    if (panel) panel.innerHTML = `<div class="gw-info-name">${info.label}</div><div class="gw-info-bonus">${info.bonus}</div>`;

    const fromLeft = parseFloat(char.style.left) || window._gymHome.left;
    const facingRight = pos.left > fromLeft;

    // Walk phase — move inner to walk animation, flip outer for direction
    inner.style.animation = 'gymwalk .35s ease-in-out infinite';
    char.style.transform  = `translateX(-50%)${facingRight ? '' : ' scaleX(-1)'}`;

    clearTimeout(char._rt);
    char._rt = setTimeout(() => {
      char.style.left   = pos.left   + '%';
      char.style.bottom = pos.bottom + '%';
      char.style.width  = pos.size   + 'px';
      setTimeout(() => {
        // Arrive — face equipment then start exercise animation
        char.style.transform = `translateX(-50%)${pos.flip ? ' scaleX(-1)' : ''}`;
        if (anim) {
          inner.style.animation = `${anim.cls} ${anim.dur} ease-in-out infinite`;
          if (panel) panel.innerHTML = `<div class="gw-info-name">${info.label}</div><div class="gw-info-bonus">${anim.label}</div>`;
        } else {
          inner.style.animation = 'gymcb 1.1s ease-in-out infinite';
        }
        // Inject arm/equipment overlay
        inner.querySelector('.gym-arm-overlay')?.remove();
        inner.classList.remove('has-arm-overlay');
        const overlayHTML = getGymOverlaySVG(id);
        if (overlayHTML) {
          const ov = document.createElement('div');
          ov.className = 'gym-arm-overlay';
          ov.innerHTML = overlayHTML;
          inner.appendChild(ov);
          inner.classList.add('has-arm-overlay');
        }
        char._rt = null;
      }, 560);
    }, 60);
  };

  window.gymShowMedal = function(icon, label) {
    const MEDAL_DESC = {
      '🥉': 'Bronze — Win your first bodybuilding show',
      '🥈': 'Silver — Win 5 bodybuilding shows',
      '🥇': 'Gold — Win 10 bodybuilding shows',
    };
    const panel = document.getElementById('gw-info');
    if (panel) panel.innerHTML = `<div class="gw-info-name">${icon} ${label}</div><div class="gw-info-bonus">${MEDAL_DESC[icon] || 'Competition trophy'}</div>`;
  };

  window.gymReset = function() {
    const char  = document.getElementById('gym-char');
    const inner = char && char.querySelector('.gym-inner');
    const home  = window._gymHome;
    if (!char) return;
    clearTimeout(char._rt);
    char.style.left      = home.left   + '%';
    char.style.bottom    = home.bottom + '%';
    char.style.width     = home.size   + 'px';
    char.style.transform = 'translateX(-50%)';
    if (inner) {
      inner.style.animation = 'gymcb 1.1s ease-in-out infinite';
      inner.querySelector('.gym-arm-overlay')?.remove();
      inner.classList.remove('has-arm-overlay');
    }
    const panel = document.getElementById('gw-info');
    if (panel) panel.innerHTML = '<div class="gw-info-hint">Tap equipment to interact · Tap the floor to return</div>';
  };

  function gi(id) {
    return eq[id] ? `class="gi" onclick="gymTap('${id}')"` : `class="gi-lock"`;
  }

  // Map achievement IDs to safe SVG-embeddable emoji (no HTML tags)
  const ACH_EMOJI = { default: '⭐' };
  function safeAchIcon(a) {
    if (!a) return '⭐';
    const icon = a.icon || '';
    return icon.includes('<') ? '⭐' : (icon || '⭐');
  }

  const trophySlots = (() => {
    const items = [...earnedMedals];
    ach.slice(0, Math.max(0, 3 - items.length)).forEach(id => {
      const a = ACHIEVEMENTS && ACHIEVEMENTS.find(x => x.id === id);
      if (a) items.push({ icon: safeAchIcon(a), label: a.name });
    });
    return [0, 1, 2].map(i => {
      const it = items[i];
      const x = 178 + i * 36;
      return it
        ? `<text x="${x}" y="87" text-anchor="middle" font-size="20" style="cursor:pointer" onclick="gymShowMedal('${it.icon}','${it.label.replace(/'/g,"\\'")}')">${it.icon}</text>`
        : `<text x="${x}" y="90" text-anchor="middle" font-size="13" fill="#4a3020" font-style="italic">?</text>`;
    }).join('');
  })();

  el.innerHTML = `
<style>
  @keyframes gymcb    { 0%,100%{transform:translateY(0)}          50%{transform:translateY(-6px)} }
  @keyframes gymwalk  { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-4px) rotate(2deg)} }
  @keyframes gym-pullup { 0%,100%{transform:translateY(0)}         45%{transform:translateY(-18px)} }
  @keyframes gym-dip    { 0%,100%{transform:translateY(0) rotate(0deg)} 45%{transform:translateY(-5px) rotate(-10deg)} }
  @keyframes gym-squat  { 0%,100%{transform:translateY(0)}         50%{transform:translateY(10px)} }
  @keyframes gym-bench  { 0%,100%{transform:rotate(-90deg) translateY(-4px)} 50%{transform:rotate(-90deg) translateY(6px)} }
  @keyframes gym-curl   { 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-7px) rotate(5deg)} }
  @keyframes gym-cable  { 0%,100%{transform:translateY(0) rotate(0deg)}  50%{transform:translateY(-3px) rotate(-6deg)} }
  @keyframes gym-run    { 0%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-8px) rotate(4deg)} 100%{transform:translateY(0) rotate(-5deg)} }
  @keyframes gym-bike   { 0%,100%{transform:rotate(-22deg) translateY(0)} 50%{transform:rotate(-26deg) translateY(-2px)} }
  @keyframes gym-swing  { 0%,100%{transform:translateY(0) rotate(0deg)}  40%{transform:translateY(-15px) rotate(12deg)} }
  @keyframes gym-roll   { 0%,100%{transform:rotate(-90deg) translateX(-4px)} 50%{transform:rotate(-90deg) translateX(5px)} }
  @keyframes gym-flex   { 0%,100%{transform:scale(1)}                    50%{transform:scale(1.09)} }
  #gym-char { transition: left .55s cubic-bezier(.4,0,.2,1), bottom .45s ease, width .45s ease; }
  .gym-inner { animation: gymcb 1.1s ease-in-out infinite; position: relative; }
  .gym-arm-overlay { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; }
  .gym-inner.has-arm-overlay .avatar-arm { display:none; }
  @keyframes arm-bench-press  { 0%,100%{transform:translateX(0)}   50%{transform:translateX(10px)} }
  @keyframes arm-cable-pull   { 0%,100%{transform:translateX(0)}   50%{transform:translateX(-12px)} }
  @keyframes arm-kettlebell-swing { 0%,100%{transform:translateY(0) rotate(0deg)} 45%{transform:translateY(-18px) rotate(-18deg)} }
  .gi { cursor:pointer; transition:filter .2s; }
  .gi:hover { filter:brightness(1.22) drop-shadow(0 0 7px rgba(255,200,80,.55)); }
  .gi-lock { pointer-events:none; filter:saturate(0) brightness(.44); }
  .gw-info-panel { background:#1a1008; border:1px solid #5a3e1a; border-radius:0 0 12px 12px; padding:11px 14px; min-height:42px; }
  .gw-info-name { font-weight:700; font-size:13px; color:#f0c060; }
  .gw-info-bonus { font-size:11px; color:#aaa; margin-top:3px; }
  .gw-info-hint { font-size:11px; color:#555; text-align:center; padding:4px 0; }
</style>
<div style="position:relative;line-height:0">
<svg viewBox="0 0 440 440" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;border-radius:12px 12px 0 0">

  <!-- CEILING -->
  <polygon points="0,0 440,0 360,42 80,42" fill="#160e06"/>
  <!-- Ceiling light strip -->
  <line x1="80" y1="42" x2="360" y2="42" stroke="#f0c060" stroke-width="1.5" opacity=".3"/>
  <rect x="160" y="36" width="120" height="8" rx="2" fill="#fffde7" opacity=".08"/>

  <!-- BACK WALL -->
  <rect x="80" y="42" width="280" height="118" fill="#1e1108"/>
  <!-- Back wall wood trim -->
  <rect x="80" y="154" width="280" height="7" fill="#5a3e1a"/>
  <!-- Wall panel lines -->
  <line x1="220" y1="42" x2="220" y2="154" stroke="#2a1a08" stroke-width="1.5"/>
  <line x1="150" y1="42" x2="150" y2="154" stroke="#2a1a08" stroke-width="1"/>
  <line x1="290" y1="42" x2="290" y2="154" stroke="#2a1a08" stroke-width="1"/>

  <!-- LEFT WALL -->
  <polygon points="0,0 80,42 80,161 0,440" fill="#1a0e06"/>
  <line x1="0" y1="110" x2="80" y2="88" stroke="#2a1a08" stroke-width="1"/>
  <line x1="0" y1="220" x2="80" y2="130" stroke="#2a1a08" stroke-width="1"/>
  <!-- RIGHT WALL -->
  <polygon points="440,0 360,42 360,161 440,440" fill="#1a0e06"/>

  <!-- FLOOR (converging perspective) -->
  <polygon points="80,161 360,161 440,440 0,440" fill="#2a1a0c"/>
  <!-- Floor grid — converging lines to VP (220,148) -->
  <line x1="220" y1="148" x2="0"   y2="440" stroke="#3a2410" stroke-width="1"/>
  <line x1="220" y1="148" x2="110" y2="440" stroke="#3a2410" stroke-width="1"/>
  <line x1="220" y1="148" x2="220" y2="440" stroke="#3a2410" stroke-width="1"/>
  <line x1="220" y1="148" x2="330" y2="440" stroke="#3a2410" stroke-width="1"/>
  <line x1="220" y1="148" x2="440" y2="440" stroke="#3a2410" stroke-width="1"/>
  <!-- Horizontal floor depth lines -->
  <line x1="58"  y1="230" x2="382" y2="230" stroke="#3a2410" stroke-width="1"/>
  <line x1="26"  y1="308" x2="414" y2="308" stroke="#3a2410" stroke-width="1"/>
  <line x1="0"   y1="386" x2="440" y2="386" stroke="#3a2410" stroke-width="1"/>

  <!-- BACK WALL DECOR: Gym name banner -->
  <rect x="158" y="47" width="124" height="18" rx="3" fill="#3a2208" opacity=".9"/>
  <text x="220" y="60" text-anchor="middle" font-size="${(state.name||'').length > 7 ? 7 : (state.name||'').length > 4 ? 9 : 10}" fill="#f0c060" font-family="serif" font-weight="700" letter-spacing="2">${(state.name||'MY').toUpperCase()}'S GYM</text>

  <!-- BACK WALL: Mirror (left side) — always interactive -->
  <g class="gi" onclick="gymTap('mirror')" style="cursor:pointer">
    <rect x="88"  y="53" width="52" height="72" rx="3" fill="#b0d8e8" opacity=".18"/>
    <rect x="88"  y="53" width="52" height="72" rx="3" fill="none" stroke="#c8a050" stroke-width="2.5"/>
    <line x1="93" y1="57" x2="136" y2="121" stroke="#ffffff0a" stroke-width="14"/>
    <line x1="107" y1="55" x2="107" y2="125" stroke="#ffffff06" stroke-width="6"/>
    <rect x="90"  y="55" width="48" height="2"  fill="#e8c870" opacity=".4"/>
    <text x="114" y="137" text-anchor="middle" font-size="7" fill="#8a7040" letter-spacing="1">MIRROR</text>
  </g>

  <!-- BACK WALL: Trophy shelf -->
  <rect x="166" y="92" width="108" height="5" rx="2" fill="#7a5a28"/>
  <rect x="164" y="88" width="3"   height="18" rx="1" fill="#5a3e1a"/>
  <rect x="275" y="88" width="3"   height="18" rx="1" fill="#5a3e1a"/>
  ${trophySlots}

  <!-- BACK WALL: Motivational poster (right) -->
  <rect x="302" y="55" width="42" height="62" rx="2" fill="#0f1e0f"/>
  <rect x="302" y="55" width="42" height="62" rx="2" fill="none" stroke="#3a6030" stroke-width="1.5"/>
  <text x="323" y="74"  text-anchor="middle" font-size="8" fill="#4caf50" font-weight="700">NO</text>
  <text x="323" y="85"  text-anchor="middle" font-size="8" fill="#4caf50" font-weight="700">DAYS</text>
  <text x="323" y="96"  text-anchor="middle" font-size="8" fill="#4caf50" font-weight="700">OFF</text>
  <line x1="308" y1="104" x2="338" y2="104" stroke="#3a6030" stroke-width="1"/>
  <text x="323" y="112" text-anchor="middle" font-size="5" fill="#3a6030" letter-spacing="1">IRONLORE</text>

  <!-- ══ BACK ROW — small (y ~165) ══ -->

  <!-- Squat Rack back-left -->
  <g ${gi('squat_rack')} transform="translate(100,163) scale(0.5)">
    <rect x="4"  y="2" width="9"  height="72" rx="3" fill="${eq.squat_rack?'#66bb6a':'#555'}"/>
    <rect x="67" y="2" width="9"  height="72" rx="3" fill="${eq.squat_rack?'#66bb6a':'#555'}"/>
    <rect x="4"  y="2" width="72" height="8"  rx="2" fill="${eq.squat_rack?'#66bb6a':'#555'}"/>
    <rect x="4"  y="67" width="72" height="6" rx="2" fill="${eq.squat_rack?'#4caf50':'#444'}"/>
    <rect x="18" y="30" width="44" height="7" rx="3" fill="${eq.squat_rack?'#8d6e63':'#555'}"/>
    ${eq.squat_rack?[26,38,50,62].map(x=>`<line x1="${x}" y1="31" x2="${x}" y2="36" stroke="#fff4" stroke-width="2.5"/>`).join(''):''}
  </g>

  <!-- Pull-up Tower back-center-right -->
  <g ${gi('pull_up_bar')} transform="translate(216,130) scale(0.5)">
    <!-- Left upright post -->
    <rect x="4"  y="4"  width="9" height="108" rx="3" fill="${eq.pull_up_bar?'#546e7a':'#555'}"/>
    <!-- Right upright post -->
    <rect x="77" y="4"  width="9" height="108" rx="3" fill="${eq.pull_up_bar?'#546e7a':'#555'}"/>
    <!-- Pull-up bar at top -->
    <rect x="4"  y="4"  width="82" height="9"  rx="4" fill="${eq.pull_up_bar?'#8d6e63':'#555'}"/>
    ${eq.pull_up_bar?[18,30,42,54,66,78].map(x=>`<line x1="${x}" y1="4" x2="${x}" y2="13" stroke="#fff4" stroke-width="2"/>`).join(''):''}
    <!-- Dip arm bars (lower) -->
    <rect x="2"  y="46" width="28" height="7"  rx="3" fill="${eq.pull_up_bar?'#607d8b':'#555'}"/>
    <rect x="60" y="46" width="28" height="7"  rx="3" fill="${eq.pull_up_bar?'#607d8b':'#555'}"/>
    <!-- Dip arm pads -->
    <rect x="2"  y="42" width="16" height="9"  rx="3" fill="${eq.pull_up_bar?'#4a3728':'#444'}"/>
    <rect x="72" y="42" width="16" height="9"  rx="3" fill="${eq.pull_up_bar?'#4a3728':'#444'}"/>
    <!-- Bottom crossbar -->
    <rect x="4"  y="106" width="82" height="6" rx="3" fill="${eq.pull_up_bar?'#455a64':'#444'}"/>
    <!-- Base feet -->
    <rect x="0"  y="110" width="22" height="5" rx="2" fill="${eq.pull_up_bar?'#37474f':'#444'}"/>
    <rect x="68" y="110" width="22" height="5" rx="2" fill="${eq.pull_up_bar?'#37474f':'#444'}"/>
  </g>

  <!-- Roman chair (captain's chair) back-right -->
  <g ${gi('dip_bar')} transform="translate(316,155) scale(0.48)">
    <!-- Back post -->
    <rect x="34" y="2"  width="10" height="62" rx="3" fill="${eq.dip_bar?'#546e7a':'#555'}"/>
    <!-- Back pad -->
    <rect x="30" y="8"  width="18" height="28" rx="4" fill="${eq.dip_bar?'#5c4033':'#555'}"/>
    <rect x="30" y="8"  width="18" height="6"  rx="4" fill="${eq.dip_bar?'#ffffff22':'#ffffff11'}"/>
    <!-- Seat -->
    <rect x="20" y="56" width="38" height="10" rx="4" fill="${eq.dip_bar?'#5c4033':'#555'}"/>
    <rect x="20" y="56" width="38" height="4"  rx="4" fill="${eq.dip_bar?'#ffffff22':'#ffffff11'}"/>
    <!-- Left arm rest bar -->
    <rect x="6"  y="36" width="26" height="6" rx="3" fill="${eq.dip_bar?'#546e7a':'#555'}"/>
    <!-- Left arm pad -->
    <rect x="6"  y="32" width="14" height="8" rx="3" fill="${eq.dip_bar?'#607d8b':'#666'}"/>
    <!-- Right arm rest bar -->
    <rect x="46" y="36" width="26" height="6" rx="3" fill="${eq.dip_bar?'#546e7a':'#555'}"/>
    <!-- Right arm pad -->
    <rect x="58" y="32" width="14" height="8" rx="3" fill="${eq.dip_bar?'#607d8b':'#666'}"/>
    <!-- Legs -->
    <rect x="22" y="66" width="7" height="16" rx="2" fill="${eq.dip_bar?'#455a64':'#444'}"/>
    <rect x="49" y="66" width="7" height="16" rx="2" fill="${eq.dip_bar?'#455a64':'#444'}"/>
    <rect x="35" y="62" width="8" height="12" rx="2" fill="${eq.dip_bar?'#455a64':'#444'}"/>
  </g>

  <!-- ══ MID ROW — medium (y ~255) ══ -->

  <!-- Flat Bench mid-left -->
  <g ${gi('flat_bench')} transform="translate(72,262) scale(0.78)">
    <rect x="6"  y="10" width="78" height="14" rx="5" fill="${eq.flat_bench?'#5c4033':'#444'}"/>
    <rect x="6"  y="10" width="78" height="5"  rx="5" fill="${eq.flat_bench?'#ffffff22':'#ffffff11'}"/>
    <rect x="12" y="24" width="7"  height="22" rx="3" fill="${eq.flat_bench?'#2a2030':'#333'}"/>
    <rect x="71" y="24" width="7"  height="22" rx="3" fill="${eq.flat_bench?'#2a2030':'#333'}"/>
  </g>

  <!-- Dumbbells mid-center-left -->
  <g ${gi('dumbbells')} transform="translate(162,272) scale(0.74)">
    <!-- Dumbbell 1 -->
    <rect x="2"  y="10" width="12" height="24" rx="4" fill="${eq.dumbbells?'#455a64':'#444'}"/>
    <rect x="14" y="15" width="22" height="14" rx="2" fill="${eq.dumbbells?'#607d8b':'#555'}"/>
    <rect x="36" y="10" width="12" height="24" rx="4" fill="${eq.dumbbells?'#455a64':'#444'}"/>
    <!-- Dumbbell 2 -->
    <rect x="54" y="10" width="12" height="24" rx="4" fill="${eq.dumbbells?'#546e7a':'#444'}"/>
    <rect x="66" y="15" width="22" height="14" rx="2" fill="${eq.dumbbells?'#78909c':'#555'}"/>
    <rect x="88" y="10" width="12" height="24" rx="4" fill="${eq.dumbbells?'#546e7a':'#444'}"/>
    <!-- Floor shadow -->
    <rect x="0" y="34" width="102" height="4" rx="2" fill="#00000028"/>
  </g>

  <!-- Cable Machine mid-right -->
  <g ${gi('cable_machine')} transform="translate(316,232) scale(0.8)">
    <rect x="8"  y="2"  width="40" height="82" rx="5" fill="${eq.cable_machine?'#2e7d32':'#444'}"/>
    <rect x="14" y="8"  width="28" height="24" rx="3" fill="${eq.cable_machine?'#1a4a1a':'#333'}"/>
    <circle cx="28" cy="20" r="8" fill="none" stroke="${eq.cable_machine?'#66bb6a':'#666'}" stroke-width="2"/>
    <circle cx="28" cy="20" r="3" fill="${eq.cable_machine?'#1a4a1a':'#333'}"/>
    <rect x="16" y="38" width="24" height="18" rx="2" fill="${eq.cable_machine?'#1b5e20':'#333'}"/>
  </g>

  <!-- ══ FRONT ROW — large (y ~345+) ══ -->

  <!-- TREADMILL — side profile, front-left -->
  <g ${gi('treadmill')} transform="translate(14,348)">
    <!-- Incline strut -->
    <line x1="30" y1="72" x2="104" y2="20" stroke="${eq.treadmill?'#1b5e20':'#3a3a3a'}" stroke-width="5" stroke-linecap="round"/>
    <!-- Belt deck -->
    <rect x="6" y="60" width="134" height="20" rx="5" fill="${eq.treadmill?'#1a3a1a':'#222'}"/>
    <rect x="6" y="60" width="134" height="9"  rx="5" fill="${eq.treadmill?'#2e7d32':'#333'}"/>
    <!-- Belt tread lines -->
    ${eq.treadmill?[18,30,42,54,66,78,90,102,114,126].map(x=>`<line x1="${x}" y1="61" x2="${x}" y2="79" stroke="#ffffff14" stroke-width="4.5"/>`).join(''):''}
    <!-- Front roller -->
    <ellipse cx="12"  cy="70" rx="10" ry="10" fill="${eq.treadmill?'#37474f':'#2a2a2a'}"/>
    <ellipse cx="12"  cy="70" rx="4"  ry="4"  fill="${eq.treadmill?'#546e7a':'#1a1a1a'}"/>
    <!-- Rear roller -->
    <ellipse cx="134" cy="70" rx="10" ry="10" fill="${eq.treadmill?'#37474f':'#2a2a2a'}"/>
    <ellipse cx="134" cy="70" rx="4"  ry="4"  fill="${eq.treadmill?'#546e7a':'#1a1a1a'}"/>
    <!-- Feet -->
    <rect x="4"   y="78" width="20" height="6" rx="2" fill="${eq.treadmill?'#263238':'#222'}"/>
    <rect x="122" y="78" width="20" height="6" rx="2" fill="${eq.treadmill?'#263238':'#222'}"/>
    <!-- Console post -->
    <rect x="99" y="8" width="7" height="48" rx="2" fill="${eq.treadmill?'#2e7d32':'#333'}"/>
    <!-- Handlebars -->
    <rect x="82" y="12" width="28" height="5" rx="2" fill="${eq.treadmill?'#37474f':'#2a2a2a'}"/>
    <rect x="82" y="28" width="28" height="5" rx="2" fill="${eq.treadmill?'#37474f':'#2a2a2a'}"/>
    <!-- Console display -->
    <rect x="88" y="0"  width="34" height="18" rx="3" fill="${eq.treadmill?'#1a3a1a':'#1a1a1a'}"/>
    <rect x="91" y="3"  width="28" height="10" rx="2" fill="${eq.treadmill?'#00c853':'#2a2a2a'}"/>
    <text x="105" y="11" text-anchor="middle" font-size="5.5" fill="${eq.treadmill?'#001a00':'#111'}" font-weight="bold">${eq.treadmill?'READY':'- - -'}</text>
  </g>

  <!-- Kettlebell front-right-near -->
  <g ${gi('kettlebell')} transform="translate(362,390) scale(0.9)">
    <path d="M16 26 Q12 18 16 10 Q20 2 26 2 Q32 2 36 10 Q40 18 36 26 Z" fill="${eq.kettlebell?'#263238':'#444'}" stroke="${eq.kettlebell?'#66bb6a':'#666'}" stroke-width="1.5"/>
    <ellipse cx="26" cy="48" rx="20" ry="16" fill="${eq.kettlebell?'#37474f':'#444'}"/>
    <ellipse cx="26" cy="40" rx="20" ry="12" fill="${eq.kettlebell?'#37474f':'#444'}"/>
  </g>

  <!-- Foam Roller front-center (left of water cooler) -->
  <g ${gi('foam_roller')} transform="translate(196,372) scale(0.58)">
    <ellipse cx="12" cy="19" rx="10" ry="17" fill="${eq.foam_roller?'#7c4dff':'#555'}"/>
    <rect x="12" y="2" width="62" height="34" fill="${eq.foam_roller?'#7c4dff':'#555'}"/>
    <ellipse cx="74" cy="19" rx="10" ry="17" fill="${eq.foam_roller?'#7c4dff':'#555'}"/>
    ${eq.foam_roller?[24,36,48,60].map(x=>`<line x1="${x}" y1="2" x2="${x}" y2="36" stroke="#fff3" stroke-width="3"/>`).join(''):''}
  </g>

  <!-- Assault Bike front-right -->
  <g ${gi('assault_bike')} transform="translate(296,334) scale(0.92)">
    <line x1="44" y1="16" x2="24" y2="46" stroke="${eq.assault_bike?'#b71c1c':'#555'}" stroke-width="3" stroke-linecap="round"/>
    <line x1="44" y1="16" x2="64" y2="46" stroke="${eq.assault_bike?'#b71c1c':'#555'}" stroke-width="3" stroke-linecap="round"/>
    <line x1="24" y1="46" x2="64" y2="46" stroke="${eq.assault_bike?'#b71c1c':'#555'}" stroke-width="2.5"/>
    <line x1="44" y1="16" x2="44" y2="6"  stroke="${eq.assault_bike?'#b71c1c':'#555'}" stroke-width="2.5"/>
    <line x1="37" y1="6"  x2="51" y2="6"  stroke="${eq.assault_bike?'#b71c1c':'#555'}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="22" cy="54" r="14" fill="none" stroke="${eq.assault_bike?'#b71c1c':'#555'}" stroke-width="2.5"/>
    <circle cx="22" cy="54" r="5"  fill="none" stroke="${eq.assault_bike?'#b71c1c88':'#555'}" stroke-width="1.5"/>
    <circle cx="22" cy="54" r="2.5" fill="${eq.assault_bike?'#b71c1c':'#555'}"/>
    <circle cx="66" cy="54" r="14" fill="none" stroke="${eq.assault_bike?'#b71c1c':'#555'}" stroke-width="2.5"/>
    <circle cx="66" cy="54" r="5"  fill="none" stroke="${eq.assault_bike?'#b71c1c88':'#555'}" stroke-width="1.5"/>
    <circle cx="66" cy="54" r="2.5" fill="${eq.assault_bike?'#b71c1c':'#555'}"/>
  </g>

  <!-- Water cooler back-left corner (left of squat rack) -->
  <g transform="translate(46,188) scale(0.7)">
    <rect x="0"  y="0"  width="22" height="46" rx="3"  fill="#37474f"/>
    <rect x="2"  y="2"  width="18" height="14" rx="2"  fill="#1565c0" opacity=".7"/>
    <ellipse cx="11" cy="2" rx="9" ry="5" fill="#90caf9"/>
    <rect x="3"  y="18" width="16" height="26" rx="2"  fill="#263238"/>
    <rect x="5"  y="37" width="5"  height="6"  rx="1"  fill="#ef5350"/>
    <rect x="12" y="37" width="5"  height="6"  rx="1"  fill="#1565c0"/>
  </g>

  <!-- Shadow handled by CSS drop-shadow on character div -->

</svg>
<!-- Reset tap zone on floor -->
<div onclick="gymReset()" style="position:absolute;bottom:0;left:30%;width:40%;height:10%;cursor:pointer;z-index:1" title="Stand here"></div>
<!-- Real player avatar overlaid on room -->
<div id="gym-char" style="position:absolute;left:46.6%;bottom:5.5%;transform:translateX(-50%);width:80px;pointer-events:none;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))">
  <div class="gym-inner">
    ${avatarSVG}
  </div>
</div>
${(function(){
  const FOUR_LEGGED = ['dog_golden','dog_bulldog','cat_persian','cat_tabby','hamster','bunny','raccoon'];
  const ownedPets = Object.keys(state.pets||{}).filter(k => (state.pets||{})[k] && FOUR_LEGGED.includes(k));
  const wanderAnims = ['pet-wander-a','pet-wander-b','pet-wander-c'];
  const positions = [
    {left:'18%', bottom:'4.5%'},
    {left:'74%', bottom:'4.5%'},
    {left:'32%', bottom:'4.5%'},
  ];
  if (!ownedPets.length || typeof GainsShop === 'undefined') return '';
  return ownedPets.slice(0,3).map((pid, i) => {
    const anim = wanderAnims[i % wanderAnims.length];
    const dur  = (8 + i * 3) + 's';
    const delay = (i * 2.5) + 's';
    const pos  = positions[i % positions.length];
    const icon = GainsShop._petIcon(pid, 44);
    return '<div class="gym-pet" style="position:absolute;left:' + pos.left + ';bottom:' + pos.bottom + ';pointer-events:none;z-index:4">'
      + '<div class="gym-pet-wander" style="animation-name:' + anim + ';animation-duration:' + dur + ';animation-delay:-' + delay + '">'
      + '<div class="gym-pet-bounce">' + icon + '</div>'
      + '</div></div>';
  }).join('');
})()}
</div>
<div class="gw-info-panel" id="gw-info">
  <div class="gw-info-hint">Tap equipment to interact · Tap the floor to return</div>
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

function renderMiniAvatarSVG(gender, cosmetics, idx, playerName, hairStyle, skinToneIdx, hairColorIdx, tattooId, forcePose) {
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
  const pose = MINI_POSES[(typeof forcePose === 'number' && forcePose >= 0 && forcePose < MINI_POSES.length) ? forcePose : seed % 4];
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

  // Tattoo overlay
  const resolvedTattooId = tattooId || (typeof GainsShop !== 'undefined' ? null : null) || (() => { try { return JSON.parse(localStorage.getItem('musclequest_save') || '{}').tattoo || null; } catch(e) { return null; } })();
  const TATTOO_DEFS = window._TATTOOS || [];
  const activeTat = TATTOO_DEFS.find(t => t.id === resolvedTattooId);
  const isFaceTat = activeTat?.placement === 'face';
  const tattooSVG = activeTat && !isFaceTat ? `<g opacity="0.88">${activeTat.svg}</g>` : '';
  const faceTattooSVG = activeTat && isFaceTat ? `<g opacity="0.9">${activeTat.svg}</g>` : '';

  const resolvedHair = hairStyle || (female ? 'space_buns' : 'default');
  const hair = getHairSVG(resolvedHair, hc, hd);
  const sideHairSVG = hair.back;
  const femaleTopHairSVG = hair.top;
  const bangsSVG = hair.bangs;

  return `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" class="mini-avatar">
    ${sideHairSVG}
    <!-- Arms: posed -->
    <line class="avatar-arm" x1="${pose.lU[0]}" y1="${pose.lU[1]}" x2="${pose.lU[2]}" y2="${pose.lU[3]}" stroke-width="10" stroke="${skin}" stroke-linecap="round"/>
    <line class="avatar-arm" x1="${pose.lF[0]}" y1="${pose.lF[1]}" x2="${pose.lF[2]}" y2="${pose.lF[3]}" stroke-width="8" stroke="${skinD}" stroke-linecap="round"/>
    <line class="avatar-arm" x1="${pose.rU[0]}" y1="${pose.rU[1]}" x2="${pose.rU[2]}" y2="${pose.rU[3]}" stroke-width="10" stroke="${skin}" stroke-linecap="round"/>
    <line class="avatar-arm" x1="${pose.rF[0]}" y1="${pose.rF[1]}" x2="${pose.rF[2]}" y2="${pose.rF[3]}" stroke-width="8" stroke="${skinD}" stroke-linecap="round"/>
    ${wristSVG}
    <!-- Torso -->
    <rect x="40" y="36" width="20" height="26" rx="6" fill="${skin}"/>
    ${female ? `<rect x="41" y="38" width="18" height="12" rx="4" fill="#2a2a3e" opacity="0.7"/>` : ''}
    ${bodyCosmetic}
    ${tattooSVG}
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
    ${faceTattooSVG}
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
      <button class="comp-stab" onclick="MQ._compTab('sumo',this)">🏋 Sumo</button>
      <button class="comp-stab" onclick="MQ._compTab('armwrestling',this)">💪 Arm</button>
    </div>
    <div id="comp-sub-content"></div>`;
  _compTab('fight', container.querySelector('.comp-stab'));
}

async function _compTab(sub, btn) {
  document.querySelectorAll('.comp-stab').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  const sub_container = document.getElementById('comp-sub-content');
  if (!sub_container) return;
  if (sub === 'fight')        await renderFightLeaderboard(sub_container);
  if (sub === 'show')         await renderBBLeaderboard(sub_container);
  if (sub === 'sumo')         await renderSumoLeaderboard(sub_container);
  if (sub === 'armwrestling') await renderAWLeaderboard(sub_container);
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

async function renderSumoLeaderboard(container) {
  let players = null;
  const myRaw = JSON.parse(localStorage.getItem('musclequest_sumo') || '{}');
  const myWins = myRaw.wins || 0;
  const myStreak = myRaw.streak || 0;
  const myTotal = myRaw.total || 0;

  if (db) {
    try {
      container.innerHTML = '<p class="muted" style="text-align:center;padding:16px">Loading...</p>';
      const snapshot = await db.collection('users').orderBy('_sumoWins', 'desc').limit(20).get();
      players = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if ((d._sumoWins || 0) === 0) return;
        players.push({
          name: d._leaderboardName || doc.id,
          wins: d._sumoWins || 0,
          streak: d._sumoStreak || 0,
          you: doc.id === currentUser,
          gender: d._gender || 'male',
          cosmetics: d._cosmetics || [],
          hair: d._hair || '',
          _skinTone: d._skinTone ?? 1,
          _hairColor: d._hairColor ?? 0,
        });
      });
      if (!players.some(p => p.you)) {
        players.push({ name: state.name, wins: myWins, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair });
      }
      players.sort((a, b) => b.wins - a.wins || b.streak - a.streak);
    } catch(e) { players = null; }
  }

  if (!players) {
    players = [{ name: state.name, wins: myWins, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair }];
  }
  players = players.map(p => p.you ? { ...p, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair } : p);

  if (!players.some(p => p.wins > 0)) {
    document.getElementById('lb-podium').innerHTML = '';
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No sumo wins yet. Step into the ring!</p>';
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
        <span>🏋 ${p.wins} Win${p.wins !== 1 ? 's' : ''}</span>
        <span style="font-size:10px;color:var(--text-muted)">Streak: ${p.streak}${p.you ? ` · Total: ${myTotal}` : ''}</span>
      </span>
    </div>`;
  }).join('');
}

async function renderAWLeaderboard(container) {
  let players = null;
  const myRaw = JSON.parse(localStorage.getItem('musclequest_aw') || '{}');
  const myWins = myRaw.wins || 0;
  const myStreak = myRaw.streak || 0;
  const myTotal = myRaw.total || 0;

  if (db) {
    try {
      container.innerHTML = '<p class="muted" style="text-align:center;padding:16px">Loading...</p>';
      const snapshot = await db.collection('users').orderBy('_awWins', 'desc').limit(20).get();
      players = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        if ((d._awWins || 0) === 0) return;
        players.push({
          name: d._leaderboardName || doc.id,
          wins: d._awWins || 0,
          streak: d._awStreak || 0,
          you: doc.id === currentUser,
          gender: d._gender || 'male',
          cosmetics: d._cosmetics || [],
          hair: d._hair || '',
          _skinTone: d._skinTone ?? 1,
          _hairColor: d._hairColor ?? 0,
        });
      });
      if (!players.some(p => p.you)) {
        players.push({ name: state.name, wins: myWins, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair });
      }
      players.sort((a, b) => b.wins - a.wins || b.streak - a.streak);
    } catch(e) { players = null; }
  }

  if (!players) {
    players = [{ name: state.name, wins: myWins, streak: myStreak, you: true, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair }];
  }
  players = players.map(p => p.you ? { ...p, gender: state.gender, cosmetics: state.equippedCosmetics, hair: state.hair } : p);

  if (players.length === 0 || (players.length === 1 && players[0].wins === 0)) {
    document.getElementById('lb-podium').innerHTML = '';
    container.innerHTML = '<p class="muted" style="text-align:center;padding:32px">No arm wrestling wins yet. Grip the table!</p>';
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
        <span style="font-size:10px;color:var(--text-muted)">Streak: ${p.streak}${p.you ? ` · Total: ${myTotal}` : ''}</span>
      </span>
    </div>`;
  }).join('');
}

function showLeaderboard(type) { renderLeaderboard(type); }

function checkRankAchievements(type, players) {
  // Only record that the user held #1 this period — the achievement is awarded
  // when the period actually ends (handled in checkPeriodXPReset).
  const me = players.find(p => p.you);
  if (!me) return;
  if (players.indexOf(me) !== 0) return;
  let field = null;
  if (type === 'weekly')  field = '_pendingRank1Weekly';
  if (type === 'monthly') field = '_pendingRank1Monthly';
  if (type === 'yearly')  field = '_pendingRank1Yearly';
  if (!field) return;
  const periodStart = type === 'weekly' ? getWeekStart() : type === 'monthly' ? getMonthStart() : getYearStart();
  if (state[field] !== periodStart) {
    state[field] = periodStart;
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

// ─── Goals & Nutrition ───
const ACTIVITY_MULTS = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
};
const WEEKLY_DEFICITS = {
  maintain: 0, lose_half: 250, lose_one: 500, lose_one_half: 750
};

function calcCalorieBudget(g) {
  if (!g || !g.currentWeight || !g.heightCm || !g.birthYear) return null;
  const age = new Date().getFullYear() - g.birthYear;
  const weightKg = g.currentWeight * 0.453592;
  // Mifflin-St Jeor
  const bmr = state.gender === 'female'
    ? 10 * weightKg + 6.25 * g.heightCm - 5 * age - 161
    : 10 * weightKg + 6.25 * g.heightCm - 5 * age + 5;
  const tdee = bmr * (ACTIVITY_MULTS[g.activityLevel] || 1.55);
  const deficit = WEEKLY_DEFICITS[g.weeklyGoal] || 0;
  return Math.round(tdee - deficit);
}

function saveGoals() {
  if (!state.goals) state.goals = {};
  state.goals.currentWeight = parseFloat(document.getElementById('goal-cur-weight')?.value) || null;
  state.goals.goalWeight    = parseFloat(document.getElementById('goal-target-weight')?.value) || null;
  state.goals.heightCm      = parseFloat(document.getElementById('goal-height')?.value) || null;
  state.goals.birthYear     = parseInt(document.getElementById('goal-birth-year')?.value) || null;
  state.goals.weeklyGoal    = document.getElementById('goal-weekly')?.value || 'maintain';
  state.goals.activityLevel = document.getElementById('goal-activity')?.value || 'moderate';
  state.goals.exerciseGoal  = parseInt(document.getElementById('goal-ex-mins')?.value) || 30;
  state.goals.startDate     = state.goals.startDate || new Date().toISOString().split('T')[0];
  saveWithPin();
  renderGoalsSection();
  renderNutritionChart();
}

function renderGoalsSection() {
  const el = document.getElementById('goals-section');
  if (!el) return;
  const g = state.goals || {};
  const budget = calcCalorieBudget(g);
  const startStr = g.startDate ? new Date(g.startDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—';
  const lbsToGo = g.currentWeight && g.goalWeight ? Math.abs(g.currentWeight - g.goalWeight).toFixed(1) : null;
  const WEEKLY_LABELS = { maintain:'Maintain', lose_half:'Lose ½ lb/wk', lose_one:'Lose 1 lb/wk', lose_one_half:'Lose 1½ lb/wk' };
  const ACT_LABELS = { sedentary:'Sedentary', light:'Lightly Active', moderate:'Moderately Active', active:'Very Active', very_active:'Extremely Active' };

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:4px">
        <label style="font-size:11px;color:var(--text-muted)">Current Weight (lbs)</label>
        <input type="number" id="goal-cur-weight" class="health-input" style="width:100%;box-sizing:border-box" inputmode="decimal" placeholder="175" value="${g.currentWeight || ''}"/>
      </div>
      <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:4px">
        <label style="font-size:11px;color:var(--text-muted)">Goal Weight (lbs)</label>
        <input type="number" id="goal-target-weight" class="health-input" style="width:100%;box-sizing:border-box" inputmode="decimal" placeholder="165" value="${g.goalWeight || ''}"/>
      </div>
      <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:4px">
        <label style="font-size:11px;color:var(--text-muted)">Height (cm)</label>
        <input type="number" id="goal-height" class="health-input" style="width:100%;box-sizing:border-box" inputmode="decimal" placeholder="178" value="${g.heightCm || ''}"/>
      </div>
      <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:4px">
        <label style="font-size:11px;color:var(--text-muted)">Birth Year</label>
        <input type="number" id="goal-birth-year" class="health-input" style="width:100%;box-sizing:border-box" inputmode="numeric" placeholder="1995" value="${g.birthYear || ''}"/>
      </div>
    </div>
    <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:10px">
      <label style="font-size:11px;color:var(--text-muted)">Weekly Goal</label>
      <select id="goal-weekly" style="width:100%;padding:8px;background:var(--card-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px">
        ${Object.entries(WEEKLY_LABELS).map(([v,l]) => `<option value="${v}" ${g.weeklyGoal===v?'selected':''}>${l}</option>`).join('')}
      </select>
    </div>
    <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:10px">
      <label style="font-size:11px;color:var(--text-muted)">Activity Level</label>
      <select id="goal-activity" style="width:100%;padding:8px;background:var(--card-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px">
        ${Object.entries(ACT_LABELS).map(([v,l]) => `<option value="${v}" ${g.activityLevel===v?'selected':''}>${l}</option>`).join('')}
      </select>
    </div>
    <div class="setting-row" style="flex-direction:column;align-items:flex-start;gap:4px;margin-bottom:14px">
      <label style="font-size:11px;color:var(--text-muted)">🏃 Daily Exercise Goal (minutes)</label>
      <input type="number" id="goal-ex-mins" class="health-input" style="width:100%;box-sizing:border-box" inputmode="numeric" placeholder="30" value="${g.exerciseGoal ?? 30}"/>
      <span style="font-size:10px;color:var(--text-muted)">Synced automatically via the Health Shortcut → fills your exercise ring</span>
    </div>
    <button class="btn-primary" onclick="MQ.saveGoals()" style="width:100%;margin-bottom:14px">Save Goals</button>
    ${budget ? `
    <div style="background:linear-gradient(135deg,#1a1030,#0e1a20);border:1px solid #4a3060;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">Daily Calorie Budget</div>
      <div style="font-size:36px;font-weight:900;color:#a070ff;line-height:1">${budget.toLocaleString()}</div>
      <div style="font-size:11px;color:var(--text-muted);margin-top:4px">kcal / day · ${WEEKLY_LABELS[g.weeklyGoal]}</div>
      ${lbsToGo ? `<div style="margin-top:8px;font-size:12px;color:#70d0a0">🎯 ${lbsToGo} lbs to goal · Started ${startStr}</div>` : ''}
    </div>` : `<div style="color:var(--text-muted);font-size:12px;text-align:center">Fill in all fields above to calculate your calorie budget.</div>`}`;
}

function renderNutritionChart() {
  const el = document.getElementById('nutrition-chart');
  if (!el) return;
  const g = state.goals || {};
  const budget = calcCalorieBudget(g);

  if (!budget) {
    el.innerHTML = `<div style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px">Set your goals in <strong>Settings → Goals & Nutrition</strong> to see your activity rings.</div>`;
    return;
  }

  // Food consumed: from Health Sync
  const foodEaten = Math.round(healthSync?.caloriesConsumed || 0);
  // Exercise burn: from Health Sync activeCalories
  const burnCal = Math.round(healthSync?.activeCalories || 0);
  // Exercise minutes: from Health Sync
  const exMins = Math.round(healthSync?.exerciseMinutes || 0);
  // Net budget after burn added back
  const netBudget = budget + burnCal;
  // Exercise goal from settings (default 30 min)
  const exGoal = g.exerciseGoal || 30;

  // SVG arc helper: cx,cy=center, r=radius, pct=0-1, clockwise from top
  function arc(cx, cy, r, pct, color, strokeW, trailColor) {
    const circ = 2 * Math.PI * r;
    const dash = Math.min(pct, 1) * circ;
    const gap  = circ - dash;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trailColor}" stroke-width="${strokeW}" opacity=".18"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}"
        stroke-dasharray="${dash.toFixed(1)} ${gap.toFixed(1)}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>`;
  }

  const cx = 100, cy = 100;
  const burnPct  = Math.min(1, burnCal / Math.max(budget * 0.3, 200)); // burn ring vs 30% of budget as reference
  const foodPct  = foodEaten / netBudget; // allow > 1 for lap logic
  const exPct    = Math.min(1, exMins / exGoal);

  const overBudget = foodEaten > netBudget;
  // Food ring: green up to budget, then laps in orange if over
  const foodColor = overBudget ? '#ff9f0a' : '#30d158';
  const foodRingPct = overBudget ? (foodPct % 1 || 1) : foodPct; // lap: show remainder

  const svgRings = `
    ${arc(cx,cy, 80, burnPct,    '#ff375f', 14, '#ff375f')}
    ${arc(cx,cy, 62, foodRingPct, foodColor, 14, '#30d158')}
    ${arc(cx,cy, 44, exPct,      '#0a84ff', 14, '#0a84ff')}`;

  // Remaining calories label
  const remaining = netBudget - foodEaten;
  const centerLabel = overBudget
    ? [`Over`, `${Math.abs(remaining).toLocaleString()}`, `kcal over`]
    : [`Remaining`, `${remaining > 0 ? remaining.toLocaleString() : '0'}`, `kcal left`];

  el.innerHTML = `
  <div style="display:flex;align-items:center;gap:16px;padding:8px 4px">
    <!-- Rings SVG -->
    <svg viewBox="0 0 200 200" width="160" height="160" style="flex-shrink:0">
      ${svgRings}
      <!-- Centre text -->
      <text x="100" y="90" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-family="sans-serif">${centerLabel[0]}</text>
      <text x="100" y="108" text-anchor="middle" font-size="20" fill="${overBudget ? '#ff9f0a' : 'var(--text)'}" font-family="sans-serif" font-weight="700">${centerLabel[1]}</text>
      <text x="100" y="122" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="sans-serif">${centerLabel[2]}</text>
    </svg>
    <!-- Legend -->
    <div style="display:flex;flex-direction:column;gap:10px;flex:1">
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
          <div style="width:10px;height:10px;border-radius:50%;background:#ff375f;flex-shrink:0"></div>
          <span style="font-size:11px;color:var(--text-muted)">Calories burned</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:#ff375f;padding-left:16px">${burnCal > 0 ? '+'+burnCal.toLocaleString() : '—'} <span style="font-size:10px;font-weight:400;color:var(--text-muted)">kcal</span></div>
      </div>
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
          <div style="width:10px;height:10px;border-radius:50%;background:${foodColor};flex-shrink:0"></div>
          <span style="font-size:11px;color:var(--text-muted)">Food eaten ${overBudget ? '⚠ over!' : `/ ${netBudget.toLocaleString()}`}</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:${foodColor};padding-left:16px">${foodEaten > 0 ? foodEaten.toLocaleString() : '—'} <span style="font-size:10px;font-weight:400;color:var(--text-muted)">kcal</span></div>
      </div>
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
          <div style="width:10px;height:10px;border-radius:50%;background:#0a84ff;flex-shrink:0"></div>
          <span style="font-size:11px;color:var(--text-muted)">Exercise / ${exGoal} min goal</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:#0a84ff;padding-left:16px">${exMins > 0 ? exMins : '—'} <span style="font-size:10px;font-weight:400;color:var(--text-muted)">min</span></div>
      </div>
    </div>
  </div>
  <div style="text-align:center;font-size:10px;color:var(--text-muted);padding:0 0 6px">
    ${foodEaten === 0 && burnCal === 0 ? 'Log food & exercise in <strong>Settings → Health Sync</strong>' : `${foodEaten > 0 ? Math.round((foodEaten/netBudget)*100)+'% of budget used' : 'Log food calories in Health Sync'}${burnCal > 0 ? ` · +${burnCal} burned` : ''}`}
  </div>`;
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
  const foodCal  = parseFloat(document.getElementById('hs-food-cal')?.value) || 0;
  const cal      = parseFloat(document.getElementById('hs-cal')?.value) || 0;
  const sleep    = parseFloat(document.getElementById('hs-sleep')?.value) || 0;
  const exmins   = parseFloat(document.getElementById('hs-exmins')?.value) || 0;
  const url = `https://firestore.googleapis.com/v1/projects/musclequest-c5052/databases/(default)/documents/healthSync/${currentUser}?key=AIzaSyC6_AVDVbH9cBh304PJOA7cMsTBcyTw5Rc`;
  const body = JSON.stringify({ fields: {
    date:              { stringValue: todayStr() },
    steps:             { doubleValue: steps },
    protein:           { doubleValue: protein },
    caloriesConsumed:  { doubleValue: foodCal },
    activeCalories:    { doubleValue: cal },
    sleepHours:        { doubleValue: sleep },
    exerciseMinutes:   { doubleValue: exmins },
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
  showTab, submitWorkout, onMuscleGroupChange, showLeaderboard, _compTab, toggleAvatarView, showPRGraph,
  closeLevelUp, closeAchievement, updateName, updateGender, resetProgress,
  exportData, importData, addExerciseRow, removeExerciseRow, onSplitGroupChange, onSplitChange, quickAddExercise,
  onEntryMuscleChange, showHistoryTab, changeSetCount,
  showVolume, adoptLegendSplit, adoptHomeSplit, deleteSplit, openSplitBuilder, _saveSplitBuilder, _sbAddDay, _sbRemoveDay, _sbChangePreset, _sbToggleEx, renderSettingsSplits, cycleSplitDay, shareSplit, importSplitCode, _showImportCode,
  login, logout, toggleCosmetic, selectPose, toggleSettings, toast, syncStateFromStorage, setSkinTone, setHairColor, copyHealthJSON, refreshHealthSync, submitHealthForm, toggleShortcutGuide, checkHealthWriteTest, saveGoals,
  renderMiniAvatarSVG, getHairSVG,
};

})();
