import { ArrowRight, Camera, MapPin, Users, TrendingUp, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import heroImg from "../assets/hero.png";
import { useThemeColors } from "../hooks/useThemeColors";

const Hero = () => {
  const { user } = useAuth();
  const tc = useThemeColors();

  const stats = [
    { value: "2,847", label: "Issues Resolved", icon: TrendingUp },
    { value: "15,239", label: "Active Citizens", icon: Users },
    { value: "48h", label: "Avg Response", icon: Shield },
  ];

  return (
    <section className="relative overflow-hidden civic-hero-bg min-h-screen flex items-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #2563b0 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: "radial-gradient(circle, #f5a623 0%, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px),
                              linear-gradient(90deg, ${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px)`,
            backgroundSize: "60px 60px"
          }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-20 mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text Content */}
          <div className="space-y-8 animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
              style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}>
              <span className="w-2 h-2 rounded-full bg-[#f5a623] animate-pulse-ring" />
              Civic Issue Reporting Platform
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight" style={{ color: tc.textPri }}>
                Report Issues,
                <br />
                <span className="text-amber-gradient">Transform</span>
                <br />
                Your City
              </h1>
              <p className="text-lg max-w-xl leading-relaxed" style={{ color: tc.textMuted }}>
                Empower your community. From potholes to broken streetlights —
                report civic issues instantly and track real progress.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={user?.role === "citizen" ? "/citizen/create-issue" : user?.role === "admin" ? "/" : "/signin"}>
                <Button size="lg"
                  className="relative civic-amber-gradient border-0 text-slate-900 font-semibold
                             flex items-center gap-2 px-8 py-4 text-base
                             shadow-lg hover:shadow-xl hover:scale-[1.03]
                             transition-all duration-300 overflow-hidden group rounded-xl">
                  <span className="absolute inset-0 bg-white/20 -translate-x-full skew-x-12
                                   group-hover:translate-x-full transition-transform duration-700" />
                  <Camera className="h-5 w-5" />
                  <span className="relative z-10">Report an Issue</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>

              <Link to={user?.role === "citizen" ? "/citizen" : user?.role === "admin" ? "/admin" : "/signin"}>
                <Button variant="outline" size="lg"
                  className="flex items-center gap-2 px-8 py-4 text-base font-medium
                             transition-all duration-300 rounded-xl backdrop-blur-sm"
                  style={{
                    borderColor: tc.dark ? "rgba(255,255,255,0.30)" : "rgba(15,42,74,0.25)",
                    color: tc.textPri,
                    background: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(15,42,74,0.05)",
                  }}>
                  <MapPin className="h-5 w-5" style={{ color: "#f5a623" }} />
                  <span>View Reports</span>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6" style={{ borderTop: `1px solid ${tc.cardBorder}` }}>
              {stats.map(stat => (
                <div key={stat.label} className="text-center p-3 rounded-xl backdrop-blur-sm"
                  style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}` }}>
                  <stat.icon className="h-4 w-4 mx-auto mb-1" style={{ color: "#f5a623" }} />
                  <div className="text-2xl font-bold" style={{ color: tc.textPri }}>{stat.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: tc.textMuted }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Hero Image Card */}
          <div className="relative animate-float">
            <div className="relative group rounded-2xl overflow-hidden shadow-2xl navy-glow">
              <img src={heroImg} alt="Citizen reporting a civic issue"
                className="w-full h-[520px] object-cover transition-all duration-700
                           group-hover:scale-[1.04] group-hover:brightness-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060f1e]/60 via-transparent to-transparent" />
              <span aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12
                           bg-white/8 blur-md opacity-0 group-hover:opacity-100 group-hover:animate-hero-shine" />

              {/* Floating badge: Issue Reported */}
              <div className="absolute top-5 left-5 glass-card rounded-xl px-4 py-3
                              transition-all duration-500 group-hover:translate-y-1 group-hover:scale-[1.02]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse-ring" />
                  <span className="text-sm font-semibold" style={{ color: tc.textPri }}>Issue Reported</span>
                </div>
              </div>

              {/* Floating badge: Community Active */}
              <div className="absolute bottom-5 right-5 glass-card rounded-xl px-4 py-3
                              transition-all duration-500 delay-100 group-hover:-translate-y-1 group-hover:scale-[1.02]">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4" style={{ color: "#f5a623" }} />
                  <span className="text-sm font-semibold" style={{ color: tc.textPri }}>Community Active</span>
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 rounded-3xl border border-white/5 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
