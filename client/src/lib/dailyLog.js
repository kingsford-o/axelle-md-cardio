// src/lib/dailyLog.js
// All user-specific data lives in localStorage on this device.
// No accounts, no server — matches the anonymous-visitor design.

const KEYS = {
  profile: "axelle_profile",
  todayLog: "axelle_today",     // { date, doneKeys: [], food: [], movement, mood }
  history: "axelle_history",    // [ { date, doneKeys, food, movement, mood } ]
  plan: "axelle_plan",          // { date, keys: [] } — current plan for today
};

// ─── Date helpers ────────────────────────────────────────────────
export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── Profile ─────────────────────────────────────────────────────
export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) {
      // Fall back to the older survey storage keys if present
      const legacy = {
        age: parseInt(localStorage.getItem("kyh_age") || "0", 10) || null,
        gender: localStorage.getItem("kyh_gender") || null,
        activityLevel: localStorage.getItem("kyh_activity") || null,
        risks: null,
      };
      if (legacy.age || legacy.gender || legacy.activityLevel) return legacy;
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  } catch (e) {
    console.warn("Could not save profile:", e);
  }
}

// ─── Today's checklist ───────────────────────────────────────────
export function loadToday() {
  try {
    const raw = localStorage.getItem(KEYS.todayLog);
    if (!raw) return { date: todayKey(), doneKeys: [] };
    const parsed = JSON.parse(raw);
    // If it's a different day, start fresh
    if (parsed.date !== todayKey()) return { date: todayKey(), doneKeys: [] };
    return parsed;
  } catch {
    return { date: todayKey(), doneKeys: [] };
  }
}

export function saveToday(today) {
  try {
    localStorage.setItem(KEYS.todayLog, JSON.stringify(today));
  } catch (e) {
    console.warn("Could not save today:", e);
  }
}

export function toggleHabitDone(key) {
  const today = loadToday();
  const set = new Set(today.doneKeys || []);
  if (set.has(key)) set.delete(key);
  else set.add(key);
  const next = { ...today, doneKeys: Array.from(set) };
  saveToday(next);
  return next;
}

// ─── History ─────────────────────────────────────────────────────
export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEYS.history);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function appendToHistory(entry) {
  const history = loadHistory();
  const filtered = history.filter((h) => h.date !== entry.date);
  // Save the current plan's keys so we can recompute score accurately
  const plan = loadPlan();
  const full = {
    ...entry,
    planKeys: plan?.keys || entry.planKeys || [],
  };
  const next = [full, ...filtered].slice(0, 365); // keep a year
  try {
    localStorage.setItem(KEYS.history, JSON.stringify(next));
  } catch (e) {
    console.warn("Could not append to history:", e);
  }
  return next;
}

// ─── Plan ────────────────────────────────────────────────────────
export function loadPlan() {
  try {
    const raw = localStorage.getItem(KEYS.plan);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== todayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePlan(keys) {
  try {
    const plan = { date: todayKey(), keys };
    localStorage.setItem(KEYS.plan, JSON.stringify(plan));
    return plan;
  } catch (e) {
    console.warn("Could not save plan:", e);
    return null;
  }
}

// ─── Streak calculation ──────────────────────────────────────────
export function computeStreak() {
  const history = loadHistory();
  if (history.length === 0) return 0;

  // Count consecutive days (starting yesterday, going backwards)
  // where the user completed at least one habit.
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    const day = history.find((h) => h.date === key);
    if (day && day.doneKeys && day.doneKeys.length > 0) streak++;
    else if (i === 0) continue; // today doesn't count yet if empty
    else break;
  }
  return streak;
}