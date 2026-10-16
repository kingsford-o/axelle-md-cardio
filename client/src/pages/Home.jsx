import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import {
  loadProfile,
  loadPlan,
  savePlan,
  loadToday,
  toggleHabitDone,
  appendToHistory,
  computeStreak,
  loadHistory,
} from "../lib/dailyLog.js";
import {
  HABITS,
  generatePlan,
  adaptPlan,
  planProgress,
  focusFromProfile,
} from "../lib/planEngine.js";
import {
  scoreFromHistory,
  dayDelta,
  scoreTone,
  scoreLabel,
  patternWarnings,
  weeklyStats,
} from "../lib/scoreEngine.js";

const EMERGENCY_NUMBER = "112";

const MYTHS = [
  { statement: "Heart disease only affects older people.", verdict: "MYTH", explanation: "Risk factors like high blood pressure can begin in your 20s and 30s. Early awareness matters at every age." },
  { statement: "You would know if you had high blood pressure.", verdict: "MYTH", explanation: "High blood pressure is often silent. Most people with it feel completely normal." },
  { statement: "Chest pain is the only sign of a heart attack.", verdict: "MYTH", explanation: "Heart attacks can present with jaw, arm, or back pain, shortness of breath, or nausea — especially in women." },
];

function toneClasses(tone, isDark) {
  const map = {
    emerald: isDark
      ? { text: "text-emerald-400", ring: "stroke-emerald-400", bar: "bg-emerald-400", chip: "bg-emerald-950/60 text-emerald-400" }
      : { text: "text-emerald-600", ring: "stroke-emerald-500", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700" },
    amber: isDark
      ? { text: "text-amber-400", ring: "stroke-amber-400", bar: "bg-amber-400", chip: "bg-amber-950/60 text-amber-400" }
      : { text: "text-amber-600", ring: "stroke-amber-500", bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700" },
    orange: isDark
      ? { text: "text-orange-400", ring: "stroke-orange-400", bar: "bg-orange-400", chip: "bg-orange-950/60 text-orange-400" }
      : { text: "text-orange-600", ring: "stroke-orange-500", bar: "bg-orange-500", chip: "bg-orange-50 text-orange-700" },
    red: isDark
      ? { text: "text-red-400", ring: "stroke-red-400", bar: "bg-red-400", chip: "bg-red-950/60 text-red-400" }
      : { text: "text-red-600", ring: "stroke-red-500", bar: "bg-red-500", chip: "bg-red-50 text-red-700" },
  };
  return map[tone] || map.emerald;
}

export default function Home({ onLogout }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [today, setToday] = useState(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreTrail, setScoreTrail] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [showWhy, setShowWhy] = useState(false);

  const refresh = () => {
    const history = loadHistory();
    const { score: rawScore, trail } = scoreFromHistory(history);
    const initial = parseFloat(localStorage.getItem("axelle_initial_score") || "50");

    let finalScore;
    let finalTrail;

    if (history.length === 0) {
      finalScore = initial;
      finalTrail = [];
    } else {
      // Blend: onboarding sets the floor, daily deltas move it from there.
      finalScore = Math.min(100, Math.max(0, initial + rawScore));
      finalTrail = trail.slice(-7);
    }

    setScore(Number(finalScore.toFixed(2)));
    setScoreTrail(finalTrail);
    setWarnings(patternWarnings(history));
    setWeekly(weeklyStats(history));
  };

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);

    let storedPlan = loadPlan();
    if (!storedPlan) {
      const base = generatePlan(p);
      const todayData = loadToday();
      const adapted = adaptPlan(base, todayData);
      storedPlan = savePlan(adapted);
    }
    setPlan(storedPlan);
    setToday(loadToday());
    setStreak(computeStreak());
    refresh();
  }, []);

  const progress = useMemo(() => {
    if (!plan || !today) return { completed: 0, total: 0, percent: 0, allDone: false };
    return planProgress(plan.keys, today.doneKeys);
  }, [plan, today]);

  const focus = useMemo(() => focusFromProfile(profile), [profile]);

  const mythIndex = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    return dayOfYear % MYTHS.length;
  }, []);

  const todayDelta = useMemo(() => {
    if (!plan || !today) return 0;
    return dayDelta({
      doneKeys: today.doneKeys || [],
      planKeys: plan.keys || [],
      log: today,
    });
  }, [plan, today]);

  const handleToggleHabit = (key) => {
    const next = toggleHabitDone(key);
    setToday(next);
    appendToHistory({ ...next, savedAt: new Date().toISOString() });
    setStreak(computeStreak());
    refresh();
  };

  const firstName = (profile?.fullName || profile?.full_name || "").split(" ")[0];
  const currentMyth = MYTHS[mythIndex];
  const tone = toneClasses(scoreTone(score), isDark);

  const card = `rounded-3xl border transition-colors ${
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const hoverBorder = isDark ? "hover:border-slate-700" : "hover:border-slate-300";

  const RING_R = 70;
  const RING_C = 2 * Math.PI * RING_R;
  const ringDash = (Math.min(100, Math.max(0, score)) / 100) * RING_C;

  return (
    <div className={`min-h-dvh ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-6"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <motion.svg
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className={`w-5 h-5 ${isDark ? "text-rose-400" : "text-rose-500"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </motion.svg>
            </div>
            <div className="min-w-0">
              <h1 className={`text-sm font-semibold truncate ${textPrimary}`}>Axelle MD Cardio</h1>
              <p className={`text-xs ${textMuted}`}>{firstName ? `Welcome, ${firstName}` : "Your daily plan"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              {isDark ? "☀" : "☾"}
            </button>
            <button
              onClick={onLogout}
              className={`h-10 px-4 rounded-2xl text-xs font-medium border ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign out
            </button>
          </div>
        </motion.header>

        {/* Disclaimer */}
        <div className={`mb-5 px-4 py-2.5 rounded-2xl border text-[11px] leading-relaxed ${
          isDark ? "bg-slate-900/50 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"
        }`}>
          This app teaches awareness. It does not diagnose. For concerns, see a health worker.
        </div>

        {/* === HEART SCORE — CENTERED === */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${card} p-8 sm:p-10 mb-5 flex flex-col items-center text-center`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-6 ${textMuted}`}>
            Heart Score
          </p>

          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 180 180" className="-rotate-90">
              <circle
                cx="90" cy="90" r={RING_R}
                className={isDark ? "stroke-slate-800" : "stroke-slate-100"}
                strokeWidth="11" fill="none"
              />
              <motion.circle
                cx="90" cy="90" r={RING_R}
                className={tone.ring}
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
                initial={{ strokeDasharray: `0 ${RING_C}` }}
                animate={{ strokeDasharray: `${ringDash} ${RING_C}` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-semibold tracking-tight leading-none ${textPrimary}`}>
                {score.toFixed(1)}
              </span>
              <span className={`text-sm mt-1 ${textMuted}`}>percent</span>
              <span className={`text-xs font-medium mt-3 ${tone.text}`}>
                {scoreLabel(score)}
              </span>
            </div>
          </div>

          <div className={`mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            todayDelta > 0 ? tone.chip
            : todayDelta < 0 ? (isDark ? "bg-red-950/60 text-red-400" : "bg-red-50 text-red-700")
            : (isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600")
          }`}>
            {todayDelta > 0 ? `↑ +${todayDelta.toFixed(1)}% today`
             : todayDelta < 0 ? `↓ ${todayDelta.toFixed(1)}% today`
             : "No change yet today"}
          </div>

          <button
            onClick={() => setShowWhy(!showWhy)}
            className={`text-xs mt-4 underline ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
          >
            {showWhy ? "Hide breakdown" : "How is this calculated?"}
          </button>

          <AnimatePresence>
            {showWhy && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden w-full max-w-sm"
              >
                <div className={`mt-4 pt-4 border-t text-xs space-y-2 text-left ${
                  isDark ? "border-slate-800" : "border-slate-100"
                }`}>
                  <div className="flex justify-between">
                    <span className={textMuted}>Survey baseline</span>
                    <span className={textPrimary}>
                      {parseFloat(localStorage.getItem("axelle_initial_score") || "0").toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textMuted}>Habits checked ({progress.completed})</span>
                    <span className="text-emerald-500">+{(progress.completed * 1.4).toFixed(1)}%</span>
                  </div>
                  {progress.allDone && (
                    <div className="flex justify-between">
                      <span className={textMuted}>Full completion bonus</span>
                      <span className="text-emerald-500">+3.5%</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t"
                    style={{ borderColor: isDark ? "#1e293b" : "#f1f5f9" }}>
                    <span className={textMuted}>Today's net impact</span>
                    <span className={todayDelta >= 0 ? "text-emerald-500" : "text-red-500"}>
                      {todayDelta >= 0 ? "+" : ""}{todayDelta.toFixed(1)}%
                    </span>
                  </div>
                  <p className={`pt-2 text-[10px] leading-relaxed ${textMuted}`}>
                    Score accumulates forever. Good habits push it up, riskier choices pull it down.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {scoreTrail.length > 1 && (
            <div className="mt-6 w-full max-w-sm pt-5 border-t"
              style={{ borderColor: isDark ? "#1e293b" : "#f1f5f9" }}>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
                Last 7 days
              </p>
              <div className="flex items-end justify-between gap-2 h-12">
                {scoreTrail.map((d, i) => {
                  const h = Math.max(10, (d.score / 100) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05 }}
                        className={`w-full rounded-sm ${tone.bar}`}
                        style={{ opacity: 0.35 + (i / scoreTrail.length) * 0.65 }}
                      />
                      <span className={`text-[8px] ${textMuted}`}>{d.date.split("-")[2]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* === WARNING BANNER === */}
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 mb-5"
          >
            {warnings.map((w, i) => (
              <div key={i} className={`p-4 rounded-2xl border flex items-start gap-3 ${
                w.level === "warn"
                  ? isDark ? "bg-amber-950/30 border-amber-900/60" : "bg-amber-50 border-amber-200"
                  : isDark ? "bg-emerald-950/30 border-emerald-900/60" : "bg-emerald-50 border-emerald-200"
              }`}>
                <span className={`text-base leading-none mt-0.5 ${
                  w.level === "warn" ? "text-amber-500" : "text-emerald-500"
                }`}>
                  {w.level === "warn" ? "⚠" : "✓"}
                </span>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {w.text}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* === BENTO GRID === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">

          {/* Today's plan */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${card} p-6 sm:col-span-2 lg:col-span-7 lg:row-span-2 flex flex-col`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${textMuted}`}>
                  Today's plan
                </p>
                <h2 className={`text-2xl font-semibold tracking-tight ${textPrimary}`}>
                  {progress.allDone ? "All done 🎉" : `${progress.completed} of ${progress.total}`}
                </h2>
                {streak > 1 && (
                  <p className={`text-xs mt-1 ${textMuted}`}>🔥 {streak}-day streak</p>
                )}
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
                progress.allDone ? tone.chip : isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}>
                {progress.percent}%
              </div>
            </div>

            <div className={`w-full h-1.5 rounded-full overflow-hidden mb-5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
              <motion.div
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.4 }}
                className={`h-full ${isDark ? "bg-emerald-400" : "bg-emerald-500"}`}
              />
            </div>

            <div className="space-y-2 flex-1">
              {plan?.keys?.map((key) => {
                const habit = HABITS[key];
                if (!habit) return null;
                const done = today?.doneKeys?.includes(key);
                return (
                  <motion.button
                    key={key}
                    onClick={() => handleToggleHabit(key)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-3.5 rounded-2xl flex items-center gap-3 text-left transition border ${
                      done
                        ? isDark ? "bg-emerald-950/30 border-emerald-900/60" : "bg-emerald-50 border-emerald-200"
                        : isDark ? "bg-slate-950/50 border-slate-800 hover:border-slate-700" : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                      done
                        ? isDark ? "bg-emerald-400 border-emerald-400" : "bg-emerald-500 border-emerald-500"
                        : isDark ? "border-slate-700" : "border-slate-300"
                    }`}>
                      <AnimatePresence>
                        {done && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        done
                          ? isDark ? "text-emerald-300 line-through" : "text-emerald-800 line-through"
                          : textPrimary
                      }`}>
                        {habit.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        done
                          ? isDark ? "text-emerald-400/60" : "text-emerald-700/60"
                          : textMuted
                      }`}>
                        {habit.hint}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/daily-log")}
              className={`w-full mt-4 py-3 rounded-2xl text-sm font-medium transition border ${
                isDark
                  ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              Log what I ate today →
            </button>
          </motion.div>

          {/* Emergency */}
          <motion.a
            href={`tel:${EMERGENCY_NUMBER}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={`block p-5 rounded-3xl border transition-colors sm:col-span-1 lg:col-span-5 ${
              isDark
                ? "bg-red-950/30 border-red-900/60 hover:bg-red-950/50"
                : "bg-red-50 border-red-200 hover:bg-red-100"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${
                  isDark ? "text-red-400" : "text-red-700"
                }`}>
                  In an emergency
                </p>
                <p className={`text-sm font-medium ${textPrimary}`}>Call {EMERGENCY_NUMBER}</p>
                <p className={`text-xs mt-0.5 ${isDark ? "text-red-400/70" : "text-red-700/70"}`}>
                  Chest pain · Face drooping · Trouble speaking
                </p>
              </div>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isDark ? "bg-red-900/50" : "bg-red-600"
              }`}>
                <svg className={`w-5 h-5 ${isDark ? "text-red-300" : "text-white"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </motion.a>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${card} p-5 flex flex-col justify-between min-h-[110px] sm:col-span-1 lg:col-span-2`}
          >
            <p className={`text-[11px] font-medium uppercase tracking-wider ${textMuted}`}>Streak</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-semibold leading-none ${textPrimary}`}>{streak}</span>
                <span className={`text-xs ${textMuted}`}>day{streak !== 1 ? "s" : ""}</span>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isDark ? "bg-amber-950/50" : "bg-amber-50"
              }`}>
                <svg className={`w-3.5 h-3.5 ${isDark ? "text-amber-400" : "text-amber-600"}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Your focus */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${card} p-5 sm:col-span-1 lg:col-span-3`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                Your focus
              </p>
              <button
                onClick={() => navigate("/survey")}
                className={`text-[10px] font-medium ${textMuted} hover:underline`}
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {focus.slice(0, 2).map((f) => (
                <span
                  key={f.key}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    isDark ? "bg-amber-950/50 text-amber-400" : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {f.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Weekly insights */}
          {weekly && weekly.logged > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`${card} p-5 sm:col-span-2 lg:col-span-12`}
            >
              <div className="flex items-center justify-between mb-4">
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                  This week
                </p>
                <span className={`text-[10px] ${textMuted}`}>{weekly.logged} of 7 days logged</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: "Fried", value: weekly.foodFlags.fried, tone: "red" },
                  { label: "Salty", value: weekly.foodFlags.salty, tone: "amber" },
                  { label: "Sugary", value: weekly.foodFlags.sugary, tone: "red" },
                  { label: "Veg", value: weekly.foodFlags.veg, tone: "emerald" },
                  { label: "Fruit", value: weekly.foodFlags.fruit, tone: "emerald" },
                  { label: "Active", value: weekly.activeDays, tone: "emerald" },
                ].map((stat) => {
                  const t = toneClasses(stat.tone, isDark);
                  return (
                    <div key={stat.label} className="text-center">
                      <p className={`text-2xl font-semibold ${t.text}`}>{stat.value}</p>
                      <p className={`text-[10px] mt-1 ${textMuted}`}>{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Myth of the day */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`${card} p-6 sm:col-span-2 lg:col-span-7 flex flex-col`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                Myth of the day
              </p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isDark ? "bg-red-950/60 text-red-400" : "bg-red-50 text-red-700"
              }`}>
                {currentMyth.verdict}
              </span>
            </div>
            <p className={`text-base font-medium leading-snug mb-3 ${textPrimary}`}>
              "{currentMyth.statement}"
            </p>
            <p className={`text-xs leading-relaxed flex-1 ${textMuted}`}>
              {currentMyth.explanation}
            </p>
            <button
              onClick={() => navigate("/myths")}
              className={`text-xs font-medium mt-4 self-start ${
                isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              See all myths →
            </button>
          </motion.div>

          {/* Heart rate */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate("/heart-rate")}
            className={`${card} ${hoverBorder} text-left p-5 sm:col-span-1 lg:col-span-2 min-h-[130px] flex flex-col justify-between`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isDark ? "bg-rose-950/50" : "bg-rose-50"
            }`}>
              <svg className={`w-4 h-4 ${isDark ? "text-rose-400" : "text-rose-500"}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="mt-4">
              <p className={`text-sm font-medium ${textPrimary}`}>Heart rate</p>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Log a reading</p>
            </div>
          </motion.button>

          {/* Review */}
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            onClick={() => navigate("/review")}
            className={`${card} ${hoverBorder} text-left p-5 sm:col-span-1 lg:col-span-3 min-h-[130px] flex flex-col justify-between`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isDark ? "bg-emerald-950/50" : "bg-emerald-50"
            }`}>
              <svg className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="mt-4">
              <p className={`text-sm font-medium ${textPrimary}`}>Weak-spot review</p>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Revisit your lowest lesson</p>
            </div>
          </motion.button>

        </div>

        <p className={`text-[10px] text-center mt-8 leading-relaxed ${
          isDark ? "text-slate-600" : "text-slate-400"
        }`}>
          Content sourced from WHO, American Heart Association, National Ambulance Service Ghana.
          <br />Not a substitute for medical advice.
        </p>

      </div>
    </div>
  );
}