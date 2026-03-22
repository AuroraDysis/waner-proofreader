"use client";

import { useMemo } from "react";
import { Card, Chip, ScrollShadow } from "@heroui/react";
import { diffWordsWithSpace } from "diff";

interface DiffViewerProps {
  original: string;
  modified: string;
  className?: string;
}

interface DiffSegment {
  type: "unchanged" | "added" | "removed";
  value: string;
}

function computeWordDiff(original: string, modified: string): DiffSegment[] {
  const changes = diffWordsWithSpace(original, modified);
  return changes.map((change) => ({
    type: change.added ? "added" : change.removed ? "removed" : "unchanged",
    value: change.value,
  }));
}

export default function DiffViewer({ original, modified, className = "" }: DiffViewerProps) {
  const diffSegments = useMemo(() => computeWordDiff(original, modified), [original, modified]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const s of diffSegments) {
      const words = s.value.split(/\s+/).filter(Boolean).length;
      if (s.type === "added") added += words;
      else if (s.type === "removed") removed += words;
    }
    return { added, removed };
  }, [diffSegments]);

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <Card.Content className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Diff View</h2>
          <div className="flex gap-2">
            <Chip color="success" variant="soft" size="sm">
              +{stats.added} added
            </Chip>
            <Chip color="danger" variant="soft" size="sm">
              -{stats.removed} removed
            </Chip>
          </div>
        </div>

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
              } else if (segment.type === "added") {
                return (
                  <span
                    key={index}
                    className="bg-success-soft text-success-soft-foreground px-0.5 rounded"
                  >
                    {segment.value}
                  </span>
                );
              } else {
                return (
                  <span
                    key={index}
                    className="opacity-60 bg-danger-soft text-danger-soft-foreground line-through px-0.5 rounded"
                  >
                    {segment.value}
                  </span>
                );
              }
            })}
          </div>

        </ScrollShadow>
      </Card.Content>
    </Card>
  );
}
