import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { VITE_BACKEND_URL } from "../config/config";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface Notification {
    _id: string;
    type: "status_update" | "comment" | "upvote";
    message: string;
    issueId?: string;
    read: boolean;
    createdAt: string;
}

interface SocketContextType {
    notifications: Notification[];
    unreadCount: number;
    markRead: (id: string) => Promise<void>;
    markAllRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Use AuthContext as source of truth — not localStorage directly
    const { user, token } = useAuth();

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (_) { /* silent */ }
    };

    useEffect(() => {
        // Only connect when we have a logged-in user with an ID
        if (!token || !user?.id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setNotifications([]);
            return;
        }

        fetchNotifications();

        // Wrapped in try/catch — ad-blocker ERR_BLOCKED_BY_CLIENT must not crash the app
        try {
            const socket = io(VITE_BACKEND_URL, {
                withCredentials: true,
                transports: ["websocket", "polling"],
                reconnectionAttempts: 3,
                timeout: 5000,
            });
            socketRef.current = socket;

            socket.on("connect", () => {
                console.log("🔌 Socket connected:", socket.id);
                socket.emit("join", user.id);
            });

            socket.on("connect_error", (err) => {
                // Silently swallow — ad-blocker or network issue
                console.warn("Socket unavailable:", err.message);
            });

            socket.on("notification", (notif: Notification) => {
                setNotifications((prev) => [notif, ...prev]);
                toast.info(notif.message, {
                    duration: 6000,
                    description: notif.type === "status_update"
                        ? "Tap the bell icon to see all notifications"
                        : undefined,
                });
            });
        } catch (err) {
            console.warn("Socket setup failed (likely blocked by browser extension):", err);
        }

        return () => {
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [token, user?.id]);

    const markRead = async (id: string) => {
        if (!token) return;
        await fetch(`${VITE_BACKEND_URL}/api/v1/notifications/${id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
    };

    const markAllRead = async () => {
        if (!token) return;
        await fetch(`${VITE_BACKEND_URL}/api/v1/notifications/read-all`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <SocketContext.Provider
            value={{ notifications, unreadCount, markRead, markAllRead, refreshNotifications: fetchNotifications }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
    return ctx;
};
