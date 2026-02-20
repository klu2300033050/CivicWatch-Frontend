import { useTheme } from "../contexts/ThemeContext";

/**
 * Returns a thin colour palette that flips between dark and light mode.
 * Use these values for *inline* `style={{ color: tc.text }}` etc. where
 * a CSS class override can't reach.
 */
export function useThemeColors() {
    const { theme } = useTheme();
    const dark = theme === "dark";

    return {
        // ── Text ──────────────────────────────────────────────────
        textPri: dark ? "#ffffff" : "#1e293b",
        textMuted: dark ? "rgba(147,197,253,0.72)" : "#475569",
        textSubtle: dark ? "rgba(147,197,253,0.45)" : "#94a3b8",
        textAmber: dark ? "#f5a623" : "#b45309",
        textLabel: dark ? "rgba(255,255,255,0.60)" : "#334155",

        // ── Backgrounds ───────────────────────────────────────────
        cardBody: dark ? "rgba(10,22,40,0.60)" : "rgba(255,255,255,0.95)",
        cardInner: dark ? "rgba(255,255,255,0.03)" : "rgba(15,42,74,0.03)",
        cardBorder: dark ? "rgba(255,255,255,0.10)" : "rgba(15,42,74,0.10)",
        inputBg: dark ? "rgba(255,255,255,0.10)" : "#ffffff",
        inputBorder: dark ? "rgba(255,255,255,0.20)" : "rgba(15,42,74,0.25)",
        badgeBg: dark ? "rgba(6,15,30,0.70)" : "rgba(255,255,255,0.85)",
        placeholderBg: dark ? "rgba(255,255,255,0.05)" : "rgba(15,42,74,0.04)",

        // ── Icons ─────────────────────────────────────────────────
        iconMuted: dark ? "rgba(147,197,253,0.40)" : "#94a3b8",
        iconAmber: dark ? "#f5a623" : "#b45309",

        // ── Page-level ────────────────────────────────────────────
        pageBadgeBg: dark ? "rgba(255,255,255,0.10)" : "rgba(15,42,74,0.08)",
        pageBadgeBorder: dark ? "rgba(255,255,255,0.15)" : "rgba(15,42,74,0.15)",
        pageBadgeText: dark ? "rgba(147,197,253,0.70)" : "#475569",
        countBadgeBg: dark ? "rgba(255,255,255,0.05)" : "rgba(15,42,74,0.06)",
        countBadgeBorder: dark ? "rgba(255,255,255,0.10)" : "rgba(15,42,74,0.12)",
        countBadgeText: dark ? "rgba(147,197,253,0.40)" : "#94a3b8",
        profileBtnBg: dark ? "rgba(255,255,255,0.05)" : "rgba(15,42,74,0.06)",
        profileBtnBorder: dark ? "rgba(255,255,255,0.25)" : "rgba(15,42,74,0.20)",

        // Convenience
        dark,
    };
}
