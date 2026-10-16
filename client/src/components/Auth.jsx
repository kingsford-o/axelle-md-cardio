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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPolicyTooltip, setShowPolicyTooltip] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const emailInputId = useId();
  const passwordInputId = useId();
  const fullNameInputId = useId();
  const phoneInputId = useId();
  const confirmPasswordInputId = useId();
  const rememberMeInputId = useId();
  const termsInputId = useId();
  const forgotEmailInputId = useId();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", percent: 0, color: "bg-slate-400" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", percent: 25, color: "bg-rose-400", text: "text-rose-400" };
    if (score <= 4) return { score: 2, label: "Moderate", percent: 65, color: "bg-amber-400", text: "text-amber-400" };
    return { score: 3, label: "Strong", percent: 100, color: "bg-emerald-500", text: "text-emerald-500" };
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
      if (!fullName.trim()) return setError("Please enter your full name.");
      if (!phoneNumber.trim()) return setError("Please enter a valid phone number.");
      if (password.length < 8) return setError("Password must be at least 8 characters long.");
      if (password !== confirmPassword) return setError("Passwords do not match.");
      if (!acceptTerms) return setError("You must accept the terms to continue.");
    }

    setLoading(true);
    try {
      if (isLogin) {
        await account.createEmailPasswordSession(email.trim(), password);
        const user = await account.get();
        if (user) onSuccess(user);
      } else {
        const newUserId = ID.unique();
        await account.create(newUserId, email.trim(), password, fullName.trim());
        await account.createEmailPasswordSession(email.trim(), password);
        const user = await account.get();

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

        setSuccessMessage("Account created. Redirecting...");
        setTimeout(() => { if (user) onSuccess(user); }, 600);
      }
    } catch (err) {
      setError(err.message || "Authentication error. Please try again.");
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
      setSuccessMessage("Password reset instructions sent.");
    }, 1800);
  };

  const inputClass = `w-full px-4 py-3 rounded-lg text-sm transition outline-none border ${
    isDark
      ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-500 focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
      : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
  }`;

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col selection:bg-slate-900 selection:text-white ${
      isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"
    }`}>
      
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 right-4 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          isDark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"
        }`}
        title="Toggle theme"
      >
        {isDark ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          
          {/* Branding + animated heart */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <motion.div
                animate={{ scale: [1, 1.18, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                <svg
                  className={`w-4 h-4 ${isDark ? "text-rose-400" : "text-rose-500"}`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
              <span className={`text-xs font-medium tracking-wide uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Axelle MD Cardio
              </span>
            </div>
            <h1 className={`text-2xl font-semibold tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {isLogin
                ? "Sign in to continue your wellness journey."
                : "Start tracking your cardiovascular health."}
            </p>
          </motion.div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-5 p-3 rounded-lg text-xs border ${
                isDark ? "bg-rose-950/50 border-rose-900 text-rose-300" : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {error}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-5 p-3 rounded-lg text-xs border ${
                isDark ? "bg-emerald-950/50 border-emerald-900 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {successMessage}
            </motion.div>
          )}

          {/* Auth form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onSubmit={handleAuth}
            className="space-y-4"
          >
            {!isLogin && (
              <div>
                <label htmlFor={fullNameInputId} className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Full name
                </label>
                <input
                  id={fullNameInputId}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label htmlFor={emailInputId} className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Email
              </label>
              <input
                id={emailInputId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className={inputClass}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor={phoneInputId} className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Phone number
                </label>
                <div className="relative flex">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className={`flex items-center gap-1.5 px-3 rounded-l-lg text-sm border border-r-0 transition ${
                      isDark
                        ? "bg-slate-900/50 border-slate-800 text-white hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="text-xs font-medium">{selectedCountry.code}</span>
                  </button>

                  {showCountryDropdown && (
                    <div className={`absolute top-full left-0 z-30 mt-1 w-64 rounded-lg shadow-lg py-1 max-h-56 overflow-y-auto border ${
                      isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                    }`}>
                      {COUNTRIES.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setSelectedCountry(c); setShowCountryDropdown(false); }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition ${
                            isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </div>
                          <span className={`font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{c.code}</span>
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
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <label htmlFor={passwordInputId} className={`block text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    Password
                  </label>
                  {!isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowPolicyTooltip(!showPolicyTooltip)}
                      className={`w-3.5 h-3.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                        isDark ? "bg-slate-800 text-slate-400 hover:bg-slate-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                      title="Password guidelines"
                    >
                      i
                    </button>
                  )}
                </div>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className={`text-xs ${isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    Forgot?
                  </button>
                )}
              </div>

              {!isLogin && showPolicyTooltip && (
                <div className={`mb-2 p-2.5 rounded-lg text-[11px] border ${
                  isDark ? "bg-slate-900/50 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  Min. 8 characters, with uppercase, lowercase, number & symbol.
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
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>

              {!isLogin && password && (
                <div className="mt-2 space-y-1">
                  <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                  <p className={`text-[11px] ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor={confirmPasswordInputId} className={`block text-xs font-medium mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id={confirmPasswordInputId}
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className={`${inputClass} pr-11 ${!passwordsMatch ? "border-rose-400 focus:border-rose-400 focus:ring-rose-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                {!passwordsMatch && (
                  <p className="text-rose-400 text-[11px] mt-1">Passwords do not match.</p>
                )}
              </div>
            )}

            <div className="flex items-start pt-1">
              <input
                id={isLogin ? rememberMeInputId : termsInputId}
                type="checkbox"
                checked={isLogin ? rememberMe : acceptTerms}
                onChange={(e) => isLogin ? setRememberMe(e.target.checked) : setAcceptTerms(e.target.checked)}
                className={`w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500 ${
                  isDark ? "bg-slate-900 border-slate-700" : ""
                }`}
              />
              <label
                htmlFor={isLogin ? rememberMeInputId : termsInputId}
                className={`ml-2 text-[11px] select-none cursor-pointer ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                {isLogin ? "Remember me" : "I accept the privacy & health data terms."}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                isDark
                  ? "bg-white text-slate-900 hover:bg-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
                  <span>Please wait...</span>
                </>
              ) : (
                <span>{isLogin ? "Sign in" : "Create account"}</span>
              )}
            </button>

            <div className={`text-center text-xs pt-4 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(""); setSuccessMessage(""); }}
                className={`font-medium ${isDark ? "text-white hover:underline" : "text-slate-900 hover:underline"}`}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </motion.form>
        </div>
      </main>

      {/* Forgot password modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`w-full max-w-sm rounded-2xl shadow-xl p-6 border ${
                isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-sm font-semibold">Reset password</h3>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className={`text-lg leading-none ${isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
                >
                  ✕
                </button>
              </div>

              {forgotSubmitted ? (
                <div className="py-6 text-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                    isDark ? "bg-emerald-950 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    ✓
                  </div>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Instructions sent to {forgotEmail}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Enter your email and we'll send recovery instructions.
                  </p>
                  <input
                    id={forgotEmailInputId}
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className={inputClass}
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className={`flex-1 py-2.5 text-xs font-medium rounded-lg border transition ${
                        isDark ? "border-slate-800 text-slate-400 hover:text-white" : "border-slate-200 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition ${
                        isDark ? "bg-white text-slate-900 hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      Send link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className={`py-6 text-center ${isDark ? "text-slate-600" : "text-slate-400"}`}>
        <p className="text-[11px]">
          © {new Date().getFullYear()} Axelle MD Cardio · Encrypted on device
        </p>
      </footer>
    </div>
  );
}