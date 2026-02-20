import { Camera, MapPin, Send, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeColors } from "../hooks/useThemeColors";

const steps = [
  { icon: Camera, title: "Capture the Issue", description: "Take a clear photo of the infrastructure problem using your mobile device or camera.", color: "bg-blue-500", glow: "shadow-blue-500/40", number: "01" },
  { icon: MapPin, title: "Add Location", description: "GPS automatically captures the exact location, or manually pin it on the interactive map.", color: "bg-emerald-500", glow: "shadow-emerald-500/40", number: "02" },
  { icon: Send, title: "Submit Report", description: "Add a brief description and submit your report to the appropriate authorities instantly.", color: "bg-[#f5a623]", glow: "shadow-amber-500/40", number: "03" },
  { icon: CheckCircle, title: "Track Progress", description: "Monitor the status of your report and receive updates when action is taken.", color: "bg-purple-500", glow: "shadow-purple-500/40", number: "04" },
];

const HowItWorks = () => {
  const tc = useThemeColors();

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden"
      style={{ background: tc.dark ? "linear-gradient(180deg,#0d1e35 0%,#0a1628 100%)" : "linear-gradient(180deg,#e8f0fb 0%,#f0f6fe 100%)" }}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e4d8c] to-transparent opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
            style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}>
            <ArrowRight className="h-4 w-4" style={{ color: "#f5a623" }} />
            Simple Process
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: tc.textPri }}>
            How It <span className="text-amber-gradient">Works</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: tc.textMuted }}>
            Reporting civic issues is simple and straightforward. Follow these four easy steps to make a difference.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5
                          bg-gradient-to-r from-blue-300 via-[#f5a623] to-purple-300 opacity-40 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div key={step.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }} transition={{ delay: i * 0.15, duration: 0.5 }}>
                <div className="group rounded-2xl p-6 text-center
                                hover:scale-[1.03] hover:shadow-xl transition-all duration-300"
                  style={{
                    background: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.90)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${tc.cardBorder}`,
                  }}>
                  <div className="text-xs font-bold mb-4 tracking-widest" style={{ color: tc.textSubtle }}>
                    STEP {step.number}
                  </div>
                  <div className="relative inline-flex mb-5">
                    <div className={`w-16 h-16 ${step.color} ${step.glow} shadow-lg rounded-2xl
                                     flex items-center justify-center mx-auto
                                     group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full
                                    flex items-center justify-center text-xs font-bold
                                    border-2 shadow-md"
                      style={{ background: tc.dark ? "#0f2a4a" : "#1e4d8c", color: "#fff", borderColor: tc.dark ? "#ffffff" : "#e8f0fb" }}>
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: tc.textPri }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: tc.textMuted }}>{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1e4d8c] to-transparent opacity-30" />
    </section>
  );
};

export default HowItWorks;
