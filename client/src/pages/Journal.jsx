import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { account, databases, Query, ID, COLLECTIONS, APPWRITE_DATABASE_ID } from "../lib/appwrite.js";

export default function Journal() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [entry, setEntry] = useState({
    mood: "",
    symptoms: "",
    activity: "",
    notes: ""
  });

  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "Today",
      mood: "Good",
      symptoms: "None",
      activity: "30 min walk",
      notes: "Feeling energetic today"
    },
    {
      id: 2,
      date: "Yesterday",
      mood: "Fair",
      symptoms: "Mild fatigue",
      activity: "Rest day",
      notes: "Took it easy after workout"
    }
  ]);

  useEffect(() => {
    async function loadEntries() {
      try {
        const user = await account.get();
        if (user) {
          const res = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.JOURNAL_ENTRIES,
            [Query.equal("userId", user.$id)]
          );
          if (res.documents && res.documents.length > 0) {
            setEntries(
              res.documents.map((d) => ({
                id: d.$id,
                date: d.date || new Date(d.$createdAt || Date.now()).toLocaleDateString(),
                mood: d.mood,
                symptoms: d.symptoms || "None",
                activity: d.activity || "Not specified",
                notes: d.notes || "",
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Failed to load journal entries from Appwrite:", err);
      }
    }
    loadEntries();
  }, []);

  const moods = ["Great", "Good", "Fair", "Poor", "Terrible"];
  const symptomsOptions = ["None", "Chest pain", "Shortness of breath", "Fatigue", "Dizziness", "Palpitations"];

  const handleSubmit = async () => {
    const newEntry = {
      id: Date.now(),
      date: "Today",
      mood: entry.mood,
      symptoms: entry.symptoms || "None",
      activity: entry.activity || "Not specified",
      notes: entry.notes || ""
    };
    setEntries([newEntry, ...entries]);

    try {
      const user = await account.get();
      if (user) {
        await databases.createDocument(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.JOURNAL_ENTRIES,
          ID.unique(),
          {
            userId: user.$id,
            mood: entry.mood,
            symptoms: entry.symptoms || "None",
            activity: entry.activity || "Not specified",
            notes: entry.notes || "",
            date: "Today",
          }
        );
      }
    } catch (err) {
      console.warn("Failed to save journal entry to Appwrite:", err);
    }

    setEntry({ mood: "", symptoms: "", activity: "", notes: "" });
    setShowModal(false);
  };

  const getMoodColor = (mood) => {
    const colors = {
      "Great": "bg-green-500/20 text-green-400",
      "Good": "bg-blue-500/20 text-blue-400",
      "Fair": "bg-yellow-500/20 text-yellow-400",
      "Poor": "bg-orange-500/20 text-orange-400",
      "Terrible": "bg-red-500/20 text-red-400"
    };
    return colors[mood] || "bg-navy/50 text-muted";
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      "Great": "😊",
      "Good": "🙂",
      "Fair": "😐",
      "Poor": "😕",
      "Terrible": "😢"
    };
    return emojis[mood] || "😐";
  };

  return (
    <div className="min-h-dvh bg-navy flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/home")} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Health Journal</h1>
          <p className="text-muted text-sm">Track your daily wellness</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {entries.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-navy/50 border border-border rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-muted text-sm">{item.date}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getMoodColor(item.mood)} mt-1`}>
                    <span>{getMoodEmoji(item.mood)}</span>
                    <span className="font-semibold">{item.mood}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-muted text-sm">Symptoms: <span className="text-white">{item.symptoms}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-muted text-sm">Activity: <span className="text-white">{item.activity}</span></span>
                </div>
                {item.notes && (
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-muted mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-muted text-sm">{item.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/95 flex items-end z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-navy border-t border-border rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />

              <h2 className="text-2xl font-bold text-white mb-6">New Journal Entry</h2>

              <div className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <label className="text-white font-semibold block mb-3">How are you feeling?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setEntry({ ...entry, mood })}
                        className={`p-3 rounded-xl text-center transition-colors ${
                          entry.mood === mood
                            ? getMoodColor(mood)
                            : "bg-navy/50 border border-border text-muted hover:border-brand"
                        }`}
                      >
                        <div className="text-2xl mb-1">{getMoodEmoji(mood)}</div>
                        <div className="text-xs font-semibold">{mood}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="text-white font-semibold block mb-3">Any symptoms?</label>
                  <div className="flex flex-wrap gap-2">
                    {symptomsOptions.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => setEntry({ ...entry, symptoms: symptom })}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                          entry.symptoms === symptom
                            ? "bg-brand text-white"
                            : "bg-navy/50 border border-border text-muted hover:border-brand"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div>
                  <label className="text-white font-semibold block mb-2">Activity today</label>
                  <input
                    type="text"
                    value={entry.activity}
                    onChange={(e) => setEntry({ ...entry, activity: e.target.value })}
                    placeholder="e.g., 30 min walk, gym, rest day"
                    className="w-full bg-navy/50 border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-white font-semibold block mb-2">Additional notes</label>
                  <textarea
                    value={entry.notes}
                    onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
                    placeholder="How was your day? Any observations?"
                    rows={3}
                    className="w-full bg-navy/50 border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-brand resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!entry.mood}
                  className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
