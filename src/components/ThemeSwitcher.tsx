"use client";

import { useTheme } from "next-themes";
import { LightModeIcon, DarkModeIcon } from "@/components/Icon";
import IconButton from "@/components/IconButton";

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <IconButton
      tooltip="Toggle Theme"
      icon={
        resolvedTheme === "dark" ? (
          <DarkModeIcon className="h-6 w-6 text-foreground" />
        ) : (
          <LightModeIcon className="h-6 w-6 text-foreground" />
        )
      }
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    />
  );
}
