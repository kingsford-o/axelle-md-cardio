import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Breathing() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("inhale"); // inhale, hold, exhale
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [totalCycles, setTotalCycles] = useState(5);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;

        // Phase transitions
        if (phase === "inhale") {
          setPhase("hold");
          return 7;
        } else if (phase === "hold") {
          setPhase("exhale");
          return 8;
        } else if (phase === "exhale") {
          if (cycles + 1 >= totalCycles) {
            setIsActive(false);
            return 0;
          }
          setCycles((prev) => prev + 1);
          setPhase("inhale");
          return 4;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase, cycles, totalCycles]);

  const startExercise = () => {
    setIsActive(true);
    setPhase("inhale");
    setCount(4);
    setCycles(0);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase("inhale");
    setCount(4);
    setCycles(0);
  };

  const getScale = () => {
    if (phase === "inhale") return 1 + (4 - count) * 0.25;
    if (phase === "hold") return 2;
    if (phase === "exhale") return 2 - (8 - count) * 0.125;
    return 1;
  };

  const getPhaseText = () => {
    if (phase === "inhale") return "Breathe In";
    if (phase === "hold") return "Hold";
    if (phase === "exhale") return "Breathe Out";
    return "Ready";
  };

  const getPhaseColor = () => {
    if (phase === "inhale") return "text-brand";
    if (phase === "hold") => "text-pink";
    if (phase === "exhale") return "text-ok";
    return "text-muted";
  };

  return (
    <div className="min-h-dvh bg-navy flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 text-white text-sm">
        <span>09:41</span>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/home")} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Breathing Exercise</h1>
          <p className="text-muted text-sm">Calm your mind & heart</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className="space-y-4">
                <div className="bg-navy/50 border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-3">4-7-8 Breathing Technique</h2>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand/20 rounded-full flex items-center justify-center text-brand font-bold">4</div>
                      <p className="text-muted">Inhale through your nose</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-pink/20 rounded-full flex items-center justify-center text-pink font-bold">7</div>
                      <p className="text-muted">Hold your breath</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-ok/20 rounded-full flex items-center justify-center text-ok font-bold">8</div>
                      <p className="text-muted">Exhale through your mouth</p>
                    </div>
                  </div>
                </div>

                <div className="bg-navy/50 border border-border rounded-2xl p-4">
                  <label className="text-white font-semibold block mb-2">Number of Cycles</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTotalCycles(Math.max(1, totalCycles - 1))}
                      className="w-10 h-10 bg-brand rounded-lg text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-white w-12 text-center">{totalCycles}</span>
                    <button
                      onClick={() => setTotalCycles(Math.min(10, totalCycles + 1))}
                      className="w-10 h-10 bg-brand rounded-lg text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={startExercise}
                className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors"
              >
                Start Exercise
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center space-y-8"
            >
              {/* Breathing Circle */}
              <div className="relative w-64 h-64 mx-auto">
                <motion.div
                  animate={{ scale: getScale() }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border-4 border-brand/50"
                />
                <motion.div
                  animate={{ scale: getScale() * 0.7 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-8 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 border-2 border-brand/30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-6xl font-extrabold ${getPhaseColor()}`}>{count}</p>
                    <p className={`text-xl font-semibold ${getPhaseColor()} mt-2`}>{getPhaseText()}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <p className="text-muted">Cycle {cycles + 1} of {totalCycles}</p>
                <div className="w-full h-2 bg-navy/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((cycles + 1) / totalCycles) * 100}%` }}
                    className="h-full bg-brand"
                  />
                </div>
              </div>

              <button
                onClick={resetExercise}
                className="w-full bg-navy/50 border border-border text-white font-semibold py-4 rounded-xl hover:border-brand transition-colors"
              >
                Stop Exercise
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Screen */}
        <AnimatePresence>
          {!isActive && cycles > 0 && cycles >= totalCycles && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-navy/95 flex items-center justify-center px-6 z-50"
            >
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-ok/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-ok" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-white">Exercise Complete!</h2>
                <p className="text-muted text-lg">You completed {totalCycles} breathing cycles</p>
                <p className="text-muted">Your heart and mind are now calmer</p>
                <div className="space-y-3">
                  <button
                    onClick={startExercise}
                    className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors"
                  >
                    Do Another Session
                  </button>
                  <button
                    onClick={() => navigate("/home")}
                    className="w-full bg-navy/50 border border-border text-white font-semibold py-4 rounded-xl hover:border-brand transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
