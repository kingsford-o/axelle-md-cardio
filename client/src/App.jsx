import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { account } from "./lib/appwrite.js";
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

// Wrapper for mobile-first telemetry application pages
function AppContainer({ children }) {
  return <div className="mx-auto min-h-dvh max-w-md">{children}</div>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Appwrite session
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
      <div className="min-h-dvh bg-navy flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
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
              <AppContainer>
                <Welcome />
              </AppContainer>
            )
          }
        />
        <Route
          path="/start"
          element={
            <AppContainer>
              <Start />
            </AppContainer>
          }
        />
        <Route
          path="/survey"
          element={
            <AppContainer>
              <Survey />
            </AppContainer>
          }
        />
        <Route
          path="/home"
          element={
            user ? (
              <AppContainer>
                <Home onLogout={handleLogout} />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/lesson/:slug"
          element={
            user ? (
              <AppContainer>
                <Lesson />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/quiz/:slug"
          element={
            user ? (
              <AppContainer>
                <Quiz />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/myths"
          element={
            user ? (
              <AppContainer>
                <Myths />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/review"
          element={
            user ? (
              <AppContainer>
                <Review />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/breathing"
          element={
            user ? (
              <AppContainer>
                <Breathing />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/challenges"
          element={
            user ? (
              <AppContainer>
                <Challenges />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/heartrate"
          element={
            user ? (
              <AppContainer>
                <HeartRate />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/journal"
          element={
            user ? (
              <AppContainer>
                <Journal />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/assistant"
          element={
            user ? (
              <AppContainer>
                <Assistant />
              </AppContainer>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}