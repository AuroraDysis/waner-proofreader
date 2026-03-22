"use client";

import { type ComponentProps } from "react";
import { useTheme } from "next-themes";
import { LightModeIcon, DarkModeIcon } from "@/components/Icon";
import IconButton from "@/components/IconButton";
import type { Button } from "@heroui/react";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

interface ThemeSwitcherProps {
  size?: ComponentProps<typeof Button>["size"];
}

export function ThemeSwitcher({ size = "md" }: ThemeSwitcherProps = {}) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const iconSizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-9 w-9",
  };

  const iconClass = iconSizeClasses[size as keyof typeof iconSizeClasses] || iconSizeClasses.md;
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <IconButton
      tooltip="Toggle Theme"
      icon={isDark ? <DarkModeIcon className={iconClass} /> : <LightModeIcon className={iconClass} />}
      onPress={() => setTheme(isDark ? "light" : "dark")}
      size={size}
    />
  );
}
