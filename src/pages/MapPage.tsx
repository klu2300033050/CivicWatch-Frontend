import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VITE_BACKEND_URL } from "../config/config";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import { motion } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";
import { MapPin, Filter, RefreshCw } from "lucide-react";
import { useLoader } from "../contexts/LoaderContext";

// Fix default Leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const statusColors: Record<string, string> = {
    Resolved: "#34d399",
    "In Progress": "#60a5fa",
    Pending: "#fbbf24",
    Rejected: "#f87171",
    Reported: "#94a3b8",
    Assigned: "#a78bfa",
};

const createColorMarker = (color: string) =>
    L.divIcon({
        html: `<div style="
      background:${color};
      width:16px;height:16px;
      border-radius:50%;
      border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    "></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    });

interface Issue {
    _id: string;
    title: string;
    description: string;
    status: string;
    issueType: string;   // new field name
    type: string;        // old field name (also sent by API)
    location: { latitude: number; longitude: number; address: string };
    upvoteCount?: number;
}

const CATEGORIES = ["All", "Roads", "Electricity", "Water", "Garbage", "Public Safety", "Other"];

// Maps legacy DB values → standardised filter label
const CATEGORY_ALIAS: Record<string, string> = {
    "Road Infrastructure": "Roads",
    "Waste Management": "Garbage",
    "Environmental Issues": "Water",
    "Utilities & Infrastructure": "Electricity",
};

/** Returns the canonical category label for an issue */
const normalizeCategory = (issue: Issue): string => {
    const raw = issue.issueType || issue.type || "";
    return CATEGORY_ALIAS[raw] ?? raw;
};

const MapPage = () => {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [radiusKm, setRadiusKm] = useState<number | null>(null);
    const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // India default
    const tc = useThemeColors();
    const { hideLoader } = useLoader();

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        Promise.all([
            fetch(`${VITE_BACKEND_URL}/api/v1/all-issues`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json()),
        ])
            .then(([data]) => {
                const all: Issue[] = (data.issues || []).filter(
                    (i: any) => i.location?.latitude && i.location?.longitude
                );
                setIssues(all);
                // Center map on first issue
                if (all.length > 0) {
                    setCenter([all[0].location.latitude, all[0].location.longitude]);
                }
            })
            .catch(console.error)
            .finally(() => {
                setLoading(false);
                hideLoader();
            });

        // Use browser geolocation as center if available
        navigator.geolocation?.getCurrentPosition((pos) => {
            setCenter([pos.coords.latitude, pos.coords.longitude]);
        });
    }, [hideLoader]);

    const filtered = issues.filter((i) => {
        if (selectedCategory !== "All" && normalizeCategory(i) !== selectedCategory) return false;
        return true;
    });

    // Count per category for badge display
    const categoryCounts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
        acc[cat] = cat === "All"
            ? issues.length
            : issues.filter((i) => normalizeCategory(i) === cat).length;
        return acc;
    }, {});

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen civic-hero-bg">
            <HeaderAfterAuth />

            <div className="pt-24 pb-6 px-4 sm:px-6 lg:px-8 container mx-auto space-y-4">
                {/* Header */}
                <div>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-3"
                        style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}
                    >
                        <MapPin className="h-3 w-3" style={{ color: tc.iconAmber }} />
                        Live Complaint Map
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: tc.textPri }}>
                        Issue Map
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: tc.textMuted }}>
                        See all reported civic issues on the map
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" style={{ color: tc.iconAmber }} />
                        <span className="text-sm font-medium" style={{ color: tc.textPri }}>Category:</span>
                    </div>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className="px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
                            style={{
                                background: selectedCategory === cat ? "#f5a623" : tc.profileBtnBg,
                                color: selectedCategory === cat ? "#1e293b" : tc.textPri,
                                border: `1px solid ${selectedCategory === cat ? "#f5a623" : tc.cardBorder}`,
                            }}
                        >
                            {cat}
                            {categoryCounts[cat] > 0 && (
                                <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                    style={{
                                        background: selectedCategory === cat ? "rgba(0,0,0,0.2)" : "rgba(245,166,35,0.2)",
                                        color: selectedCategory === cat ? "#1e293b" : "#f5a623",
                                    }}
                                >
                                    {categoryCounts[cat]}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs" style={{ color: tc.textMuted }}>Radius filter:</span>
                        {[null, 5, 10, 25].map((r) => (
                            <button
                                key={String(r)}
                                onClick={() => setRadiusKm(r)}
                                className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    background: radiusKm === r ? "#f5a623" : tc.profileBtnBg,
                                    color: radiusKm === r ? "#1e293b" : tc.textPri,
                                    border: `1px solid ${radiusKm === r ? "#f5a623" : tc.cardBorder}`,
                                }}
                            >
                                {r === null ? "All" : `${r} km`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap gap-3">
                    {Object.entries(statusColors).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-xs" style={{ color: tc.textSubtle }}>{status}</span>
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="rounded-2xl overflow-hidden" style={{ height: 520, border: `1px solid ${tc.cardBorder}` }}>
                    {loading ? (
                        <div className="h-full flex items-center justify-center" style={{ background: tc.dark ? "#0a1628" : "#e8f0fb" }}>
                            <div className="flex flex-col items-center gap-3">
                                <RefreshCw className="h-8 w-8 animate-spin" style={{ color: "#f5a623" }} />
                                <p className="text-sm" style={{ color: tc.textMuted }}>Loading map data…</p>
                            </div>
                        </div>
                    ) : (
                        <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {radiusKm && (
                                <Circle
                                    center={center}
                                    radius={radiusKm * 1000}
                                    pathOptions={{ color: "#f5a623", fillColor: "#f5a623", fillOpacity: 0.08 }}
                                />
                            )}
                            {filtered.map((issue) => (
                                <Marker
                                    key={issue._id}
                                    position={[issue.location.latitude, issue.location.longitude]}
                                    icon={createColorMarker(statusColors[issue.status] || statusColors.Reported)}
                                >
                                    <Popup>
                                        <div style={{ minWidth: 180 }}>
                                            <p className="font-bold text-sm mb-1">{issue.title}</p>
                                            <p className="text-xs text-gray-500 mb-1">{normalizeCategory(issue)}</p>
                                            <p className="text-xs mb-1">{issue.location.address}</p>
                                            <span
                                                className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                                                style={{
                                                    background: (statusColors[issue.status] || "#94a3b8") + "33",
                                                    color: statusColors[issue.status] || "#94a3b8",
                                                }}
                                            >
                                                {issue.status}
                                            </span>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

                <p className="text-xs text-center" style={{ color: tc.textSubtle }}>
                    Showing {filtered.length} of {issues.length} issues
                </p>
            </div>
        </motion.div>
    );
};

export default MapPage;
