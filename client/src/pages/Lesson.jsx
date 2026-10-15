import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";

export default function Lesson() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const lessons = {
    "1": {
      title: "Understanding Your Heart Rate",
      duration: "5 min",
      content: [
        {
          type: "text",
          text: "Your heart rate is the number of times your heart beats per minute (BPM). It's one of the most important indicators of your cardiovascular health."
        },
        {
          type: "highlight",
          text: "Normal resting heart rate for adults: 60-100 BPM"
        },
        {
          type: "text",
          text: "Athletes may have resting heart rates as low as 40 BPM, which is a sign of excellent cardiovascular fitness."
        },
        {
          type: "tip",
          text: "Tip: Measure your resting heart rate first thing in the morning before getting out of bed for the most accurate reading."
        }
      ]
    },
    "2": {
      title: "Blood Pressure Basics",
      duration: "7 min",
      content: [
        {
          type: "text",
          text: "Blood pressure measures the force of blood against your artery walls. It's recorded as two numbers: systolic (top) and diastolic (bottom)."
        },
        {
          type: "highlight",
          text: "Normal blood pressure: Less than 120/80 mmHg"
        },
        {
          type: "text",
          text: "High blood pressure (hypertension) is often called the 'silent killer' because it typically has no symptoms."
        },
        {
          type: "tip",
          text: "Tip: Regular exercise, reducing sodium intake, and managing stress can help maintain healthy blood pressure."
        }
      ]
    },
    "3": {
      title: "Stress & Cardiovascular Health",
      duration: "6 min",
      content: [
        {
          type: "text",
          text: "Chronic stress can have serious effects on your heart health, including increased blood pressure and heart rate."
        },
        {
          type: "highlight",
          text: "Stress hormones like cortisol can damage blood vessels over time"
        },
        {
          type: "text",
          text: "Managing stress through relaxation techniques, exercise, and social connections is crucial for heart health."
        },
        {
          type: "tip",
          text: "Tip: Try deep breathing exercises for 5 minutes daily to reduce stress levels."
        }
      ]
    }
  };

  const lesson = lessons[slug] || lessons["1"];

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
          <p className="text-muted text-sm">{lesson.duration}</p>
          <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {lesson.content.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={
                item.type === "highlight"
                  ? "bg-brand/20 border border-brand/30 rounded-xl p-4"
                  : item.type === "tip"
                  ? "bg-ok/20 border border-ok/30 rounded-xl p-4"
                  : ""
              }
            >
              {item.type === "highlight" && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <p className="text-white font-semibold">{item.text}</p>
                </div>
              )}
              {item.type === "tip" && (
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-ok mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                  </svg>
                  <p className="text-white font-semibold">{item.text}</p>
                </div>
              )}
              {item.type === "text" && (
                <p className="text-muted text-lg leading-relaxed">{item.text}</p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4">
        <button
          onClick={() => navigate(`/quiz/${slug}`)}
          className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors"
        >
          Take Quiz
        </button>
      </div>
    </div>
  );
}