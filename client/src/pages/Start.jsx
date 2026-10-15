import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Start() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/survey");
  };

  return (
    <div className="min-h-dvh bg-navy flex flex-col">
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