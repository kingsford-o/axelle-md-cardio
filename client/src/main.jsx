import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <div className={localStorage.getItem("theme") === "light" ? "light" : "dark"}>
          <App />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);