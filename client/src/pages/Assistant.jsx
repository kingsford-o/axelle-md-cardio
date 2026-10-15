import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function Assistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      text: "Hi! I'm your heart health assistant. Ask me anything about cardiovascular health, and I'll help you understand it better. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("heart rate") || lowerMessage.includes("bpm")) {
      return "A normal resting heart rate for adults is between 60-100 beats per minute (BPM). Athletes may have lower resting heart rates (40-60 BPM) due to their high cardiovascular fitness. It's best to measure your resting heart rate first thing in the morning before getting out of bed.";
    }
    if (lowerMessage.includes("blood pressure")) {
      return "Normal blood pressure is less than 120/80 mmHg. The top number (systolic) measures pressure when your heart beats, while the bottom number (diastolic) measures pressure between beats. High blood pressure (130/80 or higher) is a major risk factor for heart disease.";
    }
    if (lowerMessage.includes("exercise") || lowerMessage.includes("workout")) {
      return "Regular exercise is one of the best things you can do for your heart! Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week. Walking, swimming, cycling, and dancing are all great options. Start slowly and gradually increase intensity.";
    }
    if (lowerMessage.includes("diet") || lowerMessage.includes("food") || lowerMessage.includes("eat")) {
      return "A heart-healthy diet includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats (like those in fish, nuts, and olive oil). Limit saturated fats, trans fats, sodium, and added sugars. The Mediterranean diet is a great example of a heart-healthy eating pattern.";
    }
    if (lowerMessage.includes("stress") || lowerMessage.includes("anxiety")) {
      return "Chronic stress can negatively impact your heart health by increasing blood pressure and heart rate. Try stress management techniques like deep breathing exercises, meditation, regular physical activity, and getting enough sleep. Our breathing exercise feature can help you relax!";
    }
    if (lowerMessage.includes("symptom") || lowerMessage.includes("chest pain") || lowerMessage.includes("warning")) {
      return "Common heart attack warning signs include chest discomfort, shortness of breath, pain in arms/back/neck/jaw, cold sweat, nausea, and lightheadedness. If you experience these symptoms, especially if they're sudden or severe, seek emergency medical attention immediately. Remember, I'm an AI assistant - for medical emergencies, always call emergency services.";
    }
    if (lowerMessage.includes("cholesterol")) {
      return "Cholesterol is a waxy substance in your blood. There are two main types: LDL (bad) cholesterol and HDL (good) cholesterol. High LDL can build up in arteries, while HDL helps remove it. Aim for total cholesterol below 200 mg/dL, LDL below 100 mg/dL, and HDL above 40 mg/dL for men or 50 mg/dL for women.";
    }
    if (lowerMessage.includes("sleep")) {
      return "Good sleep is essential for heart health! Adults should aim for 7-9 hours of quality sleep per night. Poor sleep is linked to higher risk of heart disease, high blood pressure, and stroke. Try to maintain a consistent sleep schedule and create a relaxing bedtime routine.";
    }
    if (lowerMessage.includes("smoke") || lowerMessage.includes("tobacco")) {
      return "Smoking is one of the most significant risk factors for heart disease. It damages blood vessels, raises blood pressure, and reduces exercise capacity. Quitting smoking is one of the best things you can do for your heart health - benefits start within hours and continue for years.";
    }
    if (lowerMessage.includes("alcohol")) {
      return "Moderate alcohol consumption (up to 1 drink per day for women, 2 for men) may have some heart benefits, but excessive drinking increases heart disease risk. If you don't drink, don't start for health benefits. If you do drink, do so in moderation and talk to your doctor about what's right for you.";
    }

    return "That's a great question! Heart health is complex and multifaceted. I can help you understand topics like heart rate, blood pressure, exercise, diet, stress management, and more. Could you be more specific about what you'd like to know? Also remember, while I can provide general health information, I'm not a substitute for professional medical advice.";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        text: getResponse(input)
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const quickQuestions = [
    "What's a normal heart rate?",
    "How does exercise help my heart?",
    "What foods are heart-healthy?",
    "How can I reduce stress?"
  ];

  return (
    <div className="min-h-dvh bg-navy flex flex-col">
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-border">
        <button onClick={() => navigate("/home")} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Health Assistant</h1>
          <p className="text-muted text-sm">Ask me anything about heart health</p>
        </div>
        <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.type === "user"
                    ? "bg-brand text-white"
                    : "bg-navy/50 border border-border text-white"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-navy/50 border border-border rounded-2xl p-4">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-2 bg-brand rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    className="w-2 h-2 bg-brand rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    className="w-2 h-2 bg-brand rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <p className="text-muted text-sm mb-3">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => setInput(question)}
                  className="px-4 py-2 bg-navy/50 border border-border rounded-full text-sm text-muted hover:border-brand transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about heart health..."
            className="flex-1 bg-navy/50 border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-brand"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-muted text-xs mt-3">
          This is an AI assistant for general information only. Not medical advice.
        </p>
      </div>
    </div>
  );
}
