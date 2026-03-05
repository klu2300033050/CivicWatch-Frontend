import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, MapPin, Clock, User, EyeOff, Star, CheckCircle2,
    XCircle, Loader2, AlertTriangle, ChevronRight
} from "lucide-react";
import { VITE_BACKEND_URL } from "../config/config";
import { useThemeColors } from "../hooks/useThemeColors";
import CommentSection from "./CommentSection";
import UpvoteButton from "./UpvoteButton";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────
export interface IssueFeedback { rating: number; comment?: string; submittedAt: string; }
export interface IssueItem {
    _id: string; title: string; description: string;
    type: string; issueType: string;
    location: { latitude: number; longitude: number; address: string };
    reportedBy: string; reportedAt: string; image: string; status: string;
    upvotes?: string[];
    isAnonymous?: boolean;
    feedback?: IssueFeedback | null;
}

// ── Timeline ─────────────────────────────────────────────────────────────────
const STATUS_STEPS = ["Reported", "Pending", "In Progress", "Resolved"];

const IssueTimeline = ({ status }: { status: string }) => {
    const isRejected = status === "Rejected";
    const steps = isRejected ? ["Reported", "Rejected"] : STATUS_STEPS;
    const currentIdx = isRejected ? 1 : STATUS_STEPS.indexOf(status);

    const stepColors: Record<string, string> = {
        Reported: "#94a3b8",
        Pending: "#fbbf24",
        "In Progress": "#60a5fa",
        Resolved: "#34d399",
        Rejected: "#f87171",
    };

    return (
        <div className="px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50" style={{ color: "#94a3b8" }}>
                Issue Lifecycle
            </p>
            <div className="flex items-start gap-0">
                {steps.map((step, i) => {
                    const isActive = i <= currentIdx;
                    const isCurrent = i === currentIdx;
                    const color = isActive ? stepColors[step] || "#f5a623" : "rgba(255,255,255,0.12)";

                    return (
                        <div key={step} className="flex items-start" style={{ flex: i < steps.length - 1 ? 1 : 0 }}>
                            <div className="flex flex-col items-center">
                                {/* Dot */}
                                <motion.div
                                    animate={isCurrent ? { scale: [1, 1.25, 1] } : {}}
                                    transition={{ repeat: Infinity, duration: 1.8 }}
                                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                                    style={{
                                        background: isActive ? color : "rgba(255,255,255,0.07)",
                                        border: `2px solid ${color}`,
                                        boxShadow: isCurrent ? `0 0 10px ${color}88` : "none",
                                    }}
                                >
                                    {isCurrent && (
                                        <div className="w-2 h-2 rounded-full" style={{ background: "#fff" }} />
                                    )}
                                </motion.div>
                                {/* Label */}
                                <span
                                    className="text-[10px] mt-1.5 font-semibold text-center whitespace-nowrap"
                                    style={{ color: isCurrent ? color : isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}
                                >
                                    {step}
                                </span>
                            </div>
                            {/* Connector */}
                            {i < steps.length - 1 && (
                                <div className="flex-1 h-[2px] mt-2 mx-1 rounded-full"
                                    style={{ background: i < currentIdx ? color : "rgba(255,255,255,0.08)" }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Star Feedback Section ─────────────────────────────────────────────────────
const FeedbackSection = ({
    issue,
    onFeedbackSubmitted,
}: {
    issue: IssueItem;
    onFeedbackSubmitted: (feedback: IssueFeedback) => void;
}) => {
    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const tc = useThemeColors();

    // Already rated
    if (issue.feedback?.rating) {
        return (
            <div className="mx-6 mb-4 p-4 rounded-2xl"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#34d399" }}>Your Feedback</p>
                <div className="flex items-center gap-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="h-5 w-5"
                            fill={s <= issue.feedback!.rating ? "#f5a623" : "transparent"}
                            style={{ color: s <= issue.feedback!.rating ? "#f5a623" : "rgba(255,255,255,0.15)" }} />
                    ))}
                    <span className="text-sm font-bold ml-1" style={{ color: "#f5a623" }}>
                        {issue.feedback.rating}/5
                    </span>
                </div>
                {issue.feedback.comment && (
                    <p className="text-xs italic" style={{ color: tc.textMuted }}>"{issue.feedback.comment}"</p>
                )}
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="mx-6 mb-4 p-4 rounded-2xl text-center"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <p className="text-emerald-400 text-sm font-bold">Thanks for your feedback! 🙏</p>
            </div>
        );
    }

    const ratingLabels = ["", "😞 Not resolved", "😕 Barely resolved", "😐 Partially resolved", "🙂 Mostly resolved", "😄 Fully resolved!"];

    const handleSubmit = async () => {
        if (!rating) return toast.error("Please select a star rating");
        setLoading(true);
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issues/${issue._id}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({ rating, comment }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Thank you for your feedback! ⭐");
                setSubmitted(true);
                onFeedbackSubmitted(data.feedback);
            } else {
                toast.error(data.message || "Failed");
            }
        } catch { toast.error("Something went wrong"); }
        finally { setLoading(false); }
    };

    return (
        <div className="mx-6 mb-4 p-4 rounded-2xl space-y-3"
            style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)" }}>
            <p className="text-xs font-bold" style={{ color: "#f5a623" }}>⭐ Rate the Resolution</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Was your issue actually fixed?</p>

            {/* Stars */}
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110 active:scale-95">
                        <Star className="h-8 w-8"
                            fill={(hovered || rating) >= star ? "#f5a623" : "transparent"}
                            style={{ color: (hovered || rating) >= star ? "#f5a623" : "rgba(255,255,255,0.15)" }} />
                    </button>
                ))}
            </div>
            {(hovered || rating) > 0 && (
                <p className="text-xs font-medium" style={{ color: "#f5a623" }}>
                    {ratingLabels[hovered || rating]}
                </p>
            )}

            <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Optional comment… (max 300 chars)"
                maxLength={300}
                rows={2}
                className="w-full text-xs rounded-xl px-3 py-2 resize-none focus:outline-none"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}
            />

            <button
                onClick={handleSubmit}
                disabled={loading || !rating}
                className="w-full py-2 rounded-xl text-sm font-bold civic-amber-gradient transition-all disabled:opacity-30"
                style={{ color: "#1e293b" }}>
                {loading ? "Submitting…" : "Submit Feedback"}
            </button>
        </div>
    );
};

// ── Detail Sheet ──────────────────────────────────────────────────────────────
const statusConfig: Record<string, { color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
    Resolved: { color: "text-emerald-300", bg: "bg-emerald-500/20", border: "border-emerald-500/40", icon: CheckCircle2 },
    Pending: { color: "text-amber-300", bg: "bg-amber-500/20", border: "border-amber-500/40", icon: Loader2 },
    "In Progress": { color: "text-blue-300", bg: "bg-blue-500/20", border: "border-blue-500/40", icon: Loader2 },
    Rejected: { color: "text-red-300", bg: "bg-red-500/20", border: "border-red-500/40", icon: XCircle },
    Reported: { color: "text-slate-300", bg: "bg-slate-500/20", border: "border-slate-500/40", icon: AlertTriangle },
};

const resolveImageUrl = (url: string | null | undefined) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
    return `${VITE_BACKEND_URL}${url}`;
};

interface Props {
    issue: IssueItem | null;
    onClose: () => void;
    onFeedbackSubmitted: (issueId: string, feedback: IssueFeedback) => void;
}

const IssueDetailSheet = ({ issue, onClose, onFeedbackSubmitted }: Props) => {
    const tc = useThemeColors();
    const { user } = useAuth();

    if (!issue) return null;

    const sc = statusConfig[issue.status] ?? statusConfig["Reported"];
    const StatusIcon = sc.icon;
    const isMyIssue = user?.id === (issue as any).citizenId;
    const canRate = issue.status === "Resolved" && isMyIssue && !issue.feedback?.rating;

    return (
        <AnimatePresence>
            {issue && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="sheet-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sheet — slides up from bottom on mobile, centered on desktop */}
                    <motion.div
                        key="sheet-panel"
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 28, stiffness: 260 }}
                        className="fixed bottom-0 left-0 right-0 z-[80]
                                   md:inset-0 md:flex md:items-center md:justify-center md:p-4"
                        style={{ pointerEvents: "none" }}
                    >
                        <div
                            className="w-full md:max-w-2xl md:mx-auto rounded-t-3xl md:rounded-3xl overflow-hidden
                                       max-h-[92vh] flex flex-col shadow-2xl"
                            style={{
                                background: tc.dark
                                    ? "linear-gradient(160deg, #0a1628 0%, #0d1f38 100%)"
                                    : "linear-gradient(160deg, #f0f6ff 0%, #e8f0fb 100%)",
                                border: `1px solid ${tc.cardBorder}`,
                                pointerEvents: "all",
                            }}
                        >
                            {/* Drag handle (mobile) */}
                            <div className="flex justify-center pt-3 pb-1 md:hidden">
                                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                            </div>

                            {/* Scrollable content */}
                            <div className="overflow-y-auto flex-1">
                                {/* Image */}
                                <div className="relative h-52 flex-shrink-0 overflow-hidden">
                                    {resolveImageUrl(issue.image) ? (
                                        <img src={resolveImageUrl(issue.image)} alt={issue.title}
                                            className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"
                                            style={{ background: tc.dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
                                            <AlertTriangle className="h-10 w-10 opacity-20" style={{ color: tc.textMuted }} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/90 via-transparent to-transparent" />

                                    {/* Status badge */}
                                    <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5
                                                     rounded-full text-xs font-bold border backdrop-blur-sm
                                                     ${sc.bg} ${sc.color} ${sc.border}`}>
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {issue.status}
                                    </div>

                                    {/* Anonymous */}
                                    {issue.isAnonymous && (
                                        <div className="absolute bottom-4 right-14 flex items-center gap-1.5 px-2.5 py-1.5
                                                        rounded-full text-xs font-semibold backdrop-blur-sm"
                                            style={{ background: "rgba(70,70,90,0.8)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.65)" }}>
                                            <EyeOff className="h-3 w-3" /> Anonymous
                                        </div>
                                    )}

                                    {/* Close */}
                                    <button onClick={onClose}
                                        className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                                        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff" }}>
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Title & meta */}
                                <div className="px-6 pt-5 pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="text-xl font-bold leading-tight" style={{ color: tc.textPri }}>
                                            {issue.title}
                                        </h2>
                                        <UpvoteButton issueId={issue._id} initialCount={(issue.upvotes || []).length} />
                                    </div>
                                    <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: tc.textMuted }}>
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" style={{ color: "#f5a623" }} />
                                            {issue.location.address}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            {issue.isAnonymous
                                                ? <><EyeOff className="h-3.5 w-3.5" />Anonymous</>
                                                : <><User className="h-3.5 w-3.5" />{issue.reportedBy}</>
                                            }
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {new Date(issue.reportedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ background: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.3)" }}>
                                            {issue.type || issue.issueType}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="px-6 pb-4">
                                    <p className="text-sm leading-relaxed" style={{ color: tc.textMuted }}>
                                        {issue.description}
                                    </p>
                                </div>

                                {/* ── Timeline ── */}
                                <div style={{ borderTop: `1px solid ${tc.cardBorder}`, borderBottom: `1px solid ${tc.cardBorder}` }}>
                                    <IssueTimeline status={issue.status} />
                                </div>

                                {/* ── Feedback (only for resolved issues I reported) ── */}
                                {(canRate || issue.feedback?.rating) && (
                                    <div style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
                                        <div className="pt-4">
                                            <FeedbackSection
                                                issue={issue}
                                                onFeedbackSubmitted={(fb) => onFeedbackSubmitted(issue._id, fb)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── Comments ── */}
                                <div className="pb-4">
                                    <CommentSection
                                        issueId={issue._id}
                                        currentUserId={user?.id}
                                        currentRole={user?.role}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default IssueDetailSheet;
