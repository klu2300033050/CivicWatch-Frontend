import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import { VITE_BACKEND_URL } from "../config/config";
import { useThemeColors } from "../hooks/useThemeColors";
import { useLoader } from "../contexts/LoaderContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface LeaderboardEntry {
    rank: number;
    _id: string;
    fullName: string;
    reputationPoints: number;
    totalIssues: number;
    badges: string[];
}

const rankColors = [
    { bg: "linear-gradient(135deg, #FFD700, #FFA500)", border: "#FFD700", text: "#7a4f00", shadow: "0 0 24px rgba(255,215,0,0.5)" },
    { bg: "linear-gradient(135deg, #C0C0C0, #A8A8A8)", border: "#C0C0C0", text: "#4a4a4a", shadow: "0 0 20px rgba(192,192,192,0.4)" },
    { bg: "linear-gradient(135deg, #CD7F32, #A0522D)", border: "#CD7F32", text: "#5a2d0c", shadow: "0 0 20px rgba(205,127,50,0.4)" },
];


const Leaderboard = () => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const tc = useThemeColors();
    const { hideLoader } = useLoader();
    const { user } = useAuth();

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/leaderboard`);
            const data = await res.json();
            setEntries(data.leaderboard || []);
        } catch {
            toast.error("Failed to load leaderboard");
        } finally {
            setLoading(false);
            hideLoader();
        }
    };

    useEffect(() => { fetchLeaderboard(); }, []);

    const top3 = entries.slice(0, 3);
    const rest = entries.slice(3);

    // Reorder podium: 2nd, 1st, 3rd
    const podiumOrder = top3.length >= 3
        ? [top3[1], top3[0], top3[2]]
        : top3;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen civic-hero-bg">
            <HeaderAfterAuth />

            <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 container mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                    <div>
                        <Link
                            to={user?.role === "admin" ? "/admin" : "/citizen"}
                            className="inline-flex items-center gap-2 text-sm mb-3 opacity-70 hover:opacity-100 transition-opacity"
                            style={{ color: tc.textMuted }}
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                        </Link>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-3 ml-4"
                            style={{ background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.3)", color: "#f5a623" }}
                        >
                            <Trophy className="h-3 w-3" /> Civic Leaders
                        </div>
                        <h1 className="text-4xl font-bold" style={{ color: tc.textPri }}>
                            🏆 Leaderboard
                        </h1>
                        <p className="text-sm mt-1" style={{ color: tc.textMuted }}>
                            Top civic champions making their city better
                        </p>
                    </div>
                    <button
                        onClick={fetchLeaderboard}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.cardBorder}` }}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} style={{ color: "#f5a623" }} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <RefreshCw className="h-10 w-10 animate-spin mb-4" style={{ color: "#f5a623" }} />
                        <p style={{ color: tc.textMuted }}>Loading leaderboard…</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 glass-card rounded-2xl">
                        <Star className="h-16 w-16 mb-4 opacity-30" style={{ color: "#f5a623" }} />
                        <p className="text-lg font-semibold" style={{ color: tc.textPri }}>No data yet</p>
                        <p className="text-sm mt-1" style={{ color: tc.textMuted }}>Be the first to report issues and earn Civic Credits!</p>
                    </div>
                ) : (
                    <>
                        {/* ── Podium ── */}
                        {top3.length > 0 && (
                            <div className="flex items-end justify-center gap-4 mb-12">
                                {podiumOrder.map((entry, podiumIdx) => {
                                    const actualRank = entry.rank - 1;
                                    const rc = rankColors[actualRank] || rankColors[2];
                                    const isFirst = entry.rank === 1;
                                    const heights = ["h-36", "h-48", "h-28"];
                                    // podiumOrder is [#2, #1, #3] — center (#1) must be tallest
                                    const podiumHeights = [heights[0], heights[1], heights[2]]; // left=medium, center=tallest, right=shortest
                                    const cardHeight = podiumHeights[podiumIdx];

                                    return (
                                        <motion.div
                                            key={entry._id}
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: podiumIdx * 0.15 }}
                                            className="flex flex-col items-center"
                                            style={{ width: isFirst ? 180 : 150 }}
                                        >
                                            {/* Crown/Trophy for rank 1 */}
                                            {entry.rank === 1 && (
                                                <motion.div
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="text-4xl mb-1"
                                                >
                                                    👑
                                                </motion.div>
                                            )}

                                            {/* Avatar */}
                                            <div
                                                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-2 shadow-lg"
                                                style={{ background: rc.bg, boxShadow: rc.shadow, color: rc.text }}
                                            >
                                                {entry.fullName.charAt(0).toUpperCase()}
                                            </div>

                                            {/* Name */}
                                            <p className="text-xs font-bold text-center mb-1 px-2 truncate max-w-full" style={{ color: tc.textPri }}>
                                                {entry.fullName}
                                            </p>

                                            {/* Points */}
                                            <p className="text-sm font-black mb-2" style={{ color: "#f5a623" }}>
                                                {entry.reputationPoints} pts
                                            </p>

                                            {/* Badges mini */}
                                            {entry.badges.slice(0, 2).map((b, i) => (
                                                <span key={i} className="text-[9px] mb-0.5 px-1.5 py-0.5 rounded-full font-semibold"
                                                    style={{ background: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)" }}>
                                                    {b}
                                                </span>
                                            ))}

                                            {/* Podium */}
                                            <div
                                                className={`w-full ${cardHeight} mt-3 rounded-t-2xl flex items-start justify-center pt-3 text-2xl font-black`}
                                                style={{ background: rc.bg, boxShadow: rc.shadow, color: rc.text }}
                                            >
                                                #{entry.rank}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Rest of rankings ── */}
                        {rest.length > 0 && (
                            <div className="space-y-3 max-w-2xl mx-auto">
                                <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: tc.textMuted }}>
                                    Other Top Reporters
                                </h2>
                                {rest.map((entry, i) => (
                                    <motion.div
                                        key={entry._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="glass-card rounded-2xl px-5 py-4 flex items-center gap-4"
                                    >
                                        {/* Rank number */}
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                                            style={{ background: "rgba(245,166,35,0.12)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.25)" }}
                                        >
                                            #{entry.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                            style={{ background: "linear-gradient(135deg, #1e4d8c, #2563b0)", color: "#fff" }}
                                        >
                                            {entry.fullName.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate" style={{ color: tc.textPri }}>
                                                {entry.fullName}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {entry.badges.map((b, bi) => (
                                                    <span key={bi} className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                                                        style={{ background: "rgba(245,166,35,0.12)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.25)" }}>
                                                        {b}
                                                    </span>
                                                ))}
                                                {entry.badges.length === 0 && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                                                        style={{ background: tc.pageBadgeBg, color: tc.textMuted }}>
                                                        New Reporter
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-black text-base" style={{ color: "#f5a623" }}>{entry.reputationPoints}</p>
                                            <p className="text-[10px]" style={{ color: tc.textMuted }}>{entry.totalIssues} issues</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* ── Badge Legend ── */}
                        <div className="mt-12 glass-card rounded-2xl p-6 max-w-2xl mx-auto">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: tc.textPri }}>
                                <Star className="h-4 w-4" style={{ color: "#f5a623" }} />
                                Badge Guide
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {[
                                    { badge: "🏆 Community Champion", desc: "Reported 10+ issues" },
                                    { badge: "👑 Top Reporter", desc: "#1 on leaderboard" },
                                    { badge: "🛣️ Road Warrior", desc: "3+ road issues" },
                                    { badge: "🌿 Eco Guardian", desc: "3+ garbage issues" },
                                    { badge: "⚡ Power Sentinel", desc: "3+ electricity issues" },
                                    { badge: "💧 Water Watcher", desc: "3+ water issues" },
                                    { badge: "🛡️ Safety Guardian", desc: "3+ public safety issues" },
                                    { badge: "⭐ Active Citizen", desc: "5+ total reports" },
                                ].map((item, i) => (
                                    <div key={i} className="p-3 rounded-xl"
                                        style={{ background: tc.dark ? "rgba(255,255,255,0.04)" : "rgba(15,42,74,0.04)", border: `1px solid ${tc.cardBorder}` }}>
                                        <p className="text-xs font-bold mb-1" style={{ color: "#f5a623" }}>{item.badge}</p>
                                        <p className="text-[10px]" style={{ color: tc.textMuted }}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Leaderboard;
