import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { account, databases, Query, ID, COLLECTIONS, APPWRITE_DATABASE_ID } from "../lib/appwrite.js";

export default function Survey() {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const handleSubmit = async () => {
    localStorage.setItem("kyh_onboarded", "1");
    localStorage.setItem("kyh_age", age);
    localStorage.setItem("kyh_gender", gender);
    localStorage.setItem("kyh_activity", activityLevel);

    try {
      const user = await account.get();
      if (user) {
        const res = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTIONS.PROFILES,
          [Query.equal("userId", user.$id)]
        );
        if (res.documents && res.documents.length > 0) {
          await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.PROFILES,
            res.documents[0].$id,
            {
              age: parseInt(age, 10),
              gender,
              activityLevel,
            }
          );
        } else {
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.PROFILES,
            ID.unique(),
            {
              userId: user.$id,
              email: user.email,
              fullName: user.name,
              age: parseInt(age, 10),
              gender,
              activityLevel,
              points: 100,
              streak: 1,
            }
          );
        }
      }
    } catch (e) {
      console.warn("Profile sync error:", e);
    }

    navigate("/home");
  };

  return (
    <div className="min-h-dvh bg-navy flex flex-col">
      {/* Notification Bar */}
      <div className="bg-brand/20 border-y border-brand/30 px-6 py-3">
        <p className="text-brand text-xs font-medium">
          Active Telemetry Stage: 1.2 Health Profile
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-6"
        >
          <h1 className="text-3xl font-extrabold text-white mb-2">Health Profile</h1>
          <p className="text-muted text-lg mb-6">
            Help us personalize your heart health insights.
          </p>

          {/* Age Input */}
          <div className="space-y-2">
            <label className="text-white font-semibold">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              className="w-full bg-navy/50 border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-brand"
            />
          </div>

          {/* Gender Selection */}
          <div className="space-y-2">
            <label className="text-white font-semibold">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {["Male", "Female", "Other"].map((option) => (
                <button
                  key={option}
                  onClick={() => setGender(option)}
                  className={`py-3 rounded-xl font-semibold transition-colors ${
                    gender === option
                      ? "bg-brand text-white"
                      : "bg-navy/50 border border-border text-muted hover:border-brand"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="text-white font-semibold">Activity Level</label>
            <div className="space-y-3">
              {[
                { value: "sedentary", label: "Sedentary (Little or no exercise)" },
                { value: "moderate", label: "Moderate (Exercise 1-3 times/week)" },
                { value: "active", label: "Active (Exercise 3-5 times/week)" },
                { value: "very-active", label: "Very Active (Exercise 6+ times/week)" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActivityLevel(option.value)}
                  className={`w-full p-4 rounded-xl text-left transition-colors ${
                    activityLevel === option.value
                      ? "bg-brand text-white"
                      : "bg-navy/50 border border-border text-muted hover:border-brand"
                  }`}
                >
                  <span className="font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!age || !gender || !activityLevel}
            className="w-full bg-brand text-white font-semibold py-4 rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            Complete Setup
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 text-center text-white/60 text-xs">
        <span>Step 2 of 3</span>
      </div>
    </div>
  );
}