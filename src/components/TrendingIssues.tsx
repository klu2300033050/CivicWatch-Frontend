import { useEffect, useState } from "react";
import { VITE_BACKEND_URL } from "../config/config";
import { useThemeColors } from "../hooks/useThemeColors";
import { TrendingUp, ThumbsUp, MapPin, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface TrendingIssue {
    _id: string;
    title: string;
    description: string;
    issueType: string;
    status: string;
    location: { address: string };
    upvoteCount: number;
    image?: string;
}

const statusColors: Record<string, string> = {
    Resolved: "#34d399",
    "In Progress": "#60a5fa",
    Pending: "#fbbf24",
    Rejected: "#f87171",
    Reported: "#94a3b8",
};

const TrendingIssues = () => {
    const [trending, setTrending] = useState<TrendingIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const tc = useThemeColors();
    const token = localStorage.getItem("auth_token");

    useEffect(() => {
        fetch(`${VITE_BACKEND_URL}/api/v1/issues/trending`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((d) => setTrending(d.trending || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm" style={{ color: tc.textSubtle }}>Loading trending issues…</p>
            </div>
        </div>
    );

    if (trending.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Flame className="h-10 w-10 text-orange-300 opacity-40" />
            <p className="text-sm" style={{ color: tc.textSubtle }}>No trending issues yet. Be the first to upvote!</p>
        </div>
    );

    return (
        <section>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <h2 className="text-xl font-bold" style={{ color: tc.textPri }}>
                        Trending Complaints
                    </h2>
                </div>
                <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: "rgba(245,166,35,0.18)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.35)" }}
                >
                    Most Supported
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {trending.slice(0, 8).map((issue, i) => (
                    <motion.div
                        key={issue._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform duration-300"
                    >
                        {/* Rank badge */}
                        <div className="relative">
                            {issue.image ? (
                                <img
                                    src={issue.image}
                                    alt={issue.title}
                                    className="w-full h-32 object-cover"
                                />
                            ) : (
                                <div className="w-full h-32 flex items-center justify-center" style={{ background: "rgba(15,42,74,0.4)" }}>
                                    <TrendingUp className="h-8 w-8 opacity-30" style={{ color: "#f5a623" }} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                            <div
                                className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                                style={{ background: "#f5a623", color: "#1e293b" }}
                            >
                                {i + 1}
                            </div>
                            <span
                                className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                    background: (statusColors[issue.status] || "#94a3b8") + "33",
                                    color: statusColors[issue.status] || "#94a3b8",
                                    border: `1px solid ${statusColors[issue.status] || "#94a3b8"}66`,
                                }}
                            >
                                {issue.status}
                            </span>
                        </div>

                        <div className="p-3">
                            <p className="text-sm font-bold line-clamp-1 mb-1" style={{ color: tc.textPri }}>
                                {issue.title}
                            </p>
                            <p className="text-xs line-clamp-2 mb-2" style={{ color: tc.textMuted }}>
                                {issue.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1" style={{ color: tc.textSubtle }}>
                                    <MapPin className="h-3 w-3" style={{ color: "#f5a623" }} />
                                    <span className="text-xs truncate max-w-[100px]">{issue.location?.address || "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(245,166,35,0.15)", color: "#f5a623" }}>
                                    <ThumbsUp className="h-3 w-3" />
                                    <span className="text-xs font-bold">{issue.upvoteCount}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default TrendingIssues;
