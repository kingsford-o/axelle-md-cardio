import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/survey");
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

      {/* Notification Bar */}
      <div className="bg-brand/20 border-y border-brand/30 px-6 py-3">
        <p className="text-brand text-xs font-medium">
          Active Telemetry Stage: 1.1 Personal Information
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <h1 className="text-3xl font-extrabold text-white mb-4">Welcome to Know Your Heart</h1>
          <p className="text-muted text-lg mb-8 leading-relaxed">
            Let's personalize your experience by learning a bit about you.
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-navy/50 border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Quick Setup</p>
                <p className="text-muted text-sm">Only takes 2 minutes</p>
              </div>
            </div>

            <div className="bg-navy/50 border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-pink/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Private & Secure</p>
                <p className="text-muted text-sm">Your data stays on device</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors"
          >
            Let's Get Started
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-white/60 text-xs">
        <span>Step 1 of 3</span>
      </div>
    </div>
  );
}