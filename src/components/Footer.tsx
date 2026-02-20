import { MapPin, Mail, Phone, Github, Linkedin, X } from "lucide-react";
import civicWatchLogo from "../assets/civicwatch.png";
import { Link } from "react-router-dom";
import { handleSupportClick } from "./SupportModel";
import { useThemeColors } from "../hooks/useThemeColors";

const Footer = () => {
  const tc = useThemeColors();

  const linkStyle = { color: tc.textMuted };

  const quickLinks = [
    { label: "Report Issue", to: "/citizen/create-issue", type: "link" as const },
    { label: "View Reports", to: "/citizen", type: "link" as const },
    { label: "How It Works", href: "#how-it-works", type: "anchor" as const },
    { label: "Community Guidelines", href: "#", type: "anchor" as const },
  ];

  const supportLinks = [
    { label: "Help Center", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Contact Us", href: "#", onClick: handleSupportClick },
  ];

  return (
    <footer className="civic-hero-bg" style={{ borderTop: `1px solid ${tc.cardBorder}` }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: tc.pageBadgeBg, border: `1px solid ${tc.pageBadgeBorder}` }}>
                <img src={civicWatchLogo} alt="CivicWatch Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: tc.textPri }}>CivicWatch</h3>
                <p className="text-xs" style={{ color: "#f5a623" }}>Transparency & Action</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: tc.textMuted }}>
              Empowering communities to report and resolve civic issues through
              technology and civic engagement.
            </p>
            <div className="flex space-x-1">
              {[X, Github, Linkedin].map((Icon, i) => (
                <button key={i}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: tc.textSubtle }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f5a623")}
                  onMouseLeave={e => (e.currentTarget.style.color = tc.textSubtle)}>
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: tc.textPri }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(l => (
                <li key={l.label}>
                  {l.type === "link"
                    ? <Link to={l.to!} className="text-sm transition-colors hover:opacity-80" style={linkStyle}>{l.label}</Link>
                    : <a href={l.href!} className="text-sm transition-colors hover:opacity-80" style={linkStyle}>{l.label}</a>}
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: tc.textPri }}>
              Support
            </h4>
            <ul className="space-y-3">
              {supportLinks.map(l => (
                <li key={l.label}>
                  <a href={l.href} onClick={l.onClick}
                    className="text-sm transition-colors hover:opacity-80" style={linkStyle}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider" style={{ color: tc.textPri }}>
              Contact
            </h4>
            <div className="space-y-3">
              {[
                { icon: Mail, text: "support@civicwatch.com" },
                { icon: Phone, text: "+91 0123456789" },
                { icon: MapPin, text: "123 Civic Center\nCommunity City, CC 12345", multiline: true },
              ].map(({ icon: Icon, text, multiline }) => (
                <div key={text} className="flex items-start space-x-3">
                  <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#f5a623" }} />
                  <span className="text-sm" style={{ color: tc.textMuted }}>
                    {multiline ? text.split("\n").map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>) : text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: `1px solid ${tc.cardBorder}` }}>
          <p className="text-sm" style={{ color: tc.textSubtle }}>© 2025 CivicWatch. All rights reserved.</p>
          <p className="text-sm" style={{ color: tc.textSubtle }}>Building better communities together.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
