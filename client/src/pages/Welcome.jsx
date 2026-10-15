import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

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

      {/* Notification Bar */}
      <div className="bg-brand/20 border-y border-brand/30 px-6 py-3">
        <p className="text-brand text-xs font-medium">
          Active Telemetry Stage: 1.0 Welcome & Tactile Ripple
        </p>
      </div>

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