"use client";

import React from "react";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <h2 className="text-xl font-bold text-danger">Something went wrong</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-foreground-600">
            An unexpected error occurred while rendering this page.
          </p>
          <details className="cursor-pointer">
            <summary className="font-medium">Error details</summary>
            <pre className="mt-2 p-3 bg-default-100 rounded-lg text-xs overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
          <Button
            color="primary"
            variant="flat"
            onPress={resetErrorBoundary}
            className="w-full"
          >
            Try again
          </Button>
        </CardBody>
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