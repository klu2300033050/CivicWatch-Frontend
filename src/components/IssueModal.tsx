import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import { useThemeColors } from "../hooks/useThemeColors";
import { VITE_BACKEND_URL } from "../config/config";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Separator } from "./ui/separator";

interface Comment {
    _id: string;
    text: string;
    createdAt: string;
    authorName: string;
    authorRole: "citizen" | "admin";
}

export default function IssueModal({ issue, onClose }: { issue: any, onClose: () => void }) {
    const tc = useThemeColors();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(true);

    useEffect(() => {
        if (!issue) return;
        const fetchComments = async () => {
            try {
                const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issues/${issue._id}/comments`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
                });
                const data = await res.json();
                if (res.ok) setComments(data.comments || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingComments(false);
            }
        };
        fetchComments();
    }, [issue]);

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issues/${issue._id}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`
                },
                body: JSON.stringify({ text: newComment }),
            });
            const data = await res.json();
            if (res.ok) {
                setComments([...comments, data.comment]);
                setNewComment("");
            } else {
                toast.error("Failed to post comment");
            }
        } catch (err) {
            toast.error("Error posting comment");
        }
    };

    if (!issue) return null;

    const posterName = issue.isAnonymous ? "Anonymous Citizen" : issue.reportedBy || "Unknown";

    const resolveImageUrl = (url: string | null | undefined) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
        return `${VITE_BACKEND_URL}${url}`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: tc.dark ? "#0f172a" : "#ffffff", border: `1px solid ${tc.cardBorder}` }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: `1px solid ${tc.cardBorder}` }}>
                        <h2 className="text-xl font-bold" style={{ color: tc.textPri }}>Issue Details</h2>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/10 transition">
                            <X className="h-5 w-5" style={{ color: tc.textMuted }} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {/* Poster Info */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: tc.textPri }}>{issue.title}</h3>
                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium" style={{ color: tc.textSubtle }}>
                                    <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-amber-500" /> {posterName}</span>
                                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(issue.reportedAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {issue.location?.address}</span>
                                </div>
                            </div>
                            <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {issue.status}
                            </div>
                        </div>

                        <Separator style={{ background: tc.cardBorder }} />

                        {/* Description & Image */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: tc.textLabel }}>Description</h4>
                                <p className="text-sm leading-relaxed" style={{ color: tc.textMuted }}>{issue.description}</p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: tc.textLabel }}>Attached Media</h4>
                                {issue.image ? (
                                    <img src={resolveImageUrl(issue.image)} alt="Issue" className="w-full h-48 object-cover rounded-xl border" style={{ borderColor: tc.cardBorder }} />
                                ) : (
                                    <div className="w-full h-48 flex flex-col items-center justify-center rounded-xl border border-dashed" style={{ borderColor: tc.cardBorder, background: "rgba(0,0,0,0.02)" }}>
                                        <ImageIcon className="h-8 w-8 mb-2" style={{ color: tc.iconMuted }} />
                                        <span className="text-sm font-medium" style={{ color: tc.textSubtle }}>No image attached</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator style={{ background: tc.cardBorder }} />

                        {/* Comments Section */}
                        <div className="space-y-4">
                            <h4 className="font-bold text-sm uppercase tracking-wide" style={{ color: tc.textLabel }}>Discussion & Replies</h4>

                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {loadingComments ? (
                                    <p className="text-sm py-4" style={{ color: tc.textMuted }}>Loading comments...</p>
                                ) : comments.length === 0 ? (
                                    <p className="text-sm py-4" style={{ color: tc.textSubtle }}>No comments yet. Be the first to reply!</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c._id} className="p-4 rounded-2xl" style={{ background: c.authorRole === "admin" ? "rgba(96,165,250,0.1)" : "rgba(0,0,0,0.03)", border: `1px solid ${c.authorRole === "admin" ? "rgba(96,165,250,0.2)" : tc.cardBorder}` }}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-bold text-sm" style={{ color: tc.textPri }}>{c.authorName || "User"} <span className="text-xs font-normal opacity-70">({c.authorRole})</span></span>
                                                <span className="text-xs" style={{ color: tc.textSubtle }}>{new Date(c.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm" style={{ color: tc.textMuted }}>{c.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comment Input Footer */}
                    <div className="p-4" style={{ borderTop: `1px solid ${tc.cardBorder}`, background: tc.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                        <form onSubmit={handleSendComment} className="flex items-center gap-3">
                            <Input
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Write an official reply..."
                                className="h-11 rounded-xl focus:border-[#f5a623] flex-1"
                                style={{ background: tc.inputBg, borderColor: tc.inputBorder, color: tc.textPri }}
                            />
                            <Button type="submit" disabled={!newComment.trim()} className="h-11 px-6 rounded-xl font-bold bg-[#f5a623] text-black hover:bg-[#e09822]">
                                <Send className="h-4 w-4 mr-2" />
                                Reply
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
