"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "theme";
type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemTheme: Theme = mediaQuery.matches ? "dark" : "light";
    const initialTheme: Theme =
      storedTheme === "light" || storedTheme === "dark" ? storedTheme : systemTheme;

    applyTheme(initialTheme);
    setTheme(initialTheme);
    setMounted(true);

    if (storedTheme !== "light" && storedTheme !== "dark") {
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const nextTheme: Theme = e.matches ? "dark" : "light";
        applyTheme(nextTheme);
        setTheme(nextTheme);
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full"
      aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={mounted && theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}
