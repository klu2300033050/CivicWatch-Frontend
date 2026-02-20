import React, { useState } from "react";
import {
  Eye, EyeOff, MapPin, Sun, Moon,
  Wrench, Trash2, TreeDeciduous, ShieldAlert,
  Info, HelpCircle, User, Shield
} from "lucide-react";
import civicWatchLogo from "../assets/civicwatch.png";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Label } from "../components/ui/label.tsx";
import { Input } from "../components/ui/input.tsx";
import { Button } from "../components/ui/button.tsx";
import { Checkbox } from "../components/ui/checkbox.tsx";
import { motion, AnimatePresence } from "framer-motion";
import { VITE_BACKEND_URL } from "../config/config.tsx";
import { useThemeColors } from "../hooks/useThemeColors";
import { useTheme } from "../contexts/ThemeContext";

const DEPARTMENTS = [
  { value: "Public Works", label: "Public Works", icon: Wrench },
  { value: "Sanitation", label: "Sanitation", icon: Trash2 },
  { value: "Environment", label: "Environment", icon: TreeDeciduous },
  { value: "Utilities", label: "Utilities", icon: Info },
  { value: "Public Safety", label: "Public Safety", icon: ShieldAlert },
  { value: "Other", label: "Other", icon: HelpCircle },
];

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const tc = useThemeColors();
  const { theme, toggleTheme } = useTheme();

  const [citizenForm, setCitizenForm] = useState({
    fullName: "",
    email: "",
    phonenumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    email: "",
    phonenumber: "",
    department: "Public Works",
    adminAccessCode: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [otherDept, setOtherDept] = useState("");
  const [citizenErrors, setCitizenErrors] = useState<Record<string, string>>({});
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"citizen" | "admin">("citizen");
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleCitizenSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCitizenErrors({});
    if (!validatePassword(citizenForm.password)) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (citizenForm.password !== citizenForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!citizenForm.agreeToTerms) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }
    if (citizenForm.phonenumber.trim().length !== 10 || !/^\d{10}$/.test(citizenForm.phonenumber.trim())) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/v1/citizen/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: citizenForm.fullName,
          email: citizenForm.email,
          password: citizenForm.password,
          phonenumber: citizenForm.phonenumber,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Registration Successful! You can now sign in.");
        navigate("/signin");
      } else if (data.errors && Array.isArray(data.errors)) {
        const errs: Record<string, string> = {};
        data.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) errs[err.path[0]] = err.message;
        });
        setCitizenErrors(errs);
      } else {
        toast.error(data.message || "Something went wrong! Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
      console.error(error);
    }
  };

  const handleAdminSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminErrors({});
    if (!validatePassword(adminForm.password)) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!adminForm.agreeToTerms) {
      toast.error("Please agree to the terms and conditions.");
      return;
    }

    const finalDept = adminForm.department === "Other" && otherDept.trim()
      ? `Other – ${otherDept.trim()}`
      : adminForm.department;

    if (!adminForm.fullName.trim() || !adminForm.email.trim() || !adminForm.phonenumber.trim()
      || !finalDept.trim() || !adminForm.adminAccessCode.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (adminForm.phonenumber.trim().length !== 10 || !/^\d{10}$/.test(adminForm.phonenumber.trim())) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }
    if (!/^\d{4,}$/.test(adminForm.adminAccessCode)) {
      toast.error("Admin access code must be at least 4 digits.");
      return;
    }
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/api/v1/admin/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: adminForm.fullName,
          email: adminForm.email,
          password: adminForm.password,
          phonenumber: adminForm.phonenumber,
          department: finalDept,
          adminAccessCode: Number(adminForm.adminAccessCode.trim()),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Admin Registration Successful! Pending approval.");
        navigate("/signin");
      } else if (data.errors && Array.isArray(data.errors)) {
        const errs: Record<string, string> = {};
        data.errors.forEach((err: any) => {
          if (err.path && err.path.length > 0) errs[err.path[0]] = err.message;
        });
        setAdminErrors(errs);
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
      console.error(error);
    }
  };

  /* ───── Shared Styles ───── */
  const inpStyle = {
    background: tc.inputBg,
    borderColor: tc.inputBorder,
    color: tc.textPri,
  };
  const labelStyle = { color: tc.textLabel };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden civic-hero-bg">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#f5a623 0%,transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8"
          style={{ background: "radial-gradient(circle,#2563b0 0%,transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px),
                              linear-gradient(90deg, ${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
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

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center mb-6 group">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg
                          group-hover:opacity-80 transition-all duration-300"
            style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}` }}>
            <img src={civicWatchLogo} alt="CivicWatch" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-2xl font-bold">
            <span style={{ color: tc.textPri }}>Civic</span>
            <span style={{ color: "#f5a623" }}>Watch</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: tc.textMuted }}>Transparency & Action</p>
        </Link>

        {/* Card */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="px-7 pt-7 pb-5" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
            <h2 className="text-xl font-bold text-center" style={{ color: tc.textPri }}>Create Account</h2>
            <p className="text-sm text-center mt-1" style={{ color: tc.textMuted }}>
              Join our community to report issues and help build better cities
            </p>
          </div>

          {/* Tab switcher */}
          <div className="px-7 pt-5 pb-2">
            <div className="flex rounded-xl p-1" style={{ background: tc.cardInner, border: `1px solid ${tc.cardBorder}` }}>
              {[
                { id: "citizen", label: "Citizen", icon: User },
                { id: "admin", label: "Administrator", icon: Shield },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "citizen" | "admin")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium
                               transition-all duration-300
                               ${activeTab === tab.id
                      ? "bg-[#f5a623] text-slate-900 shadow-md"
                      : ""
                    }`}
                  style={activeTab !== tab.id ? { color: tc.textMuted } : {}}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Forms */}
          <div className="px-7 pb-7">
            <AnimatePresence mode="wait">
              {/* ── Citizen form ── */}
              {activeTab === "citizen" && (
                <motion.form
                  key="citizen"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleCitizenSignUp}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="c-name" className="text-sm font-medium" style={labelStyle}>Full Name</Label>
                    <Input id="c-name" placeholder="John Doe" value={citizenForm.fullName}
                      onChange={(e) => setCitizenForm({ ...citizenForm, fullName: e.target.value })}
                      required className="h-11 rounded-xl focus:border-[#f5a623]" style={inpStyle} />
                    {citizenErrors.fullName && <p className="text-red-400 text-xs">{citizenErrors.fullName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-email" className="text-sm font-medium" style={labelStyle}>Email</Label>
                    <Input id="c-email" type="email" placeholder="citizen@example.com" value={citizenForm.email}
                      onChange={(e) => setCitizenForm({ ...citizenForm, email: e.target.value })}
                      required className="h-11 rounded-xl focus:border-[#f5a623]" style={inpStyle} />
                    {citizenErrors.email && <p className="text-red-400 text-xs">{citizenErrors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-phone" className="text-sm font-medium" style={labelStyle}>Phone Number</Label>
                    <Input id="c-phone" type="tel" placeholder="0123456789" value={citizenForm.phonenumber}
                      onChange={(e) => setCitizenForm({ ...citizenForm, phonenumber: e.target.value })}
                      required className="h-11 rounded-xl focus:border-[#f5a623]" style={inpStyle} />
                    {citizenErrors.phonenumber && <p className="text-red-400 text-xs">{citizenErrors.phonenumber}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-pw" className="text-sm font-medium" style={labelStyle}>Password</Label>
                    <div className="relative">
                      <Input id="c-pw" type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password" value={citizenForm.password}
                        onChange={(e) => setCitizenForm({ ...citizenForm, password: e.target.value })}
                        required className="h-11 rounded-xl focus:border-[#f5a623] pr-12" style={inpStyle} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: tc.textSubtle }}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {citizenErrors.password && <p className="text-red-400 text-xs">{citizenErrors.password}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-cpw" className="text-sm font-medium" style={labelStyle}>Confirm Password</Label>
                    <div className="relative">
                      <Input id="c-cpw" type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password" value={citizenForm.confirmPassword}
                        onChange={(e) => setCitizenForm({ ...citizenForm, confirmPassword: e.target.value })}
                        required className="h-11 rounded-xl focus:border-[#f5a623] pr-12" style={inpStyle} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: tc.textSubtle }}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="c-terms" checked={citizenForm.agreeToTerms}
                      onCheckedChange={(v) => setCitizenForm({ ...citizenForm, agreeToTerms: v as boolean })} />
                    <Label htmlFor="c-terms" className="text-sm" style={{ color: tc.textSubtle }}>
                      I agree to the{" "}
                      <Link to="/terms" className="text-[#f5a623] hover:underline">Terms and Conditions</Link>
                    </Label>
                  </div>
                  <Button type="submit"
                    className="w-full civic-amber-gradient border-0 text-slate-900 font-bold h-11 rounded-xl hover:opacity-90">
                    Create Citizen Account
                  </Button>
                </motion.form>
              )}

              {/* ── Admin form ── */}
              {activeTab === "admin" && (
                <motion.form
                  key="admin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleAdminSignUp}
                  className="space-y-4 mt-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="a-name" className="text-sm font-medium" style={labelStyle}>Full Name</Label>
                    <Input id="a-name" placeholder="Full name" value={adminForm.fullName}
                      onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                      required className="h-11 rounded-xl focus:border-[#f5a623]" style={inpStyle} />
                    {adminErrors.fullName && <p className="text-red-400 text-xs">{adminErrors.fullName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="a-email" className="text-sm font-medium" style={labelStyle}>Official Email</Label>
                    <Input id="a-email" type="email" placeholder="admin@city.gov" value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required className="h-11 rounded-xl focus:border-[#f5a623]" style={inpStyle} />
                    {adminErrors.email && <p className="text-red-400 text-xs">{adminErrors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="a-phone" className="text-sm font-medium" style={labelStyle}>Phone Number</Label>
                    <Input id="a-phone" type="tel" placeholder="0123456789" value={adminForm.phonenumber}
                      onChange={(e) => setAdminForm({ ...adminForm, phonenumber: e.target.value })}
                      required className="h-11 rounded-xl focus:border-[#f5a623]" style={inpStyle} />
                    {adminErrors.phonenumber && <p className="text-red-400 text-xs">{adminErrors.phonenumber}</p>}
                  </div>

                  {/* Department (Selection Tiles) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium" style={labelStyle}>Department <span style={{ color: "#f5a623" }}>*</span></Label>
                    <div className="grid grid-cols-2 gap-2">
                      {DEPARTMENTS.map(dept => {
                        const Icon = dept.icon;
                        const active = adminForm.department === dept.value;
                        return (
                          <button
                            key={dept.value}
                            type="button"
                            onClick={() => {
                              setAdminForm({ ...adminForm, department: dept.value });
                              if (dept.value !== "Other") setOtherDept("");
                            }}
                            className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-all duration-200"
                            style={{
                              background: active
                                ? (tc.dark ? "rgba(245,166,35,0.15)" : "rgba(245,166,35,0.10)")
                                : tc.pageBadgeBg,
                              border: `1px solid ${active ? "rgba(245,166,35,0.50)" : tc.cardBorder}`,
                            }}
                          >
                            <Icon className="h-4 w-4" style={{ color: active ? "#f5a623" : tc.textSubtle }} />
                            <span className="text-xs font-medium" style={{ color: active ? (tc.dark ? "#fff" : "#1e293b") : tc.textMuted }}>
                              {dept.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* "Other" Department Field */}
                    <AnimatePresence>
                      {adminForm.department === "Other" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <Label htmlFor="other-dept" className="text-xs font-semibold" style={labelStyle}>
                            Please specify Department <span style={{ color: "#f5a623" }}>*</span>
                          </Label>
                          <Input
                            id="other-dept"
                            placeholder="e.g. Legal, HR, Finance..."
                            value={otherDept}
                            onChange={(e) => setOtherDept(e.target.value)}
                            className="h-10 rounded-xl focus:border-[#f5a623]"
                            style={inpStyle}
                            required
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {adminErrors.department && <p className="text-red-400 text-xs">{adminErrors.department}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="a-code" className="text-sm font-medium" style={labelStyle}>Admin Access Code</Label>
                    <Input id="a-code" placeholder="Contact your supervisor" value={adminForm.adminAccessCode}
                      onChange={(e) => setAdminForm({ ...adminForm, adminAccessCode: e.target.value })}
                      required className="h-11 rounded-xl focus:border-[#f5a623]" style={inpStyle} />
                    {adminErrors.adminAccessCode && <p className="text-red-400 text-xs">{adminErrors.adminAccessCode}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="a-pw" className="text-sm font-medium" style={labelStyle}>Password</Label>
                    <div className="relative">
                      <Input id="a-pw" type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password" value={adminForm.password}
                        onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                        required className="h-11 rounded-xl focus:border-[#f5a623] pr-12" style={inpStyle} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: tc.textSubtle }}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="a-cpw" className="text-sm font-medium" style={labelStyle}>Confirm Password</Label>
                    <div className="relative">
                      <Input id="a-cpw" type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password" value={adminForm.confirmPassword}
                        onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                        required className="h-11 rounded-xl focus:border-[#f5a623] pr-12" style={inpStyle} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: tc.textSubtle }}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="a-terms" checked={adminForm.agreeToTerms}
                      onCheckedChange={(v) => setAdminForm({ ...adminForm, agreeToTerms: v as boolean })} />
                    <Label htmlFor="a-terms" className="text-sm" style={{ color: tc.textSubtle }}>
                      I agree to the{" "}
                      <Link to="/terms" className="text-[#f5a623] hover:underline">Terms and Conditions</Link>
                    </Label>
                  </div>
                  <Button type="submit"
                    className="w-full civic-amber-gradient border-0 text-slate-900 font-bold h-11 rounded-xl hover:opacity-90">
                    Create Admin Account
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer links */}
            <div className="mt-6 pt-5 text-center space-y-2" style={{ borderTop: `1px solid ${tc.cardBorder}` }}>
              <p className="text-sm" style={{ color: tc.textMuted }}>
                Already have an account?{" "}
                <Link to="/signin" className="font-medium transition-colors hover:opacity-80" style={{ color: "#f5a623" }}>
                  Sign in here
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

export default SignUp;
