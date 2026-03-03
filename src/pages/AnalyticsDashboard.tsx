import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Filler,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { VITE_BACKEND_URL } from "../config/config";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import { motion } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";
import { useLoader } from "../contexts/LoaderContext";
import { BarChart3, Download, RefreshCw, TrendingUp, CheckCircle, AlertCircle, PieChart } from "lucide-react";
import { toast } from "sonner";

ChartJS.register(
    ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, Title, Filler
);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AnalyticsDashboard = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const tc = useThemeColors();
    const { hideLoader } = useLoader();
    const token = localStorage.getItem("auth_token");

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/admin/analytics`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            setData(json);
        } catch {
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
            hideLoader();
        }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    const handleExport = async () => {
        try {
            const res = await fetch(`${VITE_BACKEND_URL}/api/v1/admin/export-csv`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `civicwatch_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("CSV exported!");
        } catch {
            toast.error("Export failed");
        }
    };

    const chartOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: tc.textMuted, font: { size: 12 } } },
        },
        scales: {
            x: { ticks: { color: tc.textSubtle }, grid: { color: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" } },
            y: { ticks: { color: tc.textSubtle }, grid: { color: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" } },
        },
    };

    const statusColors = ["#34d399", "#60a5fa", "#fbbf24", "#f87171", "#94a3b8", "#a78bfa"];
    const categoryColors = ["#f5a623", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

    const doughnutData = data ? {
        labels: (data.byStatus || []).map((s: any) => s.status),
        datasets: [{
            data: (data.byStatus || []).map((s: any) => s.count),
            backgroundColor: statusColors.map(c => c + "cc"),
            borderColor: statusColors,
            borderWidth: 2,
        }],
    } : null;

    const barData = data ? {
        labels: (data.byCategory || []).map((c: any) => c.category),
        datasets: [{
            label: "Complaints",
            data: (data.byCategory || []).map((c: any) => c.count),
            backgroundColor: categoryColors.map(c => c + "99"),
            borderColor: categoryColors,
            borderWidth: 2,
            borderRadius: 6,
        }],
    } : null;

    const lineData = data ? {
        labels: (data.monthly || []).map((m: any) => `${MONTH_NAMES[m.month - 1]} ${m.year}`),
        datasets: [
            {
                label: "Total Reported",
                data: (data.monthly || []).map((m: any) => m.count),
                borderColor: "#f5a623",
                backgroundColor: "rgba(245,166,35,0.15)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Resolved",
                data: (data.monthly || []).map((m: any) => m.resolved),
                borderColor: "#34d399",
                backgroundColor: "rgba(52,211,153,0.15)",
                fill: true,
                tension: 0.4,
            },
        ],
    } : null;

    const statCards = data ? [
        { label: "Total Complaints", value: data.total, color: "#f5a623", icon: AlertCircle },
        { label: "Resolved", value: data.resolvedCount, color: "#34d399", icon: CheckCircle },
        { label: "Resolution Rate", value: `${data.resolvedPercentage}%`, color: "#60a5fa", icon: TrendingUp },
        { label: "Categories", value: (data.byCategory || []).length, color: "#a78bfa", icon: PieChart },
    ] : [];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen civic-hero-bg">
            <HeaderAfterAuth />

            <div className="pt-24 pb-10 px-4 sm:px-6 lg:px-8 container mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-3"
                            style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}
                        >
                            <BarChart3 className="h-3 w-3" style={{ color: tc.iconAmber }} />
                            Analytics
                        </div>
                        <h1 className="text-4xl font-bold" style={{ color: tc.textPri }}>Analytics Dashboard</h1>
                        <p className="mt-1 text-sm" style={{ color: tc.textMuted }}>
                            Real-time insights into civic complaint data
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchAnalytics}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.cardBorder}` }}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} style={{ color: tc.iconAmber }} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all civic-amber-gradient"
                            style={{ color: "#1e293b" }}
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <RefreshCw className="h-10 w-10 animate-spin mb-4" style={{ color: "#f5a623" }} />
                        <p style={{ color: tc.textMuted }}>Loading analytics…</p>
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {statCards.map((card, i) => {
                                const Icon = card.icon;
                                return (
                                    <motion.div
                                        key={card.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="glass-card rounded-2xl p-6"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Icon className="h-5 w-5" style={{ color: card.color }} />
                                        </div>
                                        <div className="text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</div>
                                        <p className="text-xs" style={{ color: tc.textSubtle }}>{card.label}</p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Status Doughnut */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card rounded-2xl p-6"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: tc.textPri }}>
                                    <PieChart className="h-4 w-4" style={{ color: "#f5a623" }} />
                                    Status Distribution
                                </h2>
                                <div style={{ height: 260 }}>
                                    {doughnutData && (
                                        <Doughnut
                                            data={doughnutData}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        position: "right",
                                                        labels: { color: tc.textMuted, font: { size: 11 }, padding: 16 },
                                                    },
                                                },
                                                cutout: "60%",
                                            }}
                                        />
                                    )}
                                </div>
                            </motion.div>

                            {/* Category Bar */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="glass-card rounded-2xl p-6"
                            >
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: tc.textPri }}>
                                    <BarChart3 className="h-4 w-4" style={{ color: "#f5a623" }} />
                                    Complaints by Category
                                </h2>
                                <div style={{ height: 260 }}>
                                    {barData && (
                                        <Bar
                                            data={barData}
                                            options={{
                                                ...chartOpts,
                                                plugins: { legend: { display: false } },
                                                indexAxis: "y" as const,
                                            }}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Monthly Trend Line */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card rounded-2xl p-6"
                        >
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: tc.textPri }}>
                                <TrendingUp className="h-4 w-4" style={{ color: "#f5a623" }} />
                                Monthly Complaint Trends (Last 6 Months)
                            </h2>
                            <div style={{ height: 280 }}>
                                {lineData && (
                                    <Line data={lineData} options={chartOpts} />
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default AnalyticsDashboard;
