"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("agro-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolved = stored || preferred;
    setTheme(resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("agro-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }

  if (!mounted) return <div style={{ visibility: "hidden" }}>{children}</div>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
