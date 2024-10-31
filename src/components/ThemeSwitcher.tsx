"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useMonaco } from "@monaco-editor/react";
import { LightModeIcon, DarkModeIcon } from "@/components/Icon";
import IconButton from "@/components/IconButton";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.setTheme(theme === "dark" ? "vs-dark" : "vs");
    }
  }, [monaco, theme]);

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
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
    />
  );
}
