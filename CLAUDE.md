# IronLore — working notes for Claude

Read this first, every session. It is the entry point; `docs/` has the detail.

IronLore (folder name `Muscle_Quest`) is an RPG-gamified workout tracker. Log real
workouts, muscles level independently, and a procedurally-drawn SVG avatar physically
grows to match. Everything else — gold, raids, gear, leaderboards — hangs off that loop.

## Hard facts about this codebase

- **Vanilla JS, no build step, no package.json, no framework, no bundler.** Four files
  do everything. Do not introduce a build step, npm, TypeScript, or a framework without
  asking — it would be a rewrite, not a change.
- **Files:** `index.html` (static shell + every tab's containers), `app.js` (~8k lines,
  the `MQ` IIFE — game, avatar, state, Firebase, panels), `store.js` (~4.1k, `GainsShop`
  IIFE — the mall), `fight.js` (~2.8k, `PunchOut` IIFE — canvas minigame),
  `styles.css` (~3k).
- **Rendering is `innerHTML` string concatenation** throughout, wired with inline
  `onclick="MQ.someFn()"`. Anything a handler calls **must be exported** in the `return
  {...}` object at the tail of the IIFE or it silently breaks at click time.
- **`esc()` untrusted strings** — player names arrive from other users via Firestore.
- **Two state systems.** `app.js` holds an in-memory `state` saved via `saveWithPin()`.
  `store.js` writes straight to localStorage via its own `getState()`/`saveState()`.
  They only reconcile through `syncStateFromStorage()`. Call it before spending anything
  that the store can also change (gold, pet food) or you'll clobber a stale value.
- **Firebase is CDN-loaded, compat SDK, and optional.** Config is in plaintext at the
  top of `app.js` — that's normal for Firebase web; security lives in `firestore.rules`.
  The app degrades to offline/mock mode when it fails to load.
- **Cloud writes are gated (since v1.3.7).** `saveWithPin(immediate)` always writes
  localStorage synchronously; the Firestore push is debounced (~2.5s) unless
  `immediate=true`. Only pass `immediate=true` for something the user actually
  confirmed (a submit, a purchase past its double-tap) — don't make new call sites
  immediate by default, that's the exact spam this was built to stop. `store.js` has no
  Firestore handle of its own; it reaches the cloud via `MQ.cloudSyncNow()` from its one
  `saveState()` choke point. If you add a new place that mutates `state` outside the
  normal UI flow (a debug tool, a migration), it does **not** need its own sync call —
  the next `saveWithPin()` picks it up. See `docs/DECISIONS.md` for the reasoning.
- **Never write to the cloud before this session has read it (since v1.4.5).**
  `_pushToCloud()` is gated on `_cloudReadVerified`, and two devices' data is *merged*
  (`_mergeStates()`), not "newest wins". Any new code path that writes the whole user doc
  must go through `saveWithPin()`/`cloudSyncNow()` — never `db...set(state)` directly (a
  dead `save()` that did exactly that was deleted). A blank or stale device with a fresh
  timestamp must never be able to overwrite the real account; that was a live data-loss
  path. New in-state fields that are *progress* (only ever grow) belong in the merge's
  union/max section; fields that can legitimately go down (shop/profile) follow the base.
- **`state` freshly hydrated from storage must call `_reconcileStreakFromLog()`.** Every
  point that does `state = {...defaultState(), ...someData}` — `load()`, `login()`,
  `autoLogin()`, `syncStateFromStorage()` — needs this call, or a stale streak value can
  leak back in. If you add another such point, add the call too; it was missed once
  already (`syncStateFromStorage()`) and only caught by testing.
- **Auth is homegrown:** username + 4-digit PIN, SHA-256 salted with the username,
  falling back to plaintext on insecure contexts.

## Versioning — follow this exactly

`MAJOR.MINOR.PATCH`, where **PATCH counts 0–19 and then rolls over**:

```
1.3.18 → 1.3.19 → 1.4.0 → 1.4.1 …
```

Bump PATCH by +1 on every push. When it would hit 20, reset to 0 and bump MINOR. MAJOR
is a deliberate milestone, never automatic. Every bump needs a matching `PATCH_NOTES`
entry (newest first) in `app.js`. The rule is restated in the comment above
`APP_VERSION` — keep the two in sync.

## Icons — verify before you use one

The UI uses the **Tabler icon webfont, pinned to 3.31.0** in `index.html`. A class that
doesn't exist renders as a silent blank box — this has bitten the project twice
(`ti-belt` never existed; the Lifting Belt showed an empty square for months).

**Never guess an icon name.** Check it first:

```bash
curl -sL "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css" \
  | grep -o '\.ti-[a-z0-9-]*' | sed 's/^\.//' | sort -u > /tmp/ti.txt
grep -qx "ti-helmet" /tmp/ti.txt && echo OK
```

**Do not use emoji for anything in the gear UI.** All 45 cosmetics use
`<i class="ti ti-x" style="color:#rrggbb"></i>` and must stay that way. Emoji glyph
coverage varies by OS — 🩴 has no glyph on Windows 10 and rendered as an invisible box.
Colour is what separates similar items (three headbands share `ti-ribbon-health`).

Emoji are still fine in prose: toasts, patch notes, item *descriptions*, shop copy.

## How to test — do this, don't eyeball it

There is no test suite. The workflow that has caught every real bug:

```bash
node --check app.js && node --check store.js && node --check fight.js
```

then serve the folder and drive it in a browser, asserting on the DOM:

```js
// in the page console
MQ.debugUnlockEverything();   // grants every cosmetic + 50 armour pieces
MQ.addGold(99999);
MQ.debugRecap();              // preview the workout-recap animation
MQ.debugLoot('epic');         // preview the loot chest at a given rarity
MQ.debugSetMuscle('all', 60); // set muscle levels ('chest'|'arms'|'legs'|'upper'|'all')
```

**Never create a test account against the live Firestore.** `initFirebase()` connects to
the real project, and `saveWithPin()` publishes to `users/<name>` on every save — a throwaway
login lands on the real leaderboards and displaces actual players. Test against an account
that already exists, or accept that the app runs fine offline and skip the login. Note
`allow delete: if false` on `/users`, so a doc created by mistake **cannot be deleted from
the client** — only hidden via `_private`.

This has happened **six times** (`gearqa`, then `posedraft`, `synctest`, `bob`,
`realuserish`, `malltest` all in one session), every time from a Firestore stub that
looked correct but wasn't actually active at the moment `MQ.login()` ran — most often
because `location.reload()` wipes any `window.__stubFirestore`-style patch and a later
`MQ.login()` call fired before it was redefined. "I stubbed it earlier in this session"
is not good enough; **the stub does not survive a reload, a new tab, or time passing**.

Before every single `MQ.login()` call, in the same tool call, immediately before it:
1. (Re-)apply the stub.
2. Read back `firebase.firestore().collection('users').doc('__probe__').get` and confirm
   it is your stub function, not the SDK's — e.g. give the stub a marker property
   (`inst.collection.__stub = true`) and assert it right there before calling login.
3. Only then call `MQ.login()`.

If you skip step 2 even once, assume it leaked and check with a **read-only** query for
that username afterward (`db.collection('users').doc(name).get()` — reading is always
safe, `allow read: if true`) before moving on. Catching it immediately is far cheaper
than finding it three test accounts later.

**Testing something that needs two accounts interacting (a challenge, a team invite)?**
Don't create two real accounts either. Stub `firebase.firestore()` with an in-memory
`Map` shared across two simulated sessions in the same page (swap `localStorage` and
call `MQ.login()` again between them) — this is how Player Challenges' escrow/payout
flow was verified. **Re-apply the stub after every reload**, per the rule above — the
in-memory `Map` itself also does not survive a reload, so a two-account test that
reloads the page mid-flow needs both the stub *and* the shared data re-established.

Assert on real values — `getComputedStyle(el,'::before').content` to prove an icon
resolves, `svg.getBBox()` to prove nothing clips, `localStorage` to prove persistence.
Screenshots lie less than assumptions, but assertions lie least.

All `debug*` exports are console-only tools kept on purpose. Leave them.

**Patching a real player's live Firestore doc directly** (fixing a bugged streak, an
inflated XP entry, etc.) — a plain authenticated-free REST `GET`/`PATCH` against
`firestore.googleapis.com` works since `/users` has no real auth, but two things bite:
1. **Always read the doc back and confirm the write actually stuck**, ideally with the
   user, before considering it done. `saveWithPin()`'s cross-device merge
   (`autoLogin()`) compares `_lastModified` and lets whichever save is newer win — a raw
   REST `PATCH` that doesn't also bump `_lastModified` looks *older* than the player's
   own device the next time it syncs, so their client just overwrites your fix straight
   back. This happened live: a streak patch was confirmed via `GET` immediately after,
   looked correct, and then silently reverted a few minutes later. Fix: always include
   `_lastModified` in the patch, set a few minutes into the future, so the corrected
   doc wins the next sync.
2. Never print `_pin` (even hashed) to the terminal — reuse the value read back from the
   doc in the same script instead of ever displaying it; a Bash call that echoes it gets
   blocked by the permission classifier anyway.

## Conventions worth matching

- Comments explain **why**, especially where something looks odd. The codebase is dense
  with these and they are load-bearing. Match that density.
- Long inline `style="..."` strings are normal here. Don't refactor them to classes
  wholesale; add a class when you're adding new UI.
- CSS custom properties: `--accent`, `--accent-glow`, `--border`, `--text`,
  `--text-muted`, `--bg-card`, `--bg-card-alt`, `--gold`.
- Mobile-first. The app is used on a phone; check at 375px.

## Where things live

| Area | Location |
|---|---|
| Version + patch notes | `app.js` top |
| Cosmetics table | `app.js` `COSMETICS` |
| Armour sets, rarity, colours | `app.js` `ARMOR_SETS` / `ARMOR_RARITY` / `ARMOR_SET_COLORS` |
| Avatar SVG | `app.js` `renderAvatar()` + `render*CosmeticsSVG()` |
| Character panel (paperdoll) | `app.js` `// ─── Character Panel ───` |
| Height scale | `app.js` `// ─── Height ───` |
| Poses | `app.js` `POSES` — preview angles with `MQ.debugPreviewPose` |
| Shop items | `store.js` `CLOTHING` (must mirror ids in `COSMETICS`) |
| XP / bonus maths | `app.js` `submitWorkout()`, `getEquipmentXPBonus()`, `getArmorSetBonus()` |
| Cloud sync | `app.js` `saveWithPin()`, `_pushToCloud()`, `_queueCloudSync()`, `cloudSyncNow()` |
| Streak self-heal | `app.js` `_reconcileStreakFromLog()` — call at every fresh-hydration point |
| Cross-device merge race guard | `app.js` `_cloudMergeSettled` (set by `autoLogin()`'s background Firestore merge, awaited by `submitWorkout()`) — prevents judging the streak against a stale pre-merge `lastWorkoutDate` |
| Cross-device sync (merge + write guard) | `app.js` `_mergeStates()` (union progress, newest-wins shop/profile), `_syncFromCloud()` (the one read-merge-adopt-push routine), `_pushToCloud()` (refuses to write until `_cloudReadVerified`, and refuses a shrunken log), `_setSyncStatus()` + `#sync-banner`. `_resetEpoch` makes reset/import authoritative. **Read `docs/DECISIONS.md` (v1.4.5) before touching any of it** — the XP-credit logic once doubled every muscle in testing; always check total weighted XP after changing it |
| Body weight tracker | `app.js` `// ─── Body Weight Tracker ───`, `state.weightLog` |
| Player Challenges | `app.js` `// ─── Player Challenges ───`, Firestore `customChallenges` collection |
| Guild Hall entry point | `store.js` main `render()` — the trash can beside the escalator. Moved twice (v1.3.8 → Back Alley, wrong; v1.3.10 → here, correct) |
| Quests tab (Challenges) | `app.js` `showQuestTab()`, `index.html` `#quest-panel-raid`. Internal key stays `raid`; visible label is "⚔️ Challenges" (v1.3.11) |
| Guild-roster team invite | `app.js` `renderPartyCard()` — `#team-gym-invite-select` fills `#team-invite-input`, gated on `state.gymId` |
| Home Gym equipment tiers | `store.js` `EQUIPMENT` (`tiers` array, `buyEquipment()`, `_depotHover()`); `app.js` `EQUIPMENT_BASE_BONUSES` / `EQUIPMENT_TIER_MULT` / `getEquipmentTier()` — keep bonus **numbers** (app.js) and bonus **text** (store.js) in sync manually, they're separate |
| Raid boss mechanic (Synchronized Strike) | `app.js` `_maybeTriggerDailyBossAttack()` (telegraph/resolve), `_applyTeamWorkoutEffects()` (per-member completion), `team.activeMechanic` / `team.mechanicCount` on the Firestore team doc, capped via `SYNC_STRIKE_MAX_BY_SIZE` |
| Trainers (splits, philosophy, Q&A) | `store.js` `TRAINERS` array, rendered by `openTrainerProfile()`'s 5–6 page "magazine" swipe deck. A trainer's `faq` array + `faqSource`/`faqSourceLabel` adds an optional Page 6 — only trainers with sourced data get it. Splits are being re-verified against real sources one trainer at a time (Louie Simmons done, v1.4.1) — don't assume an un-sourced trainer's split is accurate |

## Read next

- `docs/ARCHITECTURE.md` — how the systems fit together, and the traps in each
- `docs/ROADMAP.md` — what's done, what's next, what's known-broken
- `docs/DECISIONS.md` — choices already made and why, so they aren't relitigated
