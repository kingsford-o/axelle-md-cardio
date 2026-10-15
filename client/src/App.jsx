
import { Routes, Route, Navigate } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Start from "./pages/Start";
import Survey from "./pages/Survey";
import Home from "./pages/Home";
import Lesson from "./pages/Lesson";
import Quiz from "./pages/Quiz";
import Myths from "./pages/Myths";
import Review from "./pages/Review";

const onboarded = () => localStorage.getItem("kyh_onboarded") === "1";

export default function App() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <Routes>
        <Route path="/" element={onboarded() ? <Navigate to="/home" replace /> : <Welcome />} />
        <Route path="/start" element={<Start />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lesson/:slug" element={<Lesson />} />
        <Route path="/quiz/:slug" element={<Quiz />} />
        <Route path="/myths" element={<Myths />} />
        <Route path="/review" element={<Review />} />
      </Routes>
    </div>
  );
}