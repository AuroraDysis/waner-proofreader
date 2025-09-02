"use client";

import { useTheme } from "next-themes";
import { LightModeIcon, DarkModeIcon } from "@/components/Icon";
import IconButton from "@/components/IconButton";
import type { ButtonProps } from "@heroui/react";

interface ThemeSwitcherProps {
  size?: ButtonProps["size"];
}

export function ThemeSwitcher({ size = "md" }: ThemeSwitcherProps = {}) {
  const { theme, setTheme } = useTheme();
  
  const iconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };
  
  const iconClass = `dark:invert ${iconSizeClasses[size as keyof typeof iconSizeClasses] || iconSizeClasses.md}`;

  return (
    <IconButton
      tooltip="Toggle Theme"
      icon={
        theme === "dark" ? (
          <DarkModeIcon className={iconClass} />
        ) : (
          <LightModeIcon className={iconClass} />
        )
      }
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
      size={size}
    />
  );
}
