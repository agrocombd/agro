"use client";
import { createContext, useContext, useEffect, useState } from "react";
import bn from "@/locales/bn.json";
import en from "@/locales/en.json";

const LOCALES = { bn, en };

const LangContext = createContext({
  lang: "bn",
  t: (k) => k,
  toggleLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    const stored = localStorage.getItem("agro-lang") || "bn";
    setLang(stored);
    document.documentElement.setAttribute("lang", stored);
  }, []);

  function toggleLang() {
    setLang(prev => {
      const next = prev === "bn" ? "en" : "bn";
      localStorage.setItem("agro-lang", next);
      document.documentElement.setAttribute("lang", next);
      return next;
    });
  }

  function t(key, fallback) {
    const locale = LOCALES[lang] || LOCALES.bn;
    const keys = key.split(".");
    let val = locale;
    for (const k of keys) {
      val = val?.[k];
      if (val === undefined) break;
    }
    if (val === undefined && lang !== "bn") {
      let fallbackVal = LOCALES.bn;
      for (const k of keys) {
        fallbackVal = fallbackVal?.[k];
        if (fallbackVal === undefined) break;
      }
      return fallbackVal ?? fallback ?? key;
    }
    return val ?? fallback ?? key;
  }

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
