"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function CustomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" enableSystem>
        <ToastProvider />
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
