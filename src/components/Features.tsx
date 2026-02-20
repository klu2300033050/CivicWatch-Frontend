import { BarChart3, Camera, MapPin, Shield, Users, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";

const features = [
  { icon: Camera, title: "Photo Documentation", description: "Capture and upload high-quality images of infrastructure issues with automatic metadata tagging.", color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
  { icon: MapPin, title: "GPS Location Tracking", description: "Precise location capture using GPS coordinates ensures accurate issue positioning and faster response.", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  { icon: Users, title: "Community Engagement", description: "Connect with neighbors, track issue status, and see the impact of your reports on the community.", color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30" },
  { icon: Zap, title: "Real-time Updates", description: "Get instant notifications about your reported issues and track resolution progress in real-time.", color: "text-[#f5a623]", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  { icon: Shield, title: "Admin Dashboard", description: "Comprehensive administrative tools for managing reports, assigning tasks, and monitoring city-wide issues.", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
  { icon: BarChart3, title: "Analytics & Insights", description: "Data-driven insights help administrators prioritize resources and track community improvement trends.", color: "text-indigo-400", bg: "bg-indigo-500/15", border: "border-indigo-500/30" },
];

const Features = () => {
  const tc = useThemeColors();

  return (
    <section id="features" className="py-24 relative overflow-hidden"
      style={{ background: tc.dark ? "linear-gradient(180deg,#0a1628 0%,#0d1e35 100%)" : "linear-gradient(180deg,#f0f6fe 0%,#e8f0fb 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e4d8c] to-transparent opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
            style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}>
            <Sparkles className="h-4 w-4" style={{ color: "#f5a623" }} />
            Platform Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: tc.textPri }}>
            Powerful Tools for
            <span className="block text-amber-gradient">Better Communities</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: tc.textMuted }}>
            Everything you need to report, track, and resolve civic issues efficiently.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <div className={`group h-full rounded-2xl p-6 border ${f.border}
                               hover:scale-[1.02] hover:shadow-xl transition-all duration-300`}
                style={{ background: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.90)", backdropFilter: "blur(12px)" }}>
                <div className={`w-12 h-12 ${f.bg} ${f.border} border rounded-xl
                                 flex items-center justify-center mb-5
                                 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: tc.textPri }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: tc.textMuted }}>{f.description}</p>
                <div className={`mt-5 h-0.5 w-0 group-hover:w-full transition-all duration-500
                                 bg-gradient-to-r from-current to-transparent ${f.color}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e4d8c] to-transparent opacity-30" />
    </section>
  );
};

export default Features;
