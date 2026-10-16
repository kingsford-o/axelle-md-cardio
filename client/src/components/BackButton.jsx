// src/components/BackButton.jsx
// Reusable back button — drop at the top of any page except Home.
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function BackButton({ to = "/home", label = "Home" }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <button
      onClick={() => navigate(to)}
      className={`h-10 px-4 rounded-2xl text-xs font-medium transition-colors border inline-flex items-center gap-1.5 ${
        isDark
          ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
          : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span>{label}</span>
    </button>
  );
}