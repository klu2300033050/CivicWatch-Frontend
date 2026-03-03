import { useEffect, useState } from "react";
import { VITE_BACKEND_URL } from "../config/config";
import { useThemeColors } from "../hooks/useThemeColors";
import { MessageSquare, Send, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Comment {
    _id: string;
    authorName: string;
    authorRole: "citizen" | "admin";
    text: string;
    parentId: string | null;
    createdAt: string;
}

interface Props {
    issueId: string;
    currentUserId?: string;
    currentRole?: "citizen" | "admin";
}

const CommentSection = ({ issueId, currentUserId: _userId, currentRole }: Props) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const tc = useThemeColors();
    const token = localStorage.getItem("auth_token");

    const fetchComments = async () => {
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issues/${issueId}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setComments(data.comments || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    // Fetch comments on mount so the count is correct immediately
    useEffect(() => {
        fetchComments();
    }, [issueId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issues/${issueId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: text.trim(), parentId: replyTo }),
            });
            const data = await res.json();
            if (res.ok) {
                setComments((prev) => [...prev, data.comment]);
                setText("");
                setReplyTo(null);
                toast.success("Comment added!");
            } else {
                toast.error(data.message || "Failed to add comment");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issues/${issueId}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setComments((prev) => prev.filter((c) => c._id !== commentId));
                toast.success("Comment deleted");
            }
        } catch {
            toast.error("Failed to delete");
        }
    };

    // Build thread structure: top-level then replies grouped
    const topLevel = comments.filter((c) => !c.parentId);
    const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

    const renderComment = (comment: Comment, isReply = false) => (
        <motion.div
            key={comment._id}
            initial={{ opacity: 0, x: isReply ? 10 : 0, y: isReply ? 0 : 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            className={`flex gap-3 ${isReply ? "ml-8 mt-2" : "mt-3"}`}
        >
            {/* Avatar */}
            <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                    background: comment.authorRole === "admin" ? "#f5a623" : tc.dark ? "rgba(255,255,255,0.15)" : "rgba(15,42,74,0.12)",
                    color: comment.authorRole === "admin" ? "#1e293b" : tc.textPri,
                }}
            >
                {comment.authorName.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
                <div
                    className="rounded-xl p-3"
                    style={{ background: tc.dark ? "rgba(255,255,255,0.06)" : "rgba(15,42,74,0.05)" }}
                >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: tc.textPri }}>
                            {comment.authorName}
                        </span>
                        {comment.authorRole === "admin" && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-[#f5a623] text-slate-900">
                                Admin
                            </span>
                        )}
                        <span className="text-xs" style={{ color: tc.textSubtle }}>
                            {new Date(comment.createdAt).toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: tc.textMuted }}>{comment.text}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-1 px-1">
                    {!isReply && (
                        <button
                            onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                            className="text-xs hover:opacity-80 transition-opacity"
                            style={{ color: tc.textSubtle }}
                        >
                            {replyTo === comment._id ? "Cancel" : "Reply"}
                        </button>
                    )}
                    {(currentRole === "admin") && (
                        <button
                            onClick={() => handleDelete(comment._id)}
                            className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
                            style={{ color: "#f87171" }}
                        >
                            <Trash2 className="h-3 w-3" /> Delete
                        </button>
                    )}
                </div>

                {/* Reply form */}
                {replyTo === comment._id && (
                    <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write a reply…"
                            className="flex-1 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#f5a623]/50"
                            style={{
                                background: tc.dark ? "rgba(255,255,255,0.08)" : "#ffffff",
                                border: `1px solid ${tc.cardBorder}`,
                                color: tc.textPri,
                            }}
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="civic-amber-gradient px-3 py-2 rounded-lg text-slate-900 text-sm font-semibold disabled:opacity-50"
                        >
                            <Send className="h-3 w-3" />
                        </button>
                    </form>
                )}

                {/* Replies */}
                {getReplies(comment._id).map((reply) => renderComment(reply, true))}
            </div>
        </motion.div>
    );

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: tc.dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
                border: `1px solid ${tc.cardBorder}`,
            }}
        >
            {/* Toggle header */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" style={{ color: "#f5a623" }} />
                    <span className="font-semibold text-sm" style={{ color: tc.textPri }}>
                        Comments ({comments.length})
                    </span>
                </div>
                {open ? (
                    <ChevronUp className="h-4 w-4" style={{ color: tc.textSubtle }} />
                ) : (
                    <ChevronDown className="h-4 w-4" style={{ color: tc.textSubtle }} />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 overflow-hidden"
                    >
                        {/* Add comment form */}
                        {!replyTo && (
                            <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
                                <input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Add a comment…"
                                    className="flex-1 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#f5a623]/50"
                                    style={{
                                        background: tc.dark ? "rgba(255,255,255,0.08)" : "#ffffff",
                                        border: `1px solid ${tc.cardBorder}`,
                                        color: tc.textPri,
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={submitting || !text.trim()}
                                    className="civic-amber-gradient px-4 py-2.5 rounded-xl text-slate-900 font-semibold text-sm disabled:opacity-50 transition-opacity flex items-center gap-1"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Post
                                </button>
                            </form>
                        )}

                        {loading ? (
                            <p className="text-sm text-center py-4" style={{ color: tc.textSubtle }}>Loading…</p>
                        ) : topLevel.length === 0 ? (
                            <p className="text-sm text-center py-4" style={{ color: tc.textSubtle }}>
                                No comments yet. Be the first!
                            </p>
                        ) : (
                            <div>{topLevel.map((c) => renderComment(c))}</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommentSection;
