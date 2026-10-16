import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-navy flex flex-col">

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Animated Heart */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
          <svg className="w-32 h-32 text-pink" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </motion.div>

        {/* BPM Display */}
        <div className="text-center mb-8">
          <p className="text-5xl font-extrabold text-white mb-2">72 BPM</p>
          <p className="text-ok font-semibold text-lg">NORMAL</p>
        </div>

        {/* Card */}
        <div className="w-full bg-cream rounded-2xl p-6 shadow-lg">
          <h2 className="text-navy text-xl font-bold mb-2">CLINICAL TELEMETRY</h2>
          <p className="text-navy/80 text-sm mb-1">Know your heart.</p>
          <p className="text-muted text-xs mb-6 leading-relaxed">
            Personalized cardiovascular insights and daily rhythm understanding without the jargon.
          </p>
          <button
            onClick={() => navigate("/start")}
            className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors"
          >
            Get started
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex justify-between items-center text-white/60 text-xs">
        <span>Encrypted on device</span>
        <span>100% Free</span>
      </div>
    </div>
  );
}