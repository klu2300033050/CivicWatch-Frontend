import { useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";

const typeIcon: Record<string, string> = {
    status_update: "🔄",
    comment: "💬",
    upvote: "👍",
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const { notifications, unreadCount, markRead, markAllRead } = useSocket();
    const tc = useThemeColors();

    return (
        <div className="relative">
            <button
                id="notification-bell"
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-xl transition-all hover:bg-white/10"
                style={{ border: `1px solid ${tc.cardBorder}` }}
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" style={{ color: tc.textPri }} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#f5a623] text-xs font-bold text-slate-900 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-12 w-80 z-50 rounded-2xl shadow-2xl overflow-hidden"
                            style={{
                                background: tc.dark ? "#0d1e35" : "#ffffff",
                                border: `1px solid ${tc.cardBorder}`,
                            }}
                        >
                            {/* Header */}
                            <div
                                className="flex items-center justify-between px-4 py-3"
                                style={{ borderBottom: `1px solid ${tc.cardBorder}` }}
                            >
                                <span className="font-semibold text-sm" style={{ color: tc.textPri }}>
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-2 px-1.5 py-0.5 rounded-full bg-[#f5a623] text-slate-900 text-xs font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </span>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
                                            style={{ color: tc.textSubtle }}
                                        >
                                            <CheckCheck className="h-3 w-3" /> Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setOpen(false)}>
                                        <X className="h-4 w-4" style={{ color: tc.textSubtle }} />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-8 text-center text-sm" style={{ color: tc.textSubtle }}>
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <button
                                            key={n._id}
                                            onClick={() => markRead(n._id)}
                                            className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors"
                                            style={{ borderBottom: `1px solid ${tc.cardBorder}` }}
                                        >
                                            <span className="text-lg flex-shrink-0">{typeIcon[n.type] || "🔔"}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: tc.textPri }}>
                                                    {n.message}
                                                </p>
                                                <p className="text-xs mt-1" style={{ color: tc.textSubtle }}>
                                                    {new Date(n.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {!n.read && (
                                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#f5a623] mt-1" />
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
