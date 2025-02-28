"use client";

import { useTheme } from "next-themes";
import { LightModeIcon, DarkModeIcon } from "@/components/Icon";
import IconButton from "@/components/IconButton";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <IconButton
      tooltip="Toggle Theme"
      icon={
        theme === "dark" ? (
          <DarkModeIcon className="dark:invert h-7 w-7" />
        ) : (
          <LightModeIcon className="dark:invert h-7 w-7" />
        )
      }
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    />
  );
}
