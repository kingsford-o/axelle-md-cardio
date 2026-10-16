import { useState } from "react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";

export default function Quiz() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const quizzes = {
    "1": {
      title: "Heart Rate Quiz",
      questions: [
        {
          question: "What is considered a normal resting heart rate for adults?",
          options: ["40-60 BPM", "60-100 BPM", "100-120 BPM", "120-140 BPM"],
          correct: 1
        },
        {
          question: "Why might athletes have lower resting heart rates?",
          options: [
            "They have smaller hearts",
            "They exercise less",
            "Their hearts are more efficient",
            "They have higher blood pressure"
          ],
          correct: 2
        },
        {
          question: "When is the best time to measure your resting heart rate?",
          options: [
            "After exercise",
            "Before going to bed",
            "First thing in the morning",
            "After eating"
          ],
          correct: 2
        }
      ]
    },
    "2": {
      title: "Blood Pressure Quiz",
      questions: [
        {
          question: "What is considered normal blood pressure?",
          options: [
            "140/90 mmHg",
            "120/80 mmHg",
            "100/60 mmHg",
            "160/100 mmHg"
          ],
          correct: 1
        },
        {
          question: "What does the top number in blood pressure represent?",
          options: [
            "Diastolic pressure",
            "Systolic pressure",
            "Pulse rate",
            "Heart rate"
          ],
          correct: 1
        },
        {
          question: "Why is high blood pressure called the 'silent killer'?",
          options: [
            "It causes no symptoms",
            "It only affects silent people",
            "It's not a real condition",
            "It's easily cured"
          ],
          correct: 0
        }
      ]
    },
    "3": {
      title: "Stress & Heart Health Quiz",
      questions: [
        {
          question: "Which hormone is released during chronic stress?",
          options: ["Insulin", "Cortisol", "Melatonin", "Thyroxine"],
          correct: 1
        },
        {
          question: "How can stress affect your heart?",
          options: [
            "It has no effect",
            "It lowers blood pressure",
            "It increases heart rate and blood pressure",
            "It improves heart function"
          ],
          correct: 2
        },
        {
          question: "What is a simple technique to reduce stress?",
          options: [
            "Drinking coffee",
            "Deep breathing exercises",
            "Watching scary movies",
            "Skipping meals"
          ],
          correct: 1
        }
      ]
    }
  };

  const quiz = quizzes[slug] || quizzes["1"];
  const question = quiz.questions[currentQuestion];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    if (index === question.correct) {
      setScore(score + 1);
    }
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    return (
      <div className="min-h-dvh bg-navy flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 flex items-center justify-center">
              <span className="text-5xl font-extrabold text-white">{score}/{quiz.questions.length}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Quiz Complete!</h1>
            <p className="text-muted text-lg mb-8">
              {score === quiz.questions.length ? "Perfect score!" : score >= quiz.questions.length / 2 ? "Great job!" : "Keep learning!"}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/home")}
                className="w-full bg-navy/50 border border-border text-white font-semibold py-4 rounded-xl hover:border-brand transition-colors"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-navy flex flex-col">
      <div className="px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(`/lesson/${slug}`)} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
          <p className="text-muted text-sm">Question {currentQuestion + 1} of {quiz.questions.length}</p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div className="bg-navy/50 border border-border rounded-2xl p-6">
            <p className="text-white text-xl font-semibold leading-relaxed">{question.question}</p>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => selectedAnswer === null && handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 rounded-xl text-left transition-colors ${
                  selectedAnswer === null
                    ? "bg-navy/50 border border-border text-white hover:border-brand"
                    : selectedAnswer === index
                    ? index === question.correct
                      ? "bg-ok/20 border border-ok text-white"
                      : "bg-pink/20 border border-pink text-white"
                    : index === question.correct
                    ? "bg-ok/20 border border-ok text-white"
                    : "bg-navy/50 border border-border text-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    selectedAnswer === null
                      ? "bg-navy text-muted"
                      : selectedAnswer === index
                      ? index === question.correct
                        ? "bg-ok text-white"
                        : "bg-pink text-white"
                      : index === question.correct
                      ? "bg-ok text-white"
                      : "bg-navy text-muted"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-semibold">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}