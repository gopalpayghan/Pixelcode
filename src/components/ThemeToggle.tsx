"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import useMounted from "@/hooks/useMounted";

export default function ThemeToggle() {
  const mounted = useMounted();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("pixelcode-site-theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("pixelcode-site-theme", nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full border border-hairline bg-canvas-soft flex items-center justify-center opacity-50">
        <Moon className="w-4 h-4 text-mute" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full border border-hairline bg-canvas-soft hover:bg-canvas-soft-2 text-ink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-warning" />
      ) : (
        <Moon className="w-4 h-4 text-link" />
      )}
    </button>
  );
}
