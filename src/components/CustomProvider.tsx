"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ErrorBoundary } from "react-error-boundary";

export default function CustomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" enableSystem>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          {children}
        </ErrorBoundary>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
