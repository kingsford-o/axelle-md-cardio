import { useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { account, databases, ID, COLLECTIONS, APPWRITE_DATABASE_ID } from "../lib/appwrite.js";
import { useTheme } from "../contexts/ThemeContext.jsx";

const COUNTRIES = [
  { code: "+233", name: "Ghana", flag: "🇬🇭", minLen: 9, maxLen: 10 },
  { code: "+234", name: "Nigeria", flag: "🇳🇬", minLen: 10, maxLen: 11 },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", minLen: 10, maxLen: 11 },
  { code: "+1", name: "United States", flag: "🇺🇸", minLen: 10, maxLen: 10 },
  { code: "+254", name: "Kenya", flag: "🇰🇪", minLen: 9, maxLen: 10 },
  { code: "+27", name: "South Africa", flag: "🇿🇦", minLen: 9, maxLen: 10 },
  { code: "+1", name: "Canada", flag: "🇨🇦", minLen: 10, maxLen: 10 },
  { code: "+49", name: "Germany", flag: "🇩🇪", minLen: 10, maxLen: 11 },
];

export default function Auth({ onSuccess }) {
  const { isDark, toggleTheme } = useTheme();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPolicyTooltip, setShowPolicyTooltip] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Accessibility IDs for form inputs and labels
  const emailInputId = useId();
  const passwordInputId = useId();
  const fullNameInputId = useId();
  const phoneInputId = useId();
  const confirmPasswordInputId = useId();
  const rememberMeInputId = useId();
  const termsInputId = useId();
  const forgotEmailInputId = useId();

  // Password strength calculation matching admission portal rules
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", percent: 0, color: "bg-gray-400" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) {
      return { score: 1, label: "Weak Password", percent: 25, color: "bg-pink", text: "text-pink" };
    } else if (score <= 4) {
      return { score: 2, label: "Moderate Password", percent: 65, color: "bg-amber-400", text: "text-amber-400" };
    } else {
      return { score: 3, label: "Strong Password", percent: 100, color: "bg-ok", text: "text-ok" };
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = !password || !confirmPassword || password === confirmPassword;

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!phoneNumber.trim()) {
        setError("Please enter a valid phone number.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("The password and confirmation password do not match.");
        return;
      }
      if (!acceptTerms) {
        setError("You must accept the terms to continue.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Appwrite email/password session
        await account.createEmailPasswordSession(email.trim(), password);
        const user = await account.get();
        if (user) {
          onSuccess(user);
        }
      } else {
        // Appwrite user creation
        const newUserId = ID.unique();
        await account.create(newUserId, email.trim(), password, fullName.trim());
        await account.createEmailPasswordSession(email.trim(), password);
        const user = await account.get();

        // Save initial profile in Appwrite database
        try {
          const fullPhone = `${selectedCountry.code}${phoneNumber.replace(/\s+/g, "")}`;
          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            COLLECTIONS.PROFILES,
            ID.unique(),
            {
              userId: user.$id,
              email: email.trim(),
              fullName: fullName.trim(),
              phone: fullPhone,
              points: 150,
              streak: 1,
              lastActive: new Date().toISOString(),
            }
          );
        } catch (dbErr) {
          console.warn("Profile document notice:", dbErr?.message);
        }

        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          if (user) onSuccess(user);
        }, 600);
      }
    } catch (err) {
      setError(err.message || "An authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await account.createOAuth2Session(
        "google",
        window.location.origin,
        window.location.origin
      );
      const user = await account.get();
      if (user) onSuccess(user);
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      await account.createRecovery(forgotEmail, `${window.location.origin}/reset-password`);
    } catch (err) {
      console.warn("Recovery notice:", err);
    }
    setForgotSubmitted(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSubmitted(false);
      setForgotEmail("");
      setSuccessMessage("Password reset instructions have been sent to your email.");
    }, 1800);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col justify-between selection:bg-brand selection:text-white ${isDark ? "bg-navy text-white" : "bg-cream text-navy"}`}>
      {/* Floating Theme Toggle (Matches Home.jsx) */}
      <motion.button
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
          isDark
            ? "bg-brand/20 border border-brand/30 text-brand hover:bg-brand/30"
            : "bg-white/80 border border-border/20 text-brand hover:bg-white"
        }`}
        title="Toggle Theme"
      >
        {isDark ? (
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </motion.button>

      {/* Top Clinical Telemetry Notification Bar (Matches Welcome.jsx) */}
      <div className={`border-y px-6 py-2.5 flex items-center justify-between text-xs font-medium ${
        isDark ? "bg-brand/15 border-brand/30 text-brand" : "bg-brand/10 border-brand/20 text-brand"
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink animate-pulse" />
          <span>Active Telemetry Stage: 1.0 Clinical Access Portal</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
          <span className="text-ok">● 72 BPM RESTING</span>
          <span className={isDark ? "text-white/60" : "text-navy/60"}>Encrypted on device</span>
        </div>
      </div>

      {/* Main Authentication Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column: Heart Health Telemetry Presentation */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Animated Beating Heart Emblem with Rhythm Badge */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-pink/20 border border-pink/30 flex items-center justify-center shrink-0 shadow-lg"
                >
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-pink" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </motion.div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-ok/20 text-ok border border-ok/30 mb-1">
                    Normal Rhythm
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-navy"}`}>
                    Know Your Heart
                  </h2>
                </div>
              </div>

              {/* Taglines styled with app fonts and colors */}
              <div className="space-y-2">
                <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-navy"}`}>
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-muted text-base sm:text-lg leading-relaxed">
                  {isLogin
                    ? "Sign in to track your heart rate, daily rhythm telemetry, and cardiovascular wellness journey."
                    : "Register to begin personalized heart health telemetry, breathing exercises, and clinical wellness insights."}
                </p>
              </div>

              {/* Telemetry Highlight Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className={`p-4 rounded-2xl border transition-colors ${
                  isDark ? "bg-navy/50 border-border" : "bg-white/70 border-sand shadow-sm"
                }`}>
                  <p className="text-muted text-xs mb-1">Daily Average</p>
                  <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-navy"}`}>75 BPM</p>
                </div>
                <div className={`p-4 rounded-2xl border transition-colors ${
                  isDark ? "bg-navy/50 border-border" : "bg-white/70 border-sand shadow-sm"
                }`}>
                  <p className="text-muted text-xs mb-1">Telemetry Status</p>
                  <p className="text-2xl font-bold text-ok">Active</p>
                </div>
              </div>

              {/* Telemetry Info Note */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                isDark ? "bg-brand/10 border-brand/20 text-white/80" : "bg-brand/5 border-brand/15 text-navy/80"
              }`}>
                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="font-semibold text-brand">Secure Telemetry Vault</span>
                  <p className="mt-0.5 text-muted">
                    End-to-end encrypted session connected with Appwrite Database. Your health metrics remain confidential.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Authentication Card (App UI Themed) */}
          <div className="lg:col-span-7 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl transition-colors border ${
                isDark
                  ? "bg-[#202038]/80 backdrop-blur-xl border-border"
                  : "bg-white/95 backdrop-blur-xl border-sand shadow-xl"
              }`}
            >
              {/* Top Accent Strip in App Brand Blue & Pink */}
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-brand via-pink to-brand" />

              {/* Tab Switcher */}
              <div className={`flex rounded-xl p-1 mb-6 border ${
                isDark ? "bg-navy/70 border-border" : "bg-sand/40 border-sand"
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    isLogin
                      ? "bg-brand text-white shadow-md"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setError("");
                    setSuccessMessage("");
                  }}
                  className={`flex-1 py-2.5 text-center text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    !isLogin
                      ? "bg-brand text-white shadow-md"
                      : "text-muted hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Sub-header */}
              <div className="mb-6">
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-navy"}`}>
                  {isLogin ? "Sign In to Your Telemetry" : "Register New Account"}
                </h3>
                <p className="text-muted text-xs sm:text-sm mt-1">
                  {isLogin
                    ? "Enter your credentials to access your cardiovascular rhythm logs"
                    : "Register with a valid email and phone number to begin telemetry"}
                </p>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-5 p-3.5 bg-pink/20 border border-pink/30 rounded-xl text-xs sm:text-sm text-pink flex items-start gap-2.5 animate-shake">
                  <span className="font-bold">⚠</span>
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 bg-ok/20 border border-ok/30 rounded-xl text-xs sm:text-sm text-ok flex items-start gap-2.5">
                  <span className="font-bold">✓</span>
                  <span className="flex-1">{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {/* Registration: Full Name */}
                {!isLogin && (
                  <div>
                    <label htmlFor={fullNameInputId} className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-white" : "text-navy"}`}>
                      Full Name <span className="text-pink">*</span>
                    </label>
                    <input
                      id={fullNameInputId}
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className={`w-full px-4 py-3 rounded-xl text-sm transition focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 border ${
                        isDark
                          ? "bg-navy/60 border-border text-white placeholder-muted"
                          : "bg-sand/30 border-sand text-navy placeholder-muted"
                      }`}
                    />
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label htmlFor={emailInputId} className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-white" : "text-navy"}`}>
                    Email Address <span className="text-pink">*</span>
                  </label>
                  <input
                    id={emailInputId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className={`w-full px-4 py-3 rounded-xl text-sm transition focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 border ${
                      isDark
                        ? "bg-navy/60 border-border text-white placeholder-muted"
                        : "bg-sand/30 border-sand text-navy placeholder-muted"
                    }`}
                  />
                </div>

                {/* Registration: Phone Number with Country Code Dropdown */}
                {!isLogin && (
                  <div>
                    <label htmlFor={phoneInputId} className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-white" : "text-navy"}`}>
                      Phone Number <span className="text-pink">*</span>
                    </label>
                    <div className="relative flex rounded-xl shadow-sm">
                      <button
                        type="button"
                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        className={`flex items-center gap-2 px-3.5 py-3 rounded-l-xl text-sm font-semibold border border-r-0 transition focus:outline-none ${
                          isDark
                            ? "bg-navy/90 border-border text-white hover:bg-navy"
                            : "bg-sand/50 border-sand text-navy hover:bg-sand/70"
                        }`}
                      >
                        <span>{selectedCountry.flag}</span>
                        <span className="text-xs">{selectedCountry.code}</span>
                        <span className="text-muted text-[10px]">▼</span>
                      </button>

                      {showCountryDropdown && (
                        <div className={`absolute top-full left-0 z-30 mt-1 w-64 rounded-2xl shadow-2xl py-2 max-h-56 overflow-y-auto border ${
                          isDark ? "bg-[#24243e] border-border text-white" : "bg-white border-sand text-navy"
                        }`}>
                          {COUNTRIES.map((c, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowCountryDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left flex items-center justify-between text-xs transition ${
                                isDark ? "hover:bg-brand/20" : "hover:bg-brand/10"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </div>
                              <span className="font-bold text-brand">{c.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <input
                        id={phoneInputId}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="Phone number"
                        required
                        className={`w-full px-4 py-3 rounded-r-xl text-sm transition focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 border ${
                          isDark
                            ? "bg-navy/60 border-border text-white placeholder-muted"
                            : "bg-sand/30 border-sand text-navy placeholder-muted"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor={passwordInputId} className={`block text-xs font-semibold ${isDark ? "text-white" : "text-navy"}`}>
                        Password <span className="text-pink">*</span>
                      </label>
                      {!isLogin && (
                        <button
                          type="button"
                          onClick={() => setShowPolicyTooltip(!showPolicyTooltip)}
                          className="w-4 h-4 rounded-full bg-brand/20 text-brand text-[10px] font-bold flex items-center justify-center hover:bg-brand/30"
                          title="View Password Guidelines"
                        >
                          i
                        </button>
                      )}
                    </div>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs font-medium text-brand hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  {!isLogin && showPolicyTooltip && (
                    <div className={`mb-2 p-3 rounded-xl text-[11px] space-y-1 border ${
                      isDark ? "bg-navy/80 border-border text-white/80" : "bg-cream border-sand text-navy/80"
                    }`}>
                      <p className="font-bold text-brand">Password Requirements:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted">
                        <li>Minimum of 8 characters</li>
                        <li>Uppercase & lowercase letters</li>
                        <li>At least one number (0-9)</li>
                        <li>At least one special character (!, $, #, %, @, etc.)</li>
                      </ul>
                    </div>
                  )}

                  <div className="relative">
                    <input
                      id={passwordInputId}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className={`w-full px-4 py-3 rounded-xl text-sm pr-11 transition focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 border ${
                        isDark
                          ? "bg-navy/60 border-border text-white placeholder-muted"
                          : "bg-sand/30 border-sand text-navy placeholder-muted"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white p-1"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {!isLogin && password && (
                    <div className="mt-2 space-y-1">
                      <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-navy" : "bg-sand"}`}>
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className={`font-semibold ${passwordStrength.text}`}>
                          {passwordStrength.label}
                        </span>
                        <span className="text-muted">Min. 8 characters</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration: Confirm Password */}
                {!isLogin && (
                  <div>
                    <label htmlFor={confirmPasswordInputId} className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-white" : "text-navy"}`}>
                      Confirm Password <span className="text-pink">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id={confirmPasswordInputId}
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className={`w-full px-4 py-3 rounded-xl text-sm pr-11 transition focus:outline-none focus:ring-2 border ${
                          !passwordsMatch
                            ? "border-pink focus:ring-pink/30"
                            : isDark
                            ? "bg-navy/60 border-border text-white placeholder-muted focus:border-brand focus:ring-brand/30"
                            : "bg-sand/30 border-sand text-navy placeholder-muted focus:border-brand focus:ring-brand/30"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-white p-1"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {!passwordsMatch && (
                      <p className="text-pink text-xs mt-1">Passwords do not match.</p>
                    )}
                  </div>
                )}

                {/* Checkbox */}
                {isLogin ? (
                  <div className="flex items-center">
                    <input
                      id={rememberMeInputId}
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-brand rounded border-border focus:ring-brand"
                    />
                    <label htmlFor={rememberMeInputId} className="ml-2 text-xs text-muted select-none cursor-pointer">
                      Remember me on this device
                    </label>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <input
                      id={termsInputId}
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-brand rounded border-border focus:ring-brand"
                    />
                    <label htmlFor={termsInputId} className="ml-2 text-xs text-muted select-none cursor-pointer">
                      I accept the telemetry privacy and health data conditions.
                    </label>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand hover:bg-brand/90 active:scale-[0.99] text-white font-semibold py-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing telemetry...</span>
                    </>
                  ) : (
                    <span>{isLogin ? "Sign In to Telemetry" : "Create Telemetry Account"}</span>
                  )}
                </button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${isDark ? "border-border" : "border-sand"}`} />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className={`px-3 font-medium text-muted ${isDark ? "bg-[#202038]" : "bg-white"}`}>
                      or continue with
                    </span>
                  </div>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full border py-3 rounded-xl font-semibold transition duration-150 flex items-center justify-center gap-3 text-sm disabled:opacity-50 ${
                    isDark
                      ? "bg-navy/50 border-border text-white hover:bg-navy"
                      : "bg-sand/30 border-sand text-navy hover:bg-sand/60"
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className={`mt-6 pt-5 border-t text-center text-xs text-muted ${isDark ? "border-border" : "border-sand"}`}>
                {isLogin ? (
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="font-bold text-brand hover:underline"
                    >
                      Create account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="font-bold text-brand hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl shadow-2xl p-6 border ${
                isDark ? "bg-[#202038] border-border text-white" : "bg-white border-sand text-navy"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <h3 className="text-lg font-bold text-brand">Reset Credentials</h3>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="text-muted hover:text-white font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {forgotSubmitted ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-ok/20 text-ok rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-bold">Instructions Sent</h4>
                  <p className="text-xs text-muted">
                    If an account exists with <span className="font-semibold text-white">{forgotEmail}</span>, recovery instructions have been sent.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                  <p className="text-xs text-muted">
                    Enter your registered email address to receive password reset instructions.
                  </p>
                  <div>
                    <label htmlFor={forgotEmailInputId} className="block text-xs font-semibold mb-1">
                      Email Address
                    </label>
                    <input
                      id={forgotEmailInputId}
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl text-sm transition focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 border ${
                        isDark ? "bg-navy/70 border-border text-white" : "bg-sand/30 border-sand text-navy"
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
                        isDark ? "bg-navy border border-border text-muted hover:text-white" : "bg-sand/50 text-navy"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 text-xs font-bold text-white bg-brand hover:bg-brand/90 rounded-xl shadow-lg transition"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App UI Footer */}
      <footer className={`border-t py-4 text-xs transition-colors ${
        isDark ? "bg-navy/90 border-border text-muted" : "bg-cream border-sand text-muted"
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Axelle Cardio • Clinical Telemetry</span>
          <div className="flex items-center gap-4 text-xs">
            <span>Encrypted on device</span>
            <span>•</span>
            <span>Appwrite Cloud Connected</span>
            <span>•</span>
            <span>100% Free</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
