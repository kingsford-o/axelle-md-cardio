import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Survey() {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const handleSubmit = () => {
    localStorage.setItem("kyh_onboarded", "1");
    localStorage.setItem("kyh_age", age);
    localStorage.setItem("kyh_gender", gender);
    localStorage.setItem("kyh_activity", activityLevel);
    navigate("/home");
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
          Active Telemetry Stage: 1.2 Health Profile
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-6"
        >
          <h1 className="text-3xl font-extrabold text-white mb-2">Health Profile</h1>
          <p className="text-muted text-lg mb-6">
            Help us personalize your heart health insights.
          </p>

          {/* Age Input */}
          <div className="space-y-2">
            <label className="text-white font-semibold">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full bg-navy/50 border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-brand"
            />
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <label className="text-white font-semibold">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  key={option}
                  onClick={() => setGender(option)}
                  className={`py-3 rounded-xl font-semibold transition-colors ${
                    gender === option
                      ? "bg-brand text-white"
                      : "bg-navy/50 border border-border text-muted hover:border-brand"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="text-white font-semibold">Activity Level</label>
            <div className="space-y-3">
              {[
                { value: "sedentary", label: "Sedentary (Little or no exercise)" },
                { value: "moderate", label: "Moderate (Exercise 1-3 times/week)" },
                { value: "active", label: "Active (Exercise 3-5 times/week)" },
                { value: "very-active", label: "Very Active (Exercise 6+ times/week)" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActivityLevel(option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-colors ${
                    activityLevel === option.value
                      ? "bg-brand text-white"
                      : "bg-navy/50 border border-border text-muted hover:border-brand"
                  }`}
                >
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!age || !gender || !activityLevel}
            className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Complete Setup
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-white/60 text-xs">
        <span>Step 2 of 3</span>
      </div>
    </div>
  );
}