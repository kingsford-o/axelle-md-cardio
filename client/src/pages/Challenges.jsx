import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Challenges() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daily");

  const dailyChallenges = [
    {
      id: 1,
      title: "Complete a Breathing Exercise",
      description: "Do a 5-minute breathing session",
      points: 50,
      icon: "breathing",
      completed: false,
      type: "wellness"
    },
    {
      id: 2,
      title: "Read Today's Lesson",
      description: "Learn about heart health",
      points: 30,
      icon: "book",
      completed: false,
      type: "learning"
    },
    {
      id: 3,
      title: "Quiz Yourself",
      description: "Test your knowledge with a quiz",
      points: 40,
      icon: "quiz",
      completed: false,
      type: "learning"
    },
    {
      id: 4,
      title: "Bust a Myth",
      description: "Read one heart health myth",
      points: 20,
      icon: "myth",
      completed: false,
      type: "learning"
    },
    {
      id: 5,
      title: "Check Your Progress",
      description: "Review your stats",
      points: 10,
      icon: "stats",
      completed: false,
      type: "tracking"
    }
  ];

  const weeklyChallenges = [
    {
      id: 6,
      title: "7-Day Streak",
      description: "Use the app every day for a week",
      points: 200,
      icon: "fire",
      completed: false,
      type: "streak",
      progress: 3,
      total: 7
    },
    {
      id: 7,
      title: "Quiz Master",
      description: "Get 100% on all quizzes",
      points: 150,
      icon: "star",
      completed: false,
      type: "achievement",
      progress: 1,
      total: 3
    },
    {
      id: 8,
      title: "Breathing Pro",
      description: "Complete 10 breathing sessions",
      points: 100,
      icon: "breathing",
      completed: false,
      type: "wellness",
      progress: 2,
      total: 10
    }
  ];

  const getIcon = (icon) => {
    const icons = {
      breathing: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      book: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      quiz: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      myth: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      stats: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      fire: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
        </svg>
      ),
      star: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    };
    return icons[icon] || icons.book;
  };

  const getTypeColor = (type) => {
    const colors = {
      wellness: "brand",
      learning: "pink",
      tracking: "ok",
      streak: "purple",
      achievement: "yellow"
    };
    return colors[type] || "brand";
  };

  const challenges = activeTab === "daily" ? dailyChallenges : weeklyChallenges;

  const totalPoints = challenges.reduce((sum, c) => sum + (c.completed ? c.points : 0), 0);
  const maxPoints = challenges.reduce((sum, c) => sum + c.points, 0);

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
          <h1 className="text-xl font-bold text-white">Challenges</h1>
          <p className="text-muted text-sm">Earn points & level up</p>
        </div>
      </div>

      {/* Points Summary */}
      <div className="px-6 pb-4">
        <div className="bg-gradient-to-r from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Total Points</p>
              <p className="text-3xl font-extrabold text-white">{totalPoints}</p>
            </div>
            <div className="text-right">
              <p className="text-muted text-sm">Today's Progress</p>
              <p className="text-xl font-bold text-brand">{Math.round((totalPoints / maxPoints) * 100)}%</p>
            </div>
          </div>
          <div className="mt-3 w-full h-2 bg-navy/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalPoints / maxPoints) * 100}%` }}
              className="h-full bg-brand"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex gap-2 bg-navy/50 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "daily" ? "bg-brand text-white" : "text-muted"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "weekly" ? "bg-brand text-white" : "text-muted"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Challenges List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-navy/50 border rounded-2xl p-4 ${
                  challenge.completed ? "border-ok/30 opacity-75" : "border-border"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    challenge.completed
                      ? "bg-ok/20"
                      : `bg-${getTypeColor(challenge.type)}/20`
                  }`}>
                    {challenge.completed ? (
                      <svg className="w-6 h-6 text-ok" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    ) : (
                      <div className={`text-${getTypeColor(challenge.type)}`}>
                        {getIcon(challenge.icon)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-semibold ${challenge.completed ? "text-muted line-through" : "text-white"}`}>
                          {challenge.title}
                        </p>
                        <p className="text-muted text-sm mt-1">{challenge.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        challenge.completed ? "bg-ok/20 text-ok" : "bg-brand/20 text-brand"
                      }`}>
                        +{challenge.points}
                      </div>
                    </div>
                    {challenge.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted mb-1">
                          <span>Progress</span>
                          <span>{challenge.progress}/{challenge.total}</span>
                        </div>
                        <div className="w-full h-2 bg-navy/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                            className="h-full bg-brand"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
