import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";

const STORAGE_KEY = "axelle_hr_readings";
const MAX_READINGS = 100;

// Contexts a reading can be taken in — affect interpretation.
const CONTEXTS = [
  { key: "resting", label: "At rest", note: "Sitting or lying down, relaxed" },
  { key: "after-walking", label: "After walking", note: "Within 10 minutes of walking" },
  { key: "after-exercise", label: "After exercise", note: "Within 30 minutes of exertion" },
  { key: "stressed", label: "Feeling stressed", note: "Anxious, worried, or upset" },
  { key: "unwell", label: "Feeling unwell", note: "Sick, feverish, or in pain" },
];

function getZone(bpm, context) {
  // Ranges shift based on context — after exercise, higher is normal.
  const isResting = context === "resting";
  if (isResting) {
    if (bpm < 60) return { key: "low", label: "Below 60", tone: "amber", note: "Low — sometimes normal for athletes, sometimes a sign to check." };
    if (bpm <= 100) return { key: "normal", label: "60–100", tone: "emerald", note: "Typical adult resting range." };
    if (bpm <= 120) return { key: "elevated", label: "101–120", tone: "amber", note: "Above typical resting. Monitor and recheck." };
    return { key: "high", label: "Above 120", tone: "red", note: "Persistently high at rest is worth a doctor's visit." };
  }
  // Non-resting readings: higher is expected
  if (bpm <= 100) return { key: "low", label: "Within 100", tone: "emerald", note: "Within typical range." };
  if (bpm <= 140) return { key: "elevated", label: "101–140", tone: "amber", note: "Expected after activity. Should fall with rest." };
  return { key: "high", label: "Above 140", tone: "red", note: "Very high. Rest for 5 minutes and re-check. Seek advice if it stays high." };
}

function toneClasses(tone, isDark) {
  const map = {
    emerald: isDark
      ? { bg: "bg-emerald-950/50", text: "text-emerald-400", bar: "bg-emerald-400" }
      : { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
    amber: isDark
      ? { bg: "bg-amber-950/50", text: "text-amber-400", bar: "bg-amber-400" }
      : { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
    red: isDark
      ? { bg: "bg-red-950/50", text: "text-red-400", bar: "bg-red-400" }
      : { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
  };
  return map[tone] || map.emerald;
}

function loadReadings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReadings(readings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings.slice(0, MAX_READINGS)));
  } catch (e) {
    console.warn("Could not save reading:", e);
  }
}

export default function HeartRate() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [readings, setReadings] = useState([]);
  const [bpm, setBpm] = useState("");
  const [context, setContext] = useState("resting");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setReadings(loadReadings());
  }, []);

  const latest = readings[0];
  const recent = readings.slice(1, 8);

  // Averages: resting only, last 7 readings
  const restingAvg = useMemo(() => {
    const resting = readings.filter((r) => r.context === "resting").slice(0, 7);
    if (resting.length === 0) return null;
    const sum = resting.reduce((s, r) => s + r.bpm, 0);
    return Math.round(sum / resting.length);
  }, [readings]);

  const handleSave = (e) => {
    e.preventDefault();
    setError("");

    const value = parseInt(bpm, 10);
    if (!value || value < 25 || value > 250) {
      setError("Enter a heart rate between 25 and 250 BPM.");
      return;
    }

    const entry = {
      id: Date.now().toString(),
      bpm: value,
      context,
      note: note.trim().slice(0, 200),
      createdAt: new Date().toISOString(),
    };

    const next = [entry, ...readings].slice(0, MAX_READINGS);
    setReadings(next);
    saveReadings(next);

    setBpm("");
    setNote("");
    setContext("resting");
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleDelete = (id) => {
    const next = readings.filter((r) => r.id !== id);
    setReadings(next);
    saveReadings(next);
    setConfirmDelete(null);
  };

  const card = `rounded-3xl border transition-colors ${
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const inputClass = `w-full px-4 py-3 rounded-2xl text-sm outline-none border transition ${
    isDark
      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-slate-600"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400"
  }`;

  const latestZone = latest ? getZone(latest.bpm, latest.context) : null;

  return (
    <div className={`min-h-dvh ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">

        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className={`text-2xl font-semibold tracking-tight ${textPrimary}`}>
              Heart rate record
            </h1>
            <p className={`text-xs mt-1 ${textMuted}`}>
              Your own measurements, kept for reference
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

        {/* Serious disclaimer — visible always */}
        <div className={`mb-5 px-4 py-3 rounded-2xl border text-[11px] leading-relaxed ${
          isDark
            ? "bg-amber-950/20 border-amber-900/40 text-amber-200/80"
            : "bg-amber-50 border-amber-200 text-amber-800"
        }`}>
          <strong className="font-semibold">This is self-reported, not measured.</strong> Axelle MD
          Cardio does not read your pulse. Only log what you have measured yourself — with a
          monitor, watch, or by counting your pulse. One number is not a diagnosis. Patterns over
          time are what matter.
        </div>

        {/* Latest reading */}
        {latest && latestZone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${card} p-6 mb-5`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                Latest reading
              </p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                toneClasses(latestZone.tone, isDark).bg
              } ${toneClasses(latestZone.tone, isDark).text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${toneClasses(latestZone.tone, isDark).bar}`} />
                {latestZone.label} BPM
              </span>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-semibold tracking-tight ${textPrimary}`}>
                    {latest.bpm}
                  </span>
                  <span className={`text-base ${textMuted}`}>BPM</span>
                </div>
                <p className={`text-xs mt-2 ${textMuted}`}>
                  {CONTEXTS.find((c) => c.key === latest.context)?.label || "At rest"} ·{" "}
                  {new Date(latest.createdAt).toLocaleString()}
                </p>
                {latest.note && (
                  <p className={`text-xs mt-2 italic ${textMuted}`}>"{latest.note}"</p>
                )}
              </div>
              <motion.svg
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className={`w-14 h-14 shrink-0 ${isDark ? "text-rose-400" : "text-rose-500"}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </motion.svg>
            </div>

            <p className={`text-xs mt-4 pt-4 border-t leading-relaxed ${
              isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
            }`}>
              {latestZone.note}
            </p>
          </motion.div>
        )}

        {/* How to measure */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`${card} p-6 mb-5`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            How to measure properly
          </p>
          <ul className={`text-xs space-y-2 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <li className="flex gap-2">
              <span className="text-rose-500 shrink-0">1.</span>
              <span>Sit quietly for <strong>5 minutes</strong> before taking the reading.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-rose-500 shrink-0">2.</span>
              <span>Place the monitor or your fingers in the same position each time.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-rose-500 shrink-0">3.</span>
              <span>Take <strong>two readings</strong> a minute apart. Use the average.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-rose-500 shrink-0">4.</span>
              <span>Log the <strong>context</strong> — resting, after walking, or unwell.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-rose-500 shrink-0">5.</span>
              <span>Measure at <strong>the same time each day</strong> for meaningful patterns.</span>
            </li>
          </ul>
        </motion.div>

        {/* Record new reading */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSave}
          className={`${card} p-6 mb-5`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-4 ${textMuted}`}>
            Record a new reading
          </p>

          <div className="mb-4">
            <label className={`block text-xs font-medium mb-1.5 ${textPrimary}`}>
              Heart rate (BPM)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="e.g. 72"
              min={25}
              max={250}
              className={inputClass}
              required
            />
          </div>

          <div className="mb-4">
            <label className={`block text-xs font-medium mb-2 ${textPrimary}`}>
              When did you take it?
            </label>
            <div className="space-y-2">
              {CONTEXTS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setContext(c.key)}
                  className={`w-full p-3 rounded-2xl text-left transition border ${
                    context === c.key
                      ? isDark
                        ? "bg-white text-slate-900 border-white"
                        : "bg-slate-900 text-white border-slate-900"
                      : isDark
                        ? "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-medium">{c.label}</p>
                  <p className={`text-[11px] mt-0.5 ${
                    context === c.key
                      ? isDark ? "text-slate-600" : "text-slate-300"
                      : textMuted
                  }`}>
                    {c.note}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-xs font-medium mb-1.5 ${textPrimary}`}>
              Note <span className={textMuted}>(optional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. before breakfast, after climbing stairs"
              maxLength={200}
              className={inputClass}
            />
          </div>

          {error && (
            <div className={`mb-3 px-3 py-2 rounded-xl text-xs border ${
              isDark
                ? "bg-red-950/50 border-red-900 text-red-400"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-2xl text-sm font-medium transition-colors ${
              isDark
                ? "bg-white text-slate-900 hover:bg-slate-100"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Save reading
          </button>

          <AnimatePresence>
            {justSaved && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs mt-3 text-center ${
                  isDark ? "text-emerald-400" : "text-emerald-600"
                }`}
              >
                ✓ Reading saved
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Resting average summary */}
        {restingAvg && readings.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`${card} p-5 mb-5 flex items-center justify-between`}
          >
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                Resting average
              </p>
              <p className={`text-xs mt-1 ${textMuted}`}>
                From your last {Math.min(7, readings.filter((r) => r.context === "resting").length)} resting readings
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-semibold ${textPrimary}`}>{restingAvg}</span>
              <span className={`text-xs ${textMuted}`}>BPM</span>
            </div>
          </motion.div>
        )}

        {/* Recent readings */}
        {recent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${card} p-6 mb-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${textMuted}`}>
                Recent readings
              </p>
              <span className={`text-xs ${textMuted}`}>{readings.length} total</span>
            </div>
            <div className="space-y-2">
              {recent.map((r) => {
                const zone = getZone(r.bpm, r.context);
                const tones = toneClasses(zone.tone, isDark);
                const ctxLabel = CONTEXTS.find((c) => c.key === r.context)?.label || "At rest";
                return (
                  <div
                    key={r.id}
                    className={`p-3 rounded-2xl flex items-center gap-3 border ${
                      isDark
                        ? "bg-slate-950/50 border-slate-800"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tones.bg}`}>
                      <span className={`text-xs font-semibold ${tones.text}`}>{r.bpm}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${textPrimary}`}>
                        {ctxLabel} · {zone.label}
                      </p>
                      <p className={`text-[11px] mt-0.5 truncate ${textMuted}`}>
                        {new Date(r.createdAt).toLocaleString()}
                        {r.note ? ` · ${r.note}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setConfirmDelete(r.id)}
                      className={`p-2 rounded-lg transition-colors shrink-0 ${
                        isDark
                          ? "text-slate-600 hover:text-red-400 hover:bg-red-950/30"
                          : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                      title="Delete reading"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {readings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`${card} p-8 text-center mb-5`}
          >
            <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
              isDark ? "bg-slate-800" : "bg-slate-100"
            }`}>
              <svg className={`w-5 h-5 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={`text-sm font-medium ${textPrimary}`}>No readings recorded yet</p>
            <p className={`text-xs mt-1 leading-relaxed ${textMuted}`}>
              When you measure your pulse, save it above. Over weeks, patterns will emerge.
            </p>
          </motion.div>
        )}

        {/* Reference ranges */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`${card} p-6`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-wider mb-3 ${textMuted}`}>
            Reference ranges (adults at rest)
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${toneClasses("amber", isDark).bar}`} />
              <div>
                <span className={`font-medium ${textPrimary}`}>Below 60 BPM</span>
                <span className={`${textMuted} ml-1.5`}>— common in athletes; occasionally a sign of an issue.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${toneClasses("emerald", isDark).bar}`} />
              <div>
                <span className={`font-medium ${textPrimary}`}>60–100 BPM</span>
                <span className={`${textMuted} ml-1.5`}>— typical resting range for adults.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${toneClasses("amber", isDark).bar}`} />
              <div>
                <span className={`font-medium ${textPrimary}`}>101–120 BPM</span>
                <span className={`${textMuted} ml-1.5`}>— could be stress, illness, or dehydration. Monitor.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${toneClasses("red", isDark).bar}`} />
              <div>
                <span className={`font-medium ${textPrimary}`}>Above 120 BPM</span>
                <span className={`${textMuted} ml-1.5`}>— if persistent at rest, seek medical advice.</span>
              </div>
            </div>
          </div>
          <p className={`text-[10px] mt-4 leading-relaxed ${textMuted}`}>
            Ranges are simplified for awareness. Ask a health worker what your readings mean for you.
          </p>
        </motion.div>

      </div>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`w-full max-w-sm rounded-2xl shadow-xl p-6 border ${
                isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <h3 className="text-sm font-semibold mb-2">Delete this reading?</h3>
              <p className={`text-xs mb-5 ${textMuted}`}>
                It will be permanently removed from your record.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className={`flex-1 py-2.5 text-xs font-medium rounded-lg border transition ${
                    isDark
                      ? "border-slate-800 text-slate-400 hover:text-white"
                      : "border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}