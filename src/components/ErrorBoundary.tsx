"use client";

import React from "react";
import { Card, Button } from "@heroui/react";
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <Card.Header>
          <Card.Title className="text-xl font-bold text-danger">Something went wrong</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <p className="text-foreground-600">
            An unexpected error occurred while rendering this page.
          </p>
          <details className="cursor-pointer">
            <summary className="font-medium">Error details</summary>
            <pre className="mt-2 p-3 bg-default rounded-lg text-xs overflow-auto">
              {message}
              {stack}
            </pre>
          </details>
          <Button
            variant="secondary"
            onPress={resetErrorBoundary}
            className="w-full"
          >
            Try again
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
}
