"use client";

import { useMemo, useState } from "react";
import { Card, Chip, ScrollShadow, Button } from "@heroui/react";
import { computeWordDiff, diffStats } from "@/lib/diff-utils";

interface DiffViewerProps {
  original: string;
  modified: string;
  className?: string;
  onAcceptChange?: (index: number) => void;
  onRejectChange?: (index: number) => void;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  isStreaming?: boolean;
}

export default function DiffViewer({
  original,
  modified,
  className = "",
  onAcceptChange,
  onRejectChange,
  onAcceptAll,
  onRejectAll,
  isStreaming = false,
}: DiffViewerProps) {
  const diffSegments = useMemo(() => computeWordDiff(original, modified), [original, modified]);
  const stats = useMemo(() => diffStats(diffSegments), [diffSegments]);
  const hasChanges = stats.added > 0 || stats.removed > 0;
  const isInteractive = !isStreaming && !!onAcceptChange && !!onRejectChange;

  // Track which segment the user tapped (for mobile accept/reject)
  const [activeSegment, setActiveSegment] = useState<number | null>(null);

  const handleSegmentTap = (index: number) => {
    if (!isInteractive) return;
    setActiveSegment(activeSegment === index ? null : index);
  };

  const handleAccept = (index: number) => {
    onAcceptChange?.(index);
    setActiveSegment(null);
  };

  const handleReject = (index: number) => {
    onRejectChange?.(index);
    setActiveSegment(null);
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <Card.Content className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Changes</h2>
          <div className="flex gap-2 items-center">
            {hasChanges && (
              <>
                <Chip color="success" variant="soft" size="sm">
                  +{stats.added}
                </Chip>
                <Chip color="danger" variant="soft" size="sm">
                  -{stats.removed}
                </Chip>
              </>
            )}
          </div>
        </div>

        {/* Accept All / Reject All buttons */}
        {isInteractive && hasChanges && (
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant="ghost"
              className="text-success flex-1"
              onPress={onAcceptAll}
            >
              Accept All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-danger flex-1"
              onPress={onRejectAll}
            >
              Reject All
            </Button>
          </div>
        )}

        <ScrollShadow className="flex-1 min-h-0 overflow-auto">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words">
            {diffSegments.length === 0 || (original === "" && modified === "") ? (
              <p className="text-foreground/40 italic">Enter text to see differences</p>
            ) : diffSegments.map((segment, index) => {
              if (segment.type === "unchanged") {
                return (
                  <span key={index} className="text-foreground">
                    {segment.value}
                  </span>
                );
              }

              const isActive = activeSegment === index;

              if (segment.type === "added") {
                return (
                  <span key={index} className="inline">
                    <span
                      className={`bg-success-soft text-success-soft-foreground px-0.5 rounded ${isInteractive ? "cursor-pointer active:opacity-70" : ""}`}
                      onClick={() => handleSegmentTap(index)}
                    >
                      {segment.value}
                    </span>
                    {isActive && (
                      <span className="inline-flex gap-1 mx-1 align-middle">
                        <button
                          className="text-xs px-1.5 py-0.5 rounded bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300"
                          onClick={(e) => { e.stopPropagation(); handleAccept(index); }}
                        >
                          ✓
                        </button>
                        <button
                          className="text-xs px-1.5 py-0.5 rounded bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300"
                          onClick={(e) => { e.stopPropagation(); handleReject(index); }}
                        >
                          ✗
                        </button>
                      </span>
                    )}
                  </span>
                );
              }

              // removed
              return (
                <span key={index} className="inline">
                  <span
                    className={`opacity-60 bg-danger-soft text-danger-soft-foreground line-through px-0.5 rounded ${isInteractive ? "cursor-pointer active:opacity-40" : ""}`}
                    onClick={() => handleSegmentTap(index)}
                  >
                    {segment.value}
                  </span>
                  {isActive && (
                    <span className="inline-flex gap-1 mx-1 align-middle">
                      <button
                        className="text-xs px-1.5 py-0.5 rounded bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300"
                        onClick={(e) => { e.stopPropagation(); handleAccept(index); }}
                      >
                        ✓
                      </button>
                      <button
                        className="text-xs px-1.5 py-0.5 rounded bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300"
                        onClick={(e) => { e.stopPropagation(); handleReject(index); }}
                      >
                        ✗
                      </button>
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </ScrollShadow>
      </Card.Content>
    </Card>
  );
}
