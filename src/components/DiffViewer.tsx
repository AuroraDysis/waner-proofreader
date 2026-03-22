"use client";

import { useMemo, useState } from "react";
import { Card, Chip, ScrollShadow, Button } from "@heroui/react";
import { computeWordDiff, groupDiffSegments, diffStats, changeCount } from "@/lib/diff-utils";
import type { DiffChange } from "@/lib/diff-utils";

interface DiffViewerProps {
  original: string;
  modified: string;
  className?: string;
  /** indices = segment indices to accept (single or pair for replacement) */
  onAcceptChange?: (indices: number[]) => void;
  onRejectChange?: (indices: number[]) => void;
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
  const segments = useMemo(() => computeWordDiff(original, modified), [original, modified]);
  const changes = useMemo(() => groupDiffSegments(segments), [segments]);
  const stats = useMemo(() => diffStats(segments), [segments]);
  const numChanges = useMemo(() => changeCount(changes), [changes]);
  const hasChanges = numChanges > 0;
  const isInteractive = !isStreaming && !!onAcceptChange && !!onRejectChange;

  // Track which change group the user tapped (by change index, not segment index)
  const [activeChange, setActiveChange] = useState<number | null>(null);

  const handleChangeTap = (changeIdx: number) => {
    if (!isInteractive) return;
    setActiveChange(activeChange === changeIdx ? null : changeIdx);
  };

  const handleAccept = (change: DiffChange) => {
    onAcceptChange?.(change.indices);
    setActiveChange(null);
  };

  const handleReject = (change: DiffChange) => {
    onRejectChange?.(change.indices);
    setActiveChange(null);
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <Card.Content className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Changes</h2>
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
          {isInteractive && hasChanges && (
            <div className="ml-auto flex gap-1">
              <Button size="sm" variant="ghost" className="text-success min-w-0 px-2" onPress={onAcceptAll}>
                Accept All
              </Button>
              <Button size="sm" variant="ghost" className="text-danger min-w-0 px-2" onPress={onRejectAll}>
                Reject All
              </Button>
            </div>
          )}
        </div>

        <ScrollShadow className="flex-1 min-h-0 overflow-auto">
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap break-words">
            {changes.length === 0 || (original === "" && modified === "") ? (
              <p className="text-foreground/40 italic">Enter text to see differences</p>
            ) : changes.map((change, changeIdx) => {
              if (change.type === "unchanged") {
                return (
                  <span key={changeIdx} className="text-foreground">
                    {change.segments[0].value}
                  </span>
                );
              }

              const isActive = activeChange === changeIdx;

              if (change.type === "replacement") {
                const removed = change.segments[0];
                const added = change.segments[1];
                return (
                  <span key={changeIdx} className="inline">
                    <span
                      className={`inline ${isInteractive ? "cursor-pointer" : ""}`}
                      onClick={() => handleChangeTap(changeIdx)}
                    >
                      <span className="opacity-60 bg-danger-soft text-danger-soft-foreground line-through px-0.5 rounded">
                        {removed.value}
                      </span>
                      <span className="bg-success-soft text-success-soft-foreground px-0.5 rounded">
                        {added.value}
                      </span>
                    </span>
                    {isActive && (
                      <ActionButtons
                        onAccept={() => handleAccept(change)}
                        onReject={() => handleReject(change)}
                      />
                    )}
                  </span>
                );
              }

              if (change.type === "added") {
                return (
                  <span key={changeIdx} className="inline">
                    <span
                      className={`bg-success-soft text-success-soft-foreground px-0.5 rounded ${isInteractive ? "cursor-pointer active:opacity-70" : ""}`}
                      onClick={() => handleChangeTap(changeIdx)}
                    >
                      {change.segments[0].value}
                    </span>
                    {isActive && (
                      <ActionButtons
                        onAccept={() => handleAccept(change)}
                        onReject={() => handleReject(change)}
                      />
                    )}
                  </span>
                );
              }

              // removed
              return (
                <span key={changeIdx} className="inline">
                  <span
                    className={`opacity-60 bg-danger-soft text-danger-soft-foreground line-through px-0.5 rounded ${isInteractive ? "cursor-pointer active:opacity-40" : ""}`}
                    onClick={() => handleChangeTap(changeIdx)}
                  >
                    {change.segments[0].value}
                  </span>
                  {isActive && (
                    <ActionButtons
                      onAccept={() => handleAccept(change)}
                      onReject={() => handleReject(change)}
                    />
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

function ActionButtons({ onAccept, onReject }: { onAccept: () => void; onReject: () => void }) {
  return (
    <span className="inline-flex gap-1 mx-1 align-middle">
      <button
        className="text-xs px-1.5 py-0.5 rounded bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300"
        onClick={(e) => { e.stopPropagation(); onAccept(); }}
      >
        ✓
      </button>
      <button
        className="text-xs px-1.5 py-0.5 rounded bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300"
        onClick={(e) => { e.stopPropagation(); onReject(); }}
      >
        ✗
      </button>
    </span>
  );
}
