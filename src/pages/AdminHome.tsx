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

interface Issues {
  _id: string; title: string; description: string; type: string;
  location: { address: string; latitude: number; longitude: number };
  reportedBy: string; reportedAt: string; image: string; status: string;
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
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issues[]>([]);
  const { hideLoader } = useLoader();
  const tc = useThemeColors();

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

  const handleSort = (col: string) => {
    if (sortColumn === col) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortColumn(col); setSortDirection("asc"); }
  };

  const sorted = [...issues].sort((a, b) => {
    if (!sortColumn) return 0;
    const av = a[sortColumn as keyof typeof a] as string;
    const bv = b[sortColumn as keyof typeof b] as string;
    return sortDirection === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const filtered = sorted.filter(i => {
    const q = searchQuery.toLowerCase();
    const match = i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.location.address.toLowerCase().includes(q);
    const sf = statusFilters.length === 0 || statusFilters.includes(i.status);
    return match && sf;
  });

  const statCards = [
    { label: "Total Issues", value: issues.length, color: tc.textPri, icon: AlertTriangle },
    { label: "Resolved Issues", value: issues.filter(i => i.status === "Resolved").length, color: "#34d399", icon: CheckCircle2 },
    { label: "Issues In Progress", value: issues.filter(i => i.status === "In Progress").length, color: "#60a5fa", icon: Clock },
    { label: "Pending", value: issues.filter(i => ["Pending", "Reported"].includes(i.status)).length, color: "#fbbf24", icon: XCircle },
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
        <div className="flex items-start justify-between">
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
          <Link to="/admin/profile">
            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                               transition-all"
              style={{ color: tc.textPri, background: tc.profileBtnBg, border: `1px solid ${tc.profileBtnBorder}` }}>
              <User className="h-4 w-4" style={{ color: tc.iconAmber }} />
              My Profile
            </button>
          </Link>
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
              {filtered.map((issue, i) => {
                const sc = getSC(issue.status);
                return (
                  <TableRow key={issue._id}
                    style={{ borderColor: tc.cardBorder }}
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
                    <TableCell className="text-right">
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
    </motion.div>
  );
};

export default AdminHome;
