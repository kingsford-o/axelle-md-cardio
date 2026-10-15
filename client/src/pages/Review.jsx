import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Review() {
  const navigate = useNavigate();

  const stats = [
    { label: "Lessons Completed", value: "1/3", color: "brand" },
    { label: "Quizzes Passed", value: "0/3", color: "pink" },
    { label: "Myths Read", value: "6/6", color: "ok" },
    { label: "Days Active", value: "1", color: "brand" },
  ];

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first lesson", unlocked: true },
    { id: 2, title: "Quiz Master", description: "Score 100% on a quiz", unlocked: false },
    { id: 3, title: "Myth Buster", description: "Read all myths", unlocked: true },
    { id: 4, title: "Week Warrior", description: "Active for 7 days", unlocked: false },
  ];

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
          <h1 className="text-xl font-bold text-white">Your Progress</h1>
          <p className="text-muted text-sm">Track your heart health journey</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-6">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}/20 to-${stat.color}/5 border border-${stat.color}/30 rounded-2xl p-4`}
            >
              <p className="text-muted text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-navy/50 border border-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Overall Progress</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#2A2A45"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#1447FF"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="440"
                  strokeDashoffset="308"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-extrabold text-white">30%</span>
              </div>
            </div>
          </div>
          <p className="text-center text-muted mt-4">Keep going! You're making great progress.</p>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-white mb-4">Achievements</h2>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`bg-navy/50 border rounded-xl p-4 flex items-center gap-4 ${
                  achievement.unlocked ? "border-ok/30" : "border-border opacity-50"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlocked ? "bg-ok/20" : "bg-navy"
                }`}>
                  {achievement.unlocked ? (
                    <svg className="w-6 h-6 text-ok" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${achievement.unlocked ? "text-white" : "text-muted"}`}>
                    {achievement.title}
                  </p>
                  <p className="text-muted text-sm">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <svg className="w-5 h-5 text-ok" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-navy/50 border border-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Weekly Activity</h2>
          <div className="flex justify-between items-end h-24">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 rounded-t-lg ${
                    index === 0 ? "bg-brand h-16" : "bg-navy h-4"
                  }`}
                />
                <span className="text-muted text-xs">{day}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}