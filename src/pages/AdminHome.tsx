import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  ArrowDown, ArrowUp, ChevronsUpDown, Edit,
  Search, Trash2, User, LayoutDashboard,
  CheckCircle2, Clock, XCircle, AlertTriangle,
  BarChart3, Map, Download,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { VITE_BACKEND_URL } from "../config/config";
import HeaderAfterAuth from "../components/HeaderAfterAuth";
import { motion } from "framer-motion";
import Player from "lottie-react";
import starloader from "../assets/animations/starloder.json";
import { useLoader } from "../contexts/LoaderContext";
import { useThemeColors } from "../hooks/useThemeColors";
import { useAuth } from "../contexts/AuthContext";
import IssueModal from "../components/IssueModal";

interface Issues {
  _id: string; title: string; description: string; type: string;
  location: { address: string; latitude: number; longitude: number };
  reportedBy: string; reportedAt: string; image: string; status: string;
  isAnonymous?: boolean;
}

const statusCfg: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  Resolved: { color: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  "In Progress": { color: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-500/30", dot: "bg-blue-400" },
  Pending: { color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/30", dot: "bg-amber-400" },
  Rejected: { color: "text-red-300", bg: "bg-red-500/15", border: "border-red-500/30", dot: "bg-red-400" },
  Reported: { color: "text-slate-300", bg: "bg-slate-500/15", border: "border-slate-500/30", dot: "bg-slate-400" },
};
const getSC = (s: string) => statusCfg[s] ?? statusCfg["Reported"];

const AdminHome = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issues[]>([]);
  const { hideLoader } = useLoader();
  const tc = useThemeColors();
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState<Issues | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`${VITE_BACKEND_URL}/api/v1/all-issues`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        });
        const data = await res.json();
        setIssues(Array.isArray(data.issues) ? data.issues : []);
      } catch (e) { console.error(e); setIssues([]); }
      finally { setLoading(false); hideLoader(); }
    };
    fetchIssues();
  }, [hideLoader]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`${VITE_BACKEND_URL}/api/v1/admin/issue/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setIssues(prev => prev.map(i => i._id === id ? { ...i, status } : i));
    } catch (e) { console.error(e); }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      const res = await fetch(`${VITE_BACKEND_URL}/api/v1/issue/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      if (res.ok) setIssues(prev => prev.filter(i => i._id !== id));
    } catch (e) { console.error(e); }
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${VITE_BACKEND_URL}/api/v1/admin/export-csv`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `civicwatch_${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortColumn(col); setSortDirection("asc"); }
  };

  // Maps old DB category names → standardised filter labels
  const CATEGORY_ALIAS: Record<string, string> = {
    "Road Infrastructure": "Roads",
    "Waste Management": "Garbage",
    "Environmental Issues": "Water",
    "Utilities & Infrastructure": "Electricity",
  };
  const normalizeCat = (type: string) => CATEGORY_ALIAS[type] ?? type;

  // Domain-based access control for Admins
  const accessibleIssues = issues.filter(i => {
    if (!user?.department || user.department === "All") return true;
    return normalizeCat(i.type) === user.department;
  });

  const sorted = [...accessibleIssues].sort((a, b) => {
    if (!sortColumn) return 0;
    const av = a[sortColumn as keyof typeof a] as string;
    const bv = b[sortColumn as keyof typeof b] as string;
    return sortDirection === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const CATEGORIES = ["All", "Roads", "Electricity", "Water", "Garbage", "Public Safety", "Other"];

  const filtered = sorted.filter(i => {
    const q = searchQuery.toLowerCase();
    const match = i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.location.address.toLowerCase().includes(q);
    const sf = statusFilters.length === 0 || statusFilters.includes(i.status);
    const cf = categoryFilter === "All" || normalizeCat(i.type) === categoryFilter;
    return match && sf && cf;
  });

  const statCards = [
    { label: "Total Issues", value: accessibleIssues.length, color: tc.textPri, icon: AlertTriangle },
    { label: "Resolved Issues", value: accessibleIssues.filter(i => i.status === "Resolved").length, color: "#34d399", icon: CheckCircle2 },
    { label: "Issues In Progress", value: accessibleIssues.filter(i => i.status === "In Progress").length, color: "#60a5fa", icon: Clock },
    { label: "Pending", value: accessibleIssues.filter(i => ["Pending", "Reported"].includes(i.status)).length, color: "#fbbf24", icon: XCircle },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen civic-hero-bg">
        <Player autoplay loop animationData={starloader} style={{ height: "200px", width: "200px" }} />
        <p className="mt-4 text-sm" style={{ color: tc.textMuted }}>Loading admin dashboard…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-screen civic-hero-bg">
      <HeaderAfterAuth />

      <div className="pt-24 container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-3"
              style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}>
              <LayoutDashboard className="h-3 w-3" style={{ color: tc.iconAmber }} />
              Admin Control Panel
            </div>
            <h1 className="text-4xl font-bold" style={{ color: tc.textPri }}>Admin Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: tc.textMuted }}>
              Manage and resolve community issues
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/admin/analytics">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                <BarChart3 className="h-4 w-4" style={{ color: tc.iconAmber }} />
                <span className="hidden sm:block">Analytics</span>
              </button>
            </Link>
            <Link to="/map">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                <Map className="h-4 w-4" style={{ color: tc.iconAmber }} />
                <span className="hidden sm:block">Map</span>
              </button>
            </Link>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
              style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
              <Download className="h-4 w-4" style={{ color: tc.iconAmber }} />
              <span className="hidden sm:block">Export CSV</span>
            </button>
            <Link to="/admin/profile">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                <User className="h-4 w-4" style={{ color: tc.iconAmber }} />
                My Profile
              </button>
            </Link>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:scale-[1.03] transition-transform duration-300">
                <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: tc.iconMuted }} />
                  <p className="text-xs" style={{ color: tc.textSubtle }}>{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: tc.textSubtle }} />
            <Input type="text" placeholder="Search issues…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl focus:border-[#f5a623]"
              style={{ background: tc.inputBg, borderColor: tc.inputBorder, color: tc.textPri }} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                                 transition-all"
                style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
                Filter by Status <ChevronsUpDown className="h-4 w-4" style={{ color: tc.textSubtle }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]"
              style={{ background: tc.dark ? "#0d1e35" : "#ffffff", borderColor: tc.cardBorder }}>
              {["Resolved", "In Progress", "Pending", "Rejected", "Reported"].map(s => (
                <DropdownMenuCheckboxItem key={s}
                  checked={statusFilters.includes(s)}
                  onCheckedChange={checked =>
                    setStatusFilters(prev => checked ? [...prev, s] : prev.filter(x => x !== s))
                  }
                  style={{ color: tc.textPri }}
                  className="focus:bg-white/10">
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(!user?.department || user.department === "All") && (
            <>
              <span className="text-xs font-medium" style={{ color: tc.textSubtle }}>Category:</span>
              {CATEGORIES.slice(0, 7).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: categoryFilter === cat ? "#f5a623" : tc.profileBtnBg,
                    color: categoryFilter === cat ? "#1e293b" : tc.textPri,
                    border: `1px solid ${categoryFilter === cat ? "#f5a623" : tc.cardBorder}`,
                  }}
                >
                  {cat}
                </button>
              ))}
              {categoryFilter !== "All" && (
                <button
                  onClick={() => setCategoryFilter("All")}
                  className="px-2 py-1 text-xs rounded-full transition-all"
                  style={{ color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }}
                >
                  ✕ Clear
                </button>
              )}
            </>
          )}
          <span className="text-xs ml-auto" style={{ color: tc.textSubtle }}>
            {filtered.length} of {accessibleIssues.length} issues
          </span>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <Table>
            <TableCaption className="py-4" style={{ color: tc.textSubtle }}>
              A list of all reported issues.
            </TableCaption>
            <TableHeader>
              <TableRow style={{ borderColor: tc.cardBorder }}>
                {[["title", "Title"], ["location", "Location"], ["status", "Status"]].map(([col, label]) => (
                  <TableHead key={col}>
                    <button onClick={() => handleSort(col)}
                      className="flex items-center gap-1 text-sm font-semibold w-full"
                      style={{ color: tc.textLabel }}>
                      {label}
                      {sortColumn === col
                        ? (sortDirection === "asc"
                          ? <ArrowUp className="h-3 w-3" style={{ color: tc.iconAmber }} />
                          : <ArrowDown className="h-3 w-3" style={{ color: tc.iconAmber }} />)
                        : <ChevronsUpDown className="h-3 w-3 opacity-30" />}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="text-right text-sm font-semibold" style={{ color: tc.textLabel }}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((issue) => {
                const sc = getSC(issue.status);
                return (
                  <TableRow key={issue._id}
                    onClick={() => setSelectedIssue(issue)}
                    style={{ borderColor: tc.cardBorder, cursor: "pointer" }}
                    className="hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium" style={{ color: tc.textPri }}>
                      {issue.title}
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: tc.textMuted }}>
                      {issue.location.address}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                        text-xs font-medium border ${sc.bg} ${sc.color} ${sc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {issue.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Update status">
                              <Edit className="h-4 w-4" style={{ color: tc.iconAmber }} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end"
                            style={{ background: tc.dark ? "#0d1e35" : "#ffffff", borderColor: tc.cardBorder }}
                            className="min-w-[160px]">
                            {["Resolved", "In Progress", "Rejected", "Pending"].map(s => (
                              <button key={s}
                                onClick={() => handleStatusUpdate(issue._id, s)}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm
                                           hover:bg-black/10 transition-colors"
                                style={{ color: tc.textPri }}>
                                <span className={`w-2 h-2 rounded-full ${getSC(s).dot}`} />
                                {s}
                              </button>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button onClick={() => handleDeleteIssue(issue._id)}
                          className="p-2 rounded-lg hover:bg-red-500/15 transition-colors" title="Delete issue">
                          <Trash2 className="h-4 w-4" style={{ color: "#f87171" }} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow style={{ borderColor: tc.cardBorder }}>
                  <TableCell colSpan={4} className="text-center py-10" style={{ color: tc.textSubtle }}>
                    No issues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
    </motion.div>
  );
};

export default AdminHome;
