import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const lessons = [
    { id: 1, title: "Understanding Your Heart Rate", duration: "5 min", completed: true },
    { id: 2, title: "Blood Pressure Basics", duration: "7 min", completed: false },
    { id: 3, title: "Stress & Cardiovascular Health", duration: "6 min", completed: false },
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
      <div className="px-6 py-4">
        <h1 className="text-2xl font-extrabold text-white">Good Morning</h1>
        <p className="text-muted">Here's your heart health overview</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-6">
        {/* Heart Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/heartrate")}
          className="bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-6 cursor-pointer hover:border-brand transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted text-sm">Current Heart Rate</p>
              <p className="text-4xl font-extrabold text-white">72 BPM</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-16 h-16 text-pink" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-ok/20 text-ok px-3 py-1 rounded-full text-sm font-semibold">Normal</span>
            <span className="text-muted text-sm">Resting rate</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-navy/50 border border-border rounded-2xl p-4"
          >
            <p className="text-muted text-sm mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-white">75 BPM</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/challenges")}
            className="bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-4 cursor-pointer hover:border-brand transition-colors"
          >
            <p className="text-muted text-sm mb-1">Points Earned</p>
            <p className="text-2xl font-bold text-white">150</p>
          </motion.div>
        </div>

        {/* Lessons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Today's Lessons</h2>
            <button onClick={() => navigate("/challenges")} className="text-brand text-sm font-semibold">View Challenges</button>
          </div>
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <motion.button
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
                className="w-full bg-navy/50 border border-border rounded-xl p-4 flex items-center gap-4 hover:border-brand transition-colors"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  lesson.completed ? "bg-ok/20" : "bg-brand/20"
                }`}>
                  {lesson.completed ? (
                    <svg className="w-6 h-6 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold">{lesson.title}</p>
                  <p className="text-muted text-sm">{lesson.duration}</p>
                </div>
                <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => navigate("/breathing")}
            className="bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-4 text-left hover:border-brand transition-colors"
          >
            <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-white font-semibold">Breathing</p>
            <p className="text-muted text-sm">Calm your mind</p>
          </button>
          <button
            onClick={() => navigate("/assistant")}
            className="bg-gradient-to-br from-pink/20 to-pink/5 border border-pink/30 rounded-2xl p-4 text-left hover:border-pink transition-colors"
          >
            <div className="w-10 h-10 bg-pink/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-white font-semibold">AI Assistant</p>
            <p className="text-muted text-sm">Ask questions</p>
          </button>
          <button
            onClick={() => navigate("/journal")}
            className="bg-gradient-to-br from-ok/20 to-ok/5 border border-ok/30 rounded-2xl p-4 text-left hover:border-ok transition-colors"
          >
            <div className="w-10 h-10 bg-ok/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-white font-semibold">Journal</p>
            <p className="text-muted text-sm">Track wellness</p>
          </button>
          <button
            onClick={() => navigate("/challenges")}
            className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl p-4 text-left hover:border-purple-500 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className="text-white font-semibold">Challenges</p>
            <p className="text-muted text-sm">Earn points</p>
          </button>
        </motion.div>
      </div>
    </div>
  );
}