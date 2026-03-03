import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { VITE_BACKEND_URL } from "../config/config";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    issueId: string;
    initialCount: number;
    initialUpvoted?: boolean;
    disabled?: boolean; // e.g. for admins
}

const UpvoteButton = ({ issueId, initialCount, initialUpvoted = false, disabled = false }: Props) => {
    const [count, setCount] = useState(initialCount);
    const [upvoted, setUpvoted] = useState(initialUpvoted);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("auth_token");

    const handleUpvote = async () => {
        if (disabled || loading) return;
        setLoading(true);

        // Optimistic update
        const newUpvoted = !upvoted;
        setUpvoted(newUpvoted);
        setCount((c) => c + (newUpvoted ? 1 : -1));

        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issues/${issueId}/upvote`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setCount(data.upvotes);
                setUpvoted(data.upvoted);
            } else {
                // Revert on error
                setUpvoted(!newUpvoted);
                setCount((c) => c + (newUpvoted ? -1 : 1));
                toast.error(data.message || "Failed to upvote");
            }
        } catch {
            // Revert
            setUpvoted(!newUpvoted);
            setCount((c) => c + (newUpvoted ? -1 : 1));
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleUpvote}
            disabled={disabled || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
                background: upvoted ? "rgba(245,166,35,0.18)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${upvoted ? "#f5a623" : "rgba(255,255,255,0.15)"}`,
                color: upvoted ? "#f5a623" : "#94a3b8",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
            }}
            title={disabled ? "Only citizens can upvote" : upvoted ? "Remove upvote" : "Support this issue"}
        >
            <ThumbsUp
                className={`h-3.5 w-3.5 transition-transform ${loading ? "animate-pulse" : ""} ${upvoted ? "scale-110" : ""}`}
            />
            <AnimatePresence mode="wait">
                <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                >
                    {count}
                </motion.span>
            </AnimatePresence>
        </button>
    );
};

export default UpvoteButton;
