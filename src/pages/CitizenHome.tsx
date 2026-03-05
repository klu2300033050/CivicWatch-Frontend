import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Search, Plus, MapPin, Clock, User, AlertTriangle,
  CheckCircle2, XCircle, Loader2, Map, Flame, X,
  Filter, EyeOff, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { VITE_BACKEND_URL } from "../config/config";
import Player from "lottie-react";
import emptyAnimation from "../assets/animations/empty.json";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useLoader } from "../contexts/LoaderContext";
import { useThemeColors } from "../hooks/useThemeColors";

import UpvoteButton from "../components/UpvoteButton";
import TrendingIssues from "../components/TrendingIssues";
import IssueDetailSheet from "../components/IssueDetailSheet";

// ── Inline types (avoids Vite ESM export issue with re-exported TS types) ───
type IssueFeedback = { rating: number; comment?: string; submittedAt: string; };
type Issues = {
  _id: string; title: string; description: string;
  type: string; issueType: string;
  location: { latitude: number; longitude: number; address: string };
  reportedBy: string; reportedAt: string; image: string; status: string;
  upvotes?: string[];
  isAnonymous?: boolean;
  feedback?: IssueFeedback | null;
};

const resolveImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${VITE_BACKEND_URL}${url}`;
};

// ── Compact Timeline for cards ────────────────────────────────────────────────
const STATUS_STEPS = ["Reported", "Pending", "In Progress", "Resolved"];

const CompactTimeline = ({ status }: { status: string }) => {
  const isRejected = status === "Rejected";
  const steps = isRejected ? ["Reported", "Rejected"] : STATUS_STEPS;
  const currentIdx = isRejected ? 1 : STATUS_STEPS.indexOf(status);

  return (
    <div className="px-4 pt-2 pb-1 flex items-center gap-0">
      {steps.map((step, i) => {
        const isActive = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const color = isRejected && isCurrent ? "#f87171"
          : isCurrent ? "#f5a623"
            : isActive ? "#f5a62388" : "rgba(255,255,255,0.10)";
        return (
          <div key={step} className="flex items-center" style={{ flex: i < steps.length - 1 ? 1 : 0 }}>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: color,
                boxShadow: isCurrent ? `0 0 5px ${color}` : "none",
              }}
            />
            {i < steps.length - 1 && (
              <div className="flex-1 h-[1.5px] mx-0.5 rounded-full"
                style={{ background: i < currentIdx ? "#f5a62366" : "rgba(255,255,255,0.06)" }} />
            )}
          </div>
        );
      })}
      {/* current step label at end */}
      <span className="text-[9px] ml-2 font-semibold whitespace-nowrap"
        style={{ color: isRejected ? "#f87171" : "#f5a623", opacity: 0.85 }}>
        {status}
      </span>
    </div>
  );
};

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  Resolved: { color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/40", icon: CheckCircle2 },
  Pending: { color: "text-amber-300", bg: "bg-amber-500/20", border: "border-amber-500/40", icon: Loader2 },
  "In Progress": { color: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-500/40", icon: Loader2 },
  Rejected: { color: "text-red-300", bg: "bg-red-500/20", border: "border-red-500/40", icon: XCircle },
  Reported: { color: "text-slate-300", bg: "bg-slate-500/20", border: "border-slate-500/40", icon: AlertTriangle },
};
const getStatusCfg = (s: string) =>
  statusConfig[s] ?? { color: "text-slate-300", bg: "bg-slate-500/20", border: "border-slate-500/40", icon: AlertTriangle };

const CATEGORIES = ["Roads", "Electricity", "Water", "Garbage", "Public Safety", "Other"];
const STATUSES = ["Reported", "Pending", "In Progress", "Resolved", "Rejected"];

// ── Main component ────────────────────────────────────────────────────────────
const CitizenHome = () => {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [reportedIssues, setReportedIssues] = useState<Issues[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrending, setShowTrending] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issues | null>(null);
  const { hideLoader } = useLoader();
  const tc = useThemeColors();

  const fetchIssues = async () => {
    try {
      const res = await fetch(`${VITE_BACKEND_URL}/api/v1/all-issues?limit=50`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      const data = await res.json();
      setReportedIssues(Array.isArray(data.issues) ? data.issues : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  const filteredIssues = reportedIssues.filter(i => {
    if (searchTitle && !i.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
    if (searchCity && !i.location?.address?.toLowerCase().includes(searchCity.toLowerCase())) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterCategory && i.issueType !== filterCategory && i.type !== filterCategory) return false;
    return true;
  });

  const activeFilterCount = [filterStatus, filterCategory].filter(Boolean).length;

  // Update local issue after feedback is submitted
  const handleFeedbackSubmitted = (issueId: string, feedback: IssueFeedback) => {
    setReportedIssues(prev =>
      prev.map(i => i._id === issueId ? { ...i, feedback } : i)
    );
    // Also update the selected issue in the sheet
    setSelectedIssue(prev => prev?._id === issueId ? { ...prev, feedback } : prev);
  };

  if (loading) {
    const blueGradStart = tc.dark ? "#60a5fa" : "#2b6cb0";
    const blueGradEnd = tc.dark ? "#3b82f6" : "#1e3a8a";
    return (
      <div className="flex flex-col justify-center items-center h-screen civic-hero-bg gap-6 overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-32 h-32 overflow-visible">
          <defs>
            <linearGradient id="logo-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={blueGradStart} />
              <stop offset="100%" stopColor={blueGradEnd} />
            </linearGradient>
            <linearGradient id="logo-orange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fba94b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <motion.circle cx="50" cy="50" r="42" stroke="url(#logo-blue)" strokeWidth="6" fill="none"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }} />
          <motion.path d="M 80 80 L 100 100" stroke="url(#logo-blue)" strokeWidth="12" strokeLinecap="round"
            initial={{ x: 50, y: 50, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }} />
          <motion.path d="M 8 50 Q 50 15 92 50 Q 50 85 8 50 Z" stroke="url(#logo-blue)" strokeWidth="6" strokeLinejoin="round" fill="none"
            initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }} />
          <motion.circle cx="50" cy="50" r="18" stroke="url(#logo-blue)" strokeWidth="4" fill="none"
            initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }} />
          <motion.path d="M 50 63 C 50 63 59 50 59 42 C 59 37 55 33 50 33 C 45 33 41 37 41 42 C 41 50 50 63 50 63 Z"
            fill="url(#logo-orange)"
            initial={{ x: 50, y: -50, opacity: 0, rotate: 45 }} animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", bounce: 0.6, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }} />
          <motion.circle cx="50" cy="42" r="3.5" fill={tc.dark ? "#060f1e" : "#ffffff"}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8, repeat: Infinity, repeatType: "reverse", repeatDelay: 1.4 }} />
        </svg>
        <div className="text-center">
          <motion.p className="text-2xl font-bold tracking-tight" style={{ color: tc.textPri }}
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }}>
            <span style={{ color: blueGradStart }}>Civic</span><span style={{ color: blueGradEnd }}>Watch</span>
          </motion.p>
          <motion.p className="text-xs mt-6 opacity-50" style={{ color: tc.textSubtle }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1 }}>
            Loading civic issues…
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen civic-hero-bg">
      <HeaderAfterAuth />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-3"
              style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
              Civic Dashboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight" style={{ color: tc.textPri }}>
              Welcome, <span className="text-amber-gradient">Citizen!</span>
            </h1>
            <p className="mt-2 text-base" style={{ color: tc.textMuted }}>
              Help improve your community by reporting and tracking issues
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Link to="/citizen/profile">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                <User className="h-4 w-4" style={{ color: tc.iconAmber }} />
                My Profile
              </button>
            </Link>
            <button onClick={() => setShowTrending(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="hidden sm:block">Trending</span>
            </button>
            <Link to="/map">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                <Map className="h-4 w-4" style={{ color: tc.iconAmber }} />
                <span className="hidden sm:block">Map View</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── Search + Filter Bar ── */}
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 z-10"
                style={{ color: tc.textSubtle }} />
              <Input type="text" placeholder="Search by title…" value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
                className="pl-10 focus:border-[#f5a623] rounded-xl h-11"
                style={{ background: tc.inputBg, borderColor: tc.inputBorder, color: tc.textPri }} />
            </div>
            <div className="relative flex-1 min-w-[160px]">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 z-10"
                style={{ color: tc.textSubtle }} />
              <Input type="text" placeholder="Filter by city…" value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                className="pl-10 focus:border-[#f5a623] rounded-xl h-11"
                style={{ background: tc.inputBg, borderColor: tc.inputBorder, color: tc.textPri }} />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeFilterCount ? "rgba(245,166,35,0.18)" : tc.inputBg,
                border: `1px solid ${activeFilterCount ? "rgba(245,166,35,0.5)" : tc.inputBorder}`,
                color: activeFilterCount ? "#f5a623" : tc.textPri,
              }}>
              <Filter className="h-4 w-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-3 pt-1">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold" style={{ color: tc.textMuted }}>Status:</span>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => setFilterStatus(prev => prev === s ? "" : s)}
                        className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                        style={{
                          background: filterStatus === s ? "rgba(245,166,35,0.2)" : tc.pageBadgeBg,
                          border: `1px solid ${filterStatus === s ? "rgba(245,166,35,0.5)" : tc.pageBadgeBorder}`,
                          color: filterStatus === s ? "#f5a623" : tc.textMuted,
                        }}>{s}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-semibold" style={{ color: tc.textMuted }}>Category:</span>
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setFilterCategory(prev => prev === c ? "" : c)}
                        className="text-xs px-3 py-1 rounded-full font-medium transition-all"
                        style={{
                          background: filterCategory === c ? "rgba(96,165,250,0.2)" : tc.pageBadgeBg,
                          border: `1px solid ${filterCategory === c ? "rgba(96,165,250,0.5)" : tc.pageBadgeBorder}`,
                          color: filterCategory === c ? "#60a5fa" : tc.textMuted,
                        }}>{c}</button>
                    ))}
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={() => { setFilterStatus(""); setFilterCategory(""); }}
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                      Clear All
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Issues Grid ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: tc.textPri }}>Recent Issues</h2>
            <span className="text-sm rounded-full px-3 py-1"
              style={{ color: tc.countBadgeText, background: tc.countBadgeBg, border: `1px solid ${tc.countBadgeBorder}` }}>
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""} found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIssues.map((issue) => {
              const sc = getStatusCfg(issue.status);
              const StatusIcon = sc.icon;
              return (
                <motion.div key={issue._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "50px" }}
                  transition={{ duration: 0.35 }}>

                  {/* ── Card ── click = open detail sheet */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedIssue(issue)}
                    onKeyDown={e => e.key === "Enter" && setSelectedIssue(issue)}
                    className={`glass-card rounded-2xl overflow-hidden cursor-pointer select-none
                                 hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 group
                                 ${issue.status === "Rejected" ? "opacity-40 grayscale" : ""}`}>

                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-[#060f1e]/40">
                      {resolveImageUrl(issue.image) ? (
                        <img src={resolveImageUrl(issue.image)} alt={issue.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: tc.placeholderBg }}>
                          <AlertTriangle className="h-8 w-8" style={{ color: tc.iconMuted }} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060f1e]/80 via-transparent to-transparent pointer-events-none" />

                      {/* Status badge */}
                      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1
                                       rounded-full text-xs font-semibold border backdrop-blur-sm
                                       ${sc.bg} ${sc.color} ${sc.border}`}>
                        <StatusIcon className="h-3 w-3" />
                        {issue.status}
                      </div>

                      {/* Anonymous badge */}
                      {issue.isAnonymous && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm"
                          style={{ background: "rgba(70,70,90,0.75)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
                          <EyeOff className="h-2.5 w-2.5" /> Anonymous
                        </div>
                      )}

                      {/* Type pill */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs font-medium bg-black/50 text-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                          {issue.type || issue.issueType}
                        </span>
                      </div>

                      {/* Tap hint */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 text-[10px] font-semibold"
                        style={{ color: "rgba(255,255,255,0.7)" }}>
                        View details <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>

                    {/* Compact timeline */}
                    <CompactTimeline status={issue.status} />

                    {/* Card body */}
                    <div className="px-4 pt-1 pb-4 flex flex-col" style={{ background: tc.cardBody }}>
                      <h3 className="text-sm font-bold leading-snug mb-1 line-clamp-2" style={{ color: tc.textPri }}>
                        {issue.title}
                      </h3>
                      <p className="text-xs line-clamp-2 leading-relaxed opacity-80 mb-3" style={{ color: tc.textMuted }}>
                        {issue.description}
                      </p>

                      <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3"
                        style={{ color: tc.textSubtle }}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" style={{ color: tc.iconMuted }} />
                          {new Date(issue.reportedAt).toLocaleDateString()}
                        </div>
                        {/* Stop propagation so upvote click doesn't open the sheet */}
                        <div onClick={e => e.stopPropagation()}>
                          <UpvoteButton issueId={issue._id} initialCount={(issue.upvotes || []).length} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredIssues.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-16">
              <div className="max-w-xs mx-auto mb-4 opacity-60">
                <Player autoplay loop animationData={emptyAnimation} style={{ height: "180px", width: "180px" }} />
              </div>
              <p style={{ color: tc.textMuted }}>
                {searchTitle || searchCity || filterStatus || filterCategory
                  ? <>No issues match your filters.{" "}
                    <button onClick={() => { setSearchTitle(""); setSearchCity(""); setFilterStatus(""); setFilterCategory(""); }}
                      className="font-semibold underline" style={{ color: "#f5a623" }}>Clear all</button></>
                  : "No issues available at the moment."}
              </p>
              <Link to="/citizen/create-issue" className="mt-6">
                <Button className="civic-amber-gradient border-0 text-slate-900 font-semibold rounded-xl px-6">
                  <Plus className="h-4 w-4 mr-2" />Report Your First Issue
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link to="/citizen/create-issue">
          <Button size="lg"
            className="civic-amber-gradient border-0 text-slate-900 font-bold h-14 px-6
                       rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 amber-glow">
            <Plus className="h-5 w-5 mr-2" />Report New Issue
          </Button>
        </Link>
      </div>

      {/* ── Issue Detail Sheet ── */}
      <IssueDetailSheet
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />

      {/* ── Trending Modal ── */}
      <AnimatePresence>
        {showTrending && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTrending(false)} />
            <motion.div key="modal"
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-[70] rounded-3xl overflow-hidden flex flex-col
                         sm:inset-x-8 md:inset-x-16 lg:inset-x-24 xl:inset-x-40"
              style={{
                background: tc.dark ? "linear-gradient(135deg, #0a1628 0%, #0d1e35 100%)" : "linear-gradient(135deg, #f0f6fe 0%, #e8f0fb 100%)",
                border: `1px solid ${tc.cardBorder}`,
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}>
              <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
                <div className="flex items-center gap-3">
                  <Flame className="h-5 w-5 text-orange-400" />
                  <h2 className="text-lg font-bold" style={{ color: tc.textPri }}>Trending Complaints</h2>
                </div>
                <button onClick={() => setShowTrending(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: tc.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", color: tc.textSubtle }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6"><TrendingIssues /></div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CitizenHome;
