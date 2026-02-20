import { useCallback, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  ArrowLeft, MapPin, Upload, Send,
  Construction, Trash2, TreeDeciduous, Wrench,
  ShieldAlert, HelpCircle, Sun, Moon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MapComponent from "../components/MapBox";
import { toast } from "sonner";
import { VITE_BACKEND_URL } from "../config/config";
import { useThemeColors } from "../hooks/useThemeColors";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const ISSUE_TYPES = [
  { value: "Road Infrastructure", label: "Road Infrastructure", icon: Construction },
  { value: "Waste Management", label: "Waste Management", icon: Trash2 },
  { value: "Environmental Issues", label: "Environmental Issues", icon: TreeDeciduous },
  { value: "Utilities & Infrastructure", label: "Utilities & Infrastructure", icon: Wrench },
  { value: "Public Safety", label: "Public Safety", icon: ShieldAlert },
  { value: "Other", label: "Other", icon: HelpCircle },
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const tc = useThemeColors();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    title: "",
    issueDescription: "",
    issueLocation: "",
    issueType: "Road Infrastructure",
    location: { address: "", latitude: null as number | null, longitude: null as number | null },
  });
  const [otherIssueType, setOtherIssueType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleLocationSelect = useCallback((lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      location: { address, latitude: lat, longitude: lng },
      issueLocation: address,
    }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.issueDescription || !formData.location.address) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) { toast.error("You must be logged in"); return; }

      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.issueDescription);
      // If "Other" append the custom description the user typed
      const finalIssueType =
        formData.issueType === "Other" && otherIssueType.trim()
          ? `Other – ${otherIssueType.trim()}`
          : formData.issueType;
      data.append("issueType", finalIssueType);
      data.append("location", JSON.stringify(formData.location));
      if (selectedFile) data.append("files", selectedFile);

      const res = await fetch(`${VITE_BACKEND_URL}/api/v1/citizen/create-issue`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const result = await res.json();
      if (res.ok) { toast.success("Issue reported successfully!"); navigate("/citizen"); }
      else toast.error(result.message || "Failed to report issue");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared styles ── */
  const cardStyle = {
    background: tc.dark ? "rgba(10,22,40,0.60)" : "rgba(255,255,255,0.95)",
    border: `1px solid ${tc.cardBorder}`,
    backdropFilter: "blur(14px)",
  };
  const inputStyle = {
    background: tc.inputBg,
    borderColor: tc.inputBorder,
    color: tc.textPri,
  };
  const labelStyle = { color: tc.textLabel };

  return (
    <div className="min-h-screen civic-hero-bg">

      {/* ── Custom Header ── */}
      <header className="w-full sticky top-0 z-50 backdrop-blur-md transition-colors duration-300"
        style={{
          background: tc.dark ? "rgba(6,15,30,0.88)" : "rgba(255,255,255,0.95)",
          borderBottom: `1px solid ${tc.cardBorder}`,
        }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Back button */}
            <Link to="/citizen">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                                 transition-all duration-200"
                style={{
                  color: tc.textMuted,
                  background: tc.pageBadgeBg,
                  border: `1px solid ${tc.pageBadgeBorder}`,
                }}>
                <ArrowLeft className="h-4 w-4" style={{ color: "#f5a623" }} />
                Back to Dashboard
              </button>
            </Link>

            {/* Title */}
            <h1 className="text-xl font-bold" style={{ color: "#f5a623" }}>
              Report New Issue
            </h1>

            {/* Theme toggle */}
            <button onClick={toggleTheme} aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: tc.dark ? "rgba(255,255,255,0.07)" : "rgba(15,42,74,0.06)",
                border: `1px solid ${tc.dark ? "rgba(255,255,255,0.20)" : "rgba(15,42,74,0.18)"}`,
              }}>
              {theme === "dark"
                ? <Sun className="h-4 w-4" style={{ color: "#f5a623" }} />
                : <Moon className="h-4 w-4" style={{ color: "#1e4d8c" }} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Map Card ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl overflow-hidden h-fit shadow-xl"
            style={cardStyle}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.30)" }}>
                  <MapPin className="h-4 w-4 text-emerald-400" />
                </div>
                <h2 className="text-base font-bold" style={{ color: tc.textPri }}>
                  Select Issue Location
                </h2>
              </div>
            </div>
            <div className="p-5">
              <div className="h-96 rounded-xl overflow-hidden"
                style={{ border: `1px solid ${tc.cardBorder}` }}>
                <MapComponent onLocationSelect={handleLocationSelect} />
              </div>

              {formData.location.latitude && formData.location.longitude && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl"
                  style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.25)" }}>
                  <p className="text-sm font-semibold text-emerald-400 mb-1">📍 Location Selected</p>
                  <p className="text-xs" style={{ color: tc.textMuted }}>
                    Lat: {formData.location.latitude.toFixed(6)}, Lng: {formData.location.longitude.toFixed(6)}
                  </p>
                  {formData.location.address && (
                    <p className="text-xs mt-1 font-medium" style={{ color: tc.textPri }}>
                      {formData.location.address}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ── Form Card ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl overflow-hidden shadow-xl"
            style={cardStyle}>
            <div className="px-6 py-5" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.30)" }}>
                  <Send className="h-4 w-4" style={{ color: "#f5a623" }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: tc.textPri }}>Issue Details</h2>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold" style={labelStyle}>
                    Issue Title <span style={{ color: "#f5a623" }}>*</span>
                  </Label>
                  <Input id="title" type="text" required
                    value={formData.title}
                    onChange={e => handleInputChange("title", e.target.value)}
                    placeholder="Enter your issue title"
                    className="h-11 rounded-xl focus:border-[#f5a623]"
                    style={inputStyle} />
                </div>

                {/* Issue Type */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: tc.textLabel }}>
                      Issue Information
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold" style={labelStyle}>
                      Issue Type <span style={{ color: "#f5a623" }}>*</span>
                    </Label>
                    <RadioGroup value={formData.issueType}
                      onValueChange={v => {
                        handleInputChange("issueType", v);
                        // Clear "other" text when switching away from Other
                        if (v !== "Other") setOtherIssueType("");
                      }}
                      className="grid grid-cols-2 gap-3">
                      {ISSUE_TYPES.map(type => {
                        const Icon = type.icon;
                        const active = formData.issueType === type.value;
                        return (
                          <label key={type.value}
                            htmlFor={type.value}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer
                                       transition-all duration-200"
                            style={{
                              background: active
                                ? (tc.dark ? "rgba(245,166,35,0.15)" : "rgba(245,166,35,0.10)")
                                : tc.pageBadgeBg,
                              border: `1px solid ${active ? "rgba(245,166,35,0.50)" : tc.cardBorder}`,
                            }}>
                            <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                            <Icon className="h-4 w-4 flex-shrink-0"
                              style={{ color: active ? "#f5a623" : tc.textSubtle }} />
                            <span className="text-xs font-medium"
                              style={{ color: active ? (tc.dark ? "#fff" : "#1e293b") : tc.textMuted }}>
                              {type.label}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>

                    {/* ── "Other" custom description field ── */}
                    {formData.issueType === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-2 pt-1"
                      >
                        <Label htmlFor="otherIssueType" className="text-sm font-semibold"
                          style={labelStyle}>
                          Please describe the issue type{" "}
                          <span style={{ color: "#f5a623" }}>*</span>
                        </Label>
                        <Input
                          id="otherIssueType"
                          type="text"
                          required
                          maxLength={120}
                          value={otherIssueType}
                          onChange={e => setOtherIssueType(e.target.value)}
                          placeholder="e.g. Noise pollution, Graffiti, Illegal parking…"
                          className="h-11 rounded-xl focus:border-[#f5a623]"
                          style={inputStyle}
                        />
                        <p className="text-xs" style={{ color: tc.textSubtle }}>
                          {otherIssueType.length}/120 characters
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="issueLocation" className="text-sm font-semibold" style={labelStyle}>
                      Issue Location Address
                    </Label>
                    <Input id="issueLocation" type="text"
                      value={formData.issueLocation}
                      onChange={e => handleInputChange("issueLocation", e.target.value)}
                      placeholder="Enter or select location on map"
                      className="h-11 rounded-xl focus:border-[#f5a623]"
                      style={inputStyle} />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="issueDescription" className="text-sm font-semibold" style={labelStyle}>
                      Issue Description <span style={{ color: "#f5a623" }}>*</span>
                    </Label>
                    <Textarea id="issueDescription" required
                      value={formData.issueDescription}
                      onChange={e => handleInputChange("issueDescription", e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="min-h-[100px] rounded-xl resize-none focus:border-[#f5a623]"
                      style={inputStyle} />
                  </div>
                </div>

                {/* Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
                    <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: tc.textLabel }}>
                      Upload Media
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file" className="text-sm font-semibold" style={labelStyle}>
                      Upload Image/Video
                    </Label>
                    <div className="flex items-center gap-3">
                      <label htmlFor="file" className="flex-1">
                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer
                                        transition-all duration-200"
                          style={{
                            background: tc.inputBg,
                            border: `1px dashed ${selectedFile ? "rgba(245,166,35,0.60)" : tc.inputBorder}`,
                            color: selectedFile ? "#f5a623" : tc.textSubtle,
                          }}>
                          <span className="text-sm">
                            {selectedFile ? selectedFile.name : "Choose File   No file chosen"}
                          </span>
                          <Upload className="h-4 w-4" style={{ color: "#f5a623" }} />
                        </div>
                        <input id="file" type="file" accept="image/*,video/*"
                          onChange={handleFileChange} className="sr-only" />
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="text-xs" style={{ color: tc.textMuted }}>
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <Button type="submit" disabled={loading} size="lg"
                  className="w-full civic-amber-gradient border-0 text-slate-900 font-bold
                             h-12 rounded-xl hover:opacity-90 transition-all duration-300
                             hover:shadow-lg hover:scale-[1.01]">
                  {loading
                    ? <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Submitting…</span>
                    : <span className="flex items-center gap-2"><Send className="h-5 w-5" /> Submit Issue</span>}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ReportIssue;
