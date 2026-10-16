// src/lib/scoreEngine.js
// Heart Score: a percentage (0.00–100.00) that reflects long-term
// engagement with prevention habits. Starts at 0 during onboarding,
// grows through the survey, then accumulates forever from Home.

const MIN_SCORE = 0;
const MAX_SCORE = 100;

// Weighted adjustments — expressed in percentage points.
// Negative impact is slightly stronger than positive: heart health
// slides faster than it improves.
export const SCORE_RULES = {
  habitDone: +1.4,
  allDoneBonus: +3.5,
  friedFood: -2.8,
  saltyFood: -2.4,
  sugaryFood: -2.2,
  redMeat: -1.2,
  vegFood: +1.6,
  fruitFood: +1.4,
  beansFood: +1.0,
  wholeGrains: +1.2,
  fishFood: +1.1,
  skippedLogging: -1.8,
  inactiveDay: -1.5,
  activeDay: +1.3,
};

function clamp(n) {
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, n));
}

/**
 * Score delta for a single day.
 */
export function dayDelta({ doneKeys = [], planKeys = [], log }) {
  let delta = 0;

  delta += doneKeys.length * SCORE_RULES.habitDone;
  if (planKeys.length > 0 && doneKeys.length >= planKeys.length) {
    delta += SCORE_RULES.allDoneBonus;
  }

  const foods = Array.isArray(log?.food) ? log.food : [];
  if (foods.includes("fried"))       delta += SCORE_RULES.friedFood;
  if (foods.includes("salty"))       delta += SCORE_RULES.saltyFood;
  if (foods.includes("sugary"))      delta += SCORE_RULES.sugaryFood;
  if (foods.includes("redMeat"))     delta += SCORE_RULES.redMeat;
  if (foods.includes("vegetables"))  delta += SCORE_RULES.vegFood;
  if (foods.includes("fruit"))       delta += SCORE_RULES.fruitFood;
  if (foods.includes("beans"))       delta += SCORE_RULES.beansFood;
  if (foods.includes("wholeGrains")) delta += SCORE_RULES.wholeGrains;
  if (foods.includes("fish"))        delta += SCORE_RULES.fishFood;

  if (log?.movement === "none")                                    delta += SCORE_RULES.inactiveDay;
  if (log?.movement === "moderate" || log?.movement === "intense") delta += SCORE_RULES.activeDay;

  const engaged = doneKeys.length > 0 || foods.length > 0 || log?.movement;
  if (!engaged) delta += SCORE_RULES.skippedLogging;

  return delta;
}

/**
 * Rebuild score over full history, oldest → newest.
 */
export function scoreFromHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return { score: 0, trail: [] };
  }

  const ordered = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let score = 0;
  const trail = [];

  for (const day of ordered) {
    const delta = dayDelta({
      doneKeys: day.doneKeys || [],
      planKeys: day.planKeys || [],
      log: day,
    });
    score = clamp(score + delta);
    trail.push({
      date: day.date,
      score: Number(score.toFixed(2)),
      delta: Number(delta.toFixed(2)),
    });
  }

  return { score: Number(score.toFixed(2)), trail };
}

/**
 * Compute the onboarding score as the user answers the survey.
 * Starts at 0, ticks up per answer, caps at 75.
 * Now includes work type and sit hours.
 */
export function onboardingScore({ age, gender, activityLevel, workType, sitHours, risks }) {
  let s = 0;
  if (age) s += 12;
  if (gender) s += 8;
  if (activityLevel) s += 12;
  if (workType) s += 10;
  if (sitHours) s += 8;
  const riskCount = Object.values(risks || {}).filter(Boolean).length;
  s += Math.max(0, 30 - riskCount * 5);
  return Math.min(75, s);
}

/**
 * Score → tone bucket.
 */
export function scoreTone(score) {
  if (score >= 85) return "emerald";
  if (score >= 65) return "amber";
  if (score >= 40) return "orange";
  return "red";
}

/**
 * Human label for a score.
 */
export function scoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Steady";
  if (score >= 45) return "Needs attention";
  if (score >= 25) return "At risk";
  return "Take action";
}

/**
 * Rate a single food item.
 */
const FOOD_TIERS = {
  kontomire: "good", grilledFish: "good", water: "good",
  fruit: "good", vegetables: "good", beans: "good",
  wholeGrains: "good", fish: "good", koko: "good",
  banku: "ok", kenkey: "ok", fufu: "ok", waakye: "ok",
  jollof: "ok", milo: "ok", redMeat: "ok", dairy: "ok",
  kelewele: "bad", friedFish: "bad", friedRice: "bad",
  shito: "bad", minerals: "bad", energyDrink: "bad",
};
export function foodTier(key) {
  return FOOD_TIERS[key] || "ok";
}

/**
 * Warning generator — scans history for patterns.
 */
export function patternWarnings(history) {
  if (!Array.isArray(history) || history.length < 3) return [];
  const recent = history.slice(0, 7);
  const warnings = [];

  const friedStreak = countTrailing(recent, (d) => d.food?.includes("fried"));
  if (friedStreak >= 3) warnings.push({
    level: "warn",
    text: `You've logged fried food ${friedStreak} days in a row. Try grilling or steaming one meal.`,
  });

  const saltStreak = countTrailing(recent, (d) => d.food?.includes("salty"));
  if (saltStreak >= 3) warnings.push({
    level: "warn",
    text: `Salty food ${saltStreak} days running. Try pepper, ginger, or garlic instead.`,
  });

  const sugarStreak = countTrailing(recent, (d) => d.food?.includes("sugary"));
  if (sugarStreak >= 3) warnings.push({
    level: "warn",
    text: `Sugary drinks ${sugarStreak} days in a row. Swap one for water today.`,
  });

  const inactiveStreak = countTrailing(recent, (d) => d.movement === "none");
  if (inactiveStreak >= 3) warnings.push({
    level: "warn",
    text: `${inactiveStreak} inactive days. A 15-minute walk changes your score.`,
  });

  const vegStreak = countTrailing(recent, (d) => d.food?.includes("vegetables"));
  if (vegStreak >= 4) warnings.push({
    level: "info",
    text: `${vegStreak} days with vegetables. Keep going — this is what helps.`,
  });

  return warnings.slice(0, 2);
}

function countTrailing(list, predicate) {
  let n = 0;
  for (const item of list) {
    if (predicate(item)) n++;
    else break;
  }
  return n;
}

/**
 * Weekly summary stats.
 */
export function weeklyStats(history) {
  const last7 = Array.isArray(history) ? history.slice(0, 7) : [];
  const foodFlags = { fried: 0, salty: 0, sugary: 0, veg: 0, fruit: 0 };
  let activeDays = 0;
  for (const d of last7) {
    const f = d.food || [];
    if (f.includes("fried")) foodFlags.fried++;
    if (f.includes("salty")) foodFlags.salty++;
    if (f.includes("sugary")) foodFlags.sugary++;
    if (f.includes("vegetables")) foodFlags.veg++;
    if (f.includes("fruit")) foodFlags.fruit++;
    if (d.movement === "moderate" || d.movement === "intense" || d.movement === "light") activeDays++;
  }
  return { logged: last7.length, activeDays, foodFlags };
}