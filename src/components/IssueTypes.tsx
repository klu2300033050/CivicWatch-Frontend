import { Construction, Trash, TreeDeciduous, Wrench, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import roadImg from "../assets/road_infrastructure.png";
import wasteImg from "../assets/waste_management.png";
import envImg from "../assets/environmental_issues.png";
import utilsImg from "../assets/utilities_infrastructure.png";
import { useThemeColors } from "../hooks/useThemeColors";

const issueTypes = [
  { icon: Construction, title: "Road Infrastructure", description: "Report potholes, damaged roads, broken sidewalks, and street maintenance issues.", image: roadImg, count: "1,247 reports", color: "from-blue-600 to-blue-800", iconBg: "bg-blue-500" },
  { icon: Trash, title: "Waste Management", description: "Report illegal dumping, overflowing bins, litter, and garbage collection issues.", image: wasteImg, count: "892 reports", color: "from-emerald-600 to-teal-800", iconBg: "bg-emerald-500" },
  { icon: TreeDeciduous, title: "Environmental Issues", description: "Report damaged trees, fallen branches, landscaping problems, and green space issues.", image: envImg, count: "534 reports", color: "from-green-600 to-green-800", iconBg: "bg-green-500" },
  { icon: Wrench, title: "Utilities & Infrastructure", description: "Report water leaks, gas issues, electrical problems, and utility infrastructure concerns.", image: utilsImg, count: "678 reports", color: "from-amber-600 to-orange-800", iconBg: "bg-amber-500" },
];

const IssueTypes = () => {
  const tc = useThemeColors();

  return (
    <section className="py-24 civic-hero-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px),
                            linear-gradient(90deg, ${tc.dark ? "rgba(255,255,255,0.5)" : "rgba(15,42,74,0.4)"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px"
        }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
            style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}>
            <ShieldAlert className="h-4 w-4" style={{ color: "#f5a623" }} />
            Issue Categories
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: tc.textPri }}>
            What Can You <span className="text-amber-gradient">Report?</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: tc.textMuted }}>
            Our platform covers a wide range of civic issues to help keep your
            community safe and well-maintained.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {issueTypes.map((type, i) => (
            <motion.div key={type.title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group">
              <div className="rounded-2xl overflow-hidden glass-card
                              hover:scale-[1.03] hover:shadow-2xl transition-all duration-400 cursor-pointer">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img src={type.image} alt={type.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${type.color} opacity-50`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className={`absolute top-4 left-4 w-10 h-10 ${type.iconBg}
                                   rounded-xl flex items-center justify-center
                                   shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <span className="text-xs font-semibold text-white/90 bg-black/40
                                     backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                      {type.count}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <div className="p-5" style={{ background: tc.cardBody }}>
                  <h3 className="text-base font-bold mb-2" style={{ color: tc.textPri }}>{type.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: tc.textMuted }}>{type.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IssueTypes;
