"use client";

import { ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function CustomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider attribute="class" enableSystem>
      <ToastProvider />
      {children}
    </NextThemesProvider>
  );
}
