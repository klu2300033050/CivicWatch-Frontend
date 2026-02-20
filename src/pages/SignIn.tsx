import React, { useState } from "react";
import { Eye, EyeOff, MapPin, Shield, User, Sun, Moon } from "lucide-react";
import civicWatchLogo from "../assets/civicwatch.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { useLoader } from "../contexts/LoaderContext";
import { useThemeColors } from "../hooks/useThemeColors";
import { useTheme } from "../contexts/ThemeContext";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [citizenForm, setCitizenForm] = useState({ email: "", password: "" });
  const [adminForm, setAdminForm] = useState({ email: "", password: "", adminAccessCode: "" });
  const [activeTab, setActiveTab] = useState<"citizen" | "admin">("citizen");

  const navigate = useNavigate();
  const { login } = useAuth();
  const { showLoader, hideLoader } = useLoader();
  const tc = useThemeColors();
  const { theme, toggleTheme } = useTheme();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    showLoader();
    const minLoader = new Promise(r => setTimeout(r, 2000));
    try {
      let result: boolean;
      if (activeTab === "citizen") {
        result = await Promise.all([login(citizenForm.email, citizenForm.password, "citizen"), minLoader]).then(([r]) => r);
      } else {
        result = await Promise.all([login(adminForm.email, adminForm.password, "admin", adminForm.adminAccessCode), minLoader]).then(([r]) => r);
      }
      if (result === true) {
        toast.success("Sign In Successful!", { description: activeTab === "citizen" ? "Welcome back!" : "Welcome back, Administrator!" });
        navigate(activeTab === "citizen" ? "/citizen" : "/admin", { replace: true });
      } else {
        toast.error("Sign In Failed!", { description: "Invalid credentials" });
        hideLoader();
      }
    } catch (e) {
      console.error(e);
      toast.error("Sign In Failed!", { description: "Something went wrong" });
      hideLoader();
    }
  };

  const tabs = [
    { id: "citizen" as const, label: "Citizen", icon: User },
    { id: "admin" as const, label: "Administrator", icon: Shield },
  ];

  // Shared input style
  const inp = {
    background: tc.inputBg,
    borderColor: tc.inputBorder,
    color: tc.textPri,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden civic-hero-bg">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f5a623 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #2563b0 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px),
                              linear-gradient(90deg, ${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />
      </div>

      {/* Theme toggle — top right */}
      <button onClick={toggleTheme} aria-label="Toggle theme"
        className="fixed top-5 right-5 w-10 h-10 rounded-xl flex items-center justify-center
                   z-50 transition-all duration-300 theme-toggle-btn">
        {theme === "dark"
          ? <Sun className="h-4 w-4" style={{ color: "#f5a623" }} />
          : <Moon className="h-4 w-4" style={{ color: "#1e4d8c" }} />}
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center mb-8 group">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg
                          group-hover:opacity-80 transition-all duration-300"
            style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}` }}>
            <img src={civicWatchLogo} alt="CivicWatch" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-bold">
            <span style={{ color: tc.textPri }}>Civic</span>
            <span style={{ color: "#f5a623" }}>Watch</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: tc.textMuted }}>Transparency & Action</p>
        </Link>

        {/* Card */}
        <div className="glass-card rounded-3xl overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-6" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
            <h2 className="text-2xl font-bold text-center" style={{ color: tc.textPri }}>Welcome Back</h2>
            <p className="text-sm text-center mt-1" style={{ color: tc.textMuted }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Tab switcher */}
          <div className="px-8 pt-6">
            <div className="flex rounded-xl p-1" style={{ background: tc.cardInner, border: `1px solid ${tc.cardBorder}` }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4
                               rounded-lg text-sm font-medium transition-all duration-300
                               ${activeTab === tab.id ? "bg-[#f5a623] text-slate-900 shadow-md" : ""}`}
                  style={activeTab !== tab.id ? { color: tc.textMuted } : {}}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 pt-4">
            <AnimatePresence mode="wait">
              {activeTab === "citizen" && (
                <motion.form key="citizen"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                  onSubmit={handleSignIn} className="space-y-5 mt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="citizen-email" className="text-sm font-medium" style={{ color: tc.textLabel }}>
                      Email Address
                    </Label>
                    <Input id="citizen-email" type="email" required placeholder="you@example.com"
                      value={citizenForm.email}
                      onChange={e => setCitizenForm({ ...citizenForm, email: e.target.value })}
                      className="h-11 rounded-xl focus:border-[#f5a623]"
                      style={inp} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="citizen-password" className="text-sm font-medium" style={{ color: tc.textLabel }}>
                      Password
                    </Label>
                    <div className="relative">
                      <Input id="citizen-password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                        value={citizenForm.password}
                        onChange={e => setCitizenForm({ ...citizenForm, password: e.target.value })}
                        className="h-11 rounded-xl pr-12 focus:border-[#f5a623]"
                        style={inp} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: tc.textSubtle }}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit"
                    className="w-full civic-amber-gradient border-0 text-slate-900 font-bold h-11 rounded-xl
                               hover:opacity-90 transition-opacity text-base mt-2">
                    Sign In as Citizen
                  </Button>
                </motion.form>
              )}

              {activeTab === "admin" && (
                <motion.form key="admin"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}
                  onSubmit={handleSignIn} className="space-y-5 mt-2">
                  {[
                    { id: "admin-email", label: "Admin Email", type: "email", field: "email", placeholder: "admin@civicwatch.com" },
                    { id: "admin-password", label: "Password", type: "password", field: "password", placeholder: "••••••••", hasToggle: true },
                    { id: "admin-code", label: "Admin Access Code", type: "password", field: "adminAccessCode", placeholder: "Enter admin code" },
                  ].map(f => (
                    <div key={f.id} className="space-y-1.5">
                      <Label htmlFor={f.id} className="text-sm font-medium" style={{ color: tc.textLabel }}>
                        {f.label}
                      </Label>
                      <div className="relative">
                        <Input id={f.id} required placeholder={f.placeholder}
                          type={f.hasToggle ? (showPassword ? "text" : "password") : f.type}
                          value={(adminForm as any)[f.field]}
                          onChange={e => setAdminForm({ ...adminForm, [f.field]: e.target.value })}
                          className={`h-11 rounded-xl focus:border-[#f5a623] ${f.hasToggle ? "pr-12" : ""}`}
                          style={inp} />
                        {f.hasToggle && (
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: tc.textSubtle }}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button type="submit"
                    className="w-full civic-amber-gradient border-0 text-slate-900 font-bold h-11 rounded-xl
                               hover:opacity-90 transition-opacity text-base mt-2">
                    Sign In as Administrator
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer links */}
            <div className="mt-6 pt-5 text-center space-y-2" style={{ borderTop: `1px solid ${tc.cardBorder}` }}>
              <p className="text-sm" style={{ color: tc.textMuted }}>
                Don't have an account?{" "}
                <Link to="/signup" className="font-medium transition-colors hover:opacity-80" style={{ color: "#f5a623" }}>
                  Sign up here
                </Link>
              </p>
              <Link to="/"
                className="inline-flex items-center gap-1 text-sm transition-colors hover:opacity-80"
                style={{ color: tc.textSubtle }}>
                <MapPin className="h-3 w-3" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
