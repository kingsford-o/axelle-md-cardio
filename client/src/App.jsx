import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { account } from "./lib/appwrite.js";
import { useTheme } from "./contexts/ThemeContext.jsx";
import Welcome from "./pages/Welcome";
import Start from "./pages/Start";
import Survey from "./pages/Survey";
import Home from "./pages/Home";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import Myths from "./pages/Myths";
import Review from "./pages/Review";
import Breathing from "./pages/Breathing";
import Challenges from "./pages/Challenges";
import HeartRate from "./pages/HeartRate";
import Journal from "./pages/Journal";
import Assistant from "./pages/Assistant";
import Auth from "./components/Auth";
import DailyLog from "./pages/DailyLog";

// Narrow container — for onboarding (Welcome, Start, Survey)
function MobileContainer({ children }) {
  return <div className="mx-auto min-h-dvh max-w-md">{children}</div>;
}

// Full-width container — for the app dashboard and inner pages
// Auto-adds a "Back to home" button on every page except /home
function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();

  const isHome = location.pathname === "/home";

  return (
    <div className="min-h-dvh w-full">
      {!isHome && (
        <div className="px-4 sm:px-6 lg:px-8 pt-6">
          <button
            onClick={() => navigate("/home")}
            className={`h-10 px-4 rounded-2xl text-xs font-medium transition-colors border inline-flex items-center gap-1.5 ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to home</span>
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account
      .get()
      .then((currentUser) => {
        setUser(currentUser);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.warn("Logout error:", err);
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-white text-sm font-medium">Loading telemetry portal...</div>
        </div>
      </div>
    );
  }

  const onboarded = () => localStorage.getItem("kyh_onboarded") === "1";

  return (
    <div className="min-h-dvh">
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Auth onSuccess={handleAuthSuccess} />
            ) : onboarded() ? (
              <Navigate to="/home" replace />
            ) : (
              <MobileContainer>
                <Welcome />
              </MobileContainer>
            )
          }
        />

        <Route path="/start" element={<MobileContainer><Start /></MobileContainer>} />
        <Route path="/survey" element={<MobileContainer><Survey /></MobileContainer>} />
        <Route path="/daily-log" element={user ? <AppShell><DailyLog /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/home" element={user ? <AppShell><Home onLogout={handleLogout} /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/lesson/:slug" element={user ? <AppShell><Lesson /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/quiz/:slug" element={user ? <AppShell><Quiz /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/myths" element={user ? <AppShell><Myths /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/review" element={user ? <AppShell><Review /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/breathing" element={user ? <AppShell><Breathing /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/challenges" element={user ? <AppShell><Challenges /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/heart-rate" element={user ? <AppShell><HeartRate /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/journal" element={user ? <AppShell><Journal /></AppShell> : <Navigate to="/" replace />} />
        <Route path="/assistant" element={user ? <AppShell><Assistant /></AppShell> : <Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}