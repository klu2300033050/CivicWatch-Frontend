import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem("civic-theme") as Theme) || "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "light") {
            root.classList.add("light-mode");
            root.classList.remove("dark-mode");
        } else {
            root.classList.remove("light-mode");
            root.classList.add("dark-mode");
        }
        localStorage.setItem("civic-theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
