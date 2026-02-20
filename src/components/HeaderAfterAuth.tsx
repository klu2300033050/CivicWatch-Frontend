import React from "react";
import { Link } from "react-router-dom";
import { LogOut, LayoutDashboard, User, Sun, Moon } from "lucide-react";
import civicWatchLogo from "../assets/civicwatch.png";
import { useAuth } from "../contexts/AuthContext.tsx";
import { useTheme } from "../contexts/ThemeContext.tsx";
import { useThemeColors } from "../hooks/useThemeColors";

const HeaderAfterAuth: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const tc = useThemeColors();

  const btnStyle = {
    color: tc.textPri,
    background: tc.dark ? "rgba(255,255,255,0.05)" : "rgba(15,42,74,0.06)",
    border: `1px solid ${tc.dark ? "rgba(255,255,255,0.25)" : "rgba(15,42,74,0.20)"}`,
  };

  return (
    <header
      className="w-full fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-colors duration-300"
      style={{
        background: tc.dark ? "rgba(6,15,30,0.85)" : "rgba(255,255,255,0.92)",
        borderBottom: `1px solid ${tc.dark ? "rgba(255,255,255,0.10)" : "rgba(30,77,140,0.12)"}`,
      }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl
                            group-hover:opacity-80 transition-opacity"
              style={{
                background: tc.dark ? "rgba(255,255,255,0.10)" : "rgba(15,42,74,0.08)",
                border: `1px solid ${tc.dark ? "rgba(255,255,255,0.20)" : "rgba(15,42,74,0.15)"}`,
              }}>
              <img src={civicWatchLogo} alt="CivicWatch Logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-base font-bold leading-tight" style={{ color: tc.textPri }}>CivicWatch</p>
              <p className="text-[10px] leading-none" style={{ color: "#f5a623", opacity: 0.85 }}>
                Transparency & Action
              </p>
            </div>
          </Link>

          {/* Right-side actions */}
          <div className="flex items-center gap-2">
            {user && (
              <span className="hidden sm:block text-sm mr-1" style={{ color: tc.textMuted }}>
                Welcome,{" "}
                <span style={{ color: tc.textPri, fontWeight: 600 }}>
                  {user.fullName ? user.fullName.split(" ")[0] : "Guest"}
                </span>!
              </span>
            )}

            {/* ── Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: tc.dark ? "rgba(255,255,255,0.07)" : "rgba(15,42,74,0.06)",
                border: `1px solid ${tc.dark ? "rgba(255,255,255,0.20)" : "rgba(15,42,74,0.18)"}`,
              }}>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" style={{ color: "#f5a623" }} />
              ) : (
                <Moon className="h-4 w-4" style={{ color: "#1e4d8c" }} />
              )}
            </button>

            {user ? (
              <>
                <Link to={user.role === "citizen" ? "/citizen" : "/admin"}>
                  <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                                     transition-all duration-200"
                    style={btnStyle}>
                    <LayoutDashboard className="h-4 w-4" style={{ color: "#f5a623" }} />
                    <span className="hidden sm:block">Dashboard</span>
                  </button>
                </Link>
                <button onClick={logout} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium
                                                   transition-all duration-200"
                  style={btnStyle}>
                  <LogOut className="h-4 w-4" style={{ color: "#f5a623" }} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <button className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
                                     text-sm font-medium transition-all duration-200"
                    style={btnStyle}>
                    <User className="h-4 w-4" />
                    Sign In
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl
                                     text-sm font-bold civic-amber-gradient
                                     hover:opacity-90 transition-opacity"
                    style={{ color: "#1e293b" }}>
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAfterAuth;
