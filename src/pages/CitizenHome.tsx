import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Plus, MapPin, Clock, User, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { VITE_BACKEND_URL } from "../config/config";
import Player from "lottie-react";
import emptyAnimation from "../assets/animations/empty.json";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import starloader from "../assets/animations/starloder.json";
import { motion } from "framer-motion";
import { useLoader } from "../contexts/LoaderContext";
import { useThemeColors } from "../hooks/useThemeColors";

interface Issues {
  _id: string; title: string; description: string; type: string;
  location: { latitude: number; longitude: number; address: string };
  reportedBy: string; reportedAt: string; image: string; status: string;
}

const resolveImageUrl = (url: string | null | undefined) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `${VITE_BACKEND_URL}${url}`;
};

const MIN_LOADER_DURATION = 2500;

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
  const { hideLoader } = useLoader();
  const tc = useThemeColors();

  useEffect(() => {
    const fetchIssues = async () => {
      const startTime = Date.now();
      try {
        const res = await fetch(`${VITE_BACKEND_URL}/api/v1/all-issues`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        });
        const data = await res.json();
        setReportedIssues(Array.isArray(data.issues) ? data.issues : []);
      } catch (e) { console.error(e); }
      finally {
        const delay = Math.max(MIN_LOADER_DURATION - (Date.now() - startTime), 0);
        setTimeout(() => { setLoading(false); hideLoader(); }, delay);
      }
    };
    fetchIssues();
  }, [hideLoader]);

  const filteredIssues = searchCity
    ? reportedIssues.filter(i => i.location?.address.toLowerCase().includes(searchCity.toLowerCase()))
    : reportedIssues;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen civic-hero-bg">
        <Player autoplay loop animationData={starloader} style={{ height: "200px", width: "200px" }} />
        <p className="mt-4 text-sm" style={{ color: tc.textMuted }}>Fetching civic issues…</p>
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
          <Link to="/citizen/profile">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                               transition-all duration-200"
              style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
              <User className="h-4 w-4" style={{ color: tc.iconAmber }} />
              My Profile
            </button>
          </Link>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[680px] overflow-y-auto
                          pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {filteredIssues.map((issue, i) => {
              const sc = getStatusCfg(issue.status);
              const StatusIcon = sc.icon;
              return (
                <motion.div key={issue._id}
                  initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}>
                  <div className={`glass-card rounded-2xl overflow-hidden
                                   hover:scale-[1.02] hover:shadow-2xl transition-all duration-300
                                   ${issue.status === "Rejected" ? "opacity-40 grayscale" : ""}`}>
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {resolveImageUrl(issue.image) ? (
                        <img src={resolveImageUrl(issue.image)} alt={issue.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-400"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Status badge */}
                      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1
                                       rounded-full text-xs font-semibold border backdrop-blur-sm
                                       ${sc.bg} ${sc.color} ${sc.border}`}>
                        <StatusIcon className="h-3 w-3" />
                        {issue.status}
                      </div>

                      {/* Type badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs font-medium bg-black/40 text-white/90
                                         backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15">
                          {issue.type}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5" style={{ background: tc.cardBody }}>
                      <h3 className="text-base font-bold leading-snug mb-1.5 line-clamp-1"
                        style={{ color: tc.textPri }}>
                        {issue.title}
                      </h3>
                      <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: tc.textMuted }}>
                        {issue.description}
                      </p>

                      <div className="space-y-2 text-xs pt-3"
                        style={{ color: tc.textSubtle, borderTop: `1px solid ${tc.cardBorder}` }}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: tc.iconAmber }} />
                          <span className="truncate">{issue.location.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 flex-shrink-0" style={{ color: tc.iconMuted }} />
                          <span>Reported by {issue.reportedBy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 flex-shrink-0" style={{ color: tc.iconMuted }} />
                          <span>{issue.reportedAt}</span>
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
    </motion.div>
  );
};

export default CitizenHome;
