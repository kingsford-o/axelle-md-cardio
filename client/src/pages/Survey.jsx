import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { account, databases, Query, ID, COLLECTIONS, APPWRITE_DATABASE_ID } from "../lib/appwrite.js";
import { saveProfile } from "../lib/dailyLog.js";
import { onboardingScore } from "../lib/scoreEngine.js";

const WORK_TYPES = [
  { value: "desk", label: "Desk job", sub: "Office, computer, meetings" },
  { value: "standing", label: "Standing job", sub: "Shop, security, teaching" },
  { value: "physical", label: "Physical job", sub: "Farming, construction, lifting" },
  { value: "driving", label: "Driving / transport", sub: "Trotro, taxi, long routes" },
  { value: "shift", label: "Shift / night work", sub: "Nights, rotating shifts" },
  { value: "unemployed", label: "Not working / student", sub: "Between jobs or studying" },
  { value: "homemaker", label: "Homemaker", sub: "Caring for home & family" },
];

const SIT_HOURS = [
  { value: "under2", label: "Under 2 hours" },
  { value: "2to4", label: "2–4 hours" },
  { value: "4to6", label: "4–6 hours" },
  { value: "over6", label: "Over 6 hours" },
];

export default function Survey() {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [workType, setWorkType] = useState("");
  const [sitHours, setSitHours] = useState("");
  const [notes, setNotes] = useState("");
  const [risks, setRisks] = useState({
    smoker: false,
    highSalt: false,
    friedFood: false,
    sugaryDrinks: false,
    familyHistory: false,
    highStress: false,
  });

  const [liveScore, setLiveScore] = useState(0);

  useEffect(() => {
    setLiveScore(onboardingScore({ age, gender, activityLevel, workType, sitHours, risks }));
  }, [age, gender, activityLevel, workType, sitHours, risks]);

  const toggleRisk = (key) => setRisks((r) => ({ ...r, [key]: !r[key] }));

  const handleSubmit = async () => {
    const profile = {
      age: parseInt(age, 10),
      gender,
      activityLevel,
      workType,
      sitHours,
      risks,
      notes: notes.trim().slice(0, 300),
    };

    saveProfile(profile);
    localStorage.setItem("kyh_onboarded", "1");
    localStorage.setItem("kyh_age", age);
    localStorage.setItem("kyh_gender", gender);
    localStorage.setItem("kyh_activity", activityLevel);
    localStorage.setItem("axelle_initial_score", String(liveScore));

    try {
      const user = await account.get();
      if (user) {
        const res = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.PROFILES,
          [Query.equal("userId", user.$id)]
        );
        const payload = { age: parseInt(age, 10), gender, activityLevel };
        if (res.documents && res.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.PROFILES,
            res.documents[0].$id,
            payload
          );
        } else {
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.PROFILES,
            ID.unique(),
            { userId: user.$id, email: user.email, fullName: user.name, ...payload }
          );
        }
      }
    } catch (e) {
      console.warn("Profile sync error:", e);
    }

    navigate("/home");
  };

  const riskQuestions = [
    { key: "smoker", label: "I smoke or use tobacco" },
    { key: "highSalt", label: "I add a lot of salt to my food" },
    { key: "friedFood", label: "I eat fried food most days" },
    { key: "sugaryDrinks", label: "I drink soda or sweet drinks daily" },
    { key: "familyHistory", label: "A close family member had heart problems" },
    { key: "highStress", label: "I often feel stressed or under pressure" },
  ];

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-6"
        >
          {/* Live score bar */}
          <div className="p-4 rounded-2xl border bg-slate-900 border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Building your profile
              </p>
              <p className="text-lg font-semibold text-white leading-none">
                {liveScore.toFixed(0)}
                <span className="text-xs text-slate-500 ml-0.5">%</span>
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
              <motion.div
                animate={{ width: `${liveScore}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-emerald-400"
              />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Health profile</h1>
            <p className="text-slate-400 text-sm">
              Your answers stay on this device and shape your daily plan.
            </p>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  key={option}
                  onClick={() => setGender(option)}
                  className={`py-3 rounded-2xl text-sm font-medium transition-colors border ${
                    gender === option
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Work type */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">What kind of work do you do?</label>
            <p className="text-xs text-slate-500 mb-2">
              Your daily routine shapes how your heart is used.
            </p>
            <div className="space-y-2">
              {WORK_TYPES.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setWorkType(option.value)}
                  className={`w-full p-4 rounded-2xl text-left transition-colors border ${
                    workType === option.value
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className={`text-xs mt-0.5 ${
                    workType === option.value ? "text-slate-600" : "text-slate-500"
                  }`}>{option.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sitting hours */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">
              How many hours a day do you spend sitting?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SIT_HOURS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSitHours(option.value)}
                  className={`py-3 px-3 rounded-2xl text-xs font-medium transition-colors border ${
                    sitHours === option.value
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">
              Exercise outside of work
            </label>
            <div className="space-y-2">
              {[
                { value: "sedentary", label: "None", sub: "Little or no exercise" },
                { value: "moderate", label: "Moderate", sub: "1–3 times per week" },
                { value: "active", label: "Active", sub: "3–5 times per week" },
                { value: "very-active", label: "Very active", sub: "6+ times per week" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActivityLevel(option.value)}
                  className={`w-full p-4 rounded-2xl text-left transition-colors border ${
                    activityLevel === option.value
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className={`text-xs mt-0.5 ${
                    activityLevel === option.value ? "text-slate-600" : "text-slate-500"
                  }`}>{option.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Anything else that applies?</label>
            <p className="text-xs text-slate-500 mb-2">
              Select what applies. You can change this later.
            </p>
            <div className="space-y-2">
              {riskQuestions.map((q) => (
                <button
                  key={q.key}
                  onClick={() => toggleRisk(q.key)}
                  className={`w-full p-3.5 rounded-2xl flex items-center gap-3 text-left transition-colors border ${
                    risks[q.key]
                      ? "bg-white text-slate-900 border-white"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                    risks[q.key] ? "bg-slate-900 border-slate-900" : "border-slate-700"
                  }`}>
                    {risks[q.key] && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{q.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">
              Anything else about your health or lifestyle?
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Optional. Write anything you want us to know.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. I do night shifts three times a week"
              rows={3}
              maxLength={300}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-600 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!age || !gender || !activityLevel || !workType}
            className="w-full bg-white text-slate-900 font-medium py-4 rounded-2xl hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Build my daily plan
          </button>

          <p className="text-[11px] text-center text-slate-500 leading-relaxed">
            Your answers stay on this device. Nothing is sent to a server.
          </p>
        </motion.div>
      </div>
    </div>
  );
}