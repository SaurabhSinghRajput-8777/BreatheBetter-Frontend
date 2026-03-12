import { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Check localStorage first (user's explicit choice)
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    // 2. Fall back to system preference
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  const [city, setCity] = useState(
    localStorage.getItem("city") || "Delhi"
  );

  // Apply theme to <html> — explicit add/remove to guarantee state
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Persist city
  useEffect(() => {
    localStorage.setItem("city", city);
  }, [city]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, city, setCity }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook
export function useTheme() {
  return useContext(ThemeContext);
}
