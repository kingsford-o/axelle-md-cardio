import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton.jsx";

export default function Myths() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const myths = [
    {
      id: 1,
      myth: "Heart disease only affects older people",
      fact: "Heart disease can affect people of all ages. Lifestyle factors like diet, exercise, and stress management are important regardless of age.",
      category: "Age"
    },
    {
      id: 2,
      myth: "If you have no symptoms, your heart is healthy",
      fact: "Many heart conditions, like high blood pressure and high cholesterol, have no obvious symptoms. Regular check-ups are essential.",
      category: "Symptoms"
    },
    {
      id: 3,
      myth: "You don't need to worry about heart disease if it doesn't run in your family",
      fact: "While genetics play a role, lifestyle factors are equally important. Diet, exercise, and stress management can significantly impact heart health.",
      category: "Genetics"
    },
    {
      id: 4,
      myth: "Heart disease is a man's problem",
      fact: "Heart disease is the leading cause of death for both men and women. Women may experience different symptoms, so awareness is crucial.",
      category: "Gender"
    },
    {
      id: 5,
      myth: "You can't improve your heart health if you've already developed problems",
      fact: "It's never too late to make positive changes. Even small improvements in diet, exercise, and stress management can benefit heart health.",
      category: "Recovery"
    },
    {
      id: 6,
      myth: "Fat is always bad for your heart",
      fact: "Not all fats are created equal. Healthy fats like those found in avocados, nuts, and olive oil are actually beneficial for heart health.",
      category: "Diet"
    }
  ];

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
          <h1 className="text-xl font-bold text-white">Heart Health Myths</h1>
          <p className="text-muted text-sm">Separate fact from fiction</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {myths.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-navy/50 border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-pink/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-brand text-xs font-semibold uppercase tracking-wider">{item.category}</span>
                    <p className="text-white font-semibold mt-1">{item.myth}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-muted transition-transform ${
                      expandedId === item.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 pt-0">
                      <div className="mt-4 p-4 bg-ok/20 border border-ok/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-ok mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <p className="text-white font-semibold">Fact: {item.fact}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}