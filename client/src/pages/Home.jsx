import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";
import { useState, useEffect } from "react";
import { account, databases, Query, COLLECTIONS, APPWRITE_DATABASE_ID } from "../lib/appwrite.js";

export default function Home({ onLogout }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [expandedSection, setExpandedSection] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await account.get();
        if (user) {
          try {
            const res = await databases.listDocuments(
              APPWRITE_DATABASE_ID,
              COLLECTIONS.PROFILES,
              [Query.equal("userId", user.$id)]
            );
            if (res.documents && res.documents.length > 0) {
              setProfile(res.documents[0]);
            } else {
              setProfile({ fullName: user.name || user.email?.split("@")[0], points: 150 });
            }
          } catch {
            setProfile({ fullName: user.name || user.email?.split("@")[0], points: 150 });
          }
        }
      } catch (e) {
        console.warn("Could not fetch profile:", e);
      }
    }
    fetchProfile();
  }, []);

  const lessons = [
    { id: 1, title: "Understanding Your Heart Rate", duration: "5 min", completed: true },
    { id: 2, title: "Blood Pressure Basics", duration: "7 min", completed: false },
    { id: 3, title: "Stress & Cardiovascular Health", duration: "6 min", completed: false },
  ];

  return (
    <div className={`min-h-dvh flex flex-col relative ${isDark ? 'bg-navy' : 'bg-cream'}`}>
      {/* Floating Theme Toggle */}
      <motion.button
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-12 h-12 bg-brand/20 border border-brand/30 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-brand/30 transition-colors"
      >
        {isDark ? (
          <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </motion.button>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-navy'}`}>
            Good Morning{profile?.fullName || profile?.full_name ? `, ${profile.fullName || profile.full_name}` : ""}
          </h1>
          <p className="text-muted">Here's your heart health overview</p>
        </div>
        <button
          onClick={onLogout}
          className="text-muted hover:text-white transition-colors text-sm"
        >
          Sign out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-6">
        {/* Heart Rate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/heartrate")}
          className={`bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-6 cursor-pointer hover:border-brand transition-colors ${isDark ? '' : 'bg-brand/10'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted text-sm">Current Heart Rate</p>
              <p className={`text-4xl font-extrabold ${isDark ? 'text-white' : 'text-navy'}`}>72 BPM</p>
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
            className={`${isDark ? 'bg-navy/50 border-border' : 'bg-white/50 border-border-light'} border rounded-2xl p-4`}
          >
            <p className="text-muted text-sm mb-1">Daily Average</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-navy'}`}>75 BPM</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate("/challenges")}
            className={`bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-4 cursor-pointer hover:border-brand transition-colors ${isDark ? '' : 'bg-brand/10'}`}
          >
            <p className="text-muted text-sm mb-1">Points Earned</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-navy'}`}>{profile?.points ?? 150}</p>
          </motion.div>
        </div>

        {/* Lessons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-navy'}`}>Today's Lessons</h2>
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
                className={`w-full ${isDark ? 'bg-navy/50 border-border' : 'bg-white/50 border-border-light'} border rounded-xl p-4 flex items-center gap-4 hover:border-brand transition-colors`}
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
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-navy'}`}>{lesson.title}</p>
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
            onClick={() => setExpandedSection(expandedSection === 'breathing' ? null : 'breathing')}
            className={`bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-4 text-left hover:border-brand transition-colors ${isDark ? '' : 'bg-brand/10'}`}
          >
            <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-navy'}`}>Breathing</p>
            <p className="text-muted text-sm">Calm your mind</p>
          </button>
          <button
            onClick={() => navigate("/assistant")}
            className={`bg-gradient-to-br from-pink/20 to-pink/5 border border-pink/30 rounded-2xl p-4 text-left hover:border-pink transition-colors ${isDark ? '' : 'bg-pink/10'}`}
          >
            <div className="w-10 h-10 bg-pink/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-navy'}`}>AI Assistant</p>
            <p className="text-muted text-sm">Ask questions</p>
          </button>
          <button
            onClick={() => navigate("/journal")}
            className={`bg-gradient-to-br from-ok/20 to-ok/5 border border-ok/30 rounded-2xl p-4 text-left hover:border-ok transition-colors ${isDark ? '' : 'bg-ok/10'}`}
          >
            <div className="w-10 h-10 bg-ok/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-navy'}`}>Journal</p>
            <p className="text-muted text-sm">Track wellness</p>
          </button>
          <button
            onClick={() => navigate("/challenges")}
            className={`bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl p-4 text-left hover:border-purple-500 transition-colors ${isDark ? '' : 'bg-purple-500/10'}`}
          >
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-navy'}`}>Challenges</p>
            <p className="text-muted text-sm">Earn points</p>
          </button>
        </motion.div>

        {/* Expandable Breathing Section */}
        <AnimatePresence>
          {expandedSection === 'breathing' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`${isDark ? 'bg-navy/50 border-border' : 'bg-white/50 border-border-light'} border rounded-2xl p-6`}
            >
              <div className="text-center">
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-navy'} mb-4`}>Quick Breathing Exercise</p>
                <p className="text-muted mb-6">Take a moment to breathe deeply and calm your mind</p>
                <button
                  onClick={() => navigate("/breathing")}
                  className="bg-brand text-white font-semibold py-3 px-8 rounded-xl hover:bg-brand/90 transition-colors"
                >
                  Start Full Exercise
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}