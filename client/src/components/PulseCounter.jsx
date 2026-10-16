import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../contexts/ThemeContext.jsx";

const COUNT_WINDOW = 10; // seconds — quick count, multiply by 6
const MULTIPLIER = 6;

export default function PulseCounter({ onComplete }) {
  const { isDark } = useTheme();
  const [phase, setPhase] = useState("idle"); // idle | counting | done
  const [count, setCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(COUNT_WINDOW);
  const [result, setResult] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (phase === "counting") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setPhase("done");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  useEffect(() => {
    if (phase === "done") {
      const bpm = count * MULTIPLIER;
      setResult(bpm);
      if (onComplete) onComplete(bpm);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    setPhase("counting");
    setCount(0);
    setTimeLeft(COUNT_WINDOW);
  };

  const tap = () => {
    if (phase === "counting") setCount((c) => c + 1);
  };

  const reset = () => {
    setPhase("idle");
    setCount(0);
    setTimeLeft(COUNT_WINDOW);
    setResult(null);
  };

  const card = `rounded-3xl border ${
    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
  }`;
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  const progress = ((COUNT_WINDOW - timeLeft) / COUNT_WINDOW) * 100;

  return (
    <div className={`${card} p-6`}>
      <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${textMuted}`}>
        Measure by hand
      </p>
      <p className={`text-xs mb-5 ${textMuted}`}>
        No monitor? Count your pulse for 10 seconds. We'll do the math.
      </p>

      {/* Idle — instructions */}
      {phase === "idle" && (
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border text-xs space-y-2 leading-relaxed ${
            isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-600"
          }`}>
            <p className="font-medium text-rose-500 mb-2">How to find your pulse:</p>
            <ol className="space-y-2 pl-1">
              <li><strong>1.</strong> Sit down. Rest your arm on a table, palm up.</li>
              <li><strong>2.</strong> Place <strong>two fingers</strong> (index + middle) on your wrist, below the thumb.</li>
              <li><strong>3.</strong> Press gently until you feel a steady beat.</li>
              <li><strong>4.</strong> You'll count for <strong>10 seconds</strong> — tap once per beat.</li>
            </ol>
          </div>

          <button
            onClick={start}
            className={`w-full py-3.5 rounded-2xl text-sm font-medium transition ${
              isDark
                ? "bg-white text-slate-900 hover:bg-slate-100"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Start 10-second count
          </button>
        </div>
      )}

      {/* Counting — tap on each beat */}
      {phase === "counting" && (
        <div className="space-y-5">
          {/* Timer bar */}
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease: "linear" }}
              className="h-full bg-rose-500"
            />
          </div>

          <div className="flex items-baseline justify-center gap-3">
            <span className={`text-5xl font-semibold tabular-nums ${textPrimary}`}>{count}</span>
            <span className={`text-sm ${textMuted}`}>beats</span>
          </div>

          <div className="text-center">
            <span className={`text-xs font-medium ${textMuted}`}>
              {timeLeft}s remaining
            </span>
          </div>

          {/* Big tap target */}
          <button
            onClick={tap}
            className="w-full py-8 rounded-2xl text-lg font-semibold transition active:scale-95 bg-rose-500 text-white hover:bg-rose-600"
          >
            TAP ON EACH BEAT
          </button>

          <button
            onClick={reset}
            className={`w-full py-2 text-xs font-medium ${textMuted} hover:underline`}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Done — show result */}
      {phase === "done" && result !== null && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`p-5 rounded-2xl text-center ${
              isDark ? "bg-slate-950" : "bg-slate-50"
            }`}>
              <p className={`text-[11px] uppercase tracking-wider mb-2 ${textMuted}`}>
                Your reading
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className={`text-5xl font-semibold ${textPrimary}`}>{result}</span>
                <span className={`text-base ${textMuted}`}>BPM</span>
              </div>
              <p className={`text-xs mt-3 ${textMuted}`}>
                {count} beats in 10 seconds × 6
              </p>
            </div>

            <p className={`text-xs leading-relaxed ${textMuted}`}>
              This has been filled into the form below. Add the context and save.
            </p>

            <button
              onClick={reset}
              className={`w-full py-3 rounded-2xl text-sm font-medium border transition ${
                isDark
                  ? "border-slate-800 text-slate-300 hover:border-slate-700"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              Measure again
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}