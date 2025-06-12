"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeColor() {
  const { theme } = useTheme();

  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#09090b" : "#ffffff"
      );
    }
  }, [theme]);

  return null;
}
