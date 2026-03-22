"use client";

import { Card, Skeleton, Spinner } from "@heroui/react";

interface LoadingStateProps {
  type?: "skeleton" | "spinner" | "full";
  message?: string;
}

export default function LoadingState({
  type = "skeleton",
  message = "Loading\u2026"
}: LoadingStateProps) {
  if (type === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <Spinner size="lg" />
        <p className="text-foreground/60">{message}</p>
      </div>
    );
  }

  if (type === "full") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="accent" />
          <p className="text-lg text-foreground/60">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <Card.Content className="space-y-3">
          <Skeleton className="h-4 w-3/5 rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
          <Skeleton className="h-4 w-2/5 rounded-lg" />
        </Card.Content>
      </Card>
      <Card>
        <Card.Content className="space-y-3">
          <Skeleton className="h-32 w-full rounded-lg" />
        </Card.Content>
      </Card>
    </div>
  );
}
