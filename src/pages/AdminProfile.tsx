import { useEffect, useState } from "react";
import { Input } from "../components/ui/input.tsx";
import { Label } from "../components/ui/label.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Separator } from "../components/ui/separator.tsx";
import {
  User, Mail, Phone, MapPin, Calendar,
  FileText, Edit, Shield, CheckCircle, Save,
  CheckCircle2, Clock, XCircle, AlertTriangle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { toast } from "sonner";
import { VITE_BACKEND_URL } from "../config/config.tsx";
import Player from "lottie-react";
import emptyAnimation from "../assets/animations/box.json";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import { motion } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";

interface Issues {
  _id: string; title: string; description: string; issueType: string;
  location: { latitude: number; longitude: number; address: string };
  createdAt: string; status: string; priority?: string;
  resolvedDate?: string | null; reportDate?: string;
  category?: string; citizenName?: string; adminResponse?: string;
}

const statusCfg: Record<string, { color: string; bg: string; border: string }> = {
  Resolved: { color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  "In Progress": { color: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  Pending: { color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  Rejected: { color: "text-red-300", bg: "bg-red-500/15", border: "border-red-500/30" },
};
const getSC = (s: string) => statusCfg[s] ?? statusCfg["Pending"];

const AdminProfile = () => {
  const { user, updateUserProfile, token, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [respondedIssues, setRespondedIssues] = useState<Issues[]>([]);
  const [loadingMyIssues, setLoadingMyIssues] = useState(true);
  const tc = useThemeColors();

  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phonenumber: user?.phonenumber || "",
    department: user?.department || "",
  });

  useEffect(() => {
    if (!token) return;
    const fetchMyIssues = async () => {
      setLoadingMyIssues(true);
      try {
        const res = await fetch(`${VITE_BACKEND_URL}/api/v1/admin/handled-issues`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (res.status === 401) { toast.error("Unauthorized! Please log in again."); return; }
        const data = await res.json();
        if (res.ok && Array.isArray(data.issues)) setRespondedIssues(data.issues);
        else toast.error(data.message || "Failed to load issues");
      } catch (e) { console.error(e); toast.error("Error loading your issues"); }
      finally { setLoadingMyIssues(false); }
    };
    fetchMyIssues();
  }, [token]);

  const handleSave = async () => {
    try {
      await updateUserProfile({ fullName: profile.fullName, email: profile.email, phonenumber: profile.phonenumber, department: profile.department });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (e) { console.error(e); toast.error("Failed to update profile"); }
  };

  if (isLoading || !user || loadingMyIssues) {
    return (
      <div className="flex items-center justify-center min-h-screen civic-hero-bg">
        <p style={{ color: tc.textMuted }}>Loading profile…</p>
      </div>
    );
  }

  const initials = profile.fullName.split(" ").map(n => n[0]).join("").toUpperCase() || "A";
  const inp = `rounded-xl text-sm h-10`;

  const statCards = [
    { label: "Total Issues Handled", value: respondedIssues.length, color: tc.textPri, icon: AlertTriangle },
    { label: "Successfully Resolved", value: respondedIssues.filter(i => i.status === "Resolved").length, color: "#34d399", icon: CheckCircle2 },
    { label: "Currently Working On", value: respondedIssues.filter(i => i.status === "In Progress").length, color: "#60a5fa", icon: Clock },
    {
      label: "Avg. Resolution Time",
      value: (() => {
        const resolved = respondedIssues.filter(i => i.resolvedDate);
        if (!resolved.length) return "0d";
        const avg = resolved.reduce((acc, i) => {
          return acc + (new Date(i.resolvedDate!).getTime() - new Date(i.reportDate ?? "").getTime()) / 86400000;
        }, 0) / resolved.length;
        return `${Math.round(avg)}d`;
      })(),
      color: "#fbbf24", icon: XCircle,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen civic-hero-bg">
      <HeaderAfterAuth />

      <div className="pt-24 container mx-auto max-w-4xl px-4 py-8 space-y-6">

        {/* ── Profile Card ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="glass-card rounded-3xl overflow-hidden">
          <div className="p-8" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold"
                  style={{ background: "rgba(245,166,35,0.2)", border: "2px solid rgba(245,166,35,0.4)", color: "#f5a623" }}>
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold" style={{ color: tc.textPri }}>Administrator Profile</h2>
                    <Shield className="h-5 w-5" style={{ color: tc.iconAmber }} />
                  </div>
                  <p className="text-sm" style={{ color: tc.textMuted }}>
                    Manage your profile and view your resolved issues
                  </p>
                </div>
              </div>
              <button
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                           transition-all duration-200 border flex-shrink-0"
                style={isEditing
                  ? { background: "#f5a623", color: "#1e293b", borderColor: "#f5a623", fontWeight: 700 }
                  : { background: tc.profileBtnBg, color: tc.textPri, borderColor: tc.profileBtnBorder }}>
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: "fullName", label: "Full Name", icon: User, field: "fullName", type: "text" },
                { id: "email", label: "Email", icon: Mail, field: "email", type: "email" },
                { id: "phone", label: "Phone Number", icon: Phone, field: "phonenumber", type: "tel" },
                { id: "dept", label: "Department", icon: Shield, field: "department", type: "text" },
              ].map(f => {
                const Icon = f.icon;
                return (
                  <div key={f.id} className="space-y-2">
                    <Label htmlFor={f.id} className="text-sm font-medium" style={{ color: tc.textLabel }}>
                      {f.label}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: tc.iconAmber }} />
                      {isEditing ? (
                        <Input id={f.id} type={f.type} className={inp}
                          value={(profile as any)[f.field]}
                          onChange={e => setProfile({ ...profile, [f.field]: e.target.value })}
                          style={{ background: tc.inputBg, borderColor: tc.inputBorder, color: tc.textPri }} />
                      ) : (
                        <span className="text-sm" style={{ color: tc.textMuted }}>
                          {(profile as any)[f.field] || "Not provided"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="glass-card rounded-2xl p-5 hover:scale-[1.03] transition-transform duration-300">
                <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: tc.iconMuted }} />
                  <p className="text-xs" style={{ color: tc.textSubtle }}>{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Handled Issues ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="glass-card rounded-3xl overflow-hidden">
          <div className="p-8" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: tc.textPri }}>Issues I've Handled</h3>
                <p className="text-sm" style={{ color: tc.textMuted }}>
                  Track all issues you've responded to and resolved
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {respondedIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 opacity-60">
                <Player autoplay loop animationData={emptyAnimation} style={{ width: 140, height: 140 }} />
                <p className="text-sm mt-4" style={{ color: tc.textSubtle }}>
                  You haven't handled any issues yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {respondedIssues.map(issue => {
                  const sc = getSC(issue.status);
                  return (
                    <div key={issue._id} className="rounded-2xl p-5 space-y-4 hover:bg-white/5 transition-colors"
                      style={{ border: `1px solid ${tc.cardBorder}`, background: tc.cardInner }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <h4 className="font-bold" style={{ color: tc.textPri }}>{issue.title}</h4>
                          <p className="text-sm" style={{ color: tc.textMuted }}>{issue.description}</p>
                          {issue.citizenName && (
                            <p className="text-xs" style={{ color: tc.textSubtle }}>
                              Reported by{" "}
                              <span style={{ color: tc.textMuted, fontWeight: 600 }}>{issue.citizenName}</span>
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                          text-xs font-medium border flex-shrink-0 ${sc.bg} ${sc.color} ${sc.border}`}>
                          {issue.status}
                        </span>
                      </div>

                      {issue.adminResponse && (
                        <div className="rounded-xl p-3"
                          style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.20)" }}>
                          <p className="text-sm" style={{ color: tc.textMuted }}>
                            <span className="font-semibold" style={{ color: tc.textPri }}>Your Response: </span>
                            {issue.adminResponse}
                          </p>
                        </div>
                      )}

                      <Separator style={{ background: tc.cardBorder }} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs" style={{ color: tc.textSubtle }}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" style={{ color: tc.iconAmber }} />
                          <span>{issue.location?.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" style={{ color: tc.iconMuted }} />
                          <span>Reported: {issue.reportDate ? new Date(issue.reportDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                        {issue.resolvedDate && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            <span>{issue.resolvedDate}</span>
                          </div>
                        )}
                        {issue.category && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5" style={{ color: tc.iconMuted }} />
                            <span>Category: {issue.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;
