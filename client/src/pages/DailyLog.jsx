import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { loadToday, saveToday, appendToHistory } from "../lib/dailyLog.js";
import { foodTier } from "../lib/scoreEngine.js";

const LOCAL_FOODS = [
  { key: "jollof", label: "Jollof rice", salty: true },
  { key: "waakye", label: "Waakye", salty: true },
  { key: "banku", label: "Banku & tilapia", salty: true, fried: true },
  { key: "kenkey", label: "Kenkey & fish", salty: true, fried: true },
  { key: "fufu", label: "Fufu & soup", salty: true },
  { key: "kelewele", label: "Kelewele", fried: true },
  { key: "kontomire", label: "Kontomire stew", veg: true },
  { key: "shito", label: "Shito", salty: true },
  { key: "friedRice", label: "Fried rice", salty: true, fried: true },
  { key: "friedFish", label: "Fried fish", fried: true },
  { key: "grilledFish", label: "Grilled fish" },
  { key: "koko", label: "Koko (porridge)" },
  { key: "milo", label: "Milo drink", sugary: true },
  { key: "minerals", label: "Minerals / soda", sugary: true },
  { key: "energyDrink", label: "Energy drink", sugary: true },
  { key: "water", label: "Water" },
];

const FOOD_CATEGORIES = [
  { key: "vegetables", label: "Vegetables" },
  { key: "fruit", label: "Fruit" },
  { key: "beans", label: "Beans or legumes" },
  { key: "wholeGrains", label: "Whole grains" },
  { key: "redMeat", label: "Red meat" },
  { key: "dairy", label: "Dairy" },
];

const MOVEMENT_OPTIONS = [
  { key: "none", label: "Sat most of the day" },
  { key: "light", label: "Light walking" },
  { key: "moderate", label: "Moderate exercise" },
  { key: "intense", label: "Intense exercise" },
];

function Dot({ tier }) {
  const color =
    tier === "good" ? "bg-emerald-400" :
    tier === "bad" ? "bg-red-400" :
    "bg-amber-400";
  return <span className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />;
}

export default function DailyLog() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [movement, setMovement] = useState("");
  const [customFood, setCustomFood] = useState("");
  const [customMovement, setCustomMovement] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const today = loadToday();
    if (today.foods) setFoods(today.foods);
    if (today.categories) setCategories(today.categories);
    if (today.movement) setMovement(today.movement);
    if (today.customFood) setCustomFood(today.customFood);
    if (today.customMovement) setCustomMovement(today.customMovement);
  }, []);

  const toggleFood = (key) =>
    setFoods((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const toggleCategory = (key) =>
    setCategories((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const deriveFlags = () => {
    const flags = { salty: false, fried: false, sugary: false, veg: false };
    foods.forEach((k) => {
      const f = LOCAL_FOODS.find((x) => x.key === k);
      if (!f) return;
      if (f.salty) flags.salty = true;
      if (f.fried) flags.fried = true;
      if (f.sugary) flags.sugary = true;
      if (f.veg) flags.veg = true;
    });
    if (categories.includes("vegetables") || categories.includes("fruit")) flags.veg = true;

    const text = customFood.toLowerCase();
    if (/(waakye|shito|jollof|banku|kenkey|fufu|salted|salt)/.test(text)) flags.salty = true;
    if (/(fried|kelewele|chips|fry)/.test(text)) flags.fried = true;
    if (/(soda|minerals|coke|fanta|milo|energy|sweet)/.test(text)) flags.sugary = true;
    if (/(kontomire|vegetable|salad|greens|fruit)/.test(text)) flags.veg = true;

    return flags;
  };

  const handleSave = () => {
    const today = loadToday();
    const flags = deriveFlags();
    const foodTags = [];
    if (flags.salty) foodTags.push("salty");
    if (flags.fried) foodTags.push("fried");
    if (flags.sugary) foodTags.push("sugary");
    if (flags.veg) foodTags.push("vegetables");

    const next = {
      ...today,
      foods,
      categories,
      movement,
      customFood: customFood.trim().slice(0, 300),
      customMovement: customMovement.trim().slice(0, 200),
      food: foodTags,
    };
    saveToday(next);
    appendToHistory({ ...next, savedAt: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate("/home");
    }, 800);
  };

  const card = `rounded-3xl border ${
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const chip = (selected) =>
    `px-3.5 py-2 rounded-full text-xs font-medium transition border inline-flex items-center gap-1.5 ${
      selected
        ? isDark
          ? "bg-white text-slate-900 border-white"
          : "bg-slate-900 text-white border-slate-900"
        : isDark
          ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
    }`;
  const inputClass = `w-full px-4 py-3 rounded-2xl text-sm outline-none border transition ${
    isDark
      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-600"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400"
  }`;

  return (
    <div className={`min-h-dvh ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">

        <header className="flex items-center justify-between gap-3 mb-6">
          <h1 className={`text-2xl font-semibold tracking-tight ${textPrimary}`}>Today's log</h1>
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-400"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            {isDark ? "☀" : "☾"}
          </button>
        </header>

        <p className={`text-sm mb-5 ${textMuted}`}>
          Tap what you ate, or type your own. Everything shapes tomorrow's plan.
        </p>

        {/* Common foods */}
        <div className={`${card} p-6 mb-3`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            Common foods
          </p>
          <div className="flex flex-wrap gap-2">
            {LOCAL_FOODS.map((f) => (
              <button
                key={f.key}
                onClick={() => toggleFood(f.key)}
                className={chip(foods.includes(f.key))}
              >
                <Dot tier={foodTier(f.key)} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className={`flex items-center gap-4 px-1 mb-5 text-[10px] ${textMuted}`}>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Heart-friendly
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            In moderation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Minimize
          </span>
        </div>

        {/* Food groups */}
        <div className={`${card} p-6 mb-5`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            Food groups
          </p>
          <div className="flex flex-wrap gap-2">
            {FOOD_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => toggleCategory(c.key)}
                className={chip(categories.includes(c.key))}
              >
                <Dot tier={foodTier(c.key)} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom food */}
        <div className={`${card} p-6 mb-5`}>
          <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            Something else you ate?
          </label>
          <textarea
            value={customFood}
            onChange={(e) => setCustomFood(e.target.value)}
            placeholder="e.g. waakye with shito and fried fish, one bottle of Fanta"
            rows={3}
            maxLength={300}
            className={inputClass + " resize-none"}
          />
          <p className={`text-[10px] mt-2 ${textMuted}`}>
            Write it however you like. We'll notice common foods.
          </p>
        </div>

        {/* Movement */}
        <div className={`${card} p-6 mb-5`}>
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            How did you move today?
          </p>
          <div className="space-y-2 mb-3">
            {MOVEMENT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMovement(opt.key)}
                className={`w-full p-3.5 rounded-2xl text-sm text-left transition border ${
                  movement === opt.key
                    ? isDark
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-900 text-white border-slate-900"
                    : isDark
                      ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={customMovement}
            onChange={(e) => setCustomMovement(e.target.value)}
            placeholder="Or describe it — e.g. walked to the market and back"
            maxLength={200}
            className={inputClass}
          />
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-2xl text-sm font-medium transition ${
            isDark
              ? "bg-white text-slate-900 hover:bg-slate-100"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {saved ? "✓ Saved" : "Save log"}
        </button>

        <p className={`text-[10px] text-center mt-4 ${textMuted}`}>
          Your log stays on this device.
        </p>

      </div>
    </div>
  );
}