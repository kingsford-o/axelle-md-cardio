import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { loadHistory, loadProfile, computeStreak } from "../lib/dailyLog.js";
import { scoreFromHistory, weeklyStats } from "../lib/scoreEngine.js";
import { HABITS } from "../lib/planEngine.js";

// Modules matching planEngine + lessons
const MODULES = [
  { slug: "cardiovascular-disease", title: "What is cardiovascular disease?", short: "CVD basics" },
  { slug: "blood-pressure", title: "Understanding blood pressure", short: "Blood pressure" },
  { slug: "heart-attack-stroke", title: "Heart attack & stroke", short: "Heart attack & stroke" },
  { slug: "protecting-your-heart", title: "Protecting your heart", short: "Protecting your heart" },
];

export default function Review() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weekly, setWeekly] = useState(null);

  useEffect(() => {
    const h = loadHistory();
    setHistory(h);
    setProfile(loadProfile());
    setStreak(computeStreak());
    const { score: s } = scoreFromHistory(h);
    const initial = parseFloat(localStorage.getItem("axelle_initial_score") || "50");
    setScore(h.length === 0 ? initial : Math.min(100, Math.max(0, initial + s)));
    setWeekly(weeklyStats(h));
  }, []);

  // Aggregate food signals from last 14 days
  const foodPattern = useMemo(() => {
    const last14 = history.slice(0, 14);
    const counts = { fried: 0, salty: 0, sugary: 0, veg: 0, fruit: 0 };
    for (const d of last14) {
      const f = d.food || [];
      if (f.includes("fried")) counts.fried++;
      if (f.includes("salty")) counts.salty++;
      if (f.includes("sugary")) counts.sugary++;
      if (f.includes("vegetables")) counts.veg++;
      if (f.includes("fruit")) counts.fruit++;
    }
    return counts;
  }, [history]);

  // Habit completion rate
  const habitRate = useMemo(() => {
    const last14 = history.slice(0, 14);
    if (last14.length === 0) return 0;
    let done = 0;
    let total = 0;
    for (const d of last14) {
      done += (d.doneKeys || []).length;
      total += (d.planKeys || []).length || 5;
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }, [history]);

  // Weak spots — what needs attention
  const weakSpots = useMemo(() => {
    const spots = [];
    if (foodPattern.fried >= 3) spots.push({
      key: "fried",
      label: "Fried food",
      message: `Logged ${foodPattern.fried} times in the last 14 days.`,
      cta: "Try grilling or steaming",
    });
    if (foodPattern.salty >= 4) spots.push({
      key: "salty",
      label: "High salt",
      message: `Logged ${foodPattern.salty} times in the last 14 days.`,
      cta: "Season with pepper & ginger",
    });
    if (foodPattern.sugary >= 3) spots.push({
      key: "sugary",
      label: "Sugary drinks",
      message: `Logged ${foodPattern.sugary} times in the last 14 days.`,
      cta: "Swap one for water",
    });
    if (habitRate < 40 && history.length >= 3) spots.push({
      key: "habits",
      label: "Low habit completion",
      message: `Only ${habitRate}% of your plan completed.`,
      cta: "Pick one habit to nail today",
    });
    if (spots.length === 0) spots.push({
      key: "steady",
      label: "No clear weak spots",
      message: "You're keeping steady. Keep the routine going.",
      cta: "Read one lesson this week",
    });
    return spots.slice(0, 3);
  }, [foodPattern, habitRate, history]);

  // Food signal bar — visual
  const signals = [
    { key: "fried", label: "Fried", count: foodPattern.fried, tone: "red" },
    { key: "salty", label: "Salty", count: foodPattern.salty, tone: "amber" },
    { key: "sugary", label: "Sugary", count: foodPattern.sugary, tone: "red" },
    { key: "veg", label: "Veg", count: foodPattern.veg, tone: "emerald" },
    { key: "fruit", label: "Fruit", count: foodPattern.fruit, tone: "emerald" },
  ];

  const card = `rounded-3xl border transition-colors ${
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const toneBg = (tone) => {
    const map = {
      emerald: isDark ? "bg-emerald-500" : "bg-emerald-500",
      amber: isDark ? "bg-amber-500" : "bg-amber-500",
      red: isDark ? "bg-red-500" : "bg-red-500",
    };
    return map[tone] || map.emerald;
  };

  const maxSignal = Math.max(1, ...signals.map((s) => s.count));

  return (
    <div className={`min-h-dvh ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">

        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${textPrimary}`}>
              Review
            </h1>
            <p className={`text-xs mt-1 ${textMuted}`}>
              What your last two weeks show
            </p>
          </div>
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

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${card} p-5`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${textMuted}`}>
              Heart score
            </p>
            <p className={`text-2xl font-semibold mt-2 ${textPrimary}`}>
              {score.toFixed(1)}<span className={`text-sm ${textMuted} ml-0.5`}>%</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`${card} p-5`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${textMuted}`}>
              Streak
            </p>
            <p className={`text-2xl font-semibold mt-2 ${textPrimary}`}>
              {streak}<span className={`text-sm ${textMuted} ml-0.5`}>d</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${card} p-5`}
          >
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${textMuted}`}>
              Habit rate
            </p>
            <p className={`text-2xl font-semibold mt-2 ${textPrimary}`}>
              {habitRate}<span className={`text-sm ${textMuted} ml-0.5`}>%</span>
            </p>
          </motion.div>
        </div>

        {/* Weak spots — the actual "review" */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-5"
        >
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            Where you're slipping
          </h2>
          <div className="space-y-2">
            {weakSpots.map((spot) => (
              <div
                key={spot.key}
                className={`${card} p-5 flex items-start gap-4 ${
                  spot.key === "steady"
                    ? isDark ? "border-emerald-900/60" : "border-emerald-200"
                    : isDark ? "border-amber-900/60" : "border-amber-200"
                }`}
              >
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  spot.key === "steady"
                    ? isDark ? "bg-emerald-950/50" : "bg-emerald-50"
                    : isDark ? "bg-amber-950/50" : "bg-amber-50"
                }`}>
                  <span className={`text-base ${
                    spot.key === "steady" ? "text-emerald-500" : "text-amber-500"
                  }`}>
                    {spot.key === "steady" ? "✓" : "!"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${textPrimary}`}>{spot.label}</p>
                  <p className={`text-xs mt-1 leading-relaxed ${textMuted}`}>{spot.message}</p>
                  <p className={`text-xs mt-2 font-medium ${
                    spot.key === "steady" ? "text-emerald-500" : "text-amber-500"
                  }`}>{spot.cta}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Food signals over 14 days */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${card} p-6 mb-5`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-semibold uppercase tracking-wider ${textMuted}`}>
              Food patterns
            </h2>
            <span className={`text-[10px] ${textMuted}`}>
              Last {history.length} day{history.length !== 1 ? "s" : ""}
            </span>
          </div>
          {history.length === 0 ? (
            <p className={`text-xs ${textMuted}`}>
              No logs yet. Start logging your food to see patterns.
            </p>
          ) : (
            <div className="space-y-3">
              {signals.map((s) => (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-medium ${textPrimary}`}>{s.label}</span>
                    <span className={`text-xs ${textMuted}`}>
                      {s.count} time{s.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isDark ? "bg-slate-800" : "bg-slate-100"
                  }`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.count / maxSignal) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${toneBg(s.tone)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Lessons to revisit */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-5"
        >
          <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            Lessons to revisit
          </h2>
          <div className="space-y-2">
            {MODULES.map((m) => (
              <button
                key={m.slug}
                onClick={() => navigate(`/lesson/${m.slug}`)}
                className={`${card} ${
                  isDark ? "hover:border-slate-700" : "hover:border-slate-300"
                } w-full p-4 flex items-center gap-3 text-left transition`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  isDark ? "bg-slate-800" : "bg-slate-100"
                }`}>
                  <svg className={`w-4 h-4 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className={`text-sm font-medium flex-1 ${textPrimary}`}>{m.title}</p>
                <svg className={`w-4 h-4 shrink-0 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Weekly habit bar chart */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${card} p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-sm font-semibold uppercase tracking-wider ${textMuted}`}>
                Recent habit completion
              </h2>
            </div>
            <div className="flex items-end justify-between gap-2 h-24">
              {history.slice(0, 7).reverse().map((day, i) => {
                const done = (day.doneKeys || []).length;
                const total = (day.planKeys || []).length || 5;
                const pct = total === 0 ? 0 : (done / total) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className={`w-full rounded-t-md ${
                      pct >= 80 ? isDark ? "bg-emerald-400" : "bg-emerald-500"
                      : pct >= 40 ? isDark ? "bg-amber-400" : "bg-amber-500"
                      : isDark ? "bg-red-400" : "bg-red-500"
                    }`} style={{ height: `${Math.max(8, pct)}%` }} />
                    <span className={`text-[9px] ${textMuted}`}>
                      {day.date.split("-")[2]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}