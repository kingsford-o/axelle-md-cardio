// src/lib/planEngine.js
// Rule-based prevention plan generator for Axelle MD Cardio.

export const HABITS = {
  // Movement
  walk15: { key: "walk15", label: "Walk for 15 minutes", hint: "A brisk walk after a meal helps your heart.", tag: "movement" },
  stairs: { key: "stairs", label: "Take the stairs instead of the lift", hint: "Small climbs add up.", tag: "movement" },
  stretch5: { key: "stretch5", label: "Stretch for 5 minutes", hint: "Loosens your body and lowers stress.", tag: "movement" },
  standBreak: { key: "standBreak", label: "Stand and move every hour", hint: "Set a reminder. Two minutes is enough.", tag: "movement" },
  walkBreak: { key: "walkBreak", label: "Take a 5-minute walk break", hint: "Step outside or walk the corridor.", tag: "movement" },

  // Food
  lessSalt: { key: "lessSalt", label: "Cook with less salt today", hint: "Use pepper, ginger, garlic, or herbs instead.", tag: "food" },
  noFried: { key: "noFried", label: "Skip fried foods today", hint: "Grill, boil, or steam instead of frying.", tag: "food" },
  veggie: { key: "veggie", label: "Eat at least one serving of vegetables", hint: "Kontomire, garden eggs, okra, or spinach.", tag: "food" },
  fruit: { key: "fruit", label: "Eat one piece of fruit", hint: "Orange, banana, pawpaw, or mango.", tag: "food" },
  water6: { key: "water6", label: "Drink 6 glasses of water", hint: "Spread them through the day.", tag: "food" },
  lessSugar: { key: "lessSugar", label: "Skip sugary drinks today", hint: "Swap soda for water or unsweetened tea.", tag: "food" },
  packedLunch: { key: "packedLunch", label: "Pack lunch instead of buying fried", hint: "Home food is cheaper and healthier.", tag: "food" },

  // Habit
  noSmoke: { key: "noSmoke", label: "Skip cigarettes today", hint: "Every smoke-free day helps your heart.", tag: "habit" },
  noAlcohol: { key: "noAlcohol", label: "Skip alcohol today", hint: "Your heart and sleep both benefit.", tag: "habit" },

  // Rest / stress
  sleep7: { key: "sleep7", label: "Get 7+ hours of sleep tonight", hint: "Poor sleep raises blood pressure over time.", tag: "rest" },
  breathe: { key: "breathe", label: "Do a 3-minute breathing exercise", hint: "Slow, deep breaths calm your heart.", tag: "rest" },
  protectSleep: { key: "protectSleep", label: "Protect your sleep window", hint: "Dark room, same time, no screens.", tag: "rest" },
  windDown: { key: "windDown", label: "Wind down 30 minutes before bed", hint: "No heavy food, no arguments, no screens.", tag: "rest" },

  // Awareness
  learn: { key: "learn", label: "Read one short lesson", hint: "5 minutes a day adds up fast.", tag: "learn" },
};

const RULES = [
  // ── Movement rules
  { id: "sedentary-movement", when: (p) => p.activityLevel === "sedentary", add: ["walk15", "stairs", "stretch5"] },
  { id: "moderate-movement", when: (p) => p.activityLevel === "moderate", add: ["walk15", "stairs"] },
  { id: "active-movement", when: (p) => p.activityLevel === "active" || p.activityLevel === "very-active", add: ["walk15"] },

  // ── Sitting rules
  { id: "sits-4-6", when: (p) => p.sitHours === "4to6", add: ["standBreak", "walkBreak"] },
  { id: "sits-over6", when: (p) => p.sitHours === "over6", add: ["standBreak", "walkBreak", "walk15"] },

  // ── Work-type rules
  { id: "desk-job", when: (p) => p.workType === "desk", add: ["standBreak", "stretch5", "walkBreak"] },
  { id: "standing-job", when: (p) => p.workType === "standing", add: ["stretch5", "walk15"] },
  { id: "physical-job", when: (p) => p.workType === "physical", add: ["stretch5", "breathe"] },
  { id: "driving-job", when: (p) => p.workType === "driving", add: ["standBreak", "walkBreak", "packedLunch"] },
  { id: "shift-job", when: (p) => p.workType === "shift", add: ["protectSleep", "windDown", "breathe"] },
  { id: "unemployed", when: (p) => p.workType === "unemployed", add: ["walk15", "learn"] },
  { id: "homemaker", when: (p) => p.workType === "homemaker", add: ["stretch5", "walk15"] },

  // ── Food rules
  { id: "high-salt", when: (p) => p.risks?.highSalt, add: ["lessSalt", "veggie"] },
  { id: "normal-salt", when: (p) => !p.risks?.highSalt, add: ["lessSalt"] },
  { id: "fried-food", when: (p) => p.risks?.friedFood, add: ["noFried", "packedLunch", "veggie"] },
  { id: "sugary-drinks", when: (p) => p.risks?.sugaryDrinks, add: ["lessSugar", "water6"] },
  { id: "no-sugary-drinks", when: (p) => !p.risks?.sugaryDrinks, add: ["water6", "fruit"] },

  // ── Smoking
  { id: "smoker", when: (p) => p.risks?.smoker, add: ["noSmoke", "breathe"] },

  // ── Stress
  { id: "high-stress", when: (p) => p.risks?.highStress, add: ["breathe", "windDown"] },

  // ── Age
  { id: "age-40-plus", when: (p) => p.age >= 40, add: ["learn", "breathe"] },
  { id: "age-under-40", when: (p) => p.age > 0 && p.age < 40, add: ["learn"] },

  // ── Family history
  { id: "family-history", when: (p) => p.risks?.familyHistory, add: ["learn", "walk15"] },

  // ── Everyone
  { id: "everyone-rest", when: () => true, add: ["sleep7"] },
];

const MAX_PLAN_SIZE = 5;

export function generatePlan(profile) {
  if (!profile) return ["water6", "walk15", "lessSalt", "sleep7", "learn"];

  const seen = new Set();
  const ordered = [];

  for (const rule of RULES) {
    if (!rule.when(profile)) continue;
    for (const key of rule.add) {
      if (!seen.has(key) && HABITS[key]) {
        seen.add(key);
        ordered.push(key);
      }
    }
  }

  // Prioritize: movement → food → habit → rest → learn
  const tagOrder = ["movement", "food", "habit", "rest", "learn"];
  const grouped = { movement: [], food: [], habit: [], rest: [], learn: [] };
  for (const key of ordered) {
    const tag = HABITS[key].tag;
    if (grouped[tag]) grouped[tag].push(key);
  }

  const final = [];
  for (const tag of tagOrder) {
    for (const key of grouped[tag]) {
      if (final.length < MAX_PLAN_SIZE) final.push(key);
    }
  }

  return final;
}

export function adaptPlan(basePlanKeys, yesterdayLog) {
  if (!yesterdayLog) return basePlanKeys;

  const plan = new Set(basePlanKeys);

  if (yesterdayLog.food?.includes("fried") && HABITS.noFried) plan.add("noFried");
  if (yesterdayLog.food?.includes("salty") && HABITS.lessSalt) plan.add("lessSalt");
  if (yesterdayLog.food?.includes("sugary") && HABITS.lessSugar) plan.add("lessSugar");
  if (yesterdayLog.movement === "none" && HABITS.walk15) plan.add("walk15");

  return Array.from(plan).slice(0, MAX_PLAN_SIZE);
}

export function planProgress(planKeys, todayDoneKeys) {
  const total = planKeys.length;
  const doneSet = new Set(todayDoneKeys || []);
  const completed = planKeys.filter((k) => doneSet.has(k)).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent, allDone: completed === total && total > 0 };
}

export function focusFromProfile(profile) {
  const focus = [];
  if (!profile) return focus;
  if (profile.risks?.highSalt) focus.push({ key: "salt", label: "High salt intake" });
  if (profile.risks?.friedFood) focus.push({ key: "fried", label: "Frequent fried food" });
  if (profile.risks?.sugaryDrinks) focus.push({ key: "sugar", label: "Sugary drinks" });
  if (profile.risks?.smoker) focus.push({ key: "smoke", label: "Smoking" });
  if (profile.risks?.highStress) focus.push({ key: "stress", label: "High stress" });
  if (profile.sitHours === "over6") focus.push({ key: "sitting", label: "Long sitting hours" });
  if (profile.workType === "shift") focus.push({ key: "shift", label: "Shift work" });
  if (profile.workType === "driving") focus.push({ key: "driving", label: "Long driving hours" });
  if (profile.activityLevel === "sedentary") focus.push({ key: "sedentary", label: "Low activity" });
  if (profile.risks?.familyHistory) focus.push({ key: "family", label: "Family history" });
  if (focus.length === 0) focus.push({ key: "maintain", label: "Maintaining a healthy routine" });
  return focus.slice(0, 3);
}