import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Plus, MapPin, Clock, User, AlertTriangle, CheckCircle2, XCircle, Loader2, Map, Flame, X } from "lucide-react";
import { Link } from "react-router-dom";
import { VITE_BACKEND_URL } from "../config/config";
import Player from "lottie-react";
import emptyAnimation from "../assets/animations/empty.json";
import HeaderAfterAuth from "../components/HeaderAfterAuth";

import { motion, AnimatePresence } from "framer-motion";
import { useLoader } from "../contexts/LoaderContext";
import { useThemeColors } from "../hooks/useThemeColors";
import { useAuth } from "../contexts/AuthContext";
import UpvoteButton from "../components/UpvoteButton";
import TrendingIssues from "../components/TrendingIssues";
import CommentSection from "../components/CommentSection";

interface Issues {
  _id: string; title: string; description: string; type: string;
  location: { latitude: number; longitude: number; address: string };
  reportedBy: string; reportedAt: string; image: string; status: string;
  upvotes?: string[];
}

const resolveImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${VITE_BACKEND_URL}${url}`;
};



const statusConfig: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  Resolved: { color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/40", icon: CheckCircle2 },
  Pending: { color: "text-amber-300", bg: "bg-amber-500/20", border: "border-amber-500/40", icon: Loader2 },
  "In Progress": { color: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-500/40", icon: Loader2 },
  Rejected: { color: "text-red-300", bg: "bg-red-500/20", border: "border-red-500/40", icon: XCircle },
};
const getStatusCfg = (s: string) =>
  statusConfig[s] ?? { color: "text-slate-300", bg: "bg-slate-500/20", border: "border-slate-500/40", icon: AlertTriangle };

const CitizenHome = () => {
  const [searchCity, setSearchCity] = useState("");
  const [reportedIssues, setReportedIssues] = useState<Issues[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrending, setShowTrending] = useState(false);
  const { hideLoader } = useLoader();
  const tc = useThemeColors();
  const { user } = useAuth();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${VITE_BACKEND_URL}/api/v1/all-issues?limit=12`, {
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
    fetchIssues();
  }, [hideLoader]);

  const filteredIssues = searchCity
    ? reportedIssues.filter(i => i.location?.address.toLowerCase().includes(searchCity.toLowerCase()))
    : reportedIssues;

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
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Outer Ring (Rotates in) */}
          <motion.circle
            cx="50" cy="50" r="42"
            stroke="url(#logo-blue)" strokeWidth="6" fill="none"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
            style={tc.dark ? { filter: "drop-shadow(0 0 4px rgba(59,130,246,0.3))" } : {}}
          />

          {/* 2. Handle of Magnifying Glass (Flies from bottom right) */}
          <motion.path
            d="M 80 80 L 100 100"
            stroke="url(#logo-blue)" strokeWidth="12" strokeLinecap="round"
            initial={{ x: 50, y: 50, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          />

          {/* 3. Eye Arcs (Flies from top) */}
          <motion.path
            d="M 8 50 Q 50 15 92 50 Q 50 85 8 50 Z"
            stroke="url(#logo-blue)" strokeWidth="6" strokeLinejoin="round" fill="none"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          />

          {/* 4. Pupil Circle (Flies from left) */}
          <motion.circle
            cx="50" cy="50" r="18"
            stroke="url(#logo-blue)" strokeWidth="4" fill="none"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          />

          {/* 5. Eye Highlight Curve (Flies from left with pupil) */}
          <motion.path
            d="M 37 42 A 12 12 0 0 0 37 58"
            stroke="url(#logo-blue)" strokeWidth="3" strokeLinecap="round" fill="none"
            initial={{ x: -80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35, type: "spring", bounce: 0.4, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          />

          {/* 6. Orange Map Pin (Flies from top right) */}
          <motion.path
            d="M 50 63 C 50 63 59 50 59 42 C 59 37 55 33 50 33 C 45 33 41 37 41 42 C 41 50 50 63 50 63 Z"
            fill="url(#logo-orange)"
            initial={{ x: 50, y: -50, opacity: 0, rotate: 45 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", bounce: 0.6, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
          />

          {/* 7. PIN Hole (White dot) */}
          <motion.circle
            cx="50" cy="42" r="3.5"
            fill={tc.dark ? "#060f1e" : "#ffffff"}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.8, repeat: Infinity, repeatType: "reverse", repeatDelay: 1.4 }}
          />
        </svg>

        {/* Text Area */}
        <div className="text-center">
          <motion.p
            className="text-2xl font-bold tracking-tight"
            style={{ color: tc.textPri }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
          >
            <span style={{ color: blueGradStart }}>Civic</span><span style={{ color: blueGradEnd }}>Watch</span>
          </motion.p>
          <motion.p
            className="text-sm font-medium mt-1"
            style={{ color: tc.textMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Transparency & Action
          </motion.p>

          <motion.p
            className="text-xs mt-6 opacity-50"
            style={{ color: tc.textSubtle }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-10">

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
          <div className="flex items-center gap-2">
            <Link to="/citizen/profile">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                                 transition-all duration-200"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                <User className="h-4 w-4" style={{ color: tc.iconAmber }} />
                My Profile
              </button>
            </Link>
            <button
              onClick={() => setShowTrending(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}
            >
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="hidden sm:block">Trending</span>
            </button>
            <Link to="/map">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                                 transition-all duration-200"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                <Map className="h-4 w-4" style={{ color: tc.iconAmber }} />
                <span className="hidden sm:block">Map View</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: tc.textPri }}>
            <Search className="h-4 w-4" style={{ color: tc.iconAmber }} />
            Search Issues by Location
          </h2>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 z-20"
              style={{ color: tc.textSubtle }} />
            <Input type="text" placeholder="Enter city name…" value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
              className="pl-10 focus:border-[#f5a623] rounded-xl h-11"
              style={{ background: tc.inputBg, borderColor: tc.inputBorder, color: tc.textPri }} />
          </div>
        </div>

        {/* ── Issues Section ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: tc.textPri }}>
              Recent Issues
              {searchCity && (
                <span className="text-base font-normal ml-1" style={{ color: tc.textSubtle }}>
                  in "{searchCity}"
                </span>
              )}
            </h2>
            <span className="text-sm rounded-full px-3 py-1"
              style={{ color: tc.countBadgeText, background: tc.countBadgeBg, border: `1px solid ${tc.countBadgeBorder}` }}>
              {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => {
              const sc = getStatusCfg(issue.status);
              const StatusIcon = sc.icon;
              return (
                <motion.div key={issue._id}
                  className="h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "50px" }}
                  transition={{ duration: 0.4 }}>
                  <div className={`glass-card rounded-2xl flex flex-col h-full overflow-hidden
                                   hover:scale-[1.02] hover:shadow-2xl transition-all duration-300
                                   ${issue.status === "Rejected" ? "opacity-40 grayscale" : ""}`}>
                    {/* Image */}
                    <div className="relative h-48 flex-shrink-0 overflow-hidden bg-[#060f1e]/40">
                      {resolveImageUrl(issue.image) ? (
                        <img src={resolveImageUrl(issue.image)} alt={issue.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: tc.placeholderBg }}>
                          <div className="text-center">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" style={{ color: tc.iconMuted }} />
                            <p className="text-xs" style={{ color: tc.iconMuted }}>No image uploaded</p>
                          </div>
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060f1e]/80 via-transparent to-transparent pointer-events-none" />

                      {/* Status badge */}
                      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1
                                       rounded-full text-xs font-semibold border backdrop-blur-sm shadow-sm
                                       ${sc.bg} ${sc.color} ${sc.border}`}>
                        <StatusIcon className="h-3 w-3" />
                        {issue.status}
                      </div>

                      {/* Type badge */}
                      <div className="absolute bottom-3 left-3 pointer-events-none">
                        <span className="text-xs font-medium bg-black/50 text-white/90 shadow-sm
                                         backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                          {issue.type}
                        </span>
                      </div>
                    </div>

                    {/* Card body — uses flex-grow to push footer down */}
                    <div className="p-5 flex flex-col flex-grow" style={{ background: tc.cardBody }}>
                      <h3 className="text-base font-bold leading-tight mb-2 line-clamp-2"
                        style={{ color: tc.textPri }}>
                        {issue.title}
                      </h3>
                      <p className="text-sm line-clamp-3 leading-relaxed opacity-90" style={{ color: tc.textMuted }}>
                        {issue.description}
                      </p>

                      <div className="mt-auto pt-4 space-y-2.5 text-xs"
                        style={{ color: tc.textSubtle }}>
                        <div className="flex items-start gap-2 border-t border-white/5 pt-3">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: tc.iconAmber }} />
                          <span className="line-clamp-2 leading-snug">{issue.location.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 flex-shrink-0" style={{ color: tc.iconMuted }} />
                          <span className="truncate">Reported by {issue.reportedBy}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: tc.iconMuted }} />
                            <span>{new Date(issue.reportedAt).toLocaleDateString()}</span>
                          </div>
                          <UpvoteButton
                            issueId={issue._id}
                            initialCount={(issue.upvotes || []).length}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Comment section */}
                    <div className="border-t border-white/5">
                      <CommentSection
                        issueId={issue._id}
                        currentUserId={user?.id}
                        currentRole={user?.role}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty state */}
          {!loading && filteredIssues.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center py-16">
              <div className="max-w-xs mx-auto mb-4 opacity-60">
                <Player autoplay loop animationData={emptyAnimation} style={{ height: "180px", width: "180px" }} />
              </div>
              <p style={{ color: tc.textMuted }}>
                {searchCity
                  ? <><span>No issues found for </span><span className="font-semibold" style={{ color: tc.textPri }}>{searchCity}</span></>
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
                       rounded-full shadow-lg hover:shadow-2xl hover:scale-105
                       transition-all duration-300 amber-glow">
            <Plus className="h-5 w-5 mr-2" />Report New Issue
          </Button>
        </Link>
      </div>

      {/* ── Trending Modal ── */}
      <AnimatePresence>
        {showTrending && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowTrending(false)}
            />

            {/* Modal panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-[70] rounded-3xl overflow-hidden flex flex-col
                         sm:inset-x-8 md:inset-x-16 lg:inset-x-24 xl:inset-x-40"
              style={{
                background: tc.dark
                  ? "linear-gradient(135deg, #0a1628 0%, #0d1e35 100%)"
                  : "linear-gradient(135deg, #f0f6fe 0%, #e8f0fb 100%)",
                border: `1px solid ${tc.cardBorder}`,
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
              }}
            >
              {/* Modal header */}
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: `1px solid ${tc.cardBorder}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.35)" }}>
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: tc.textPri }}>Trending Complaints</h2>
                    <p className="text-xs" style={{ color: tc.textSubtle }}>Most upvoted civic issues right now</p>
                  </div>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: "rgba(245,166,35,0.18)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.35)" }}>
                    Most Supported
                  </span>
                </div>
                <button
                  onClick={() => setShowTrending(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: tc.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", color: tc.textSubtle }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal body — scrollable */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <TrendingIssues />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CitizenHome;
