import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Shield, Users, Sparkles } from "lucide-react";
import { handleSupportClick } from "./SupportModel";
import { useThemeColors } from "../hooks/useThemeColors";

const CTA = () => {
  const tc = useThemeColors();

  return (
    <section className="py-24 civic-hero-bg relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #f5a623 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563b0 0%, transparent 70%)" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
            style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}`, color: tc.pageBadgeText }}>
            <Sparkles className="h-4 w-4" style={{ color: "#f5a623" }} />
            Join the Movement
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ color: tc.textPri }}>
            Ready to Make a{" "}
            <span className="text-amber-gradient">Difference?</span>
          </h2>
          <p className="text-lg mb-14 max-w-2xl mx-auto" style={{ color: tc.textMuted }}>
            Join thousands of engaged citizens working together to build safer,
            cleaner, and better communities. Your report can spark real change.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <div className="glass-card rounded-2xl p-7 text-center hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30
                              flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: tc.textPri }}>For Citizens</h3>
              <p className="text-sm mb-5" style={{ color: tc.textMuted }}>
                Report issues, track progress, and engage with your community
              </p>
              <Link to="/signin">
                <Button className="w-full civic-amber-gradient border-0 text-slate-900
                                   font-semibold flex items-center justify-center gap-2
                                   hover:opacity-90 transition-opacity rounded-xl">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="glass-card rounded-2xl p-7 text-center hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30
                              flex items-center justify-center mx-auto mb-4">
                <Shield className="h-7 w-7" style={{ color: "#f5a623" }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: tc.textPri }}>For Administrators</h3>
              <p className="text-sm mb-5" style={{ color: tc.textMuted }}>
                Manage reports, coordinate responses, and track city-wide data
              </p>
              <Link to="/signin">
                <Button variant="outline"
                  className="w-full flex items-center justify-center gap-2 rounded-xl transition-all"
                  style={{
                    borderColor: tc.dark ? "rgba(255,255,255,0.30)" : "rgba(15,42,74,0.25)",
                    color: tc.textPri,
                    background: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(15,42,74,0.05)",
                  }}>
                  Admin Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-4 text-sm" style={{ color: tc.textMuted }}>Questions? We're here to help.</p>
            <Button variant="ghost" onClick={handleSupportClick}
              className="transition-colors rounded-xl px-6"
              style={{
                color: tc.textMuted,
                border: `1px solid ${tc.cardBorder}`,
              }}>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
